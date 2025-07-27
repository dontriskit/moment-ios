"use client";

import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { UlepszenieCard } from "@/components/app/UlepszenieCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Shuffle } from "lucide-react";
import Link from "next/link";

export default function PlaylistDetailPageClient({ id }: { id: string }) {
  const router = useRouter();
  const { data: playlist, isLoading } = api.playlist.getPlaylistById.useQuery({ 
    id 
  });

  const removeFromPlaylist = api.playlist.removeFromPlaylist.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-muted-foreground">Ładowanie...</p>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-muted-foreground">Playlista nie znaleziona</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="mb-6">
        <Link href="/playlists">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Powrót
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{playlist.name}</h1>
            <p className="text-muted-foreground mt-1">
              {playlist.items.length} {playlist.items.length === 1 ? 'ulepszenie' : 'ulepszeń'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Shuffle className="h-4 w-4 mr-2" />
              Losowo
            </Button>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Odtwórz wszystkie
            </Button>
          </div>
        </div>
      </div>

      {playlist.items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Ta playlista jest pusta</p>
          <Link href="/explore">
            <Button>Odkrywaj ulepszenia</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {playlist.items.map((item) => (
            <div key={item.activationId} className="relative group">
              <UlepszenieCard ulepszenie={item.activation} />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  removeFromPlaylist.mutate({
                    playlistId: playlist.id,
                    activationId: item.activationId,
                  });
                }}
              >
                Usuń
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}