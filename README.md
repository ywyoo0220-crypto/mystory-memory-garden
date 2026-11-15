# Mystory Memory Garden

Build a mobile-first web app called **MyStory** — a personal archive where people (primary users: Koreans aged 60+, but it must feel natural for people in their 30s–40s too) record their life stories by answering structured questions. All UI copy is in **Korean**. Do not make it look like a "senior app": no pastel Material colors, no oversized cartoon icons, no skeuomorphism. Aim for the quality bar of Apple / Toss / an editorial magazine app.

I attached `mystory_questions.json` (all categories, questions, and per-category colors) and reference screenshots. Use the JSON as the single source of truth — do not invent or rewrite questions.

## 1. Concept & information architecture
- Questions are organized in two independent entry paths:
  - **주제별 (by topic)** — 10 topics (T1–T10).
  - **시간순 (by life period)** — 9 periods (A1 유년기, A2 10대 … A8 70대, A9 80대 이후).
- Each category has several **core questions**; each core question has **3 follow-up questions**. Question IDs: `T1-Q1`, `A3-Q2`, etc.
- Categories with `pending > 0` and an empty question list show "질문 준비 중" and are not tappable into questions.
- **Entry-path separation (important):** a record made from a topic question appears only in the 주제별 home view; a record made from a period question appears only in the 시간순 view. Same-colored topic/period pairs therefore never appear on the same screen.

## 2. Screens
Bottom navigation (floating pill, centered, text-only labels): **홈 · 기록하기 · 도움말 · MY**. To the right of the pill, a separate round black button **크게** toggles a large-text mode (scales the whole UI ~120%).

1. **홈 (Home)**
   - Top bar: serif wordmark "MyStory" on the left, segmented toggle **주제별 | 시간순** on the right (pill shape, selected = black fill, white text).
   - Below: a **stacked deck of category cards**, one per category that has records. Cards overlap like a stack (each card has 32px top radius and overlaps the previous one by 32px). A collapsed card shows: category label pill (icon + name), a pill "기록 n개 | 펼치기 ⌄" on the right, and the first recorded core question as a large serif headline.
   - Tapping a card expands it smoothly (animated height) to show every recorded answer: the core question, then each follow-up question (bold, sans) with the user's answer below (regular). Photos appear as rounded images; voice answers appear as a play button + thin waveform (44 thin bars) + duration.
   - At the bottom of an expanded card: two equal pill buttons — **수정하기** (outline) and **"{카테고리} 이야기 더 하기"** (filled). Tapping 수정하기 expands to reveal **고치기 / 지우기** halves.
   - If the other view has records: a black full-width button "시간순 보기에 기록 n개가 더 있어요" (or 주제별…) that switches the toggle.
   - Empty state: friendly prompt + button to start recording.
   - Seed 5–8 example records (some with a photo, two with voice) so the home looks alive; MY has a "예시 기록 비우기" option.
2. **기록하기 (Record)** → choose 주제로 / 시기로 → category list (each row: colored circular badge with glyph, name, "n개 중 m개 기록함", thin progress bar, chevron) → question list for that category (answered questions show a check and the category background color) → **answer flow**.
3. **Answer flow:** one question per step with a segmented progress bar (core + 3 follow-ups). For each step the user can **type**, **speak** (Web Speech API speech-to-text, ko-KR; fall back gracefully with a message suggesting the keyboard mic if unsupported), or **attach a photo**. Every step is skippable ("다음에 답할게요"). After the last step: a completion screen showing the new card in its category colors, with "홈에서 보기" and "이어서 기록하기".
4. **도움말 (Help):** short, plain explanations of how to record, voice input, large text, and where data is stored.
5. **MY:** record counts, large-text toggle, clear example records, export all records as JSON, delete all.

## 3. Visual design system
**Typography**
- Headlines and question text: **Noto Serif KR** (400/500). UI labels, buttons, body answers: **Pretendard** (or system sans).
- Large, generous sizes: card headline ~24px/1.4, body 17px/1.7, labels 13–14px. `word-break: keep-all` for Korean.

**Layout**
- 8pt spacing grid, 24px side padding, max-width 440px centered on desktop with a warm off-white page background `#F5F2EE`.
- Pills everywhere: toggles, labels, buttons all fully rounded (999px). Minimum tap target 48px.
- No drop shadows on cards; flat color fields. Subtle motion only (respect `prefers-reduced-motion`).

**Color rule ("대치" palette — this is the core of the design)**
Each pair of categories shares a 3-color family: a **mid color**, a **deep color**, and a **pale accent**.
- **Topic cards:** background = mid color, text = deep color, label/pill background = pale accent (pill text = deep).
- **Period cards:** background = deep color, text = mid color (the two are swapped), label/pill background = pale accent (pill text = deep).
- Never use pure black text on category cards; text always comes from the family. All background/text pairs are ≥ 4.5:1 contrast — keep it that way.
- Filled button inside a card: topic → deep background + pale text; period → mid background + deep text.
- List screens use the `tint` color as the light background for answered items and badges.

| Family | Topic (bg / text) | Period (bg / text) | Pill |
|---|---|---|---|
| Gold–Aubergine | T3 일과 역할 `#D4B758` / `#421C3B` | A1 유년기 `#421C3B` / `#D4B758` | `#EBEDFE` |
| Olive | T1 인생의 전환점 `#AABC56` / `#353500` | A2 10대 `#353500` / `#AABC56` | `#EEE7FD` |
| Green | T7 인간관계 `#5DC47E` / `#003D2A` | A3 20대 `#003D2A` / `#5DC47E` | `#FFE1F4` |
| Teal | T9 신념과 가치관 `#44C1D2` / `#00364A` | A4 30대 `#00364A` / `#44C1D2` | `#FDE5DF` |
| Blue | T5 건강 `#5F9EF8` / `#181F96` | A5 40대 `#181F96` / `#5F9EF8` | `#F3F3E2` |
| Violet | T6 고난과 역경 `#A18FE2` / `#2E2357` | A6 50대 `#2E2357` / `#A18FE2` | `#F0F2CF` |
| Pink | T4 사랑과 증오 `#EC759A` / `#511C25` | A7 60대 `#511C25` / `#EC759A` | `#D1F5EA` |
| Orange | T2 가족 `#ED6536` / `#481A1D` | A8 70대 `#481A1D` / `#ED6536` | `#CCE7FD` |
| Clay | T8 학문과 예술 `#D5744F` / `#441B09` | A9 80대 이후 `#441B09` / `#D5744F` | `#ACECF6` |
| Mauve (unpaired) | T10 이별과 죽음 `#BF8AB9` / `#421C3B` | — | `#F3ECCE` |

(Exact values incl. `tint` are in the JSON under each category's `color`.)

**Glyphs**
- Period badges: a circle filled like a clock/pie that grows with the period (유년기 = small wedge … 80대 이후 = full circle).
- Topic badges: simple, thin-line, geometric icons (no emoji).
- Neutral UI: black `#1A1918` for primary buttons, nav selected state, and the 크게 button.

## 4. Data & tech
- React + TypeScript + Tailwind. **No login and no backend for now**: store records in `localStorage` (wrap all access in try/catch), keyed by question ID: `{ answers: string[4], photo?: dataURL, voice?: { step, durationSec, text }, updatedAt }`.
- Load categories/questions/colors from the attached JSON as a static module.
- Accessibility: semantic buttons, `aria-pressed` on toggles, visible focus rings, large-text mode persisted.

## 5. Tone of UI copy (Korean)
Short, calm, contemporary — not childish, not overly honorific. Examples: "무엇부터 기록할까요?", "시기를 고르세요.", "주제를 고르세요.", "쓰거나 말로 남기세요.", "답하고 싶은 질문만 고르면 됩니다.", "기록했습니다.", "{카테고리} 더 기록하기".

Build the home screen (both views, with seeded examples) and the full recording flow first; then Help and MY.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://mystory-memory-garden.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b5f6f44d-a8c0-4c96-9cc0-ef24a5bf5671).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
