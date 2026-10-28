'use client';

interface QuantityStepperProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  min?: number;
  size?: 'sm' | 'lg';
}

export default function QuantityStepper({ value, max, onChange, min = 1, size = 'sm' }: QuantityStepperProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
  const button = size === 'lg' ? 'size-11' : 'size-8';
  const input = size === 'lg' ? 'w-10 text-base' : 'w-8 text-sm';

  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Quitar uno"
        className={`${button} grid place-items-center rounded-full text-lg text-ink transition hover:bg-gray-100 disabled:opacity-30`}
      >
        −
      </button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        aria-label="Cantidad"
        className={`no-spin ${input} bg-transparent text-center font-semibold text-ink outline-none`}
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Agregar uno"
        className={`${button} grid place-items-center rounded-full text-lg text-ink transition hover:bg-gray-100 disabled:opacity-30`}
      >
        +
      </button>
    </div>
  );
}
