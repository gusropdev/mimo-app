"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrencyBRL } from "@/lib/utils";
import {
  X,
  Search,
  Loader2,
  AlertCircle,
  Check,
  RefreshCw,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ImageOff,
  Plus,
  MessageSquareQuote,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function AddProductModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: AddProductModalProps) {
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [storeName, setStoreName] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");

  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Busca automática de imagem
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (title.trim().length < 3) return;

    debounceRef.current = setTimeout(() => {
      handleSearchImage(title.trim());
    }, 900);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const handleSearchImage = async (query: string) => {
    setIsSearchingImage(true);
    setImageError(false);
    try {
      const res = await fetch("/api/search-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setImageUrl(data.imageUrl || "");
      setHasSearched(true);
    } catch {
      setImageUrl("");
      setHasSearched(true);
    } finally {
      setIsSearchingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSaveError("O nome do produto é obrigatório.");
      return;
    }

    setSaveError(null);
    setIsSaving(true);

    try {
      const numericPrice = price ? parseFloat(price.replace(",", ".")) : null;

      const { error } = await supabase.from("products").insert({
        user_id: userId,
        title: title.trim(),
        url: url.trim() || null,
        price: numericPrice && !isNaN(numericPrice) ? numericPrice : null,
        image_url: imageUrl.trim() || null,
        store_name: storeName.trim() || null,
        notes: notes.trim() || null,
      });

      if (error) {
        setSaveError(error.message);
        return;
      }

      reset();
      onSuccess();
      onClose();
    } catch {
      setSaveError("Erro ao salvar produto.");
    } finally {
      setIsSaving(false);
    }
  };

  const reset = () => {
    setTitle("");
    setPrice("");
    setImageUrl("");
    setStoreName("");
    setUrl("");
    setNotes("");
    setHasSearched(false);
    setShowOptional(false);
    setSaveError(null);
    setImageError(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  const currentNumericPrice = price ? parseFloat(price.replace(",", ".")) : null;
  const hasValidPrice = currentNumericPrice !== null && !isNaN(currentNumericPrice);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/70 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full sm:max-w-lg rounded-t-[32px] sm:rounded-3xl bg-white shadow-2xl border border-zinc-200 overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 duration-300">

        {/* Barra de arraste para Mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-zinc-300" />
        </div>

        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 pt-3 pb-4 sm:py-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-950 text-white shadow-md">
              <Plus className="h-5 w-5 stroke-[3] text-rose-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900 tracking-tight">
                Adicionar Item Desejado
              </h3>
              <p className="text-[11px] font-medium text-zinc-400">
                O que você quer colocar na sua lista?
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 stroke-[2]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {saveError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Nome do Produto */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1.5">
              Nome do produto <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              required
              placeholder="Ex: Tênis Vans Old Skool 39, Perfume Libre..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setHasSearched(false);
                setImageUrl("");
                setImageError(false);
              }}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
            />
            {title.trim().length >= 3 && !hasSearched && !isSearchingImage && (
              <p className="mt-1.5 text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-rose-500 animate-spin" />
                Buscando melhor foto automaticamente...
              </p>
            )}
          </div>

          {/* Card de Imagem Automática */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3.5 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                Imagem do produto
              </span>
              {hasSearched && title.trim().length >= 3 && (
                <button
                  type="button"
                  onClick={() => handleSearchImage(title.trim())}
                  disabled={isSearchingImage}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isSearchingImage ? "animate-spin" : ""}`} />
                  Buscar outra foto
                </button>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white border border-zinc-200 flex items-center justify-center shadow-xs">
                {isSearchingImage ? (
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-900" />
                ) : imageUrl && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-contain p-1"
                    onError={() => setImageError(true)}
                  />
                ) : imageError ? (
                  <ImageOff className="h-7 w-7 text-zinc-300" />
                ) : (
                  <ShoppingBag className="h-7 w-7 text-zinc-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {isSearchingImage ? (
                  <>
                    <p className="text-xs font-bold text-zinc-900">Buscando foto...</p>
                    <p className="text-[11px] font-medium text-zinc-400 mt-0.5">Pesquisando na web em tempo real.</p>
                  </>
                ) : imageUrl && !imageError ? (
                  <>
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-4 w-4 stroke-[2.5]" />
                      Foto encontrada!
                    </p>
                    <p className="text-[11px] font-medium text-zinc-500 mt-0.5">Quer outra? Clique em &ldquo;Buscar outra foto&rdquo; ou troque abaixo.</p>
                    {hasValidPrice && (
                      <p className="mt-1 text-sm font-bold text-rose-600">{formatCurrencyBRL(currentNumericPrice)}</p>
                    )}
                  </>
                ) : title.trim().length < 3 ? (
                  <>
                    <p className="text-xs font-semibold text-zinc-700">Digite o nome acima</p>
                    <p className="text-[11px] font-medium text-zinc-400 mt-0.5">Buscamos a foto correspondente automaticamente.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-zinc-600">Nenhuma foto direta achada</p>
                    <p className="text-[11px] font-medium text-zinc-400 mt-0.5">Cole o link abaixo ou salve sem foto.</p>
                  </>
                )}
              </div>
            </div>

            {/* Opção para colar link direto ou pesquisar no Google */}
            <div className="mt-3 pt-3 border-t border-zinc-200/70">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-zinc-600">
                  Link direto da foto <span className="text-zinc-400 font-normal">(opcional)</span>
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
              <input
                type="url"
                placeholder="https://... (cole aqui se quiser uma foto específica)"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImageError(false);
                }}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 transition-all"
              />
            </div>
          </div>

          {/* Comentário / Observação para quem vai presentear */}
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
              placeholder="Ex: Tamanho M; pode ser outro modelo similar; não é prioridade..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-xs sm:text-sm font-normal text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all resize-none"
            />
          </div>

          {/* Detalhes Opcionais (Preço, Loja, Link) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200/70 text-xs font-bold text-zinc-800 transition-colors w-full"
            >
              <span className="flex items-center gap-2">
                {showOptional ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Detalhes adicionais (preço, loja, link)
              </span>
              <span className="text-[11px] font-semibold text-zinc-500">
                {showOptional ? "ocultar" : "expandir"}
              </span>
            </button>

            {showOptional && (
              <div className="mt-3 space-y-3 animate-in slide-in-from-top-2 fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Preço (R$)
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="Ex: 199.90"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Loja ou Marca
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Shopee, Amazon..."
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Link do anúncio
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs sm:text-sm font-normal text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Link de foto específica
                  </label>
                  <input
                    type="url"
                    placeholder="Cole o link de uma imagem se preferir..."
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setImageError(false);
                    }}
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs sm:text-sm font-normal text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5 pb-safe">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 sm:flex-none rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || !title.trim()}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-zinc-800 active:scale-95 transition-all disabled:opacity-40"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>Salvar Item</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
