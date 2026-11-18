import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { prefs, usePrefs, validBirth } from "@/lib/prefs";
import { Avatar, SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/profile")({
  head: () => ({
    meta: [
      { title: "프로필 — MyStory" },
      { name: "description", content: "이름, 태어난 해와 곳, 프로필 사진을 정해요." },
      { property: "og:title", content: "프로필 — MyStory" },
      { property: "og:description", content: "이름, 태어난 해와 곳, 프로필 사진을 정해요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

/** Center-crops to a square, 240×240 JPEG (quality 0.8), as a data URL. */
async function squarePhoto(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const side = Math.min(img.width, img.height);
    const c = document.createElement("canvas");
    c.width = c.height = 240;
    c.getContext("2d")?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 240, 240);
    return c.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ProfilePage() {
  const { profile } = usePrefs();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [place, setPlace] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const init = useRef(false);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (init.current) return;
    if (profile.name || profile.birth || profile.birthplace || profile.photo) init.current = true;
    setName(profile.name);
    setBirth(profile.birth);
    setPlace(profile.birthplace ?? "");
    setPhoto(profile.photo);
  }, [profile]);

  const save = () => {
    if (birth && !validBirth(birth)) return void toast("태어난 해를 네 자리로 입력하세요");
    if (!prefs.setProfile({ ...profile, name: name.trim(), birth, birthplace: place.trim() || undefined, photo })) return void toast("저장 공간이 부족해요");
    toast("프로필을 저장했어요");
    navigate({ to: "/my" });
  };
  const field = "group block px-6 py-5 transition-colors focus-within:bg-secondary/40";
  const labelCls = "block text-caption font-medium text-muted-foreground transition-colors group-focus-within:text-ink";
  const input = "mt-1 h-12 w-full bg-transparent text-body font-medium outline-none placeholder:font-normal placeholder:text-muted-foreground";
  const birthBad = birth.length > 0 && !validBirth(birth);
  return (
    <main className="pb-32">
      <SubHeader title="프로필" sub="책의 첫 장에 이렇게 담겨요." />
      <div className="space-y-6 px-6">
        <div className="rounded-[20px] bg-card px-6 pt-9 pb-8 text-center">
          <div className="relative mx-auto w-fit">
            <button type="button" aria-label={photo ? "프로필 사진 바꾸기" : "프로필 사진 넣기"} onClick={() => file.current?.click()} className="relative block rounded-full">
              <Avatar name={name} photo={photo} size={80} />
              <span aria-hidden className="absolute -bottom-1 -right-1 flex size-9 items-center justify-center rounded-full border-2 border-card bg-ink text-ink-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
              </span>
            </button>
            {photo && (
              <button type="button" aria-label="프로필 사진 빼기" onClick={() => setPhoto(undefined)} className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full border-2 border-card bg-ink text-ink-foreground after:absolute after:-inset-1.5 after:content-['']">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            )}
          </div>
          <p className="mt-8 text-caption font-normal text-muted-foreground">기록자</p>
          <p className="mt-2 truncate text-title font-medium">{name.trim() || "이름을 넣어 주세요"}</p>
          <span aria-hidden className="mx-auto mt-7 mb-6 block h-px w-7 bg-ink" />
          <p className="text-caption font-normal text-muted-foreground">
            {[validBirth(birth) && `${birth}년생`, place.trim() && `${place.trim()} 출생`].filter(Boolean).join(" · ") || "태어난 해와 곳"}
          </p>
        </div>
        <input
          ref={file}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              setPhoto(await squarePhoto(f));
            } catch {
              toast("사진을 불러오지 못했어요");
            }
          }}
        />
        <div className="divide-y overflow-hidden rounded-[20px] border border-border bg-card">
          <label className={field}>
            <span className={labelCls}>이름</span>
            <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 김정희" autoComplete="name" />
          </label>
          <label className={field}>
            <span className={labelCls}>태어난 해</span>
            <input
              className={input}
              value={birth}
              onChange={(e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="예: 1958"
              inputMode="numeric"
              maxLength={4}
              aria-invalid={birthBad}
            />
          </label>
          <label className={field}>
            <span className={labelCls}>태어난 곳</span>
            <input className={input} value={place} onChange={(e) => setPlace(e.target.value.slice(0, 20))} placeholder="예: 전남 순천" />
          </label>
        </div>
        <p className={`px-2 text-caption ${birthBad ? "text-destructive" : "text-muted-foreground"}`}>{birthBad ? "1900년부터 2099년 사이, 네 자리로 입력하세요." : "태어난 해를 넣으면 ‘20대 · 1975–1984’처럼 시기별 연도가 함께 표시돼요."}</p>
        <button type="button" onClick={save} className="flex h-14 w-full items-center justify-center rounded-full bg-ink text-body font-medium text-ink-foreground">
          저장하기
        </button>
      </div>
    </main>
  );
}
