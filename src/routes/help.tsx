import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useDeviceName } from "@/lib/device";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "도움말 — 마이스토리" },
      { name: "description", content: "기록하는 방법, 말로 입력하기, 큰 글씨, 저장 위치 안내." },
      { property: "og:title", content: "도움말 — 마이스토리" },
      { property: "og:description", content: "기록하는 방법, 말로 입력하기, 큰 글씨, 저장 위치 안내." },
    ],
  }),
  component: Help,
});

const helpItems = (device: string) => [
  {
    t: "기록하는 방법",
    d: "아래 ‘기록하기’를 누르고 주제나 시기를 골라요. 질문 하나에 이어지는 질문 세 개가 있어요. 답하기 어려운 질문은 ‘다음에 답할게요’로 넘기면 돼요.",
  },
  {
    t: "질문이 어렵게 느껴져요",
    d: "마이스토리의 질문은 바로 답하기보다 천천히 돌아보도록 만들었어요. 시간을 들여 생각하고 써도 괜찮아요. 떠오르지 않으면 ‘다음에 답할게요’로 넘기고, 생각나면 이어 쓰세요.",
  },
  {
    t: "말로 남기기",
    d: "‘말로 하기’를 누르고 말하면 글로 바뀌고, 목소리도 함께 남아요. 목소리는 ‘음성만 지우기’로 언제든 지울 수 있어요.",
  },
  { t: "사진 넣기", d: "질문마다 ‘사진 넣기’로 그때의 사진을 함께 남길 수 있어요." },
  { t: "글씨 크게 보기", d: "처음 안내에서 고른 글자 크기는 MY의 ‘설정’에서 ‘보통’과 ‘크게’로 언제든 바꿀 수 있어요." },
  {
    t: "주제별과 시기별",
    d: "주제로 답한 기록은 홈의 ‘주제별’에, 시기로 답한 기록은 ‘시기별’에 모여요.",
  },
  {
    t: "기록은 어디에 저장되나요",
    d: `지금은 이 ${device}의 브라우저 안에만 저장돼요. 다른 사람에게 보내지지 않아요. 브라우저 기록을 지우면 함께 지워질 수 있으니, MY의 ‘백업과 복원’에서 가끔 백업 파일을 만들어 두세요.`,
  },
];

function Help() {
  const items = helpItems(useDeviceName());
  return (
    <main className="px-6 pt-12">
      <h1 className="font-serif text-title">도움말</h1>
      <section className="mt-8 rounded-[28px] bg-ink p-6 text-ink-foreground">
        <h2 className="text-body font-medium">처음 안내 다시 보기</h2>
        <p className="mt-2 text-body opacity-80">앱 소개와 화면 둘러보기를 다시 볼 수 있어요.</p>
        <Button asChild variant="palette" className="mt-4 inline-flex h-12 items-center rounded-full bg-card px-6 text-caption font-medium text-foreground"><Link to="/onboarding/$n" params={{ n: "1" }} search={{ mode: "help" }}>처음 안내 보기 →</Link></Button>
      </section>
      <div className="mt-4 space-y-4 desk:grid desk:grid-cols-2 desk:gap-4 desk:space-y-0">
        {items.map((i) => (
          <section key={i.t} className="rounded-[28px] border border-border bg-card p-6">
            <h2 className="text-body font-medium">{i.t}</h2>
            <p className="mt-2 text-body text-muted-foreground">{i.d}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
