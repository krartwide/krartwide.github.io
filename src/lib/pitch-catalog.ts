/** Stuff grade — E (weak) … SS (elite). */
export type StuffGrade = "E" | "D" | "C" | "B" | "A" | "S" | "SS";

export const STUFF_GRADES: StuffGrade[] = ["E", "D", "C", "B", "A", "S", "SS"];

export const STUFF_GRADE_LABEL: Record<StuffGrade, string> = {
  E: "E",
  D: "D",
  C: "C",
  B: "B",
  A: "A",
  S: "S",
  SS: "SS",
};

/** Relative selection weight in the sim (higher = thrown more often). */
export const STUFF_GRADE_WEIGHT: Record<StuffGrade, number> = {
  E: 1,
  D: 2,
  C: 3.5,
  B: 5.5,
  A: 8,
  S: 12,
  SS: 18,
};

export type PitchFamily =
  | "fastball"
  | "breaking"
  | "offspeed"
  | "knuckle"
  | "specialty";

export type PitchDef = {
  code: string;
  label: string;
  en: string;
  family: PitchFamily;
  familyLabel: string;
  blurb: string;
  /** Typical velo vs peak FB (km/h). */
  veloOff: number;
  rpm: [number, number];
  /** Flight break hint for catcher's-eye view. */
  break: { x: number; y: number };
};

/**
 * Worldwide pitch menu — historical & modern deliveries used in pro baseball
 * (MLB / NPB / KBO / CPBL / etc.). Codes are stable sim identifiers.
 */
export const PITCH_CATALOG: PitchDef[] = [
  // —— Fastballs ——
  { code: "ff", label: "포심 패스트볼", en: "Four-seam fastball", family: "fastball", familyLabel: "패스트볼", blurb: "가장 흔한 직구", veloOff: 0, rpm: [2100, 2450], break: { x: 3, y: 4 } },
  { code: "ft", label: "투심 패스트볼", en: "Two-seam fastball", family: "fastball", familyLabel: "패스트볼", blurb: "횡·종으로 살짝 움직이는 직구", veloOff: -3, rpm: [1900, 2300], break: { x: 8, y: 10 } },
  { code: "si", label: "싱커", en: "Sinker", family: "fastball", familyLabel: "패스트볼", blurb: "아래로 처지는 직구 계열", veloOff: -4, rpm: [1800, 2250], break: { x: 8, y: 12 } },
  { code: "ct", label: "커터", en: "Cutter", family: "fastball", familyLabel: "패스트볼", blurb: "짧게 꺾이는 커트 패스트볼", veloOff: -6, rpm: [2200, 2600], break: { x: 10, y: 8 } },
  { code: "rs", label: "라이징 패스트볼", en: "Rising fastball", family: "fastball", familyLabel: "패스트볼", blurb: "높은 스핀으로 떠오르는 듯한 직구", veloOff: -1, rpm: [2400, 2800], break: { x: 2, y: -6 } },
  { code: "su", label: "슈토", en: "Shuuto", family: "fastball", familyLabel: "패스트볼", blurb: "NPB식 횡 싱커/슈트", veloOff: -5, rpm: [1700, 2150], break: { x: 12, y: 10 } },
  { code: "one", label: "원심 패스트볼", en: "One-seam fastball", family: "fastball", familyLabel: "패스트볼", blurb: "솔기 하나만 잡고 던지는 직구", veloOff: -2, rpm: [1850, 2250], break: { x: 6, y: 8 } },

  // —— Breaking ——
  { code: "sl", label: "슬라이더", en: "Slider", family: "breaking", familyLabel: "브레이킹", blurb: "횡 변화의 대표 브레이킹볼", veloOff: -9, rpm: [2300, 2900], break: { x: 18, y: 14 } },
  { code: "sw", label: "스위퍼", en: "Sweeper", family: "breaking", familyLabel: "브레이킹", blurb: "큰 횡 변화의 슬라이더 계열", veloOff: -11, rpm: [2400, 3000], break: { x: 26, y: 10 } },
  { code: "cb", label: "커브", en: "Curveball", family: "breaking", familyLabel: "브레이킹", blurb: "종으로 떨어지는 커브", veloOff: -16, rpm: [2400, 3100], break: { x: 6, y: 28 } },
  { code: "kc", label: "너클 커브", en: "Knuckle curve", family: "breaking", familyLabel: "브레이킹", blurb: "너클 그립의 커브", veloOff: -15, rpm: [2200, 2900], break: { x: 8, y: 26 } },
  { code: "t12", label: "12-6 커브", en: "12–6 curveball", family: "breaking", familyLabel: "브레이킹", blurb: "위에서 아래로 떨어지는 커브", veloOff: -18, rpm: [2500, 3200], break: { x: 2, y: 32 } },
  { code: "sv", label: "슬러브", en: "Slurve", family: "breaking", familyLabel: "브레이킹", blurb: "슬라이더와 커브의 중간", veloOff: -13, rpm: [2300, 2950], break: { x: 14, y: 20 } },
  { code: "gy", label: "자이로볼", en: "Gyroball", family: "breaking", familyLabel: "브레이킹", blurb: "탄환형 회전의 브레이킹볼", veloOff: -8, rpm: [2000, 2600], break: { x: 10, y: 6 } },
  { code: "sc", label: "스크류볼", en: "Screwball", family: "breaking", familyLabel: "브레이킹", blurb: "반대 방향으로 휘는 역사적 브레이킹볼", veloOff: -14, rpm: [1800, 2400], break: { x: -16, y: 18 } },
  { code: "ep", label: "이퍼스", en: "Eephus", family: "breaking", familyLabel: "브레이킹", blurb: "극도로 느린 포물선 커브", veloOff: -45, rpm: [800, 1400], break: { x: 4, y: 40 } },
  { code: "slc", label: "슬롯", en: "Slotto / fringe slider", family: "breaking", familyLabel: "브레이킹", blurb: "짧은 슬라이더·커터 경계 구종", veloOff: -7, rpm: [2250, 2700], break: { x: 12, y: 9 } },

  // —— Offspeed ——
  { code: "ch", label: "체인지업", en: "Changeup", family: "offspeed", familyLabel: "오프스피드", blurb: "직구와 같은 폼의 감속구", veloOff: -12, rpm: [1500, 2000], break: { x: 6, y: 18 } },
  { code: "cir", label: "서클 체인지업", en: "Circle changeup", family: "offspeed", familyLabel: "오프스피드", blurb: "원 그립 체인지업", veloOff: -13, rpm: [1400, 1900], break: { x: 8, y: 20 } },
  { code: "pal", label: "팜볼", en: "Palmball", family: "offspeed", familyLabel: "오프스피드", blurb: "손바닥에 깊숙이 넣는 체인지업", veloOff: -16, rpm: [1100, 1600], break: { x: 5, y: 22 } },
  { code: "sp", label: "스플리터", en: "Splitter", family: "offspeed", familyLabel: "오프스피드", blurb: "갈라진 그립의 급낙 오프스피드", veloOff: -8, rpm: [1200, 1700], break: { x: 4, y: 22 } },
  { code: "fo", label: "포크볼", en: "Forkball", family: "offspeed", familyLabel: "오프스피드", blurb: "깊게 갈라 던지는 포크", veloOff: -10, rpm: [1100, 1650], break: { x: 4, y: 24 } },
  { code: "vul", label: "벌컨 체인지업", en: "Vulcan changeup", family: "offspeed", familyLabel: "오프스피드", blurb: "V 자 그립 체인지업", veloOff: -14, rpm: [1300, 1800], break: { x: 7, y: 21 } },
  { code: "fosh", label: "포시", en: "Fosh", family: "offspeed", familyLabel: "오프스피드", blurb: "포크+체인지업 혼합 그립", veloOff: -11, rpm: [1250, 1750], break: { x: 5, y: 20 } },
  { code: "tmb", label: "톰보이", en: "Tomboy / hybrid change", family: "offspeed", familyLabel: "오프스피드", blurb: "체인지업·커터 중간 감속구", veloOff: -10, rpm: [1600, 2100], break: { x: 9, y: 14 } },

  // —— Knuckle ——
  { code: "kn", label: "너클볼", en: "Knuckleball", family: "knuckle", familyLabel: "너클", blurb: "거의 무회전으로 흔들리는 공", veloOff: -28, rpm: [50, 350], break: { x: 14, y: 16 } },
  { code: "knf", label: "너클 패스트볼", en: "Knuckle-fastball", family: "knuckle", familyLabel: "너클", blurb: "낮은 스핀의 빠른 너클 계열", veloOff: -8, rpm: [400, 900], break: { x: 8, y: 10 } },

  // —— Specialty / regional / historical ——
  { code: "db", label: "데스볼", en: "Deathball", family: "specialty", familyLabel: "특수", blurb: "극단적 감속·낙차의 특수구", veloOff: -35, rpm: [900, 1500], break: { x: 6, y: 34 } },
  { code: "sh", label: "샷", en: "Shutto / shot", family: "specialty", familyLabel: "특수", blurb: "짧은 횡 변화 특수구", veloOff: -6, rpm: [1900, 2400], break: { x: 14, y: 8 } },
  { code: "cs", label: "커브 싱커", en: "Curve-sink hybrid", family: "specialty", familyLabel: "특수", blurb: "커브와 싱커를 섞은 하이브리드", veloOff: -12, rpm: [1700, 2300], break: { x: 10, y: 22 } },
  { code: "iv", label: "인버스 슬라이더", en: "Inverse slider", family: "specialty", familyLabel: "특수", blurb: "반대 손 방향으로 휘는 슬라이더", veloOff: -10, rpm: [2200, 2800], break: { x: -18, y: 12 } },
  { code: "up", label: "업슛", en: "Upshoot", family: "specialty", familyLabel: "특수", blurb: "아래에서 떠오르는 듯한 언더핸드 특수구", veloOff: -6, rpm: [1600, 2200], break: { x: 4, y: -12 } },
  { code: "dro", label: "드롭", en: "Drop ball", family: "specialty", familyLabel: "특수", blurb: "소프트볼·초기야구식 급낙구", veloOff: -20, rpm: [1000, 1800], break: { x: 3, y: 30 } },
  { code: "ris", label: "라이즈볼", en: "Rise ball", family: "specialty", familyLabel: "특수", blurb: "소프트볼식 상승구 (야구 응용)", veloOff: -4, rpm: [2000, 2600], break: { x: 2, y: -14 } },
  { code: "hb", label: "훅", en: "Hook", family: "specialty", familyLabel: "특수", blurb: "큰 호를 그리는 훅 브레이킹볼", veloOff: -17, rpm: [2100, 2800], break: { x: 20, y: 24 } },
  { code: "mb", label: "문샷", en: "Moonshot / slow curve", family: "specialty", familyLabel: "특수", blurb: "높이 띄우는 초저속 커브", veloOff: -40, rpm: [700, 1300], break: { x: 5, y: 38 } },
  { code: "gyro", label: "탄환 슬라이더", en: "Bullet / gyro slider", family: "specialty", familyLabel: "특수", blurb: "전진 회전이 강한 짧은 슬라이더", veloOff: -8, rpm: [2500, 3100], break: { x: 11, y: 7 } },
];

const BY_CODE = new Map(PITCH_CATALOG.map((p) => [p.code, p]));

export function pitchDef(code: string): PitchDef | undefined {
  return BY_CODE.get(code);
}

export function pitchLabel(code: string): string {
  return BY_CODE.get(code)?.label ?? code;
}

export function isPitchCode(value: unknown): value is string {
  return typeof value === "string" && BY_CODE.has(value);
}

export function isStuffGrade(value: unknown): value is StuffGrade {
  return typeof value === "string" && STUFF_GRADES.includes(value as StuffGrade);
}

export type PitchArsenalEntry = {
  code: string;
  grade: StuffGrade;
};

export function normalizeArsenal(raw: unknown): PitchArsenalEntry[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const out: PitchArsenalEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const code = (item as { code?: unknown }).code;
    const grade = (item as { grade?: unknown }).grade;
    if (!isPitchCode(code) || seen.has(code)) continue;
    seen.add(code);
    out.push({ code, grade: isStuffGrade(grade) ? grade : "C" });
  }
  return out;
}

/** Default starter kit when a pitcher has no arsenal yet. */
export function defaultArsenal(throws: "L" | "R" = "R"): PitchArsenalEntry[] {
  if (throws === "L") {
    return [
      { code: "ff", grade: "A" },
      { code: "ch", grade: "B" },
      { code: "sl", grade: "B" },
      { code: "cb", grade: "C" },
    ];
  }
  return [
    { code: "ff", grade: "A" },
    { code: "sl", grade: "B" },
    { code: "ch", grade: "C" },
    { code: "cb", grade: "C" },
  ];
}

/** Build arsenal from a code list (e.g. legacy signature), grading by order. */
export function arsenalFromCodes(codes: string[]): PitchArsenalEntry[] {
  const grades: StuffGrade[] = ["A", "A", "B", "B", "C", "C", "D"];
  const seen = new Set<string>();
  const out: PitchArsenalEntry[] = [];
  codes.forEach((code, i) => {
    if (!isPitchCode(code) || seen.has(code)) return;
    seen.add(code);
    out.push({ code, grade: grades[Math.min(i, grades.length - 1)]! });
  });
  return out.length ? out : defaultArsenal();
}

export function arsenalCodes(arsenal: PitchArsenalEntry[] | undefined | null): string[] {
  return (arsenal ?? []).map((entry) => entry.code);
}

/** Weighted random pick by stuff grade. */
export function pickWeightedPitch(arsenal: PitchArsenalEntry[], rng: () => number): string {
  if (!arsenal.length) return "ff";
  let total = 0;
  const weights = arsenal.map((entry) => {
    const w = STUFF_GRADE_WEIGHT[entry.grade] ?? 3;
    total += w;
    return w;
  });
  let roll = rng() * total;
  for (let i = 0; i < arsenal.length; i += 1) {
    roll -= weights[i]!;
    if (roll <= 0) return arsenal[i]!.code;
  }
  return arsenal[arsenal.length - 1]!.code;
}

export const PITCH_FAMILY_ORDER: PitchFamily[] = ["fastball", "breaking", "offspeed", "knuckle", "specialty"];
