
import React, { useRef, useState } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "./ui/button";

interface VoiceControlsProps {
  onVoiceInput: (transcript: string) => void;
  onSpeak: (text: string) => void;
  disabled?: boolean;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  onVoiceInput,
  onSpeak,
  disabled = false,
}) => {
  const [listening, setListening] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [lastTranscript, setLastTranscript] = useState("");

  // Check for browser support
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognitionSupported = !!SpeechRecognition;

  const handleMicClick = () => {
    if (!recognitionSupported || disabled) return;
    if (!listening) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setLastTranscript(transcript);
        onVoiceInput(transcript);
        setListening(false);
        setCanSpeak(true);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
      recognition.start();
      setListening(true);
    } else {
      recognitionRef.current?.stop();
      setListening(false);
    }
  };

  const handleSpeak = () => {
    if (!lastTranscript) return;
    onSpeak(lastTranscript);
  };

  return (
    <div className="flex items-center space-x-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={`h-8 w-8 rounded-full ${listening ? "bg-primary text-primary-foreground" : ""}`}
        onClick={handleMicClick}
        disabled={!recognitionSupported || disabled}
        title={listening ? "Stop listening" : "Speak into mic"}
      >
        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      {/* Repeat last transcription out loud as a test */}
      {canSpeak && lastTranscript && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleSpeak}
          title="Read transcript aloud"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default VoiceControls;

