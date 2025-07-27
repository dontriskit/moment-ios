"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ArrowLeft, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import Link from "next/link";
import { MultiSelect } from "@/components/ui/multi-select";
import { FileUpload } from "@/components/ui/file-upload";

interface EditArticlePageProps {
  params: Promise<{ id: string }>;
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"blog" | "news">("blog");
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [publishedAt, setPublishedAt] = useState<Date | undefined>();
  const [featured, setFeatured] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const { data: authors } = api.authors.getAllForAdmin.useQuery({ limit: 100 });
  const { data: categories } = api.category.getAll.useQuery();
  const { data: tags } = api.tags.getAllForAdmin.useQuery({ limit: 100 });

  const { data: article, isLoading: isLoadingArticle } = api.articles.getById.useQuery(
    { id: resolvedParams.id }
  );

  const updateMutation = api.articles.update.useMutation({
    onSuccess: () => {
      router.push("/admin/articles");
    },
  });

  // Load article data
  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setSlug(article.slug);
      setContent(article.content);
      setExcerpt(article.excerpt || "");
      setCoverImageUrl(article.coverImageUrl || "");
      setAuthorId(article.authorId);
      setCategoryId(article.categoryId || "none");
      setType(article.type as "blog" | "news");
      setStatus(article.status as "draft" | "published" | "scheduled");
      setPublishedAt(article.publishedAt ? new Date(article.publishedAt) : undefined);
      setFeatured(article.featured);
      setSelectedTagIds(article.tags.map(t => t.tag.id));
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await updateMutation.mutateAsync({
      id: resolvedParams.id,
      title,
      slug,
      content,
      excerpt,
      coverImageUrl,
      authorId,
      categoryId: categoryId === "none" ? undefined : categoryId || undefined,
      type,
      status,
      publishedAt: publishedAt || undefined,
      featured,
      tagIds: selectedTagIds,
    });
  };

  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
  };

  if (isLoadingArticle) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/articles">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edytuj artykuł</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Treść artykułu</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Tytuł</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Wprowadź tytuł artykułu"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (adres URL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="automatycznie-generowany-slug"
                    />
                    <Button type="button" variant="outline" onClick={generateSlug}>
                      Generuj
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="excerpt">Zajawka</Label>
                  <Textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Krótki opis artykułu"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Treść</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    placeholder="Treść artykułu..."
                    rows={15}
                    className="font-mono"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Możesz używać Markdown do formatowania tekstu
                  </p>
                </div>

                <FileUpload
                  id="coverImageUrl"
                  label="Obraz wyróżniający"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  type="image"
                  value={coverImageUrl}
                  onChange={setCoverImageUrl}
                  maxSizeMB={5}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publikacja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Szkic</SelectItem>
                      <SelectItem value="published">Opublikowany</SelectItem>
                      <SelectItem value="scheduled">Zaplanowany</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(status === "scheduled" || status === "published") && (
                  <div>
                    <Label>Data publikacji</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {publishedAt ? (
                            format(publishedAt, "PPP", { locale: pl })
                          ) : (
                            <span>Wybierz datę</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={publishedAt}
                          onSelect={setPublishedAt}
                          locale={pl}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Wyróżniony artykuł</Label>
                  <Switch
                    id="featured"
                    checked={featured}
                    onCheckedChange={setFeatured}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organizacja</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="type">Typ</Label>
                  <Select value={type} onValueChange={(value: any) => setType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="news">Aktualności</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="author">Autor</Label>
                  <Select value={authorId} onValueChange={setAuthorId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz autora" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors?.authors.map((author) => (
                        <SelectItem key={author.id} value={author.id}>
                          {author.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Kategoria</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz kategorię" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Brak kategorii</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tagi</Label>
                  <MultiSelect
                    options={
                      tags?.tags.map((tag) => ({
                        value: tag.id,
                        label: tag.name,
                      })) || []
                    }
                    selected={selectedTagIds}
                    onChange={setSelectedTagIds}
                    placeholder="Wybierz tagi"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
              </Button>
              <Link href="/admin/articles" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Anuluj
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}