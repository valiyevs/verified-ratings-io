import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Review {
  rating: number;
  service_rating?: number | null;
  price_rating?: number | null;
  speed_rating?: number | null;
  quality_rating?: number | null;
  created_at: string;
}

interface RatingChartProps {
  reviews: Review[];
  averageRating: number;
}

const COLORS = {
  5: "hsl(var(--primary))",
  4: "hsl(142.1 76.2% 36.3%)",
  3: "hsl(45 93% 47%)",
  2: "hsl(25 95% 53%)",
  1: "hsl(0 84.2% 60.2%)",
};

const RatingChart = ({ reviews, averageRating }: RatingChartProps) => {
  // Rating distribution data
  const distributionData = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        counts[rating as keyof typeof counts]++;
      }
    });
    
    const total = reviews.length;
    return [5, 4, 3, 2, 1].map((rating) => ({
      rating: `${rating} ulduz`,
      count: counts[rating as keyof typeof counts],
      percentage: total > 0 ? Math.round((counts[rating as keyof typeof counts] / total) * 100) : 0,
      fill: COLORS[rating as keyof typeof COLORS],
    }));
  }, [reviews]);

  // Criteria averages for radar chart
  const criteriaData = useMemo(() => {
    const withCriteria = reviews.filter((r) => r.service_rating);
    if (withCriteria.length === 0) return null;

    const avgService = withCriteria.reduce((sum, r) => sum + (r.service_rating || 0), 0) / withCriteria.length;
    const avgPrice = withCriteria.reduce((sum, r) => sum + (r.price_rating || 0), 0) / withCriteria.length;
    const avgSpeed = withCriteria.reduce((sum, r) => sum + (r.speed_rating || 0), 0) / withCriteria.length;
    const avgQuality = withCriteria.reduce((sum, r) => sum + (r.quality_rating || 0), 0) / withCriteria.length;

    return [
      { subject: "Xidmət", A: avgService, fullMark: 5 },
      { subject: "Qiymət", A: avgPrice, fullMark: 5 },
      { subject: "Sürət", A: avgSpeed, fullMark: 5 },
      { subject: "Keyfiyyət", A: avgQuality, fullMark: 5 },
    ];
  }, [reviews]);

  // Monthly trend data
  const trendData = useMemo(() => {
    const monthlyData: { [key: string]: { total: number; count: number } } = {};
    
    reviews.forEach((review) => {
      const date = new Date(review.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { total: 0, count: 0 };
      }
      monthlyData[key].total += review.rating;
      monthlyData[key].count++;
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => ({
        month: new Date(month + "-01").toLocaleDateString("az-AZ", { month: "short" }),
        rating: Math.round((data.total / data.count) * 10) / 10,
        count: data.count,
      }));
  }, [reviews]);

  if (reviews.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-card border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Reytinq Statistikası</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="distribution" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="distribution">Bölgü</TabsTrigger>
            <TabsTrigger value="criteria" disabled={!criteriaData}>Meyarlar</TabsTrigger>
            <TabsTrigger value="trend" disabled={trendData.length < 2}>Trend</TabsTrigger>
          </TabsList>
          
          <TabsContent value="distribution" className="mt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distributionData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
                >
                  <XAxis type="number" domain={[0, "dataMax"]} hide />
                  <YAxis
                    type="category"
                    dataKey="rating"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border p-2 rounded-lg shadow-lg">
                            <p className="font-medium">{data.rating}</p>
                            <p className="text-sm text-muted-foreground">
                              {data.count} rəy ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={24}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Ümumi: <span className="font-semibold text-foreground">{reviews.length}</span> rəy
              </p>
            </div>
          </TabsContent>

          <TabsContent value="criteria" className="mt-0">
            {criteriaData && (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={criteriaData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 5]}
                      tick={{ fontSize: 10 }}
                      tickCount={6}
                    />
                    <Radar
                      name="Orta bal"
                      dataKey="A"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border p-2 rounded-lg shadow-lg">
                              <p className="font-medium">{data.subject}</p>
                              <p className="text-sm text-muted-foreground">
                                Orta: {data.A.toFixed(1)} / 5
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trend" className="mt-0">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    width={30}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-popover border border-border p-2 rounded-lg shadow-lg">
                            <p className="font-medium">{data.month}</p>
                            <p className="text-sm text-muted-foreground">
                              Orta: {data.rating} / 5
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rəy sayı: {data.count}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="rating"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RatingChart;
