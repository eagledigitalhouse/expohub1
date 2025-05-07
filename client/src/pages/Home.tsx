import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Resource, Category, ContentBlock } from "@shared/schema";
import { getIconByName } from "@/lib/utils";
import { ResourceWithBlocks } from "@/lib/types";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  Filter, 
  Moon, 
  Sun, 
  Grid, 
  Plus, 
  FileText, 
  FileCheck,
  Users,
  Calendar,
  Download
} from "lucide-react";

// Componentes
import Navbar from "@/components/Navbar";
import ModernResourceCard from "@/components/ModernResourceCard";
import ResourceSidePanel from "@/components/ResourceSidePanel";
import GreetingHeader from "@/components/GreetingHeader";
import SearchBar from "@/components/SearchBar";
import FloatingActionButton from "@/components/FloatingActionButton";
import ModernSidebar from "@/components/ModernSidebar";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Home() {
  const [, navigate] = useLocation();
  const [isResourceSidePanelOpen, setIsResourceSidePanelOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<ResourceWithBlocks | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const { data: categories = [] } = useQuery<Category[]>({ 
    queryKey: ["/api/categories"] 
  });
  
  const { data: resources = [] } = useQuery<Resource[]>({ 
    queryKey: ["/api/resources"] 
  });

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // Toggle view mode function
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  // Atualizar recursos filtrados quando os recursos ou o termo de busca mudar
  useEffect(() => {
    if (resources && Array.isArray(resources)) {
      if (searchTerm) {
        const filtered = resources.filter((resource: Resource) => {
          const title = resource.title?.toLowerCase() || "";
          const description = resource.description?.toLowerCase() || "";
          const term = searchTerm.toLowerCase();
          
          return title.includes(term) || description.includes(term);
        });
        setFilteredResources(filtered);
      } else {
        setFilteredResources(resources);
      }
    }
  }, [resources, searchTerm]);
  
  const openResourceSidePanel = async (resource: Resource) => {
    try {
      const response = await fetch(`/api/resources/${resource.id}/blocks`);
      if (!response.ok) throw new Error("Failed to fetch resource blocks");
      
      const blocks: ContentBlock[] = await response.json();
      
      setCurrentResource({
        resource,
        blocks
      });
      
      setIsResourceSidePanelOpen(true);
    } catch (error) {
      console.error("Error fetching resource blocks:", error);
    }
  };
  
  const closeResourceSidePanel = () => {
    setIsResourceSidePanelOpen(false);
  };
  
  const handleToggleView = () => {
    navigate("/admin");
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  
  const getResourcesByCategory = (categoryId: number) => {
    return filteredResources.filter((resource: Resource) => resource.categoryId === categoryId) || [];
  };

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <ModernSidebar onToggleTheme={toggleTheme} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-16 md:ml-64 transition-all duration-300">
        <Navbar isAdmin={false} onToggleView={handleToggleView} />
        
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Cabeçalho com saudação */}
            <GreetingHeader />
            
            {/* Área de pesquisa e filtros */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
                <SearchBar onSearch={handleSearch} />
                
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2.5 rounded-full bg-dark-surface/80 border border-dark-border/50 text-gray-300 hover:bg-dark-surface hover:text-white transition-colors flex items-center"
                    onClick={toggleTheme}
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </motion.button>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-2.5 rounded-full ${viewMode === "grid" ? "bg-primary/20 text-primary border border-primary/30" : "bg-dark-surface/80 border border-dark-border/50 text-gray-300 hover:bg-dark-surface hover:text-white"} transition-colors flex items-center`}
                          onClick={toggleViewMode}
                        >
                          {/* Alterna entre visualização em grade ou lista */}
                          <Grid className="h-4 w-4" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{viewMode === "grid" ? "Visualização em grade" : "Visualização em lista"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2.5 rounded-full bg-dark-surface/80 border border-dark-border/50 text-gray-300 hover:bg-dark-surface hover:text-white transition-colors flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Filtrar</span>
                  </motion.button>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          disabled
                          className="p-2.5 rounded-full bg-primary/20 text-primary/60 flex items-center cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Entre no modo Admin para adicionar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              
              {/* Tags de filtros rápidos */}
              <div className="flex flex-wrap gap-2 mb-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-full bg-dark-surface/40 border border-dark-border/30 text-gray-300 hover:bg-dark-surface hover:text-white transition-colors flex items-center text-xs font-medium"
                >
                  <FileText className="h-3 w-3 mr-1.5" />
                  Documentos
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-full bg-dark-surface/40 border border-dark-border/30 text-gray-300 hover:bg-dark-surface hover:text-white transition-colors flex items-center text-xs font-medium"
                >
                  <FileCheck className="h-3 w-3 mr-1.5" />
                  Checklists
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-full bg-dark-surface/40 border border-dark-border/30 text-gray-300 hover:bg-dark-surface hover:text-white transition-colors flex items-center text-xs font-medium"
                >
                  <Users className="h-3 w-3 mr-1.5" />
                  Contatos
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-full bg-dark-surface/40 border border-dark-border/30 text-gray-300 hover:bg-dark-surface hover:text-white transition-colors flex items-center text-xs font-medium"
                >
                  <Calendar className="h-3 w-3 mr-1.5" />
                  Datas
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1.5 rounded-full bg-dark-surface/40 border border-dark-border/30 text-gray-300 hover:bg-dark-surface hover:text-white transition-colors flex items-center text-xs font-medium"
                >
                  <Download className="h-3 w-3 mr-1.5" />
                  Downloads
                </motion.button>
              </div>
              
              <div className="h-px bg-dark-border/40 my-6" />
            </div>
          
            {/* Resultados da pesquisa, se houver */}
            {searchTerm && (
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl text-white font-medium">Resultados da busca</h2>
                  <span className="ml-3 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {filteredResources.length} encontrado(s)
                  </span>
                </div>
                
                {filteredResources.length === 0 ? (
                  <div className="text-center py-12 bg-dark-surface/30 rounded-xl border border-dark-border/40">
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-xl font-medium text-white mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-gray-400">Tente outros termos de busca.</p>
                  </div>
                ) : null}
              </div>
            )}
            
            {/* Conteúdo principal - categorias e recursos */}
            <motion.div 
              className="space-y-16"
              variants={containerAnimation}
              initial="hidden"
              animate="show"
            >
              {categories.map((category: Category) => {
                const categoryResources = getResourcesByCategory(category.id);
                const CategoryIcon = getIconByName(category.icon as any || "Package");
                
                if (categoryResources.length === 0 && !searchTerm) return null;
                
                return (
                  <motion.div 
                    key={category.id} 
                    className="mb-12"
                    variants={itemAnimation}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <CategoryIcon className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                          {category.name}
                        </h2>
                        <div className="ml-3 h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                          <span className="text-xs font-medium">{categoryResources.length}</span>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-gray-400 hover:text-primary transition-colors flex items-center text-sm"
                      >
                        <span>Ver todos</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </motion.button>
                    </div>
                    
                    <div className="h-px bg-dark-border/30 mb-6"></div>
                    
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categoryResources.map((resource: Resource) => {
                          // Determine o ícone apropriado com base no título do recurso
                          const resourceIconName = resource.title.toLowerCase().includes("checklist") 
                            ? "FileCheck" 
                            : resource.title.toLowerCase().includes("documento") 
                              ? "FileText" 
                              : resource.title.toLowerCase().includes("orientaç") 
                                ? "Info" 
                                : resource.title.toLowerCase().includes("horário") 
                                  ? "Clock" 
                                  : resource.title.toLowerCase().includes("contato") 
                                    ? "Users" 
                                    : resource.title.toLowerCase().includes("gráfico") 
                                      ? "Image" 
                                      : resource.title.toLowerCase().includes("anúncio") 
                                        ? "MegaPhone" 
                                        : "FileText";
                                        
                          const ResourceIcon = getIconByName(resourceIconName);
                          
                          return (
                            <ModernResourceCard
                              key={resource.id}
                              resource={resource}
                              icon={ResourceIcon}
                              onClick={() => openResourceSidePanel(resource)}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      // Visualização em lista
                      <div className="space-y-3">
                        {categoryResources.map((resource: Resource) => {
                          // Determine o ícone apropriado com base no título do recurso
                          const resourceIconName = resource.title.toLowerCase().includes("checklist") 
                            ? "FileCheck" 
                            : resource.title.toLowerCase().includes("documento") 
                              ? "FileText" 
                              : resource.title.toLowerCase().includes("orientaç") 
                                ? "Info" 
                                : resource.title.toLowerCase().includes("horário") 
                                  ? "Clock" 
                                  : resource.title.toLowerCase().includes("contato") 
                                    ? "Users" 
                                    : resource.title.toLowerCase().includes("gráfico") 
                                      ? "Image" 
                                      : resource.title.toLowerCase().includes("anúncio") 
                                        ? "MegaPhone" 
                                        : "FileText";
                                        
                          const ResourceIcon = getIconByName(resourceIconName);
                          
                          // Visualização em lista
                          return (
                            <motion.div
                              key={resource.id}
                              whileHover={{ y: -3, x: 3 }}
                              onClick={() => openResourceSidePanel(resource)}
                              className="flex items-center p-4 bg-dark-surface/50 backdrop-blur-sm border border-dark-border/40 rounded-xl cursor-pointer transition-all hover:bg-dark-surface/80 hover:border-dark-border/60"
                            >
                              <div className="mr-4 h-10 w-10 flex-shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <ResourceIcon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold truncate">{resource.title}</h3>
                                <p className="text-gray-400 text-sm truncate">{resource.description}</p>
                              </div>
                              <div className="flex-shrink-0 ml-4">
                                {resource.readTime && (
                                  <div className="flex items-center text-gray-400 text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{resource.readTime} min</span>
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              
              {!categories.length && (
                <motion.div 
                  variants={itemAnimation}
                  className="text-center py-16 px-4 bg-dark-surface/80 backdrop-blur-sm border border-dark-border/40 rounded-xl shadow-lg"
                >
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-medium text-white mb-2">Nenhuma categoria disponível</h3>
                  <p className="text-gray-400">Os recursos serão adicionados em breve.</p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>
      </div>
      
      {/* Botão flutuante de ação */}
      <FloatingActionButton onClick={() => navigate("/admin")} />
      
      {/* Painel lateral de recurso */}
      <ResourceSidePanel 
        isOpen={isResourceSidePanelOpen}
        onClose={closeResourceSidePanel}
        currentResource={currentResource}
      />
    </div>
  );
}
