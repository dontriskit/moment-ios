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
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = api.category.getAllForAdmin.useQuery({
    page,
  });

  const deleteMutation = api.category.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const handleDelete = async (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć tę kategorię? Ta akcja nie może być cofnięta.")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kategorie</h1>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj nową kategorię
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wszystkie kategorie</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Ładowanie...</p>
          ) : data?.categories.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nie znaleziono kategorii</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nazwa</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Kolor</TableHead>
                    <TableHead>Ulepszenia</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        {category.name}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {category.slug}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm">{category.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {category.activationCount}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(category.id)}
                            disabled={deleteMutation.isPending || category.activationCount > 0}
                            title={category.activationCount > 0 ? "Nie mo\u017cna usun\u0105\u0107 kategorii z ulepszeniami" : ""}
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
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page} of {data.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page === data.totalPages}
                  >
                    Next
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