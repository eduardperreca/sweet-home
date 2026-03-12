"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminLogin } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Waves } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [creds, setCreds] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCreds((c) => ({ ...c, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { token, user } = await adminLogin(creds.username, creds.password);
      localStorage.setItem("vs_token", token);
      localStorage.setItem("vs_username", user.username);
      router.push("/admin/dashboard");
    } catch {
      toast.error("Credenziali non valide");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sea-50 to-sea-100 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sea-500 rounded-2xl mb-4">
            <Waves className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-gray-800">Villa Silvia</h1>
          <p className="text-sm text-gray-400 mt-1">Pannello di amministrazione</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 space-y-5"
        >
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              autoComplete="username"
              required
              value={creds.username}
              onChange={set("username")}
              placeholder="admin"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={creds.password}
              onChange={set("password")}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Accesso in corso…" : "Accedi"}
          </Button>

          {/* Placeholder for future SSO */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-2">oppure</span>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-lg py-2 text-sm text-gray-400 cursor-not-allowed"
          >
            Accedi con Google (prossimamente)
          </button>
        </form>
      </div>
    </div>
  );
}
