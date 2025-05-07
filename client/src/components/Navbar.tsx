import { useState, useEffect } from "react";
import { Menu, X, Home, Settings, User } from "lucide-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  isAdmin: boolean;
  onToggleView: () => void;
}

export default function Navbar({ isAdmin, onToggleView }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleToggleView = () => {
    onToggleView();
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav 
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled 
          ? "bg-dark-surface/80 backdrop-blur-lg border-b border-dark-border/50 shadow-md" 
          : "bg-transparent"
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <motion.span 
              onClick={() => navigate("/")}
              className="text-white font-bold text-lg cursor-pointer flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Home className="h-5 w-5 mr-2 text-primary" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Central de Recursos
              </span>
            </motion.span>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <motion.button 
              type="button" 
              onClick={handleToggleView}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isAdmin 
                  ? "bg-dark-surface text-gray-300 hover:bg-dark-border" 
                  : "bg-primary/20 text-primary hover:bg-primary/30"
              } transition-colors flex items-center space-x-2`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-4 w-4" />
              <span>{isAdmin ? "Área Pública" : "Área Administrativa"}</span>
            </motion.button>
            
            <motion.div 
              className="flex items-center space-x-2 pl-2 pr-4 py-1.5 rounded-full bg-dark-surface/80 border border-dark-border/50"
              whileHover={{ backgroundColor: "rgba(30, 41, 59, 0.5)" }}
            >
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-gray-300">Expositor</span>
            </motion.div>
          </div>
          
          <div className="md:hidden flex items-center">
            <motion.button 
              type="button" 
              onClick={toggleMobileMenu}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-dark-border/50 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden absolute w-full bg-dark-surface/95 backdrop-blur-md shadow-lg border-b border-dark-border/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 space-y-3">
              <motion.button 
                type="button" 
                onClick={handleToggleView}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-dark-border/60 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center">
                  <Settings className="h-5 w-5 mr-3" />
                  {isAdmin ? "Área Pública" : "Área Administrativa"}
                </span>
                <span className="text-primary text-xs px-2 py-1 rounded-md bg-primary/10">
                  {isAdmin ? "Admin" : "Público"}
                </span>
              </motion.button>
              
              <motion.div 
                className="flex items-center space-x-3 mt-3 p-4 rounded-lg bg-dark-surface/80 border border-dark-border/50"
                whileTap={{ scale: 0.98 }}
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-sm font-medium text-white">Expositor</span>
                  <span className="block text-xs text-gray-400">Visualizando recursos</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
