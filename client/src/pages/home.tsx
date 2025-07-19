import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MoodInput from "@/components/mood-input";
import MoodboardDisplay from "@/components/moodboard-display";
import LoadingState from "@/components/loading-state";
import { type MoodboardResponse } from "@shared/schema";

export default function Home() {
  const { shareId } = useParams();
  const [generatedMoodboard, setGeneratedMoodboard] = useState<MoodboardResponse | null>(null);

  // If we have a shareId, fetch the shared moodboard
  const { data: sharedMoodboard, isLoading: isLoadingShared, error: sharedError } = useQuery({
    queryKey: ["/api/moodboards", shareId],
    enabled: !!shareId,
  });

  const currentMoodboard = sharedMoodboard || generatedMoodboard;
  const isLoading = isLoadingShared;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
                <i className="fas fa-palette text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">VibeBoard AI</h1>
                <p className="text-xs text-slate-500">Your Mood, Visualized</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900 transition-colors">
                <i className="fas fa-question-circle text-lg"></i>
              </button>
              {currentMoodboard && (
                <button 
                  onClick={() => {
                    const url = `${window.location.origin}/share/${currentMoodboard.shareId}`;
                    navigator.clipboard.writeText(url);
                  }}
                  className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Share
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!currentMoodboard && !isLoading && (
          <MoodInput onMoodboardGenerated={setGeneratedMoodboard} />
        )}

        {isLoading && <LoadingState />}

        {sharedError && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Moodboard not found</h3>
            <p className="text-slate-600 mb-6">The shared moodboard you're looking for doesn't exist or has been removed.</p>
            <button 
              onClick={() => window.location.href = "/"}
              className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Create New Moodboard
            </button>
          </div>
        )}

        {currentMoodboard && !isLoading && (
          <MoodboardDisplay 
            moodboard={currentMoodboard} 
            onCreateNew={() => {
              setGeneratedMoodboard(null);
              window.history.pushState({}, "", "/");
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-white/40 backdrop-blur-sm border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <i className="fas fa-palette text-white text-lg"></i>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">VibeBoard AI</h4>
                  <p className="text-sm text-slate-500">Your Mood, Visualized</p>
                </div>
              </div>
              <p className="text-slate-600 mb-4 max-w-md">Transform your emotions into beautiful, shareable visual experiences powered by AI and creativity.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fab fa-instagram text-xl"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fab fa-github text-xl"></i>
                </a>
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 mb-4">Features</h5>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Mood Analysis</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">AI Quotes</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Color Palettes</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Music Integration</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-slate-900 mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center">
            <p className="text-sm text-slate-500">© 2024 VibeBoard AI. Made with ❤️ for creative expression.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
