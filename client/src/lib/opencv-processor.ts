// OpenCV.js image processing utilities for mood detection
declare global {
  interface Window {
    cv: any;
    cvReady: boolean;
  }
}

export interface FaceAnalysis {
  faceDetected: boolean;
  faceCount: number;
  avgBrightness: number;
  dominantColors: string[];
  edgeIntensity: number;
  contrast: number;
}

export class OpenCVProcessor {
  private isReady(): boolean {
    return typeof window !== 'undefined' && window.cvReady && window.cv;
  }

  /**
   * Analyze facial features and image properties for mood detection
   */
  async analyzeFacialFeatures(imageElement: HTMLImageElement): Promise<FaceAnalysis> {
    if (!this.isReady()) {
      return this.fallbackAnalysis(imageElement);
    }

    try {
      const cv = window.cv;
      
      // Create OpenCV mat from image
      const src = cv.imread(imageElement);
      const gray = new cv.Mat();
      
      // Convert to grayscale for face detection
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
      
      // Face detection using Haar Cascades (basic implementation)
      const faces = new cv.RectVector();
      const faceCascade = new cv.CascadeClassifier();
      
      // Note: In a full implementation, you'd load a pre-trained classifier
      // For this demo, we'll use basic image analysis
      
      const analysis = await this.performImageAnalysis(src, gray);
      
      // Cleanup
      src.delete();
      gray.delete();
      faces.delete();
      
      return analysis;
    } catch (error) {
      console.warn('OpenCV analysis failed, using fallback:', error);
      return this.fallbackAnalysis(imageElement);
    }
  }

  private async performImageAnalysis(src: any, gray: any): Promise<FaceAnalysis> {
    const cv = window.cv;
    
    // Calculate average brightness
    const mean = cv.mean(gray);
    const avgBrightness = mean[0];
    
    // Calculate contrast using standard deviation
    const meanMat = new cv.Mat();
    const stdMat = new cv.Mat();
    cv.meanStdDev(gray, meanMat, stdMat);
    const contrast = stdMat.doubleAt(0, 0);
    
    // Edge detection for analyzing image sharpness/emotion intensity
    const edges = new cv.Mat();
    cv.Canny(gray, edges, 50, 150, 3, false);
    const edgePixels = cv.countNonZero(edges);
    const totalPixels = edges.rows * edges.cols;
    const edgeIntensity = edgePixels / totalPixels;
    
    // Color analysis for mood indicators
    const dominantColors = this.extractDominantColors(src);
    
    // Cleanup
    meanMat.delete();
    stdMat.delete();
    edges.delete();
    
    return {
      faceDetected: true, // Simplified for demo
      faceCount: 1,
      avgBrightness,
      dominantColors,
      edgeIntensity,
      contrast
    };
  }

  private extractDominantColors(src: any): string[] {
    // Simplified color extraction
    // In a full implementation, you'd use K-means clustering
    const colors = ['#808080', '#A0A0A0', '#606060']; // Placeholder
    return colors;
  }

  private fallbackAnalysis(imageElement: HTMLImageElement): FaceAnalysis {
    // Basic canvas-based analysis when OpenCV is not available
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return this.getDefaultAnalysis();
    }
    
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    ctx.drawImage(imageElement, 0, 0);
    
    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let totalBrightness = 0;
      let totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Calculate perceived brightness
        totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
      }
      
      const avgBrightness = totalBrightness / totalPixels;
      
      return {
        faceDetected: true,
        faceCount: 1,
        avgBrightness,
        dominantColors: ['#808080', '#A0A0A0'],
        edgeIntensity: 0.3,
        contrast: avgBrightness > 128 ? 0.7 : 0.4
      };
    } catch (error) {
      console.warn('Fallback analysis failed:', error);
      return this.getDefaultAnalysis();
    }
  }

  private getDefaultAnalysis(): FaceAnalysis {
    return {
      faceDetected: false,
      faceCount: 0,
      avgBrightness: 128,
      dominantColors: ['#808080'],
      edgeIntensity: 0.3,
      contrast: 0.5
    };
  }

  /**
   * Enhance mood detection by combining image analysis with AI
   */
  getMoodFromAnalysis(analysis: FaceAnalysis): string {
    // Use image analysis to bias mood detection
    const { avgBrightness, contrast, edgeIntensity } = analysis;
    
    // Bright images with high contrast suggest positive moods
    if (avgBrightness > 150 && contrast > 0.6) {
      return 'happy';
    }
    
    // Dark images with low contrast suggest contemplative moods
    if (avgBrightness < 80 && contrast < 0.4) {
      return 'peaceful';
    }
    
    // High edge intensity suggests energy/excitement
    if (edgeIntensity > 0.4) {
      return 'excited';
    }
    
    // Medium values suggest balanced moods
    if (avgBrightness >= 100 && avgBrightness <= 150) {
      return 'motivated';
    }
    
    return 'peaceful'; // Default fallback
  }

  /**
   * Prepare image for optimal AI analysis
   */
  async preprocessImageForAI(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = async () => {
        try {
          // Enhanced preprocessing with OpenCV if available
          let processedCanvas = canvas;
          
          if (this.isReady()) {
            processedCanvas = await this.enhanceImageWithOpenCV(img, canvas, ctx!);
          } else {
            // Basic preprocessing
            const maxSize = 800;
            let { width, height } = img;
            
            if (width > height && width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx!.drawImage(img, 0, 0, width, height);
          }
          
          // Convert to base64 with optimal compression
          const base64 = processedCanvas.toDataURL('image/jpeg', 0.8);
          const base64Data = base64.split(',')[1];
          
          resolve(base64Data);
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = (error) => reject(error);
      img.src = URL.createObjectURL(file);
    });
  }

  private async enhanceImageWithOpenCV(img: HTMLImageElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<HTMLCanvasElement> {
    if (!this.isReady()) return canvas;

    try {
      const cv = window.cv;
      
      // Resize image
      const maxSize = 800;
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      // Apply OpenCV enhancements
      const src = cv.imread(canvas);
      const enhanced = new cv.Mat();
      
      // Enhance contrast and brightness for better AI analysis
      src.convertTo(enhanced, -1, 1.1, 10); // alpha=1.1 (contrast), beta=10 (brightness)
      
      // Apply slight blur to reduce noise
      const blurred = new cv.Mat();
      const ksize = new cv.Size(3, 3);
      cv.GaussianBlur(enhanced, blurred, ksize, 0.5);
      
      // Write back to canvas
      cv.imshow(canvas, blurred);
      
      // Cleanup
      src.delete();
      enhanced.delete();
      blurred.delete();
      
      return canvas;
    } catch (error) {
      console.warn('OpenCV enhancement failed, using basic processing:', error);
      return canvas;
    }
  }
}

export const opencvProcessor = new OpenCVProcessor();