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
import { Plus, Pencil, Trash2, Search, Eye, Star, StarOff } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "draft" | "published" | "scheduled">("all");
  const [type, setType] = useState<"all" | "blog" | "news">("all");

  const { data, isLoading, refetch } = api.articles.getAllForAdmin.useQuery({
    page,
    search,
    status,
    type,
  });

  const deleteMutation = api.articles.delete.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const toggleFeaturedMutation = api.articles.toggleFeatured.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Czy na pewno chcesz usunąć artykuł "${title}"?`)) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge variant="success">Opublikowany</Badge>;
      case "draft":
        return <Badge variant="secondary">Szkic</Badge>;
      case "scheduled":
        return <Badge variant="default">Zaplanowany</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "blog":
        return <Badge variant="outline">Blog</Badge>;
      case "news":
        return <Badge variant="outline">Aktualności</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Artykuły i Aktualności</h1>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj nowy artykuł
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Wszystkie artykuły</CardTitle>
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

              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie typy</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="news">Aktualności</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Szukaj artykułów..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Ładowanie...</p>
          ) : data?.articles.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Nie znaleziono artykułów</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tytuł</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data publikacji</TableHead>
                    <TableHead>Wyświetlenia</TableHead>
                    <TableHead>Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {article.featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {article.title}
                        </div>
                      </TableCell>
                      <TableCell>{article.author.name}</TableCell>
                      <TableCell>{getTypeBadge(article.type)}</TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("pl-PL")
                          : "-"}
                      </TableCell>
                      <TableCell>{article.stats?.views || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFeaturedMutation.mutate({ id: article.id })}
                            disabled={toggleFeaturedMutation.isPending}
                          >
                            {article.featured ? (
                              <StarOff className="h-4 w-4" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <Link href={`/admin/articles/${article.id}/edit`}>
                            <Button size="sm" variant="outline">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          {article.status === "published" && (
                            <Link href={`/articles/${article.slug}`} target="_blank">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(article.id, article.title)}
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
    </div>
  );
}