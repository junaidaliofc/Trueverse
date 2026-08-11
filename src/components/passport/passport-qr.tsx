"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

/** Premium QR mark for Passport share surfaces. */
export function PassportQR({
  value,
  size = 176,
  className,
  label = "Scan to open public Passport"
}: {
  value: string;
  size?: number;
  className?: string;
  label?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: {
        dark: "#0b1613",
        light: "#00000000"
      },
      errorCorrectionLevel: "M"
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <figure
      className={cn(
        "flex flex-col items-center gap-3",
        className
      )}
    >
      <div
        className="relative overflow-hidden rounded-[1.35rem] bg-white p-3 shadow-[0_12px_40px_-18px_rgba(15,40,34,0.45)] ring-1 ring-border/60"
        style={{ width: size + 24, height: size + 24 }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(15,118,110,0.08),transparent_55%)]"
        />
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dataUrl}
            alt={label}
            width={size}
            height={size}
            className="relative size-full object-contain"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center rounded-xl bg-muted"
            style={{ width: size, height: size }}
            aria-label="Generating QR code"
          >
            <span className="font-mono text-[10px] text-muted-foreground">QR</span>
          </div>
        )}
      </div>
      <figcaption className="text-center text-[11px] font-medium tracking-wide text-muted-foreground">
        {label}
      </figcaption>
    </figure>
  );
}
