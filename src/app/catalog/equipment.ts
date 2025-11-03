// src/app/catalog/equipment.ts
import { AppWindow, OpsState } from '../state/ops.ts';
declare let window: AppWindow;

export const CATALOG = {
  fryers: [
    {id:'r-m30',cat:'fryer',brand:'Rinnai',model:'RFA-327G (22L)',baskets:1,unitPrice:1150000, notes: '1마리 1튀김기 원칙을 위한 최소형 가스 튀김기'},
    {id:'r-m40',cat:'fryer',brand:'Rinnai',model:'RFA-M40G',baskets:2,unitPrice:2090000},
    {id:'g-gf601',cat:'fryer',brand:'GrandWoosung',model:'GW-GF601',baskets:1,unitPrice:1350000},
    {id:'g-gf901',cat:'fryer',brand:'GrandWoosung',model:'GW-GF901',baskets:2,unitPrice:2330000}
  ],
  oilFilters: [
    {id:'r-or30',cat:'oilFilter',brand:'Rinnai',model:'ROR-30N',unitPrice:790000},
    {id:'r-or40',cat:'oilFilter',brand:'Rinnai',model:'ROR-40N',unitPrice:880000},
    {id:'g-or200',cat:'oilFilter',brand:'GrandWoosung',model:'GWS-OR200N',unitPrice:1050000}
  ],
  autoLift: [
    {id:'a-500',cat:'autoLift',brand:'Ariel',model:'CALF-500',unitPrice:3190000,power:'3상10.5kW'},
    {id:'a-600',cat:'autoLift',brand:'Ariel',model:'CALF-600',unitPrice:3850000,power:'3상10.5kW'}
  ],
  robots: [
    {id:'rob-frynic', cat:'robots', brand:'Roboson', model:'FRYNIC-24', type:'auto-fry', unitPrice:10000000, rentMonthly:350000, notes:'단순 튀김 공정 자동화. 튀김기 1대당 1대 필요. (Level C)'},
    {id:'neuromeka-indy7', cat:'robots', brand:'Neuromeka', model:'Indy7', type:'협동로봇', unitPrice:28000000, rentMonthly:850000, notes:'6축 협동로봇. 튀김 바스켓 핸들링, 토스 등. (Level B)'},
    {id:'induk-bot-v2', cat:'robots', brand:'Induk Robotics', model:'Arm v2', type:'multi-tasking cobot', unitPrice:35000000, rentMonthly:950000, notes:'튀김, 양념, 포장 보조 등 복합 작업 수행. (Level A)'}
  ],
  lockers: [
    {id:'sl-12', cat:'locker', name:'스마트 보온 픽업 락커 (12구)', unitPrice:8500000}
  ],
  commonKit: [
    {id:'frz-65',cat:'freezer',name:'-6℃ 냉동(65박스)',unitPrice:2850000,qty:1},
    {id:'frg-45',cat:'fridge',name:'4℃ 냉장(45박스)',unitPrice:1950000,qty:1},
    {id:'sink-2b',cat:'sink',name:'2볼 싱크대 1500',unitPrice:265000,qty:1},
    {id:'wt-1200',cat:'worktable',name:'스텐 작업대 1200(2단)',unitPrice:129000,qty:1},
    {id:'warm-ovh',cat:'warmer',name:'오버헤드 워머',unitPrice:232600,qty:1},
    {id:'warm-shelf',cat:'shelf',name:'보온 선반 1200(2단)',unitPrice:105600,qty:1},
    {id:'warmer',cat:'warmer',name:'온장고/보온장',unitPrice:329000,qty:1},
    {id:'kds-24',cat:'kds',name:'모니터 24"(KDS)',unitPrice:238000,qty:1},
    {id:'pos-tab',cat:'terminal',name:'안드로이드 단말(4GB/32GB)',unitPrice:69000,qty:1},
    {id:'label',cat:'label',name:'라벨 프린터',unitPrice:222000,qty:1},
    {id:'cctv4',cat:'cctv',name:'CCTV 4ch NVR 키트',unitPrice:189000,qty:1},
    {id:'oil-tester',cat:'oil',name:'식용유 산패측정기',unitPrice:888800,qty:1},
    {id:'install',cat:'install',name:'설치/덕트/전기/소방',unitPrice:15000000,qty:1},
    {id:'deposit',cat:'deposit',name:'보증금(환급성 자금)',unitPrice:5000000,qty:1}
  ]
};

const PRESETS = {
  C: (slots: number)=> [
    { ...CATALOG.fryers.find(x=>x.id==='r-m30'), qty: Math.max(4, Math.ceil(slots/1)) },
    { ...CATALOG.oilFilters.find(x=>x.id==='r-or40'), qty:1 },
    { ...CATALOG.robots.find(x=>x.id==='rob-frynic'), qty:1, isRental: false },
    ...CATALOG.commonKit
  ],
  B: (slots: number)=> [
    { ...CATALOG.fryers.find(x=>x.id==='r-m30'), qty: Math.max(4, Math.ceil(slots/1)) },
    { ...CATALOG.oilFilters.find(x=>x.id==='r-or40'), qty:1 },
    { ...CATALOG.robots.find(x=>x.id==='neuromeka-indy7'), qty:1, isRental: false },
    ...CATALOG.commonKit
  ],
  A: (slots: number)=> [
    { ...CATALOG.fryers.find(x=>x.id==='r-m30'), qty: 4 },
    { ...CATALOG.robots.find(x=>x.id==='induk-bot-v2'), qty: 1, isRental: false },
    { ...CATALOG.oilFilters.find(x=>x.id==='r-or40'), qty:2 },
    { ...CATALOG.lockers.find(x=>x.id==='sl-12'), qty:1 },
    ...CATALOG.commonKit
  ]
};

export function getPresetKitByLevel(level: 'A'|'B'|'C', fryerSlots: number) {
  const slots = level === 'A' ? 4 : (fryerSlots || 4); // Level A is fixed at 4 slots
  const fn = PRESETS[level] || PRESETS.C;
  const kit = fn(slots);
  return window.deepClone(kit.map((item, index) => ({...item, id: item.id || `${item.cat}-${index}`})));
}

export function resolveSlots(kit: OpsState['equip']): number {
    const safeKit = Array.isArray(kit) ? kit : [];
    const mainFryer = safeKit.find(item => item.cat === 'fryer' || item.cat === 'autoLift');
    return mainFryer?.baskets || 1;
}