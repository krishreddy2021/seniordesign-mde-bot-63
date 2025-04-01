
import React, { ReactNode } from "react";
import { Settings, AlignJustify, AlignLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleSidebar: () => void;
  showSidebar: boolean;
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ 
  onOpenSettings, 
  onToggleSidebar, 
  showSidebar,
  children 
}) => {
  return (
    <header className="flex items-center justify-between p-2 border-b border-border bg-background">
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
          className="h-9 w-9 rounded-full"
        >
          {showSidebar ? <AlignLeft className="h-4 w-4" /> : <AlignJustify className="h-4 w-4" />}
        </Button>
        <h1 className="text-sm font-semibold">Marcus MCAT Tutor</h1>
      </div>
      <div className="flex items-center space-x-1">
        {children}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          className="h-9 w-9 rounded-full"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
