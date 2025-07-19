import { useToast } from "@/hooks/use-toast";
import { type MoodboardResponse } from "@shared/schema";
import html2canvas from "html2canvas";

interface MoodboardDisplayProps {
  moodboard: MoodboardResponse;
  onCreateNew: () => void;
}

export default function MoodboardDisplay({ moodboard, onCreateNew }: MoodboardDisplayProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const element = document.getElementById("moodboard-content");
      if (!element) {
        toast({
          title: "Download Failed",
          description: "Could not find moodboard content to download.",
          variant: "destructive",
        });
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: "#f8fafc",
        scale: 2,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `moodboard-${moodboard.mood.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "Downloaded!",
        description: "Your moodboard has been saved to your device.",
      });
    } catch (error) {
      console.error("Error downloading moodboard:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading your moodboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/share/${moodboard.shareId}`;
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy link to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyPalette = async () => {
    try {
      const paletteText = moodboard.colors.join(", ");
      await navigator.clipboard.writeText(paletteText);
      toast({
        title: "Palette Copied!",
        description: "Color palette has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Error copying palette:", error);
      toast({
        title: "Copy Failed",
        description: "Could not copy color palette. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="animate-slide-up">
      {/* Mood Title & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1 capitalize">
            Feeling {moodboard.mood} ✨
          </h3>
          <p className="text-slate-600">Generated on {formatDate(moodboard.createdAt)}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button 
            onClick={onCreateNew}
            className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <i className="fas fa-plus"></i>
            <span>New</span>
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <i className="fas fa-download"></i>
            <span>Download</span>
          </button>
          <button 
            onClick={handleShare}
            className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          >
            <i className="fas fa-share-alt"></i>
            <span>Share</span>
          </button>
        </div>
      </div>

      <div id="moodboard-content" className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Images & Quote */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Grid */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <i className="fas fa-images text-brand-500 mr-2"></i>
              Visual Inspiration
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {moodboard.images.map((image, index) => (
                <div key={index} className="relative group overflow-hidden rounded-xl">
                  <img 
                    src={image}
                    alt={`Mood inspiration ${index + 1}`} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Quote Section */}
          <div className="bg-gradient-to-br from-brand-500/10 to-accent-500/10 backdrop-blur-sm rounded-2xl p-8 border border-brand-200/40">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-quote-left text-white"></i>
              </div>
              <div>
                <blockquote className="text-xl font-medium text-slate-900 leading-relaxed mb-3">
                  "{moodboard.quote}"
                </blockquote>
                <p className="text-sm text-slate-600">
                  <i className="fas fa-robot mr-1"></i>
                  Generated by AI for your mood
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Color Palette & Spotify */}
        <div className="space-y-6">
          {/* Color Palette */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <i className="fas fa-palette text-brand-500 mr-2"></i>
              Your Mood Colors
            </h4>
            <div className="space-y-3">
              {moodboard.colors.map((color, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-xl shadow-md" 
                    style={{ backgroundColor: color }}
                  ></div>
                  <div>
                    <p className="font-medium text-slate-900">{color}</p>
                    <p className="text-sm text-slate-500">Color {index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={handleCopyPalette}
              className="mt-4 w-full py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg transition-colors"
            >
              Copy Palette
            </button>
          </div>

          {/* Spotify Embed */}
          {moodboard.spotifyPlaylistId && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <i className="fab fa-spotify text-green-500 mr-2"></i>
                Mood Soundtrack
              </h4>
              <div className="bg-black rounded-xl overflow-hidden">
                <iframe 
                  src={`https://open.spotify.com/embed/playlist/${moodboard.spotifyPlaylistId}?utm_source=generator&theme=0`}
                  width="100%" 
                  height="352" 
                  frameBorder="0" 
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                  loading="lazy"
                  className="rounded-xl"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 text-center">
                Curated playlist matching your {moodboard.mood} mood
              </p>
            </div>
          )}

          {/* Stats Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl p-6">
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <i className="fas fa-chart-line text-accent-500 mr-2"></i>
              Vibe Stats
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Images Found</span>
                <span className="font-bold">{moodboard.images.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Colors Generated</span>
                <span className="font-bold">{moodboard.colors.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Inspiration Level</span>
                <span className="font-bold text-accent-500">95%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
