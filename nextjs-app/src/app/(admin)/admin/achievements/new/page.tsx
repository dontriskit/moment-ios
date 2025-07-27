"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";

export default function NewAchievementPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [badgeImageUrl, setBadgeImageUrl] = useState("");
  const [type, setType] = useState("activation_count");
  const [milestone, setMilestone] = useState(1);

  const createMutation = api.achievements.create.useMutation({
    onSuccess: () => {
      router.push("/admin/achievements");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createMutation.mutateAsync({
      name,
      description,
      badgeImageUrl: badgeImageUrl || undefined,
      milestone,
      type,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/achievements">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Nowe osiągnięcie</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informacje o osiągnięciu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nazwa osiągnięcia</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="np. Pierwsze kroki"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Opisz, za co przyznawane jest to osiągnięcie..."
                    rows={4}
                  />
                </div>

                <FileUpload
                  id="badgeImageUrl"
                  label="Obrazek odznaki (opcjonalne)"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  type="image"
                  value={badgeImageUrl}
                  onChange={setBadgeImageUrl}
                  maxSizeMB={2}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Typ osiągnięcia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Typ</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activation_count">Liczba aktywacji</SelectItem>
                      <SelectItem value="streak_days">Dni z rzędu</SelectItem>
                      <SelectItem value="total_minutes">Łączny czas</SelectItem>
                      <SelectItem value="category_complete">Ukończenie kategorii</SelectItem>
                      <SelectItem value="first_activation">Pierwsza aktywacja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="milestone">Kamień milowy</Label>
                  <Input
                    id="milestone"
                    type="number"
                    value={milestone}
                    onChange={(e) => setMilestone(parseInt(e.target.value) || 0)}
                    required
                    min="1"
                    placeholder={
                      type === 'activation_count' ? "Liczba aktywacji" :
                      type === 'streak_days' ? "Liczba dni" :
                      type === 'total_minutes' ? "Liczba minut" :
                      "Wartość"
                    }
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    {type === 'first_activation' && "Dla pierwszej aktywacji ustaw 1"}
                    {type === 'category_complete' && "Liczba ulepszeń w kategorii do ukończenia"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Tworzenie..." : "Stwórz osiągnięcie"}
              </Button>
              <Link href="/admin/achievements" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Anuluj
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}