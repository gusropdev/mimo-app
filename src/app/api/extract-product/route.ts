import { NextResponse } from "next/server";

/**
 * Esta rota foi removida.
 * O app agora usa inserção manual de dados com busca automática de imagem.
 * Veja: /api/search-image
 */
export async function POST() {
  return NextResponse.json(
    { error: "Esta funcionalidade foi removida. Use /api/search-image." },
    { status: 410 }
  );
}
