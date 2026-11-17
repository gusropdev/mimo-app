export function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-3xl border border-zinc-200/70 bg-white p-4 sm:p-5 shadow-xs animate-pulse overflow-hidden">
      {/* Imagem placeholder */}
      <div className="w-full aspect-[4/3] rounded-2xl bg-zinc-200/70 mb-4" />
      {/* Tag de loja */}
      <div className="h-4 w-20 rounded-md bg-zinc-200/70 mb-3" />
      {/* Título */}
      <div className="h-4.5 w-full rounded-md bg-zinc-200/70 mb-2" />
      <div className="h-4.5 w-3/4 rounded-md bg-zinc-200/70 mb-4" />
      {/* Preço */}
      <div className="h-7 w-28 rounded-lg bg-zinc-200/70 mb-4" />
      {/* Botão */}
      <div className="mt-auto h-10 w-full rounded-2xl bg-zinc-200/70" />
    </div>
  );
}
