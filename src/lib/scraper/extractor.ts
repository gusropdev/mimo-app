/**
 * Busca imagem de produto com múltiplas estratégias resilientes:
 * 1. Serper.dev (Google Images oficial - se SERPER_API_KEY estiver configurada)
 * 2. Google Custom Search (se GOOGLE_SEARCH_API_KEY e CX estiverem configuradas)
 * 3. Bing Images (Sem API key - excelente compatibilidade com serverless/Vercel)
 * 4. DuckDuckGo Images (Sem API key)
 */
export async function searchProductImage(query: string): Promise<string | null> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return null;

  // 1. Serper.dev (Google Images oficial via API - 2.500 buscas grátis, sem bloqueio de IP)
  const serperKey = process.env.SERPER_API_KEY?.trim();
  if (serperKey) {
    try {
      const res = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: cleanQuery, gl: "br", hl: "pt-br", num: 6 }),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.images) && data.images.length > 0) {
          const valid = data.images.find(
            (img: { imageUrl?: string }) =>
              img.imageUrl &&
              img.imageUrl.startsWith("https") &&
              !img.imageUrl.includes("logo") &&
              !img.imageUrl.endsWith(".svg")
          );
          if (valid?.imageUrl) return valid.imageUrl;
          if (data.images[0]?.imageUrl) return data.images[0].imageUrl;
        }
      }
    } catch (err) {
      console.warn("[searchProductImage] Serper falhou:", err);
    }
  }

  // 2. Google Custom Search (se configurado)
  const googleKey = process.env.GOOGLE_SEARCH_API_KEY?.trim();
  const googleCx = process.env.GOOGLE_SEARCH_CX?.trim();
  if (googleKey && googleCx) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        cleanQuery
      )}&searchType=image&key=${googleKey}&cx=${googleCx}&num=5`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items) && data.items.length > 0) {
          const valid = data.items.find(
            (item: { link?: string }) =>
              item.link &&
              item.link.startsWith("https") &&
              !item.link.endsWith(".svg")
          );
          if (valid?.link) return valid.link;
        }
      }
    } catch (err) {
      console.warn("[searchProductImage] Google Custom Search falhou:", err);
    }
  }

  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

  // 3. Bing Images (Sem API key - funciona muito bem em datacenters/Vercel)
  try {
    const bingUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(cleanQuery)}&form=HDRSC2&first=1`;
    const res = await fetch(bingUrl, {
      headers: {
        "User-Agent": ua,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const html = await res.text();
      // Extrai URLs do atributo murl que o Bing insere no DOM
      const murlMatches = html.matchAll(/murl&quot;:&quot;(https:[^&]+)&quot;/g);
      for (const m of murlMatches) {
        try {
          const candidate = decodeURIComponent(m[1].replace(/\\u002f/g, "/"));
          if (
            candidate &&
            candidate.startsWith("https") &&
            !candidate.includes("logo") &&
            !candidate.endsWith(".svg")
          ) {
            return candidate;
          }
        } catch {}
      }

      // Fallback para atributo JSON class="iusc"
      const iuscMatches = html.matchAll(/class="iusc"[^>]*?m="([^"]+)"/g);
      for (const match of iuscMatches) {
        try {
          const jsonStr = match[1].replace(/&quot;/g, '"');
          const parsed = JSON.parse(jsonStr);
          if (parsed.murl && parsed.murl.startsWith("https")) {
            return parsed.murl;
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn("[searchProductImage] Bing fallback falhou:", err);
  }

  // 4. DuckDuckGo Image Search (Fallback tradicional)
  try {
    const vqdRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&iax=images&ia=images`,
      {
        headers: { "User-Agent": ua },
        signal: AbortSignal.timeout(5000),
      }
    );
    const vqdText = await vqdRes.text();
    const match =
      vqdText.match(/vqd=([^&"'\s]+)/) || vqdText.match(/vqd:\s*"([^"]+)"/);

    if (match) {
      const vqd = match[1];
      const imgRes = await fetch(
        `https://duckduckgo.com/i.js?l=br-pt&o=json&q=${encodeURIComponent(
          cleanQuery
        )}&vqd=${encodeURIComponent(vqd)}&f=,,,type__photo,`,
        {
          headers: {
            "User-Agent": ua,
            Referer: "https://duckduckgo.com/",
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      const data = await imgRes.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        const valid = data.results.find(
          (r: { image?: string }) =>
            r.image &&
            r.image.startsWith("https") &&
            !r.image.includes("logo") &&
            !r.image.endsWith(".svg")
        );
        if (valid?.image) return valid.image;
        if (data.results[0]?.image) return data.results[0].image;
      }
    }
  } catch (err) {
    console.warn("[searchProductImage] DuckDuckGo fallback falhou:", err);
  }

  return null;
}
