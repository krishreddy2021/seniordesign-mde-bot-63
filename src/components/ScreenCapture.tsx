
import React, { useState, useRef, useEffect } from "react";
import { Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { isChromeExtension } from "@/utils/captureUtils";

interface ScreenCaptureProps {
  onCapturedText: (text: string, imageData?: string) => void;
  onCapturedImage?: (imageData: string) => void;
}

const ScreenCapture: React.FC<ScreenCaptureProps> = ({ 
  onCapturedText, 
  onCapturedImage 
}) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCapture = async () => {
    console.log('Starting full screen capture');
    
    if (!isChromeExtension()) {
      toast({
        title: "Unsupported Environment",
        description: "Screen capture only works in Chrome extension",
        variant: "destructive"
      });
      return;
    }

    try {
      // Request desktop capture permissions
      if (window.chrome?.desktopCapture) {
        window.chrome.desktopCapture.chooseDesktopMedia(
          ['screen', 'window', 'tab'], 
          (streamId) => {
            if (streamId) {
              // Capture the selected source
              navigator.mediaDevices.getUserMedia({
                video: {
                  mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: streamId
                  }
                }
              }).then((stream) => {
                const video = document.createElement('video');
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                  video.play();
                  video.pause();
                  
                  const canvas = document.createElement('canvas');
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                  
                  const imageData = canvas.toDataURL('image/png');
                  
                  // Process captured image
                  if (onCapturedImage) {
                    onCapturedImage(imageData);
                  }
                  
                  onCapturedText('Screen captured successfully', imageData);
                  
                  toast({
                    title: "Screen Captured",
                    description: "Full screen screenshot taken"
                  });
                  
                  // Stop all tracks
                  stream.getTracks().forEach(track => track.stop());
                };
              }).catch((err) => {
                console.error('Error capturing screen:', err);
                toast({
                  title: "Capture Failed",
                  description: err.message,
                  variant: "destructive"
                });
              });
            }
          }
        );
      } else {
        throw new Error('Desktop capture not supported');
      }
    } catch (error) {
      console.error('Screen capture error:', error);
      toast({
        title: "Capture Failed",
        description: String(error),
        variant: "destructive"
      });
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
