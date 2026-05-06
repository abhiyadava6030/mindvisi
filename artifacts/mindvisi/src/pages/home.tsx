import { Link } from "wouter";
import { Sparkles, ArrowRight, HeartPulse, Brain, MoonStar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-screen pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl tracking-tight text-foreground">Mindvisi</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground" data-testid="link-home-signin">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]" data-testid="link-home-signup">
              Start Journey
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary-foreground text-sm font-medium mb-4 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
            <MoonStar className="h-4 w-4" />
            <span>A sanctuary for your thoughts</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
            Turn your emotions into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-pulse-glow">living art</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Mindvisi is a quiet place where your raw thoughts, anger, sadness, and love are transformed into personalized visual landscapes and tailored well-being recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] group" data-testid="btn-home-cta-start">
                Begin Reflection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl mx-auto"
        >
          <div className="p-8 rounded-2xl bg-card/40 backdrop-blur-md border border-card-border/50 text-left hover:bg-card/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Visual Alchemy</h3>
            <p className="text-muted-foreground">Watch your words materialize into beautiful, glowing cosmic visuals that capture the exact essence of your mood.</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-card/40 backdrop-blur-md border border-card-border/50 text-left hover:bg-card/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-6 border border-accent/30">
              <Brain className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Deep Understanding</h3>
            <p className="text-muted-foreground">Our empathetic AI analyzes your emotional state to provide a compassionate mirror to your inner world.</p>
          </div>
          
          <div className="p-8 rounded-2xl bg-card/40 backdrop-blur-md border border-card-border/50 text-left hover:bg-card/60 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30">
              <HeartPulse className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Guided Healing</h3>
            <p className="text-muted-foreground">Receive personalized recommendations for books, meditation, and practices aligned with what you need most today.</p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50 relative z-10 text-center flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Mindvisi. All rights reserved.</p>
        <Link href="/privacy">
          <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-home-privacy">Privacy Policy</span>
        </Link>
      </footer>
    </div>
  );
}