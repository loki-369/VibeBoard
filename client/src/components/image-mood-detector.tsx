import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type AnalyzeMoodFromImageRequest, type AnalyzeMoodResponse } from "@shared/schema";

interface ImageMoodDetectorProps {
  onMoodDetected: (mood: string) => void;
  disabled?: boolean;
}

export default function ImageMoodDetector({ onMoodDetected, disabled }: ImageMoodDetectorProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const analyzeMood = useMutation({
    mutationFn: async (data: AnalyzeMoodFromImageRequest) => {
      const response = await apiRequest("POST", "/api/analyze-mood", data);
      return response.json() as Promise<AnalyzeMoodResponse>;
    },
    onSuccess: (result) => {
      onMoodDetected(result.mood);
      toast({
        title: "Mood Detected!",
        description: `I can see you're feeling ${result.mood}. Let me create your moodboard!`,
      });
      setPreview(null);
    },
    onError: (error) => {
      console.error("Error analyzing mood:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze your mood from the image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (JPG, PNG, or WebP).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Convert to base64 and analyze
      const base64Data = await convertToBase64(file);
      analyzeMood.mutate({ image: base64Data });
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
          dragActive
            ? "border-brand-500 bg-brand-50"
            : "border-slate-300 hover:border-brand-400 hover:bg-slate-50"
        } ${disabled || analyzeMood.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled && !analyzeMood.isPending ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || analyzeMood.isPending}
        />

        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Uploaded for mood analysis" 
              className="w-20 h-20 object-cover rounded-xl mx-auto"
            />
            {analyzeMood.isPending ? (
              <div className="space-y-2">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full mx-auto animate-pulse"></div>
                <p className="text-sm text-slate-600">Analyzing your mood...</p>
              </div>
            ) : (
              <p className="text-sm text-slate-600">Image uploaded successfully!</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center mx-auto">
              <i className="fas fa-camera text-white text-2xl"></i>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Upload Your Photo</h4>
              <p className="text-sm text-slate-600 mb-2">
                Let AI detect your mood from your photo
              </p>
              <p className="text-xs text-slate-500">
                Drop an image here or click to browse
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 text-center mt-3">
        Supports JPG, PNG, WebP • Max 5MB
      </p>
    </div>
  );
}