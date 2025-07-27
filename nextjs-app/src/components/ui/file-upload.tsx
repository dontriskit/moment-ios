"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X, FileAudio, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  id: string;
  label: string;
  accept: string;
  type: "image" | "audio";
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  maxSizeMB?: number;
}

export function FileUpload({
  id,
  label,
  accept,
  type,
  value,
  onChange,
  className,
  maxSizeMB = 10,
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setError(null);
  };

  const clearValue = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      
      <div className="space-y-2">
        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            id={id}
            type="url"
            value={value || ""}
            onChange={handleUrlChange}
            placeholder={`https://example.com/${type === "audio" ? "audio.mp3" : "image.jpg"}`}
            disabled={isUploading}
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={clearValue}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* File Upload */}
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Przesyłanie...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Prześlij plik z komputera
              </>
            )}
          </Button>
        </div>

        {/* Preview */}
        {value && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {type === "audio" ? (
                <>
                  <FileAudio className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Audio:</span>
                  <audio controls className="max-w-full">
                    <source src={value} />
                  </audio>
                </>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Podgląd:</span>
                  <img 
                    src={value} 
                    alt="Preview" 
                    className="max-w-[200px] max-h-[100px] object-contain rounded"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Help text */}
        <p className="text-sm text-gray-600">
          {type === "audio" 
            ? `Możesz podać URL lub przesłać plik MP3, WAV, OGG (max ${maxSizeMB}MB)`
            : `Możesz podać URL lub przesłać plik JPG, PNG, WebP, GIF (max ${maxSizeMB}MB)`
          }
        </p>
      </div>
    </div>
  );
}