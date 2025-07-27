import { auth } from "@/server/auth";
import { api } from "@/trpc/server";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Clock, Star } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  
  let stats: Awaited<ReturnType<typeof api.user.getProfileStats>>;
  let achievements: Awaited<ReturnType<typeof api.user.getAchievements>> = [];
  
  try {
    stats = await api.user.getProfileStats();
    achievements = await api.user.getAchievements();
  } catch {
    // Default values if no data
    stats = {
      streakDays: 0,
      totalMinutes: 0,
      activations: 0,
    };
    achievements = [];
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Witaj, {session?.user?.name?.split(' ')[0] || "Przyjacielu"}
        </h1>
      </header>

      {/* Stats with high contrast */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-3">
              <Star className="h-6 w-6 text-primary-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats.streakDays}
            </p>
            <p className="text-sm text-muted-foreground font-medium">Dni z rzędu</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-3">
              <Clock className="h-6 w-6 text-secondary-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats.totalMinutes}
            </p>
            <p className="text-sm text-muted-foreground font-medium">Całkowite minuty</p>
          </CardContent>
        </Card>
        
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent mb-3">
              <Trophy className="h-6 w-6 text-accent-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats.activations}
            </p>
            <p className="text-sm text-muted-foreground font-medium">Ulepszenia</p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements section */}
      <section>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Twoje osiągnięcia</h2>
        <p className="text-muted-foreground mb-6">Śledź swoje kamienie milowe z odznakami</p>
        
        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {achievements.map((achievement) => (
            <div key={achievement.id} className="relative group">
              <div
                className={`aspect-square rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  achievement.unlocked
                    ? 'bg-primary shadow-md scale-100 group-hover:scale-110'
                    : 'bg-muted border-2 border-dashed border-muted-foreground/40'
                }`}
              >
                <div className={`text-3xl font-bold ${achievement.unlocked ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                  {achievement.unlocked ? '★' : '🔒'}
                </div>
              </div>
              {achievement.unlocked && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs text-accent-foreground font-bold">✓</span>
                </div>
              )}
            </div>
          ))}
          
          {/* Add placeholder achievements */}
          {achievements.length < 12 && [...Array(12 - achievements.length)].map((_, i) => (
            <div key={`placeholder-${i}`} className="relative">
              <div className="aspect-square rounded-2xl flex items-center justify-center bg-muted border-2 border-dashed border-muted-foreground/20">
                <span className="text-2xl text-muted-foreground">🔒</span>
              </div>
            </div>
          ))}
        </div>
        
        {achievements.length === 0 && (
          <Card className="mt-8 border-2 border-dashed border-muted-foreground/40 bg-muted/20">
            <CardContent className="text-center py-8">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium">
                Ukończ ulepszenia, aby odblokować osiągnięcia!
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}