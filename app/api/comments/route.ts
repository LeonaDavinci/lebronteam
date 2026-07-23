import { put, list } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
const PATH = "lebronteam/comments.json";
const MAX = 200;

type Comment = { id: string; name: string; message: string; ts: number };

async function readJSON(): Promise<Comment[]> {
  try {
    const { blobs } = await list({ prefix: PATH, token: TOKEN });
    if (!blobs.length) return [];
    const res = await fetch(blobs[0].url);
    const arr = (await res.json()) as Comment[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeJSON(data: unknown) {
  await put(PATH, JSON.stringify(data), {
    access: "public",
    allowOverwrite: true,
    token: TOKEN,
  });
}

export async function GET() {
  const arr = await readJSON();
  return Response.json(arr);
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { name?: string; message?: string };
  const msg = String(body.message || "").trim().slice(0, 500);
  const name = String(body.name || "").trim().slice(0, 40);
  if (msg.length < 1) return Response.json({ error: "empty" }, { status: 400 });
  const arr = await readJSON();
  arr.push({
    id: Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    name,
    message: msg,
    ts: Date.now(),
  });
  const trimmed = arr.slice(-MAX);
  await writeJSON(trimmed);
  return Response.json(trimmed);
}
