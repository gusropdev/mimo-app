import dns from "dns/promises";
import net from "net";

/**
 * Verifica se um endereço IPv4 é privado ou reservado
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [b0, b1] = parts;

  // 0.0.0.0/8 (Endereço atual)
  if (b0 === 0) return true;
  // 10.0.0.0/8 (Rede privada RFC 1918)
  if (b0 === 10) return true;
  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true;
  // 169.254.0.0/16 (Link-local)
  if (b0 === 169 && b1 === 254) return true;
  // 172.16.0.0/12 (Rede privada RFC 1918: 172.16.0.0 – 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
  // 192.168.0.0/16 (Rede privada RFC 1918)
  if (b0 === 192 && b1 === 168) return true;
  // 100.64.0.0/10 (Carrier-grade NAT RFC 6598)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;
  // 224.0.0.0/4 (Multicast) e 240.0.0.0/4 (Reservado)
  if (b0 >= 224) return true;

  return false;
}

/**
 * Verifica se um endereço IPv6 é privado, loopback ou reservado
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // Loopback ::1
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;
  // Unspecified ::
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;
  // Unique Local (fc00::/7)
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  // Link-local (fe80::/10)
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
  // IPv4 mapeado ::ffff:192.168.x.x
  if (normalized.includes("::ffff:")) {
    const ipv4Part = normalized.split("::ffff:")[1];
    if (ipv4Part && net.isIPv4(ipv4Part)) {
      return isPrivateIPv4(ipv4Part);
    }
  }

  return false;
}

/**
 * Valida se um IP é privado/interno
 */
export function isPrivateIP(ip: string): boolean {
  if (net.isIPv4(ip)) {
    return isPrivateIPv4(ip);
  }
  if (net.isIPv6(ip)) {
    return isPrivateIPv6(ip);
  }
  return true; // Se não for IP válido reconhecido, bloqueia por precaução
}

/**
 * Validação rigorosa de URL para mitigar ataques SSRF
 */
export async function validateSafeUrl(urlString: string): Promise<{ safe: boolean; url?: URL; reason?: string }> {
  try {
    const parsed = new URL(urlString);

    // 1. Apenas protocolos HTTP e HTTPS
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { safe: false, reason: "Apenas protocolos HTTP e HTTPS são permitidos." };
    }

    // 2. Apenas portas padrão (80, 443) ou sem porta explícita
    if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
      return { safe: false, reason: "Porta não permitida." };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 3. Bloqueio de hostnames internos e loopback
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".lan") ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1"
    ) {
      return { safe: false, reason: "Destino local ou de rede interna bloqueado." };
    }

    // Se o hostname for um IP literal direto
    if (net.isIP(hostname)) {
      if (isPrivateIP(hostname)) {
        return { safe: false, reason: "Endereço IP privado não permitido." };
      }
    } else {
      // 4. Resolução DNS e verificação de todos os IPs retornados
      try {
        const lookups = await dns.lookup(hostname, { all: true });
        if (!lookups || lookups.length === 0) {
          return { safe: false, reason: "Não foi possível resolver o endereço do host." };
        }

        for (const record of lookups) {
          if (isPrivateIP(record.address)) {
            return {
              safe: false,
              reason: `O endereço resolvido (${record.address}) pertence a uma rede interna restrita.`,
            };
          }
        }
      } catch (dnsErr) {
        return { safe: false, reason: "Falha ao resolver o domínio especificado." };
      }
    }

    return { safe: true, url: parsed };
  } catch {
    return { safe: false, reason: "URL inválida ou mal formatada." };
  }
}
