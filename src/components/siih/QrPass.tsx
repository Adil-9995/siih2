import { useEffect, useState } from "react";
import QRCode from "qrcode";

/** Renders a scannable venue pass QR for a team. */
export function QrPass({
  code,
  label,
  sublabel,
  size = 220,
}: {
  code: string;
  label: string;
  sublabel?: string;
  size?: number;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void QRCode.toDataURL(code, {
      width: size * 2,
      margin: 1,
      color: { dark: "#04121f", light: "#ffffff" },
    }).then((url) => {
      if (active) setSrc(url);
    });
    return () => {
      active = false;
    };
  }, [code, size]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-cyan/40 bg-white p-3" style={{ boxShadow: "var(--glow-sm)" }}>
        {src ? (
          <img src={src} alt={`Venue pass QR for ${label}`} width={size} height={size} className="block" />
        ) : (
          <div style={{ width: size, height: size }} className="animate-pulse bg-muted" />
        )}
      </div>
      <div className="text-center">
        <p className="font-display text-sm font-bold tracking-wide">{label}</p>
        {sublabel ? <p className="text-xs text-muted-foreground">{sublabel}</p> : null}
        <p className="mt-1 font-mono text-[10px] break-all text-muted-foreground">{code}</p>
      </div>
    </div>
  );
}
