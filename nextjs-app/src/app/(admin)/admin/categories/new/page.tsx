"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = api.category.create.useMutation({
    onSuccess: () => {
      router.push("/admin/categories");
    },
    onError: (error) => {
      alert(`B\u0142\u0105d podczas tworzenia kategorii: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string || name.toLowerCase().replace(/\s+/g, "-");

    await createMutation.mutateAsync({
      name,
      slug,
      description: formData.get("description") as string || undefined,
      color: formData.get("color") as string,
      icon: formData.get("icon") as string || undefined,
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slugInput = document.getElementById("slug") as HTMLInputElement;
    if (slugInput && !slugInput.value) {
      slugInput.value = name.toLowerCase().replace(/\s+/g, "-");
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nowa kategoria</h1>
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
                  onChange={handleNameChange}
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
                    defaultValue="#3B82F6"
                    className="w-20 h-10"
                    required
                  />
                  <Input
                    type="text"
                    value={(document.getElementById("color") as HTMLInputElement)?.value ?? "#3B82F6"}
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
                {isSubmitting ? "Tworzenie..." : "Utwórz kategorię"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}