import type { Throws } from "@/lib/types";

/** Broad delivery families. */
export type ArmSlotFamily = "overhand" | "three_quarter" | "sidearm" | "underhand";

/**
 * Detailed arm slots. Overhand / three-quarter / sidearm / underhand each
 * split into a few common release heights (plus submarine under underhand).
 */
export type ArmSlot =
  | "oh_high"
  | "oh_true"
  | "oh_low"
  | "tq_high"
  | "tq_true"
  | "tq_low"
  | "sa_high"
  | "sa_true"
  | "sa_low"
  | "un_high"
  | "un_true"
  | "un_sub";

export type ArmSlotOption = {
  id: ArmSlot;
  family: ArmSlotFamily;
  label: string;
  familyLabel: string;
  blurb: string;
};

export const ARM_SLOT_OPTIONS: ArmSlotOption[] = [
  { id: "oh_high", family: "overhand", familyLabel: "오버핸드", label: "하이 오버핸드", blurb: "팔을 머리 위로 높게 가져오는 전형적인 오버핸드" },
  { id: "oh_true", family: "overhand", familyLabel: "오버핸드", label: "오버핸드", blurb: "정수리 근처에서 떨어지는 정통 오버핸드" },
  { id: "oh_low", family: "overhand", familyLabel: "오버핸드", label: "로우 오버핸드", blurb: "오버핸드이지만 릴리스가 조금 낮은 편" },
  { id: "tq_high", family: "three_quarter", familyLabel: "쓰리쿼터", label: "하이 쓰리쿼터", blurb: "오버핸드에 가까운 높은 쓰리쿼터" },
  { id: "tq_true", family: "three_quarter", familyLabel: "쓰리쿼터", label: "쓰리쿼터", blurb: "가장 흔한 사선 릴리스" },
  { id: "tq_low", family: "three_quarter", familyLabel: "쓰리쿼터", label: "로우 쓰리쿼터", blurb: "사이드암에 가까운 낮은 쓰리쿼터" },
  { id: "sa_high", family: "sidearm", familyLabel: "사이드암", label: "하이 사이드암", blurb: "어깨 높이 근처의 높은 사이드암" },
  { id: "sa_true", family: "sidearm", familyLabel: "사이드암", label: "사이드암", blurb: "팔이 몸통 옆에서 나오는 사이드암" },
  { id: "sa_low", family: "sidearm", familyLabel: "사이드암", label: "로우 사이드암", blurb: "허리~엉덩이 쪽의 낮은 사이드암" },
  { id: "un_high", family: "underhand", familyLabel: "언더핸드", label: "하이 언더핸드", blurb: "아래에서 올리되 비교적 높은 언더" },
  { id: "un_true", family: "underhand", familyLabel: "언더핸드", label: "언더핸드", blurb: "아래에서 위로 긁어 올리는 언더핸드" },
  { id: "un_sub", family: "underhand", familyLabel: "언더핸드", label: "서브마린", blurb: "지면 가까이에서 나오는 서브마린" },
];

const BY_ID = new Map(ARM_SLOT_OPTIONS.map((o) => [o.id, o]));

export function armSlotOption(slot: ArmSlot | undefined | null): ArmSlotOption {
  return BY_ID.get(slot ?? "tq_true") ?? ARM_SLOT_OPTIONS[4]!;
}

export function armSlotLabel(slot: ArmSlot | undefined | null): string {
  const opt = armSlotOption(slot);
  return `${opt.familyLabel} · ${opt.label}`;
}

export function isArmSlot(value: unknown): value is ArmSlot {
  return typeof value === "string" && BY_ID.has(value as ArmSlot);
}

/**
 * Catcher's-eye release point inside the strike-zone SVG (viewBox 220×250).
 * Home plate sits near y≈214; the zone box is roughly y≈82–163.
 * Larger y = lower arm slot. Whole ladder sits lower than the old top-of-canvas band
 * so underhand reads below the zone midline, not like a high three-quarter.
 *
 *   overhand      y  28–42
 *   three_quarter y  54–72
 *   sidearm       y  90–114
 *   underhand     y 132–170
 */
export function releasePointForSlot(slot: ArmSlot | undefined, throws: Throws = "R"): { x: number; y: number } {
  const side = throws === "L" ? -1 : 1;
  switch (slot ?? "tq_true") {
    case "oh_high":
      return { x: 110 + side * 4, y: 28 };
    case "oh_true":
      return { x: 110 + side * 9, y: 35 };
    case "oh_low":
      return { x: 110 + side * 14, y: 42 };
    case "tq_high":
      return { x: 110 + side * 28, y: 54 };
    case "tq_true":
      return { x: 110 + side * 36, y: 63 };
    case "tq_low":
      return { x: 110 + side * 46, y: 72 };
    case "sa_high":
      return { x: 110 + side * 54, y: 90 };
    case "sa_true":
      return { x: 110 + side * 62, y: 102 };
    case "sa_low":
      return { x: 110 + side * 70, y: 114 };
    case "un_high":
      return { x: 110 + side * 56, y: 132 };
    case "un_true":
      return { x: 110 + side * 64, y: 150 };
    case "un_sub":
      return { x: 110 + side * 72, y: 170 };
    default:
      return { x: 110 + side * 36, y: 63 };
  }
}

/**
 * Mid-path bend. Keep vertical bias modest — large +y made underhand arcs look
 * like every pitch was hooked upward into a three-quarter tunnel.
 */
export function slotBreakBias(slot: ArmSlot | undefined): { x: number; y: number } {
  switch (slot ?? "tq_true") {
    case "oh_high":
      return { x: 0, y: -4 };
    case "oh_true":
      return { x: 1, y: -2 };
    case "oh_low":
      return { x: 2, y: 0 };
    case "tq_high":
      return { x: 5, y: 2 };
    case "tq_true":
      return { x: 7, y: 3 };
    case "tq_low":
      return { x: 9, y: 4 };
    case "sa_high":
      return { x: 11, y: 3 };
    case "sa_true":
      return { x: 13, y: 2 };
    case "sa_low":
      return { x: 15, y: 1 };
    case "un_high":
      return { x: 12, y: -2 };
    case "un_true":
      return { x: 14, y: -4 };
    case "un_sub":
      return { x: 16, y: -6 };
    default:
      return { x: 7, y: 3 };
  }
}

/**
 * Documented / widely agreed KBO deliveries.
 * Prefer this over hash defaults — wrong sidearm/underhand labels are worse than a bland three-quarter.
 */
export const KNOWN_ARM_SLOTS: Record<string, ArmSlot> = {
  // —— Overhand ——
  선동열: "oh_true",
  오승환: "oh_true",
  한기주: "oh_true",
  염종석: "oh_true",
  조계현: "oh_true",
  정민태: "oh_true",
  안우진: "oh_true",
  폰트: "oh_true",
  헥터: "oh_true",
  밴덴헐크: "oh_true",
  보우덴: "oh_true",
  레이번: "oh_true",
  다카쓰: "oh_true",
  송진우: "oh_low",
  유희관: "oh_low",

  // —— Three-quarter ——
  류현진: "tq_true",
  김광현: "tq_true",
  양현종: "tq_true",
  구창모: "tq_high",
  윤석민: "tq_high",
  정민철: "tq_true",
  김상진: "tq_true",
  봉중근: "tq_true",
  장원삼: "tq_true",
  권혁: "tq_true",
  위재영: "tq_true",
  김재윤: "tq_true",
  소형준: "tq_true",
  배제성: "tq_true",
  쿠에바스: "tq_true",
  데스파이네: "tq_true",
  루친스키: "tq_true",
  니퍼트: "tq_true",
  밴헤켄: "tq_true",
  요키시: "tq_true",
  브리검: "tq_true",
  장원준: "tq_true",
  이용찬: "tq_true",
  손승락: "tq_true",
  하영민: "tq_true",
  임창민: "tq_true",
  노경은: "tq_true",
  정우람: "tq_true", // 좌완 정통 불펜 — 사이드암 아님
  장명부: "tq_low",
  윤성환: "tq_true",
  배영수: "tq_true",
  송승준: "tq_high",
  채병용: "tq_high",
  조상우: "tq_high",
  안지만: "tq_high",
  소사: "tq_high",
  팻딘: "tq_high",
  차우찬: "tq_low",
  함덕주: "tq_high",
  이현승: "tq_true",
  오주원: "tq_true",
  김택형: "tq_true",
  심재민: "tq_true",
  이상열: "tq_true",
  김원형: "tq_true",
  송신영: "tq_true",
  윤길현: "tq_true",
  진필중: "tq_true",
  김진성: "tq_true",
  문성현: "tq_true",
  주권: "tq_true",
  김상수: "tq_true",
  김용수: "oh_true",
  모리만도: "tq_low",
  라이트: "tq_true",
  마틴: "tq_true",

  // —— Sidearm ——
  임창용: "sa_true",
  고영표: "sa_low", // 낮은 사이드 / 높은 언더 경계
  구대성: "sa_true",
  심창민: "sa_true",
  한현희: "sa_true",
  마정길: "sa_true",
  원종현: "sa_low",
  임기영: "sa_true",
  조웅천: "sa_true",
  정명원: "sa_true",
  가득염: "sa_true",
  최창호: "sa_high",

  // —— Underhand / submarine ——
  이강철: "un_true",
  한희민: "un_true",
  박정현: "un_sub",
  김현욱: "un_true",
  정대현: "un_sub",
  박종훈: "un_sub",
  김신부: "un_true",
  조용훈: "un_true",
  성영재: "un_high",
  이길환: "un_true",
  이광권: "un_true",
  박동수: "un_true",
  양현: "un_true",
  김대우: "un_true",
};

/** Pick a sensible default when a pitcher has no stored slot. */
export function defaultArmSlot(name: string, throws: Throws = "R"): ArmSlot {
  if (KNOWN_ARM_SLOTS[name]) return KNOWN_ARM_SLOTS[name]!;
  // Unknown arms: conventional defaults (do not invent sidearm/underhand).
  return throws === "L" ? "tq_true" : "oh_true";
}
