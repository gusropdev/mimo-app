"use client";

import { useState } from "react";
import { Product } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { Trash2, Loader2, X } from "lucide-react";

interface DeleteConfirmModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteConfirmModal({
  product,
  isOpen,
  onClose,
  onSuccess,
}: DeleteConfirmModalProps) {
  const supabase = createClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (deleteError) {
        setError(deleteError.message);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError("Erro ao tentar excluir produto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl bg-white p-6 shadow-2xl border border-zinc-200/80 animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 pb-safe">

        {/* Mobile handle */}
        <div className="flex justify-center -mt-2 mb-3 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-zinc-200" />
        </div>

        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 shadow-xs mb-4">
            <Trash2 className="h-6 w-6" />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
          Remover este presente?
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed">
          Tem certeza de que deseja remover <span className="font-semibold text-zinc-800">&ldquo;{product.title}&rdquo;</span> da sua wishlist? Essa ação não pode ser desfeita.
        </p>

        {error && (
          <p className="mt-3 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-2xl border border-zinc-200 bg-white py-3 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition-all text-center"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all text-center"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Removendo...</span>
              </>
            ) : (
              <span>Sim, excluir</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
