// src/app/utils/format.ts
export function KRW(n: number, includeSymbol = true): string {
  if (isNaN(n) || n === null) return '-';
  const symbol = includeSymbol ? '₩' : '';
  return symbol + Math.round(n).toLocaleString('ko-KR');
}

export function formatNumber(n: number): string {
    if (isNaN(n) || n === null) return '';
    return n.toLocaleString('ko-KR');
}

export function parseFormattedNumber(str: string | number): number {
    if (!str) return 0;
    if (typeof str === 'string' && str.trim() === '---') return 0;
    return Number(String(str).replace(/,/g, ''));
}
