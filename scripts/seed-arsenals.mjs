/**
 * Seed public-club pitcher arsenals from researched KBO sources
 * (야구나라 pitch splits, Statiz/articles, historical writeups).
 *
 * Grade heuristic:
 *   SS — signature elite (league-defining)
 *   S  — plus / top-tier pitch
 *   A  — solid primary or strong secondary
 *   B  — average usable pitch
 *   C  — fringe / show-me
 *   D  — rare / weak
 *   E  — emergency only
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const teamsPath = path.join(root, "src/data/canonical-teams.json");

/** @type {Record<string, [string, string][]>} code + grade */
const RESEARCHED = {
  // —— Modern tracked (야구나라 / KBO 공식 구종분석) ——
  고영표: [
    ["ch", "SS"], // 주무기 · 가치 상위 체인지업
    ["ft", "A"],
    ["sw", "B"],
    ["cb", "A"],
    ["ff", "C"],
    ["sl", "D"],
  ],
  양현종: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "S"], // 대표 결정구
    ["cb", "B"],
  ],
  구창모: [
    ["ff", "S"],
    ["sl", "A"],
    ["fo", "A"],
    ["cb", "C"],
  ],
  소형준: [
    ["ft", "S"],
    ["ct", "A"],
    ["ch", "A"],
    ["cb", "B"],
    ["sw", "C"],
  ],
  안우진: [
    ["ff", "SS"], // 150+ 포심
    ["sl", "SS"], // 가치 리그 최상위권
    ["cb", "S"],
    ["ch", "A"],
  ],
  류현진: [
    ["ff", "A"],
    ["ch", "SS"],
    ["ct", "S"],
    ["cb", "A"],
    ["ft", "B"],
    ["sl", "C"],
  ],
  임기영: [
    ["ff", "A"],
    ["ch", "S"],
    ["sl", "B"],
    ["ft", "C"],
  ],
  한현희: [
    ["sl", "S"],
    ["ff", "A"],
    ["ch", "C"],
    ["ft", "C"],
  ],
  엄상백: [
    ["ff", "A"],
    ["ch", "A"], // KT 전성기 무기 (시즌별 비율 변동)
    ["ct", "B"],
    ["sl", "B"],
    ["cb", "C"],
  ],
  원종현: [
    ["ff", "A"],
    ["sl", "A"],
    ["fo", "B"],
    ["ft", "C"],
  ],
  조상우: [
    ["ff", "S"],
    ["sl", "A"],
    ["fo", "B"],
    ["ft", "D"],
  ],
  이태양: [
    ["ff", "A"],
    ["fo", "S"], // 포크 결정구
    ["sl", "B"],
    ["cb", "C"],
  ],

  // —— Icons / historical (기사·인터뷰·구종 분석) ——
  선동열: [
    ["ff", "SS"],
    ["sl", "S"],
    ["ft", "A"], // 역회전/슈트성
    ["cb", "B"],
    ["ch", "C"], // 반포크·팜볼 계열
  ],
  오승환: [
    ["ff", "SS"],
    ["sl", "S"],
    ["cb", "B"],
    ["ch", "C"],
    ["sp", "C"],
  ],
  김광현: [
    ["ff", "S"],
    ["sl", "S"],
    ["ch", "A"], // 스플리터성 체인지업
    ["ft", "B"],
    ["cb", "C"],
  ],
  임창용: [
    ["ff", "SS"], // 뱀직구
    ["sp", "S"],
    ["sl", "A"],
    ["cb", "B"],
    ["si", "B"],
  ],
  정대현: [
    ["si", "SS"],
    ["sl", "A"],
    ["cb", "A"], // 업슛성 커브
    ["ft", "B"],
  ],
  박종훈: [
    ["si", "S"],
    ["sl", "A"],
    ["cb", "A"],
    ["ch", "B"],
    ["ff", "C"],
  ],
  이강철: [
    ["si", "S"],
    ["sl", "S"],
    ["ff", "A"],
    ["cb", "A"],
    ["fo", "B"],
  ],
  한희민: [
    ["sl", "S"],
    ["si", "A"],
    ["ff", "B"],
    ["cb", "B"],
  ],
  박정현: [
    ["si", "SS"],
    ["sl", "A"],
    ["cb", "B"],
    ["ch", "C"],
  ],
  유희관: [
    ["si", "S"],
    ["ch", "A"],
    ["cb", "A"],
    ["ff", "C"],
  ],
  송진우: [
    ["ff", "A"],
    ["fo", "S"],
    ["cb", "A"],
    ["sl", "B"],
  ],
  정민철: [
    ["ff", "A"],
    ["sl", "S"],
    ["cb", "A"],
    ["ch", "C"],
  ],
  정민태: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
    ["ch", "C"],
  ],
  조계현: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  염종석: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  한기주: [
    ["ff", "S"],
    ["sl", "A"],
    ["cb", "C"],
  ],
  김용수: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  박철순: [
    ["ff", "A"],
    ["pal", "S"], // 팜볼로 유명
    ["sl", "B"],
    ["cb", "B"],
  ],
  장명부: [
    ["si", "A"],
    ["cb", "A"],
    ["ch", "B"],
    ["ff", "B"],
    ["sl", "C"],
  ],
  김현욱: [
    ["si", "S"],
    ["sl", "A"],
    ["ch", "B"],
    ["ff", "C"],
  ],
  김신부: [
    ["si", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  김기태: [
    ["si", "A"],
    ["sl", "A"],
    ["cb", "B"],
    ["ff", "C"],
  ],
  이길환: [
    ["si", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  이광권: [
    ["si", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  박동수: [
    ["si", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  성영재: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  조용훈: [
    ["si", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  양현: [
    ["si", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김대우: [
    ["si", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  마정길: [
    ["si", "A"],
    ["sl", "A"],
    ["ch", "B"],
    ["ff", "C"],
  ],
  조웅천: [
    ["si", "S"],
    ["sl", "A"],
    ["ff", "B"],
    ["cb", "C"],
  ],
  정명원: [
    ["ff", "A"],
    ["sl", "A"],
    ["si", "B"],
  ],
  구대성: [
    ["ff", "A"],
    ["sl", "S"],
    ["ch", "A"],
  ],
  가득염: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  최창호: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  심창민: [
    ["ff", "A"],
    ["sl", "A"],
    ["sp", "B"],
  ],
  김성배: [
    ["si", "A"],
    ["sl", "A"],
    ["ff", "B"],
  ],
  박진태: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이영욱: [
    ["ff", "A"],
    ["sl", "A"],
    ["si", "B"],
  ],

  // —— Foreign / other notables on public clubs ——
  폰트: [
    ["ff", "S"],
    ["sl", "A"],
    ["ch", "A"],
    ["cb", "C"],
  ],
  헥터: [
    ["ff", "S"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  밴덴헐크: [
    ["ff", "S"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  보우덴: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  레이번: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  다카쓰: [
    ["ff", "A"],
    ["sl", "A"],
    ["fo", "S"],
  ],
  니퍼트: [
    ["ft", "S"],
    ["sl", "A"],
    ["ch", "A"],
    ["ff", "B"],
  ],
  밴헤켄: [
    ["ff", "A"],
    ["sp", "S"],
    ["sl", "A"],
  ],
  요키시: [
    ["ft", "S"],
    ["ff", "A"],
    ["ch", "A"],
    ["cb", "B"],
  ],
  브리검: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  루친스키: [
    ["ff", "A"],
    ["ft", "A"],
    ["ct", "B"],
    ["sl", "B"],
    ["ch", "B"],
  ],
  데스파이네: [
    ["ff", "A"],
    ["ch", "A"],
    ["sl", "B"],
  ],
  쿠에바스: [
    ["ff", "A"],
    ["cb", "S"],
    ["ch", "A"],
    ["sl", "B"],
  ],
  소사: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  팻딘: [
    ["ff", "A"],
    ["ch", "A"],
    ["cb", "B"],
  ],
  모리만도: [
    ["ff", "A"],
    ["ch", "A"],
    ["cb", "B"],
    ["sl", "C"],
  ],
  라이트: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  마틴: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],

  // —— Other roster regulars with documented tendencies ——
  김재윤: [
    ["ff", "A"],
    ["sl", "A"],
    ["fo", "S"],
  ],
  위재영: [
    ["ff", "A"],
    ["sl", "A"],
  ],
  윤석민: [
    ["ff", "S"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  봉중근: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  장원삼: [
    ["ff", "A"],
    ["ch", "A"],
    ["cb", "B"],
  ],
  권혁: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  정우람: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  송승준: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  채병용: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  안지만: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  차우찬: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  함덕주: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  배제성: [
    ["ff", "A"],
    ["sl", "A"],
    ["si", "B"],
    ["ch", "C"],
  ],
  손승락: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  하영민: [
    ["ff", "A"],
    ["fo", "A"],
    ["ct", "B"],
    ["sw", "B"],
  ],
  임창민: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  노경은: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이용찬: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  장원준: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이현승: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  오주원: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김택형: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  심재민: [
    ["ff", "A"],
    ["ch", "A"],
    ["sl", "B"],
  ],
  김진성: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  주권: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김상수: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  문성현: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  송신영: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  윤길현: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김원형: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이상열: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  진필중: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  김상진: [
    ["sl", "S"],
    ["ff", "A"],
    ["cb", "B"],
  ],
  배영수: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  윤성환: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  백정현: [
    ["ff", "A"],
    ["ch", "A"],
    ["cb", "B"],
  ],
  서진용: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  문승원: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  오원석: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  고효준: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  홍건희: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김세현: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  심동섭: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  최원태: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이승호: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  송은범: [
    ["ff", "A"],
    ["ft", "A"],
    ["sl", "B"],
    ["ch", "B"],
  ],
  김민수: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  박시영: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이대은: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  조현우: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  송명기: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김영규: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  임정호: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  홍성민: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  문경찬: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김건태: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  손정욱: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],

  // —— Remaining public-club depth / historical (기사·회고·역할 기반) ——
  김태원: [
    ["kn", "SS"], // KBO 대표 너클볼러
    ["ff", "C"],
    ["cb", "B"],
    ["ch", "C"],
  ],
  윤학길: [
    ["ff", "A"],
    ["sl", "S"],
    ["cb", "A"],
    ["ch", "B"],
  ],
  한용덕: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
    ["ch", "B"],
  ],
  이상훈: [
    ["ff", "A"],
    ["sl", "S"],
    ["ch", "A"],
    ["cb", "B"],
  ],
  정삼흠: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "A"],
    ["ch", "B"],
  ],
  차명석: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  이상군: [
    ["si", "S"], // 언더핸드 싱커
    ["sl", "A"],
    ["cb", "B"],
    ["ch", "B"],
  ],
  양상문: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
    ["ch", "B"],
  ],
  조규제: [
    ["si", "A"],
    ["sl", "A"],
    ["cb", "B"],
    ["ch", "B"],
  ],
  김수경: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
    ["cb", "C"],
  ],
  마일영: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이대진: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
    ["ch", "C"],
  ],
  윤명준: [
    ["cb", "S"], // 커브 계열 특화
    ["ff", "B"],
    ["sl", "A"],
    ["ch", "C"],
  ],
  김강률: [
    ["ff", "S"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  홍상삼: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이현호: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김윤동: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  임기준: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  장지훈: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  최민준: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
    ["cb", "C"],
  ],
  박동희: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  윤형배: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이상번: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  김상현: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김태형: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김종석: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  이상목: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김경원: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  홍우태: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  임창식: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김성민: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  윤영삼: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김동준: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이영준: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  박승민: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  노환수: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  전준호: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  황두성: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김성현: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  강윤구: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이보근: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  배힘찬: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  신철인: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  임선동: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김현우: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  인현배: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  김기범: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  차동철: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  강봉수: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  민원기: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  강길용: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  권명철: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이용호: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  장호연: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  홍길남: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김기덕: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  박성기: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  박주언: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  박진석: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  오봉옥: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  유현승: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  최정환: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김인권: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  김홍명: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  장정순: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  지연규: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  강태원: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김정수: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  문희수: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  송유석: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  신동수: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  박은진: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  신완근: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  조병천: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김봉근: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  신태중: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  정선두: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  정성만: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  정은배: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  최계훈: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김상기: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  김재현: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  오문현: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  인호봉: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  임호균: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  오영일: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  유종겸: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  이원국: [
    ["ff", "A"],
    ["sl", "A"],
    ["cb", "B"],
  ],
  정순명: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
  하기룡: [
    ["ff", "A"],
    ["sl", "A"],
    ["ch", "B"],
  ],
};

function arsenalFromPairs(pairs) {
  const seen = new Set();
  const out = [];
  for (const [code, grade] of pairs) {
    if (seen.has(code)) continue;
    seen.add(code);
    out.push({ code, grade });
  }
  return out;
}

function heuristic(player) {
  const throws = player.throws === "L" ? "L" : "R";
  const slot = player.armSlot || "";
  const p = player.pitcher || {};
  const ip = Math.max(Number(p.ip) || 0.1, 0.1);
  const k9 = ((Number(p.so) || 0) / ip) * 9;
  const hr9 = ((Number(p.hr) || 0) / ip) * 9;
  const speed = Number(p.speed) || 140;

  if (slot.startsWith("un_")) {
    return arsenalFromPairs([
      ["si", k9 >= 7 ? "A" : "B"],
      ["sl", "A"],
      ["cb", "B"],
      ["ch", "B"],
      ["ff", "C"],
    ]);
  }
  if (slot.startsWith("sa_")) {
    return arsenalFromPairs([
      ["ff", speed >= 145 ? "A" : "B"],
      ["sl", "A"],
      ["si", "B"],
      ["ch", "B"],
    ]);
  }
  if (hr9 < 0.55) {
    return arsenalFromPairs([
      ["si", "A"],
      ["sl", "A"],
      ["ch", "B"],
      ["ff", "B"],
    ]);
  }
  if (k9 >= 9) {
    return arsenalFromPairs([
      ["ff", speed >= 148 ? "S" : "A"],
      ["sl", "A"],
      ["sp", "B"],
      ["cb", "B"],
    ]);
  }
  if (k9 < 5.5) {
    return arsenalFromPairs([
      ["ft", "A"],
      ["cb", "A"],
      ["ch", "B"],
      ["si", "B"],
    ]);
  }
  if (throws === "L") {
    return arsenalFromPairs([
      ["ff", "A"],
      ["ch", "A"],
      ["sl", "B"],
      ["cb", "B"],
    ]);
  }
  return arsenalFromPairs([
    ["ff", speed >= 148 ? "A" : "B"],
    ["sl", "A"],
    ["ch", "B"],
    ["cb", "B"],
  ]);
}

const teams = JSON.parse(fs.readFileSync(teamsPath, "utf8"));
let researched = 0;
let fallback = 0;
const missing = [];

for (const team of teams) {
  for (const player of team.players || []) {
    if (player.kind !== "P") continue;
    const pairs = RESEARCHED[player.name];
    if (pairs) {
      player.arsenal = arsenalFromPairs(pairs);
      researched += 1;
    } else {
      player.arsenal = heuristic(player);
      fallback += 1;
      missing.push(`${player.name} (${team.name} ${team.year})`);
    }
  }
}

fs.writeFileSync(teamsPath, `${JSON.stringify(teams, null, 2)}\n`);

// Also dump a compact JSON map for the sim/engine to import if needed later.
const mapPath = path.join(root, "src/data/researched-arsenals.json");
const map = {};
for (const [name, pairs] of Object.entries(RESEARCHED)) {
  map[name] = arsenalFromPairs(pairs);
}
fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      researched,
      fallback,
      uniqueResearched: Object.keys(RESEARCHED).length,
      missingSample: missing.slice(0, 40),
      missingCount: missing.length,
    },
    null,
    2,
  ),
);
