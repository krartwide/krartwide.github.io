/**
 * Apply arsenal-corrections.json onto researched-arsenals.json + canonical-teams.json.
 * Source notes: 야구나라 구종탭, 나무위키 플레이 스타일, 동아/조선/스포츠경향 등.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const researchedPath = path.join(root, "src/data/researched-arsenals.json");
const correctionsPath = path.join(root, "src/data/arsenal-corrections.json");
const teamsPath = path.join(root, "src/data/canonical-teams.json");

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

const CORRECTED = JSON.parse(fs.readFileSync(correctionsPath, "utf8"));
const researched = JSON.parse(fs.readFileSync(researchedPath, "utf8"));
let changed = 0;
const diffs = [];

for (const [name, pairs] of Object.entries(CORRECTED)) {
  const next = arsenalFromPairs(pairs);
  const prev = researched[name] || [];
  const prevKey = prev.map((p) => `${p.code}:${p.grade}`).join(",");
  const nextKey = next.map((p) => `${p.code}:${p.grade}`).join(",");
  if (prevKey !== nextKey) {
    changed++;
    diffs.push({
      name,
      from: prevKey || "(none)",
      to: nextKey,
      removed: prev.filter((p) => !next.some((n) => n.code === p.code)).map((p) => p.code),
      added: next.filter((n) => !prev.some((p) => p.code === n.code)).map((n) => n.code),
    });
  }
  researched[name] = next;
}

fs.writeFileSync(researchedPath, JSON.stringify(researched, null, 2) + "\n");

const teams = JSON.parse(fs.readFileSync(teamsPath, "utf8"));
let seats = 0;
for (const team of teams) {
  for (const player of team.players || []) {
    if (player.kind !== "P") continue;
    const arsenal = researched[player.name];
    if (arsenal?.length) {
      player.arsenal = arsenal.map((e) => ({ ...e }));
      seats++;
    }
  }
}
fs.writeFileSync(teamsPath, JSON.stringify(teams, null, 2) + "\n");

console.log(
  JSON.stringify(
    {
      correctedNames: Object.keys(CORRECTED).length,
      changedNames: changed,
      seatsUpdated: seats,
      sampleDiffs: diffs.slice(0, 50),
      moreDiffs: Math.max(0, diffs.length - 50),
    },
    null,
    2,
  ),
);
