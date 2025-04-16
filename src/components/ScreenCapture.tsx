
import React, { useState, useRef, useEffect } from "react";
import { Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { isChromeExtension, hasCapturePermission, requestCapturePermission } from "@/utils/captureUtils";

interface ScreenCaptureProps {
  onCapturedText: (text: string) => void;
  onCapturedImage?: (imageData: string) => void;
}

const ScreenCapture: React.FC<ScreenCaptureProps> = ({ 
  onCapturedText, 
  onCapturedImage 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Set up keyboard shortcut (Alt+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "s") {
        startCapture();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Setup message listener for content script communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.action === 'captured_image' && event.data.imageData) {
        processImage(event.data.imageData);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const processImage = (imageData: string) => {
    // Make sure we have the image data
    if (!imageData) {
      toast({
        title: "Capture Failed",
        description: "Failed to process the captured image.",
        variant: "destructive"
      });
      return;
    }

    // Send to both text and image handlers
    if (onCapturedImage) {
      onCapturedImage(imageData);
    }
    
    // For real OCR, we would use an OCR service here
    // For now, we'll use placeholder text
    const text = `[OCR Text from screenshot]
    
This text was extracted from the selected area of your screen.
The screenshot has been successfully captured and added to the chat.

For real OCR processing, this extension would need to integrate with an OCR service like:
- Google Cloud Vision API
- Tesseract.js (browser-based OCR)
- OpenAI's Vision models`;
    
    onCapturedText(text, imageData);
    
    toast({
      title: "Screenshot Captured",
      description: "Screenshot added to chat",
    });

    // Reset state
    setIsCapturing(false);
  };

  const startCapture = async () => {
    // Check if we're running as a Chrome extension
    if (isChromeExtension()) {
      // For Chrome extension, we need to request permissions
      const hasPermission = await hasCapturePermission();
      if (!hasPermission) {
        const granted = await requestCapturePermission();
        if (!granted) {
          toast({
            title: "Permission Denied",
            description: "Permission to capture screen is required.",
            variant: "destructive"
          });
          return;
        }
      }
    }

    // In Chrome extension environment, use chrome.tabs API 
    if (isChromeExtension() && window.chrome?.tabs) {
      setIsCapturing(true);
      
      toast({
        title: "Screen Capture Started",
        description: "Click and drag to select any area of the screen to scan. Press ESC to cancel.",
      });
      
      try {
        window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            // Check if sendMessage is available on the tabs API
            if ('sendMessage' in window.chrome.tabs) {
              window.chrome.tabs.sendMessage(
                tabs[0].id,
                { action: 'start_screen_capture' }
              );
            } else {
              console.warn("tabs.sendMessage is not available in this browser");
              fallbackSimulatedCapture(0, 0, 300, 200);
            }
          }
        });
      } catch (error) {
        console.error("Error sending message to content script:", error);
        fallbackSimulatedCapture(0, 0, 300, 200);
      }
    } else {
      // Fallback for development environment
      fallbackSimulatedCapture(0, 0, 300, 200);
    }
  };

  const cancelCapture = () => {
    setIsCapturing(false);

    // Notify content script if in extension
    if (isChromeExtension() && window.chrome?.tabs) {
      try {
        window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            // Check if sendMessage is available on the tabs API
            if ('sendMessage' in window.chrome.tabs) {
              window.chrome.tabs.sendMessage(
                tabs[0].id,
                { action: 'cancel_screen_capture' }
              );
            } else {
              console.warn("tabs.sendMessage is not available in this browser");
            }
          }
        });
      } catch (error) {
        console.error("Error sending message to content script:", error);
      }
    }
  };

  // Fallback function for development or when permissions are not available
  const fallbackSimulatedCapture = (captureLeft: number, captureTop: number, captureWidth: number, captureHeight: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = captureWidth;
    canvas.height = captureHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Create a colored rectangle to represent a captured area
    ctx.fillStyle = "#f0f4f8";
    ctx.fillRect(0, 0, captureWidth, captureHeight);
    
    // Add some text to make it look like content
    ctx.font = "14px Arial";
    ctx.fillStyle = "#000";
    ctx.fillText("Captured Area (Fallback Mode)", 10, 30);
    ctx.fillText(`Size: ${captureWidth}x${captureHeight}`, 10, 50);
    ctx.fillText(`Position: (${captureLeft}, ${captureTop})`, 10, 70);
    ctx.fillText("Chrome API unavailable - using simulated capture", 10, 100);
    
    // Draw some shapes to simulate content
    ctx.strokeStyle = "#1E88E5"; // Blue now instead of previous color
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 120, captureWidth - 30, captureHeight / 3);
    ctx.fillStyle = "#1E88E533"; // Semi-transparent blue
    ctx.fillRect(15, 120, captureWidth - 30, captureHeight / 3);
    
    // Get image data
    const imageData = canvas.toDataURL('image/png');
    
    // Send to both text and image handlers
    if (onCapturedImage) {
      onCapturedImage(imageData);
    }
    
    // Generate simulated OCR text
    const text = processSimulatedCapture(captureLeft, captureTop, captureWidth, captureHeight);
    onCapturedText(text, imageData);
    
    toast({
      title: "Simulated Capture",
      description: "Chrome API unavailable - using simulated capture",
      variant: "destructive"
    });
    
    setIsCapturing(false);
  };

  const processSimulatedCapture = (captureLeft: number, captureTop: number, captureWidth: number, captureHeight: number): string => {
    return `[Simulated OCR Result - Chrome API unavailable]
    
This is fallback content because:
1. You might be in development mode (not running as an extension)
2. The extension might not have the required permissions
3. There might be an error with the Chrome API

To enable actual screenshots in the Chrome extension:
- Ensure "activeTab" permission is in manifest.json
- Run as an actual Chrome extension

Selected area: (${captureLeft},${captureTop}) with size ${captureWidth}x${captureHeight}`;
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={startCapture}
        className="h-9 w-9 rounded-full"
        title="Scan Screen (Alt+S)"
        disabled={isCapturing}
      >
        <Scan className="h-4 w-4" />
      </Button>
      
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
};

export default ScreenCapture;
