"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { 
  Play, Pause, RotateCcw, RotateCw, X, 
  Heart, Download, ListPlus, Share2, Loader2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Helper to format time
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export default function PlayerPage() {
  const router = useRouter();
  const params = useParams();
  const activationId = params.activationId as string;

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const { data, isLoading } = api.activation.getActivationById.useQuery({ 
    id: activationId 
  });
  
  const updateProgressMutation = api.user.updateProgress.useMutation();
  const toggleFavoriteMutation = api.user.toggleFavorite.useMutation();
  const { data: playlists, refetch: refetchPlaylists } = api.playlist.getUserPlaylists.useQuery();
  const createPlaylistMutation = api.playlist.createPlaylist.useMutation();
  const addToPlaylistMutation = api.playlist.addToPlaylist.useMutation();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => setDuration(audio.duration);
    const updateCurrentTime = () => setCurrentTime(audio.currentTime);

    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", updateCurrentTime);
    
    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", updateCurrentTime);
    };
  }, [data?.audioUrl]);

  // Save progress every 10 seconds
  useEffect(() => {
    if (!isPlaying || currentTime === 0) return;

    const saveProgress = setInterval(() => {
      updateProgressMutation.mutate({
        activationId,
        progressSeconds: Math.floor(currentTime),
        isCompleted: false,
      });
    }, 10000);

    return () => clearInterval(saveProgress);
  }, [isPlaying, currentTime, activationId]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSkip = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + amount));
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    updateProgressMutation.mutate({
      activationId,
      progressSeconds: Math.floor(duration),
      isCompleted: true,
    });
  };

  const handleFavorite = () => {
    toggleFavoriteMutation.mutate({ activationId });
  };

  const handleAddToPlaylist = async () => {
    if (selectedPlaylistId) {
      await addToPlaylistMutation.mutateAsync({
        playlistId: selectedPlaylistId,
        activationId,
      });
      setShowPlaylistModal(false);
      setSelectedPlaylistId(null);
    } else if (newPlaylistName.trim()) {
      const newPlaylist = await createPlaylistMutation.mutateAsync({
        name: newPlaylistName.trim(),
      });
      if (newPlaylist) {
        await addToPlaylistMutation.mutateAsync({
          playlistId: newPlaylist.id,
          activationId,
        });
      }
      setShowPlaylistModal(false);
      setNewPlaylistName("");
      void refetchPlaylists();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (!data) {
    return <div className="p-4">Activation not found.</div>;
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative h-screen w-full flex flex-col overflow-hidden bg-gradient-to-b from-slate-900 via-purple-900 to-pink-900">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src={data.imageUrl} 
          alt={data.title} 
          fill 
          className="object-cover opacity-30 blur-sm" 
        />
      </div>
      
      {/* Header */}
      <header className="p-4 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col justify-center items-center text-center p-6 z-10">
        <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-lg">{data.title}</h1>
        <p className="text-white/90 max-w-md drop-shadow">{data.description}</p>
      </main>

      {/* Controls */}
      <footer className="p-6 space-y-6 z-10">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/90">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        {/* Playback controls */}
        <div className="flex items-center justify-center gap-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleSkip(-15)}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="h-6 w-6" />
          </Button>
          
          <Button 
            size="lg" 
            onClick={handlePlayPause}
            className="rounded-full h-20 w-20 bg-white text-purple-900 hover:bg-white/90 shadow-2xl"
          >
            {isPlaying ? (
              <Pause className="h-10 w-10" />
            ) : (
              <Play className="h-10 w-10 ml-1" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => handleSkip(15)}
            className="text-white hover:bg-white/20"
          >
            <RotateCw className="h-6 w-6" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleFavorite}
            className="text-white hover:bg-white/20"
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart className={`h-6 w-6 ${data.isFavorited ? 'fill-white' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <Download className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPlaylistModal(true)}
            className="text-white hover:bg-white/20"
          >
            <ListPlus className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <Share2 className="h-6 w-6" />
          </Button>
        </div>
      </footer>
      
      {/* Hidden audio element */}
      {data.audioUrl && (
        <audio 
          ref={audioRef} 
          src={data.audioUrl}
          onEnded={handleEnded}
        />
      )}

      {/* Playlist Modal */}
      <Dialog open={showPlaylistModal} onOpenChange={setShowPlaylistModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj do playlisty</DialogTitle>
            <DialogDescription>
              Wybierz playlistę lub utwórz nową
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Existing playlists */}
            {playlists && playlists.length > 0 && (
              <div className="space-y-2">
                <Label>Wybierz playlistę</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.id}
                      onClick={() => setSelectedPlaylistId(playlist.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedPlaylistId === playlist.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <p className="font-medium">{playlist.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {playlist.itemCount} {playlist.itemCount === 1 ? 'ulepszenie' : 'ulepszeń'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Create new playlist */}
            <div className="space-y-2">
              <Label htmlFor="new-playlist">Lub utwórz nową playlistę</Label>
              <Input
                id="new-playlist"
                value={newPlaylistName}
                onChange={(e) => {
                  setNewPlaylistName(e.target.value);
                  setSelectedPlaylistId(null);
                }}
                placeholder="Nazwa nowej playlisty"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlaylistModal(false)}>
              Anuluj
            </Button>
            <Button 
              onClick={handleAddToPlaylist}
              disabled={(!selectedPlaylistId && !newPlaylistName.trim()) || 
                       addToPlaylistMutation.isPending || 
                       createPlaylistMutation.isPending}
            >
              {createPlaylistMutation.isPending || addToPlaylistMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Dodaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}