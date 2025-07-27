import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Activation {
  id: string;
  title: string;
  imageUrl: string;
  durationSeconds: number;
  category?: {
    name: string;
  } | null;
}

interface ActivationCardProps {
  activation: Activation;
  className?: string;
  showCategory?: boolean;
}

export function ActivationCard({ 
  activation, 
  className, 
  showCategory = true 
}: ActivationCardProps) {
  const minutes = Math.floor(activation.durationSeconds / 60);

  return (
    <Link href={`/player/${activation.id}`} className="block group">
      <Card className={cn("overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow", className)}>
        <CardContent className="relative p-0 aspect-[3/4]">
          <Image
            src={activation.imageUrl}
            alt={activation.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          
          <div className="absolute top-3 right-3">
            <PlayCircle className="h-8 w-8 text-white/80 group-hover:text-white transition-colors" />
          </div>
          
          <div className="absolute bottom-0 left-0 p-4 text-white">
            <h3 className="font-bold text-lg leading-tight line-clamp-2">
              {activation.title}
            </h3>
            <p className="text-sm text-white/80 mt-1">
              {minutes} min
              {showCategory && activation.category && (
                <> • {activation.category.name}</>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}