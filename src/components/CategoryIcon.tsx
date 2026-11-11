// MyStory category icons — 24×24, single color (inherits `currentColor`).
// Topic icons (T1–T10) are simple geometric marks; life-period icons (A1–A9) are a clock-like pie
// whose filled wedge grows from 유년기 (1/9) to 80대 이후 (full circle).
import * as React from "react";

const PATHS: Record<string, string> = {
  "T1": "<path d=\"M4 19V9h11V4l6 7-6 7v-5H8v6z\" fill=\"currentColor\"/>",
  "T2": "<path d=\"M12 3l9 8h-3v10H6V11H3z\" fill=\"currentColor\"/>",
  "T3": "<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2\" fill=\"currentColor\"/>",
  "T4": "<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/><path d=\"M5.6 18.4A9 9 0 0 1 18.4 5.6z\" fill=\"currentColor\"/>",
  "T5": "<path d=\"M9 3h6v6h6v6h-6v6H9v-6H3V9h6z\" fill=\"currentColor\"/>",
  "T6": "<path d=\"M2 20L9 6l4 7 3-4 6 11z\" fill=\"currentColor\"/>",
  "T7": "<circle cx=\"8.5\" cy=\"12\" r=\"6.5\" fill=\"currentColor\"/><circle cx=\"15.5\" cy=\"12\" r=\"6.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.4\"/>",
  "T8": "<path d=\"M4 21V11a8 8 0 0 1 16 0v10h-5v-9a3 3 0 0 0-6 0v9z\" fill=\"currentColor\"/>",
  "T9": "<path d=\"M12 2l3 7 7 .6-5.3 4.6 1.6 7.3L12 17.6 5.7 21.5l1.6-7.3L2 9.6 9 9z\" fill=\"currentColor\"/>",
  "T10": "<path d=\"M15 3a9 9 0 1 0 6 15A7.5 7.5 0 0 1 15 3z\" fill=\"currentColor\"/>",
  "A1": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 12V2A10 10 0 0 1 18.43 4.34Z\" fill=\"currentColor\"/>",
  "A2": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 12V2A10 10 0 0 1 21.85 10.26Z\" fill=\"currentColor\"/>",
  "A3": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 12V2A10 10 0 0 1 20.66 17.00Z\" fill=\"currentColor\"/>",
  "A4": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 12V2A10 10 0 0 1 15.42 21.40Z\" fill=\"currentColor\"/>",
  "A5": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 12V2A10 10 0 1 1 8.58 21.40Z\" fill=\"currentColor\"/>",
  "A6": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 12V2A10 10 0 1 1 3.34 17.00Z\" fill=\"currentColor\"/>",
  "A7": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 12V2A10 10 0 1 1 2.15 10.26Z\" fill=\"currentColor\"/>",
  "A8": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><path d=\"M12 12V2A10 10 0 1 1 5.57 4.34Z\" fill=\"currentColor\"/>",
  "A9": "<circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"currentColor\"/>"
};

export const CATEGORY_NAMES: Record<string, string> = {
  "T1": "인생의 전환점",
  "T2": "가족",
  "T3": "일과 역할",
  "T4": "사랑과 증오",
  "T5": "건강",
  "T6": "고난과 역경",
  "T7": "인간관계",
  "T8": "학문과 예술",
  "T9": "신념과 가치관",
  "T10": "이별과 죽음",
  "A1": "유년기",
  "A2": "10대",
  "A3": "20대",
  "A4": "30대",
  "A5": "40대",
  "A6": "50대",
  "A7": "60대",
  "A8": "70대",
  "A9": "80대 이후"
};

type Props = { id: string; size?: number; className?: string; title?: string };

export function CategoryIcon({ id, size = 20, className, title }: Props) {
  const body = PATHS[id];
  if (!body) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ flex: "none", display: "block" }}
      dangerouslySetInnerHTML={{ __html: body }}
    />
  );
}
