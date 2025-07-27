import { api } from "@/trpc/server";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Play } from "lucide-react";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: Promise<{
    categorySlug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  let data: Awaited<ReturnType<typeof api.activation.getActivationsByCategory>> | null = null;
  
  try {
    data = await api.activation.getActivationsByCategory({
      categorySlug,
    });
  } catch (error) {
    notFound();
  }

  if (!data?.category) {
    notFound();
  }

  const { category, activations } = data;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/explore">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót do kategorii
          </Button>
        </Link>
        
        <div className="flex items-center gap-4">
          {category.imageUrl && (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden">
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-gray-600 mt-2">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Activations Grid */}
      {activations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activations.map((activation) => (
            <Link href={`/activation/${activation.id}`} key={activation.id}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={activation.imageUrl}
                    alt={activation.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-2 text-white">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">
                      {Math.floor(activation.durationSeconds / 60)} min
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-2">{activation.title}</h3>
                  {activation.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                      {activation.description}
                    </p>
                  )}
                  <Button
                    size="sm"
                    className="w-full mt-4"
                    variant="secondary"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Odtwórz
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Brak aktywacji w tej kategorii.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Wróć później lub wybierz inną kategorię.
          </p>
        </div>
      )}
    </div>
  );
}

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    const categories = await api.activation.getExploreCategories();
    return categories.map((category) => ({
      categorySlug: category.slug,
    }));
  } catch {
    return [];
  }
}

// Metadata generation
export async function generateMetadata({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  try {
    const data = await api.activation.getActivationsByCategory({
      categorySlug,
    });
    
    return {
      title: `${data.category.name} - Ulepszenia`,
      description: data.category.description || `Odkryj aktywacje w kategorii ${data.category.name}`,
    };
  } catch {
    return {
      title: "Kategoria - Ulepszenia",
    };
  }
}