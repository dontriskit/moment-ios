"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Activity, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

export default function ActivityPage() {
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();
  const [selectedAction, setSelectedAction] = useState<string | undefined>();

  const { data: stats, isLoading: statsLoading } = api.activity.getActivityStats.useQuery();
  
  const { data: activities, isLoading: activitiesLoading } = api.activity.getAllActivities.useQuery({
    limit: 50,
    offset: (page - 1) * 50,
    userId: selectedUserId,
    action: selectedAction,
  });

  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      activation_completed: "Ukończono aktywację",
      activation_progress: "Postęp aktywacji",
      activation_favorited: "Dodano do ulubionych",
      activation_unfavorited: "Usunięto z ulubionych",
      achievement_unlocked: "Odblokowano osiągnięcie",
      article_read: "Przeczytano artykuł",
      login: "Zalogowano",
      logout: "Wylogowano",
    };
    return actionMap[action] || action;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Aktywność użytkowników</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywni dzisiaj</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers.today ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers.yesterday ?? 0} wczoraj
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywni w tym tygodniu</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers.week ?? 0}</div>
            <p className="text-xs text-muted-foreground">unikalnych użytkowników</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywni w tym miesiącu</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeUsers.month ?? 0}</div>
            <p className="text-xs text-muted-foreground">unikalnych użytkowników</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend aktywności</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.activityTrend && stats.activityTrend.length > 1
                ? Math.round(
                    ((stats.activityTrend[stats.activityTrend.length - 1]!.count -
                      stats.activityTrend[0]!.count) /
                      stats.activityTrend[0]!.count) *
                      100
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">zmiana w ostatnich 7 dniach</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Actions */}
      {stats?.topActions && stats.topActions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Najpopularniejsze akcje (ostatnie 7 dni)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topActions.map((action) => (
                <div key={action.action} className="flex justify-between items-center">
                  <span className="text-sm">{formatAction(action.action)}</span>
                  <span className="text-sm font-medium">{action.count} razy</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ostatnia aktywność</CardTitle>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <p className="text-center py-8">Ładowanie...</p>
          ) : activities?.activities.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Brak aktywności</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Czas</TableHead>
                    <TableHead>Użytkownik</TableHead>
                    <TableHead>Akcja</TableHead>
                    <TableHead>Szczegóły</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities?.activities.map((item) => (
                    <TableRow key={item.activity.id}>
                      <TableCell className="text-sm">
                        {format(new Date(item.activity.createdAt), "dd MMM HH:mm", {
                          locale: pl,
                        })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.user?.name || item.user?.email || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{item.user?.email || ""}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatAction(item.activity.action)}</TableCell>
                      <TableCell className="text-sm">
                        {item.activity.entityType && (
                          <span className="text-gray-600">
                            {item.activity.entityType}: {item.activity.entityId?.slice(0, 8)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {item.activity.ipAddress}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {activities && activities.total > 50 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Poprzednia
                  </Button>
                  <span className="flex items-center px-4">
                    Strona {page} z {Math.ceil(activities.total / 50)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page === Math.ceil(activities.total / 50)}
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