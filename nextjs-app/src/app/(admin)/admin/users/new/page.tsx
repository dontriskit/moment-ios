"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateAdminUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createMutation = api.admin.createAdminUser.useMutation({
    onSuccess: () => {
      router.push("/admin/users");
    },
    onError: (error) => {
      alert(`Błąd podczas tworzenia administratora: ${error.message}`);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    await createMutation.mutateAsync({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Utwórz administratora</h1>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Dane administratora</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Pełna nazwa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 6 znaków"
                minLength={6}
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Uwaga:</strong> To utworzy nowego administratora z pełnym dostępem do panelu administracyjnego. 
                Będzie mógł zalogować się za pomocą adresu email i hasła.
              </p>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/users">
                <Button type="button" variant="outline">
                  Anuluj
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Tworzenie..." : "Utwórz administratora"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}