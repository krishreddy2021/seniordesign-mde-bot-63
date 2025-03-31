
import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <div className="bg-primary p-3 flex items-center justify-between">
      <div className="text-primary-foreground font-semibold">AI Assistant</div>
      <Button variant="ghost" size="icon" onClick={onOpenSettings} className="text-primary-foreground">
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default Header;
