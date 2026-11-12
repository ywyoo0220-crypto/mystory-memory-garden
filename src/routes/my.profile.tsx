import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { prefs, usePrefs, validBirth } from "@/lib/prefs";
import { Avatar, SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/profile")({
  head: () => ({
    meta: [
      { title: "프로필 — myStory" },
      { name: "description", content: "이름, 태어난 해, 프로필 사진을 정해요." },
      { property: "og:title", content: "프로필 — myStory" },
      { property: "og:description", content: "이름, 태어난 해, 프로필 사진을 정해요." },
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
  const [photo, setPhoto] = useState<string | undefined>();
  const init = useRef(false);
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (init.current) return;
    if (profile.name || profile.birth || profile.photo) init.current = true;
    setName(profile.name);
    setBirth(profile.birth);
    setPhoto(profile.photo);
  }, [profile]);

  const save = () => {
    if (birth && !validBirth(birth)) return void toast("태어난 해를 네 자리로 입력하세요");
    if (!prefs.setProfile({ name: name.trim(), birth, photo })) return void toast("저장 공간이 부족해요");
    toast("프로필을 저장했어요");
    navigate({ to: "/my" });
  };
  const pill = "inline-flex h-12 items-center rounded-full border border-ink px-5 text-[0.9375rem] font-medium";
  const input = "mt-2 h-14 w-full rounded-2xl border border-[#D1D1D6] bg-card px-4 text-[1.0625rem] outline-none focus:border-ink";
  return (
    <main className="pb-6">
      <SubHeader title="프로필" />
      <div className="space-y-6 px-6">
        <div className="flex items-center gap-4">
          <button type="button" aria-label="프로필 사진 고르기" onClick={() => file.current?.click()} className="rounded-full">
            <Avatar name={name} photo={photo} size={88} />
          </button>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={pill} onClick={() => file.current?.click()}>{photo ? "사진 바꾸기" : "사진 넣기"}</button>
            {photo && <button type="button" className={pill} onClick={() => setPhoto(undefined)}>사진 빼기</button>}
          </div>
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
        <label className="block">
          <span className="text-[0.9375rem] font-medium">이름</span>
          <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="예: 김정희" autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-[0.9375rem] font-medium">태어난 해</span>
          <input
            className={input}
            value={birth}
            onChange={(e) => setBirth(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="예: 1955"
            inputMode="numeric"
            maxLength={4}
          />
        </label>
        <p className="text-[0.9375rem] leading-[1.6] text-muted-foreground">태어난 해를 넣으면 ‘20대 · 1975–1984’처럼 시기별 연도가 함께 표시돼요.</p>
        <button type="button" onClick={save} className="flex h-14 w-full items-center justify-center rounded-full bg-ink text-[1.0625rem] font-semibold text-ink-foreground">
          저장하기
        </button>
      </div>
    </main>
  );
}
