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
 * Families are separated mainly by height (y↓ = lower arm) and lateral offset
 * (away from center toward the throwing arm). Gaps between families are intentional
 * so 하이 쓰리쿼터 never sits on top of 오버핸드.
 *
 *   overhand     y  8–18,  x≈4–14
 *   three_quarter y 30–46, x≈30–48
 *   sidearm      y 58–78, x≈54–70
 *   underhand    y 92–118,x≈58–72
 */
export function releasePointForSlot(slot: ArmSlot | undefined, throws: Throws = "R"): { x: number; y: number } {
  const side = throws === "L" ? -1 : 1;
  switch (slot ?? "tq_true") {
    case "oh_high":
      return { x: 110 + side * 4, y: 8 };
    case "oh_true":
      return { x: 110 + side * 9, y: 13 };
    case "oh_low":
      return { x: 110 + side * 14, y: 18 };
    case "tq_high":
      return { x: 110 + side * 30, y: 30 };
    case "tq_true":
      return { x: 110 + side * 38, y: 38 };
    case "tq_low":
      return { x: 110 + side * 48, y: 46 };
    case "sa_high":
      return { x: 110 + side * 54, y: 58 };
    case "sa_true":
      return { x: 110 + side * 62, y: 68 };
    case "sa_low":
      return { x: 110 + side * 70, y: 78 };
    case "un_high":
      return { x: 110 + side * 58, y: 92 };
    case "un_true":
      return { x: 110 + side * 64, y: 104 };
    case "un_sub":
      return { x: 110 + side * 72, y: 118 };
    default:
      return { x: 110 + side * 38, y: 38 };
  }
}

/** Extra mid-path bend so lower slots look like they sweep up into the zone. */
export function slotBreakBias(slot: ArmSlot | undefined): { x: number; y: number } {
  switch (slot ?? "tq_true") {
    case "oh_high":
      return { x: 0, y: -6 };
    case "oh_true":
      return { x: 1, y: -3 };
    case "oh_low":
      return { x: 2, y: 0 };
    case "tq_high":
      return { x: 6, y: 4 };
    case "tq_true":
      return { x: 9, y: 8 };
    case "tq_low":
      return { x: 12, y: 12 };
    case "sa_high":
      return { x: 14, y: 16 };
    case "sa_true":
      return { x: 16, y: 20 };
    case "sa_low":
      return { x: 18, y: 24 };
    case "un_high":
      return { x: 14, y: 28 };
    case "un_true":
      return { x: 16, y: 34 };
    case "un_sub":
      return { x: 18, y: 40 };
    default:
      return { x: 9, y: 8 };
  }
}

/** Well-known KBO arms — used when seeding canonical public clubs. */
export const KNOWN_ARM_SLOTS: Record<string, ArmSlot> = {
  선동열: "oh_true",
  오승환: "oh_true",
  류현진: "tq_true",
  김광현: "tq_true",
  정대현: "un_sub",
  고영표: "sa_true",
  양현종: "tq_true",
  구창모: "tq_high",
  폰트: "oh_true",
  밴헤켄: "tq_true",
  니퍼트: "tq_true",
  장명부: "tq_low",
  임창용: "sa_true",
  한기주: "oh_true",
  김재윤: "tq_true",
  위재영: "tq_true",
  구대성: "sa_low",
  송진우: "oh_low",
  정민태: "oh_true",
  정민철: "tq_true",
  밴덴헐크: "oh_true",
  데스파이네: "tq_true",
  쿠에바스: "tq_true",
  소형준: "tq_true",
  배제성: "tq_true",
  루친스키: "tq_true",
  헥터: "oh_true",
  조계현: "oh_true",
  이강철: "sa_true",
  염종석: "oh_true",
  김상진: "tq_true",
  윤석민: "tq_high",
  봉중근: "tq_true",
  장원삼: "tq_true",
  권혁: "tq_true",
};

/** Pick a sensible default when a pitcher has no stored slot. */
export function defaultArmSlot(name: string, throws: Throws = "R"): ArmSlot {
  if (KNOWN_ARM_SLOTS[name]) return KNOWN_ARM_SLOTS[name]!;
  // Lefties skew a touch more three-quarter in this sim's defaults.
  return throws === "L" ? "tq_true" : "oh_true";
}
