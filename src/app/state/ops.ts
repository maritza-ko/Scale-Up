// src/app/state/ops.ts

// Forward-declaring the functions that will be defined elsewhere to satisfy TypeScript.
declare function resolveSlots(kit: OpsState['equip']): number;

export interface OpsState {
  level: 'C' | 'B' | 'A';
  fryerSlots: number;
  slotsPerDevice: number;
  deviceCount: number;
  ordersPerHourPeak: number;
  crewPeak: number;
  equip: { id?: string; cat: string; brand?: string; model?: string; name?: string; unitPrice: number; qty: number, baskets?: number, power?: string, notes?: string, rentMonthly?: number, isRental?: boolean }[];
  capexFromEquip: number;
  sstVersion: number;
}

export interface AppWindow extends Window {
  ops: OpsState;
  bus: {
    _e: { [key: string]: Function[] };
    on: (event: string, handler: Function) => () => void;
    off: (event: string, handler: Function) => void;
    emit: (event: string, payload?: any) => void;
  };
  deepClone: <T>(obj: T) => T;
  sumCapex: (list: any[]) => number;
}

declare let window: AppWindow;

export function initState() {
    window.ops = {
      level: 'C',
      fryerSlots: 0,
      slotsPerDevice: 1,
      deviceCount: 0,
      ordersPerHourPeak: 0,
      crewPeak: 0,
      equip: [],
      capexFromEquip: 0,
      sstVersion: 0
    };
    window.bus = {
      _e: {},
      on(e, h){ (this._e[e]||(this._e[e]=[])).push(h); return ()=>this.off(e,h); },
      off(e, h){ this._e[e]=(this._e[e]||[]).filter(x=>x!==h); },
      emit(e, p){ (this._e[e]||[]).forEach(f=>{try{f(p)}catch(_){} }); }
    };

    window.deepClone = (x) => (typeof structuredClone === 'function')
      ? structuredClone(x) : JSON.parse(JSON.stringify(x));

    window.sumCapex = (list) => Array.isArray(list)
      ? list.reduce((s, i) => {
          const isRental = i.cat === 'robots' && i.isRental;
          const price = isRental ? 0 : (i?.unitPrice || 0);
          return s + (price * (i?.qty || 0));
        }, 0) : 0;
}


export function setLevel(next: 'A' | 'B' | 'C') {
  window.ops.level = next;
  // Crucially, reset the equipment config to avoid carrying over stale state
  window.ops.equip = [];
  window.ops.capexFromEquip = 0;
  window.ops.sstVersion++;
  window.bus.emit('ops:levelChanged', window.deepClone(window.ops));
}

export function saveCapexSelection(localKit: OpsState['equip'], {slotsPerDevice}: {slotsPerDevice: number}) {
    window.ops.equip = window.deepClone(localKit);
    window.ops.capexFromEquip = window.sumCapex(window.ops.equip);
    window.ops.slotsPerDevice = +slotsPerDevice || 1;
    window.ops.deviceCount = Math.ceil((window.ops.fryerSlots||0) / window.ops.slotsPerDevice);
    window.ops.sstVersion++;
    window.bus.emit('ops:equipSaved', window.deepClone(window.ops));
}
