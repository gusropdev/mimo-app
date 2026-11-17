import { NextRequest, NextResponse } from "next/server";
import { searchProductImages } from "@/lib/scraper/extractor";

/**
 * POST /api/search-image
 * Busca automaticamente imagens para o produto pelo nome informado.
 * Retorna uma lista de imagens para permitir alternar entre fotos.
 */
export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ success: true, imageUrl: null, images: [] });
    }

    const images = await searchProductImages(query.trim(), 8);

    return NextResponse.json({
      success: true,
      imageUrl: images[0] || null,
      images,
    });
  } catch (err) {
    console.error("[api/search-image] Erro:", err);
    return NextResponse.json({ success: true, imageUrl: null, images: [] });
  }
}
