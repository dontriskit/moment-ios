import { api } from "@/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Music, FolderOpen, Trophy, Headphones, Clock, FileText, Tags, UserCircle, Layers } from "lucide-react";

export default async function AdminDashboard() {
  const stats = await api.admin.getStats();

  const statCards = [
    {
      title: "Liczba użytkowników",
      value: stats.users.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Ulepszenia",
      value: stats.content.activations,
      icon: Music,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Kategorie",
      value: stats.content.categories,
      icon: FolderOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Całkowita liczba odsłuchań",
      value: stats.listening.totalListens,
      icon: Headphones,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Całkowita liczba minut",
      value: stats.listening.totalMinutes.toLocaleString(),
      icon: Clock,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Administratorzy",
      value: stats.users.admins,
      icon: Trophy,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  const cmsStatCards = [
    {
      title: "Artykuły",
      value: `${stats.cms.publishedArticles}/${stats.cms.articles}`,
      icon: FileText,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      title: "Tagi",
      value: stats.cms.tags,
      icon: Tags,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      title: "Autorzy",
      value: stats.cms.authors,
      icon: UserCircle,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100",
    },
    {
      title: "Kolekcje",
      value: stats.cms.collections,
      icon: Layers,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="pt-12 lg:pt-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Panel główny</h1>
      </div>
      
      {/* Main Stats Grid */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Statystyki główne</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {statCards.map((stat) => (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 truncate mr-2">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <div className="text-xl md:text-2xl font-bold truncate">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CMS Stats Grid */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">System zarządzania treścią</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {cmsStatCards.map((stat) => (
            <Card key={stat.title} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-gray-600 truncate mr-2">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-4 w-4 md:h-5 md:w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="text-lg md:text-2xl font-bold truncate">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Ostatnia aktywność</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Users */}
          <Card>
          <CardHeader>
            <CardTitle>Ostatni użytkownicy</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent.users.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{user.name ?? "Bezimienny użytkownik"}</p>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded ml-2 flex-shrink-0">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Brak użytkowników</p>
            )}
          </CardContent>
        </Card>

          {/* Recent Activations */}
          <Card>
          <CardHeader>
            <CardTitle>Ostatnie ulepszenia</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recent.activations.length > 0 ? (
              <div className="space-y-3">
                {stats.recent.activations.map((activation) => (
                  <div key={activation.id} className="flex items-center justify-between py-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{activation.title}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {activation.category?.name ?? "Bez kategorii"}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {Math.floor(activation.durationSeconds / 60)} min
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Brak ulepszeń</p>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}