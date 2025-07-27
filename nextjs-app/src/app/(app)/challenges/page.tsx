"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Calendar, Trophy, CheckCircle, Clock } from "lucide-react";

export default function ChallengesPage() {
  const { data: challenges } = api.challenges.getAll.useQuery();
  const { data: userProgress } = api.challenges.getUserProgress.useQuery();

  const startChallengeMutation = api.challenges.startChallenge.useMutation({
    onSuccess: () => {
      // Refresh data
      window.location.reload();
    },
  });

  const handleStartChallenge = async (challengeId: string) => {
    await startChallengeMutation.mutateAsync({ challengeId });
  };

  const isInProgress = (challengeId: string) => {
    return userProgress?.some(p => p.challenge.id === challengeId && !p.progress.isCompleted);
  };

  const isCompleted = (challengeId: string) => {
    return userProgress?.some(p => p.challenge.id === challengeId && p.progress.isCompleted);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wyzwania</h1>
        <p className="text-gray-600">
          Dołącz do wielodniowych wyzwań, aby zmienić swoje życie.
        </p>
      </div>

      {/* Active Challenges */}
      {userProgress && userProgress.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Aktywne wyzwania</h2>
          <div className="grid gap-4">
            {userProgress
              .filter(p => !p.progress.isCompleted)
              .map(({ challenge, progress }) => (
                <Card key={challenge.id} className="border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Target className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{challenge.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        W trakcie
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Postęp</span>
                        <span>{progress.completedDays}/{challenge.durationDays} dni</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(progress.completedDays / challenge.durationDays) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Available Challenges */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Dostępne wyzwania</h2>
        <div className="grid gap-4">
          {challenges?.filter(c => !isInProgress(c.id) && !isCompleted(c.id)).map((challenge) => (
            <Card key={challenge.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Target className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{challenge.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{challenge.durationDays} dni</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleStartChallenge(challenge.id)}
                    disabled={startChallengeMutation.isPending}
                  >
                    Rozpocznij
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Challenges */}
      {userProgress && userProgress.filter(p => p.progress.isCompleted).length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Ukończone wyzwania</h2>
          <div className="grid gap-4">
            {userProgress
              .filter(p => p.progress.isCompleted)
              .map(({ challenge, progress }) => (
                <Card key={challenge.id} className="opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{challenge.name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Ukończone
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
          </div>
        </div>
      )}

      {(!challenges || challenges.length === 0) && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Brak dostępnych wyzwań</p>
            <p className="text-sm text-gray-400 mt-2">
              Sprawdź później, aby zobaczyć nowe wyzwania.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}