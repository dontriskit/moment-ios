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
import { Plus, Pencil, Trash2, Search, Settings, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";

const collectionTypes = [
  { value: "odkrywaj", label: "Odkrywaj", color: "blue" },
  { value: "wyzwania", label: "Wyzwania", color: "purple" },
  { value: "featured", label: "Wyróżnione", color: "yellow" },
  { value: "new", label: "Nowości", color: "green" },
  { value: "popular", label: "Popularne", color: "red" },
];

export default function CollectionsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collectionType, setCollectionType] = useState("odkrywaj");
  const [isActive, setIsActive] = useState(true);
  const [position, setPosition] = useState(0);

  const { data, isLoading, refetch } = api.collections.getAllForAdmin.useQuery({
    page,
    type: type === "all" ? undefined : type || undefined,
  });

  const createMutation = api.collections.create.useMutation({
    onSuccess: () => {
      void refetch();
      setIsCreateOpen(false);
      resetForm();
    },
  });

  const updateMutation = api.collections.update.useMutation({
    onSuccess: () => {
      void refetch();
      setIsEditOpen(false);
      setEditingCollection(null);
      resetForm();
    },
  });

  const deleteMutation = api.collections.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const resetForm = () => {
    setName("");
    setDescription("");
    setCollectionType("odkrywaj");
    setIsActive(true);
    setPosition(0);
  };

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      name,
      description,
      type: collectionType,
      isActive,
      position,
    });
  };

  const handleUpdate = async () => {
    if (!editingCollection) return;
    
    await updateMutation.mutateAsync({
      id: editingCollection.id,
      name,
      description,
      type: collectionType,
      isActive,
      position,
    });
  };

  const handleEdit = (collection: any) => {
    setEditingCollection(collection);
    setName(collection.name);
    setDescription(collection.description || "");
    setCollectionType(collection.type);
    setIsActive(collection.isActive);
    setPosition(collection.position);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć kolekcję "${name}"?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = collectionTypes.find(t => t.value === type);
    if (!typeConfig) return <Badge>{type}</Badge>;
    
    return (
      <Badge variant="outline">
        {typeConfig.label}
      </Badge>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kolekcje Ulepszeń</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Dodaj nową kolekcję
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowa kolekcja</DialogTitle>
              <DialogDescription>
                Utwórz nową kolekcję ulepszeń
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nazwa</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Np. Relaks wieczorny"
                />
              </div>
              <div>
                <Label htmlFor="description">Opis</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Opis kolekcji..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="type">Typ</Label>
                <Select value={collectionType} onValueChange={setCollectionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {collectionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="position">Pozycja</Label>
                <Input
                  id="position"
                  type="number"
                  value={position}
                  onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Aktywna</Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
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
            <CardTitle>Wszystkie kolekcje</CardTitle>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Wszystkie typy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie typy</SelectItem>
                {collectionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Ładowanie...</p>
          ) : data?.collections.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nie znaleziono kolekcji</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Pozycja</TableHead>
                    <TableHead>Ilość ulepszeń</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.collections.map((collection) => (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{collection.name}</div>
                          {collection.description && (
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {collection.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(collection.type)}</TableCell>
                      <TableCell>{collection.position}</TableCell>
                      <TableCell>{collection.items.length}</TableCell>
                      <TableCell>
                        {collection.isActive ? (
                          <Badge variant="success">
                            <Eye className="h-3 w-3 mr-1" />
                            Aktywna
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Nieaktywna
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/collections/${collection.id}`}>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(collection)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(collection.id, collection.name)}
                            disabled={deleteMutation.isPending}
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
            <DialogTitle>Edytuj kolekcję</DialogTitle>
            <DialogDescription>
              Zmień właściwości kolekcji
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nazwa</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Np. Relaks wieczorny"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Opis</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opis kolekcji..."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-type">Typ</Label>
              <Select value={collectionType} onValueChange={setCollectionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {collectionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-position">Pozycja</Label>
              <Input
                id="edit-position"
                type="number"
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="edit-isActive">Aktywna</Label>
              <Switch
                id="edit-isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
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