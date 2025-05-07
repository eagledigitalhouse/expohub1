import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  Home,
  MessageSquare,
  ClipboardList,
  FolderOpen,
  Settings,
  Users,
  BarChart2,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon, label, isActive, isCollapsed, onClick }: SidebarItemProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "flex items-center w-full px-3 py-3 rounded-lg transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-gray-400 hover:text-white hover:bg-dark-surface/50"
            )}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">{icon}</div>
              {!isCollapsed && (
                <span className={cn(
                  "ml-3 text-sm font-medium transition-opacity duration-200",
                  isCollapsed ? "opacity-0 w-0" : "opacity-100"
                )}>
                  {label}
                </span>
              )}
            </div>
          </button>
        </TooltipTrigger>
        {isCollapsed && <TooltipContent side="right">{label}</TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
};

interface ModernSidebarProps {
  onToggleTheme?: () => void;
}

export default function ModernSidebar({ onToggleTheme }: ModernSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePath, setActivePath] = useState("/");
  const [location, navigate] = useLocation();
  const isMobile = useIsMobile();

  // Auto-collapse on mobile devices
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  // Sync with current location
  useEffect(() => {
    setActivePath(location);
  }, [location]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    { 
      path: "/create", 
      icon: <Plus className="h-5 w-5" />, 
      label: "Criar Recurso" 
    },
    { 
      path: "/", 
      icon: <Home className="h-5 w-5" />, 
      label: "Início" 
    },
    { 
      path: "/messages", 
      icon: <MessageSquare className="h-5 w-5" />, 
      label: "Mensagens" 
    },
    { 
      path: "/tasks", 
      icon: <ClipboardList className="h-5 w-5" />, 
      label: "Tarefas" 
    },
    { 
      path: "/resources", 
      icon: <FolderOpen className="h-5 w-5" />, 
      label: "Recursos" 
    },
    { 
      path: "/settings", 
      icon: <Settings className="h-5 w-5" />, 
      label: "Configurações" 
    },
    { 
      path: "/team", 
      icon: <Users className="h-5 w-5" />, 
      label: "Equipe" 
    },
    { 
      path: "/reports", 
      icon: <BarChart2 className="h-5 w-5" />, 
      label: "Relatórios" 
    },
    { 
      path: "/help", 
      icon: <HelpCircle className="h-5 w-5" />, 
      label: "Central de Ajuda" 
    },
  ];

  return (
    <div 
      className={cn(
        "h-screen flex flex-col bg-dark-surface/90 backdrop-blur-lg border-r border-dark-border transition-all duration-300 ease-in-out fixed left-0 top-0 z-40",
        isCollapsed ? "w-16" : "w-64",
        isMobile && !isCollapsed ? "shadow-xl" : ""
      )}
    >
      {/* Logo area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-dark-border">
        {!isCollapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary mr-2 flex items-center justify-center">
              <span className="text-white font-semibold">CR</span>
            </div>
            <span className="text-white font-semibold">Central de Recursos</span>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-semibold">CR</span>
            </div>
          </div>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="text-gray-400 hover:text-white hover:bg-dark-surface"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        )}
      </div>

      {/* Menu items */}
      <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={activePath === item.path}
            isCollapsed={isCollapsed}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
      
      {/* Logout button at bottom */}
      <div className="p-2 border-t border-dark-border">
        <SidebarItem
          icon={<LogOut className="h-5 w-5" />}
          label="Sair"
          isActive={false}
          isCollapsed={isCollapsed}
          onClick={() => console.log("Logout")}
        />
      </div>

      {/* Mobile toggle */}
      {isMobile && (
        <button
          onClick={toggleCollapse}
          className={cn(
            "absolute -right-8 top-1/2 transform -translate-y-1/2 bg-primary rounded-r-lg p-1.5 text-white",
            isCollapsed ? "opacity-50" : "opacity-90"
          )}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}