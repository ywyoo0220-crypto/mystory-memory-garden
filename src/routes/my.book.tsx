import { createFileRoute } from "@tanstack/react-router";
import { SubHeader } from "@/components/my/ui";

export const Route = createFileRoute("/my/book")({
  head: () => ({
    meta: [
      { title: "책으로 만들기 — 마이스토리" },
      { name: "description", content: "마이스토리의 기록은 이런 책으로 만들 수 있어요." },
      { property: "og:title", content: "책으로 만들기 — 마이스토리" },
      { property: "og:description", content: "마이스토리의 기록은 이런 책으로 만들 수 있어요." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookPage,
});

/**
 * What the records can become in print. An introduction only: there is no ordering in this
 * prototype, so the page states a possibility and has no action button.
 * Images: mockups made from the persona C book draft (170×240mm).
 */
function BookPage() {
  return (
    <main className="pb-32">
      <SubHeader title="책으로 만들기" />
      <div className="space-y-8 px-6">
        <div>
          <p className="text-body font-medium">마이스토리의 기록은 이런 책으로 만들 수 있어요.</p>
          <p className="mt-2 text-caption text-muted-foreground [word-break:keep-all]">
            남긴 질문과 답이 주제와 시기의 차례대로 실려요. 기록마다 그 주제나 시기의 색으로 쪽이 바뀌고, 함께 남긴 사진도 들어가요.
          </p>
        </div>

        <figure>
          <div className="flex justify-center rounded-[28px] bg-muted px-8 py-10">
            <img src="/book/C_cover_mock.webp" alt="이영숙의 책 표지. 연한 초록 바탕에 버드나무 수채화가 있다." className="w-[78%] max-w-[18rem]" />
          </div>
          <figcaption className="mt-2 text-caption text-muted-foreground">표지 · 170×240mm</figcaption>
        </figure>

        <figure>
          <img src="/book/C_spread_5.webp" alt="펼친 면. 왼쪽은 노란 바탕에 질문과 답, 오른쪽은 수채화 도구 사진." className="w-full" />
          <figcaption className="mt-2 text-caption text-muted-foreground">인생의 전환점 · 질문과 답, 함께 남긴 사진</figcaption>
        </figure>

        <figure>
          <img src="/book/C_spread_7.webp" alt="펼친 면. 왼쪽은 주황 바탕에 오래된 가족 사진, 오른쪽은 질문과 답." className="w-full" />
          <figcaption className="mt-2 text-caption text-muted-foreground">가족 · 주제마다 다른 색으로 장이 바뀌어요</figcaption>
        </figure>

        <p className="text-caption text-muted-foreground [word-break:keep-all]">
          예시는 가상 인물 이영숙의 기록으로 만든 책 시안이에요. 책에 실린 사진은 생성형 AI로 만든 이미지예요.
        </p>
      </div>
    </main>
  );
}
