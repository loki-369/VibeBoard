import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type AnalyzeMoodFromImageRequest, type AnalyzeMoodResponse } from "@shared/schema";
import { opencvProcessor, type FaceAnalysis } from "@/lib/opencv-processor";

interface ImageMoodDetectorProps {
  onMoodDetected: (mood: string) => void;
  disabled?: boolean;
}

export default function ImageMoodDetector({ onMoodDetected, disabled }: ImageMoodDetectorProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [cvInsights, setCvInsights] = useState<FaceAnalysis | null>(null);
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
    onError: (error: any) => {
      console.error("Error analyzing mood:", error);
      let errorMessage = "Failed to analyze your mood from the image. Please try again.";
      
      if (error?.message?.includes("request entity too large")) {
        errorMessage = "Image is too large. Please try a smaller image or let us compress it automatically.";
      } else if (error?.message?.includes("413")) {
        errorMessage = "Image file is too large. Please try a smaller image.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const convertToBase64 = async (file: File): Promise<string> => {
    try {
      // Use OpenCV processor for enhanced image preprocessing
      const base64Data = await opencvProcessor.preprocessImageForAI(file);
      
      // Additional check for final size
      if (base64Data.length > 5 * 1024 * 1024) { // 5MB base64 limit
        throw new Error("Image is still too large after compression. Please try a smaller image.");
      }
      
      return base64Data;
    } catch (error) {
      throw error;
    }
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

    if (file.size > 2 * 1024 * 1024) { // 2MB limit (will be compressed further)
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Show preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Perform OpenCV analysis for enhanced mood detection
      setIsAnalyzing(true);
      const img = new Image();
      img.onload = async () => {
        try {
          // Analyze facial features with OpenCV
          const analysis = await opencvProcessor.analyzeFacialFeatures(img);
          setCvInsights(analysis);
          console.log('OpenCV Analysis:', analysis);
          
          // Get preliminary mood from computer vision
          const cvMood = opencvProcessor.getMoodFromAnalysis(analysis);
          
          // Convert to base64 and send for AI analysis with CV insights
          const base64Data = await convertToBase64(file);
          analyzeMood.mutate({ 
            image: base64Data,
            cvAnalysis: {
              avgBrightness: analysis.avgBrightness,
              contrast: analysis.contrast,
              edgeIntensity: analysis.edgeIntensity,
              faceDetected: analysis.faceDetected,
            }
          });
          
          // Show additional insights to user
          if (analysis.faceDetected) {
            toast({
              title: "Face Detected!",
              description: `Computer vision suggests: ${cvMood}. Analyzing with AI for best results...`,
            });
          }
        } catch (error) {
          console.warn('OpenCV analysis failed, proceeding with AI only:', error);
          const base64Data = await convertToBase64(file);
          analyzeMood.mutate({ image: base64Data });
        } finally {
          setIsAnalyzing(false);
        }
      };
      img.src = previewUrl;
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
        Supports JPG, PNG, WebP • Max 2MB • Images auto-resized for optimal processing
      </p>
    </div>
  );
}