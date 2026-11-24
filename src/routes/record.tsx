import { catVars } from "@/lib/theme";
import { createFileRoute, Link } from "@tanstack/react-router";
import { periods, topics } from "@/lib/data";
import { CategoryIcon } from "@/components/CategoryIcon";

export const Route = createFileRoute("/record")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "기록하기 — 마이스토리" },
      { name: "description", content: "주제나 시기를 골라 나의 이야기를 기록해요." },
      { property: "og:title", content: "기록하기 — 마이스토리" },
      { property: "og:description", content: "주제나 시기를 골라 나의 이야기를 기록해요." },
    ],
  }),
  component: RecordStart,
});

/** 미리 보여줄 주제 다섯 개 (순서대로). */
const TOPIC_PREVIEW = ["T4", "T1", "T7", "T9", "T10"];
/** 미리 보여줄 시기 다섯 개 (순서대로). */
const PERIOD_PREVIEW = ["A1", "A3", "A6", "A7", "A9"];
const previewPeriods = PERIOD_PREVIEW.map((id) => periods.find((c) => c.id === id)).filter(
  (c): c is (typeof periods)[number] => Boolean(c),
);
const previewTopics = TOPIC_PREVIEW.map((id) => topics.find((c) => c.id === id)).filter(
  (c): c is (typeof topics)[number] => Boolean(c),
);

function RecordStart() {
  const opts = [
    { kind: "topic" as const, title: "주제로 기록하기", desc: "가족, 일, 건강처럼 주제별로 기록해요.", cats: previewTopics },
    { kind: "period" as const, title: "시기로 기록하기", desc: "유년기부터 지금까지, 시기별로 기록해요.", cats: previewPeriods },
  ];
  return (
    <main className="px-6 pt-12">
      <h1 className="font-serif text-title">무엇부터 기록할까요?</h1>
      <p className="mt-4 text-body text-muted-foreground">답하고 싶은 질문만 골라도 돼요.</p>
      <div className="mt-8 space-y-4 tab:grid tab:grid-cols-2 tab:gap-4 tab:space-y-0">
        {opts.map((o) => (
          <Link
            key={o.kind}
            to="/kind/$kind"
            params={{ kind: o.kind }}
            className="block h-full rounded-[32px] border border-border bg-card p-6 transition-transform active:scale-[0.99]"
          >
            <div className="flex -space-x-2">
              {o.cats.map((c) => (
                <span
                  key={c.id}
                  className="flex size-9 items-center justify-center rounded-full ring-2 ring-card"
                  style={{ ...catVars(c.id), background: c.color.background }}
                >
                  <span className="inline-flex" style={{ color: c.color.text }}><CategoryIcon id={c.id} size={16} /></span>
                </span>
              ))}
            </div>
            <p className="mt-6 font-serif text-title">{o.title}</p>
            <p className="mt-1 text-body text-muted-foreground">{o.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
