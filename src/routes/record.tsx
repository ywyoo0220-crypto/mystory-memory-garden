import { catVars } from "@/lib/theme";
import { createFileRoute, Link } from "@tanstack/react-router";
import { periods, topics } from "@/lib/data";
import { CategoryIcon } from "@/components/CategoryIcon";

export const Route = createFileRoute("/record")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "기록하기 — myStory" },
      { name: "description", content: "주제나 시기를 골라 나의 이야기를 기록하세요." },
      { property: "og:title", content: "기록하기 — myStory" },
      { property: "og:description", content: "주제나 시기를 골라 나의 이야기를 기록하세요." },
    ],
  }),
  component: RecordStart,
});

function RecordStart() {
  const opts = [
    { kind: "topic" as const, title: "주제로", desc: "가족, 일, 사랑처럼 주제를 골라 답해요.", cats: topics.slice(0, 5) },
    { kind: "period" as const, title: "시기로", desc: "유년기부터 지금까지, 시기를 골라 답해요.", cats: periods.slice(0, 5) },
  ];
  return (
    <main className="px-6 pt-12">
      <h1 className="font-serif text-[1.75rem] leading-[1.4]">무엇부터 기록할까요?</h1>
      <p className="mt-3 text-[1.0625rem] leading-[1.7] text-muted-foreground">답하고 싶은 질문만 고르면 됩니다.</p>
      <div className="mt-8 space-y-3">
        {opts.map((o) => (
          <Link
            key={o.kind}
            to="/kind/$kind"
            params={{ kind: o.kind }}
            className="block rounded-[32px] bg-card p-6 transition-transform active:scale-[0.99]"
          >
            <div className="flex -space-x-1.5">
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
            <p className="mt-5 font-serif text-[1.5rem]">{o.title}</p>
            <p className="mt-1 text-[1rem] leading-[1.6] text-muted-foreground">{o.desc}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
