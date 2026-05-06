import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useCreateReflection, 
  useAnalyzeReflection, 
  useGetReflection,
  getListReflectionsQueryKey,
  getGetDashboardStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookHeart, PersonStanding, Flame, Compass } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const INSPIRING_PLACEHOLDERS = [
  "What is heavy on your heart today?",
  "Let the words fall as they are. No judgment here.",
  "Describe the color of your thoughts right now...",
  "If your current emotion had a shape, what would it look like?",
  "Pour your joy, your anger, your sorrow into this space..."
];

export default function ReflectPage() {
  const [text, setText] = useState("");
  const [placeholder] = useState(() => INSPIRING_PLACEHOLDERS[Math.floor(Math.random() * INSPIRING_PLACEHOLDERS.length)]);
  const [reflectionId, setReflectionId] = useState<number | null>(null);
  
  const createReflection = useCreateReflection();
  const analyzeReflection = useAnalyzeReflection();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: fullReflection, isLoading: isLoadingFull } = useGetReflection(reflectionId || 0, {
    query: {
      enabled: !!reflectionId && analyzeReflection.isSuccess,
      queryKey: ["reflection", reflectionId]
    }
  });

  const isProcessing = createReflection.isPending || analyzeReflection.isPending || (!!reflectionId && analyzeReflection.isSuccess && isLoadingFull);
  const isComplete = !!fullReflection;

  const handleSubmit = async () => {
    if (!text.trim()) return;
    
    try {
      // 1. Create reflection
      const reflection = await createReflection.mutateAsync({ data: { text } });
      setReflectionId(reflection.id);
      
      // 2. Immediately trigger analysis
      await analyzeReflection.mutateAsync({ id: reflection.id });
      
      // 3. Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: getListReflectionsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
      
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "We couldn't process your reflection. Please try again.",
        variant: "destructive"
      });
      setReflectionId(null);
    }
  };

  const resetForm = () => {
    setText("");
    setReflectionId(null);
    createReflection.reset();
    analyzeReflection.reset();
  };

  const getRecommendationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'book': return <BookHeart className="w-5 h-5 text-blue-400" />;
      case 'yoga': return <PersonStanding className="w-5 h-5 text-green-400" />;
      case 'meditation': return <Sparkles className="w-5 h-5 text-purple-400" />;
      case 'motivation': return <Flame className="w-5 h-5 text-orange-400" />;
      default: return <Compass className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 md:p-8 max-w-5xl min-h-[calc(100vh-80px)] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {!isProcessing && !isComplete && (
            <motion.div 
              key="input-stage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-3xl mx-auto flex flex-col gap-6"
            >
              <div className="space-y-2 text-center mb-4">
                <h1 className="text-3xl md:text-5xl font-bold text-foreground">Speak your mind</h1>
                <p className="text-muted-foreground text-lg">Your sanctuary. Safe, private, and listening.</p>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <Textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={placeholder}
                  className="relative min-h-[300px] text-lg md:text-xl p-6 md:p-8 bg-card/80 backdrop-blur-xl border-card-border rounded-2xl resize-none focus-visible:ring-primary/50 text-foreground placeholder:text-muted-foreground/60 leading-relaxed"
                  data-testid="textarea-reflection"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  size="lg" 
                  onClick={handleSubmit} 
                  disabled={!text.trim() || isProcessing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all rounded-xl h-14 text-lg"
                  data-testid="btn-submit-reflection"
                >
                  <Sparkles className="mr-2 w-5 h-5" />
                  Transform
                </Button>
              </div>
            </motion.div>
          )}

          {isProcessing && !isComplete && (
            <motion.div 
              key="loading-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center space-y-8 py-20"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-t-primary border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-accent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Listening to your echoes...</h2>
                <p className="text-muted-foreground">Painting your emotional landscape</p>
              </div>
            </motion.div>
          )}

          {isComplete && fullReflection && (
            <motion.div 
              key="result-stage"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 py-8"
            >
              {/* Visual Column */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="relative rounded-2xl overflow-hidden aspect-square border border-border bg-black/50 shadow-2xl">
                  {fullReflection.imageUrl ? (
                    <>
                      <div className="absolute inset-0 cosmic-glow-intense opacity-50 z-0"></div>
                      <img 
                        src={fullReflection.imageUrl.startsWith('data:') ? fullReflection.imageUrl : `data:image/png;base64,${fullReflection.imageUrl}`} 
                        alt="Your emotional landscape" 
                        className="w-full h-full object-cover relative z-10 animate-pulse-glow"
                        data-testid="img-generated-visual"
                      />
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Sparkles className="w-12 h-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-20">
                    <div className="inline-flex px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground backdrop-blur-md text-sm font-medium capitalize mb-2" data-testid="badge-mood">
                      {fullReflection.mood || "Mixed"}
                    </div>
                    <p className="text-white/80 line-clamp-3 text-sm italic">"{fullReflection.text}"</p>
                  </div>
                </div>

                <Button variant="outline" onClick={resetForm} className="w-full py-6 rounded-xl border-border/50 hover:bg-card" data-testid="btn-new-reflection">
                  Reflect Again
                </Button>
              </div>

              {/* Recommendations Column */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="bg-card/40 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-card-border shadow-xl">
                  {/* Note: The API does not return 'greeting' in the reflection object directly, 
                      so we use a generic soothing message or construct one based on mood */}
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                    I hear you.
                  </h2>
                  <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                    Your {fullReflection.mood || "emotions"} have been acknowledged. Here are some gentle paths forward to support where you are right now.
                  </p>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground/80 tracking-wide uppercase text-sm mb-4">Recommended for you</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fullReflection.recommendations && fullReflection.recommendations.map((rec) => (
                        <div 
                          key={rec.id} 
                          className="bg-background/50 border border-border rounded-xl p-5 hover:bg-card/80 transition-colors group"
                          data-testid={`card-recommendation-${rec.type}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-muted group-hover:bg-background transition-colors shrink-0">
                              {getRecommendationIcon(rec.type)}
                            </div>
                            <div>
                              <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
                                {rec.type}
                              </div>
                              <h4 className="font-semibold text-foreground mb-2 leading-tight">
                                {rec.title}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {(!fullReflection.recommendations || fullReflection.recommendations.length === 0) && (
                        <div className="col-span-2 p-6 rounded-xl bg-muted/30 border border-border text-center text-muted-foreground">
                          No specific recommendations generated at this time. Rest, breathe, and take care of yourself.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}