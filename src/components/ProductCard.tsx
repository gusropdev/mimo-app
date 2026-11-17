"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types";
import { formatCurrencyBRL, formatDateBR } from "@/lib/utils";
import {
  ExternalLink,
  Edit2,
  Trash2,
  ImageOff,
  ShoppingBag,
  Sparkles,
  MessageSquareQuote,
} from "lucide-react";

interface ProductCardProps {
  product: Product;
  isOwner: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

function isNewProduct(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

export function ProductCard({
  product,
  isOwner,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isNew = mounted && isNewProduct(product.created_at);

  return (
    <article className="group relative flex flex-col rounded-[26px] border border-zinc-200/90 bg-white shadow-sm hover:shadow-2xl hover:shadow-zinc-950/10 hover:border-zinc-300 transition-all duration-300 hover:-translate-y-1.5 overflow-hidden">

      {/* Badge NOVO */}
      {isNew && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-1 text-[10px] font-black text-white shadow-md border border-zinc-800 tracking-wider">
          <Sparkles className="h-3 w-3 text-rose-400 fill-rose-400" />
          <span>NOVO</span>
        </div>
      )}

      {/* Ações do Dono (Editar / Excluir) */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(product)}
            title="Editar item"
            aria-label="Editar item"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-zinc-700 shadow-md border border-zinc-200/80 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 active:scale-90 transition-all"
          >
            <Edit2 className="h-3.5 w-3.5 stroke-[2.2]" />
          </button>
          <button
            onClick={() => onDelete(product)}
            title="Excluir item"
            aria-label="Excluir item"
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/95 text-zinc-500 shadow-md border border-zinc-200/80 hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-90 transition-all"
          >
            <Trash2 className="h-3.5 w-3.5 stroke-[2.2]" />
          </button>
        </div>
      )}

      {/* Imagem do Produto com enquadramento marcante */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-b from-zinc-100/80 to-zinc-50 flex items-center justify-center overflow-hidden border-b border-zinc-100">
        {product.image_url && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-108"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-300 p-6">
            {product.image_url && imageError ? (
              <ImageOff className="h-10 w-10 stroke-1 text-zinc-300" />
            ) : (
              <ShoppingBag className="h-10 w-10 stroke-1 text-zinc-300" />
            )}
            <span className="text-[11px] font-bold text-zinc-400">Sem foto</span>
          </div>
        )}

        {/* Loja / Marca (Badge na base) */}
        {product.store_name && (
          <div className="absolute bottom-3 left-3 z-10 rounded-xl bg-zinc-950/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white shadow-xs border border-white/10 uppercase tracking-wider">
            {product.store_name}
          </div>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          {/* Título com destaque */}
          <h3
            title={product.title}
            className="text-base sm:text-lg font-bold text-zinc-900 line-clamp-2 leading-snug tracking-tight group-hover:text-rose-600 transition-colors"
          >
            {product.title}
          </h3>

          {/* Preço e Data */}
          <div className="mt-3 flex items-center justify-between gap-2">
            {product.price !== null ? (
              <div className="inline-flex items-baseline gap-1 rounded-xl bg-rose-50 px-3 py-1.5 border border-rose-200">
                <span className="text-base sm:text-lg font-bold text-rose-600 tracking-tight">
                  {formatCurrencyBRL(product.price)}
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center rounded-xl bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-500 border border-zinc-200">
                Preço a definir
              </span>
            )}

            {product.created_at && (
              <span className="text-[11px] font-medium text-zinc-400 shrink-0">
                {formatDateBR(product.created_at)}
              </span>
            )}
          </div>

          {/* Recadinho / Comentário para quem vai presentear */}
          {product.notes && (
            <div className="mt-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-pink-500/10 p-3.5 border-l-4 border-l-rose-500 border border-zinc-200 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <MessageSquareQuote className="h-4 w-4 text-rose-600 shrink-0 mt-0.5 stroke-[2]" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-rose-700 block uppercase tracking-wider mb-0.5">
                    Observação:
                  </span>
                  <p className="line-clamp-3 leading-relaxed text-xs text-zinc-800 font-normal">
                    &ldquo;{product.notes}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão Ver no site da loja */}
        {product.url && (
          <div className="pt-2 border-t border-zinc-100">
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-rose-600 active:scale-98 transition-all duration-200"
            >
              <span>Ver na loja</span>
              <ExternalLink className="h-4 w-4 stroke-[2]" />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
