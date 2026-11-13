import { NextResponse } from "next/server";
import { requireIdentity } from "../../../../cursor/identity";
import { sql } from "@/lib/db";
import { mergeVaults, normalizeVault, parseVaultJson } from "@/lib/vault-merge";
import { emptyVault, type VaultPayload } from "@/lib/vault-types";

export const dynamic = "force-dynamic";

function json(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status,
    headers: { "cache-control": "private, no-store" },
  });
}

export async function GET(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;
  if (identity.kind === "key") return json({ error: "지원하지 않는 호출입니다." }, { status: 403 });

  try {
    const rows = await sql<{ payload: string }>(
      "select payload from record_vault where user_id = $1 limit 1",
      [identity.sub],
    );
    if (!rows[0]) return json({ empty: true, payload: emptyVault() });
    return json({ empty: false, payload: parseVaultJson(rows[0].payload) });
  } catch {
    return json({ error: "데이터베이스를 아직 쓸 수 없습니다." }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const identity = await requireIdentity(request);
  if (identity instanceof Response) return identity;
  if (identity.kind === "key") return json({ error: "지원하지 않는 호출입니다." }, { status: 403 });

  const body = (await request.json().catch(() => null)) as { payload?: VaultPayload } | null;
  if (!body?.payload || body.payload.version !== 1) {
    return json({ error: "저장 내용이 올바르지 않습니다." }, { status: 400 });
  }

  const incoming = normalizeVault(body.payload);
  const rawIn = JSON.stringify(incoming);
  if (rawIn.length > 8_000_000) {
    return json({ error: "기록이 너무 커서 클라우드에 올리지 못했습니다." }, { status: 400 });
  }

  try {
    const rows = await sql<{ payload: string }>(
      "select payload from record_vault where user_id = $1 limit 1",
      [identity.sub],
    );
    const existing = rows[0] ? parseVaultJson(rows[0].payload) : emptyVault();
    const merged = mergeVaults(existing, incoming);
    const raw = JSON.stringify(merged);

    await sql(
      `insert into record_vault (user_id, payload, updated_at, created_at)
       values ($1, $2, now(), now())
       on conflict (user_id) do update
       set payload = excluded.payload, updated_at = now()`,
      [identity.sub, raw],
    );

    return json({ ok: true, payload: merged });
  } catch {
    return json({ error: "데이터베이스를 아직 쓸 수 없습니다." }, { status: 503 });
  }
}
