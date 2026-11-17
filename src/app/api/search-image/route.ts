import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { searchProductImage } from "@/lib/scraper/extractor";

/**
 * POST /api/search-image
 * Busca automaticamente uma imagem para o produto pelo nome informado.
 * Usa DuckDuckGo Image Search — sem API key, gratuito.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ success: true, imageUrl: null });
    }

    const imageUrl = await searchProductImage(query.trim());

    return NextResponse.json({ success: true, imageUrl });
  } catch (err) {
    console.error("[api/search-image] Erro:", err);
    return NextResponse.json({ success: true, imageUrl: null });
  }
}
