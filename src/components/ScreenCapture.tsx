
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
    console.log('Starting screen capture');
    setIsCapturing(true);
    
    if (!isChromeExtension()) {
      toast({
        title: "Unsupported Environment",
        description: "Screen capture only works in Chrome extension",
        variant: "destructive"
      });
      setIsCapturing(false);
      return;
    }

    try {
      if (window.chrome?.tabs?.captureVisibleTab) {
        // Use tab capture if available (simpler method)
        window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length === 0) {
            throw new Error("No active tab found");
          }
          
          window.chrome.tabs.captureVisibleTab(
            null, 
            { format: 'png' },
            (dataUrl) => {
              if (window.chrome?.runtime?.lastError) {
                throw new Error(window.chrome.runtime.lastError.message);
              }
              
              if (onCapturedImage) {
                onCapturedImage(dataUrl);
              }
              
              onCapturedText('Screen captured successfully', dataUrl);
              
              toast({
                title: "Screen Captured",
                description: "Screenshot taken"
              });
              
              setIsCapturing(false);
            }
          );
        });
      } else if (window.chrome?.desktopCapture) {
        // Fall back to desktop capture API
        window.chrome.desktopCapture.chooseDesktopMedia(
          ['screen', 'window', 'tab'], 
          null,
          (streamId) => {
            if (!streamId) {
              setIsCapturing(false);
              toast({
                title: "Screen Capture Cancelled",
                description: "No source was selected",
              });
              return;
            }
            
            // Use the streamId with getUserMedia
            const constraints: MediaStreamConstraints = {
              video: {
                // Use any type to bypass type checking for Chrome-specific properties
                ...(({
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: streamId
                } as any))
              }
            };
            
            navigator.mediaDevices.getUserMedia(constraints)
              .then((stream) => {
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
                    description: "Screenshot taken"
                  });
                  
                  // Stop all tracks
                  stream.getTracks().forEach(track => track.stop());
                  setIsCapturing(false);
                };
              })
              .catch((err) => {
                console.error('Error capturing screen:', err);
                toast({
                  title: "Capture Failed",
                  description: err.message,
                  variant: "destructive"
                });
                setIsCapturing(false);
              });
          }
        );
      } else {
        // If neither method is available, use content script to handle screen capture
        if (window.chrome?.runtime?.sendMessage) {
          window.chrome.runtime.sendMessage(
            { action: 'start_screen_capture' },
            (response) => {
              if (window.chrome?.runtime?.lastError) {
                throw new Error(window.chrome.runtime.lastError.message);
              }
              
              // Content script will handle the capture and send back the image
              // via window.postMessage which is listened for in Index.tsx
              toast({
                title: "Screen Capture",
                description: "Select area of screen to capture"
              });
            }
          );
        } else {
          throw new Error('Screen capture not supported');
        }
      }
    } catch (error) {
      console.error('Screen capture error:', error);
      toast({
        title: "Capture Failed",
        description: String(error),
        variant: "destructive"
      });
      setIsCapturing(false);
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
        {isCapturing ? (
          <span className="animate-pulse">...</span>
        ) : (
          <Scan className="h-4 w-4" />
        )}
      </Button>
      
      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
};

export default ScreenCapture;
