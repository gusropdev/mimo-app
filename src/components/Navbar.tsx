"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

interface NavbarProps {
  userName: string;
  userEmail: string;
}

export function Navbar({ userName, userEmail }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initial = userName.trim().charAt(0).toUpperCase() || "M";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/90 bg-white/95 backdrop-blur-2xl shadow-xs" suppressHydrationWarning>
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6" suppressHydrationWarning>

        {/* Brand: MIMO com Logo Oficial */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black overflow-hidden shadow-md shadow-black/10 border border-zinc-900">
            <Image
              src="/mimo-logo.png"
              alt="MIMO Logo"
              width={40}
              height={40}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
              MIMO<span className="text-rose-500">.</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded-md">
              wishlist
            </span>
          </div>
        </div>

        {/* Perfil & Sair */}
        <div className="flex items-center gap-2.5">
          {/* Badge Usuário */}
          <div
            className="flex items-center gap-2 rounded-2xl bg-zinc-100 pl-1.5 pr-3 py-1 border border-zinc-200 shadow-2xs"
            title={userEmail}
            suppressHydrationWarning
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-pink-500 text-xs font-bold text-white shadow-xs"
              suppressHydrationWarning
            >
              {initial}
            </div>
            <span
              className="text-xs font-bold text-zinc-800 max-w-[120px] truncate sm:max-w-none"
              suppressHydrationWarning
            >
              {userName}
            </span>
          </div>

          {/* Sair */}
          <button
            onClick={handleSignOut}
            title="Sair da conta"
            className="flex h-9 w-9 sm:w-auto sm:px-3 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 transition-all shadow-2xs"
          >
            <LogOut className="h-4 w-4 stroke-[2]" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
