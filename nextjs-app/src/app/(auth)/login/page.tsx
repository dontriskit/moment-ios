"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Nieprawidłowe dane logowania. Spróbuj ponownie.");
    } else {
      router.push("/for-you");
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="h-1/4 bg-gradient-to-br from-purple-900 to-pink-900 flex items-center p-6">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">Witaj ponownie</h1>
      </div>
      
      <div className="flex-1 bg-white p-6">
        <h2 className="text-2xl font-bold mb-6">Zaloguj się e-mailem</h2>
        
        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Hasło
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-primary py-3 font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : (
              "ZALOGUJ SIĘ"
            )}
          </button>
        </form>
        
        <div className="mt-6 space-y-4">
          <Link
            href="/forgot-password"
            className="block text-center text-primary hover:text-primary/80 hover:underline font-medium"
          >
            Zapomniałeś hasła?
          </Link>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Lub</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => signIn("google", { callbackUrl: "/for-you" })}
              className="w-full rounded-md border border-gray-300 bg-white py-3 font-medium hover:bg-gray-50"
            >
              Kontynuuj z Google
            </button>
          </div>
          
          <p className="text-center text-sm text-gray-600">
            Nie masz konta?{" "}
            <Link href="/register" className="text-primary hover:text-primary/80 hover:underline font-medium">
              Zarejestruj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}