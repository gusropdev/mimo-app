import Image from "next/image";
import { Plus } from "lucide-react";

interface EmptyStateProps {
  isOwnList: boolean;
  ownerName: string;
  onAddClick?: () => void;
}

export function EmptyState({ isOwnList, ownerName, onAddClick }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-white p-8 sm:p-14 text-center my-6 shadow-xs overflow-hidden">
      {/* Logo MIMO */}
      <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-black overflow-hidden shadow-lg shadow-black/10 border border-zinc-900 mb-5">
        <Image
          src="/mimo-logo.png"
          alt="MIMO Logo"
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Título & Texto */}
      <h3 className="text-lg sm:text-2xl font-bold text-zinc-900 tracking-tight">
        {isOwnList ? "Sua lista ainda está vazia" : `A lista de ${ownerName} está vazia`}
      </h3>
      <p className="mt-2 max-w-sm text-xs sm:text-sm font-normal text-zinc-500 leading-relaxed">
        {isOwnList
          ? "Adicione aquele item que você quer ganhar. É só digitar o nome que buscamos a foto automaticamente!"
          : `${ownerName} ainda não colocou nenhum item por aqui. Dê uma espiada mais tarde!`}
      </p>

      {/* Botão de Ação */}
      {isOwnList && onAddClick && (
        <button
          onClick={onAddClick}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-zinc-800 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Adicionar item desejado</span>
        </button>
      )}
    </div>
  );
}
