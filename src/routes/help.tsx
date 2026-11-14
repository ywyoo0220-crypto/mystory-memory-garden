import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "도움말 — myStory" },
      { name: "description", content: "기록하는 방법, 말로 입력하기, 큰 글씨, 저장 위치 안내." },
      { property: "og:title", content: "도움말 — myStory" },
      { property: "og:description", content: "기록하는 방법, 말로 입력하기, 큰 글씨, 저장 위치 안내." },
    ],
  }),
  component: Help,
});

const items = [
  {
    t: "기록하는 방법",
    d: "아래 ‘기록하기’를 누르고 주제나 시기를 고르세요. 질문 하나에 이어지는 질문 세 개가 있어요. 답하기 어려운 질문은 ‘다음에 답할게요’로 넘기면 됩니다.",
  },
  {
    t: "말로 남기기",
    d: "‘말로 하기’를 누르고 말하면 글로 바뀌고, 목소리도 함께 남아요. 목소리는 ‘음성만 지우기’로 언제든 지울 수 있어요.",
  },
  { t: "사진 넣기", d: "질문마다 ‘사진 넣기’로 그때의 사진을 함께 남길 수 있어요." },
  { t: "글씨 크게 보기", d: "화면 오른쪽 아래 ‘크게’ 버튼을 누르면 모든 글씨가 커집니다. 다시 누르면 원래대로 돌아와요." },
  {
    t: "주제별과 시간순",
    d: "주제로 답한 기록은 홈의 ‘주제별’에, 시기로 답한 기록은 ‘시간순’에 모입니다.",
  },
  {
    t: "기록은 어디에 저장되나요",
    d: "지금은 이 기기의 브라우저 안에만 저장됩니다. 다른 사람에게 보내지지 않아요. 브라우저 기록을 지우면 함께 지워질 수 있으니, MY에서 가끔 내보내기를 해 두세요.",
  },
];

function Help() {
  return (
    <main className="px-6 pt-12">
      <h1 className="font-serif text-[1.75rem]">도움말</h1>
      <section className="mt-8 rounded-[28px] bg-ink p-6 text-ink-foreground">
        <h2 className="text-[1.0625rem] font-bold">처음 안내 다시 보기</h2>
        <p className="mt-2 text-[1rem] leading-[1.7] opacity-80">앱 소개와 화면 둘러보기를 다시 볼 수 있어요.</p>
        <Link to="/onboarding/$n" params={{ n: "1" }} className="mt-4 inline-flex h-12 items-center rounded-full bg-card px-5 text-[0.9375rem] font-semibold text-foreground">처음 안내 보기 →</Link>
      </section>
      <div className="mt-3 space-y-3">
        {items.map((i) => (
          <section key={i.t} className="rounded-[28px] border border-border bg-card p-6">
            <h2 className="text-[1.0625rem] font-bold">{i.t}</h2>
            <p className="mt-2 text-[1.0625rem] leading-[1.7] text-muted-foreground">{i.d}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
