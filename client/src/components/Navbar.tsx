import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "wouter";

interface NavbarProps {
  isAdmin: boolean;
  onToggleView: () => void;
}

export default function Navbar({ isAdmin, onToggleView }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleToggleView = () => {
    onToggleView();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-dark-surface border-b border-dark-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span 
              onClick={() => navigate("/")}
              className="text-white font-bold text-lg cursor-pointer"
            >
              Central de Recursos
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <button 
              type="button" 
              onClick={handleToggleView}
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-dark-border transition-colors"
            >
              <span>{isAdmin ? "Área Pública" : "Área Administrativa"}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <img 
                className="h-8 w-8 rounded-full bg-gray-500" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Foto do usuário"
              />
              <span className="text-sm font-medium text-gray-300">Administrador</span>
            </div>
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              type="button" 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-dark-border transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="p-3 border-t border-dark-border">
            <button 
              type="button" 
              onClick={handleToggleView}
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-dark-border transition-colors"
            >
              <span>{isAdmin ? "Área Pública" : "Área Administrativa"}</span>
            </button>
            
            <div className="flex items-center space-x-2 mt-3 p-3">
              <img 
                className="h-8 w-8 rounded-full bg-gray-500" 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Foto do usuário"
              />
              <span className="text-sm font-medium text-gray-300">Administrador</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
