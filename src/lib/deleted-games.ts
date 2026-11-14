"use client";

import { idbGet, idbPut } from "@/lib/browser-db";

const DELETED_META_KEY = "deletedGameIds";
const DELETED_CAP = 400;

export async function listDeletedGameIds(): Promise<string[]> {
  const row = await idbGet<{ key: string; value: string }>("meta", DELETED_META_KEY);
  if (!row?.value) return [];
  try {
    const parsed = JSON.parse(row.value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string" && id.length > 0) : [];
  } catch {
    return [];
  }
}

export async function writeDeletedGameIds(ids: string[]) {
  await idbPut("meta", {
    key: DELETED_META_KEY,
    value: JSON.stringify([...new Set(ids)].slice(0, DELETED_CAP)),
  });
}

export async function rememberDeletedGameId(id: string) {
  const ids = await listDeletedGameIds();
  if (ids.includes(id)) return;
  await writeDeletedGameIds([id, ...ids]);
}

export async function removeDeletedGameId(id: string) {
  const ids = await listDeletedGameIds();
  if (!ids.includes(id)) return;
  await writeDeletedGameIds(ids.filter((item) => item !== id));
}
