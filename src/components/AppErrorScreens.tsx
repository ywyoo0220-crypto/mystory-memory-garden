import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { reportLovableError } from "@/lib/lovable-error-reporting";

const primary = "h-14 w-full rounded-full bg-ink px-6 text-body font-medium text-ink-foreground";

export function NotFoundComponent() {
  useStore();
  return (
    <main className="mx-auto flex min-h-app w-full max-w-read items-center bg-background px-6 py-12">
      <div className="w-full text-center">
        <h1 className="font-serif text-title">화면을 찾을 수 없어요.</h1>
        <p className="mt-4 text-body text-muted-foreground">주소가 바뀌었거나 없는 화면이에요.</p>
        <Button asChild variant="palette" className={`mt-8 ${primary}`}><Link to="/">홈으로 가기</Link></Button>
      </div>
    </main>
  );
}

export function ErrorComponent({ error, reset }: ErrorComponentProps) {
  useStore();
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <main className="mx-auto flex min-h-app w-full max-w-read items-center bg-background px-6 py-12">
      <div className="w-full text-center">
        <h1 className="font-serif text-title">화면을 불러오지 못했어요.</h1>
        <p className="mt-4 text-body text-muted-foreground">잠시 뒤에 다시 시도해 주세요. 남긴 기록은 그대로 있어요.</p>
        <div className="mt-8 space-y-2">
          <Button variant="palette" className={primary} onClick={async () => { await router.invalidate(); reset(); }}>다시 시도</Button>
          <Button asChild variant="palette" className="h-14 w-full rounded-full border border-ink px-6 text-body font-medium"><Link to="/">홈으로 가기</Link></Button>
        </div>
      </div>
    </main>
  );
}