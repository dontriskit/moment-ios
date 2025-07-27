import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { UlepszenieCard } from "@/components/app/UlepszenieCard";
import Link from "next/link";

export default async function ForYouPage() {
  const session = await auth();
  
  let forYouData;
  try {
    forYouData = await api.activation.getForYouPageData();
  } catch {
    // If no data, show empty state
    forYouData = {
      featured: [],
      newReleases: [],
      favorites: [],
    };
  }

  // Get current time of day for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Dzień dobry" : hour < 17 ? "Dzień dobry" : "Dobry wieczór";

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <p className="text-muted-foreground font-medium">{greeting},</p>
        <h1 className="text-3xl font-bold text-foreground">
          {session?.user?.name?.split(' ')[0] || "Przyjacielu"}
        </h1>
      </header>

      <div className="space-y-8">
        {/* Featured This Week */}
        {forYouData.featured.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Polecane w tym tygodniu:</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {forYouData.featured.map((activation) => (
                <UlepszenieCard key={activation.id} ulepszenie={activation} />
              ))}
            </div>
          </section>
        )}

        {/* Brand New Releases */}
        {forYouData.newReleases.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">Najnowsze wydania</h2>
              <Link href="/explore" className="text-primary hover:text-primary/80 font-medium hover:underline">
                ZOBACZ WSZYSTKIE
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {forYouData.newReleases.map((activation) => (
                <UlepszenieCard key={activation.id} ulepszenie={activation} />
              ))}
            </div>
          </section>
        )}

        {/* Your Favorites */}
        {forYouData.favorites.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-foreground">Twoje ulubione</h2>
              <Link href="/playlists" className="text-primary hover:text-primary/80 font-medium hover:underline">
                ZOBACZ WSZYSTKIE
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {forYouData.favorites.map((activation) => (
                <UlepszenieCard key={activation.id} ulepszenie={activation} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {forYouData.featured.length === 0 && forYouData.newReleases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4 font-medium">Brak ulepszeń.</p>
            <p className="text-sm text-muted-foreground">Uruchom `pnpm db:seed` aby dodać przykładową zawartość.</p>
          </div>
        )}
      </div>
    </div>
  );
}