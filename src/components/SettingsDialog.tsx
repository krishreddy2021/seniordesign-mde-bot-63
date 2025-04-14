
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { chromeStorage } from "@/utils/chromeStorage";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Info } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Form schema for validation
const formSchema = z.object({
  apiKey: z.string().min(1, "API key is required").startsWith("AIza", "API key should start with AIza")
});

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  useEffect(() => {
    // Load saved API key when dialog opens
    if (open) {
      chromeStorage.sync.get(["geminiApiKey"], (result) => {
        if (result.geminiApiKey) {
          form.setValue("apiKey", result.geminiApiKey);
        }
      });
    }
  }, [open, form]);

  const handleSaveSettings = async (values: z.infer<typeof formSchema>) => {
    setIsVerifying(true);
    
    try {
      // Verify API key by making a small request
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash', {
        method: 'GET',
        headers: {
          'x-goog-api-key': values.apiKey,
        },
      });
      
      if (!response.ok) {
        throw new Error('Invalid API key');
      }
      
      // Save API key to Chrome storage
      chromeStorage.sync.set({ geminiApiKey: values.apiKey }, () => {
        toast({
          title: "Settings saved",
          description: "Your Gemini API key has been verified and saved.",
        });
        onOpenChange(false);
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not verify API key. Please check and try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Enter your Gemini API key to use the chatbot.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-4">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gemini API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="AIza..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="flex items-center text-xs">
                    <Info className="h-3 w-3 mr-1" />
                    Get your API key from the <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline text-primary">Google AI Studio</a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="submit" disabled={isVerifying}>
                {isVerifying ? "Verifying..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
