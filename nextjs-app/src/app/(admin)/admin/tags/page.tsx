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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function TagsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6B7280");

  const { data, isLoading, refetch } = api.tags.getAllForAdmin.useQuery({
    page,
    search,
  });

  const createMutation = api.tags.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.tags.update.useMutation({
    onSuccess: () => {
      void refetch();
      setIsEditOpen(false);
      setEditingTag(null);
      resetForm();
    },
  });

  const deleteMutation = api.tags.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setColor("#6B7280");
  };

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      description,
      color,
    });
  };

  const handleUpdate = async () => {
    if (!editingTag) return;
    
    await updateMutation.mutateAsync({
      id: editingTag.id,
      name,
      slug,
      description,
      color,
    });
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug);
    setDescription(tag.description || "");
    setColor(tag.color);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć tag "${name}"?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const generateSlug = () => {
    setSlug(name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tagi</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj nowy tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowy tag</DialogTitle>
              <DialogDescription>
                Utwórz nowy tag do organizacji artykułów
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nazwa</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Np. Technologia"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="technologia"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Generuj
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opis tagu..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="color">Kolor</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="#6B7280"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Tworzenie..." : "Utwórz"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Wszystkie tagi</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj tagów..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Ładowanie...</p>
          ) : data?.tags.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nie znaleziono tagów</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Opis</TableHead>
                    <TableHead>Artykuły</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell className="font-medium">
                        <Badge
                          variant="secondary"
                          style={{ backgroundColor: tag.color + "20", color: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600">{tag.slug}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {tag.description || "-"}
                      </TableCell>
                      <TableCell>{tag.articleCount}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(tag)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(tag.id, tag.name)}
                            disabled={deleteMutation.isPending || tag.articleCount > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Poprzednia
                  </Button>
                  <span className="flex items-center px-4">
                    Strona {page} z {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj tag</DialogTitle>
            <DialogDescription>
              Zmień właściwości tagu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nazwa</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Np. Technologia"
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="technologia"
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  Generuj
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Opis</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opis tagu..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-color">Kolor</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="edit-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#6B7280"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}