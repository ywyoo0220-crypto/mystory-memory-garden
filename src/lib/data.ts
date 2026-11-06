import raw from "@/data/questions.json";

export type Kind = "topic" | "period";
export type CatColor = { background: string; text: string; pill: string; pillText: string; tint: string };
export type Question = { id: string; core: string; followUps: string[] };
export type Category = {
  id: string;
  name: string;
  questions: Question[];
  pending: number;
  color: CatColor;
  kind: Kind;
  index: number;
};

const data = raw as unknown as {
  topics: Omit<Category, "kind" | "index">[];
  ages: Omit<Category, "kind" | "index">[];
};

export const topics: Category[] = data.topics.map((c, i) => ({ ...c, kind: "topic", index: i }));
export const periods: Category[] = data.ages.map((c, i) => ({ ...c, kind: "period", index: i }));
export const allCategories = [...topics, ...periods];

export function getCategory(id: string) {
  return allCategories.find((c) => c.id === id);
}
export function categoryOfQuestion(qid: string) {
  return getCategory(qid.split("-")[0] ?? "");
}
export function getQuestion(qid: string) {
  return categoryOfQuestion(qid)?.questions.find((q) => q.id === qid);
}
export function categoriesOf(kind: Kind) {
  return kind === "topic" ? topics : periods;
}
/** Card surface colors for a category; period cards already carry swapped values in the JSON. */
export function cardColors(c: Category) {
  const { background, text, pill, pillText } = c.color;
  return {
    bg: background,
    fg: text,
    pill,
    pillText,
    btnBg: text,
    btnFg: c.kind === "topic" ? pill : background,
  };
}
