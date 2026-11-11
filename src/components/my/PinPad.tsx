import { useEffect, useState } from "react";

/** 4 dots + 3×4 keypad; calls onDone with the 4 digits, then clears. */
export function PinPad({ title, error, onDone }: { title: string; error?: string | null; onDone: (pin: string) => void }) {
  const [pin, setPin] = useState("");
  useEffect(() => {
    if (pin.length === 4) {
      const p = pin;
      const t = setTimeout(() => {
        setPin("");
        onDone(p);
      }, 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [pin, onDone]);
  const press = (d: string) => setPin((p) => (p.length < 4 ? p + d : p));
  const key = "flex h-16 items-center justify-center rounded-full text-[1.5rem] font-medium active:bg-[#E5E5EA]";
  return (
    <div className="flex flex-col items-center px-6">
      <p className="text-[1.25rem] font-bold" aria-live="polite">{title}</p>
      <p className="mt-2 min-h-6 text-[0.9375rem] font-medium text-destructive" role="alert">{error}</p>
      <div className="mt-4 flex gap-4" aria-label={`${pin.length}자리 입력함`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`size-4 rounded-full border-2 border-ink ${i < pin.length ? "bg-ink" : ""}`} />
        ))}
      </div>
      <div className="mt-8 grid w-full max-w-[18rem] grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" className={key} onClick={() => press(d)}>{d}</button>
        ))}
        <span />
        <button type="button" className={key} onClick={() => press("0")}>0</button>
        <button type="button" className={key} aria-label="지우기" onClick={() => setPin((p) => p.slice(0, -1))}>⌫</button>
      </div>
    </div>
  );
}
