'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Code, GitBranch, Users, Clock, Share2, Terminal, GitCommit, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/apiClient';
import type { User } from '@supabase/supabase-js';

const features = [
  {
    icon: <Users className="h-6 w-6" />,
    title: "Real-time Collaboration",
    description: "Code together with your team in real-time with live cursor positions and instant updates"
  },
  {
    icon: <GitBranch className="h-6 w-6" />,
    title: "Git Integration",
    description: "Full Git version control with commits, branches, and pull requests"
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Code History",
    description: "Track every change with detailed version history and time-travel debugging"
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Live Sharing",
    description: "Share your workspace with a single click for instant collaboration"
  },
  {
    icon: <Terminal className="h-6 w-6" />,
    title: "Built-in Terminal",
    description: "Run commands and scripts without leaving your workspace"
  },
  {
    icon: <GitCommit className="h-6 w-6" />,
    title: "Commit Together",
    description: "Collaborative commits with multi-author support"
  }
];

const LandingPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section */}
      <div className="container pt-32 pb-20">
        {/* Content */}
        <div className="max-w-[800px] mx-auto text-center space-y-8 mb-20">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Code Together in
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                Real-Time
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              CoLab Editor combines the power of GitHub with real-time collaborative editing for seamless team coding.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/projects" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild>
                  <Link href="/create-account" className="gap-2">
                    Start Coding Free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-primary/10">
                  {React.cloneElement(feature.icon, { className: "h-5 w-5 text-primary" })}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* App Screenshot with Code Example */}
        <div className="relative w-full max-w-[1200px] mx-auto mt-20">
          <div className="relative bg-background/95 backdrop-blur rounded-lg shadow-2xl border overflow-hidden">
            <Image
              src={
                resolvedTheme === 'dark'
                  ? '/colab-editor-dark.png'
                  : '/colab-editor-light.png'
              }
              alt="CoLab Editor interface showing real-time collaboration"
              width={1824}
              height={1080}
              className="w-full"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background"></div>
          </div>
        </div>

        {/* Collaboration Demo Section */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold mb-6">How Teams Use CoLab Editor</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Code className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Pair Programming</h3>
              <p className="text-muted-foreground">
                Work on the same file simultaneously with live cursor tracking
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <GitBranch className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Code Reviews</h3>
              <p className="text-muted-foreground">
                Discuss and review code together in real-time
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-primary/10 p-4 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Team Onboarding</h3>
              <p className="text-muted-foreground">
                Guide new team members through codebases interactively
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary/5 py-20">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-8">
            Join thousands of developers collaborating on CoLab Editor every day.
          </p>
          <Button size="lg" asChild>
            <Link href={user ? "/projects" : "/create-account"} className="gap-2">
              {user ? "Open Editor" : "Get Started Free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Background Gradient Effect */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-primary/5 to-background"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[40rem] w-[40rem] rounded-full bg-primary/5 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;