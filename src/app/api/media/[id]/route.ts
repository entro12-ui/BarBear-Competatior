import { getCompetitorPhoto } from "@/lib/uploads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const photo = await getCompetitorPhoto(id);
    if (!photo) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(new Uint8Array(photo.bytes), {
      headers: {
        "Content-Type": photo.mime,
        "Cache-Control": "public, max-age=60, must-revalidate",
      },
    });
  } catch (error) {
    console.error("media serve error", error);
    return new Response("Not found", { status: 404 });
  }
}
