import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const photoName = searchParams.get("name");

    if (!photoName) {
      return NextResponse.json({ error: "Missing photo name" }, { status: 400 });
    }
    
    const googleUrl = `https://places.googleapis.com/v1/${photoName}/media?key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}&maxWidthPx=600`

    // Fetch the image from Google safely (server-side)
    const response = await fetch(googleUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image from Google" },
        { status: 500 }
      );
    }

    // Convert to ArrayBuffer (binary)
    const buffer = await response.arrayBuffer();

    return new Response(buffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400", // cache for 1 day
      },
    });

  } catch (err) {
    console.error("PHOTO API ERROR:", err);
    return NextResponse.json(
      { error: "Server error fetching photo" },
      { status: 500 }
    );
  }
}
