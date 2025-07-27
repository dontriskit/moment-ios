"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, Search, Star, StarOff, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ActivationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published" | "scheduled">("all");
  const [showFeatured, setShowFeatured] = useState<boolean | undefined>(undefined);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

  const { data, isLoading, refetch } = api.activation.getAllForAdmin.useQuery({
    page,
    search,
    status,
    featured: showFeatured,
  });

  const deleteMutation = api.activation.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const toggleFeaturedMutation = api.activation.toggleFeatured.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const bulkUpdateStatusMutation = api.activation.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      void refetch();
      setSelectedIds([]);
    },
  });

  const bulkUpdateCategoryMutation = api.activation.bulkUpdateCategory.useMutation({
    onSuccess: () => {
      void refetch();
      setSelectedIds([]);
    },
  });

  const bulkDeleteMutation = api.activation.bulkDelete.useMutation({
    onSuccess: () => {
      void refetch();
      setSelectedIds([]);
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć to ulepszenie?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleBulkAction = async () => {
    if (selectedIds.length === 0) return;

    switch (bulkAction) {
      case "publish":
        await bulkUpdateStatusMutation.mutateAsync({ ids: selectedIds, status: "published" });
        break;
      case "draft":
        await bulkUpdateStatusMutation.mutateAsync({ ids: selectedIds, status: "draft" });
        break;
      case "delete":
        if (confirm(`Czy na pewno chcesz usunąć ${selectedIds.length} ulepszeń?`)) {
          await bulkDeleteMutation.mutateAsync({ ids: selectedIds });
        }
        break;
    }
    setBulkAction("");
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data?.activations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.activations.map(a => a.id) || []);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Opublikowane</Badge>;
      case "draft":
        return <Badge variant="secondary">Szkic</Badge>;
      case "scheduled":
        return <Badge variant="default">Zaplanowane</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ulepszenia</h1>
        <Link href="/admin/activations/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj nowe ulepszenie
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Wszystkie ulepszenia</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie statusy</SelectItem>
                  <SelectItem value="published">Opublikowane</SelectItem>
                  <SelectItem value="draft">Szkice</SelectItem>
                  <SelectItem value="scheduled">Zaplanowane</SelectItem>
                </SelectContent>
              </Select>

              <Select value={showFeatured?.toString() || "all"} onValueChange={(value) => setShowFeatured(value === "all" ? undefined : value === "true")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="true">Wyróżnione</SelectItem>
                  <SelectItem value="false">Niewyróżnione</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj ulepszeń..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mt-4 p-4 bg-gray-50 rounded-md">
              <span className="text-sm text-gray-600">
                Zaznaczono {selectedIds.length} {selectedIds.length === 1 ? "ulepszenie" : "ulepszeń"}
              </span>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Wybierz akcję" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publish">Opublikuj</SelectItem>
                  <SelectItem value="draft">Zmień na szkic</SelectItem>
                  <SelectItem value="delete">Usuń</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleBulkAction}
                disabled={!bulkAction || bulkUpdateStatusMutation.isPending || bulkDeleteMutation.isPending}
              >
                Wykonaj
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedIds([])}
              >
                Anuluj
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Ładowanie...</p>
          ) : data?.activations.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nie znaleziono ulepszeń</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.length === data?.activations.length && data?.activations.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Tytuł</TableHead>
                    <TableHead>Kategoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Czas trwania</TableHead>
                    <TableHead>Data publikacji</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.activations.map((activation) => (
                    <TableRow key={activation.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(activation.id)}
                          onCheckedChange={() => toggleSelect(activation.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {activation.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {activation.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        {activation.category?.name ?? "Bez kategorii"}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(activation.status)}
                      </TableCell>
                      <TableCell>
                        {Math.floor(activation.durationSeconds / 60)} min
                      </TableCell>
                      <TableCell>
                        {activation.publishedAt
                          ? new Date(activation.publishedAt).toLocaleDateString("pl-PL")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/activations/${activation.id}/edit`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edytuj
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleFeaturedMutation.mutate({ id: activation.id })}
                            >
                              {activation.featured ? (
                                <><StarOff className="h-4 w-4 mr-2" />Usuń wyróżnienie</>
                              ) : (
                                <><Star className="h-4 w-4 mr-2" />Wyróżnij</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(activation.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Usuń
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Poprzednia
                  </Button>
                  <span className="flex items-center px-4">
                    Strona {page} z {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === data.totalPages}
                  >
                    Następna
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}