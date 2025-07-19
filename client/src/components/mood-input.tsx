import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type MoodboardResponse, type GenerateMoodboardRequest } from "@shared/schema";
import ImageMoodDetector from "./image-mood-detector";

interface MoodInputProps {
  onMoodboardGenerated: (moodboard: MoodboardResponse) => void;
}

const suggestedMoods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "🧘", label: "Peaceful" },
  { emoji: "🚀", label: "Motivated" },
  { emoji: "💭", label: "Dreamy" },
];

export default function MoodInput({ onMoodboardGenerated }: MoodInputProps) {
  const [moodInput, setMoodInput] = useState("");
  const [inputMethod, setInputMethod] = useState<"text" | "image">("text");
  const { toast } = useToast();

  const generateMoodboard = useMutation({
    mutationFn: async (data: GenerateMoodboardRequest) => {
      const response = await apiRequest("POST", "/api/moodboards", data);
      return response.json() as Promise<MoodboardResponse>;
    },
    onSuccess: (moodboard) => {
      onMoodboardGenerated(moodboard);
      toast({
        title: "Moodboard Generated!",
        description: "Your personalized moodboard is ready.",
      });
    },
    onError: (error) => {
      console.error("Error generating moodboard:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate moodboard. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (mood: string) => {
    if (!mood.trim()) {
      toast({
        title: "Mood Required",
        description: "Please enter how you're feeling to generate your moodboard.",
        variant: "destructive",
      });
      return;
    }

    generateMoodboard.mutate({ mood: mood.trim() });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(moodInput);
  };

  const handleSuggestionClick = (mood: string) => {
    setMoodInput(mood);
    setInputMethod("text"); // Switch to text mode when suggestion is clicked
    handleSubmit(mood);
  };

  const handleMoodDetected = (detectedMood: string) => {
    setMoodInput(detectedMood);
    handleSubmit(detectedMood);
  };

  return (
    <section className="text-center mb-12">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-tight">
          How are you <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">feeling</span> today?
        </h2>
        <p className="text-lg text-slate-600 mb-8">Express your emotions through text or let AI detect your mood from a photo</p>
        
        {/* Input Method Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-full p-1 border border-white/40">
            <button
              onClick={() => setInputMethod("text")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                inputMethod === "text"
                  ? "bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <i className="fas fa-keyboard mr-2"></i>
              Type Mood
            </button>
            <button
              onClick={() => setInputMethod("image")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                inputMethod === "image"
                  ? "bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <i className="fas fa-camera mr-2"></i>
              Upload Photo
            </button>
          </div>
        </div>

        {inputMethod === "text" ? (
          <form onSubmit={handleFormSubmit} className="relative max-w-md mx-auto mb-6">
            <input 
              type="text" 
              placeholder="e.g. excited, peaceful, nostalgic..."
              value={moodInput}
              onChange={(e) => setMoodInput(e.target.value)}
              disabled={generateMoodboard.isPending}
              className="w-full px-6 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-brand-500 focus:outline-none transition-colors bg-white/80 backdrop-blur-sm disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={generateMoodboard.isPending || !moodInput.trim()}
              className="absolute right-2 top-2 bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {generateMoodboard.isPending ? (
                <span className="flex items-center space-x-2">
                  <i className="fas fa-spinner animate-spin"></i>
                  <span>Generating...</span>
                </span>
              ) : (
                "Generate ✨"
              )}
            </button>
          </form>
        ) : (
          <div className="mb-6">
            <ImageMoodDetector 
              onMoodDetected={handleMoodDetected}
              disabled={generateMoodboard.isPending}
            />
          </div>
        )}

        {/* Suggested Moods - always visible */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-3">Or try these popular moods:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedMoods.map((mood) => (
              <button 
                key={mood.label}
                onClick={() => handleSuggestionClick(mood.label)}
                disabled={generateMoodboard.isPending}
                className="px-4 py-2 bg-white/60 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-full text-sm font-medium transition-colors border border-white/40"
              >
                {mood.emoji} {mood.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
