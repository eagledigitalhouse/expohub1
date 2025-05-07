import { useQuery } from "@tanstack/react-query";
import {
  Settings,
  Package,
  Users,
  BarChart,
  Palette,
} from "lucide-react";

interface AdminSidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

export default function AdminSidebar({ activePage, onPageChange }: AdminSidebarProps) {
  return (
    <div className="w-64 bg-dark-surface border-r border-dark-border hidden md:block">
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-dark-border">
          <h2 className="font-medium text-white">Painel Administrativo</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => onPageChange("resources")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium ${
              activePage === "resources" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-300 hover:text-white hover:bg-dark-border"
            } rounded-md`}
          >
            <Package className="h-5 w-5 mr-2" />
            Categorias e Recursos
          </button>
          <button 
            onClick={() => onPageChange("themes")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium ${
              activePage === "themes" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-300 hover:text-white hover:bg-dark-border"
            } rounded-md`}
          >
            <Palette className="h-5 w-5 mr-2" />
            Temas
          </button>
          <button 
            onClick={() => onPageChange("settings")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium ${
              activePage === "settings" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-300 hover:text-white hover:bg-dark-border"
            } rounded-md`}
          >
            <Settings className="h-5 w-5 mr-2" />
            Configurações
          </button>
          <button 
            onClick={() => onPageChange("stats")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium ${
              activePage === "stats" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-300 hover:text-white hover:bg-dark-border"
            } rounded-md`}
          >
            <BarChart className="h-5 w-5 mr-2" />
            Estatísticas
          </button>
          <button 
            onClick={() => onPageChange("users")}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium ${
              activePage === "users" 
                ? "bg-primary/10 text-primary" 
                : "text-gray-300 hover:text-white hover:bg-dark-border"
            } rounded-md`}
          >
            <Users className="h-5 w-5 mr-2" />
            Usuários
          </button>
        </nav>
      </div>
    </div>
  );
}
