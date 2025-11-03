// index.tsx
import { GoogleGenAI, Type } from "@google/genai";

import { KRW, formatNumber, parseFormattedNumber } from './src/app/utils/format.ts';
import { initState, setLevel, AppWindow, OpsState } from './src/app/state/ops.ts';
import { getPresetKitByLevel, resolveSlots } from './src/app/catalog/equipment.ts';
import { renderEquipTable } from './src/features/capex/EquipTable.tsx';
import { initCapexModal } from './src/features/capex/CapexModal.tsx';

declare let window: AppWindow;

// --- INITIALIZATION ---
window.addEventListener('load', async () => {

  initState();

  // --- CONFIGURATION ---
  const dom = {
    headerStage: document.getElementById('header_current_stage') as HTMLElement,
    storeSlider: document.getElementById('store_slider') as HTMLInputElement,
    sliderValDisplay: document.getElementById('slider_val_display') as HTMLSpanElement,
    aiParamsBtn: document.getElementById('ai_params') as HTMLButtonElement,
    applyChangesBtn: document.getElementById('apply_changes') as HTMLButtonElement,
    openEquipModalBtn: document.getElementById('open_equip_modal_btn') as HTMLButtonElement,
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
    capexNote: document.getElementById('capex_note') as HTMLDivElement,
    // OPEX
    opexLaborDesc: document.getElementById('opex_labor_desc') as HTMLTableCellElement,
    opexLaborCost: document.getElementById('opex_labor_cost') as HTMLTableCellElement,
    opexRentCost: document.getElementById('opex_rent_cost') as HTMLTableCellElement,
    opexSaasCost: document.getElementById('opex_saas_cost') as HTMLTableCellElement,
    opexRentalRow: document.getElementById('opex_rental_row') as HTMLTableRowElement,
    opexRentalCost: document.getElementById('opex_rental_cost') as HTMLTableCellElement,
    opexCenterDesc: document.getElementById('opex_center_desc') as HTMLTableCellElement,
    opexCenterCost: document.getElementById('opex_center_cost') as HTMLTableCellElement,
    opexTotal: document.getElementById('opex_total') as HTMLTableCellElement,
    // SOP Fry
    sop: {
      fryTimeMin: document.getElementById('sop_fry_time_min') as HTMLInputElement,
      dripTimeSec: document.getElementById('sop_drip_time_sec') as HTMLInputElement,
      transferTimeSec: document.getElementById('sop_transfer_time_sec') as HTMLInputElement,
      safetyBufferPct: document.getElementById('sop_safety_buffer_pct') as HTMLInputElement,
      formulaDisplay: document.getElementById('sop_formula_display') as HTMLDivElement,
      cycleTime: document.getElementById('sop_cycle_time') as HTMLElement,
      capacityH: document.getElementById('sop_capacity_h') as HTMLElement,
      bufferedCapacityH: document.getElementById('sop_buffered_capacity_h') as HTMLElement,
      refFryers: document.getElementById('sop_ref_fryers') as HTMLElement,
    },
    // Capacity Plan
    capacityPlan: {
      targetRev: document.getElementById('cap_target_rev') as HTMLInputElement,
      aov: document.getElementById('cap_aov') as HTMLInputElement,
      days: document.getElementById('cap_days') as HTMLInputElement,
      peakShare: document.getElementById('cap_peak_share') as HTMLInputElement,
      peakWindow: document.getElementById('cap_peak_window') as HTMLInputElement,
      fryerType: document.getElementById('cap_fryer_type') as HTMLSelectElement,
      refCapacity: document.getElementById('cap_ref_capacity') as HTMLElement,
      warningBanner: document.getElementById('cap_warning_banner') as HTMLDivElement,
      reqUnitsDay: document.getElementById('cap_req_units_day') as HTMLElement,
      peakOrdersH: document.getElementById('cap_peak_orders_h') as HTMLElement,
      fryerSlotsNeeded: document.getElementById('cap_fryer_slots_needed') as HTMLElement,
      fryerDevicesNeeded: document.getElementById('cap_fryer_devices_needed') as HTMLElement,
      recoDevices: document.getElementById('cap_reco_devices') as HTMLElement,
      totalCapex: document.getElementById('cap_total_capex') as HTMLElement,
      diagnoseBtn: document.getElementById('cap_diagnose_btn') as HTMLButtonElement,
      diagnosisResults: document.getElementById('cap_diagnosis_results') as HTMLDivElement,
      diagTabs: {
        tab1: document.getElementById('tab1') as HTMLInputElement,
        tab2: document.getElementById('tab2') as HTMLInputElement,
        content1: document.getElementById('diag_tab1_content') as HTMLDivElement,
        content2: document.getElementById('diag_tab2_content') as HTMLDivElement,
      },
      diag: {
        reqUnitsDay: document.getElementById('diag_req_units_day') as HTMLElement,
        peakOrdersH: document.getElementById('diag_peak_orders_h') as HTMLElement,
        reqFryerSlots: document.getElementById('diag_req_fryer_slots') as HTMLElement,
        reqCrew: document.getElementById('diag_req_crew') as HTMLElement,
        ownedFryerSlots: document.getElementById('cap_fryer_slots_owned') as HTMLInputElement,
        verdict1: document.getElementById('diag_verdict_1') as HTMLDivElement,
        riders: document.getElementById('diag_riders') as HTMLInputElement,
        ordersPerRider: document.getElementById('diag_orders_per_rider') as HTMLInputElement,
        maxPromise: document.getElementById('diag_max_promise_min') as HTMLInputElement,
        cancelThresh: document.getElementById('diag_cancel_thresh_pct') as HTMLInputElement,
        kitchenCapacity: document.getElementById('diag_kitchen_capacity') as HTMLElement,
        deliveryCapacity: document.getElementById('diag_delivery_capacity') as HTMLElement,
        estPromiseTime: document.getElementById('diag_est_promise_time') as HTMLElement,
        estCancelRate: document.getElementById('diag_est_cancel_rate') as HTMLElement,
        verdict2: document.getElementById('diag_verdict_2') as HTMLDivElement,
        finalVerdict: document.getElementById('diag_final_verdict') as HTMLDivElement,
      },
      sugg: {
        aov: document.getElementById('sugg_aov') as HTMLButtonElement,
        peak: document.getElementById('sugg_peak') as HTMLButtonElement,
        fryer: document.getElementById('sugg_fryer') as HTMLButtonElement,
        pack: document.getElementById('sugg_pack') as HTMLButtonElement,
        op: document.getElementById('sugg_op') as HTMLButtonElement,
      }
    },
    // Staffing Peak
    staffingPeak: {
      maxFryers: document.getElementById('staff_max_fryers') as HTMLInputElement,
      loadUnloadSec: document.getElementById('staff_load_unload_sec') as HTMLInputElement,
      sauceSec: document.getElementById('staff_sauce_sec') as HTMLInputElement,
      packSec: document.getElementById('staff_pack_sec') as HTMLInputElement,
      runnerSec: document.getElementById('staff_runner_sec') as HTMLInputElement,
      refFryerSlots: document.getElementById('staff_ref_fryer_slots') as HTMLElement,
      refPeakOrders: document.getElementById('staff_ref_peak_orders') as HTMLElement,
      outFryOps: document.getElementById('staff_out_fry_ops') as HTMLElement,
      outPackers: document.getElementById('staff_out_packers') as HTMLElement,
      outRunner: document.getElementById('staff_out_runner') as HTMLElement,
      outTotal: document.getElementById('staff_out_total') as HTMLElement,
      schedule: document.getElementById('staff_schedule') as HTMLDivElement,
      commitBtn: document.getElementById('commit_ops_plan_btn') as HTMLButtonElement,
    },
    // Center Ops
    centerOps: {
        useDetailedCenterOps: false,
        centerFTE: 0,
        refStores: document.getElementById('center_ref_stores') as HTMLElement,
        refDevices: document.getElementById('center_ref_devices') as HTMLElement,
        refSlots: document.getElementById('center_ref_slots') as HTMLElement,
        refCrew: document.getElementById('center_ref_crew') as HTMLElement,
        patrolMin: document.getElementById('center_patrol_min') as HTMLInputElement,
        storeCleanMin: document.getElementById('center_store_clean_min') as HTMLInputElement,
        qaMin: document.getElementById('center_qa_min') as HTMLInputElement,
        outTotalMin: document.getElementById('center_out_total_min') as HTMLElement,
        outFTE: document.getElementById('center_out_fte') as HTMLElement,
        outTimeline: document.getElementById('center_out_timeline') as HTMLElement,
    },
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
      useCustomCapex: document.getElementById('pl_use_custom_capex') as HTMLInputElement,
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
      rentalRow: document.getElementById('pl_t_rental_row') as HTMLTableRowElement,
      rental: document.getElementById('pl_t_rental') as HTMLTableCellElement,
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
        rent: document.getElementById('hq_rent') as HTMLInputElement,
        util: document.getElementById('hq_util') as HTMLInputElement,
        saas: document.getElementById('hq_saas') as HTMLInputElement,
        t_cogs: document.getElementById('hq_t_cogs') as HTMLTableCellElement,
        t_revenue: document.getElementById('hq_t_revenue') as HTMLTableCellElement,
        t_revenue_desc: document.getElementById('hq_t_revenue_desc') as HTMLTableCellElement,
        t_center_wage: document.getElementById('hq_t_center_wage') as HTMLTableCellElement,
        t_overhead: document.getElementById('hq_t_overhead') as HTMLTableCellElement,
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
      card_c: document.getElementById('roadmap_card_c') as HTMLDivElement,
      card_b: document.getElementById('roadmap_card_b') as HTMLDivElement,
      card_a: document.getElementById('roadmap_card_a') as HTMLDivElement,
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
        tabsContainer: document.getElementById('modal_tabs_container') as HTMLDivElement,
        tabContentContainer: document.getElementById('modal_tab_content_container') as HTMLDivElement,
        closeBtn: document.getElementById('modal_close') as HTMLButtonElement,
    }
  };

  const STORES_PER_REGIONAL_CENTER = 100;
  
  const automationLevels = {
      C: { threshold: 0, name: 'Level C', unitCapex: 42948000, baseFTE: 1.2 },
      B: { threshold: 500, name: 'Level B', unitCapex: 60948000, baseFTE: 1.2 },
      A: { threshold: 1000, name: 'Level A', unitCapex: 77328000, baseFTE: 0.0 }
  };
  
  // --- LOCAL PAGE STATE ---
  let state = {
    storeCount: 10,
    forcedLevel: null as 'C' | 'B' | 'A' | null,
    aiParamsApplied: false,
    beforeAiStaff: null as any,
    beforeAiPnl: {
      unit: null as any,
      total: null as any,
      hq: null as any,
    },
    beforeAiRawValues: new Map<string, string>(),
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
            platform: 4200000,
            techSupport: 4000000,
            monitoring: 3800000,
        },
        staffingRatios: {
            corporate: 2.5, // staff per 100 stores
            cs: 1.5, // staff per 100 stores
            platform: 1.0,
            technical: 2.0,
            monitoring: 1.0,
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

  type PnlParameterKey = 'procCost' | 'pkgCost' | 'serviceCost' | 'pf' | 'rent' | 'utilRate' | 'wageMultiplier' | 'threePlRate' | 'bSavings' | 'patrolStores' | 'washingStores';
  type AiPnlParameter = {
      key: PnlParameterKey;
      value: number;
      reasoning: string;
  };
  
  // --- UTILITIES (Main file) ---
  function gv(elementId: keyof typeof dom.pl, isNumeric: false): string;
  function gv(elementId: keyof typeof dom.pl, isNumeric?: true): number;
  function gv(elementId: keyof typeof dom.pl, isNumeric = true): string | number {
    const el = dom.pl[elementId];
    if (!el) return isNumeric ? 0 : '';
    const value = 'value' in el ? el.value : '';
    return isNumeric ? parseFormattedNumber(value) : value;
  }

  function clearAiHighlightsAndDefaults() {
      document.querySelectorAll('.ai-applied').forEach(el => el.classList.remove('ai-applied'));
      document.querySelectorAll('.ai-reasoning-note-item').forEach(el => el.remove());
      const staffEl = dom.conclusionStaff;
      if (staffEl) {
        staffEl.innerHTML = staffEl.innerHTML.replace(/ <span class="k">\(기본: \d+명\)<\/span>/, '');
      }
      if(dom.pl_t.note) dom.pl_t.note.innerHTML = `<b>주석</b> — <u>계산 구조</u>는 업로드 자료의 방식(= 기여이익 정의, 3PL은 매출원가(COGS)의 일정 비율 등)을 반영했습니다. 실제 계약·상권별로 값만 조정하시면 됩니다.`;
      if(dom.total_pnl.note) dom.total_pnl.note.innerHTML = '';
      if(dom.hq_pnl.note) dom.hq_pnl.note.innerHTML = '';
      if(dom.conclusionStaffNote) {
        const aiNote = dom.conclusionStaffNote.querySelector('.ai-reasoning-note');
        if (aiNote) aiNote.remove();
      }
  }
  
  function resetAiState() {
      state.aiParamsApplied = false;
      state.beforeAiStaff = null;
      state.beforeAiPnl = { unit: null, total: null, hq: null };
      state.beforeAiRawValues.clear();
      clearAiHighlightsAndDefaults();
      dom.aiParamsBtn.textContent = '🤖 AI 추천 파라미터 적용';
      state.aiParams.staffing_reasoning = "";
  }

  function revertAiParameters() {
    state.beforeAiRawValues.forEach((value, key) => {
        const inputEl = dom.pl[key as keyof typeof dom.pl];
        if (inputEl && 'value' in inputEl) {
            (inputEl as HTMLInputElement).value = value;
        }
    });
    resetAiState();
    updateAllUI();
  }

  // --- MAPPING & CALCULATION LOGIC ---
  function mapSliderToStoreCount(sliderValue: number) {
    const val = sliderValue;
    if (val <= 100) {
        return Math.round((10 + (val / 100) * 90) / 10) * 10;
    } else if (val <= 300) {
        const progress = (val - 100) / 200;
        return Math.round((100 + progress * 900) / 50) * 50;
    } else {
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
      const tier = state.aiParams.cogsDiscountTiers.slice().reverse().find(t => storeCount >= t.threshold);
      return tier ? tier.discount : 0;
  }
  function calculateCapexDiscount(storeCount: number) {
      const tier = state.aiParams.capexDiscountTiers.slice().reverse().find(t => storeCount >= t.threshold);
      return tier ? tier.discount : 0;
  }
  function getEffectiveUnitCapex(level: 'A' | 'B' | 'C') {
      const useCustom = dom.pl.useCustomCapex.checked && window.ops.capexFromEquip > 0;
      if (useCustom) return window.ops.capexFromEquip;
      const baseCapex = automationLevels[level].unitCapex;
      const discount = calculateCapexDiscount(state.storeCount);
      return baseCapex * (1 - discount);
  }
  function calculateCorporateStaff(storeCount: number, forceFallback = false) {
    if (state.aiParamsApplied && !forceFallback) {
        const ratios = state.aiParams.staffingRatios;
        const corporate = Math.max(1, Math.ceil(storeCount / 100 * ratios.corporate));
        const cs = Math.max(1, Math.ceil(storeCount / 100 * ratios.cs));
        const platform = Math.max(1, Math.ceil(storeCount / 100 * ratios.platform));
        const technical = Math.max(1, Math.ceil(storeCount / 100 * ratios.technical));
        const level = getAutomationLevel(storeCount);
        const monitoring = level === 'A' ? Math.max(1, Math.ceil(storeCount / 100 * ratios.monitoring)) : 0;
        return { corporate, cs, platform, technical, monitoring, total: corporate + cs + platform + technical + monitoring };
    }
    
    // FIX: Replaced flawed, unrealistic default ratios with a more scalable and logical model.
    const level = getAutomationLevel(storeCount);
    const corporate = Math.max(1, Math.ceil(storeCount / 100)); // 1 per 100 stores for planning
    const cs = Math.max(1, Math.ceil(storeCount / 50)); // 1 per 50 stores
    const platform = Math.max(1, Math.ceil(storeCount / 75)); // 1 per 75 stores
    const technical = Math.max(1, Math.ceil(storeCount / 75)); // 1 per 75 stores
    // FIX: Replaced absurdly high 1/1500 ratio with a realistic 1/100 ratio.
    const monitoring = level === 'A' ? Math.max(1, Math.ceil(storeCount / 100)) : 0;
    return { corporate, cs, platform, technical, monitoring, total: corporate + cs + platform + technical + monitoring };
  }
  function calculateRegionalStaff(storeCount: number, forceFallback = false) {
      if (storeCount < 50) {
          return { hubManagers: 0, techSupport: 0, total: 0 };
      }
      const regionalCenters = Math.floor(storeCount / STORES_PER_REGIONAL_CENTER);
      const hubManagers = regionalCenters;
      const techSupport = Math.ceil(storeCount / 50) + hubManagers;
      return { hubManagers, techSupport, total: hubManagers + techSupport };
  }
  function calculateAllStaff(storeCount: number, baseInputs: any, level: 'A' | 'B' | 'C', forceFallback = false) {
      const centerDirector = 1; // FIX: Renamed from hqDirector for clarity
      const corporate = calculateCorporateStaff(storeCount, forceFallback);
      const regional = calculateRegionalStaff(storeCount, forceFallback);
      const washing = calculateWashingLaborCost(storeCount, baseInputs, level);
      const patrol = calculatePatrolLaborCost(storeCount, baseInputs, level);
      const total = centerDirector + corporate.total + regional.total + washing.staffCount + patrol.staffCount;
      return { centerDirector, corporate, regional, washing, patrol, total };
  }
  function calculateTotalCentralWages(allStaffData: any) {
      const s = state.aiParams.centerStaffSalaries;
      const directorWage = s.head;
      const corporateWage = s.corporate * (allStaffData.corporate?.corporate ?? 0) +
                          s.cs * (allStaffData.corporate?.cs ?? 0) +
                          s.platform * (allStaffData.corporate?.platform ?? 0) +
                          s.techSupport * (allStaffData.corporate?.technical ?? 0) +
                          s.monitoring * (allStaffData.corporate?.monitoring ?? 0);
      const regionalWage = s.techSupport * (allStaffData.regional?.total ?? 0);

      const totalMonthly = directorWage + corporateWage + regionalWage;
      return { total: totalMonthly };
  }
  function calculateTotalHqCapex(storeCount: number, allStaff: any) {
      const factors = state.aiParams.capexFactors;
      const hqBase = factors.hqCapexTiers.slice().reverse().find(t => storeCount >= t.threshold)?.cost || 0;
      const regionalCount = Math.floor(storeCount / STORES_PER_REGIONAL_CENTER);
      const regionalTotal = regionalCount * factors.regionalCenterBaseCapex;
      
      const totalStaffForCapex = allStaff.total;
      const perEmployeeTotal = totalStaffForCapex * factors.perEmployeeCapex;
      
      const total = hqBase + regionalTotal + perEmployeeTotal;
      return { total, hqBase, regionalTotal, perEmployeeTotal, regionalCount, hqStaffCount: totalStaffForCapex };
  }
  function calculateWashingLaborCost(storeCount: number, baseInputs: any, level: 'A' | 'B' | 'C') {
      if (level !== 'A' || !baseInputs.washingStores || baseInputs.washingStores <= 0) {
          return { totalCost: 0, staffCount: 0 };
      }
      const staffCount = Math.ceil(storeCount / baseInputs.washingStores);
      const monthlyWagePerPerson = baseInputs.baseWage * baseInputs.washingWage * baseInputs.hours * baseInputs.days;
      const totalCost = staffCount * monthlyWagePerPerson;
      return { totalCost, staffCount };
  }
  function calculatePatrolLaborCost(storeCount: number, baseInputs: any, level: 'A' | 'B' | 'C') {
      if (level === 'C' || !baseInputs.patrolStores || baseInputs.patrolStores <= 0) {
          return { totalCost: 0, staffCount: 0 };
      }
      const staffCount = Math.ceil(storeCount / baseInputs.patrolStores);
      const monthlyWagePerPerson = baseInputs.baseWage * baseInputs.patrolWage * baseInputs.hours * baseInputs.days;
      const totalCost = staffCount * monthlyWagePerPerson;
      return { totalCost, staffCount };
  }
  function calculateTotalRentalCost() {
    return window.ops.equip.reduce((total, item) => {
        if (item.isRental && item.rentMonthly) {
            return total + (item.rentMonthly * (item.qty || 0));
        }
        return total;
    }, 0);
  }
  function calculateAndDisplaySopFry() {
    const fryTimeMin = parseFormattedNumber(dom.sop.fryTimeMin.value);
    const dripTimeSec = parseFormattedNumber(dom.sop.dripTimeSec.value);
    const transferTimeSec = parseFormattedNumber(dom.sop.transferTimeSec.value);
    const safetyBufferPct = parseFormattedNumber(dom.sop.safetyBufferPct.value);
    const cycleTimeMin = fryTimeMin + (dripTimeSec + transferTimeSec) / 60;
    const perFryerCapacityH = cycleTimeMin > 0 ? 60 / cycleTimeMin : 0;
    const bufferedCapacityH = perFryerCapacityH * (1 - safetyBufferPct);
    dom.sop.formulaDisplay.innerHTML = `(${fryTimeMin.toFixed(1)}분 + ${dripTimeSec}초/60 + ${transferTimeSec}초/60) = <b>${cycleTimeMin.toFixed(1)}분</b>`;
    dom.sop.cycleTime.textContent = `${cycleTimeMin.toFixed(1)} 분`;
    dom.sop.capacityH.textContent = `${perFryerCapacityH.toFixed(1)} 마리/시간`;
    dom.sop.bufferedCapacityH.textContent = `${bufferedCapacityH.toFixed(1)} 마리/시간`;
    calculateAndDisplayCapacityPlan();
  }
  function calculateAndDisplayCapacityPlan() {
    const targetRev = parseFormattedNumber(dom.capacityPlan.targetRev.value);
    const aov = parseFormattedNumber(dom.pl.aov.value);
    const days = parseFormattedNumber(dom.capacityPlan.days.value);
    const peakShare = parseFormattedNumber(dom.capacityPlan.peakShare.value);
    const peakWindow = parseFormattedNumber(dom.capacityPlan.peakWindow.value);
    const slotsPerDevice = parseFormattedNumber(dom.capacityPlan.fryerType.value);
    const bufferedCapacityText = dom.sop.bufferedCapacityH.textContent || '0';
    const bufferedCapacityH = parseFloat(bufferedCapacityText);
    dom.capacityPlan.aov.value = formatNumber(aov);
    dom.capacityPlan.refCapacity.textContent = `${!isNaN(bufferedCapacityH) ? bufferedCapacityH.toFixed(1) : '-'} 마리/시간`;
    const requiredUnitsDay = (aov > 0 && days > 0) ? targetRev / aov / days : 0;
    const ordersPerHourPeak = (peakWindow > 0) ? (requiredUnitsDay * peakShare) / peakWindow : 0;
    const fryerSlotsNeededRaw = (bufferedCapacityH > 0) ? ordersPerHourPeak / bufferedCapacityH : 0;
    const fryerSlots = Math.ceil(fryerSlotsNeededRaw);
    const fryerDevices = (slotsPerDevice > 0) ? Math.ceil(fryerSlots / slotsPerDevice) : 0;

    window.ops.fryerSlots = fryerSlots;
    window.ops.deviceCount = fryerDevices;
    window.ops.ordersPerHourPeak = ordersPerHourPeak;
    
    dom.capacityPlan.reqUnitsDay.textContent = `${requiredUnitsDay.toFixed(1)} 마리/일`;
    dom.capacityPlan.peakOrdersH.textContent = `${ordersPerHourPeak.toFixed(1)} 마리/시간`;
    dom.capacityPlan.fryerSlotsNeeded.textContent = `${fryerSlots} 개`;
    dom.capacityPlan.fryerDevicesNeeded.textContent = `${fryerDevices} 대`;
    dom.sop.refFryers.textContent = `${fryerDevices} 대`;
    
    const level = getAutomationLevel(state.storeCount);
    const presetKit = getPresetKitByLevel(level, fryerSlots);
    window.ops.equip = presetKit;
    window.ops.capexFromEquip = window.sumCapex(presetKit);
    
    dom.capacityPlan.recoDevices.textContent = `${fryerDevices} 대`;
    dom.capacityPlan.totalCapex.textContent = KRW(window.ops.capexFromEquip);
    dom.capacityPlan.warningBanner.style.display = (fryerDevices < 2 && ordersPerHourPeak > 15) ? 'block' : 'none';
    
    calculateAndDisplayPeakStaffing();
    calculateAndDisplayCenterOps();
  }
  function runAndDisplayDiagnosis() { /* ... */ }
  function calculateAndDisplayFullDiagnosis() { /* ... */ }
  function calculateAndDisplayPeakStaffing(useOwnedSlotsForDiagnosis = false) {
    const level = getAutomationLevel(state.storeCount);
    if (level === 'A') {
        dom.staffingPeak.outFryOps.textContent = `0 명`;
        dom.staffingPeak.outPackers.textContent = `0 명`;
        dom.staffingPeak.outRunner.textContent = `0 명`;
        dom.staffingPeak.outTotal.textContent = `0 명`;
        dom.staffingPeak.schedule.innerHTML = `<div class="k">Level A는 완전 무인화 운영으로, 영업 시간 내 상주 인력이 필요하지 않습니다.<br>(관제센터에서 원격 관리)</div>`;
        window.ops.crewPeak = 0;
        return;
    }

    const maxFryerSlots = parseFormattedNumber(dom.staffingPeak.maxFryers.value);
    const loadUnloadSec = parseFormattedNumber(dom.staffingPeak.loadUnloadSec.value);
    const sauceSec = parseFormattedNumber(dom.staffingPeak.sauceSec.value);
    const packSec = parseFormattedNumber(dom.staffingPeak.packSec.value);
    const runnerSec = parseFormattedNumber(dom.staffingPeak.runnerSec.value);
    const fryerSlots = useOwnedSlotsForDiagnosis 
      ? parseFormattedNumber(dom.capacityPlan.diag.ownedFryerSlots.value)
      : window.ops.fryerSlots;
    const ordersPerHourPeak = window.ops.ordersPerHourPeak;
    
    dom.staffingPeak.refFryerSlots.textContent = `${fryerSlots} 개`;
    dom.staffingPeak.refPeakOrders.textContent = `${ordersPerHourPeak.toFixed(1)} 마리/시간`;
    const opTimePerOrderSec = loadUnloadSec;
    const opHoursRequired = (ordersPerHourPeak * opTimePerOrderSec) / 3600;
    const opHeadcountByTime = Math.ceil(opHoursRequired);
    const opHeadcountByConcurrency = (maxFryerSlots > 0) ? Math.ceil(fryerSlots / maxFryerSlots) : 0;
    const fryOperatorsPeak = (fryerSlots > 0) ? Math.max(1, opHeadcountByTime, opHeadcountByConcurrency) : 0;
    const totalPackTime = sauceSec + packSec;
    const packCapacityPerPersonH = (totalPackTime > 0) ? 3600 / totalPackTime : 0;
    const packersPeak = (packCapacityPerPersonH > 0) ? Math.ceil(ordersPerHourPeak / packCapacityPerPersonH) : 0;
    // FIX: The variable `runnerCapacityPerPersonH` was used without being defined. It is now calculated based on `runnerSec`.
    const runnerCapacityPerPersonH = (runnerSec > 0) ? 3600 / runnerSec : 0;
    const runnerNeeded = (runnerSec > 0 && runnerCapacityPerPersonH > 0) ? Math.ceil(ordersPerHourPeak / runnerCapacityPerPersonH) : 0;
    
    const crewPeak = fryOperatorsPeak + packersPeak;
    
    window.ops.crewPeak = crewPeak;
    
    dom.staffingPeak.outFryOps.textContent = `${fryOperatorsPeak} 명`;
    dom.staffingPeak.outPackers.textContent = `${packersPeak} 명`;
    dom.staffingPeak.outRunner.textContent = `${runnerNeeded} 명`;
    dom.staffingPeak.outTotal.textContent = `${crewPeak} 명`;
    const additionalStaff = crewPeak > 1 ? crewPeak - 1 : 0;
    dom.staffingPeak.schedule.textContent = `기본 상시 1명 + 피크(17:30~20:30) ${additionalStaff}명 증원. (러너 ${runnerNeeded}명은 필요 시 별도이며, 총 인원에 미포함)`;
  }
  function calculateAndDisplayCenterOps() {
    const stores = state.storeCount;
    const devices = window.ops.deviceCount;
    const slots = window.ops.fryerSlots;
    const crew = window.ops.crewPeak;
    
    dom.centerOps.refStores.textContent = `${stores} 개`;
    dom.centerOps.refDevices.textContent = `${devices} 대`;
    dom.centerOps.refSlots.textContent = `${slots} 개`;
    dom.centerOps.refCrew.textContent = `${crew} 명`;
    
    const patrolMin = parseFormattedNumber(dom.centerOps.patrolMin.value);
    const cleanMin = parseFormattedNumber(dom.centerOps.storeCleanMin.value);
    const qaMin = parseFormattedNumber(dom.centerOps.qaMin.value);
    
    const totalPatrolMin = patrolMin * stores;
    const totalCleanMin = cleanMin * stores;
    const totalQaMin = qaMin * stores;
    
    const totalMin = totalPatrolMin + totalCleanMin + totalQaMin;
    const fte = (totalMin / 60) / 9;
    
    dom.centerOps.outTotalMin.textContent = `${formatNumber(totalMin)} 분`;
    dom.centerOps.outFTE.textContent = `${fte.toFixed(1)} 명`;

    const modalFteDisplay = document.getElementById('modal_center_fte_display');
    if (modalFteDisplay) {
      modalFteDisplay.textContent = `${fte.toFixed(1)} 명`;
    }

    if (dom.centerOps.useDetailedCenterOps) {
        dom.centerOps.centerFTE = fte;
    }
  }
  function calcPNL(storeCount: number, baseInputs: any) {
      const level = getAutomationLevel(storeCount);
      const allStaff = calculateAllStaff(storeCount, baseInputs, level);
      const centralSupportWages = calculateTotalCentralWages(allStaff);
      const washingLabor = calculateWashingLaborCost(storeCount, baseInputs, level);
      const patrolLabor = calculatePatrolLaborCost(storeCount, baseInputs, level);
      const rentalCost = calculateTotalRentalCost();
      const monthlyRev = baseInputs.aov * baseInputs.unitsDay * baseInputs.days;
      const cogsDiscount = state.aiParamsApplied ? calculateCogsDiscount(storeCount) : 0;
      const rawMaterialCost = baseInputs.rawMeat + baseInputs.procCost + baseInputs.pkgCost + baseInputs.serviceCost;
      const effectiveCogs = rawMaterialCost * (1 - cogsDiscount);
      const cogsAbs = effectiveCogs * baseInputs.unitsDay * baseInputs.days;
      const cogsRatio = monthlyRev > 0 ? cogsAbs / monthlyRev : 0;
      const pfAbs = monthlyRev * baseInputs.pf;
      const utilAbs = monthlyRev * baseInputs.utilRate;
      const threePlAbs = cogsAbs * baseInputs.threePlRate;
      const varCost = cogsAbs + pfAbs + utilAbs + threePlAbs;
      const cm = monthlyRev - varCost;
      const baseLaborCost = baseInputs.baseWage * baseInputs.wageMultiplier * baseInputs.hours * baseInputs.days;
      const automationSavings = (level !== 'C') ? baseInputs.bSavings : 0;
      const laborCost = Math.max(0, (baseLaborCost * automationLevels[level].baseFTE) - automationSavings);
      
      const hqOverhead = {
        rent: parseFormattedNumber(dom.hq_pnl.rent.value),
        util: parseFormattedNumber(dom.hq_pnl.util.value),
        saas: parseFormattedNumber(dom.hq_pnl.saas.value),
      };
      const totalMonthlyHqOverhead = hqOverhead.rent + hqOverhead.util + hqOverhead.saas;
      
      const totalMonthlyCentralWages = centralSupportWages.total + washingLabor.totalCost + patrolLabor.totalCost;
      const totalDistributableCenterCost = totalMonthlyCentralWages + totalMonthlyHqOverhead;
      const centerStoreCost = storeCount > 0 ? totalDistributableCenterCost / storeCount : 0;
      
      const fixedCost = laborCost + baseInputs.rent + baseInputs.saas + centerStoreCost + rentalCost;
      const ebitda = cm - fixedCost;
      const margin = monthlyRev > 0 ? ebitda / monthlyRev : 0;
      const unitCapex = getEffectiveUnitCapex(level);
      const payback = (ebitda > 0) ? unitCapex / ebitda : Infinity;
      const bepCmRatio = cm > 0 ? fixedCost / cm : 0;
      const bepUnits = isFinite(bepCmRatio) ? bepCmRatio * (baseInputs.unitsDay * baseInputs.days) / baseInputs.days : Infinity;
      return {
          monthlyRev, cogsAbs, cogsRatio, pfAbs, utilAbs, threePlAbs, varCost, cm,
          laborCost, rent: baseInputs.rent, saas: baseInputs.saas, centerStoreCost, fixedCost, rentalCost,
          ebitda, margin, payback, bepUnits, unitCapex,
          allStaff, centralSupportWages, washingLabor, patrolLabor, hqOverhead,
      };
  }
  function calculateFixed10CScenario() {
    const fixedInputs = { ...getCurrentBaseInputs() };
    fixedInputs.aov = 22900;
    fixedInputs.unitsDay = 80;
    fixedInputs.patrolStores = 0;
    fixedInputs.washingStores = 0;
    fixedInputs.bSavings = 0;
    return calcPNL(10, fixedInputs);
  }
  function getCurrentBaseInputs() {
    return {
        aov: gv('aov'),
        unitsDay: gv('unitsDay'),
        rawMeat: gv('rawMeat'),
        procCost: gv('procCost'),
        pkgCost: gv('pkgCost'),
        serviceCost: gv('serviceCost'),
        pf: gv('pf'),
        rent: gv('rent'),
        utilRate: gv('utilRate'),
        saas: gv('saas'),
        hours: gv('hours'),
        baseWage: gv('baseWage'),
        wageMultiplier: gv('wageMultiplier'),
        days: gv('days'),
        threePlRate: gv('threePlRate'),
        bSavings: gv('bSavings'),
        patrolStores: gv('patrolStores'),
        patrolWage: gv('patrolWage'),
        washingStores: gv('washingStores'),
        washingWage: gv('washingWage'),
    };
  }
  function updateSummaryUI(storeCount: number, level: 'A' | 'B' | 'C') {
    if (dom.headerStage) {
        dom.headerStage.innerHTML = `Level ${level} 매장 ${formatNumber(storeCount)}개 + 관제센터 1곳`;
    }
    dom.summaryStores.textContent = formatNumber(storeCount);
    dom.summaryLevel.textContent = `Level ${level}`;

    const unitCapex = getEffectiveUnitCapex(level);
    const discount = calculateCapexDiscount(storeCount);
    if (discount > 0) {
        dom.summaryCapex.innerHTML = `${KRW(unitCapex)} <span class="k" style="font-size:12px;">(${discount * 100}% 할인)</span>`;
    } else {
        dom.summaryCapex.textContent = KRW(unitCapex);
    }
  }
  
  function formatStaffingReasoning(text: string): string {
    if (!text) return '';

    // The AI might return markdown-like bolding with **. Convert it to <b> tags first.
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    let conclusion = '';
    const conclusionKeyword = '결론적으로';
    const conclusionIndex = formattedText.indexOf(conclusionKeyword);
    if (conclusionIndex > -1) {
        conclusion = formattedText.substring(conclusionIndex);
        formattedText = formattedText.substring(0, conclusionIndex);
    }
    
    // Split the text into an intro and a list of numbered points.
    // The regex looks for a number followed by a dot and a space, which marks the start of a list item.
    // The positive lookahead `(?=...)` splits the string *before* the pattern, keeping the pattern in the next element.
    const parts = formattedText.split(/\s*(?=\d+\.\s+<b>)/);

    // The first part is the introduction.
    const intro = parts.shift() || ''; 
    
    // If no numbered points are found, we just format with paragraphs.
    if (parts.length === 0) {
        let result = '';
        if (intro.trim()) result += `<p>${intro.trim()}</p>`;
        if (conclusion.trim()) result += `<p>${conclusion.trim()}</p>`;
        return result;
    }

    // Each subsequent part is a list item.
    const listItems = parts.map(part => {
        // Remove the number and dot from the beginning for the list item content.
        const content = part.replace(/^\d+\.\s+/, '');
        return `<li>${content.trim()}</li>`;
    }).join('');

    // Assemble the final HTML.
    let finalHtml = '';
    if (intro.trim()) finalHtml += `<p>${intro.trim()}</p>`;
    finalHtml += `<ul>${listItems}</ul>`;
    if (conclusion.trim()) finalHtml += `<p>${conclusion.trim()}</p>`;
    
    return finalHtml;
  }

  function updateConclusionUI(storeCount: number, level: 'A' | 'B' | 'C', allStaff: any) {
    const levelColors = {
        C: 'var(--orange)',
        B: 'var(--blue)',
        A: 'var(--red)'
    };
    const color = levelColors[level] || 'var(--sky)';

    dom.conclusionProposal.innerHTML = `${formatNumber(storeCount)}개 <span style="color:${color};">Level ${level}</span>`;
    
    let staffText = `본사/거점 총원: ${formatNumber(allStaff.total)}명`;
    if (state.aiParamsApplied && state.beforeAiStaff) {
        staffText += ` <span class="k">(기본: ${formatNumber(state.beforeAiStaff.total)}명)</span>`;
    }
    dom.conclusionStaff.innerHTML = staffText;
    
    const corp = allStaff.corporate;
    const totalHqStaff = allStaff.centerDirector + corp.total; // FIX: Use centerDirector
    const staffDetails = [
      // FIX: Changed '임원' to '센터장'
      `본사 ${totalHqStaff}명 (센터장 ${allStaff.centerDirector}, 경영/기획 ${corp.corporate}, CS ${corp.cs}, 플랫폼관리 ${corp.platform}, 기술지원 ${corp.technical}, 원격관제 ${corp.monitoring})`,
      `지역 거점 ${allStaff.regional?.total ?? 0}명 (지점장 ${allStaff.regional?.hubManagers ?? 0}, 기술지원 ${allStaff.regional?.techSupport ?? 0})`,
      `중앙 세척/소분 ${allStaff.washing?.staffCount ?? 0}명`,
      `순회 관리 ${allStaff.patrol?.staffCount ?? 0}명`,
    ].filter(s => !s.includes(' 0명'));

    const staffBreakdown = `<b>주석</b> — 총원 ${allStaff.total}명 구성: ${staffDetails.join(', ')}.`;
    
    // FIX: This logic ensures the AI justification note is correctly appended without being overwritten.
    dom.conclusionStaffNote.innerHTML = staffBreakdown.replace(/\s+/g, ' ').trim();
    if (state.aiParamsApplied && state.aiParams.staffing_reasoning) {
        const formattedReasoning = formatStaffingReasoning(state.aiParams.staffing_reasoning);
        const staffJustification = `<b>AI 추천 근거 (본사/거점 인력):</b>${formattedReasoning}`;
        dom.conclusionStaffNote.insertAdjacentHTML('beforeend', `<div class="ai-reasoning-note" style="margin-top:10px;">${staffJustification}</div>`);
    }
  }
  function updateCapexUI(storeCount: number, level: 'A' | 'B' | 'C', allStaff: any) {
      const unitCapex = getEffectiveUnitCapex(level);
      const baseCapex = automationLevels[level].unitCapex;
      const discount = calculateCapexDiscount(storeCount);
      const storesTotalCapex = unitCapex * storeCount;
      const hqCapexData = calculateTotalHqCapex(storeCount, allStaff);
      const subtotal = storesTotalCapex + hqCapexData.total;
      const contingency = subtotal * 0.05;
      const totalPackageCapex = subtotal + contingency;
  
      dom.capexTitle.innerHTML = `② ${formatNumber(storeCount)}개 매장 패키지 예산 (CAPEX) <span class="pill">Sky Light</span>`;

      if (discount > 0) {
          dom.capexUnit.innerHTML = `${KRW(unitCapex)} <span class="k">(기본 ${KRW(baseCapex)}에서 ${discount * 100}% 할인 적용)</span>`;
      } else {
          dom.capexUnit.textContent = KRW(unitCapex);
      }
      
      dom.capexStoresTotal.textContent = KRW(storesTotalCapex);
      dom.capexStoresCalc.textContent = `${formatNumber(storeCount)} × ${KRW(unitCapex, false).slice(0, -2)}M`;
      
      dom.capexHqBase.textContent = KRW(hqCapexData.hqBase);
      dom.capexHqDesc.textContent = `(${formatNumber(storeCount)}개 매장 규모)`;
      
      dom.capexRegionalHubs.textContent = KRW(hqCapexData.regionalTotal);
      dom.capexRegionalDesc.textContent = `${hqCapexData.regionalCount}개 지점 × ₩30M`;
      
      dom.capexPerEmployee.textContent = KRW(hqCapexData.perEmployeeTotal);
      dom.capexEmployeeDesc.textContent = `${hqCapexData.hqStaffCount}명 (전체 인력) × ₩3M`;
      
      dom.capexSubtotal.textContent = KRW(subtotal);
      dom.capexContingency.textContent = KRW(contingency);
      dom.capexTotal.textContent = KRW(totalPackageCapex);
      dom.decision.capex.textContent = KRW(totalPackageCapex);

      if (dom.capexNote) {
        dom.capexNote.innerHTML = `<b>주석</b> — <b>인력별 세팅비</b>는 본사, 거점, 현장(순회/세척) 등 모든 인력에게 적용됩니다. 현장 인력의 경우 차량 구매/리스 등의 초기 비용을 포함합니다.`;
      }
  }
  function updateOpexUI(pnl: any, level: 'A' | 'B' | 'C') {
    const baseInputs = getCurrentBaseInputs();
    const hourlyWage = gv('baseWage') * gv('wageMultiplier');
    const laborDesc = `${baseInputs.hours}h/일 × ${baseInputs.days}일 × ${KRW(hourlyWage, false)}원 × ${automationLevels[level].baseFTE}명`;
    dom.opexLaborDesc.textContent = laborDesc;
    dom.opexLaborCost.textContent = KRW(pnl.laborCost);
    dom.opexRentCost.textContent = KRW(pnl.rent);
    dom.opexSaasCost.textContent = KRW(pnl.saas);
    
    if (pnl.rentalCost > 0) {
        dom.opexRentalRow.style.display = '';
        dom.opexRentalCost.textContent = KRW(pnl.rentalCost);
    } else {
        dom.opexRentalRow.style.display = 'none';
        dom.opexRentalCost.textContent = '-';
    }

    let centerDesc = 'CS, 플랫폼 관리, 기술지원';
    if (level !== 'C') centerDesc += ', 순회 관리';
    if (level === 'A') centerDesc += ', 중앙 세척/소분';
    dom.opexCenterDesc.textContent = centerDesc;
    dom.opexCenterCost.textContent = KRW(pnl.centerStoreCost);
    const totalOpex = pnl.laborCost + pnl.rent + pnl.saas + pnl.centerStoreCost + pnl.rentalCost;
    dom.opexTotal.textContent = KRW(totalOpex);
  }
  function updateAssumptionsUI(level: 'A' | 'B' | 'C') {
    const isC = level === 'C';
    const isA = level === 'A';

    dom.assumptions.levelTitle.textContent = `물류 및 ${level}레벨 가정`;

    dom.pl.bSavings.disabled = isC;
    dom.assumptions.bSavingsContainer.style.opacity = isC ? '0.5' : '1';
    dom.assumptions.bLevelLabel.textContent = `${level}레벨`;

    dom.pl.patrolStores.disabled = isC;
    dom.pl.patrolWage.disabled = isC;
    dom.assumptions.patrolContainer.style.opacity = isC ? '0.5' : '1';
    dom.assumptions.patrolStoresLabel.textContent = `${level}레벨`;
    dom.assumptions.patrolWageLabel.textContent = `${level}레벨`;
    if (isC) {
        dom.pl.patrolStores.value = '---';
        dom.pl.patrolWage.value = '---';
    } else if (dom.pl.patrolStores.value === '---' || !parseFormattedNumber(dom.pl.patrolStores.value)) {
        dom.pl.patrolStores.value = isA ? '10' : '20';
        dom.pl.patrolWage.value = '1.5';
    }

    dom.pl.washingStores.disabled = !isA;
    dom.pl.washingWage.disabled = !isA;
    dom.assumptions.washingContainer.style.opacity = isA ? '1' : '0.5';
    dom.assumptions.washingStoresLabel.textContent = `${level}레벨`;
    dom.assumptions.washingWageLabel.textContent = `${level}레벨`;
    if (!isA) {
        dom.pl.washingStores.value = '---';
        dom.pl.washingWage.value = '---';
    } else if (dom.pl.washingStores.value === '---' || !parseFormattedNumber(dom.pl.washingStores.value)) {
        dom.pl.washingStores.value = '6';
        dom.pl.washingWage.value = '1.3';
    }
    
    dom.total_pnl.patrol_wage_row.style.display = isC ? 'none' : '';
    dom.hq_pnl.patrol_wage_row.style.display = isC ? 'none' : '';
    dom.total_pnl.washing_wage_row.style.display = isA ? '' : 'none';
    dom.hq_pnl.washing_wage_row.style.display = isA ? '' : 'none';

    const baseWage = parseFormattedNumber(dom.pl.baseWage.value);
    const multiplier = parseFormattedNumber(dom.pl.wageMultiplier.value);
    dom.pl.calcWage.value = formatNumber(baseWage * multiplier);
  }
  function updatePnlUI(pnl: any, inputs: any) {
    dom.pl_kpi.rev.textContent = KRW(pnl.monthlyRev);
    dom.pl_kpi.cogsRatio.textContent = `${(pnl.cogsRatio * 100).toFixed(1)}%`;
    dom.pl_kpi.var.textContent = KRW(pnl.varCost);
    dom.pl_kpi.fix.textContent = KRW(pnl.fixedCost);
    dom.pl_kpi.ebitda.textContent = KRW(pnl.ebitda);
    dom.pl_kpi.margin.textContent = `${(pnl.margin * 100).toFixed(1)}%`;
    dom.pl_kpi.bep.textContent = `${pnl.bepUnits.toFixed(1)} 건/일`;
    dom.pl_kpi.pay.textContent = isFinite(pnl.payback) ? `${pnl.payback.toFixed(1)} 개월` : '회수불가';

    dom.pl_t.rev.textContent = KRW(pnl.monthlyRev);
    dom.pl_t.cogsAbs.textContent = KRW(pnl.cogsAbs);
    dom.pl_t.cogsRatio.textContent = `매출의 ${(pnl.cogsRatio * 100).toFixed(1)}%`;
    dom.pl_t.pf.textContent = KRW(pnl.pfAbs);
    dom.pl_t.pfDesc.textContent = `= 매출 × ${(inputs.pf * 100).toFixed(1)}%`;
    dom.pl_t.util.textContent = KRW(pnl.utilAbs);
    dom.pl_t.utilDesc.textContent = `매출의 ${(inputs.utilRate * 100).toFixed(1)}%`;
    dom.pl_t.threePl.textContent = KRW(pnl.threePlAbs);
    dom.pl_t.threePlDesc.textContent = `매출원가(COGS)의 ${(inputs.threePlRate * 100).toFixed(1)}%`;
    dom.pl_t.cm.textContent = KRW(pnl.cm);
    dom.pl_t.labor.textContent = KRW(pnl.laborCost);
    const level = getAutomationLevel(state.storeCount);
    const hourlyWage = gv('baseWage') * gv('wageMultiplier');
    dom.pl_t.laborDesc.textContent = `${inputs.hours}h/일 × ${inputs.days}일 × ${KRW(hourlyWage, false)}원 × ${automationLevels[level].baseFTE}명`;
    dom.pl_t.rent.textContent = KRW(pnl.rent);
    dom.pl_t.saas.textContent = KRW(pnl.saas);

    if (pnl.rentalCost > 0) {
        dom.pl_t.rentalRow.style.display = '';
        dom.pl_t.rental.textContent = KRW(pnl.rentalCost);
    } else {
        dom.pl_t.rentalRow.style.display = 'none';
        dom.pl_t.rental.textContent = '-';
    }

    dom.pl_t.centerStore.textContent = KRW(pnl.centerStoreCost);
    dom.pl_t.centerStoreDesc.textContent = '본사 인건비+운영비 배분';
    dom.pl_t.ebitda.textContent = KRW(pnl.ebitda);
    dom.pl_t.margin.textContent = `마진 ${(pnl.margin * 100).toFixed(1)}%`;
    dom.pl_t.bep.textContent = `${pnl.bepUnits.toFixed(1)} 마리/일`;
    dom.pl_t.payback.textContent = isFinite(pnl.payback) ? `${pnl.payback.toFixed(1)} 개월` : '회수불가';
    
    drawDonut(pnl);
  }
  function drawDonut(pnl: any) {
    const data = {
        labels: ['인건비', '임대료', 'POS·SW', '센터 서비스', '플랫폼', '공과금', '3PL', '로봇 렌탈료'],
        values: [pnl.laborCost, pnl.rent, pnl.saas, pnl.centerStoreCost, pnl.pfAbs, pnl.utilAbs, pnl.threePlAbs, pnl.rentalCost],
        colors: ['#22c55e', '#a78bfa', '#f59e0b', '#2dd4bf', '#fb7185', '#38bdf8', '#818cf8', '#e879f9']
    };
    const canvas = dom.pl_donut.canvas;
    const legend = dom.pl_donut.legend;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const total = data.values.reduce((sum, value) => sum + (value || 0), 0);
    if (total <= 0) {
        legend.innerHTML = '<div style="color:var(--muted);text-align:center;">비용 데이터 없음</div>';
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.9;
    const innerRadius = radius * 0.6;
    let currentAngle = -Math.PI / 2;
    const var_line_color = '#1e2b3c';

    data.values.forEach((value, index) => {
        if (value <= 0) return;
        const sliceAngle = (value / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
        ctx.closePath();
        ctx.fillStyle = data.colors[index];
        ctx.fill();
        ctx.strokeStyle = var_line_color;
        ctx.lineWidth = 1;
        ctx.stroke();
        currentAngle += sliceAngle;
    });

    legend.innerHTML = '';
    data.labels.forEach((label, index) => {
        const value = data.values[index];
        if (value > 0) {
            const row = document.createElement('div');
            row.className = 'row';
            row.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;">
                    <span class="dot" style="background:${data.colors[index]}"></span>
                    <span>${label}</span>
                </div>
                <div style="color:var(--ink);font-weight:bold;">${KRW(value)}</div>`;
            legend.appendChild(row);
        }
    });
  }
  function updateTotalPackageResults(storeCount: number, level: 'A' | 'B' | 'C', pnl: any) {
    const totalAnnualRev = pnl.monthlyRev * storeCount * 12;
    const totalAnnualCogs = pnl.cogsAbs * storeCount * 12;
    const totalAnnualVar = pnl.varCost * storeCount * 12;
    const totalAnnualStoreFixed = (pnl.laborCost + pnl.rent + pnl.saas + pnl.rentalCost) * storeCount * 12;
    const totalMonthlyCentralWages = pnl.centralSupportWages.total + pnl.washingLabor.totalCost + pnl.patrolLabor.totalCost;
    const totalAnnualCentralWages = totalMonthlyCentralWages * 12;
    const totalAnnualFixed = totalAnnualStoreFixed + totalAnnualCentralWages;
    const totalAnnualEbitda = totalAnnualRev - totalAnnualVar - totalAnnualFixed;
    const totalCapexData = calculateTotalHqCapex(storeCount, pnl.allStaff);
    const totalPackageCapex = (pnl.unitCapex * storeCount) + totalCapexData.total;
    const totalPayback = (totalAnnualEbitda > 0) ? totalPackageCapex / totalAnnualEbitda : Infinity;

    const currentResults = {
        totalEbitda: totalAnnualEbitda,
        totalStaff: pnl.allStaff.total,
        cogsRatio: pnl.cogsRatio,
        pf: getCurrentBaseInputs().pf,
    };

    dom.total_pnl.rev.textContent = KRW(totalAnnualRev);
    dom.total_pnl.cogsRatio.textContent = `${(pnl.cogsRatio * 100).toFixed(1)}%`;
    dom.total_pnl.var.textContent = KRW(totalAnnualVar);
    dom.total_pnl.fix.textContent = KRW(totalAnnualFixed);
    dom.total_pnl.ebitda.textContent = KRW(totalAnnualEbitda);
    dom.total_pnl.pay.textContent = isFinite(totalPayback) ? `${totalPayback.toFixed(1)} 년` : '회수불가';

    dom.total_pnl.t_rev.textContent = KRW(totalAnnualRev);
    dom.total_pnl.t_cogs_abs.textContent = KRW(totalAnnualCogs);
    dom.total_pnl.t_cogs_ratio.textContent = `총 매출의 ${(pnl.cogsRatio * 100).toFixed(1)}%`;
    dom.total_pnl.t_var_etc.textContent = KRW(totalAnnualVar - totalAnnualCogs);
    dom.total_pnl.t_cm.textContent = KRW(totalAnnualRev - totalAnnualVar);
    dom.total_pnl.t_fix_store.textContent = KRW(totalAnnualStoreFixed);
    dom.total_pnl.t_center_wage.textContent = KRW(pnl.centralSupportWages.total * 12);
    dom.total_pnl.t_washing_wage.textContent = KRW(pnl.washingLabor.totalCost * 12);
    dom.total_pnl.t_patrol_wage.textContent = KRW(pnl.patrolLabor.totalCost * 12);
    dom.total_pnl.t_ebitda.textContent = KRW(totalAnnualEbitda);
    const totalMargin = totalAnnualRev > 0 ? totalAnnualEbitda / totalAnnualRev : 0;
    dom.total_pnl.t_margin.textContent = `마진 ${(totalMargin * 100).toFixed(1)}%`;
    dom.total_pnl.t_payback.textContent = isFinite(totalPayback) ? `${totalPayback.toFixed(1)} 년` : '회수불가';

    const hqPnl = calcHqPnl(level, totalAnnualCogs, pnl, totalCapexData.total);
    
    if (state.aiParamsApplied && state.beforeAiPnl.total) {
        const before = state.beforeAiPnl.total;
        const ebitdaChange = currentResults.totalEbitda - before.totalEbitda;
        const staffChange = currentResults.totalStaff - before.totalStaff;
        dom.total_pnl.note.innerHTML = `<div class="ai-reasoning-note"><b>AI 분석 요약:</b> AI 추천 파라미터 적용으로 <b>총괄 EBITDA가 ${KRW(ebitdaChange)}만큼 변동</b>되었습니다. 이는 주로 COGS 할인율 및 플랫폼 수수료 조정, 그리고 본사/거점 인력 ${staffChange > 0 ? `${staffChange}명 증원` : `${Math.abs(staffChange)}명 감축`}에 따른 결과입니다.</div>`;
    } else {
        dom.total_pnl.note.innerHTML = '';
    }
    
    return { hqPnlResults: hqPnl, totalPnlResults: currentResults };
  }
  function calcHqPnl(level: 'A' | 'B' | 'C', totalAnnualCogs: number, pnl: any, centerCapex: number) {
    const marginRate = parseFormattedNumber(dom.hq_pnl.marginRate.value);
    const hqRevenue = totalAnnualCogs * marginRate;

    const totalAnnualCentralWages = (pnl.centralSupportWages.total + pnl.washingLabor.totalCost + pnl.patrolLabor.totalCost) * 12;
    const totalAnnualHqOverhead = (pnl.hqOverhead.rent + pnl.hqOverhead.util + pnl.hqOverhead.saas) * 12;
    
    const hqEbitda = hqRevenue - totalAnnualCentralWages - totalAnnualHqOverhead;
    const hqPayback = (hqEbitda > 0) ? centerCapex / hqEbitda : Infinity;
    
    const currentResults = { hqEbitda };

    dom.hq_pnl.t_cogs.textContent = KRW(totalAnnualCogs);
    dom.hq_pnl.t_revenue.textContent = KRW(hqRevenue);
    dom.hq_pnl.t_revenue_desc.textContent = `총 공급가액 × ${marginRate * 100}%`;
    dom.hq_pnl.t_center_wage.textContent = KRW(pnl.centralSupportWages.total * 12);
    dom.hq_pnl.t_washing_wage.textContent = KRW(pnl.washingLabor.totalCost * 12);
    dom.hq_pnl.t_patrol_wage.textContent = KRW(pnl.patrolLabor.totalCost * 12);
    dom.hq_pnl.t_overhead.textContent = KRW(totalAnnualHqOverhead);
    dom.hq_pnl.t_ebitda.textContent = KRW(hqEbitda);
    dom.hq_pnl.t_payback.textContent = isFinite(hqPayback) ? `${hqPayback.toFixed(1)} 년` : '회수불가';

    if (state.aiParamsApplied && state.beforeAiPnl.hq) {
        const before = state.beforeAiPnl.hq;
        const ebitdaChange = currentResults.hqEbitda - before.hqEbitda;
        dom.hq_pnl.note.innerHTML = `<div class="ai-reasoning-note"><b>AI 분석 요약:</b> AI 추천 파라미터 적용으로 본사 인력 및 운영 비용이 조정되어, <b>본사 EBITDA가 ${KRW(ebitdaChange)}만큼 변동</b>되었습니다.</div>`;
    } else {
        dom.hq_pnl.note.innerHTML = '';
    }

    return currentResults;
  }
  function updateScenarioAnalysisUI(currentPnl: any) {
    const fixedPnl = calculateFixed10CScenario();
    const renderKpis = (pnl: any, prefix: 's' | 'f') => {
        dom.scenario[`${prefix}_rev`].textContent = KRW(pnl.monthlyRev);
        dom.scenario[`${prefix}_cogs_ratio`].textContent = `${(pnl.cogsRatio * 100).toFixed(1)}%`;
        dom.scenario[`${prefix}_var`].textContent = KRW(pnl.varCost);
        dom.scenario[`${prefix}_fix`].textContent = KRW(pnl.fixedCost);
        dom.scenario[`${prefix}_ebitda`].textContent = KRW(pnl.ebitda);
        dom.scenario[`${prefix}_margin`].textContent = `${(pnl.margin * 100).toFixed(1)}%`;
        dom.scenario[`${prefix}_pay`].textContent = isFinite(pnl.payback) ? `${pnl.payback.toFixed(1)} 개월` : '회수불가';
    };
    renderKpis(currentPnl, 's');
    renderKpis(fixedPnl, 'f');
  }
  function updateRoadmapUI() {
    const level = window.ops.level;
    const fryerSlots = window.ops.fryerSlots || parseFloat(dom.capacityPlan.fryerSlotsNeeded.textContent || '4');
    const list = window.ops.equip?.length ? window.ops.equip : getPresetKitByLevel(level, fryerSlots);
    
    // FIX: This was incorrectly applying the current store count's discount to all levels.
    // Now, it correctly shows the base, undiscounted CAPEX for each level.
    dom.roadmap.capex_c.innerHTML = `<b>창업원가(보증금5백만원 포함): ${KRW(automationLevels.C.unitCapex)}</b>`;
    dom.roadmap.capex_b.innerHTML = `<b>창업원가(보증금5백만원 포함): ${KRW(automationLevels.B.unitCapex)}</b>`;
    dom.roadmap.capex_a.innerHTML = `<b>창업원가(보증금5백만원 포함): ${KRW(automationLevels.A.unitCapex)}</b>`;
    
    document.querySelectorAll('.equip-list-container').forEach(c => (c as HTMLElement).innerHTML = '');

    const activeCard = dom.roadmap[`card_${level.toLowerCase() as 'a'|'b'|'c'}`];
    if (activeCard) {
      const container = activeCard.querySelector('.equip-list-container');
      if (container) {
          container.innerHTML = renderEquipTable({ items: list, readOnly: true });
      }
    }
  }
  function updateDecisionUI() {
    const totalCapex = parseFormattedNumber(dom.capexTotal.textContent || '0');
    dom.decision.capex.textContent = KRW(totalCapex);
  }
  function updateForceLevelButtons() {
    Object.values(dom.forceLevelButtons).forEach((btn: HTMLButtonElement) => btn.classList.remove('active'));
    const currentLevel = state.forcedLevel ? state.forcedLevel.toLowerCase() : 'auto';
    const activeBtn = dom.forceLevelButtons[currentLevel as keyof typeof dom.forceLevelButtons];
    if (activeBtn) activeBtn.classList.add('active');
  }
  
  async function fetchAiParameters() {
    const btn = dom.aiParamsBtn;
    if (state.aiParamsApplied) {
        revertAiParameters();
        return;
    }
    btn.disabled = true;
    btn.textContent = '🤖 AI 분석 중...';
    clearAiHighlightsAndDefaults();

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const storeCount = state.storeCount;
        const unitsDay = gv('unitsDay');
        const level = getAutomationLevel(storeCount);
        const defaultStaff = calculateAllStaff(storeCount, getCurrentBaseInputs(), level, true);
        const defaultCorp = defaultStaff.corporate;

        const prompt = `
당신은 대한민국 프랜차이즈 최고운영책임자(COO)이며, 다음 비즈니스 모델의 운영 효율성을 극대화하기 위한 파라미터를 분석합니다.

### **CRITICAL: 비즈니스 모델 상세 정보 (반드시 숙지하고 답변에 반영할 것)**
- **업종**: 배달 전문 치킨 프랜차이즈
- **규모**: **${formatNumber(storeCount)}개 매장**
- **매장 형태**: 10평(33m²) 내외의 소형 매장
- **상권**: **C급/D급 상권 (주택가 골목길 등 임대료가 저렴한 곳)**
- **주문량**: 매장당 하루 평균 ${unitsDay}건 (총 ${formatNumber(storeCount * unitsDay)}건)
- **핵심 특징 (가장 중요)**:
    1.  **초고효율 중앙 집중식 조리(CK)**: 닭은 공장에서 3번 반죽 후 1차 초벌 튀김까지 완료된 상태로 매장에 공급됩니다.
    2.  **매장 운영 극단적 간소화**: 매장에서는 4-5분 내외의 **2차 튀김만** 수행하고 소스를 바릅니다. 이는 전통적인 방식(매장에서 생닭을 염지, 반죽, 10~15분 튀김)에 비해 유류 사용량, 전력 소비, 인건비가 **획기적으로 절감**되는 혁신적인 구조입니다.

### **CRITICAL: 용어 정의 (반드시 준수할 것)**
- **procCost**: '매장가공 원가'. 2차 튀김 시 발생하는 유류/전력비와 **소스를 바르는 비용**을 포함합니다. CK 시스템의 효율성 때문에 **매우 낮은 수준**이어야 합니다. 기본값은 700원이며, 소스 비용을 감안하여 소폭 조정될 수 있습니다.
- **serviceCost**: '사이드메뉴 원가'. 떡볶이, 치즈볼 등 사이드메뉴 자체의 **순수 재료비**입니다. **CRITICAL: 배달비나 판매가가 절대 아닙니다. 당신의 제안은 현실적인 재료비여야 합니다.** 평균 판매가는 5,500원이며, 재료 원가는 이보다 훨씬 낮아야 합니다.
- **pf**: '플랫폼 수수료 (0~1)'. **매출 대비 비율(%)**입니다. 배달앱 수수료, 광고비, 배달 대행료 등 **모든 플랫폼 관련 비용을 포함**한 총체적인 비율입니다.
- **utilRate**: '매출 대비 공과금 비율 (0~1)'. **매출에 비례**하여 증가하는 전기, 가스, 수도, 소모품 비용의 비율입니다. **임대료와는 완전히 무관합니다.**
- **threePlRate**: 'COGS 대비 3PL 비율(0~1)'. 중앙 공장에서 각 매장으로 초벌 닭을 배송하는 **단순 택배/운송 비용**의 비율입니다. COGS의 **1~5% (0.01~0.05)** 사이가 현실적인 범위이며, **0.8(80%)과 같은 값은 비즈니스 모델을 파괴하는 비현실적인 수치이므로 절대 제안해서는 안 됩니다.**
- **wageMultiplier**: '책정 시급 승수'. 기본 시급 대비 본사/관제 인력의 시급 프리미엄을 나타내는 **배수(e.g., 1.2)** 입니다. **절대적인 급여액(e.g., 2800000)이 아닙니다.**
- **washingStores**: '중앙 세척/소분 인력 1인당 담당 매장 수 (A레벨)'. 이 인력은 매장을 순회하며 (1) 매장 전체 청소, (2) 튀김기 오일 교체, (3) 튀김기 내부 딥클리닝 등 전문적인 위생 관리를 수행합니다. **1개 매장을 청소하는 데 최소 1시간이 소요된다고 가정**해야 합니다. 따라서 9시간 근무 기준, 1명의 인력이 하루에 처리할 수 있는 매장 수는 **최대 8개를 넘기 어렵습니다.** 당신의 제안은 이 현실적인 제약 조건을 반드시 반영해야 하며, 기본값(6)에서 크게 벗어나지 않는 선에서 타당한 근거를 제시해야 합니다. 30과 같은 비현실적인 숫자는 절대 제안해서는 안 됩니다.
- **monitoring**: '원격관제 인력'. Level A에서만 필요하며, 다수의 매장을 원격으로 모니터링하고 AI가 감지한 이상 신호(장비 오류, 보안 문제 등)에 대응하는 역할입니다. 1명의 인력이 현실적으로 관리할 수 있는 매장 수는 **100개를 초과하기 어렵습니다.** 당신의 제안은 이 제약 조건을 반드시 반영해야 합니다.

### **CRITICAL: 현재 기본 인력 모델 (심각한 검토 필요)**
현재 시뮬레이터의 기본값은 비현실적인 단순 비율 계산에 따라 다음과 같이 설정되어 있습니다:
- CS: ${defaultCorp.cs}명 (1인당 약 ${Math.round(storeCount / (defaultCorp.cs || 1))}개 매장 담당)
- 플랫폼 관리: ${defaultCorp.platform}명
- 기술 지원: ${defaultCorp.technical}명
- 경영/기획: ${defaultCorp.corporate}명
- 원격 관제 (Level A): ${defaultCorp.monitoring}명
이 인력 구성은 총 ${formatNumber(storeCount * unitsDay)}건의 일일 주문량을 감당하기에 **절대적으로 불가능**합니다. 당신의 최우선 임무는 이를 바로잡는 것입니다.

### **CRITICAL: 지시사항 (반드시 100% 따를 것)**

1.  **중앙 관제 인력 모델 상세 근거 제시 (최우선 과제):**
    가장 중요한 임무는 현실적인 인력 모델을 구축하는 것입니다. **반드시 역할별(CS, 플랫폼관리, 기술지원, 경영/기획, 원격관제)로 상세한 분석을 제공**하여 당신의 제안을 정당화해야 합니다. 각 역할에 대해 다음을 수행하세요:
    a.  **현재 워크로드 명시**: "${storeCount}개 매장, 총 일일 주문량 ${formatNumber(storeCount * unitsDay)}건"이라는 현재의 운영 규모를 명확히 인지하고 분석에 반영해야 합니다.
    b.  **기존 모델의 문제점 지적**: "기존 CS 인력 기본값인 ${defaultCorp.cs}명은 1인당 과도한 업무량을 유발하므로 절대적으로 부족합니다." 와 같이 비현실적인 기본 설정을 먼저 언급해야 합니다.
    c.  **워크로드 기반의 논리적 근거 제시**: 당신이 제안하는 새로운 인원 수에 대한 **업무량 기반의 명확한 근거**를 제시해야 합니다. 예를 들어, "CS의 경우, 일일 주문량 ${formatNumber(storeCount * unitsDay)}건을 기준으로 약 X%의 고객 문의가 발생한다고 가정하면, 하루에 약 Y건의 상호작용이 예상됩니다. CS 담당자 1명이 하루에 Z건의 상호작용을 효율적으로 처리할 수 있으므로, 총 A명의 인력이 필요합니다." 와 같이 구체적인 논리를 펼쳐야 합니다.
    d.  **최종 결론**: 당신의 최종 \`staffingJustification\`은 경영진이 납득할 수 있는, **매우 상세하고 설득력 있는 텍스트**여야 합니다. 일반적이거나 모호한 답변은 허용되지 않습니다.

2.  **운영 비용 파라미터 제안**:
    위에 제시된 **비즈니스 모델과 용어 정의를 반드시, 그리고 엄격하게 준수**하여 현실적인 값을 제안하세요. **임대료(rent)는 C급 상권 기준 월 100만원을 초과하지 않도록** 설정해야 합니다.

JSON 스키마에 따라 답변하고, 각 값에 대한 **구체적이고 현실적인 추론 근거**를 반드시 포함해주세요.
`;
        
        const schema = {
            type: Type.OBJECT,
            properties: {
                parameters: {
                    type: Type.ARRAY,
                    description: "운영 비용 파라미터 리스트",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            key: { type: Type.STRING, description: "파라미터 키 (procCost, pkgCost, serviceCost, pf, rent, utilRate, wageMultiplier, threePlRate, bSavings, patrolStores, washingStores 중 하나)" },
                            value: { type: Type.NUMBER, description: "파라미터 값" },
                            reasoning: { type: Type.STRING, description: "값 추정에 대한 간략한 근거" },
                        },
                        required: ["key", "value", "reasoning"],
                    },
                },
                staffingRatios: {
                    type: Type.ARRAY,
                    description: "본사 및 관제 인력 비율 제안",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            key: { type: Type.STRING, description: "'corporate', 'cs', 'platform', 'technical', 'monitoring' 중 하나"},
                            value: { type: Type.NUMBER, description: "100개 매장당 필요 인원 수" },
                        },
                        required: ["key", "value"]
                    }
                },
                staffingJustification: {
                    type: Type.STRING,
                    description: "제안된 인력 구성 모델이 기본 모델보다 더 타당한 이유에 대한 상세한 설명."
                }
            },
            required: ["parameters", "staffingRatios", "staffingJustification"],
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const result = JSON.parse(response.text);
        const parameters: AiPnlParameter[] = result.parameters;
        const staffingRatios: {key: string, value: number}[] = result.staffingRatios;
        const staffReasoning: string = result.staffingJustification;

        if (!state.aiParamsApplied) {
            const currentInputs = getCurrentBaseInputs();
            const level = getAutomationLevel(state.storeCount);
            state.beforeAiStaff = calculateAllStaff(state.storeCount, currentInputs, level, true);
            
            const pnlBefore = calcPNL(state.storeCount, currentInputs);
            const { hqPnlResults: hqPnlBefore, totalPnlResults: totalPnlBefore } = updateTotalPackageResults(state.storeCount, level, pnlBefore);
            state.beforeAiPnl.total = totalPnlBefore;
            state.beforeAiPnl.hq = hqPnlBefore;


            state.beforeAiRawValues.clear();
            Object.keys(currentInputs).forEach(keyStr => {
                const key = keyStr as keyof typeof dom.pl;
                const inputEl = dom.pl[key];
                if(inputEl && 'value' in inputEl) {
                    state.beforeAiRawValues.set(key, (inputEl as HTMLInputElement).value);
                }
            });
        }

        const keyMap: { [key in PnlParameterKey]?: keyof typeof dom.pl } = {
          pf: 'pf', rent: 'rent', utilRate: 'utilRate', bSavings: 'bSavings',
          patrolStores: 'patrolStores', washingStores: 'washingStores',
          procCost: 'procCost', pkgCost: 'pkgCost', serviceCost: 'serviceCost',
          wageMultiplier: 'wageMultiplier', threePlRate: 'threePlRate',
        };
        
        parameters.forEach(param => {
            const domKey = keyMap[param.key] || param.key as keyof typeof dom.pl;
            const inputEl = dom.pl[domKey];
            if (inputEl && !inputEl.disabled) {
                const defaultValue = state.beforeAiRawValues.get(domKey) || '0';
                const isRate = ['pf', 'utilRate', 'threePlRate', 'wageMultiplier'].includes(param.key);

                inputEl.value = isRate ? param.value.toString() : formatNumber(param.value);
                inputEl.classList.add('ai-applied');

                const parent = inputEl.parentElement;
                if (parent) {
                    parent.querySelector('.ai-reasoning-note-item')?.remove();
                    const noteEl = document.createElement('div');
                    noteEl.className = 'ai-reasoning-note-item';
                    noteEl.innerHTML = `<b>AI:</b> ${inputEl.value} (기본값: ${defaultValue}). ${param.reasoning}`;
                    parent.appendChild(noteEl);
                }
            }
        });

        
        staffingRatios.forEach(ratio => {
            if (ratio.key === 'corporate') state.aiParams.staffingRatios.corporate = ratio.value;
            else if (ratio.key === 'cs') state.aiParams.staffingRatios.cs = ratio.value;
            else if (ratio.key === 'platform') state.aiParams.staffingRatios.platform = ratio.value;
            else if (ratio.key === 'technical') state.aiParams.staffingRatios.technical = ratio.value;
            else if (ratio.key === 'monitoring') state.aiParams.staffingRatios.monitoring = ratio.value;
        });

        state.aiParams.staffing_reasoning = staffReasoning;

        state.aiParamsApplied = true;
        btn.textContent = '↩️ AI 추천 복원';
        updateAllUI();

    } catch (error) {
        console.error("AI parameter fetch failed:", error);
        alert("AI 추천 파라미터를 불러오는 데 실패했습니다. API 키와 네트워크 연결을 확인해주세요.");
        btn.disabled = false;
        btn.textContent = '🤖 AI 추천 파라미터 적용';
    } finally {
        btn.disabled = false;
    }
  }
  function commitOpsPlan() {
    window.ops.ordersPerHourPeak = parseFloat(dom.capacityPlan.diag.peakOrdersH.textContent || '0');
    window.ops.fryerSlots = parseFormattedNumber(dom.capacityPlan.diag.ownedFryerSlots.value);
    window.ops.slotsPerDevice = parseFormattedNumber(dom.capacityPlan.fryerType.value);
    window.ops.deviceCount = Math.ceil(window.ops.fryerSlots / (window.ops.slotsPerDevice || 1));
    window.ops.crewPeak = parseFloat(dom.staffingPeak.outTotal.textContent || '0');
    window.ops.sstVersion++;
    window.bus.emit('ops:committed', { ...window.ops });
    const btn = dom.staffingPeak.commitBtn;
    btn.textContent = '✅ 계획 반영 완료!';
    setTimeout(() => { btn.textContent = '💾 운영 계획 확정 및 P&L 반영'; }, 2000);
  }

  // --- UI UPDATE ORCHESTRATOR ---
  function updateAllUI() {
    const storeCount = state.storeCount;
    const newLevel = getAutomationLevel(storeCount);
    if (newLevel !== window.ops.level) {
        setLevel(newLevel);
    }

    if (!dom.pl.useCustomCapex.checked) {
        dom.pl.capex.value = formatNumber(getEffectiveUnitCapex(newLevel));
    }

    updateAssumptionsUI(newLevel);
    calculateAndDisplaySopFry();
    
    const baseInputs = getCurrentBaseInputs();
    const pnlResults = calcPNL(storeCount, baseInputs);

    updateSummaryUI(storeCount, newLevel);
    updateConclusionUI(storeCount, newLevel, pnlResults.allStaff);
    updateCapexUI(storeCount, newLevel, pnlResults.allStaff);
    updateOpexUI(pnlResults, newLevel);
    updatePnlUI(pnlResults, baseInputs);
    const { totalPnlResults, hqPnlResults } = updateTotalPackageResults(storeCount, newLevel, pnlResults);
    updateScenarioAnalysisUI(pnlResults);
    updateRoadmapUI();
    updateDecisionUI();
  }

  // --- EVENT LISTENERS ---
  function setupListeners() {
    dom.storeSlider.addEventListener('input', (e) => {
      const sliderVal = parseInt((e.target as HTMLInputElement).value, 10);
      state.storeCount = mapSliderToStoreCount(sliderVal);
      dom.sliderValDisplay.textContent = formatNumber(state.storeCount);
      resetAiState();
      updateAllUI();
    });

    dom.aiParamsBtn.addEventListener('click', fetchAiParameters);
    dom.applyChangesBtn.addEventListener('click', updateAllUI);
    dom.openEquipModalBtn.addEventListener('click', () => window.bus.emit('capex:open'));

    Object.entries(dom.forceLevelButtons).forEach(([key, btn]) => {
      btn.addEventListener('click', () => {
        state.forcedLevel = key === 'auto' ? null : key.toUpperCase() as 'A'|'B'|'C';
        resetAiState();
        updateForceLevelButtons();
        updateAllUI();
      });
    });

    // SOP listeners
    Object.values(dom.sop).forEach(el => {
      if ('addEventListener' in el) {
        el.addEventListener('input', calculateAndDisplaySopFry);
      }
    });

    // Capacity Plan listeners
    Object.values(dom.capacityPlan).forEach(el => {
      if (el instanceof HTMLElement && el.tagName === 'INPUT') {
        el.addEventListener('input', calculateAndDisplayCapacityPlan);
      }
    });
    dom.capacityPlan.fryerType.addEventListener('change', calculateAndDisplayCapacityPlan);
    dom.capacityPlan.diagnoseBtn.addEventListener('click', () => {
        dom.capacityPlan.diagnosisResults.style.display = 'block';
        runAndDisplayDiagnosis();
    });
    Object.values(dom.capacityPlan.diag).forEach(el => {
        if (el instanceof HTMLElement && el.tagName === 'INPUT') {
            el.addEventListener('input', () => runAndDisplayDiagnosis());
        }
    });
    dom.capacityPlan.diagTabs.tab1.addEventListener('change', () => {
        dom.capacityPlan.diagTabs.content1.style.display = 'block';
        dom.capacityPlan.diagTabs.content2.style.display = 'none';
    });
    dom.capacityPlan.diagTabs.tab2.addEventListener('change', () => {
        dom.capacityPlan.diagTabs.content1.style.display = 'none';
        dom.capacityPlan.diagTabs.content2.style.display = 'block';
    });
    
    // Staffing listeners
    Object.values(dom.staffingPeak).forEach(el => {
        if (el instanceof HTMLElement && el.tagName === 'INPUT') {
            el.addEventListener('input', () => calculateAndDisplayPeakStaffing());
        }
    });
    dom.staffingPeak.commitBtn.addEventListener('click', commitOpsPlan);

    // Center Ops listeners
    Object.values(dom.centerOps).forEach(el => {
        if (el instanceof HTMLElement && el.tagName === 'INPUT') {
            el.addEventListener('input', calculateAndDisplayCenterOps);
        }
    });
    window.bus.on('centerOps:recalculate', calculateAndDisplayCenterOps);

    // P&L listeners (for auto-update)
    Object.values(dom.pl).forEach(el => {
      if (el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'SELECT')) {
        el.addEventListener('input', updateAllUI);
      }
    });
    dom.pl.useCustomCapex.addEventListener('change', () => {
        dom.pl.capex.readOnly = !dom.pl.useCustomCapex.checked;
        if (dom.pl.useCustomCapex.checked) {
            dom.pl.capex.style.borderColor = "var(--sky)";
        } else {
            dom.pl.capex.style.borderColor = "";
        }
        updateAllUI();
    });

    // HQ P&L listeners
    Object.values(dom.hq_pnl).forEach(el => {
        if (el instanceof HTMLElement && el.tagName === 'INPUT') {
            el.addEventListener('input', updateAllUI);
        }
    });

    window.bus.on('ui:updateAll', updateAllUI);
    window.bus.on('ops:committed', updateAllUI);
    window.bus.on('ops:equipSaved', () => {
      dom.pl.useCustomCapex.checked = true;
      updateAllUI();
    });

  }

  // --- STARTUP ---
  initCapexModal(dom);
  setupListeners();
  updateForceLevelButtons();
  updateAllUI();
  
});