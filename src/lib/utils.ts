import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyBRL(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "Preço não informado";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateBR(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "";
  }
}

export function extractDomainStore(url: string): string {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");

    if (hostname.includes("mercadolivre.com") || hostname.includes("mercadolibre.com")) {
      return "Mercado Livre";
    }
    if (hostname.includes("shopee.com")) {
      return "Shopee";
    }
    if (hostname.includes("amazon.com")) {
      return "Amazon";
    }
    if (hostname.includes("magazineluiza.com") || hostname.includes("magalu.com")) {
      return "Magalu";
    }
    if (hostname.includes("shein.com")) {
      return "Shein";
    }
    if (hostname.includes("aliexpress.com")) {
      return "AliExpress";
    }

    // Retorna o domínio amigável (ex: 'kabum.com.br' -> 'Kabum')
    const parts = hostname.split(".");
    if (parts.length > 0 && parts[0]) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return hostname;
  } catch {
    return "Loja Externa";
  }
}
