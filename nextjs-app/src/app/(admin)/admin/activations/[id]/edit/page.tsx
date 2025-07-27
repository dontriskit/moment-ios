"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { FileUpload } from "@/components/ui/file-upload";

export default function EditActivationPage() {
  const router = useRouter();
  const params = useParams();
  const activationId = params.id as string;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: activation, isLoading } = api.activation.getActivationById.useQuery({
    id: activationId,
  });

  const { data: categories } = api.activation.getExploreCategories.useQuery();

  useEffect(() => {
    if (activation) {
      setAudioUrl(activation.audioUrl || "");
      setImageUrl(activation.imageUrl || "");
    }
  }, [activation]);

  const updateMutation = api.activation.update.useMutation({
    onSuccess: () => {
      router.push("/admin/activations");
    },
    onError: (error) => {
      alert(`Error updating activation: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    await updateMutation.mutateAsync({
      id: activationId,
      title: formData.get("title") as string,
      description: formData.get("description") as string ?? undefined,
      durationSeconds: parseInt(formData.get("duration") as string),
      audioUrl: audioUrl || undefined,
      imageUrl: imageUrl || undefined,
      categoryId: formData.get("categoryId") === "none" ? null : formData.get("categoryId") as string ?? null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Ładowanie ulepszenia...</p>
      </div>
    );
  }

  if (!activation) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Nie znaleziono ulepszenia</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/activations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edytuj ulepszenie</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Szczegóły ulepszenia</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Wprowadź tytuł ulepszenia"
                  defaultValue={activation.title}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Kategoria</Label>
                <Select name="categoryId" defaultValue={activation.categoryId || "none"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Brak kategorii</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Czas trwania (sekundy) *</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  placeholder="np. 300 dla 5 minut"
                  defaultValue={activation.durationSeconds}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Wprowadź opis ulepszenia"
                defaultValue={activation.description || ""}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                id="audioFile"
                label="Plik audio"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
                type="audio"
                value={audioUrl}
                onChange={setAudioUrl}
                maxSizeMB={50}
              />

              <FileUpload
                id="imageFile"
                label="Obraz okładki"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                type="image"
                value={imageUrl}
                onChange={setImageUrl}
                maxSizeMB={5}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/activations">
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