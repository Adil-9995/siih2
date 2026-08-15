import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, CameraOff } from "lucide-react";

/** Camera QR scanner with a manual pass-code fallback. */
export function QrScanner({ onScan, busy }: { onScan: (code: string) => void; busy?: boolean }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const lastRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const reader = new BrowserMultiFormatReader();
    void reader
      .decodeFromVideoDevice(undefined, videoRef.current ?? undefined, (result) => {
        if (!result) return;
        const text = result.getText().trim();
        const now = Date.now();
        if (lastRef.current.code === text && now - lastRef.current.at < 3000) return;
        lastRef.current = { code: text, at: now };
        onScan(text);
      })
      .then((controls) => {
        if (cancelled) controls.stop();
        else controlsRef.current = controls;
      })
      .catch(() => {
        setError("Camera unavailable. Use the manual code entry below.");
        setActive(false);
      });
    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [active, onScan]);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl border border-border bg-black/60">
        <video ref={videoRef} className="aspect-video w-full object-cover" muted playsInline />
        {!active ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Camera is off
          </div>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={active ? "outline" : "default"} onClick={() => setActive((a) => !a)}>
          {active ? <CameraOff className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
          {active ? "Stop camera" : "Start camera"}
        </Button>
      </div>
      {error ? <p className="text-xs text-warning">{error}</p> : null}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (manual.trim()) onScan(manual.trim());
          setManual("");
        }}
      >
        <Input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Enter pass code manually" />
        <Button type="submit" variant="outline" disabled={busy}>
          Check
        </Button>
      </form>
    </div>
  );
}
