"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import { 
  TrendingUp, Users, Headphones, FileText, Activity,
  Calendar, Clock, BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState(30);

  // Fetch analytics data
  const { data: userGrowth } = api.analytics.getUserGrowth.useQuery({ days: timeRange });
  const { data: activationListens } = api.analytics.getActivationListens.useQuery({ days: timeRange });
  const { data: categoryDistribution } = api.analytics.getCategoryDistribution.useQuery();
  const { data: topActivations } = api.analytics.getTopActivations.useQuery({ limit: 10 });
  const { data: activeUsersToday } = api.analytics.getActiveUsersToday.useQuery();
  const { data: articleStats } = api.analytics.getArticleStats.useQuery({ days: timeRange });
  const { data: listeningHeatmap } = api.analytics.getListeningHeatmap.useQuery();
  const { data: userRetention } = api.analytics.getUserRetention.useQuery({ cohortDays: 30 });

  // Format data for charts
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d MMM", { locale: pl });
  };

  const formatUserGrowthData = () => {
    if (!userGrowth) return [];
    return userGrowth.map(item => ({
      date: formatDate(item.date),
      "Nowi użytkownicy": item.count,
    }));
  };

  const formatListeningData = () => {
    if (!activationListens) return [];
    return activationListens.map(item => ({
      date: formatDate(item.date),
      "Odsłuchania": item.count,
      "Minuty": Math.round(item.totalMinutes),
    }));
  };

  const formatCategoryData = () => {
    if (!categoryDistribution) return [];
    return categoryDistribution.filter(item => item.count > 0);
  };

  const formatHeatmapData = () => {
    if (!listeningHeatmap) return [];
    
    const days = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
    const heatmap: Record<string, number> = {};
    
    listeningHeatmap.forEach(item => {
      const key = `${days[item.dayOfWeek]}-${item.hour}`;
      heatmap[key] = item.count;
    });
    
    return days.map((day) => {
      const dayData: Record<string, string | number> = { day };
      for (let hour = 0; hour < 24; hour++) {
        dayData[`h${hour}`] = heatmap[`${day}-${hour}`] || 0;
      }
      return dayData;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analityka</h1>
          <p className="text-gray-600 mt-1">Szczegółowe statystyki i raporty</p>
        </div>
        
        <Select value={timeRange.toString()} onValueChange={(value) => setTimeRange(parseInt(value))}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Ostatnie 7 dni</SelectItem>
            <SelectItem value="30">Ostatnie 30 dni</SelectItem>
            <SelectItem value="90">Ostatnie 90 dni</SelectItem>
            <SelectItem value="365">Ostatni rok</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywni użytkownicy dziś</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersToday || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Całkowite odsłuchania</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activationListens?.reduce((sum, item) => sum + item.count, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minuty odsłuchań</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(activationListens?.reduce((sum, item) => sum + item.totalMinutes, 0) || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wyświetlenia artykułów</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {articleStats?.views.reduce((sum, item) => sum + item.count, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="growth">Wzrost</TabsTrigger>
          <TabsTrigger value="engagement">Zaangażowanie</TabsTrigger>
          <TabsTrigger value="content">Treści</TabsTrigger>
          <TabsTrigger value="retention">Retencja</TabsTrigger>
          <TabsTrigger value="heatmap">Mapa ciepła</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wzrost liczby użytkowników</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={formatUserGrowthData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="Nowi użytkownicy" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Odsłuchania i czas słuchania</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formatListeningData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="Odsłuchania" 
                      stroke="#8884d8"
                      strokeWidth={2}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="Minuty" 
                      stroke="#82ca9d"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 ulepszeń</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topActivations?.map((activation, index) => (
                  <div key={activation.activationId} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{activation.title}</p>
                      <p className="text-sm text-gray-600">{activation.categoryName}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">{activation.totalListens} odsłuchań</p>
                      <p className="text-sm text-gray-600">{Math.round(activation.totalMinutes)} min</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Rozkład kategorii</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={formatCategoryData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.categoryName}: ${entry.count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {formatCategoryData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.categoryColor || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aktywność publikacji</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] md:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={articleStats?.published || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => formatDate(date)} />
                      <YAxis />
                      <Tooltip labelFormatter={(date) => formatDate(date)} />
                      <Bar dataKey="count" fill="#82ca9d" name="Opublikowane artykuły" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Retencja użytkowników (kohort z ostatnich 30 dni)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userRetention || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tickFormatter={(week) => `Tydzień ${week}`} />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value: any) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="percentage" fill="#8884d8" name="Retencja %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa ciepła aktywności (ostatnie 30 dni)</CardTitle>
              <p className="text-sm text-gray-600">Godziny największej aktywności użytkowników</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-25 gap-0.5">
                    <div className="text-xs font-medium text-gray-600 p-1"></div>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div key={i} className="text-xs text-center font-medium text-gray-600 p-1">
                        {i}
                      </div>
                    ))}
                    
                    {formatHeatmapData().map((dayData) => (
                      <>
                        <div key={dayData.day} className="text-xs font-medium text-gray-600 p-1">
                          {dayData.day}
                        </div>
                        {Array.from({ length: 24 }, (_, hour) => {
                          const value = Number(dayData[`h${hour}`] || 0);
                          const maxValue = Math.max(...listeningHeatmap?.map(item => item.count) || [1]);
                          const intensity = value / maxValue;
                          
                          return (
                            <div
                              key={`${dayData.day}-${hour}`}
                              className="aspect-square rounded"
                              style={{
                                backgroundColor: `rgba(139, 92, 246, ${intensity})`,
                              }}
                              title={`${dayData.day} ${hour}:00 - ${value} odsłuchań`}
                            />
                          );
                        })}
                      </>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}