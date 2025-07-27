import { api } from "@/trpc/server";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export default async function ExplorePage() {
  let categories: Awaited<ReturnType<typeof api.activation.getExploreCategories>> = [];
  try {
    categories = await api.activation.getExploreCategories();
  } catch {
    categories = [];
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Odkrywaj</h1>
      
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link href={`/explore/${category.slug}`} key={category.id}>
              <Card className="border-none overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="relative p-0 aspect-square">
                  {category.imageUrl ? (
                    <Image 
                      src={category.imageUrl} 
                      alt={category.name} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-primary" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h2 className="text-white font-bold text-xl text-center px-4">
                      {category.name}
                    </h2>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Nie znaleziono kategorii.</p>
          <p className="text-sm text-gray-400 mt-2">Uruchom `pnpm db:seed` aby dodać przykładowe dane.</p>
        </div>
      )}
    </div>
  );
}