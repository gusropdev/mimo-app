"use client";

import { useState } from "react";
import { Product } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { X, Loader2, AlertCircle, Edit3, MessageSquareQuote, ExternalLink } from "lucide-react";

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: EditProductModalProps) {
  const supabase = createClient();

  const [title, setTitle] = useState(product.title);
  const [url, setUrl] = useState(product.url || "");
  const [price, setPrice] = useState(product.price !== null ? String(product.price) : "");
  const [imageUrl, setImageUrl] = useState(product.image_url || "");
  const [storeName, setStoreName] = useState(product.store_name || "");
  const [notes, setNotes] = useState(product.notes || "");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("O nome do produto é obrigatório.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const numericPrice = price ? parseFloat(price.replace(",", ".")) : null;

      const { error: updateError } = await supabase
        .from("products")
        .update({
          title: title.trim(),
          url: url.trim() || null,
          price: numericPrice && !isNaN(numericPrice) ? numericPrice : null,
          image_url: imageUrl.trim() || null,
          store_name: storeName.trim() || null,
          notes: notes.trim() || null,
        })
        .eq("id", product.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full sm:max-w-lg rounded-t-[32px] sm:rounded-3xl bg-white shadow-2xl border border-zinc-200 overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-300">

        {/* Mobile handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 pt-3 pb-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md">
              <Edit3 className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                Editar Item Desejado
              </h3>
              <p className="text-[11px] font-medium text-zinc-400">
                Ajuste os dados e observações
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 stroke-[2]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleUpdate} className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Nome do produto <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquareQuote className="h-3.5 w-3.5 text-rose-600" />
                Observação para quem vai presentear
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 normal-case">opcional</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Pode ser qualquer cor; prefiro tamanho M; não é urgente..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs sm:text-sm font-normal text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Preço (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">R$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-9 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Loja ou Marca
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Link do anúncio
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs sm:text-sm font-normal text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-700">
                URL da imagem
              </label>
              {title.trim().length >= 2 && (
                <a
                  href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <span>Abrir Google Imagens</span>
                  <ExternalLink className="h-3 w-3 stroke-[2.5]" />
                </a>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs sm:text-sm font-normal text-zinc-900 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
              />
              {imageUrl && (
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Prévia"
                    className="h-full w-full object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5 pb-safe">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
