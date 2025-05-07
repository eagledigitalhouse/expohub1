import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Resource, Category, ContentBlock } from "@shared/schema";
import { getIconByName } from "@/lib/utils";
import { ResourceWithBlocks } from "@/lib/types";
import Navbar from "@/components/Navbar";
import ResourceCard from "@/components/ResourceCard";
import ResourceDrawer from "@/components/ResourceDrawer";
import CategoryHeader from "@/components/CategoryHeader";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const [isResourceDrawerOpen, setIsResourceDrawerOpen] = useState(false);
  const [currentResource, setCurrentResource] = useState<ResourceWithBlocks | null>(null);
  
  const { data: categories } = useQuery({ 
    queryKey: ["/api/categories"] 
  });
  
  const { data: resources } = useQuery({ 
    queryKey: ["/api/resources"] 
  });
  
  const openResourceDrawer = async (resource: Resource) => {
    try {
      const response = await fetch(`/api/resources/${resource.id}/blocks`);
      if (!response.ok) throw new Error("Failed to fetch resource blocks");
      
      const blocks: ContentBlock[] = await response.json();
      
      setCurrentResource({
        resource,
        blocks
      });
      
      setIsResourceDrawerOpen(true);
    } catch (error) {
      console.error("Error fetching resource blocks:", error);
    }
  };
  
  const closeResourceDrawer = () => {
    setIsResourceDrawerOpen(false);
  };
  
  const handleToggleView = () => {
    navigate("/admin");
  };
  
  const getResourcesByCategory = (categoryId: number) => {
    return resources?.filter((resource: Resource) => resource.categoryId === categoryId) || [];
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isAdmin={false} onToggleView={handleToggleView} />
      
      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-white">Recursos para Expositores</h1>
            <p className="mt-2 text-gray-400">Todos os materiais e informações que você precisa para seu estande no evento.</p>
          </header>
          
          <div className="space-y-10">
            {categories?.map((category: Category) => {
              const categoryResources = getResourcesByCategory(category.id);
              const CategoryIcon = getIconByName(category.icon as any || "Package");
              
              if (categoryResources.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-10">
                  <CategoryHeader 
                    title={category.name} 
                    icon={CategoryIcon} 
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryResources.map((resource: Resource) => {
                      // Determine the appropriate icon based on resource title
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
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          icon={ResourceIcon}
                          onClick={() => openResourceDrawer(resource)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {!categories?.length && (
              <div className="text-center py-8">
                <p className="text-gray-400">Nenhuma categoria disponível.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <ResourceDrawer 
        isOpen={isResourceDrawerOpen}
        onClose={closeResourceDrawer}
        currentResource={currentResource}
      />
    </div>
  );
}
