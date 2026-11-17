/**
 * Busca imagem de produto via DuckDuckGo Image Search.
 *
 * Funciona sem API key. Usado automaticamente quando o usuário
 * digita o nome do produto no formulário de adição.
 */
export async function searchProductImage(query: string): Promise<string | null> {
  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

  try {
    // 1. Obtém o token VQD necessário para a busca
    const vqdRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
      {
        headers: { "User-Agent": ua },
        signal: AbortSignal.timeout(7000),
      }
    );
    const vqdText = await vqdRes.text();
    const match =
      vqdText.match(/vqd=([^&"'\s]+)/) || vqdText.match(/vqd:\s*"([^"]+)"/);
    if (!match) return null;

    const vqd = match[1];

    // 2. Busca imagens com o token
    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?l=br-pt&o=json&q=${encodeURIComponent(query)}&vqd=${encodeURIComponent(vqd)}&f=,,,type__photo,`,
      {
        headers: {
          "User-Agent": ua,
          Referer: "https://duckduckgo.com/",
        },
        signal: AbortSignal.timeout(7000),
      }
    );

    const data = await imgRes.json();
    if (!Array.isArray(data.results) || data.results.length === 0) return null;

    // Prioriza HTTPS direto; filtra SVG e logos genéricos
    const valid = data.results.find(
      (r: { image?: string; thumbnail?: string }) =>
        r.image &&
        r.image.startsWith("https") &&
        !r.image.includes("logo") &&
        !r.image.endsWith(".svg")
    );

    return valid?.image || data.results[0]?.image || null;
  } catch {
    return null;
  }
}
