"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Music, Trash2, Play } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PlaylistsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  
  const { data: playlists, isLoading, refetch } = api.playlist.getUserPlaylists.useQuery();
  
  const createPlaylist = api.playlist.createPlaylist.useMutation({
    onSuccess: () => {
      setIsCreating(false);
      setNewPlaylistName("");
      void refetch();
    },
  });
  
  const deletePlaylist = api.playlist.deletePlaylist.useMutation({
    onSuccess: () => {
      void refetch();
    },
  });

  const handleCreate = () => {
    if (newPlaylistName.trim()) {
      createPlaylist.mutate({ name: newPlaylistName.trim() });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Czy na pewno chcesz usunąć playlistę "${name}"?`)) {
      deletePlaylist.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 pb-20">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Playlisty</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Create New Playlist Card */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Card className="border-2 border-dashed border-muted-foreground/40 hover:border-primary transition-all cursor-pointer bg-card hover:shadow-lg">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3">
                  <Plus className="h-8 w-8 text-primary-foreground" />
                </div>
                <p className="text-foreground font-medium">Utwórz nową playlistę</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Utwórz nową playlistę</DialogTitle>
              <DialogDescription>
                Nadaj swojej playliście nazwę
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nazwa</Label>
                <Input
                  id="name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Moja playlista"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Anuluj
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={!newPlaylistName.trim() || createPlaylist.isPending}
              >
                Utwórz
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Existing Playlists */}
        {playlists?.map((playlist) => (
          <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
            <Card className="hover:shadow-xl transition-all cursor-pointer relative group border-none overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-primary to-secondary relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music className="h-16 w-16 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="bg-white/80 hover:bg-white text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDelete(playlist.id, playlist.name);
                      }}
                      disabled={deletePlaylist.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                      <Play className="h-8 w-8 text-foreground ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate text-foreground">{playlist.name}</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    {playlist.itemCount} {playlist.itemCount === 1 ? 'ulepszenie' : 'ulepszeń'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {!isLoading && playlists?.length === 0 && (
        <div className="mt-12 text-center">
          <Card className="max-w-md mx-auto border-dashed border-2 border-primary/20 bg-muted/10">
            <CardContent className="py-12">
              <Music className="h-12 w-12 text-primary/50 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Twoje playlisty pojawią się tutaj.</p>
              <p className="text-sm text-muted-foreground mt-2">Utwórz swoją pierwszą playlistę powyżej!</p>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  );
}