// FIX: Updated import to use package name as per guidelines.
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = "AIzaSyDDgIyq1naLE9Iv6AV_pYhzVgj6VZZXTiI"; // 👈 PASTE YOUR API KEY HERE

  // --- SIMULATED AI RESPONSE ---
  // This object simulates a high-quality response from the Gemini API,
  // allowing the application to load into the "AI Applied" state.
  const SIMULATED_AI_RESPONSE = {
    pnlParameters: [
        { key: 'procCost', value: 550, reasoning: '현재 식용유 18L 한 통 가격 약 45,000원 가정 시, 일반 치킨집 마리당 유류비는 45,000원 ÷ 60마리 = 약 750원입니다. 초벌 완료 모델로 소모량을 70% 절감하면 유류비는 약 225원이 됩니다. 여기에 소스, 파우더 등(325원)을 더해 총 550원으로 산정합니다. 이는 대량 구매 계약을 통해 기본값 700원 대비 절감된 수치입니다.' },
        { key: 'pkgCost', value: 1350, reasoning: '치킨 박스: 700원, 치킨 무: 300원, 캔음료(대량 매입가): 350원. 총 1,350원. 10개 규모의 공동 구매를 통해 기본값 1,500원 대비 소폭의 원가 절감이 가능합니다.' },
        { key: 'serviceCost', value: 2000, reasoning: '사이드 메뉴의 원가는 초기 10개 매장 규모에서는 대량 구매에 따른 유의미한 원가 절감이 어려우므로 기본값 2,000원을 유지합니다.' },
        { key: 'platformFeeRate', value: 0.24, reasoning: '10개 매장 규모에서는 플랫폼과의 직접적인 수수료 협상력이 크지 않지만, 브랜드 인지도를 기반으로 한 소폭의 광고비 최적화를 통해 실효 수수료를 1%p 절감한 24%로 가정합니다.' },
        { key: 'avgRent', value: 950000, reasoning: 'C급 입지의 골목 상권을 타겟으로 하므로, 데이터 분석 결과 평균 임대료를 100만원보다 낮은 95만원으로 책정하는 것이 현실적입니다.' },
        { key: 'utilitiesRate', value: 0.04, reasoning: '에너지 효율이 높은 최신 장비 사용을 전제로 하므로, 매출 대비 4%의 공과금 비율은 적절하며 추가 절감 여지는 제한적이므로 기본값을 유지합니다.' },
        { key: 'wageMultiplier', value: 1.25, reasoning: '최소 인력으로 운영되는 모델의 안정성을 확보하기 위해, 숙련되고 책임감 있는 인력을 채용하는 것이 중요합니다. 이를 위해 기본 시급의 1.25배를 책정하여 이탈률을 최소화하고 운영 품질을 유지합니다.' },
        { key: 'threePlRate', value: 0.028, reasoning: '표준화된 소포 배송 형태의 물류 모델과 10개 매장의 초기 물량을 기반으로 3PL 업체와 계약 시, COGS 대비 2.8%의 요율 확보가 가능할 것으로 예상됩니다. 기본값 3.0% 대비 소폭 인하된 수치입니다.' },
        { key: 'automationSavingsRateB', value: 0.15, reasoning: 'B레벨 자동화(스마트 락커 등) 도입 시, 피크 타임 응대 및 인력 동선 최적화를 통해 약 15%의 인건비 절감 효과는 업계 표준에 부합하므로 기본값을 유지합니다.' }
    ],
    staffing: {
        corporate: 2,
        cs: 1,
        techSupport: 1,
        monitoring: 1,
    },
    staffing_reasoning: `
- **지원 (Corporate): 2명.** 10개 지점의 운영 효율성을 극대화하기 위한 최소 인력입니다. 주된 업무는 공급망 모니터링, 품질 보증 데이터 분석, 그리고 표준 운영 절차(SOP) 준수 감독에 중점을 둡니다.
- **CS (고객 서비스): 1명.** 10개 지점으로부터 발생하는 고객 문의 및 지점 지원 요청을 처리하기 위한 중앙 집중식 고객 서비스 인력으로, 초기 문의량을 고려 시 1명으로 충분합니다.
- **기술 지원 (Tech Support): 1명.** 10개 지점의 IT 시스템 및 장비에 대한 1차 기술 지원 및 외부 전문 업체와의 협력을 조율하는 역할입니다.
- **모니터링 (Monitoring): 1명.** 10개 매장의 CCTV 및 KDS 대시보드를 13시간의 운영 시간 동안 실시간으로 감시합니다. 초기 단계에서는 1명의 전담 인력으로 충분히 커버 가능합니다.`,
    cogsDiscountTiers: [
        { threshold: 100, discount: 0.02 },
        { threshold: 500, discount: 0.05 },
        { threshold: 1000, discount: 0.08 }
    ],
    capexDiscountTiers: [
        { threshold: 100, discount: 0.03 },
        { threshold: 500, discount: 0.06 },
        { threshold: 1000, discount: 0.10 }
    ]
};

  // --- CONFIGURATION ---
  const dom = {
    storeSlider: document.getElementById('store_slider') as HTMLInputElement,
    sliderValDisplay: document.getElementById('slider_val_display') as HTMLSpanElement,
    aiParamsBtn: document.getElementById('ai_params') as HTMLButtonElement,
    applyChangesBtn: document.getElementById('apply_changes') as HTMLButtonElement,
    forceLevelButtons: {
      auto: document.getElementById('force_level_auto') as HTMLButtonElement,
      c: document.getElementById('force_level_c') as HTMLButtonElement,
      b: document.getElementById('force_level_b') as HTMLButtonElement,
      a: document.getElementById('force_level_a') as HTMLButtonElement,
    },
    // Summary
    summaryStores: document.getElementById('summary_stores') as HTMLElement,
    summaryLevel: document.getElementById('summary_level') as HTMLElement,
    summaryCapex: document.getElementById('summary_capex') as HTMLElement,
    summaryLevelChip: document.getElementById('summary_level_chip') as HTMLSpanElement,
    // Conclusion
    conclusionProposal: document.getElementById('conclusion_proposal') as HTMLDivElement,
    conclusionStaff: document.getElementById('conclusion_staff') as HTMLDivElement,
    conclusionStaffNote: document.getElementById('conclusion_staff_note') as HTMLDivElement,
    // Capex
    capexTitle: document.getElementById('capex_title') as HTMLHeadingElement,
    capexUnit: document.getElementById('capex_unit') as HTMLDivElement,
    capexStoresTotal: document.getElementById('capex_stores_total') as HTMLDivElement,
    capexStoresCalc: document.getElementById('capex_stores_calc') as HTMLDivElement,
    capexHqBase: document.getElementById('capex_hq_base') as HTMLDivElement,
    capexHqDesc: document.getElementById('capex_hq_desc') as HTMLDivElement,
    capexRegionalHubs: document.getElementById('capex_regional_hubs') as HTMLDivElement,
    capexRegionalDesc: document.getElementById('capex_regional_desc') as HTMLDivElement,
    capexPerEmployee: document.getElementById('capex_per_employee') as HTMLDivElement,
    capexEmployeeDesc: document.getElementById('capex_employee_desc') as HTMLDivElement,
    capexSubtotal: document.getElementById('capex_subtotal') as HTMLDivElement,
    capexContingency: document.getElementById('capex_contingency') as HTMLDivElement,
    capexTotal: document.getElementById('capex_total') as HTMLDivElement,
    // OPEX
    opexLaborDesc: document.getElementById('opex_labor_desc') as HTMLTableCellElement,
    opexLaborCost: document.getElementById('opex_labor_cost') as HTMLTableCellElement,
    opexRentCost: document.getElementById('opex_rent_cost') as HTMLTableCellElement,
    opexSaasCost: document.getElementById('opex_saas_cost') as HTMLTableCellElement,
    opexCenterDesc: document.getElementById('opex_center_desc') as HTMLTableCellElement,
    opexCenterCost: document.getElementById('opex_center_cost') as HTMLTableCellElement,
    opexTotal: document.getElementById('opex_total') as HTMLTableCellElement,
    // P&L Inputs
    pl: {
      aov: document.getElementById('pl_aov') as HTMLInputElement,
      unitsDay: document.getElementById('pl_units_day') as HTMLInputElement,
      rawMeat: document.getElementById('pl_raw_meat') as HTMLInputElement,
      procCost: document.getElementById('pl_proc_cost') as HTMLInputElement,
      pkgCost: document.getElementById('pl_pkg_cost') as HTMLInputElement,
      serviceCost: document.getElementById('pl_service_cost') as HTMLInputElement,
      pf: document.getElementById('pl_pf') as HTMLInputElement,
      rent: document.getElementById('pl_rent') as HTMLInputElement,
      utilRate: document.getElementById('pl_util_rate') as HTMLInputElement,
      saas: document.getElementById('pl_saas') as HTMLInputElement,
      hours: document.getElementById('pl_hours') as HTMLInputElement,
      baseWage: document.getElementById('pl_base_wage') as HTMLInputElement,
      wageMultiplier: document.getElementById('pl_wage_multiplier') as HTMLInputElement,
      calcWage: document.getElementById('pl_calc_wage') as HTMLInputElement,
      days: document.getElementById('pl_days') as HTMLInputElement,
      capex: document.getElementById('pl_capex') as HTMLInputElement,
      threePlRate: document.getElementById('pl_3pl_rate') as HTMLInputElement,
      bSavings: document.getElementById('pl_b_savings') as HTMLInputElement,
      patrolStores: document.getElementById('pl_patrol_stores') as HTMLInputElement,
      patrolWage: document.getElementById('pl_patrol_wage') as HTMLInputElement,
      washingStores: document.getElementById('pl_washing_stores') as HTMLInputElement,
      washingWage: document.getElementById('pl_washing_wage') as HTMLInputElement,
    },
    assumptions: {
      levelTitle: document.getElementById('assumptions_level_title') as HTMLDivElement,
      assumptionsCard: document.getElementById('assumptions_card') as HTMLDivElement,
      bSavingsContainer: document.getElementById('pl_b_savings_container') as HTMLDivElement,
      patrolContainer: document.getElementById('pl_patrol_container') as HTMLDivElement,
      washingContainer: document.getElementById('pl_washing_container') as HTMLDivElement,
      bLevelLabel: document.getElementById('pl_b_level_label') as HTMLSpanElement,
      patrolStoresLabel: document.getElementById('pl_patrol_stores_label') as HTMLSpanElement,
      patrolWageLabel: document.getElementById('pl_patrol_wage_label') as HTMLSpanElement,
      washingStoresLabel: document.getElementById('pl_washing_stores_label') as HTMLSpanElement,
      washingWageLabel: document.getElementById('pl_washing_wage_label') as HTMLSpanElement,
    },
    // P&L KPI Bar
    pl_kpi: {
      rev: document.getElementById('pl_rev') as HTMLSpanElement,
      cogsRatio: document.getElementById('pl_cogs_ratio') as HTMLSpanElement,
      var: document.getElementById('pl_var') as HTMLSpanElement,
      fix: document.getElementById('pl_fix') as HTMLSpanElement,
      ebitda: document.getElementById('pl_ebitda') as HTMLSpanElement,
      margin: document.getElementById('pl_margin') as HTMLSpanElement,
      bep: document.getElementById('pl_bep') as HTMLSpanElement,
      pay: document.getElementById('pl_pay') as HTMLSpanElement
    },
    // P&L Table
    pl_t: {
      rev: document.getElementById('pl_t_rev') as HTMLTableCellElement,
      cogsAbs: document.getElementById('pl_t_cogs_abs') as HTMLTableCellElement,
      cogsRatio: document.getElementById('pl_t_cogs_ratio') as HTMLTableCellElement,
      pf: document.getElementById('pl_t_pf') as HTMLTableCellElement,
      pfDesc: document.getElementById('pl_t_pf_desc') as HTMLTableCellElement,
      util: document.getElementById('pl_t_util') as HTMLTableCellElement,
      utilDesc: document.getElementById('pl_t_util_desc') as HTMLTableCellElement,
      threePl: document.getElementById('pl_t_3pl') as HTMLTableCellElement,
      threePlDesc: document.getElementById('pl_t_3pl_desc') as HTMLTableCellElement,
      cm: document.getElementById('pl_t_cm') as HTMLTableCellElement,
      labor: document.getElementById('pl_t_labor') as HTMLTableCellElement,
      laborDesc: document.getElementById('pl_t_labor_desc') as HTMLTableCellElement,
      rent: document.getElementById('pl_t_rent') as HTMLTableCellElement,
      saas: document.getElementById('pl_t_saas') as HTMLTableCellElement,
      centerStore: document.getElementById('pl_t_centerStore') as HTMLTableCellElement,
      centerStoreDesc: document.getElementById('pl_t_centerStore_desc') as HTMLTableCellElement,
      ebitda: document.getElementById('pl_t_ebitda') as HTMLTableCellElement,
      margin: document.getElementById('pl_t_margin') as HTMLTableCellElement,
      bep: document.getElementById('pl_t_bep') as HTMLTableCellElement,
      payback: document.getElementById('pl_t_payback') as HTMLTableCellElement,
      note: document.getElementById('pnl_note') as HTMLDivElement,
    },
    // Donut
    pl_donut: {
      canvas: document.getElementById('pl_donut') as HTMLCanvasElement,
      legend: document.getElementById('pl_legend') as HTMLDivElement,
    },
    // Total P&L
    total_pnl: {
        rev: document.getElementById('p_rev') as HTMLSpanElement,
        cogsRatio: document.getElementById('p_cogs_ratio') as HTMLSpanElement,
        var: document.getElementById('p_var') as HTMLSpanElement,
        fix: document.getElementById('p_fix') as HTMLSpanElement,
        ebitda: document.getElementById('p_ebitda') as HTMLSpanElement,
        pay: document.getElementById('p_pay') as HTMLSpanElement,
        t_rev: document.getElementById('p_t_rev') as HTMLTableCellElement,
        t_cogs_abs: document.getElementById('p_t_cogs_abs') as HTMLTableCellElement,
        t_cogs_ratio: document.getElementById('p_t_cogs_ratio') as HTMLTableCellElement,
        t_var_etc: document.getElementById('p_t_var_etc') as HTMLTableCellElement,
        t_cm: document.getElementById('p_t_cm') as HTMLTableCellElement,
        t_fix_store: document.getElementById('p_t_fix_store') as HTMLTableCellElement,
        t_center_wage: document.getElementById('p_t_center_wage') as HTMLTableCellElement,
        t_washing_wage: document.getElementById('p_t_washing_wage') as HTMLTableCellElement,
        washing_wage_row: document.getElementById('total_pnl_washing_wage_row') as HTMLTableRowElement,
        t_patrol_wage: document.getElementById('p_t_patrol_wage') as HTMLTableCellElement,
        patrol_wage_row: document.getElementById('total_pnl_patrol_wage_row') as HTMLTableRowElement,
        t_ebitda: document.getElementById('p_t_ebitda') as HTMLTableCellElement,
        t_margin: document.getElementById('p_t_margin') as HTMLTableCellElement,
        t_payback: document.getElementById('p_t_payback') as HTMLTableCellElement,
        note: document.getElementById('total_pnl_note') as HTMLDivElement,
    },
    // HQ P&L
    hq_pnl: {
        marginRate: document.getElementById('hq_margin_rate') as HTMLInputElement,
        t_cogs: document.getElementById('hq_t_cogs') as HTMLTableCellElement,
        t_revenue: document.getElementById('hq_t_revenue') as HTMLTableCellElement,
        t_revenue_desc: document.getElementById('hq_t_revenue_desc') as HTMLTableCellElement,
        t_center_wage: document.getElementById('hq_t_center_wage') as HTMLTableCellElement,
        t_washing_wage: document.getElementById('hq_t_washing_wage') as HTMLTableCellElement,
        washing_wage_row: document.getElementById('hq_pnl_washing_wage_row') as HTMLTableRowElement,
        t_patrol_wage: document.getElementById('hq_t_patrol_wage') as HTMLTableCellElement,
        patrol_wage_row: document.getElementById('hq_pnl_patrol_wage_row') as HTMLTableRowElement,
        t_ebitda: document.getElementById('hq_t_ebitda') as HTMLTableCellElement,
        t_payback: document.getElementById('hq_t_payback') as HTMLTableCellElement,
        note: document.getElementById('hq_pnl_note') as HTMLDivElement,
    },
    // Scenario Analysis
    scenario: {
        s_rev: document.getElementById('s_rev') as HTMLSpanElement,
        s_cogs_ratio: document.getElementById('s_cogs_ratio') as HTMLSpanElement,
        s_var: document.getElementById('s_var') as HTMLSpanElement,
        s_fix: document.getElementById('s_fix') as HTMLSpanElement,
        s_ebitda: document.getElementById('s_ebitda') as HTMLSpanElement,
        s_margin: document.getElementById('s_margin') as HTMLSpanElement,
        s_pay: document.getElementById('s_pay') as HTMLSpanElement,
        f_rev: document.getElementById('f_rev') as HTMLSpanElement,
        f_cogs_ratio: document.getElementById('f_cogs_ratio') as HTMLSpanElement,
        f_var: document.getElementById('f_var') as HTMLSpanElement,
        f_fix: document.getElementById('f_fix') as HTMLSpanElement,
        f_ebitda: document.getElementById('f_ebitda') as HTMLSpanElement,
        f_margin: document.getElementById('f_margin') as HTMLSpanElement,
        f_pay: document.getElementById('f_pay') as HTMLSpanElement,
    },
    // Roadmap
    roadmap: {
      capex_c: document.getElementById('roadmap_capex_c') as HTMLLIElement,
      capex_b: document.getElementById('roadmap_capex_b') as HTMLLIElement,
      capex_a: document.getElementById('roadmap_capex_a') as HTMLLIElement,
    },
    // Decision
    decision: {
      capex: document.getElementById('decision_capex') as HTMLSpanElement,
    },
    // Modal
    modal: {
        backdrop: document.getElementById('capex_modal') as HTMLDivElement,
        content: document.getElementById('modal_content') as HTMLDivElement,
        title: document.getElementById('modal_title') as HTMLHeadingElement,
        body: document.getElementById('modal_body') as HTMLDivElement,
        closeBtn: document.getElementById('modal_close') as HTMLButtonElement,
    }
  };

  const STORES_PER_REGIONAL_CENTER = 100;
  
  const automationLevels = {
      C: { threshold: 0, name: 'Level C', unitCapex: 43949360, baseFTE: 1.2 },
      B: { threshold: 500, name: 'Level B', unitCapex: 62806388, baseFTE: 1.2 },
      A: { threshold: 1000, name: 'Level A', unitCapex: 124842915, baseFTE: 0.0 }
  };
  
  const capexDetails = {
    C: {
      title: "Level C 상세 CAPEX",
      equipment: [
        { item: "오토리프트 튀김기 26L × 4", cost: 12760000 },
        { item: "자동 볶음기(소형)", cost: 2050000 },
        { item: "전 자동화 기계 × 3", cost: 4800000 },
        { item: "오일 정제기(22L)", cost: 790000 },
        { item: "식용유 산패측정기", cost: 888800 },
        { item: "6도어 냉동(65박스)", cost: 2376000 },
        { item: "4도어 냉장(45박스)", cost: 1518000 },
        { item: "업소용 식기세척기(도어형)", cost: 2618360 },
        { item: "스텐 작업대 1200(2단)", cost: 129000 },
        { item: "상부 선반 1200(2단)", cost: 105600 },
        { item: "2볼 싱크대 1500", cost: 265000 },
        { item: "온장고/보온장", cost: 329000 },
        { item: "오버헤드 워머(픽업 보온 보조)", cost: 232600 },
        { item: "24\" 모니터(KDS)", cost: 238000 },
        { item: "안드로이드 단말(4GB/32GB)", cost: 69000 },
        { item: "라벨 프린터", cost: 222000 },
        { item: "CCTV 4ch NVR 키트", cost: 189000 },
      ],
      installation: [
        { item: "후드·덕트·배기팬 제작/설치", cost: 3000000 },
        { item: "전기 배선/전용회로(경미 증설 포함)", cost: 2200000 },
        { item: "가스·온수·배수 연결/배관", cost: 1700000 },
        { item: "주방 자동소화장치(후드 연동)", cost: 1500000 },
        { item: "CCTV·KDS 네트워크 배선/세팅", cost: 500000 },
        { item: "장비 반입·레벨링", cost: 400000 },
      ]
    },
    B: {
        title: "Level B 상세 CAPEX",
        equipment: [
            { item: "(Level C 전 장비 동일 포함)", cost: 29649360 },
            { item: "스마트 픽업 락커 6칸(히팅)", cost: 18238028 },
            { item: "24\" 모니터(픽업 안내)", cost: 119000 },
        ],
        installation: [
            { item: "(Level C 설치 동일)", cost: 9300000 },
            { item: "락커 고정/전용배선/부스 보강", cost: 500000 },
        ]
    },
    A: {
        title: "Level A 상세 CAPEX",
        equipment: [
            { item: "(Level B 전 장비 동일 포함)", cost: 48006388 },
            { item: "협동로봇 5kg급(본체·컨트롤러)", cost: 46611450 },
            { item: "병용 그리퍼(2지)", cost: 7533000 },
            { item: "코봇 스탠드/워크스테이션", cost: 2617042 },
            { item: "안전 펜스 모듈(출입 도어 포함)", cost: 2200000 },
            { item: "안전 릴레이 + 비상정지 스테이션(3EA)", cost: 575035 },
        ],
        installation: [
            { item: "(Level B 설치 동일)", cost: 9800000 },
            { item: "코봇 셀 설치(기초·베이스 고정·티칭/시운전)", cost: 2000000 },
            { item: "안전 펜스/인터락 시공", cost: 500000 },
        ]
    }
  };

  // --- STATE ---
  let state = {
    storeCount: 10,
    currentLevel: 'C' as 'C' | 'B' | 'A',
    forcedLevel: null as 'C' | 'B' | 'A' | null,
    aiParamsApplied: false,
    beforeAiStaff: null as any,
    beforeAiPnl: {
      unit: null as any,
      total: null as any,
      hq: null as any,
    },
    aiParams: {
        cogsDiscountTiers: [
            { threshold: 100, discount: 0.02 },
            { threshold: 500, discount: 0.05 },
            { threshold: 1000, discount: 0.08 }
        ],
        capexDiscountTiers: [
            { threshold: 100, discount: 0.03 },
            { threshold: 500, discount: 0.06 },
            { threshold: 1000, discount: 0.10 }
        ],
        centerStaffSalaries: {
            head: 6000000,
            corporate: 4500000,
            cs: 3500000,
            techSupport: 4000000,
            monitoring: 3800000,
        },
        staffing: {
            corporate: 5,
            cs: 1,
            techSupport: 1,
            monitoring: 0,
        },
        staffing_reasoning: "",
        capexFactors: {
            hqCapexTiers: [
              { threshold: 0, cost: 50000000 },
              { threshold: 50, cost: 100000000 },
              { threshold: 200, cost: 300000000 }
            ],
            regionalCenterBaseCapex: 30000000,
            perEmployeeCapex: 3000000
        },
    }
  };

  const aiHighlightableInputs = [
    'procCost', 'pkgCost', 'serviceCost', 'pf', 'rent', 'utilRate',
    'wageMultiplier', 'threePlRate', 'bSavings'
  ];
  type PnlParameterKey = 'procCost' | 'pkgCost' | 'serviceCost' | 'platformFeeRate' | 'avgRent' | 'utilitiesRate' | 'wageMultiplier' | 'threePlRate' | 'automationSavingsRateB';
  type AiPnlParameter = {
      key: PnlParameterKey;
      value: number;
      reasoning: string;
  };
  
  // --- UTILITIES ---
  function KRW(n: number, includeSymbol = true) {
    if (isNaN(n) || n === null) return '-';
    const symbol = includeSymbol ? '₩' : '';
    return symbol + Math.round(n).toLocaleString('ko-KR');
  }

  function formatNumber(n: number) {
      if (isNaN(n) || n === null) return '';
      return n.toLocaleString('ko-KR');
  }

  function parseFormattedNumber(str: string | number) {
      if (!str) return 0;
      if (typeof str === 'string' && str.trim() === '---') return 0;
      return Number(String(str).replace(/,/g, ''));
  }

  function gv(elementId: keyof typeof dom.pl, isNumeric: false): string;
  function gv(elementId: keyof typeof dom.pl, isNumeric?: true): number;
  function gv(elementId: keyof typeof dom.pl, isNumeric = true): string | number {
    const el = dom.pl[elementId];
    if (!el) return isNumeric ? 0 : '';
    const value = el.value;
    return isNumeric ? parseFormattedNumber(value) : value;
  }

  function clearAiHighlightsAndDefaults() {
      // Clear input highlights
      document.querySelectorAll('.ai-applied').forEach(el => el.classList.remove('ai-applied'));
      // Clear all default value displays
      document.querySelectorAll('.default-value-display').forEach(el => el.remove());
      // Clear all reasoning notes
      document.querySelectorAll('.ai-reasoning-note').forEach(el => el.remove());
      // Clear staff highlight
      const staffEl = dom.conclusionStaff;
      if (staffEl) {
        staffEl.innerHTML = staffEl.innerHTML.replace(/<span class="ai-applied-text">/g, '').replace(/<\/span>/g, '');
      }
      // Clear EBITDA notes
      if(dom.pl_t.note) dom.pl_t.note.innerHTML = `<b>주석</b> — <u>계산 구조</u>는 업로드 자료의 방식(= 기여이익 정의, 3PL은 매출원가(COGS)의 일정 비율 등)을 반영했습니다. 실제 계약·상권별로 값만 조정하시면 됩니다.`;
      if(dom.total_pnl.note) dom.total_pnl.note.innerHTML = '';
      if(dom.hq_pnl.note) dom.hq_pnl.note.innerHTML = '';
  }
  
  function resetAiState() {
      state.aiParamsApplied = false;
      state.beforeAiStaff = null;
      state.beforeAiPnl = { unit: null, total: null, hq: null };
      clearAiHighlightsAndDefaults();
  }

  // --- MAPPING & CALCULATION LOGIC ---
  function mapSliderToStoreCount(sliderValue: number) {
    const val = sliderValue;
    if (val <= 100) { // 0-100 -> 10-100 (steps of 10)
        return Math.round((10 + (val / 100) * 90) / 10) * 10;
    } else if (val <= 300) { // 101-300 -> 100-1000 (steps of 50)
        const progress = (val - 100) / 200;
        return Math.round((100 + progress * 900) / 50) * 50;
    } else { // 301-1000 -> 1000-20000 (steps of 100)
        const progress = (val - 300) / 700;
        const logMax = Math.log10(20000);
        const logMin = Math.log10(1000);
        const logValue = logMin + progress * (logMax - logMin);
        const linearValue = Math.pow(10, logValue);
        return Math.round(linearValue / 100) * 100;
    }
  }

  function getAutomationLevel(count: number): 'A' | 'B' | 'C' {
    if (state.forcedLevel) {
        return state.forcedLevel;
    }
    if (count >= automationLevels.A.threshold) return 'A';
    if (count >= automationLevels.B.threshold) return 'B';
    return 'C';
  }

  function calculateCogsDiscount(storeCount: number) {
    if (!state.aiParamsApplied) return 0;
    const tiers = state.aiParams.cogsDiscountTiers;
    let discount = 0;
    for (let i = tiers.length - 1; i >= 0; i--) {
        if (storeCount >= tiers[i].threshold) {
            discount = tiers[i].discount;
            break;
        }
    }
    return discount;
  }
  
  function calculateCapexDiscount(storeCount: number) {
    if (!state.aiParamsApplied) return 0;
    const tiers = state.aiParams.capexDiscountTiers || [];
    let discount = 0;
    for (let i = tiers.length - 1; i >= 0; i--) {
        if (storeCount >= tiers[i].threshold) {
            discount = tiers[i].discount;
            break;
        }
    }
    return discount;
  }
  
  function getEffectiveUnitCapex(level: 'A' | 'B' | 'C') {
      const baseCapex = automationLevels[level].unitCapex;
      const discount = calculateCapexDiscount(state.storeCount);
      return baseCapex * (1 - discount);
  }

 function calculateCorporateStaff(storeCount: number, forceFallback = false) {
    if (!forceFallback && state.aiParamsApplied && state.aiParams.staffing) {
        const { corporate: support, cs, monitoring } = state.aiParams.staffing;
        return { support, cs, monitoring, total: support + cs + monitoring };
    }
    // Fallback logic
    const baseSupport = 5;
    const incrementalSupport = Math.floor(storeCount / 50);
    const support = baseSupport + incrementalSupport;

    let cs = 0;
    if (storeCount <= 100) {
        cs = Math.ceil(storeCount / 10);
    } else if (storeCount <= 500) {
        cs = Math.ceil(100 / 10) + Math.ceil((storeCount - 100) / 20);
    } else {
        cs = Math.ceil(100 / 10) + Math.ceil(400 / 20) + Math.ceil((storeCount - 500) / 30);
    }
    // Fallback monitoring staff - simple ratio
    const monitoring = Math.ceil(storeCount / 50);
    return { support, cs, monitoring, total: support + cs + monitoring };
}

function calculateRegionalStaff(storeCount: number, forceFallback = false) {
    // A Hub Manager is assigned to each physical Regional Hub.
    const hubManagers = Math.ceil(storeCount / STORES_PER_REGIONAL_CENTER);

    let techSupport;
    if (!forceFallback && state.aiParamsApplied && state.aiParams.staffing) {
        techSupport = state.aiParams.staffing.techSupport;
    } else {
        // Fallback logic
        techSupport = Math.ceil(storeCount / 50);
    }
    return { hubManagers, techSupport, total: hubManagers + techSupport };
}

function calculateAllStaff(storeCount: number, baseInputs: any, level: 'A' | 'B' | 'C', forceFallback = false) {
  const corporate = calculateCorporateStaff(storeCount, forceFallback);
  const regional = calculateRegionalStaff(storeCount, forceFallback);
  const washing = calculateWashingLaborCost(storeCount, baseInputs, level);
  const patrol = calculatePatrolLaborCost(storeCount, baseInputs, level);
  
  const hqDirector = 1;
  const total = hqDirector + corporate.total + regional.total + washing.staffCount + patrol.staffCount;
  
  return {
      hqDirector,
      corporate,
      regional,
      washing,
      patrol,
      total,
  };
}

  function calculateTotalCentralWages(allStaffData: any) {
      const salaries = state.aiParams.centerStaffSalaries;
      const directorWage = allStaffData.hqDirector * salaries.head;
      const corporateWages = (allStaffData.corporate.support * salaries.corporate) + 
                             (allStaffData.corporate.cs * salaries.cs) +
                             (allStaffData.corporate.monitoring * salaries.monitoring);
      const regionalWages = (allStaffData.regional.hubManagers * salaries.head) + (allStaffData.regional.techSupport * salaries.techSupport);
      
      return {
          hqWages: directorWage + corporateWages,
          regionalWages: regionalWages,
          total: directorWage + corporateWages + regionalWages
      };
  }
  
  function calculateTotalHqCapex(storeCount: number, allStaff: any) {
      const factors = state.aiParams.capexFactors;
      const totalStaff = allStaff.total;
      const hqStaffCount = allStaff.hqDirector + allStaff.corporate.total;

      let hqBase = 0;
      for (let i = factors.hqCapexTiers.length - 1; i >= 0; i--) {
        if (hqStaffCount >= factors.hqCapexTiers[i].threshold) {
            hqBase = factors.hqCapexTiers[i].cost;
            break;
        }
      }
      
      const regionalCount = Math.ceil(storeCount / STORES_PER_REGIONAL_CENTER);
      const regionalTotal = regionalCount * factors.regionalCenterBaseCapex;
      const perEmployeeTotal = totalStaff * factors.perEmployeeCapex;
      
      const total = hqBase + regionalTotal + perEmployeeTotal;
      
      return { total, hqBase, regionalTotal, perEmployeeTotal, regionalCount, hqStaffCount };
  }
  
 function calculateWashingLaborCost(storeCount: number, baseInputs: any, level: 'A' | 'B' | 'C') {
      if (level !== 'A') return { totalCost: 0, staffCount: 0 };

      const storesPerStaff = baseInputs.assumptions.washingStores > 0 ? baseInputs.assumptions.washingStores : 1;
      const staffCount = Math.ceil(storeCount / storesPerStaff);
      const wageMultiplier = baseInputs.assumptions.washingWage;
      const wage = (baseInputs.fixed.baseWage * baseInputs.fixed.wageMultiplier) * wageMultiplier;
      const monthlyCost = staffCount * wage * baseInputs.fixed.hours * baseInputs.fixed.days;
      
      return { totalCost: monthlyCost, staffCount };
  }

 function calculatePatrolLaborCost(storeCount: number, baseInputs: any, level: 'A' | 'B' | 'C') {
    if (level === 'C') return { totalCost: 0, staffCount: 0 };
    
    const calculatedWage = baseInputs.fixed.baseWage * baseInputs.fixed.wageMultiplier;
    let storesPerStaff, wageMultiplier, staffCount, wage, monthlyCost;
    
    // For Level B, patrol staff is now active.
    if (level === 'B') {
        storesPerStaff = baseInputs.assumptions.patrolStores > 0 ? baseInputs.assumptions.patrolStores : 20;
        wageMultiplier = baseInputs.assumptions.patrolWage;
    } else { // Level A
        storesPerStaff = baseInputs.assumptions.patrolStores > 0 ? baseInputs.assumptions.patrolStores : 8; // Corrected default for A
        wageMultiplier = baseInputs.assumptions.patrolWage;
    }
    
    staffCount = Math.ceil(storeCount / storesPerStaff);
    wage = calculatedWage * wageMultiplier;
    monthlyCost = staffCount * wage * baseInputs.fixed.hours * baseInputs.fixed.days;

    return { totalCost: monthlyCost, staffCount };
  }


  function calcPNL(storeCount: number, baseInputs: any) {
    const level = getAutomationLevel(storeCount);
    const levelInfo = automationLevels[level];

    // Inputs
    const { aov, unitsDay, rawMeat, procCost, pkgCost, serviceCost, pf, utilRate, threePlRate } = baseInputs.unit;
    const { hours, baseWage, wageMultiplier, days, rent, saas, capex } = baseInputs.fixed;

    // COGS with discount
    const cogsDiscount = calculateCogsDiscount(storeCount);
    const unitCogsBase = rawMeat + procCost + pkgCost + serviceCost;
    const unitCogs = unitCogsBase * (1 - cogsDiscount);
    
    // Revenue & Variable Costs
    const rev = aov * unitsDay * days;
    const totalCogs = unitCogs * unitsDay * days;
    const platform = rev * pf;
    const utilities = rev * utilRate;
    const threePl = totalCogs * threePlRate;
    const variable = totalCogs + platform + utilities + threePl;

    // Fixed Costs
    const allStaff = calculateAllStaff(storeCount, baseInputs, level);
    const centralWages = calculateTotalCentralWages(allStaff);
    const washingLabor = allStaff.washing.totalCost;
    const patrolLabor = allStaff.patrol.totalCost;
    const totalCenterOpEx = centralWages.total + washingLabor + patrolLabor;
    const centerAlloc = totalCenterOpEx / (storeCount > 0 ? storeCount : 1);

    const calculatedWage = baseWage * wageMultiplier;
    let laborCost;
    let laborDesc;

    const baseLaborCalcString = `${hours}h/일 × ${days}일 × ${KRW(calculatedWage, false)}원`;

    if (level === 'A') {
        laborCost = 0;
        laborDesc = `자동화로 인력 0 (순회 인력으로 대체)`;
    } else if (level === 'B') {
        const baseFTE = levelInfo.baseFTE;
        const savingsRate = baseInputs.assumptions.bSavings;
        laborCost = hours * calculatedWage * days * baseFTE * (1 - savingsRate);
        laborDesc = `${baseLaborCalcString} × ${baseFTE}명 × 자동화 절감 ${(savingsRate * 100).toFixed(1)}%`;
    } else { // Level C
        const baseFTE = levelInfo.baseFTE;
        laborCost = hours * calculatedWage * days * baseFTE;
        laborDesc = `${baseLaborCalcString} × ${baseFTE}명`;
    }
    
    const totalFixed = laborCost + rent + saas + centerAlloc;
    
    // Results
    const ebitda = rev - variable - totalFixed;
    const margin = rev > 0 ? (ebitda / rev) : 0;
    
    const varCostPerUnit = variable / (unitsDay * days);
    const cmPerUnit = aov - varCostPerUnit;
    const bepUnitsTotal = cmPerUnit > 0 ? (totalFixed / cmPerUnit) : NaN;
    const bepDailyUnits = bepUnitsTotal / days;
    
    const payMonths = ebitda > 0 ? (capex / ebitda) : NaN;

    return {
      rev, totalCogs, variable, totalFixed, ebitda, margin, bepDailyUnits, payMonths,
      unitCogs, platform, utilities, threePl, laborCost, rent, saas, centerAlloc,
      calculatedWage, laborDesc, cogsDiscount, allStaff, centralWages, washingLabor, patrolLabor
    };
  }

  function calculateFixed10CScenario() {
      const baseCapex = automationLevels.C.unitCapex; // Fixed scenario has no discount
      const baseInputs = {
          unit: { aov: 22900, unitsDay: 80, rawMeat: 5700, procCost: 700, pkgCost: 1500, serviceCost: 2000, pf: 0.25, utilRate: 0.04, threePlRate: 0.03 },
          fixed: { hours: 13, baseWage: 10030, wageMultiplier: 1.2, days: 30, rent: 1000000, saas: 150000, capex: baseCapex },
          assumptions: { bSavings: 0.15, patrolStores: 20, patrolWage: 1.1, washingStores: 5, washingWage: 1.5 }
      };
      const pnl = calcPNL(10, baseInputs);
      return pnl;
  }
  
  function getCurrentBaseInputs() {
    const level = getAutomationLevel(state.storeCount);
    const effectiveCapex = getEffectiveUnitCapex(level);
    return {
        unit: { 
            aov: gv('aov'), 
            unitsDay: gv('unitsDay'), 
            rawMeat: gv('rawMeat'), 
            procCost: gv('procCost'), 
            pkgCost: gv('pkgCost'), 
            serviceCost: gv('serviceCost'), 
            pf: gv('pf'), 
            utilRate: gv('utilRate'), 
            threePlRate: gv('threePlRate') 
        },
        fixed: { 
            hours: gv('hours'), 
            baseWage: gv('baseWage'), 
            wageMultiplier: gv('wageMultiplier'), 
            days: gv('days'), 
            rent: gv('rent'), 
            saas: gv('saas'), 
            capex: effectiveCapex 
        },
        assumptions: { 
            bSavings: gv('bSavings'), 
            patrolStores: gv('patrolStores'), 
            patrolWage: gv('patrolWage'),
            washingStores: gv('washingStores'),
            washingWage: gv('washingWage')
        }
    };
  }

  // --- UI UPDATE FUNCTIONS ---
  function updateAllUI() {
    const storeCount = state.storeCount;
    const level = getAutomationLevel(storeCount);
    state.currentLevel = level;

    // First, update the state of the assumption inputs UI based on the level
    updateAssumptionsUI(level);

    // Now, get all base inputs from DOM, which will have the correct values
    const baseInputs = getCurrentBaseInputs();
    
    const pnlResults = calcPNL(storeCount, baseInputs);
    const allStaff = pnlResults.allStaff;
    
    updateSummaryUI(storeCount, level);
    updateConclusionUI(storeCount, level, allStaff);
    updateCapexUI(storeCount, level, allStaff);
    updateOpexUI(pnlResults, level);
    updatePnlUI(pnlResults, baseInputs);
    updateTotalPackageResults(storeCount, level, pnlResults);
    updateScenarioAnalysisUI(pnlResults);
    updateDecisionUI();
    updateForceLevelButtons();
  }

  function updateSummaryUI(storeCount: number, level: 'A' | 'B' | 'C') {
    const effectiveCapex = getEffectiveUnitCapex(level);
    dom.summaryStores.textContent = formatNumber(storeCount);
    dom.summaryLevel.textContent = automationLevels[level].name;
    dom.summaryCapex.textContent = KRW(effectiveCapex);
    dom.sliderValDisplay.textContent = formatNumber(storeCount);
  }
  
  function updateConclusionUI(storeCount: number, level: 'A' | 'B' | 'C', allStaff: any) {
      dom.conclusionProposal.innerHTML = `${formatNumber(storeCount)}개 <span style="color:var(--sky)">${automationLevels[level].name}</span>`;
      
      let staffText = `본사/거점 총원: ${allStaff.total}명`;
      if (state.aiParamsApplied && state.beforeAiStaff && state.beforeAiStaff.total !== allStaff.total) {
        staffText = `본사/거점 총원: <span class="ai-applied-text">${allStaff.total}명</span> <span class="default-value-display">(기본값: ${state.beforeAiStaff.total}명)</span>`;
      }
      dom.conclusionStaff.innerHTML = staffText;

      const regionalHubCount = Math.ceil(storeCount / STORES_PER_REGIONAL_CENTER);
      const totalHqStaff = allStaff.hqDirector + allStaff.corporate.total;
      const totalRegionalStaff = allStaff.regional.total + allStaff.patrol.staffCount + allStaff.washing.staffCount;
      
      const before = state.beforeAiStaff;
      const aiApplied = state.aiParamsApplied && before;
      
      const supportText = aiApplied && allStaff.corporate.support !== before.corporate.support 
        ? `<span class="ai-applied-text">${allStaff.corporate.support}</span><span class="default-value-display">(${before.corporate.support})</span>` 
        : allStaff.corporate.support;
        
      const csText = aiApplied && allStaff.corporate.cs !== before.corporate.cs 
        ? `<span class="ai-applied-text">${allStaff.corporate.cs}</span><span class="default-value-display">(${before.corporate.cs})</span>` 
        : allStaff.corporate.cs;

      const monitoringText = aiApplied && allStaff.corporate.monitoring !== before.corporate.monitoring 
        ? `<span class="ai-applied-text">${allStaff.corporate.monitoring}</span><span class="default-value-display">(${before.corporate.monitoring})</span>` 
        : allStaff.corporate.monitoring;

      const techText = aiApplied && allStaff.regional.techSupport !== before.regional.techSupport 
        ? `<span class="ai-applied-text">${allStaff.regional.techSupport}</span><span class="default-value-display">(${before.regional.techSupport})</span>` 
        : allStaff.regional.techSupport;
      
      let breakdown = `총원 ${allStaff.total}명은 본사 인력 ${totalHqStaff}명과 지역 인력 ${totalRegionalStaff}명으로 구성됩니다. `;
      
      if (totalRegionalStaff > 0 && regionalHubCount > 0) {
          breakdown += `${regionalHubCount}개의 지역 거점을 중심으로 활동하며, 각 거점에는 1명의 <b>거점장(${allStaff.regional.hubManagers}명)</b>이 배치됩니다. 거점장은 해당 지역의 현장 품질 관리(QA), 긴급 상황 대응 등을 총괄합니다. 기술지원 ${techText}명, 순회 ${allStaff.patrol.staffCount}명, 중앙 세척/소분 ${allStaff.washing.staffCount}명이 나머지를 구성합니다.`;
      } else if (totalRegionalStaff > 0) {
          breakdown += `지역 인력은 거점장 ${allStaff.regional.hubManagers}명, 기술지원 ${techText}명 등을 포함합니다.`;
      } else {
          breakdown += `모든 인력은 중앙 본사 소속입니다.`;
      }
      
      let reasoningHtml = '';
      if (state.aiParamsApplied && state.aiParams.staffing_reasoning) {
          const reasoningText = state.aiParams.staffing_reasoning;
          const parts = reasoningText.split('- ').map(p => p.trim()).filter(Boolean);
          let processedReasoning = '';
          if (parts.length > 1 || (parts.length === 1 && reasoningText.trim().startsWith('- '))) {
              const listItems = parts.map(p => `<li>${p}</li>`).join('');
              processedReasoning = `<ul>${listItems}</ul>`;
          } else {
              processedReasoning = reasoningText.replace(/\n/g, '<br>');
          }
          reasoningHtml = `<div class="ai-reasoning-note"><b>AI 분석:</b>${processedReasoning}</div>`;
      }

      dom.conclusionStaffNote.innerHTML = `<b>주석</b> — ${breakdown.replace(/\s+/g, ' ').trim()}${reasoningHtml}`;
  }


  function updateCapexUI(storeCount: number, level: 'A' | 'B' | 'C', allStaff: any) {
      const effectiveUnitCapex = getEffectiveUnitCapex(level);
      const discount = calculateCapexDiscount(storeCount);
      const hqCapex = calculateTotalHqCapex(storeCount, allStaff);
      const factors = state.aiParams.capexFactors;

      const storesTotal = effectiveUnitCapex * storeCount;
      const subtotal = storesTotal + hqCapex.total;
      const contingency = subtotal * 0.05;
      const totalCapex = subtotal + contingency;

      dom.capexTitle.textContent = `② ${formatNumber(storeCount)}개 매장 패키지 예산 (CAPEX)`;
      
      let unitCapexText = KRW(effectiveUnitCapex);
      if (discount > 0) { // This check now implicitly depends on aiParamsApplied
          unitCapexText += ` <span class="ai-applied-text" style="font-size: 0.6em;">(${(discount * 100).toFixed(1)}% 할인)</span>`;
      }
      dom.capexUnit.innerHTML = unitCapexText;
      
      dom.capexStoresTotal.textContent = KRW(storesTotal);
      dom.capexStoresCalc.textContent = `${formatNumber(storeCount)} × ${KRW(effectiveUnitCapex, false)}`;
      
      dom.capexHqBase.textContent = KRW(hqCapex.hqBase);
      dom.capexHqDesc.textContent = `(본사 인력 ${hqCapex.hqStaffCount}명 규모)`;
      dom.capexRegionalHubs.textContent = KRW(hqCapex.regionalTotal);
      dom.capexRegionalDesc.textContent = `${hqCapex.regionalCount}개 거점 × ${KRW(factors.regionalCenterBaseCapex, false)}`;
      dom.capexPerEmployee.textContent = KRW(hqCapex.perEmployeeTotal);
      dom.capexEmployeeDesc.textContent = `${allStaff.total}명 × ${KRW(factors.perEmployeeCapex, false)}`;
      
      dom.capexSubtotal.textContent = KRW(subtotal);
      dom.capexContingency.textContent = KRW(contingency);
      dom.capexTotal.textContent = KRW(totalCapex);

      dom.pl.capex.value = formatNumber(effectiveUnitCapex);
  }

  function updateOpexUI(pnl: any, level: 'A' | 'B' | 'C') {
      dom.opexLaborDesc.textContent = pnl.laborDesc;
      dom.opexLaborCost.textContent = KRW(pnl.laborCost);
      dom.opexRentCost.textContent = KRW(gv('rent'));
      dom.opexSaasCost.textContent = KRW(gv('saas'));
      dom.opexCenterCost.textContent = KRW(pnl.centerAlloc);
      let centerDescText = (level === 'A') ? `CS, 배달플랫폼 관리, 기술지원, 세척·살균·소분` : `CS, 배달플랫폼 관리, 기술지원`;
      dom.opexCenterDesc.textContent = centerDescText;
      dom.opexTotal.textContent = KRW(pnl.laborCost + gv('rent') + gv('saas') + pnl.centerAlloc);
  }
  
  function updateAssumptionsUI(level: 'A' | 'B' | 'C') {
      const assumptionsCard = dom.assumptions.assumptionsCard;
      if (level === 'C') {
          assumptionsCard.style.display = 'none';
          return;
      }
      assumptionsCard.style.display = 'block';
      
      dom.assumptions.levelTitle.textContent = `물류 및 ${level}레벨 가정`;
      const baseWage = gv('baseWage');
      const wageMultiplier = gv('wageMultiplier');
      const calculatedWage = baseWage * wageMultiplier;
      dom.pl.calcWage.value = formatNumber(Math.round(calculatedWage));

      // B-Level Savings
      if (level === 'B') {
          dom.assumptions.bSavingsContainer.style.display = 'block';
          dom.pl.bSavings.disabled = false;
      } else {
          dom.assumptions.bSavingsContainer.style.display = 'none';
          dom.pl.bSavings.disabled = true;
      }

      // Patrol Staff (B & A)
      dom.assumptions.patrolStoresLabel.textContent = `${level}레벨`;
      dom.assumptions.patrolWageLabel.textContent = `${level}레벨`;
      if (level === 'B' || level === 'A') {
          if (dom.pl.patrolStores.value === '---' || dom.pl.patrolStores.disabled) dom.pl.patrolStores.value = (level === 'B' ? '20' : '8');
          dom.pl.patrolStores.disabled = false;
          
          if (dom.pl.patrolWage.value === '---' || dom.pl.patrolWage.disabled) dom.pl.patrolWage.value = (level === 'B' ? '1.1' : '1.2');
          dom.pl.patrolWage.disabled = false;
      } else {
          dom.pl.patrolStores.value = '---';
          dom.pl.patrolStores.disabled = true;
          dom.pl.patrolWage.value = '---';
          dom.pl.patrolWage.disabled = true;
      }

      // Washing Staff (A only)
      dom.assumptions.washingStoresLabel.textContent = `${level}레벨`;
      dom.assumptions.washingWageLabel.textContent = `${level}레벨`;
      if (level === 'A') {
          if (dom.pl.washingStores.value === '---' || dom.pl.washingStores.disabled) dom.pl.washingStores.value = '5';
          dom.pl.washingStores.disabled = false;
          
          if (dom.pl.washingWage.value === '---' || dom.pl.washingWage.disabled) dom.pl.washingWage.value = '1.5';
          dom.pl.washingWage.disabled = false;
      } else {
          dom.pl.washingStores.value = '---';
          dom.pl.washingStores.disabled = true;
          dom.pl.washingWage.value = '---';
          dom.pl.washingWage.disabled = true;
      }
  }


  function updatePnlUI(pnl: any, inputs: any) {
    // KPI Bar
    dom.pl_kpi.rev.textContent = KRW(pnl.rev);
    const cogsRatioText = pnl.rev > 0 ? `${(pnl.totalCogs / pnl.rev * 100).toFixed(1)}%` : '-';
    dom.pl_kpi.cogsRatio.textContent = cogsRatioText;
    dom.pl_kpi.var.textContent = KRW(pnl.variable);
    dom.pl_kpi.fix.textContent = KRW(pnl.totalFixed);
    dom.pl_kpi.ebitda.textContent = KRW(pnl.ebitda);
    dom.pl_kpi.margin.textContent = `${(pnl.margin * 100).toFixed(1)}%`;
    dom.pl_kpi.bep.textContent = isNaN(pnl.bepDailyUnits) ? 'N/A' : `${pnl.bepDailyUnits.toFixed(1)} 건/일`;
    dom.pl_kpi.pay.textContent = isNaN(pnl.payMonths) ? 'N/A' : `${pnl.payMonths.toFixed(1)} 개월`;

    // P&L Table
    dom.pl_t.rev.textContent = KRW(pnl.rev);
    dom.pl_t.cogsAbs.textContent = KRW(pnl.totalCogs);
    dom.pl_t.cogsRatio.textContent = `매출의 ${cogsRatioText}`;
    dom.pl_t.pf.textContent = KRW(pnl.platform);
    dom.pl_t.pfDesc.textContent = `= 매출 × ${(inputs.unit.pf * 100).toFixed(1)}%`;
    dom.pl_t.util.textContent = KRW(pnl.utilities);
    dom.pl_t.utilDesc.textContent = `매출의 ${(inputs.unit.utilRate * 100).toFixed(1)}% (변동성 반영)`;
    dom.pl_t.threePl.textContent = KRW(pnl.threePl);
    dom.pl_t.threePlDesc.textContent = `매출원가(COGS)의 ${(inputs.unit.threePlRate * 100).toFixed(1)}%`;
    dom.pl_t.cm.textContent = KRW(pnl.rev - pnl.variable);
    dom.pl_t.labor.textContent = KRW(pnl.laborCost);
    dom.pl_t.laborDesc.textContent = pnl.laborDesc;
    dom.pl_t.rent.textContent = KRW(pnl.rent);
    dom.pl_t.saas.textContent = KRW(pnl.saas);
    dom.pl_t.centerStore.textContent = KRW(pnl.centerAlloc);
    dom.pl_t.centerStoreDesc.textContent = dom.opexCenterDesc.textContent;
    dom.pl_t.ebitda.textContent = KRW(pnl.ebitda);
    dom.pl_t.margin.textContent = `마진 ${(pnl.margin * 100).toFixed(1)}%`;
    dom.pl_t.bep.textContent = isNaN(pnl.bepDailyUnits) ? 'N/A' : `${pnl.bepDailyUnits.toFixed(1)} 건/일`;
    dom.pl_t.payback.textContent = isNaN(pnl.payMonths) ? 'N/A' : `${pnl.payMonths.toFixed(1)} 개월`;

    // Donut Chart
    drawDonut(pnl);

    // Update EBITDA note if AI params are applied
    if (state.aiParamsApplied && state.beforeAiPnl.unit) {
      const beforeEbitda = state.beforeAiPnl.unit.ebitda;
      const afterEbitda = pnl.ebitda;
      const diff = afterEbitda - beforeEbitda;
      const diffPercent = beforeEbitda !== 0 ? (diff / Math.abs(beforeEbitda)) * 100 : (afterEbitda > 0 ? 100 : 0);
      const diffColor = diff >= 0 ? 'var(--skyL)' : 'var(--rose)';
      
      let diffText = `${KRW(diff)} (${diffPercent.toFixed(1)}%) ${diff >= 0 ? '증가' : '감소'}`;
      
      dom.pl_t.note.innerHTML = `<b>주석</b> — AI 파라미터 적용으로 월 EBITDA가 <b>${KRW(beforeEbitda)}</b>에서 <b>${KRW(afterEbitda)}</b>로 <b style="color:${diffColor};">${diffText}</b> 예상`;
    }
  }
  
  function drawDonut(pnl: any) {
    const parts = [
      {k:'매출원가', v:pnl.totalCogs, c:'#6366f1'},
      {k:'플랫폼', v:pnl.platform, c:'#06b6d4'},
      {k:'인건비', v:pnl.laborCost, c:'#22c55e'},
      {k:'임대료', v:pnl.rent, c:'#f59e0b'},
      {k:'공과금 등', v:pnl.utilities, c:'#eab308'}, 
      {k:'POS/인터넷', v:pnl.saas, c:'#94a3b8'},
      {k:'센터서비스', v:pnl.centerAlloc, c:'#f97316'},
      {k:'3PL', v:pnl.threePl, c:'#14b8a6'},
      {k:'EBITDA', v:Math.max(pnl.ebitda,0), c:'#3b82f6'}
    ];
    const canvas = dom.pl_donut.canvas; 
    const ctx = canvas.getContext('2d'); 
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const w=canvas.width,h=canvas.height,r=Math.min(w,h)/2 - 6,cx=w/2,cy=h/2; let start=-Math.PI/2; const total=parts.reduce((a,b)=>a+b.v,0);
    if (total === 0 || isNaN(total)) return;
    parts.forEach(p=>{const ang=(p.v/total)*Math.PI*2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,start,start+ang);ctx.closePath();ctx.fillStyle=p.c;ctx.fill();start+=ang;});
    ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(cx,cy,r*0.60,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';
    ctx.fillStyle='#cbd5e1';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText('비용 구조(%)',cx,cy-4);ctx.font='12px system-ui';ctx.fillText('월 기준, 1점포',cx,cy+14);

    const lr = dom.pl_donut.legend; lr.innerHTML='';
    parts.forEach(p=>{
      const l=document.createElement('div');
      const ratio = pnl.rev > 0 ? (p.v / pnl.rev * 100) : 0;
      l.innerHTML=`<span class="dot" style="background:${p.c}"></span> ${p.k} ${isNaN(ratio)?'0.0':ratio.toFixed(1)}%`;
      const rdiv=document.createElement('div'); rdiv.style.textAlign='right'; rdiv.textContent=KRW(p.v);
      lr.appendChild(l); lr.appendChild(rdiv);
    });
  }

  function updateTotalPackageResults(storeCount: number, level: 'A' | 'B' | 'C', pnl: any) {
    const annualMultiplier = 12;
    const totalRev = pnl.rev * storeCount * annualMultiplier;
    const totalCogs = pnl.totalCogs * storeCount * annualMultiplier;
    const totalVar = pnl.variable * storeCount * annualMultiplier;
    const totalStoreFixed = (pnl.laborCost + pnl.rent + pnl.saas) * storeCount * annualMultiplier;

    const centralSupportWages = pnl.centralWages.total * annualMultiplier;
    const washingLabor = pnl.washingLabor * annualMultiplier;
    const patrolLabor = pnl.patrolLabor * annualMultiplier;
    
    // Total EBITDA for the entire package is Revenue minus all costs
    const totalEbitda = totalRev - totalVar - totalStoreFixed - centralSupportWages - washingLabor - patrolLabor;
    
    const hqCapex = calculateTotalHqCapex(storeCount, pnl.allStaff);
    const effectiveUnitCapex = getEffectiveUnitCapex(level);
    const storesTotalCapex = effectiveUnitCapex * storeCount;
    const totalCapex = (storesTotalCapex + hqCapex.total) * 1.05;
    
    const paybackYears = totalEbitda > 0 ? (totalCapex / totalEbitda) : NaN;

    // KPI Bar
    dom.total_pnl.rev.textContent = KRW(totalRev);
    dom.total_pnl.cogsRatio.textContent = totalRev > 0 ? `${(totalCogs / totalRev * 100).toFixed(1)}%` : '-';
    dom.total_pnl.var.textContent = KRW(totalVar);
    // Total Fixed cost is store fixed costs + ALL central labor costs
    const totalCentralLabor = centralSupportWages + washingLabor + patrolLabor;
    dom.total_pnl.fix.textContent = KRW(totalStoreFixed + totalCentralLabor);
    dom.total_pnl.ebitda.textContent = KRW(totalEbitda);
    dom.total_pnl.pay.textContent = isNaN(paybackYears) ? 'N/A' : `${paybackYears.toFixed(1)} 년`;

    // Table
    dom.total_pnl.t_rev.textContent = KRW(totalRev);
    dom.total_pnl.t_cogs_abs.textContent = KRW(totalCogs);
    dom.total_pnl.t_cogs_ratio.textContent = `총 매출의 ${dom.total_pnl.cogsRatio.textContent}`;
    dom.total_pnl.t_var_etc.textContent = KRW(totalVar - totalCogs);
    dom.total_pnl.t_cm.textContent = KRW(totalRev - totalVar);
    dom.total_pnl.t_fix_store.textContent = KRW(totalStoreFixed);
    
    dom.total_pnl.t_center_wage.textContent = KRW(centralSupportWages);
    
    dom.total_pnl.washing_wage_row.style.display = (level === 'A') ? 'table-row' : 'none';
    dom.total_pnl.t_washing_wage.textContent = KRW(washingLabor);
    
    dom.total_pnl.patrol_wage_row.style.display = (level === 'C') ? 'none' : 'table-row';
    dom.total_pnl.t_patrol_wage.textContent = KRW(patrolLabor);
    
    dom.total_pnl.t_ebitda.textContent = KRW(totalEbitda);
    const totalMargin = totalRev > 0 ? (totalEbitda / totalRev * 100).toFixed(1) : '0.0';
    dom.total_pnl.t_margin.textContent = `마진 ${totalMargin}%`;
    dom.total_pnl.t_payback.textContent = isNaN(paybackYears) ? 'N/A' : `${paybackYears.toFixed(1)} 년`;

    // Update HQ P&L at the same time and get results
    const hqPnlResults = calcHqPnl(level, totalCogs, centralSupportWages, washingLabor, patrolLabor, hqCapex.total);

     // Update EBITDA note if AI params are applied
    if (state.aiParamsApplied && state.beforeAiPnl.total) {
      const beforeEbitda = state.beforeAiPnl.total.totalEbitda;
      const afterEbitda = totalEbitda;
      const diff = afterEbitda - beforeEbitda;
      const diffPercent = beforeEbitda !== 0 ? (diff / Math.abs(beforeEbitda)) * 100 : (afterEbitda > 0 ? 100 : 0);
      const diffColor = diff >= 0 ? 'var(--skyL)' : 'var(--rose)';
      
      let diffText = `${KRW(diff)} (${diffPercent.toFixed(1)}%) ${diff >= 0 ? '증가' : '감소'}`;
      
      dom.total_pnl.note.innerHTML = `<b>주석</b> — AI 파라미터 적용으로 <b>총 연간 EBITDA</b>가 <b>${KRW(beforeEbitda)}</b>에서 <b>${KRW(afterEbitda)}</b>로 <b style="color:${diffColor};">${diffText}</b> 예상`;
    }

    if (state.aiParamsApplied && state.beforeAiPnl.hq) {
      const beforeEbitda = state.beforeAiPnl.hq.hqEbitda;
      const afterEbitda = hqPnlResults.hqEbitda;
      const diff = afterEbitda - beforeEbitda;
      const diffPercent = beforeEbitda !== 0 ? (diff / Math.abs(beforeEbitda)) * 100 : (afterEbitda > 0 ? 100 : 0);
      const diffColor = diff >= 0 ? 'var(--skyL)' : 'var(--rose)';
      
      let diffText = `${KRW(diff)} (${diffPercent.toFixed(1)}%) ${diff >= 0 ? '증가' : '감소'}`;
      
      dom.hq_pnl.note.innerHTML = `<b>주석</b> — AI 파라미터 적용으로 <b>본사 연간 EBITDA</b>가 <b>${KRW(beforeEbitda)}</b>에서 <b>${KRW(afterEbitda)}</b>로 <b style="color:${diffColor};">${diffText}</b> 예상`;
    }

    // Return all necessary results for state capture
    return { totalEbitda, storesTotalCapex, hqCapex, totalCapex, hqPnlResults };
  }

  function calcHqPnl(level: 'A' | 'B' | 'C', totalAnnualCogs: number, centralSupportWages: number, washingLabor: number, patrolLabor: number, centerCapex: number) {
    const marginRate = parseFormattedNumber(dom.hq_pnl.marginRate.value);
    const hqRevenue = totalAnnualCogs * marginRate;

    // HQ Costs are ONLY central costs, not store costs
    const hqCosts = centralSupportWages + washingLabor + patrolLabor;
    const hqEbitda = hqRevenue - hqCosts;
    const hqPayback = hqEbitda > 0 ? (centerCapex * 1.05 / hqEbitda) : NaN;

    dom.hq_pnl.t_cogs.textContent = KRW(totalAnnualCogs);
    dom.hq_pnl.t_revenue.textContent = KRW(hqRevenue);
    dom.hq_pnl.t_revenue_desc.textContent = `총 공급가액 × ${(marginRate * 100).toFixed(1)}%`;
    dom.hq_pnl.t_center_wage.textContent = KRW(centralSupportWages);

    dom.hq_pnl.washing_wage_row.style.display = (level === 'A') ? 'table-row' : 'none';
    dom.hq_pnl.t_washing_wage.textContent = KRW(washingLabor);

    dom.hq_pnl.patrol_wage_row.style.display = (level === 'C') ? 'none' : 'table-row';
    dom.hq_pnl.t_patrol_wage.textContent = KRW(patrolLabor);

    dom.hq_pnl.t_ebitda.textContent = KRW(hqEbitda);
    dom.hq_pnl.t_payback.textContent = isNaN(hqPayback) ? 'N/A' : `${hqPayback.toFixed(1)} 년`;

    return { hqEbitda };
  }
  
  function updateScenarioAnalysisUI(currentPnl: any) {
      const fixedPnl = calculateFixed10CScenario();
      const scenarios = { s: currentPnl, f: fixedPnl };
      for (const [prefix, pnl] of Object.entries(scenarios)) {
          (dom.scenario as any)[`${prefix}_rev`].textContent = KRW(pnl.rev);
          (dom.scenario as any)[`${prefix}_cogs_ratio`].textContent = pnl.rev > 0 ? `${(pnl.totalCogs / pnl.rev * 100).toFixed(1)}%` : '-';
          (dom.scenario as any)[`${prefix}_var`].textContent = KRW(pnl.variable);
          (dom.scenario as any)[`${prefix}_fix`].textContent = KRW(pnl.totalFixed);
          (dom.scenario as any)[`${prefix}_ebitda`].textContent = KRW(pnl.ebitda);
          (dom.scenario as any)[`${prefix}_margin`].textContent = `${(pnl.margin * 100).toFixed(1)}%`;
          (dom.scenario as any)[`${prefix}_pay`].textContent = isNaN(pnl.payMonths) ? 'N/A' : `${pnl.payMonths.toFixed(1)} 개월`;
      }
  }
  
  function updateDecisionUI() {
      dom.decision.capex.textContent = dom.capexTotal.textContent ?? '-';
  }
  
  function updateForceLevelButtons() {
    Object.values(dom.forceLevelButtons).forEach(btn => btn.classList.remove('active'));
    const level = state.forcedLevel;
    if (level === 'C') dom.forceLevelButtons.c.classList.add('active');
    else if (level === 'B') dom.forceLevelButtons.b.classList.add('active');
    else if (level === 'A') dom.forceLevelButtons.a.classList.add('active');
    else dom.forceLevelButtons.auto.classList.add('active');
  }

  function showCapexModal(level: 'A' | 'B' | 'C') {
    const details = capexDetails[level];
    if (!details) return;

    dom.modal.title.textContent = details.title;
    
    let html = '<button id="ai_equipment_recommendation_btn" class="btn">🤖 AI 추천 장비 보기</button>';
    html += '<div id="ai_recommendation_results"></div>';
    
    html += '<h4>장비 내역</h4><ul>';
    let equipmentTotal = 0;
    details.equipment.forEach(e => {
        const itemText = e.item.includes("×") ? e.item : `${e.item} × 1`;
        html += `<li>${itemText}: ${KRW(e.cost)}</li>`;
        equipmentTotal += e.cost;
    });
    html += `<li class="total-row">장비 합계: ${KRW(equipmentTotal)}</li></ul>`;
    
    html += '<h4>설치/공사 내역</h4><ul>';
    let installTotal = 0;
    details.installation.forEach(i => {
        html += `<li>${i.item}: ${KRW(i.cost)}</li>`;
        installTotal += i.cost;
    });
    html += `<li class="total-row">설치 합계: ${KRW(installTotal)}</li></ul>`;
    
    const total = equipmentTotal + installTotal;
    const totalWithDeposit = total + 5000000;
    html += `<div class="total-row" style="font-size: 16px; text-align: right; margin-top: 20px;">총합(설치 포함): ${KRW(total)}<br>보증금 포함 초기투입: ${KRW(totalWithDeposit)}</div>`;

    dom.modal.body.innerHTML = html;
    dom.modal.backdrop.style.display = 'block';
    
    // Add listener to the newly created button
    const aiBtn = document.getElementById('ai_equipment_recommendation_btn');
    if (aiBtn) {
        aiBtn.addEventListener('click', () => {
            fetchAiEquipmentRecommendations(level);
        });
    }
  }

  function hideCapexModal() {
      dom.modal.backdrop.style.display = 'none';
  }

  async function fetchAiEquipmentRecommendations(level: 'A' | 'B' | 'C') {
    const btn = document.getElementById('ai_equipment_recommendation_btn') as HTMLButtonElement;
    const resultsContainer = document.getElementById('ai_recommendation_results');
    if (!btn || !resultsContainer) return;

    if (!API_KEY || API_KEY.includes("붙여넣으세요")) {
        btn.disabled = true;
        btn.textContent = 'API 키를 설정해주세요';
        return;
    }

    btn.disabled = true;
    btn.textContent = '🤖 AI가 추천 장비를 찾는 중...';
    resultsContainer.innerHTML = '<p>AI가 B2B 시장 데이터를 분석하여 실제 판매처를 찾고 있습니다. 잠시만 기다려주세요...</p>';
    

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const equipmentList = capexDetails[level].equipment.map(e => `- ${e.item}`).join('\n');
        
        const prompt = `
            You are an expert procurement specialist for industrial and commercial kitchen automation in South Korea. Your reputation depends on providing verifiable, professional, and accurate information. **Providing a hallucinated or non-existent model name is a critical failure.** Your task is to act as a research assistant, finding both the model name and the manufacturer.

            **MISSION:**
            For the following equipment list, provide the specific **model name** and the **manufacturer/primary supplier**.

            **Equipment List:**
            ${equipmentList}

            **--- CRITICAL DIRECTIVE: TWO-STEP RESEARCH & VERIFICATION (V6 - B2B PROFESSIONAL FOCUS) ---**

            **Step 1: Expert Search Methodology (Internal Monologue)**
            Your primary goal is to find information that a professional procurement officer would trust.
            1.  **Solution-Focused Search:** You are FORBIDDEN from searching for generic terms. You MUST search for the integrated application solution. Use expert Korean terms like **"치킨 조리 로봇 시스템"** and **"튀김 자동화 로봇 솔루션"**.
            2.  **Targeted Vendor Research:** Your first priority is to identify products from known Korean specialists like **"디떽 (D-Tech)"**, **"롸버트치킨 (Robert Chicken)"**, and major industrial robot manufacturers like **"Hanwha Robotics"** and **"Doosan Robotics"**. For standard equipment, research trusted Korean B2B kitchen suppliers like **황학동온라인, 업소마트, 키친탑**.
            3.  **Intelligent International Fallback:** For highly specialized components not available from the above (e.g., advanced grippers, specific safety relays), identify compatible products from global leaders (e.g., **OnRobot, Schunk, Keyence, Omron**).

            **Step 2: MANDATORY Information Verification (Internal Monologue)**
            For EACH recommendation, you must perform this check:
            1.  **Simulate a Google Search:** Mentally search for the **"[Manufacturer Name]" + "[Model Name]"**.
            2.  **Verify Existence:** Does this search lead to official product pages, datasheets, or listings on reputable B2B distributor websites?
            3.  **Confirm Identity:** Is the manufacturer name correct and official?
            4.  **Conclusion:** Your internal monologue must conclude: "VERIFICATION PASSED: [Manufacturer] and [Model Name] are a real, verifiable pair." If you cannot reach this conclusion, you MUST find an alternative.

            **Step 3: Output Generation - ZERO TOLERANCE RULE**
            *   You MUST provide a value for both \`manufacturer\` and \`recommended_model\`.
            *   **IF, after your expert search, you absolutely CANNOT find a verifiable model**, use the following fallback for BOTH fields:
                *   Set \`manufacturer\` to "해당 없음".
                *   Set \`recommended_model\` to "추천 모델을 찾을 수 없음".
            *   Your core directive is **professional-grade accuracy**.

            **FINAL COMMAND:**
            Produce a single, valid JSON object according to the schema. Your reliability is paramount.
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                recommendations: {
                    type: Type.ARRAY,
                    description: "List of equipment recommendations.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            item_name: { type: Type.STRING, description: "Original name of the equipment item from the list." },
                            manufacturer: { type: Type.STRING, description: "The official name of the manufacturer or primary supplier." },
                            recommended_model: { type: Type.STRING, description: "A specific, real-world model name." }
                        },
                        required: ["item_name", "manufacturer", "recommended_model"]
                    }
                }
            },
            required: ["recommendations"]
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        const aiData = JSON.parse(response.text);

        let resultsHtml = `
            <h4>AI 추천 장비 목록</h4>
            <p class="ai-link-disclaimer">
                <strong>참고:</strong> AI가 추천한 제조사 및 모델명으로 Google 검색 결과를 제공합니다.
                이를 통해 공식 제품 페이지, 데이터시트, 신뢰성 있는 B2B 공급업체를 찾을 수 있습니다.
            </p>
        `;
        resultsHtml += '<table><thead><tr><th>항목</th><th>추천 모델</th><th>구매/검색 링크</th></tr></thead><tbody>';

        if (aiData.recommendations && aiData.recommendations.length > 0) {
            aiData.recommendations.forEach((rec: any) => {
                const originalItem = capexDetails[level].equipment.find(e => e.item.includes(rec.item_name.split('(')[0].trim()));
                const itemName = originalItem ? originalItem.item : rec.item_name;

                const isFindable = rec.recommended_model !== '추천 모델을 찾을 수 없음';
                const searchQuery = isFindable ? `${rec.manufacturer} ${rec.recommended_model}` : itemName;
                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                
                resultsHtml += `
                    <tr>
                        <td>${itemName}</td>
                        <td>${isFindable ? `<b>${rec.manufacturer}</b> ${rec.recommended_model}` : rec.recommended_model}</td>
                        <td>
                            <a href="${searchUrl}" target="_blank" rel="noopener noreferrer">Google 검색</a>
                        </td>
                    </tr>
                `;
            });
        } else {
            resultsHtml += '<tr><td colspan="3">추천 장비를 찾을 수 없습니다.</td></tr>';
        }

        resultsHtml += '</tbody></table>';
        resultsContainer.innerHTML = resultsHtml;

    } catch (error) {
        console.error("AI Equipment Fetch Error:", error);
        resultsContainer.innerHTML = '<p style="color:var(--rose);">장비 추천을 받아오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>';
    } finally {
        btn.disabled = false;
        btn.textContent = '🤖 AI 추천 장비 다시 보기';
    }
}

  async function fetchAiParameters() {
    dom.aiParamsBtn.disabled = true;
    dom.aiParamsBtn.textContent = '🤖 AI 파라미터 적용 중...';
    
    if (!API_KEY || API_KEY.includes("붙여넣으세요")) {
        dom.aiParamsBtn.disabled = true;
        dom.aiParamsBtn.textContent = 'API 키를 설정해주세요';
        return;
    }

    // Capture "before" state
    const baseInputsBefore = getCurrentBaseInputs();
    const pnlBefore = calcPNL(state.storeCount, baseInputsBefore);
    const totalPnlAndHqBefore = updateTotalPackageResults(state.storeCount, getAutomationLevel(state.storeCount), pnlBefore);
    state.beforeAiPnl = {
        unit: pnlBefore,
        total: totalPnlAndHqBefore,
        hq: totalPnlAndHqBefore.hqPnlResults
    };
    state.beforeAiStaff = pnlBefore.allStaff;


    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        const prompt = `
            You are a meticulous financial and HR analyst at a top-tier consulting firm. Your analysis must be rigorous, data-driven, and reflect deep market knowledge. Your reputation depends on the accuracy and logical consistency of your recommendations.

            **Business Model Context:**
            - **Store Model:** Small, delivery-only outlets in low-cost 'C-level' back-alley locations.
            - **Product Process:** Crucially, stores only perform a final, brief 4-5 minute 2nd fry. This significantly reduces in-store cooking oil consumption compared to a standard chicken shop.
            - **Logistics (3PL):** Highly simplified parcel-delivery-like model.
            - **Store Operating Hours:** ${gv('hours')} hours/day.

            **Current Franchise Scale:** ${state.storeCount} stores.

            **Current Default Parameters (For Your Comparison):**
            - In-Store Processing Cost (procCost): ${gv('procCost')} KRW
            - Packaging & Service Cost (pkgCost): ${gv('pkgCost')} KRW
            - Platform Fee Rate (platformFeeRate): ${gv('pf')}
            - Avg Monthly Rent (avgRent): ${gv('rent')} KRW
            - 3PL Rate (threePlRate): ${gv('threePlRate')}
            - Utilities Rate (utilitiesRate): ${gv('utilRate')}
            - Service Menu Cost (serviceCost): ${gv('serviceCost')} KRW
            - Wage Multiplier (wageMultiplier): ${gv('wageMultiplier')}
            - Automation Savings B (automationSavingsRateB): ${gv('bSavings')}

            **TASK:**
            Provide realistic, optimized estimates for the financial parameters and central staff count.

            **--- CRITICAL RULES & RESPONSE STRUCTURE ---**
            1.  **MANDATORY JSON STRUCTURE:** You MUST respond with a JSON object containing a 'pnlParameters' key. This key must hold an array of objects. Each object in the array represents ONE parameter and MUST contain three keys: "key", "value", and "reasoning".
            2.  **COMPLETE COVERAGE:** The 'pnlParameters' array MUST contain an object for EVERY one of the following keys: "procCost", "pkgCost", "serviceCost", "platformFeeRate", "avgRent", "utilitiesRate", "wageMultiplier", "threePlRate", "automationSavingsRateB". Missing any of these is a CRITICAL FAILURE.
            3.  **NO EMPTY REASONING:** The "reasoning" string for EVERY object MUST be detailed, non-empty, and data-driven. A blank or generic reasoning is a CRITICAL FAILURE.
            4.  **SELF-VALIDATION:** Before outputting the final JSON, you MUST internally validate that your response adheres to rules 1, 2, and 3. If it fails validation, you must correct it before providing the final response.

            **--- PARAMETER-SPECIFIC INSTRUCTIONS (MANDATORY) ---**

            -   **Justify Everything:** For EVERY parameter, your 'reasoning' must explicitly compare your proposed 'value' to the default value provided above and explain WHY it is different. If the value is the same, you must explain why scale benefits or other factors do not apply.
            -   **State Assumptions:** For calculations (like oil cost), you MUST state your baseline assumption first.
            -   **Detailed Breakdowns:** For \`procCost\` and \`pkgCost\`, your reasoning MUST include a detailed component-by-component cost breakdown.
            -   **\`procCost\` Reasoning:** You MUST follow this exact, data-driven process for calculating oil cost:
                1.  First, state your baseline assumption by finding the current South Korean market price for a standard 18L can of commercial frying oil (e.g., '현재 식용유 18L 한 통 가격 약 40,000원 가정 시...').
                2.  Second, calculate the per-chicken oil cost for a standard shop by dividing this price by 60 (the industry average chickens fried per can). Show this calculation (e.g., '일반 치킨집 마리당 유류비는 40,000원 ÷ 60마리 = 약 667원').
                3.  Third, apply our business model's 70% consumption reduction to this baseline to calculate the final oil cost.
                4.  Finally, provide the full cost breakdown in the required format: '유류비: OOO원 (초벌 완료 모델로 소모량 70% 감소 적용), 소스 A(30g): OOO원, 파우더 B(10g): OO원, 기타: OO원. 총 OOO원. 기본값 ${gv('procCost')}원 대비...'.
            -   **\`pkgCost\` Reasoning:** Use this format: '치킨 박스: OOO원, 치킨 무: OOO원, 캔음료(대량 매입가): OOO원, 기타: OO원. 총 OOO원. 이는 대량 구매 계약을 통해 기본값 ${gv('pkgCost')}원 대비...'.
            -   **Staffing Reasoning:**
                -   **Context Clarification:** The "본사(HQ)" is a lean **Central Control Center**. 
                -   **거점장 (Hub Manager) Role Definition:** This is the manager of a physical **Regional Hub**. The number of Hub Managers is always equal to the number of Regional Hubs (1 per 100 stores). They are senior field managers responsible for the overall operational health, QA, and escalated issue resolution for all stores within their hub's territory. They are not office-based managers with direct reports.
                -   **Staffing Roles:**
                    - **지원 (Corporate):** Core operations support (supply chain, QA data analysis, SOP compliance). Do NOT include marketing, R&D, sales, legal, etc.
                    - **CS (Customer Service):** Centralized customer and store support inquiries.
                    - **기술 지원 (Tech Support):** 1st-level IT/equipment support and coordination with external vendors.
                    - **모니터링 (Monitoring):** Dedicated staff for real-time monitoring of all ${state.storeCount} stores via CCTV and KDS dashboards from the central control center. You MUST base your calculation on the provided **Store Operating Hours (${gv('hours')} hours/day)**, considering shifts. Justify your calculation.
                -   **Format:** Your \`staffing_reasoning\` must be a separate top-level key. For maximum readability, you MUST format the entire reasoning as a markdown bulleted list (using \`- \`). Provide a separate bullet point justifying EACH proposed staff number (\`corporate\`, \`cs\`, \`techSupport\`, \`monitoring\`).

            **LANGUAGE:** All text output MUST be in professional, natural Korean.
        `;

        const schema = {
          type: Type.OBJECT,
          properties: {
            pnlParameters: {
                type: Type.ARRAY,
                description: "An array where each object contains a PNL parameter's key, its proposed value, and a mandatory detailed reasoning.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        key: { type: Type.STRING, description: "The parameter key, e.g., 'procCost'." },
                        value: { type: Type.NUMBER, description: "The proposed numeric value for the parameter." },
                        reasoning: { type: Type.STRING, description: "A detailed, data-driven justification for the proposed value. Cannot be empty." }
                    },
                    required: ["key", "value", "reasoning"]
                }
            },
            staffing: {
                type: Type.OBJECT,
                properties: {
                    corporate: { type: Type.NUMBER },
                    cs: { type: Type.NUMBER },
                    techSupport: { type: Type.NUMBER },
                    monitoring: { type: Type.NUMBER },
                },
                required: ['corporate', 'cs', 'techSupport', 'monitoring'],
            },
            staffing_reasoning: { type: Type.STRING },
            cogsDiscountTiers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        threshold: { type: Type.NUMBER },
                        discount: { type: Type.NUMBER },
                    },
                    required: ['threshold', 'discount'],
                }
            },
            capexDiscountTiers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        threshold: { type: Type.NUMBER },
                        discount: { type: Type.NUMBER },
                    },
                    required: ['threshold', 'discount'],
                }
            }
          },
          required: ["pnlParameters", "staffing", "staffing_reasoning", "cogsDiscountTiers", "capexDiscountTiers"]
        };
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: schema
          }
        });
        
        const aiData = JSON.parse(response.text);
        
        // This structural check is now the primary gatekeeper
        if (aiData.pnlParameters && Array.isArray(aiData.pnlParameters) && aiData.pnlParameters.length > 0) {
            clearAiHighlightsAndDefaults();
            
            const originalValues: {[key: string]: string} = {};
            aiHighlightableInputs.forEach(key => {
                const inputEl = dom.pl[key as keyof typeof dom.pl];
                if (inputEl) {
                    originalValues[key] = inputEl.value;
                }
            });

            // Targeted, safe update of AI params. This prevents overwriting core business logic.
            state.aiParams.staffing = aiData.staffing;
            state.aiParams.staffing_reasoning = aiData.staffing_reasoning;
            state.aiParams.cogsDiscountTiers = aiData.cogsDiscountTiers;
            state.aiParams.capexDiscountTiers = aiData.capexDiscountTiers;
            state.aiParamsApplied = true;
            
            aiData.pnlParameters.forEach((param: AiPnlParameter) => {
                const domKey = param.key === 'platformFeeRate' ? 'pf' :
                               param.key === 'avgRent' ? 'rent' :
                               param.key === 'utilitiesRate' ? 'utilRate' :
                               param.key === 'automationSavingsRateB' ? 'bSavings' :
                               param.key as keyof typeof dom.pl;

                const inputEl = dom.pl[domKey];

                if (inputEl) {
                    // Update value in the input field
                    if (['pf', 'utilRate', 'threePlRate', 'wageMultiplier', 'bSavings'].includes(domKey)) {
                         inputEl.value = String(param.value);
                    } else {
                         inputEl.value = formatNumber(param.value);
                    }
                    
                    // Add visual highlights and reasoning
                    const labelEl = inputEl.parentElement;
                    if (!labelEl || labelEl.tagName !== 'LABEL') return;

                    inputEl.classList.add('ai-applied');
                    
                    const displaySpan = document.createElement('span');
                    displaySpan.className = 'default-value-display';
                    displaySpan.textContent = `(기본값: ${originalValues[domKey] || 'N/A'})`;
                    labelEl.appendChild(displaySpan);

                    const reasoningDiv = document.createElement('div');
                    reasoningDiv.className = 'ai-reasoning-note';
                    reasoningDiv.innerHTML = `<b>AI 분석:</b> ${param.reasoning}`;
                    labelEl.appendChild(reasoningDiv);
                }
            });
            updateAllUI();
        } else {
            throw new Error("Invalid or incomplete data structure from AI: 'pnlParameters' is missing or empty.");
        }

    } catch (error) {
        console.error("AI Parameter Fetch Error:", error);
        state.beforeAiStaff = null; // Clear before-state on error
        state.beforeAiPnl = { unit: null, total: null, hq: null };
    } finally {
        dom.aiParamsBtn.disabled = false;
        dom.aiParamsBtn.textContent = '🤖 AI 추천 파라미터 적용';
    }
  }


  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    dom.storeSlider.addEventListener('input', (e) => {
      state.forcedLevel = null; // Revert to auto mode when slider is used
      resetAiState();
      const storeCount = mapSliderToStoreCount(Number((e.target as HTMLInputElement).value));
      if (storeCount !== state.storeCount) {
        state.storeCount = storeCount;
        updateAllUI();
      }
    });

    dom.applyChangesBtn.addEventListener('click', updateAllUI);
    dom.aiParamsBtn.addEventListener('click', fetchAiParameters);
    dom.hq_pnl.marginRate.addEventListener('input', updateAllUI);
    
    Object.entries(dom.forceLevelButtons).forEach(([key, btn]) => {
        btn.addEventListener('click', () => {
            state.forcedLevel = key === 'auto' ? null : key.toUpperCase() as 'A' | 'B' | 'C';
            updateAllUI();
        });
    });


    // Add formatting to all numeric inputs on blur
    const numericInputs = document.querySelectorAll('input[type="text"]');
    numericInputs.forEach(input => {
        if (!(input as HTMLInputElement).readOnly) {
           input.addEventListener('blur', (e) => {
              const target = e.target as HTMLInputElement;
              const val = parseFormattedNumber(target.value);
              if (!isNaN(val) && ![
                'pl_pf', 
                'pl_util_rate', 
                'pl_3pl_rate', 
                'pl_b_savings', 
                'pl_patrol_wage', 
                'pl_washing_wage', 
                'hq_margin_rate', 
                'pl_wage_multiplier'
              ].includes(target.id) ) {
                 target.value = formatNumber(val);
              }
           });
        }
    });

    dom.summaryLevelChip.addEventListener('click', () => {
        showCapexModal(state.currentLevel);
    });
    dom.modal.closeBtn.addEventListener('click', hideCapexModal);
    dom.modal.backdrop.addEventListener('click', (e) => {
        if (e.target === dom.modal.backdrop) {
            hideCapexModal();
        }
    });
  }

  // --- INITIALIZATION ---
  window.addEventListener('load', async () => {
    // Format initial numbers
    const allInputs = document.querySelectorAll('input[type="text"]');
    allInputs.forEach(input => {
        if (!(input as HTMLInputElement).readOnly) {
           const val = parseFormattedNumber((input as HTMLInputElement).value);
            if (!isNaN(val) && ![
              'pl_pf', 
              'pl_util_rate', 
              'pl_3pl_rate', 
              'pl_b_savings', 
              'pl_patrol_wage', 
              'pl_washing_wage', 
              'hq_margin_rate', 
              'pl_wage_multiplier'
            ].includes(input.id) ) {
             (input as HTMLInputElement).value = formatNumber(val);
            }
        }
    });

    setupEventListeners();
    
    // Check for API Key on load and disable buttons if not present.
    if (!API_KEY || API_KEY.includes("붙여넣으세요")) {
        dom.aiParamsBtn.disabled = true;
        dom.aiParamsBtn.textContent = 'API 키를 설정해주세요';
    } 
    
    updateAllUI();
  });