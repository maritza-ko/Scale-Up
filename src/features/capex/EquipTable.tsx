// src/features/capex/EquipTable.tsx
import { KRW } from '../../app/utils/format.ts';
import { OpsState, AppWindow } from '../../app/state/ops.ts';
declare let window: AppWindow;

interface EquipTableProps {
  items: OpsState['equip'];
  readOnly?: boolean;
}

export function renderEquipTable(props: EquipTableProps): string {
    const { items, readOnly = false } = props;
    const list = Array.isArray(items) ? items : [];

    const rows = list.map((item, index) => {
        const subtotal = (item.isRental ? 0 : item.unitPrice || 0) * (item.qty || 0);
        const qtyInput = readOnly
            ? item.qty
            : `<input type="number" min="0" value="${item.qty}" class="equip-qty-input">`;
        
        const itemDescription = [item.brand, item.model].filter(Boolean).join(' ') || item.name;
        const notes = item.notes ? `<div class="k" style="font-size: 12px; margin-top: 2px;">${item.notes}</div>` : '';

        return `
            <tr data-index="${index}" data-id="${item.id}">
                <td>${item.cat}</td>
                <td>${itemDescription}${notes}</td>
                <td class="qty-cell">${qtyInput}</td>
                <td style="text-align:right;">${KRW(item.unitPrice || 0)}</td>
                <td style="text-align:right;">${KRW(subtotal)}</td>
            </tr>
        `;
    }).join('');

    return `
        <table class="equip-table">
            <thead><tr><th>분류</th><th>모델 및 설명</th><th>수량</th><th>단가</th><th>소계</th></tr></thead>
            <tbody>${rows}</tbody>
            <tfoot>
                <tr>
                    <th colspan="4" style="text-align:right;">합계 CAPEX</th>
                    <th style="text-align:right;">${KRW(window.sumCapex(list))}</th>
                </tr>
            </tfoot>
        </table>
    `;
}