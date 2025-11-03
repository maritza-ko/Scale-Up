// src/features/capex/CapexModal.tsx
import { GoogleGenAI, Type } from "@google/genai";
import { AppWindow, OpsState, saveCapexSelection } from '../../app/state/ops.ts';
import { getPresetKitByLevel, resolveSlots } from '../../app/catalog/equipment.ts';
import { KRW } from '../../app/utils/format.ts';
import { renderEquipTable } from './EquipTable.tsx';

declare let window: AppWindow;

let dom: any; // To be initialized by the main script

function hideCapexModal() {
    if (dom.modal.backdrop) dom.modal.backdrop.style.display = 'none';
}

function renderCapexModal(props: { level: 'A'|'B'|'C', localKit: OpsState['equip'] }) {
    // FIX: Clear previous content to prevent issues on re-opening the modal.
    dom.modal.tabsContainer.innerHTML = '';
    dom.modal.tabContentContainer.innerHTML = '';
    
    const { level, localKit } = props;
    let mutableKit = window.deepClone(localKit);

    dom.modal.title.textContent = `Level ${level} 장비 구성 & CAPEX`;
    dom.modal.tabsContainer.innerHTML = `
        <input type="radio" id="modal_tab_equip" name="modal_tabs" checked>
        <label for="modal_tab_equip">장비 KIT</label>
        <input type="radio" id="modal_tab_center" name="modal_tabs">
        <label for="modal_tab_center">센터</label>
    `;

    // FIX: Refactored to use safe DOM manipulation instead of a large innerHTML string,
    // which was causing a Vercel build error.
    const equipContent = document.createElement('div');
    equipContent.id = 'modal_tab_content_equip';
    equipContent.className = 'tab-content';

    const centerContent = document.createElement('div');
    centerContent.id = 'modal_tab_content_center';
    centerContent.className = 'tab-content';
    centerContent.style.display = 'none';

    centerContent.innerHTML = `
        <div class="lead" style="font-size: 16px; margin-bottom: 8px;">센터 운영 파라미터</div>
        <label>순회시간/점포(분): <span class="slider-value">${dom.centerOps.patrolMin.value}</span>
          <input type="range" min="5" max="60" value="${dom.centerOps.patrolMin.value}" class="slider-input" id="modal_center_patrol_min">
        </label>
        <label>세척·설비관리/점포(분): <span class="slider-value">${dom.centerOps.storeCleanMin.value}</span>
          <input type="range" min="2" max="30" value="${dom.centerOps.storeCleanMin.value}" class="slider-input" id="modal_center_clean_min">
        </label>
        <label>QA·보충/점포(분): <span class="slider-value">${dom.centerOps.qaMin.value}</span>
          <input type="range" min="5" max="45" value="${dom.centerOps.qaMin.value}" class="slider-input" id="modal_center_qa_min">
        </label>
        <div class="kpiBar" style="margin-top: 16px;">
            <span class="chip">센터 필요 FTE: <b id="modal_center_fte_display">${dom.centerOps.outFTE.textContent}</b></span>
        </div>
    `;

    const toggleDiv = document.createElement('div');
    toggleDiv.className = 'capex-toggle';
    toggleDiv.style.marginTop = '16px';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.id = 'modal_center_roi_toggle';
    toggleInput.checked = dom.centerOps.useDetailedCenterOps;

    const toggleLabel = document.createElement('label');
    toggleLabel.htmlFor = 'modal_center_roi_toggle';
    toggleLabel.textContent = '상세 인시 계산을 P&L/ROI에 반영';

    toggleDiv.appendChild(toggleInput);
    toggleDiv.appendChild(toggleLabel);
    centerContent.appendChild(toggleDiv);

    dom.modal.tabContentContainer.appendChild(equipContent);
    dom.modal.tabContentContainer.appendChild(centerContent);
    
    const equipContentEl = document.getElementById('modal_tab_content_equip');
    
    async function handleAiCostResearch() {
        const btn = document.getElementById('modal_ai_cost_btn') as HTMLButtonElement;
        const noteEl = document.getElementById('ai_cost_reasoning_note') as HTMLDivElement;
        if (!btn || !noteEl) return;

        btn.disabled = true;
        btn.textContent = '🤖 AI 조사 중...';
        noteEl.style.display = 'none';

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `대한민국 서울 기준, 10평(33m²) 규모의 배달 전문 소형 치킨 매장 개설 시 필요한 '설비 공사(설치/덕트/전기/소방)'의 평균 비용을 원화(KRW)로 알려주세요. 프랜차이즈 본사의 일반적인 감리비는 제외하고, 순수 시공 비용만 추정해주세요. 답변은 반드시 숫자 값만 포함하는 JSON 형식이어야 하며, 추정 근거를 포함해주세요. 예시: {\"averageCost\": 25000000, \"reasoning\": \"일반적인 소형 상업 주방 공사 단가와 소방 설비 의무 기준을 고려했을 때...\"}`;
            const schema = {
                type: Type.OBJECT,
                properties: {
                    averageCost: {
                        type: Type.NUMBER,
                        description: "평균 설비 공사 비용 (원화)",
                    },
                    reasoning: {
                        type: Type.STRING,
                        description: "비용 추정 근거 요약",
                    },
                },
                required: ["averageCost", "reasoning"],
            };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            });

            const result = JSON.parse(response.text);

            const installItemIndex = mutableKit.findIndex(item => item.id === 'install');
            if (installItemIndex > -1 && result.averageCost) {
                mutableKit[installItemIndex].unitPrice = result.averageCost;
            }

            if (noteEl && result.reasoning) {
                noteEl.innerHTML = `<b>AI 분석:</b> ${result.reasoning}`;
                noteEl.style.display = 'block';
            }
            rerenderEquipTableInModal();

        } catch (error) {
            console.error("AI cost research failed:", error);
            noteEl.innerHTML = `<b>오류:</b> AI로부터 비용 정보를 가져오는 데 실패했습니다.`;
            noteEl.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.textContent = '🤖 AI로 인테리어 비용 재조사';
        }
    }

    function rerenderEquipTableInModal() {
        if (!equipContentEl) return;
        
        const mainFryer = mutableKit.find(i => i.cat === 'fryer');
        const currentSlotsPerDevice = mainFryer?.baskets || 1;
        const currentDeviceCount = Math.ceil((window.ops.fryerSlots||0) / (currentSlotsPerDevice||1));
        
        let robotSection = '';
        const robot = mutableKit.find(i => i.cat === 'robots');
        if (robot) {
            robotSection = `
                <div class="rental-toggle" style="margin-top: 8px;">
                    <input type="checkbox" id="robot_rental_toggle" ${robot.isRental ? 'checked' : ''} style="width:auto; margin-right: 8px;">
                    <label for="robot_rental_toggle" style="margin:0;">로봇 렌탈 (월 ${KRW(robot.rentMonthly || 0, false)} OPEX로 처리)</label>
                </div>
            `;
        }
        
        let powerWarning = '';
        const autoLift = mutableKit.find(i => i.cat === 'autoLift' && (i.qty || 0) > 0);
        if (autoLift) {
            powerWarning = `<div class="power-warning" style="margin-top: 8px;"><b>⚠️ 경고:</b> ${autoLift.power} 전원 확인 필요</div>`;
        }

        equipContentEl.innerHTML = `
            <div id="equip_table_wrapper">${renderEquipTable({ items: mutableKit, readOnly: false })}</div>
            ${robotSection}
            ${powerWarning}
            <div id="ai_cost_reasoning_note" class="note" style="display: none; margin-top: 10px; border-top: none; font-size: 13px;"></div>
            <div class="modal-summary">
                <span>권장 장비 수: <b>${currentDeviceCount}</b> 대</span>
                <span>총 CAPEX: <b id="modal_total_capex">${KRW(window.sumCapex(mutableKit))}</b></span>
            </div>
            <div class="modal-actions">
                <button id="modal_ai_cost_btn" class="btn btn-ai">🤖 AI로 인테리어 비용 재조사</button>
                <button id="modal_save_btn" class="btn">저장 및 반영</button>
            </div>
        `;
        
        document.getElementById('equip_table_wrapper')?.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            if (target.classList.contains('equip-qty-input')) {
                const row = target.closest('tr');
                if (row) {
                    const index = parseInt(row.dataset.index || '-1');
                    if (index >= 0) {
                        mutableKit[index].qty = parseInt(target.value) || 0;
                        rerenderEquipTableInModal();
                    }
                }
            }
        });
        
        const rentalToggle = document.getElementById('robot_rental_toggle') as HTMLInputElement;
        if (rentalToggle && robot) {
            rentalToggle.addEventListener('change', () => {
                const robotIndex = mutableKit.findIndex(i => i.cat === 'robots');
                if (robotIndex > -1) {
                    mutableKit[robotIndex].isRental = rentalToggle.checked;
                    rerenderEquipTableInModal();
                }
            });
        }

        document.getElementById('modal_ai_cost_btn')?.addEventListener('click', handleAiCostResearch);
        document.getElementById('modal_save_btn')?.addEventListener('click', () => {
            const finalSlotsPerDevice = resolveSlots(mutableKit);
            saveCapexSelection(mutableKit, { slotsPerDevice: finalSlotsPerDevice });
            hideCapexModal();
        });
    }
    
    rerenderEquipTableInModal();

    dom.modal.tabsContainer.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', () => {
            document.querySelectorAll('#modal_tab_content_container .tab-content').forEach(c => (c as HTMLElement).style.display = 'none');
            const contentId = (input as HTMLInputElement).id.replace('modal_tab_', 'modal_tab_content_');
            document.getElementById(contentId)!.style.display = 'block';
        });
    });
    
    dom.modal.tabContentContainer.querySelectorAll('.slider-input').forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        (target.previousElementSibling as HTMLSpanElement).textContent = target.value;
        
        const snakeKey = target.id.replace('modal_center_', ''); // e.g., patrol_min
        let camelKey = snakeKey.replace(/_(\w)/g, (_, c) => c.toUpperCase()); // e.g., patrolMin

        if (camelKey === 'cleanMin') {
            camelKey = 'storeCleanMin';
        }
        
        const targetKey = camelKey as keyof typeof dom.centerOps;
        const targetInput = dom.centerOps[targetKey];

        if (targetInput && 'value' in targetInput) {
            (targetInput as HTMLInputElement).value = target.value;
        }
        window.bus.emit('centerOps:recalculate');
      });
    });
    
    document.getElementById('modal_center_roi_toggle')?.addEventListener('change', (e) => {
      dom.centerOps.useDetailedCenterOps = (e.target as HTMLInputElement).checked;
      window.bus.emit('ui:updateAll');
    });

    dom.modal.backdrop.style.display = 'flex';
}

function openCapexModal({level = window.ops.level}: {level?: 'A'|'B'|'C'} = {}) {
    const preset = getPresetKitByLevel(level, window.ops.fryerSlots);
    const localKit = window.deepClone(window.ops.equip?.length ? window.ops.equip : preset);
    renderCapexModal({ level, localKit });
}

export function initCapexModal(domRef: any) {
    dom = domRef; // Share dom elements with this module
    dom.modal.closeBtn.addEventListener('click', hideCapexModal);
    dom.modal.backdrop.addEventListener('click', (e: MouseEvent) => {
        if (e.target === dom.modal.backdrop) hideCapexModal();
    });
    // Global listener setup
    window.bus.on('capex:open', openCapexModal);
}