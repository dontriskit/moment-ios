"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { MultiSelect } from "@/components/ui/multi-select";
import { FileUpload } from "@/components/ui/file-upload";

interface EditChallengePageProps {
  params: Promise<{ id: string }>;
}

export default function EditChallengePage({ params }: EditChallengePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [selectedActivationIds, setSelectedActivationIds] = useState<string[]>([]);

  const { data: challenge, isLoading: isLoadingChallenge } = api.challenges.getById.useQuery(
    { id: resolvedParams.id }
  );
  const { data: activations } = api.activation.getAllForAdmin.useQuery({ limit: 100 });

  const updateMutation = api.challenges.update.useMutation({
    onSuccess: () => {
      router.push("/admin/challenges");
    },
  });

  // Load challenge data
  useEffect(() => {
    if (challenge) {
      setName(challenge.name);
      setDescription(challenge.description || "");
      setImageUrl(challenge.imageUrl || "");
      setDurationDays(challenge.durationDays);
      setSelectedActivationIds(challenge.activations?.map((a: any) => a.id) || []);
    }
  }, [challenge]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateMutation.mutateAsync({
      id: resolvedParams.id,
      name,
      description,
      imageUrl: imageUrl || undefined,
      durationDays,
      activationIds: selectedActivationIds,
    });
  };

  if (isLoadingChallenge) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/challenges">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edytuj wyzwanie</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informacje o wyzwaniu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nazwa wyzwania</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="np. 7 dni spokoju"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    placeholder="Opisz wyzwanie i jego cel..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="durationDays">Czas trwania (dni)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
                    required
                    min="1"
                  />
                </div>

                <FileUpload
                  id="imageUrl"
                  label="Obraz wyzwania (opcjonalne)"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  type="image"
                  value={imageUrl}
                  onChange={setImageUrl}
                  maxSizeMB={5}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wybrane ulepszenia</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiSelect
                  options={
                    activations?.activations.map((activation) => ({
                      value: activation.id,
                      label: activation.title,
                    })) || []
                  }
                  selected={selectedActivationIds}
                  onChange={setSelectedActivationIds}
                  placeholder="Wybierz ulepszenia dla wyzwania"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Określ, które ulepszenia są częścią tego wyzwania
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
              <Link href="/admin/challenges" className="flex-1">
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