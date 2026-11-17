/**
 * Sanitiza a URL do Supabase para evitar erros de caminhos inválidos
 * (ex: se o usuário colocou /rest/v1 ou barra no final)
 */
export function sanitizeSupabaseUrl(url: string | undefined): string {
  if (!url) return "https://placeholder-project.supabase.co";
  let cleaned = url.trim();
  // Remove /rest/v1 ou /rest/v1/ caso tenha sido copiado da aba REST do painel
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, "");
  // Remove barras no final
  cleaned = cleaned.replace(/\/+$/, "");
  return cleaned;
}
