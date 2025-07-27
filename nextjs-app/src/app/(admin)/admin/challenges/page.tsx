"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Target, Calendar, Trophy } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ChallengesPage() {
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);

  const limit = 20;
  const { data, refetch } = api.challenges.getAllForAdmin.useQuery({
    limit,
    offset: page * limit,
  });

  const deleteMutation = api.challenges.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setChallengeToDelete(null);
    },
  });

  const handleDelete = async () => {
    if (!challengeToDelete) return;
    await deleteMutation.mutateAsync({ id: challengeToDelete });
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Wyzwania</h1>
          <p className="text-gray-600 mt-1">Zarządzaj wyzwaniami dla użytkowników</p>
        </div>
        <Link href="/admin/challenges/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nowe wyzwanie
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {data?.challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{challenge.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/challenges/${challenge.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setChallengeToDelete(challenge.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span>{challenge.durationDays} dni</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Czas trwania: {challenge.durationDays} dni</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.challenges.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nie znaleziono żadnych wyzwań</p>
            <Link href="/admin/challenges/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Stwórz pierwsze wyzwanie
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Poprzednia
          </Button>
          <span className="py-2 px-4">
            Strona {page + 1} z {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
          >
            Następna
          </Button>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usuń wyzwanie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć to wyzwanie? Ta akcja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}