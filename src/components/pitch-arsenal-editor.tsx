"use client";

import { Button } from "@/components/ui/button";
import {
  PITCH_CATALOG,
  PITCH_FAMILY_ORDER,
  STUFF_GRADES,
  pitchLabel,
  type PitchArsenalEntry,
  type StuffGrade,
} from "@/lib/pitch-catalog";

export function PitchArsenalEditor({
  arsenal,
  onChange,
}: {
  arsenal: PitchArsenalEntry[];
  onChange: (next: PitchArsenalEntry[]) => void;
}) {
  const used = new Set(arsenal.map((entry) => entry.code));
  const available = PITCH_CATALOG.filter((pitch) => !used.has(pitch.code));

  function addPitch(code: string) {
    if (used.has(code)) return;
    onChange([...arsenal, { code, grade: "C" }]);
  }

  function removePitch(code: string) {
    onChange(arsenal.filter((entry) => entry.code !== code));
  }

  function setGrade(code: string, grade: StuffGrade) {
    onChange(arsenal.map((entry) => (entry.code === code ? { ...entry, grade } : entry)));
  }

  return (
    <div className="grid gap-3 sm:col-span-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">구종 레퍼토리</p>
          <p className="text-[11px] leading-4 text-muted-foreground">
            개수 제한 없음. 전 세계 구종을 넣고 E~SS로 구위를 정합니다. 등급이 높을수록 시뮬에서 더 자주 나갑니다.
          </p>
        </div>
        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">구종 추가</span>
          <select
            className="field-select min-w-[14rem]"
            defaultValue=""
            onChange={(event) => {
              const code = event.target.value;
              if (code) addPitch(code);
              event.target.value = "";
            }}
          >
            <option value="" disabled>
              {available.length ? "구종 선택…" : "모두 추가됨"}
            </option>
            {PITCH_FAMILY_ORDER.map((family) => {
              const group = available.filter((pitch) => pitch.family === family);
              if (!group.length) return null;
              return (
                <optgroup key={family} label={group[0]!.familyLabel}>
                  {group.map((pitch) => (
                    <option key={pitch.code} value={pitch.code}>
                      {pitch.label} · {pitch.en}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>
        </label>
      </div>

      {arsenal.length === 0 ? (
        <p className="rounded-md border border-dashed border-border/80 px-3 py-4 text-sm text-muted-foreground">
          구종이 없습니다. 위에서 추가하거나, 비워 두면 시뮬이 기록 기반으로 자동 선택합니다.
        </p>
      ) : (
        <ul className="grid gap-2">
          {arsenal.map((entry) => {
            const def = PITCH_CATALOG.find((pitch) => pitch.code === entry.code);
            return (
              <li
                key={entry.code}
                className="flex flex-wrap items-center gap-2 rounded-md border border-border/70 bg-background/60 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pitchLabel(entry.code)}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {def ? `${def.en} · ${def.blurb}` : entry.code}
                  </p>
                </div>
                <label className="grid gap-1 text-[11px]">
                  <span className="text-muted-foreground">구위</span>
                  <select
                    className="field-select w-[4.5rem]"
                    value={entry.grade}
                    onChange={(event) => setGrade(entry.code, event.target.value as StuffGrade)}
                  >
                    {STUFF_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="button" variant="outline" size="sm" onClick={() => removePitch(entry.code)}>
                  제거
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
