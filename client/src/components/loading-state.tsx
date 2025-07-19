export default function LoadingState() {
  return (
    <div className="text-center py-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full mb-6 animate-pulse-slow">
        <i className="fas fa-magic text-white text-xl"></i>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">Creating your vibe...</h3>
      <p className="text-slate-600">Gathering images, colors, and inspiration just for you</p>
      <div className="mt-8 max-w-md mx-auto">
        <div className="flex items-center space-x-2 text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <i className="fas fa-images text-brand-500"></i>
            <span>Finding images</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <i className="fas fa-quote-left text-accent-500"></i>
            <span>Generating quote</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <i className="fas fa-palette text-purple-500"></i>
            <span>Mixing colors</span>
          </div>
        </div>
      </div>
    </div>
  );
}
