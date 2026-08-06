"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  PASSPORT_DNA_DIMENSIONS,
  PASSPORT_DNA_META,
  type PassportDna
} from "@/lib/design";
import { cn } from "@/lib/utils";

/** Pentagon radar for Passport Reputation DNA — read-only, server-computed. */
function DnaRadar({ dna, size = 220 }: { dna: PassportDna; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const dims = PASSPORT_DNA_DIMENSIONS;
  const n = dims.length;

  const pointAt = (index: number, value: number) => {
    const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / n;
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r
    };
  };

  const ringPoints = (scale: number) =>
    dims
      .map((_, i) => {
        const p = pointAt(i, scale * 100);
        return `${p.x},${p.y}`;
      })
      .join(" ");

  const valuePoints = dims
    .map((key, i) => {
      const p = pointAt(i, dna[key]);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="mx-auto overflow-visible"
      role="img"
      aria-label="Reputation DNA radar"
    >
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={ringPoints(scale)}
          fill="none"
          className="stroke-border"
          strokeWidth={1}
        />
      ))}
      {dims.map((_, i) => {
        const tip = pointAt(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={tip.x}
            y2={tip.y}
            className="stroke-border"
            strokeWidth={1}
          />
        );
      })}
      <motion.polygon
        points={valuePoints}
        className="fill-brand/25 stroke-brand"
        strokeWidth={2}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      />
      {dims.map((key, i) => {
        const tip = pointAt(i, 108);
        return (
          <text
            key={key}
            x={tip.x}
            y={tip.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-[10px] font-semibold"
          >
            {PASSPORT_DNA_META[key].label}
          </text>
        );
      })}
    </svg>
  );
}

export function PassportReputationDna({
  dna,
  className,
  hidden = false
}: {
  dna: PassportDna;
  className?: string;
  hidden?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  if (hidden) {
    return (
      <section className={cn("glass rounded-[1.75rem] p-6 sm:p-7", className)}>
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Reputation DNA</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Hidden</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This member keeps Reputation DNA private.
        </p>
      </section>
    );
  }

  return (
    <section className={cn("glass rounded-[1.75rem] p-6 sm:p-7", className)}>
      <div className="mb-2">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand">Reputation DNA</p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">How trust forms</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Server-computed dimensions from verified behavior. Not editable. Never affected by XP.
        </p>
      </div>

      <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <DnaRadar dna={dna} />

        <ul className="space-y-4">
          {PASSPORT_DNA_DIMENSIONS.map((key, index) => {
            const meta = PASSPORT_DNA_META[key];
            const value = Math.max(0, Math.min(100, dna[key] ?? 0));
            return (
              <li key={key}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-foreground">{meta.label}</span>
                  <span className="tabular-nums text-muted-foreground">{value}</span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-muted"
                  role="meter"
                  aria-label={meta.label}
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={reduceMotion ? false : { width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{
                      duration: 0.75,
                      delay: index * 0.07,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{meta.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
