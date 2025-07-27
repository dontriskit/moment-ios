"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: category, isLoading } = api.category.getById.useQuery({
    id: categoryId,
  });

  const updateMutation = api.category.update.useMutation({
    onSuccess: () => {
      router.push("/admin/categories");
    },
    onError: (error) => {
      alert(`Error updating category: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    await updateMutation.mutateAsync({
      id: categoryId,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string || undefined,
      color: formData.get("color") as string,
      icon: formData.get("icon") as string || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Ładowanie kategorii...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Nie znaleziono kategorii</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edytuj kategorię</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Szczegóły kategorii</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="np. Poranne rytuały"
                  defaultValue={category.name}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="np. poranne-rytualy"
                  pattern="[a-z0-9-]+"
                  title="Tylko małe litery, cyfry i myślniki"
                  defaultValue={category.slug}
                  required
                />
                <p className="text-sm text-gray-500">Identyfikator przyjazny dla URL</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Kolor *</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    defaultValue={category.color}
                    className="w-20 h-10"
                    required
                  />
                  <Input
                    type="text"
                    value={category.color}
                    readOnly
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Ikona</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="np. sunrise (nazwa ikony Lucide)"
                  defaultValue={category.icon ?? ""}
                />
                <p className="text-sm text-gray-500">Nazwa ikony Lucide (opcjonalne)</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Krótki opis tej kategorii"
                defaultValue={category.description ?? ""}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/categories">
                <Button type="button" variant="outline">
                  Anuluj
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}