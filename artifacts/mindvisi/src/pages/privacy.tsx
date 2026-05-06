import { Link } from "wouter";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
      
      <header className="container mx-auto px-4 py-6 flex items-center justify-between border-b border-border/50">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-foreground">Mindvisi</span>
          </div>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground" data-testid="btn-privacy-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </header>

      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <div className="prose prose-invert prose-purple max-w-none">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Your Sanctuary, Protected</h2>
            <p className="text-muted-foreground leading-relaxed">
              At Mindvisi, we understand that emotional expression requires vulnerability. We treat your personal thoughts, emotions, and generated reflections with the utmost care and respect. This Privacy Policy explains how we collect, use, and safeguard your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To provide you with a personalized experience, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> Name, email address, and phone number (if provided during sign-up) via our secure authentication provider (Clerk).</li>
              <li><strong>Emotional Data:</strong> The text reflections you submit, the mood labels derived from them, and the resulting AI-generated visuals and recommendations.</li>
              <li><strong>Usage Data:</strong> Basic interaction metrics like streak counts and reflection frequency to build your personal dashboard.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To generate personalized cosmic visuals reflecting your emotional state.</li>
              <li>To provide tailored well-being recommendations (books, yoga, meditation).</li>
              <li>To maintain your private history gallery and compute your dashboard statistics.</li>
              <li>To securely authenticate your access to your sanctuary.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. AI Processing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your text entries are processed by AI models to determine mood, generate images, and curate recommendations. These entries are used strictly in real-time to generate your specific reflection and are not used by Mindvisi to train generalized AI models. We rely on established APIs (like OpenAI) which adhere to strict data privacy agreements ensuring API data is not used for training.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Sharing and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your reflections belong to you. We do not sell, rent, or trade your personal or emotional data to third parties. We implement industry-standard encryption and security measures to protect your data in transit and at rest.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, modify, or permanently delete your account and all associated reflections at any time. If you wish to exercise these rights, you may do so through your account settings or by contacting our support team.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}