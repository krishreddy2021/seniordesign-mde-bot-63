
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
      
      // Capture the screen
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      // Set canvas size
      canvas.width = width;
      canvas.height = height;
      
      // Draw the selected portion
      ctx.drawImage(
        document.documentElement, // Capture the entire HTML document
        left,
        top,
        width,
        height,
        0,
        0,
        width,
        height
      );
      
      // Convert to image data
      const imageData = canvas.toDataURL("image/png");
      
      // Process with OCR
      const text = await processImageWithOCR(imageData);
      
      // Pass the text to parent component
      onCapturedText(text || "Unable to extract text from the selected area.");
      
      toast({
        title: "Screen Captured",
        description: text ? "Text extracted successfully!" : "No text found in the selected area.",
      });
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

  const processImageWithOCR = async (imageData: string): Promise<string> => {
    try {
      // For browser extension context, we'll rely on Tesseract.js which can run client-side
      // In a real implementation, you might want to load this dynamically or use a backend service
      // For now, we'll simulate OCR with a placeholder message
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would use something like:
      // const { createWorker } = await import('tesseract.js');
      // const worker = await createWorker();
      // await worker.loadLanguage('eng');
      // await worker.initialize('eng');
      // const { data: { text } } = await worker.recognize(imageData);
      // await worker.terminate();
      // return text;
      
      return "This is a simulated OCR result. In a real implementation, you would see the actual text from your screen capture here.";
    } catch (error) {
      console.error("OCR processing error:", error);
      return "";
    }
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
