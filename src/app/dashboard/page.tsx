"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Product, Profile } from "@/types";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { EmptyState } from "@/components/EmptyState";
import { AddProductModal } from "@/components/AddProductModal";
import { EditProductModal } from "@/components/EditProductModal";
import { DeleteConfirmModal } from "@/components/DeleteConfirmModal";
import { Plus, ArrowUpDown, Search, CheckCircle2, Bookmark } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<{ id: string; email: string } | null>(null);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Aba ativa: 'mine' ou 'partner'
  const [activeTab, setActiveTab] = useState<"mine" | "partner">("mine");

  // Ordenação e busca
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price_asc" | "price_desc">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  // Modais
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setCurrentUser({ id: user.id, email: user.email || "" });

      const { data: profiles } = await supabase.from("profiles").select("*");

      if (profiles && profiles.length > 0) {
        const myProfile = profiles.find((p) => p.id === user.id) || null;
        const partnerProfile = profiles.find((p) => p.id !== user.id) || null;
        setCurrentProfile(myProfile);
        setOtherProfile(partnerProfile);
      }

      const { data: productsData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!prodError && productsData) {
        setProducts(productsData);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const refreshProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setProducts(data);
  };

  const myProducts = useMemo(() => {
    if (!currentUser) return [];
    return products.filter((p) => p.user_id === currentUser.id);
  }, [products, currentUser]);

  const partnerProducts = useMemo(() => {
    if (!currentUser) return [];
    return products.filter((p) => p.user_id !== currentUser.id);
  }, [products, currentUser]);

  const displayedProducts = useMemo(() => {
    let list = activeTab === "mine" ? [...myProducts] : [...partnerProducts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.store_name && p.store_name.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === "price_asc") return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sortBy === "price_desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      return 0;
    });
  }, [activeTab, myProducts, partnerProducts, sortBy, searchQuery]);

  // Nomes para as abas
  const isKaylane =
    currentUser?.email?.toLowerCase().includes("kaylane") ||
    currentProfile?.display_name?.toLowerCase().includes("kaylane");

  const myDisplayName =
    currentProfile?.display_name || (isKaylane ? "Kaylane" : "Gustavo");
  const partnerDisplayName =
    otherProfile?.display_name || (isKaylane ? "Gustavo" : "Kaylane");

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28 sm:pb-20 font-sans text-zinc-900" suppressHydrationWarning>
      <Navbar userName={myDisplayName} userEmail={currentUser?.email || ""} />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-6 sm:pt-8" suppressHydrationWarning>

        {/* Topo com título e ação principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Coleção de Desejos
            </h2>
            <p className="text-xs sm:text-sm font-normal text-zinc-500 mt-1">
              {activeTab === "mine"
                ? `Seus itens salvos que você gostaria de ganhar.`
                : `Itens adicionados por ${partnerDisplayName}.`}
            </p>
          </div>

          {/* Botão Adicionar Desktop */}
          {activeTab === "mine" && currentUser && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="hidden sm:inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 active:scale-95 transition-all shrink-0"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span>Adicionar item desejado</span>
            </button>
          )}
        </div>

        {/* Controles: Abas + Busca + Ordenação */}
        <div className="py-5 space-y-4">

          {/* Abas com contraste nítido e legível */}
          <div className="grid grid-cols-2 p-1.5 bg-zinc-200/70 rounded-2xl sm:max-w-md border border-zinc-200">
            <button
              onClick={() => setActiveTab("mine")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === "mine"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${activeTab === "mine" ? "fill-rose-500 text-rose-500" : "text-zinc-400"}`} />
              <span className="truncate">Lista de {myDisplayName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  activeTab === "mine"
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-300 text-zinc-700"
                }`}
              >
                {myProducts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("partner")}
              className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === "partner"
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <Bookmark className={`h-4 w-4 ${activeTab === "partner" ? "fill-rose-500 text-rose-500" : "text-zinc-400"}`} />
              <span className="truncate">Lista de {partnerDisplayName}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  activeTab === "partner"
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-300 text-zinc-700"
                }`}
              >
                {partnerProducts.length}
              </span>
            </button>
          </div>

          {/* Barra de Busca & Ordenação */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por produto, loja ou recado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm font-normal text-zinc-800 placeholder-zinc-400 shadow-2xs focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
              />
            </div>

            <div className="relative shrink-0">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "price_asc" | "price_desc")}
                className="appearance-none rounded-2xl border border-zinc-200 bg-white pl-9 pr-8 py-2.5 text-xs sm:text-sm font-medium text-zinc-700 shadow-2xs focus:border-zinc-900 focus:outline-none transition-all"
              >
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : displayedProducts.length === 0 ? (
            <EmptyState
              isOwnList={activeTab === "mine"}
              ownerName={partnerDisplayName}
              onAddClick={() => setIsAddOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isOwner={product.user_id === currentUser?.id}
                  onEdit={(p) => setEditingProduct(p)}
                  onDelete={(p) => setDeletingProduct(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button (FAB) Mobile */}
      {activeTab === "mine" && currentUser && (
        <aside aria-label="Ações rápidas" className="fixed bottom-6 right-5 sm:hidden z-30">
          <button
            onClick={() => setIsAddOpen(true)}
            aria-label="Adicionar item desejado"
            className="flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-zinc-950/30 border border-zinc-800 active:scale-95 transition-transform"
          >
            <Plus className="h-5 w-5 stroke-[2.5] text-rose-400" />
            <span>Adicionar item desejado</span>
          </button>
        </aside>
      )}

      {/* Modal Adicionar */}
      {currentUser && (
        <AddProductModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onSuccess={() => {
            refreshProducts();
            showToast("Item adicionado à sua lista com sucesso! ✨");
          }}
          userId={currentUser.id}
        />
      )}

      {/* Modal Editar */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          isOpen={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => {
            refreshProducts();
            showToast("Alterações salvas com sucesso!");
          }}
        />
      )}

      {/* Modal Excluir */}
      {deletingProduct && (
        <DeleteConfirmModal
          product={deletingProduct}
          isOpen={!!deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onSuccess={() => {
            refreshProducts();
            showToast("Item removido da lista.");
          }}
        />
      )}

      {/* Toast Flutuante */}
      {toastMessage && (
        <aside aria-label="Notificação" className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 flex items-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-xs sm:text-sm font-medium text-white shadow-xl border border-zinc-800 animate-in slide-in-from-bottom-4 fade-in">
          <CheckCircle2 className="h-4 w-4 text-rose-400 shrink-0 stroke-[2]" />
          <span>{toastMessage}</span>
        </aside>
      )}
    </div>
  );
}
