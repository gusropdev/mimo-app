/**
 * Busca lista de imagens de produto com múltiplas estratégias resilientes:
 * 1. Serper.dev (Google Images oficial - se SERPER_API_KEY estiver configurada)
 * 2. Google Custom Search (se GOOGLE_SEARCH_API_KEY e CX estiverem configuradas)
 * 3. Bing Images (Sem API key - excelente compatibilidade com serverless/Vercel)
 * 4. DuckDuckGo Images (Sem API key)
 */
export async function searchProductImages(
  query: string,
  maxResults: number = 8
): Promise<string[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return [];

  const foundImages: string[] = [];
  const seenUrls = new Set<string>();

  const addImage = (url: string | undefined | null) => {
    if (!url || typeof url !== "string") return;
    const trimmed = url.trim();
    if (
      trimmed.startsWith("https://") &&
      !seenUrls.has(trimmed) &&
      !trimmed.includes("logo") &&
      !trimmed.endsWith(".svg") &&
      !trimmed.includes("favicon") &&
      !trimmed.includes("icon")
    ) {
      seenUrls.add(trimmed);
      foundImages.push(trimmed);
    }
  };

  // 1. Serper.dev (Google Images oficial via API - se configurado)
  const serperKey = process.env.SERPER_API_KEY?.trim();
  if (serperKey) {
    try {
      const res = await fetch("https://google.serper.dev/images", {
        method: "POST",
        headers: {
          "X-API-KEY": serperKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: cleanQuery, gl: "br", hl: "pt-br", num: maxResults + 2 }),
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.images)) {
          for (const img of data.images) {
            addImage(img.imageUrl);
            if (foundImages.length >= maxResults) return foundImages;
          }
        }
      }
    } catch (err) {
      console.warn("[searchProductImages] Serper falhou:", err);
    }
  }

  // 2. Google Custom Search (se configurado)
  const googleKey = process.env.GOOGLE_SEARCH_API_KEY?.trim();
  const googleCx = process.env.GOOGLE_SEARCH_CX?.trim();
  if (googleKey && googleCx && foundImages.length < maxResults) {
    try {
      const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
        cleanQuery
      )}&searchType=image&key=${googleKey}&cx=${googleCx}&num=${maxResults}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.items)) {
          for (const item of data.items) {
            addImage(item.link);
            if (foundImages.length >= maxResults) return foundImages;
          }
        }
      }
    } catch (err) {
      console.warn("[searchProductImages] Google Custom Search falhou:", err);
    }
  }

  const ua =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

  // 3. Bing Images (Sem API key - funciona perfeitamente em datacenters/Vercel)
  if (foundImages.length < maxResults) {
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
        const murlMatches = html.matchAll(/murl&quot;:&quot;(https:[^&]+)&quot;/g);
        for (const m of murlMatches) {
          try {
            const candidate = decodeURIComponent(m[1].replace(/\\u002f/g, "/"));
            addImage(candidate);
            if (foundImages.length >= maxResults) return foundImages;
          } catch {}
        }

        const iuscMatches = html.matchAll(/class="iusc"[^>]*?m="([^"]+)"/g);
        for (const match of iuscMatches) {
          try {
            const jsonStr = match[1].replace(/&quot;/g, '"');
            const parsed = JSON.parse(jsonStr);
            if (parsed.murl) {
              addImage(parsed.murl);
              if (foundImages.length >= maxResults) return foundImages;
            }
          } catch {}
        }
      }
    } catch (err) {
      console.warn("[searchProductImages] Bing fallback falhou:", err);
    }
  }

  // 4. DuckDuckGo Image Search (Fallback tradicional)
  if (foundImages.length < maxResults) {
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
        if (Array.isArray(data.results)) {
          for (const r of data.results) {
            addImage(r.image);
            if (foundImages.length >= maxResults) return foundImages;
          }
        }
      }
    } catch (err) {
      console.warn("[searchProductImages] DuckDuckGo fallback falhou:", err);
    }
  }

  return foundImages;
}

export async function searchProductImage(query: string): Promise<string | null> {
  const images = await searchProductImages(query, 1);
  return images[0] || null;
}
