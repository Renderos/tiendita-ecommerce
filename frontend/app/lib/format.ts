export function formatPrice(value: string | number) {
  return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const UNIT_LABELS: Record<string, string> = {
  unit: 'unidad',
  lb: 'lb',
  kg: 'kg',
  pack: 'paquete',
};

export function formatUnit(unit?: string) {
  if (!unit) return null;
  return UNIT_LABELS[unit] ?? unit;
}
