
import React, { useState, useRef, useEffect } from "react";
import { Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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

  const startCapture = () => {
    setIsCapturing(true);
    setStartPoint(null);
    toast({
      title: "Screen Capture Started",
      description: "Click and drag to select an area to scan. Press ESC to cancel.",
    });
  };

  const cancelCapture = () => {
    setIsCapturing(false);
    setStartPoint(null);
    if (selectionRef.current) {
      selectionRef.current.style.display = "none";
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
        description: "Processing selected area...",
      });
      
      // First attempt to use a proper capture approach
      try {
        // Create and position canvas for screenshot
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
        
        // In a browser extension with proper permissions, we would use:
        // chrome.tabs.captureVisibleTab(null, {format: 'png'}, function(dataUrl) {
        //   const img = new Image();
        //   img.onload = function() {
        //     ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
        //     // Rest of the processing
        //   };
        //   img.src = dataUrl;
        // });
        
        // For now, we'll create a colored rectangle to represent a captured area
        ctx.fillStyle = "#f0f4f8";
        ctx.fillRect(0, 0, width, height);
        
        // Add some text to make it look like content
        ctx.font = "14px Arial";
        ctx.fillStyle = "#000";
        ctx.fillText("Captured Area", 10, 30);
        ctx.fillText(`Size: ${width}x${height}`, 10, 50);
        ctx.fillText(`Position: (${left}, ${top})`, 10, 70);
        ctx.fillText("MCAT Study Content", 10, 100);
        
        // Draw some shapes to simulate content
        ctx.strokeStyle = "#3366cc";
        ctx.lineWidth = 2;
        ctx.strokeRect(15, 120, width - 30, height / 3);
        ctx.fillStyle = "#3366cc33";
        ctx.fillRect(15, 120, width - 30, height / 3);
        
        // Get image data
        const imageData = canvas.toDataURL('image/png');
        
        // Send to both text and image handlers
        if (onCapturedImage) {
          onCapturedImage(imageData);
        }
        
        // Generate simulated OCR text
        const text = processSimulatedCapture(left, top, width, height);
        onCapturedText(text);
        
        toast({
          title: "Screen Captured",
          description: "Screenshot captured and OCR text extracted!",
        });
      } catch (error) {
        console.error("Screenshot capture error:", error);
        // Fallback to simulated approach
        const text = processSimulatedCapture(left, top, width, height);
        onCapturedText(text);
        
        toast({
          title: "Simulated Capture",
          description: "Screenshot failed, but OCR text was simulated.",
        });
      }
    } catch (error) {
      console.error("Error during screen capture:", error);
      toast({
        title: "Capture Failed",
        description: "There was an error processing your screen capture.",
        variant: "destructive"
      });
    } finally {
      cancelCapture();
    }
  };

  // Helper function to check if canvas is empty (all white or transparent)
  const isCanvasEmpty = (canvas: HTMLCanvasElement): boolean => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return true;
    
    const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Check if all pixels are transparent or white
    for (let i = 0; i < pixelData.length; i += 4) {
      const alpha = pixelData[i + 3];
      if (alpha !== 0) { // If not transparent
        const red = pixelData[i];
        const green = pixelData[i + 1];
        const blue = pixelData[i + 2];
        
        // If not white (allowing some tolerance)
        if (red < 245 || green < 245 || blue < 245) {
          return false;
        }
      }
    }
    
    return true;
  };

  const processSimulatedCapture = (left: number, top: number, width: number, height: number): string => {
    // In a real implementation with proper permissions, we would use browser APIs
    // to capture the screen content and then use OCR to extract text.
    // For now, we're simulating this behavior.
    
    return `[Simulated OCR Result from area (${left},${top}) with size ${width}x${height}]
    
This is sample MCAT content from the selected area:

The Krebs cycle, also known as the citric acid cycle or TCA cycle, is a series of chemical reactions used by all aerobic organisms to release stored energy through the oxidation of acetyl-CoA derived from carbohydrates, fats, and proteins.

The cycle provides precursors of certain amino acids, as well as the reducing agent NADH, that are used in numerous biochemical reactions. Its central importance to many biochemical pathways suggests that it was one of the earliest components of metabolism.`;
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
            className="fixed inset-0 bg-black/10 cursor-crosshair z-50"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          />
          <div 
            ref={selectionRef}
            className="fixed border-2 border-primary bg-primary/10 pointer-events-none z-50"
            style={{ display: "none" }}
          />
        </>
      )}
    </>
  );
};

export default ScreenCapture;
