import { useGetDashboardStats } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useUser } from "@clerk/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Brain, BookOpen, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useUser();
  const { data: stats, isLoading, isError } = useGetDashboardStats();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const chartColors = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(200 80% 60%)",
    "hsl(330 80% 65%)",
    "hsl(160 60% 50%)"
  ];

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {getGreeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">{user?.firstName || "Traveler"}</span>
          </h1>
          <p className="text-muted-foreground text-lg">Your sanctuary awaits. How is your inner sky today?</p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive-foreground mb-10">
            Failed to load dashboard statistics. Please try refreshing.
          </div>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
            >
              <Card className="bg-card/40 backdrop-blur-md border-card-border overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Flame className="w-24 h-24" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Flame className="w-4 h-4 text-accent" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground" data-testid="text-stats-streak">
                    {stats?.streakDays || 0} <span className="text-xl text-muted-foreground font-normal">days</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-md border-card-border overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <BookOpen className="w-24 h-24" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Total Reflections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-foreground" data-testid="text-stats-total">
                    {stats?.totalReflections || 0}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/40 backdrop-blur-md border-card-border overflow-hidden relative bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                <CardContent className="p-6 flex flex-col items-start justify-center h-full">
                  <h3 className="text-lg font-bold mb-2">Ready to reflect?</h3>
                  <Link href="/reflect" className="w-full">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(139,92,246,0.3)]" data-testid="btn-dash-reflect">
                      New Entry
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="bg-card/40 backdrop-blur-md border-card-border h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      Emotional Landscape
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {stats?.moodBreakdown && stats.moodBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.moodBreakdown} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                          <XAxis 
                            dataKey="mood" 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12} 
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))" 
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <RechartsTooltip 
                            cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--popover))',
                              borderColor: 'hsl(var(--border))',
                              borderRadius: '8px',
                              color: 'hsl(var(--foreground))'
                            }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {stats.moodBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <p>Your emotional landscape is waiting to be painted.</p>
                        <p className="text-sm">Create reflections to see your mood breakdown.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="bg-card/40 backdrop-blur-md border-card-border h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Recent Echoes</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                    {stats?.recentReflections && stats.recentReflections.length > 0 ? (
                      stats.recentReflections.map((reflection) => (
                        <Link key={reflection.id} href={`/history?id=${reflection.id}`}>
                          <div 
                            className="group flex gap-4 p-3 rounded-xl hover:bg-muted/50 border border-transparent hover:border-border transition-all cursor-pointer"
                            data-testid={`link-recent-reflection-${reflection.id}`}
                          >
                            {reflection.imageUrl ? (
                              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border/50 group-hover:border-primary/50 transition-colors">
                                <img 
                                  src={reflection.imageUrl.startsWith('data:') ? reflection.imageUrl : `data:image/png;base64,${reflection.imageUrl}`} 
                                  alt="Mood visual" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/50">
                                <Brain className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex flex-col justify-center min-w-0">
                              <span className="text-sm text-muted-foreground mb-1">
                                {format(new Date(reflection.createdAt), "MMM d, yyyy")}
                              </span>
                              <span className="font-medium text-foreground capitalize truncate">
                                {reflection.mood || "Unanalyzed"}
                              </span>
                              <span className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                {reflection.text}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                        <BookOpen className="w-10 h-10 mb-2 opacity-20" />
                        <p className="text-sm">No recent echoes found.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}