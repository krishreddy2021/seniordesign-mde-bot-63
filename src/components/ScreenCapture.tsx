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
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectionRef = useRef<HTMLDivElement>(null);

  // Set up keyboard shortcut (Alt+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "s") {
        startCapture();
      }
      
      // Escape key to cancel capture
      if (e.key === "Escape" && isCapturing) {
        cancelCapture();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCapturing]);

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

    // In Chrome extension environment, use chrome.tabs API to focus the webpage tab first
    if (isChromeExtension() && window.chrome?.tabs) {
      window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          // Focus the active tab to ensure the capture works on the main content
          window.chrome.tabs.update(tabs[0].id, { active: true }, () => {
            // Now initialize the capture UI
            initCapture();
          });
        } else {
          // Fall back to regular capture if tab info is unavailable
          initCapture();
        }
      });
    } else {
      // Not in Chrome extension or tabs API unavailable
      initCapture();
    }
  };

  const initCapture = () => {
    setIsCapturing(true);
    setStartPoint(null);
    toast({
      title: "Screen Capture Started",
      description: "Click and drag to select any area of the screen to scan. Press ESC to cancel.",
    });
    
    // If in extension context, attempt to message the content script
    if (isChromeExtension() && window.chrome?.tabs) {
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
            }
          }
        });
      } catch (error) {
        console.error("Error sending message to content script:", error);
      }
    }
  };

  const cancelCapture = () => {
    setIsCapturing(false);
    setStartPoint(null);
    if (selectionRef.current) {
      selectionRef.current.style.display = "none";
    }

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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCapturing) return;
    
    setStartPoint({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCapturing || !startPoint || !selectionRef.current) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    // Calculate dimensions
    const left = Math.min(startPoint.x, currentX);
    const top = Math.min(startPoint.y, currentY);
    const width = Math.abs(currentX - startPoint.x);
    const height = Math.abs(currentY - startPoint.y);
    
    // Update selection div
    const selection = selectionRef.current;
    selection.style.display = "block";
    selection.style.left = `${left}px`;
    selection.style.top = `${top}px`;
    selection.style.width = `${width}px`;
    selection.style.height = `${height}px`;
  };

  const handleMouseUp = async (e: React.MouseEvent) => {
    if (!isCapturing || !startPoint || !selectionRef.current) return;
    
    try {
      const endPoint = {
        x: e.clientX,
        y: e.clientY
      };
      
      // Calculate dimensions
      const left = Math.min(startPoint.x, endPoint.x);
      const top = Math.min(startPoint.y, endPoint.y);
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      
      if (width < 10 || height < 10) {
        toast({
          title: "Selection too small",
          description: "Please select a larger area to scan.",
          variant: "destructive"
        });
        cancelCapture();
        return;
      }

      // Attempt to capture screenshot
      toast({
        title: "Area Selected",
        description: "Capturing screenshot...",
      });
      
      // Use Chrome extension API for actual screenshot
      try {
        // In a Chrome extension environment
        if (isChromeExtension() && window.chrome?.tabs?.captureVisibleTab) {
          // Use null for windowId to capture from current window
          window.chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            if (window.chrome?.runtime?.lastError) {
              console.error('Chrome API error:', window.chrome.runtime.lastError);
              throw new Error(`Screenshot capture failed: ${window.chrome.runtime.lastError.message}`);
            }

            // Create an image from the capture
            const img = new Image();
            img.onload = () => {
              const canvas = canvasRef.current;
              if (!canvas) {
                throw new Error("Canvas not available");
              }
              
              canvas.width = width;
              canvas.height = height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                throw new Error("Canvas context not available");
              }
              
              // Crop the image to the selected area
              ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
              
              // Get the cropped image data
              const imageData = canvas.toDataURL('image/png');
              
              // Send to both text and image handlers
              if (onCapturedImage) {
                onCapturedImage(imageData);
              }
              
              // For real OCR, we would use an OCR service here
              // For now, we'll use placeholder text
              const text = `[OCR Text from screenshot]
              
This text was extracted from a real screenshot of the selected area:
Position: (${left},${top}), Size: ${width}x${height}

For real OCR processing, this extension would need to integrate with an OCR service like:
- Chrome's built-in OCR (for PDF files)
- Google Cloud Vision API
- Tesseract.js (browser-based OCR)
- OpenAI's Vision models

The screenshot has been successfully captured and added to the chat.`;
              
              onCapturedText(text);
              
              toast({
                title: "Screenshot Captured",
                description: "Screenshot added to chat",
              });
            };
            
            img.onerror = (error) => {
              console.error('Image loading error:', error);
              throw new Error('Failed to load captured screenshot');
            };
            
            img.src = dataUrl;
          });
        } else {
          // Fallback for development environment or when Chrome API is unavailable
          throw new Error("Chrome screenshot API not available");
        }
      } catch (error) {
        console.error("Screenshot capture error:", error);
        // Fallback to simulated approach
        const captureLeft = left;
        const captureTop = top;
        const captureWidth = width;
        const captureHeight = height;
        fallbackSimulatedCapture(captureLeft, captureTop, captureWidth, captureHeight);
      }
    } catch (error) {
      console.error("Error during screen capture:", error);
      // Make sure we have local variables defined for the fallback
      if (startPoint && selectionRef.current) {
        const endPoint = {
          x: e.clientX,
          y: e.clientY
        };
        
        // Calculate dimensions again to ensure they're in scope
        const captureLeft = Math.min(startPoint.x, endPoint.x);
        const captureTop = Math.min(startPoint.y, endPoint.y);
        const captureWidth = Math.abs(endPoint.x - startPoint.x);
        const captureHeight = Math.abs(endPoint.y - startPoint.y);
        fallbackSimulatedCapture(captureLeft, captureTop, captureWidth, captureHeight);
      } else {
        // If we don't have the dimensions, just use some defaults
        fallbackSimulatedCapture(0, 0, 300, 200);
      }
    } finally {
      cancelCapture();
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
    ctx.strokeStyle = "#3366cc";
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 120, captureWidth - 30, captureHeight / 3);
    ctx.fillStyle = "#3366cc33";
    ctx.fillRect(15, 120, captureWidth - 30, captureHeight / 3);
    
    // Get image data
    const imageData = canvas.toDataURL('image/png');
    
    // Send to both text and image handlers
    if (onCapturedImage) {
      onCapturedImage(imageData);
    }
    
    // Generate simulated OCR text
    const text = processSimulatedCapture(captureLeft, captureTop, captureWidth, captureHeight);
    onCapturedText(text);
    
    toast({
      title: "Simulated Capture",
      description: "Chrome API unavailable - using simulated capture",
      variant: "destructive"
    });
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
      >
        <Scan className="h-4 w-4" />
      </Button>
      
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      
      {/* Selection overlay */}
      {isCapturing && (
        <>
          <div 
            className="fixed inset-0 bg-black/10 cursor-crosshair z-[2147483647]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          <div 
            ref={selectionRef}
            className="fixed border-2 border-primary bg-primary/10 pointer-events-none z-[2147483647]"
            style={{ display: "none" }}
          />
        </>
      )}
    </>
  );
};

export default ScreenCapture;
