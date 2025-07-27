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
import { Plus, Pencil, Trash2, Search, User } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";

export default function AuthorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState("");

  const { data, isLoading, refetch } = api.authors.getAllForAdmin.useQuery({
    page,
    search,
  });

  const { data: availableUsers } = api.authors.getAvailableUsers.useQuery();

  const createMutation = api.authors.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.authors.update.useMutation({
    onSuccess: () => {
      void refetch();
      setIsEditOpen(false);
      setEditingAuthor(null);
      resetForm();
    },
  });

  const deleteMutation = api.authors.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const resetForm = () => {
    setName("");
    setSlug("");
    setBio("");
    setAvatarUrl("");
    setUserId("");
  };

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      bio,
      avatarUrl,
      userId: userId === "none" ? undefined : userId || undefined,
    });
  };

  const handleUpdate = async () => {
    if (!editingAuthor) return;
    
    await updateMutation.mutateAsync({
      id: editingAuthor.id,
      name,
      slug,
      bio,
      avatarUrl,
      userId: userId === "none" ? undefined : userId || undefined,
    });
  };

  const handleEdit = (author: any) => {
    setEditingAuthor(author);
    setName(author.name);
    setSlug(author.slug);
    setBio(author.bio || "");
    setAvatarUrl(author.avatarUrl || "");
    setUserId(author.userId || "none");
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć autora "${name}"?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const generateSlug = () => {
    setSlug(name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Autorzy</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj nowego autora
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nowy autor</DialogTitle>
              <DialogDescription>
                Utwórz nowego autora artykułów
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jan Kowalski"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="jan-kowalski"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Generuj
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Krótka biografia autora..."
                  rows={4}
                />
              </div>
              <FileUpload
                id="avatarUrl"
                label="Zdjęcie autora"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                type="image"
                value={avatarUrl}
                onChange={setAvatarUrl}
                maxSizeMB={2}
              />
              <div>
                <Label htmlFor="userId">Powiązany użytkownik</Label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz użytkownika (opcjonalne)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Brak</SelectItem>
                    {availableUsers?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name || user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            <CardTitle>Wszyscy autorzy</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj autorów..."
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
          ) : data?.authors.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nie znaleziono autorów</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Autor</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Powiązany użytkownik</TableHead>
                    <TableHead>Statystyki</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.authors.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={author.avatarUrl || undefined} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{author.name}</div>
                            {author.bio && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {author.bio}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{author.slug}</TableCell>
                      <TableCell>
                        {author.user ? (
                          <Badge variant="secondary">{author.user.email}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Artykuły: {author.stats.articleCount}</div>
                          <div className="text-gray-500">
                            Opublikowane: {author.stats.publishedCount}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(author)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(author.id, author.name)}
                            disabled={deleteMutation.isPending || author.stats.articleCount > 0}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edytuj autora</DialogTitle>
            <DialogDescription>
              Zmień dane autora
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Imię i nazwisko</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jan Kowalski"
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="jan-kowalski"
                />
                <Button type="button" variant="outline" onClick={generateSlug}>
                  Generuj
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-bio">Biografia</Label>
              <Textarea
                id="edit-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Krótka biografia autora..."
                rows={4}
              />
            </div>
            <FileUpload
              id="edit-avatarUrl"
              label="Zdjęcie autora"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              type="image"
              value={avatarUrl}
              onChange={setAvatarUrl}
              maxSizeMB={2}
            />
            <div>
              <Label htmlFor="edit-userId">Powiązany użytkownik</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz użytkownika (opcjonalne)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Brak</SelectItem>
                  {availableUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name || user.email}
                    </SelectItem>
                  ))}
                  {editingAuthor?.user && (
                    <SelectItem value={editingAuthor.userId}>
                      {editingAuthor.user.name || editingAuthor.user.email} (obecny)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
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