import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function LandingPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/for-you");
  }

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-pink-900">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`,
        }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl font-bold mb-4 md:text-5xl text-white drop-shadow-2xl">
          To nie jest aplikacja do medytacji.
        </h1>
        <h2 className="text-5xl font-extrabold text-white md:text-6xl drop-shadow-2xl mb-2">
          To są <span className="bg-gradient-to-r from-pink-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent">Ulepszenia</span>.
        </h2>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full bg-white text-slate-900 px-8 py-4 text-lg font-bold shadow-2xl transition-all hover:scale-105 hover:shadow-[0_20px_60px_-15px_rgba(255,255,255,0.3)]"
          >
            DOŁĄCZ TERAZ
          </Link>
          
          <div>
            <Link
              href="/login"
              className="text-white hover:text-pink-300 underline underline-offset-4 font-medium transition-colors text-lg"
            >
              Masz już konto? Zaloguj się
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}