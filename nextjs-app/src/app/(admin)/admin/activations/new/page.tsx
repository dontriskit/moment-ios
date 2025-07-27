"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NewActivationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: categories } = api.activation.getExploreCategories.useQuery();

  const createMutation = api.activation.create.useMutation({
    onSuccess: () => {
      router.push("/admin/activations");
    },
    onError: (error) => {
      alert(`Error creating activation: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    if (!audioUrl || !imageUrl) {
      alert("Please provide both audio and image files");
      setIsSubmitting(false);
      return;
    }

    await createMutation.mutateAsync({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      durationSeconds: parseInt(formData.get("duration") as string),
      audioUrl,
      imageUrl,
      categoryId: formData.get("categoryId") as string || undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/activations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nowe ulepszenie</h1>
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Kategoria</Label>
                <Select name="categoryId">
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
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
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                id="audioFile"
                label="Plik audio *"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm"
                type="audio"
                value={audioUrl}
                onChange={setAudioUrl}
                maxSizeMB={50}
              />

              <FileUpload
                id="imageFile"
                label="Obraz okładki *"
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
                {isSubmitting ? "Tworzenie..." : "Utwórz ulepszenie"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}