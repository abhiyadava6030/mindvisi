import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useListReflections, useGetReflection } from "@workspace/api-client-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, ChevronRight, X, Heart, Compass, BookHeart, PersonStanding, Flame } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function HistoryPage() {
  const { data: reflections, isLoading } = useListReflections();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: fullReflection, isLoading: isLoadingFull } = useGetReflection(selectedId || 0, {
    query: {
      enabled: !!selectedId,
      queryKey: ["reflection", selectedId]
    }
  });

  const getRecommendationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'book': return <BookHeart className="w-4 h-4 text-blue-400" />;
      case 'yoga': return <PersonStanding className="w-4 h-4 text-green-400" />;
      case 'meditation': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'motivation': return <Flame className="w-4 h-4 text-orange-400" />;
      default: return <Compass className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Your History</h1>
          <p className="text-muted-foreground text-lg">The gallery of your emotional journey.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : !reflections || reflections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center opacity-50">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">A blank canvas</h2>
            <p className="text-muted-foreground max-w-md">Your history is empty. Go to Reflect to capture your first emotional landscape.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reflections.map((reflection, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                key={reflection.id}
                className="group relative rounded-2xl overflow-hidden bg-card border border-border aspect-[4/3] cursor-pointer shadow-lg hover:shadow-primary/20 transition-all duration-300"
                onClick={() => setSelectedId(reflection.id)}
                data-testid={`card-history-${reflection.id}`}
              >
                {reflection.imageUrl ? (
                  <img 
                    src={reflection.imageUrl.startsWith('data:') ? reflection.imageUrl : `data:image/png;base64,${reflection.imageUrl}`} 
                    alt={reflection.mood || "Reflection visual"} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-muted to-background flex items-center justify-center">
                    <Heart className="w-12 h-12 text-muted-foreground opacity-20" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-primary/20 text-primary-foreground border-primary/30 backdrop-blur-sm capitalize">
                      {reflection.mood || "Reflection"}
                    </Badge>
                    <div className="flex items-center text-white/70 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(reflection.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <p className="text-white/90 text-sm line-clamp-2 italic">
                    "{reflection.text}"
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
          <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background border-border rounded-2xl gap-0">
            {isLoadingFull || !fullReflection ? (
              <div className="h-[60vh] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="flex flex-col md:flex-row h-[80vh] max-h-[800px]">
                {/* Image Section */}
                <div className="w-full md:w-1/2 relative bg-black shrink-0">
                  {fullReflection.imageUrl ? (
                    <img 
                      src={fullReflection.imageUrl.startsWith('data:') ? fullReflection.imageUrl : `data:image/png;base64,${fullReflection.imageUrl}`} 
                      alt="Visual" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Sparkles className="w-12 h-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-black/50 text-white backdrop-blur-md border-white/20 px-3 py-1 text-sm capitalize">
                      {fullReflection.mood || "Reflection"}
                    </Badge>
                  </div>
                </div>

                {/* Content Section */}
                <div className="w-full md:w-1/2 flex flex-col bg-card/50">
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center text-muted-foreground text-sm mb-4">
                      <Calendar className="w-4 h-4 mr-2" />
                      {format(new Date(fullReflection.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div className="relative">
                      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary/30 rounded-full" />
                      <p className="text-foreground text-lg italic pl-4 leading-relaxed">
                        "{fullReflection.text}"
                      </p>
                    </div>
                  </div>

                  <ScrollArea className="flex-1 p-6">
                    <h3 className="font-semibold text-foreground/80 uppercase tracking-wider text-xs mb-4">
                      Personalized Recommendations
                    </h3>
                    
                    {fullReflection.recommendations && fullReflection.recommendations.length > 0 ? (
                      <div className="space-y-4">
                        {fullReflection.recommendations.map((rec) => (
                          <div key={rec.id} className="bg-background/80 border border-border rounded-xl p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getRecommendationIcon(rec.type)}
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
                                  {rec.type}
                                </div>
                                <h4 className="font-medium text-foreground mb-1 leading-tight">{rec.title}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">{rec.description}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No specific recommendations for this entry.</p>
                    )}
                  </ScrollArea>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}