"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm space-y-4">
        <form
          onSubmit={handleLogin}
          className="w-full space-y-6 p-8 bg-zinc-900 rounded-2xl border border-zinc-800"
        >
          <div>
            <h1 className="text-xl font-semibold text-zinc-100">Secretary</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Sign in to your dashboard
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-950/50 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <Link
          href="/demo"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-sm font-medium rounded-xl transition-colors"
        >
          <span className="text-base">&#x1f441;</span>
          Peek inside with demo data
        </Link>
      </div>
    </div>
  );
}
