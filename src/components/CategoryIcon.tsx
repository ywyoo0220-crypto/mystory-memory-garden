// MyStory category icons — 24×24, single color (inherits `currentColor`).
// Topic icons (T1–T10) are line drawings, the same set as the printed book and posters; life-period icons (A1–A9) are a clock face; the
// hand moves one hour per period, from 12 o'clock (유년기) to 8 o'clock (80대 이후). Nothing fills, so
// no period reads as "full" or "finished".
import * as React from "react";

const PATHS: Record<string, string> = {
  "T1": "<path d=\"M5 20.5V13a5 5 0 0 1 5-5h8.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M14.5 4.5L18.5 8l-4 3.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"5\" cy=\"20\" r=\"1.7\" fill=\"currentColor\"/>",
  "T2": "<path d=\"M3.5 11L12 3.5l8.5 7.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M6 9.5V20.5h12V9.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"9.8\" cy=\"14.2\" r=\"2\" fill=\"currentColor\"/><circle cx=\"14.8\" cy=\"16\" r=\"1.4\" fill=\"currentColor\"/>",
  "T3": "<rect x=\"3.5\" y=\"8\" width=\"17\" height=\"12.5\" rx=\"2.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M3.5 13.5h17\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"10.4\" y=\"11.6\" width=\"3.2\" height=\"3.8\" rx=\"0.8\" fill=\"currentColor\"/>",
  "T4": "<path d=\"M12 20C5.4 15.2 3 11.8 3 8.8A4.6 4.6 0 0 1 12 7.2 4.6 4.6 0 0 1 21 8.8C21 11.8 18.6 15.2 12 20Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12 20C5.4 15.2 3 11.8 3 8.8A4.6 4.6 0 0 1 12 7.2Z\" fill=\"currentColor\"/>",
  "T5": "<path d=\"M2.5 12.5H7l2.5-6 4 11 2.5-5h5.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
  "T6": "<path d=\"M2.5 19.5L9.5 6.5l3.6 6.4 2.4-3.4 6 10z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
  "T7": "<circle cx=\"9\" cy=\"12\" r=\"6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"15\" cy=\"12\" r=\"6\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12 6.8A6 6 0 0 1 12 17.2 6 6 0 0 1 12 6.8Z\" fill=\"currentColor\"/>",
  "T8": "<path d=\"M12 6.5C9.6 4.9 6.2 4.7 3.5 5.5v13c2.7-.8 6.1-.6 8.5 1 2.4-1.6 5.8-1.8 8.5-1v-13c-2.7-.8-6.1-.6-8.5 1Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12 6.5v13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
  "T9": "<polygon points=\"12.00,3.40 14.35,9.36 20.75,9.76 15.80,13.84 17.41,20.04 12.00,16.60 6.59,20.04 8.20,13.84 3.25,9.76 9.65,9.36\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
  "T10": "<path d=\"M15.08 3.54 A9 9 0 1 0 16.50 19.79 A7.2 7.2 0 0 1 15.08 3.54 Z\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"17.4\" cy=\"6.4\" r=\"1.2\" fill=\"currentColor\"/>",
  "A1": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L12.00 5.00\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>",
  "A2": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L15.50 5.94\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>",
  "A3": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L18.06 8.50\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>",
  "A4": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L19.00 12.00\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>",
  "A5": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L18.06 15.50\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>",
  "A6": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L15.50 18.06\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>",
  "A7": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L12.00 19.00\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>",
  "A8": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L8.50 18.06\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>",
  "A9": "<circle cx=\"12\" cy=\"12\" r=\"9.9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\"/><path d=\"M12 12L5.94 15.50\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>"
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
