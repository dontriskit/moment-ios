"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, Trophy, Users, Star } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function AchievementsPage() {
  const [page, setPage] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null);

  const limit = 20;
  const { data, refetch } = api.achievements.getAllForAdmin.useQuery({
    limit,
    offset: page * limit,
  });

  const deleteMutation = api.achievements.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteDialogOpen(false);
      setAchievementToDelete(null);
    },
  });

  const handleDelete = async () => {
    if (!achievementToDelete) return;
    await deleteMutation.mutateAsync({ id: achievementToDelete });
  };

  const totalPages = Math.ceil((data?.total || 0) / limit);

  const getTypeLabel = (type: string, milestone: number | null) => {
    switch (type) {
      case 'activation_count':
        return `${milestone || 0} aktywacji`;
      case 'streak_days':
        return `${milestone || 0} dni z rzędu`;
      case 'total_minutes':
        return `${milestone || 0} minut`;
      case 'category_complete':
        return `Ukończ kategorię`;
      case 'first_activation':
        return `Pierwsza aktywacja`;
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Osiągnięcia</h1>
          <p className="text-gray-600 mt-1">Zarządzaj osiągnięciami i nagrodami</p>
        </div>
        <Link href="/admin/achievements/new">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nowe osiągnięcie
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {data?.achievements.map((achievement) => (
          <Card key={achievement.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/achievements/${achievement.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAchievementToDelete(achievement.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <Badge variant="secondary">
                  {getTypeLabel(achievement.type, achievement.milestone)}
                </Badge>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{achievement.unlockedCount} odblokowań</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.achievements.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nie znaleziono żadnych osiągnięć</p>
            <Link href="/admin/achievements/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Stwórz pierwsze osiągnięcie
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
            <DialogTitle>Usuń osiągnięcie</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunąć to osiągnięcie? Ta akcja jest nieodwracalna.
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