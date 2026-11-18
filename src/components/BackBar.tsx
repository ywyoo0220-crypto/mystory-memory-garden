import { useRouter } from "@tanstack/react-router";

export function BackBar({ title, onBack }: { title: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <div className="flex h-16 items-center gap-1 px-2">
      <button
        type="button"
        aria-label="뒤로"
        onClick={onBack ?? (() => router.history.back())}
        className="flex size-12 items-center justify-center rounded-full"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path d="m15 5-7 7 7 7" />
        </svg>
      </button>
      {title && <span className="text-body font-medium">{title}</span>}
    </div>
  );
}
