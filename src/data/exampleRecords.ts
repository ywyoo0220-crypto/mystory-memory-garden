// src/data/exampleRecords.ts
// 예시 기록 8개. "예시 기록 담기"와 첫 실행 시 이 데이터를 localStorage 기록으로 넣는다.
// daysAgo: 기록한 시점(며칠 전). 시간(t) = Date.now() - daysAgo*86400000
// photos[step]: 단계별 사진 경로(없으면 null). voices: 파일 없는 예시 음성(재생 시 글을 합성음으로 읽음).
export type ExampleRecord = { id:string; daysAgo:number; answers:[string,string,string,string]; photos:(string|null)[]; voices:{step:number;dur:string;text:string}[]; example:true };
export const EXAMPLE_RECORDS: ExampleRecord[] = [
  {
    "id": "T10-Q2",
    "daysAgo": 10,
    "answers": [
      "어릴 적 학교 끝나고 집에 돌아가는 길에 늘 반겨주던 개가 한 마리 있었는데, 나를 정말 많이 따랐거든. 이름도 지어주고 먹을 것도 자주 챙겨줬는데 갑자기 사라져서 방학 내내 찾으러 다녔다.",
      "",
      "",
      ""
    ],
    "photos": [
      null,
      null,
      null,
      null
    ],
    "voices": [],
    "example": true
  },
  {
    "id": "T2-Q1",
    "daysAgo": 9,
    "answers": [
      "저녁이면 라디오 소리와 밥 짓는 냄새가 같이 나던 집이었어요.",
      "아버지가 퇴근하시면 다 같이 마루에 둘러앉아 수박을 쪼개 먹던 장면이요.",
      "",
      ""
    ],
    "photos": [
      null,
      null,
      null,
      null
    ],
    "voices": [],
    "example": true
  },
  {
    "id": "T8-Q3",
    "daysAgo": 8,
    "answers": [
      "‘섬집 아기’를 들으면 어머니 생각이 나요.",
      "어머니가 빨래를 개면서 늘 흥얼거리시던 노래예요.",
      "",
      ""
    ],
    "photos": [
      null,
      null,
      null,
      null
    ],
    "voices": [
      {
        "step": 2,
        "dur": "0:36",
        "text": "따뜻하면서도 조금 쓸쓸해요. 어머니가 빨래 개시면서 부르시던 게 생각나서, 들으면 지금도 그 마루에 앉아 있는 것 같아요."
      }
    ],
    "example": true
  },
  {
    "id": "T1-Q1",
    "daysAgo": 7,
    "answers": [
      "젊었을 때 다니던 직장을 그만두고 작은 가게를 시작했을 때. 처음에는 두려움이 컸지만 그 일을 계기로 제 힘으로 삶을 꾸려나간다는 책임감을 배우게 되었지.",
      "서른다섯 살 봄이었어요. 아이들이 아직 어렸지요.",
      "남편이 제일 반대했는데, 결국 가게 간판은 남편이 직접 달아 주었어요.",
      "새벽 다섯 시에 일어나는 사람이 되었어요. 힘들었지만 내 이름으로 된 무언가가 생겼다는 게 좋았어요."
    ],
    "photos": [
      "/example-photo.jpg",
      null,
      null,
      null
    ],
    "voices": [],
    "example": true
  },
  {
    "id": "T7-Q2",
    "daysAgo": 6,
    "answers": [
      "국민학교 동창 영숙이. 지금도 일주일에 한 번은 전화해요.",
      "남편 보내고 혼자 있을 때 매일 반찬을 들고 왔어요.",
      "",
      ""
    ],
    "photos": [
      null,
      null,
      null,
      null
    ],
    "voices": [],
    "example": true
  },
  {
    "id": "A1-Q3",
    "daysAgo": 5,
    "answers": [
      "고무줄놀이를 제일 좋아했어요.",
      "",
      "골목에 감나무가 있었고, 여름 저녁이었어요.",
      ""
    ],
    "photos": [
      null,
      null,
      null,
      null
    ],
    "voices": [
      {
        "step": 1,
        "dur": "0:52",
        "text": "동네 언니들하고 해 질 때까지 했지. 엄마가 밥 먹으라고 부르면 그제야 들어갔어요. 언니들이 다리를 높이 올리면 나는 키가 작아서 늘 깍두기였어."
      }
    ],
    "example": true
  },
  {
    "id": "A3-Q4",
    "daysAgo": 4,
    "answers": [
      "스물셋에 서울로 혼자 올라온 거요.",
      "시골에서 계속 살 수는 없다고 생각했어요.",
      "",
      ""
    ],
    "photos": [
      null,
      null,
      null,
      null
    ],
    "voices": [],
    "example": true
  },
  {
    "id": "A6-Q3",
    "daysAgo": 3,
    "answers": [
      "쉰다섯에 수채화를 배우기 시작했어요.",
      "주민센터 게시판에서 강좌 안내를 봤어요.",
      "일주일에 두 번, 십 년 가까이 다녔어요.",
      "잘 그리는 것보다 오래 들여다보는 법을 배웠어요."
    ],
    "photos": [
      null,
      null,
      null,
      null
    ],
    "voices": [],
    "example": true
  }
];
