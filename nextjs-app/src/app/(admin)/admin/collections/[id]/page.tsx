"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}


export default function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);

  const { data: collection, refetch } = api.collections.getById.useQuery({
    id: resolvedParams.id,
  });

  const { data: availableActivations } = api.collections.getAvailableActivations.useQuery({
    collectionId: resolvedParams.id,
    search: searchQuery,
  });

  const addItemMutation = api.collections.addItem.useMutation({
    onSuccess: () => {
      void refetch();
      setIsAddDialogOpen(false);
    },
  });

  const removeItemMutation = api.collections.removeItem.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const reorderItemsMutation = api.collections.reorderItems.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  useEffect(() => {
    if (collection?.items) {
      setItems(collection.items);
    }
  }, [collection]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= items.length) return;
    
    // Swap items
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    setItems(newItems);
    
    // Update positions
    const itemsWithPositions = newItems.map((item, idx) => ({
      activationId: item.activationId,
      position: idx,
    }));

    // Save new order
    reorderItemsMutation.mutate({
      collectionId: resolvedParams.id,
      items: itemsWithPositions,
    });
  };

  const handleAddItem = async (activationId: string) => {
    await addItemMutation.mutateAsync({
      collectionId: resolvedParams.id,
      activationId,
    });
  };

  const handleRemoveItem = async (activationId: string) => {
    await removeItemMutation.mutateAsync({
      collectionId: resolvedParams.id,
      activationId,
    });
  };

  if (!collection) {
    return <div>Ładowanie...</div>;
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/collections">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
          {collection.description && (
            <p className="text-gray-600 mt-1">{collection.description}</p>
          )}
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Dodaj ulepszenie
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ulepszenia w kolekcji ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              Brak ulepszeń w tej kolekcji. Kliknij przycisk "Dodaj ulepszenie" aby rozpocząć.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.activationId}
                  className="flex items-center gap-3 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0 || reorderItemsMutation.isPending}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1 || reorderItemsMutation.isPending}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.activation.title}</h4>
                    <p className="text-sm text-gray-600">
                      {item.activation.category?.name || "Bez kategorii"} • {Math.floor(item.activation.durationSeconds / 60)} min
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveItem(item.activationId)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Dodaj ulepszenie do kolekcji</DialogTitle>
            <DialogDescription>
              Wybierz ulepszenie, które chcesz dodać do kolekcji
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Szukaj ulepszeń..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableActivations?.map((activation) => (
                <div
                  key={activation.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-medium">{activation.title}</h4>
                    <p className="text-sm text-gray-600">
                      {activation.category?.name || "Bez kategorii"} • {Math.floor(activation.durationSeconds / 60)} min
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAddItem(activation.id)}
                    disabled={addItemMutation.isPending}
                  >
                    Dodaj
                  </Button>
                </div>
              ))}
              {availableActivations?.length === 0 && (
                <p className="text-center py-4 text-gray-500">
                  Nie znaleziono dostępnych ulepszeń
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Zamknij
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}