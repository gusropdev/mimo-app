"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Informe seu e-mail cadastrado.");
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage("Instruções de redefinição enviadas para o seu e-mail.");
      }
    } catch {
      setErrorMessage("Erro ao solicitar redefinição de senha.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: displayName.trim() || email.split("@")[0],
            },
          },
        });

        if (error) {
          if (error.message.includes("User already registered")) {
            setErrorMessage("Este e-mail já está cadastrado. Tente entrar!");
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setSuccessMessage(
            "Conta criada com sucesso! Se necessário, confirme seu e-mail ou tente entrar."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setErrorMessage("E-mail ou senha incorretos.");
          } else {
            setErrorMessage(error.message);
          }
          return;
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMessage("Ocorreu um erro ao conectar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAFAFA] overflow-hidden text-zinc-900 font-sans">

      <div className="w-full max-w-md relative z-10">

        {/* Brand: MIMO com Logo Oficial */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-black overflow-hidden shadow-xl shadow-black/10 border border-zinc-900 mb-4">
            <Image
              src="/mimo-logo.png"
              alt="MIMO Logo"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
            MIMO<span className="text-rose-500">.</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-zinc-500 mt-1">
            Lista privada de desejos e presentes
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-zinc-950/5">

          {/* Seletor de Modo: Entrar ou Cadastrar */}
          {!isForgotPassword && (
            <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-2xl mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2.5 rounded-xl transition-all duration-200 ${
                  !isSignUp
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2.5 rounded-xl transition-all duration-200 ${
                  isSignUp
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Criar conta
              </button>
            </div>
          )}

          {/* Alertas */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-medium text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form de Recuperação de Senha */}
          {isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 active:scale-98 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando link...</span>
                  </>
                ) : (
                  <span>Enviar link de recuperação</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold transition-colors"
                >
                  ← Voltar para o login
                </button>
              </div>
            </form>
          ) : (
            /* Form de Login / Cadastro */
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Nome ou apelido
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ex: Gustavo ou Kaylane"
                      className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-zinc-700">
                    Senha
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-3 text-sm font-medium text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-zinc-800 active:scale-98 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? "Criar conta" : "Acessar Lista"}</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs font-medium text-zinc-400 flex items-center justify-center gap-1.5">
          <Lock className="h-3 w-3" />
          <span>Acesso restrito para contas autorizadas.</span>
        </p>
      </div>
    </div>
  );
}
