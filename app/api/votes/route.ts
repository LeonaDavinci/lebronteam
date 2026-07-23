import { put, list } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const PATH = "lebronteam/votes.json";

async function readJSON(): Promise<Record<string, { yes: number; no: number }>> {
  try {
    const { blobs } = await list({ prefix: PATH, token: TOKEN });
    if (!blobs.length) return {};
    const res = await fetch(blobs[0].url);
    return (await res.json()) as Record<string, { yes: number; no: number }>;
  } catch {
    return {};
  }
}

async function writeJSON(data: unknown) {
  await put(PATH, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: false,
    token: TOKEN,
  });
}

export async function GET() {
  const data = await readJSON();
  return Response.json(data);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { team?: string; choice?: string };
  const team = body.team;
  const choice = body.choice;
  if (!team || (choice !== "yes" && choice !== "no")) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  const data = await readJSON();
  if (!data[team]) data[team] = { yes: 0, no: 0 };
  data[team][choice as "yes" | "no"] = (data[team][choice as "yes" | "no"] || 0) + 1;
  await writeJSON(data);
  return Response.json(data);
}
