
import React, { useState, useRef, useEffect } from "react";
import { Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface ScreenCaptureProps {
  onCapturedText: (text: string) => void;
}

const ScreenCapture: React.FC<ScreenCaptureProps> = ({ onCapturedText }) => {
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

      // Since we can't directly capture the screen in a browser extension without permissions,
      // we'll simulate successful capture and OCR processing
      toast({
        title: "Area Selected",
        description: "Processing selected area...",
      });
      
      // Simulate OCR processing with a delay
      setTimeout(() => {
        // Process with OCR
        const text = processSimulatedCapture(left, top, width, height);
        
        // Pass the text to parent component
        onCapturedText(text);
        
        toast({
          title: "Screen Captured",
          description: "Text extracted successfully!",
        });
      }, 1000);
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
      
      {/* Hidden canvas for capturing (not used in this simulated version) */}
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
