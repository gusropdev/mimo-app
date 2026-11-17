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
    // Autenticação obrigatória
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return NextResponse.json({ success: true, imageUrl: null });
    }

    const imageUrl = await searchProductImage(query.trim());

    return NextResponse.json({ success: true, imageUrl });
  } catch {
    // Falha silenciosa — retorna null para o client tentar de novo
    return NextResponse.json({ success: true, imageUrl: null });
  }
}
