import { NextResponse } from "next/server";

function isAllowedImageHost(hostname: string) {
  if (hostname === "storage.googleapis.com") {
    return true;
  }

  return /^(?:[a-z0-9][a-z0-9.-]*\.)?s3(?:[.-][a-z0-9-]+)*\.amazonaws\.com(?:\.cn)?$/.test(
    hostname,
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const imageUrl = requestUrl.searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json(
      { detail: "Missing url parameter." },
      { status: 400 },
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return NextResponse.json({ detail: "Invalid image url." }, { status: 400 });
  }

  if (parsedUrl.protocol !== "https:" || !isAllowedImageHost(parsedUrl.hostname)) {
    return NextResponse.json(
      { detail: "Unsupported image host." },
      { status: 400 },
    );
  }

  try {
    const upstreamResponse = await fetch(parsedUrl.toString());

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        { detail: "Failed to fetch image." },
        { status: upstreamResponse.status },
      );
    }

    const contentType =
      upstreamResponse.headers.get("content-type") ?? "image/jpeg";
    const buffer = await upstreamResponse.arrayBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return NextResponse.json(
      { detail: "Failed to proxy image." },
      { status: 502 },
    );
  }
}
