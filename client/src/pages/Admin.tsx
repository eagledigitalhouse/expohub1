import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Resource, Category, insertResourceSchema } from "@shared/schema";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ResourceWithBlocks } from "@/lib/types";
import Navbar from "@/components/Navbar";
import AdminSidebar from "@/components/admin/AdminSidebar";
import CategoryItem from "@/components/admin/CategoryItem";
import CategoryForm from "@/components/admin/CategoryForm";
import ResourceEditor from "@/components/admin/ResourceEditor";
import ResourceDrawer from "@/components/ResourceDrawer";
import { Button } from "@/components/ui/button";

export default function Admin() {
  const [, navigate] = useLocation();
  const [activePage, setActivePage] = useState("resources");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [showResourceEditor, setShowResourceEditor] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showResourcePreview, setShowResourcePreview] = useState(false);
  const [previewData, setPreviewData] = useState<ResourceWithBlocks | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: categories } = useQuery({ 
    queryKey: ["/api/categories"] 
  });
  
  const { data: resources } = useQuery({ 
    queryKey: ["/api/resources"] 
  });
  
  const handleToggleView = () => {
    navigate("/");
  };
  
  const handlePageChange = (page: string) => {
    setActivePage(page);
  };
  
  const handleAddCategory = () => {
    setShowNewCategoryForm(true);
  };
  
  const handleEditResource = (resource: Resource) => {
    setEditingResource(resource);
    setShowResourceEditor(true);
  };
  
  const handleAddResource = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setEditingResource(null);
    setShowResourceEditor(true);
  };
  
  const handleCloseResourceEditor = () => {
    setShowResourceEditor(false);
    setEditingResource(null);
    setSelectedCategoryId(null);
  };
  
  const handleClosePreview = () => {
    setShowResourcePreview(false);
  };
  
  const handlePreviewResource = (resourceWithBlocks: ResourceWithBlocks) => {
    setPreviewData(resourceWithBlocks);
    setShowResourcePreview(true);
  };
  
  const getResourcesByCategory = (categoryId: number) => {
    return resources?.filter((resource: Resource) => resource.categoryId === categoryId) || [];
  };
  
  const saveResourceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertResourceSchema>) => {
      if (data.id) {
        return apiRequest("PUT", `/api/resources/${data.id}`, data);
      } else {
        return apiRequest("POST", "/api/resources", data);
      }
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Recurso salvo",
        description: "O recurso foi salvo com sucesso.",
      });
      handleCloseResourceEditor();
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar recurso",
        description: "Ocorreu um erro ao salvar o recurso.",
        variant: "destructive",
      });
    },
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isAdmin={true} onToggleView={handleToggleView} />
      
      <div className="flex-1 flex">
        <AdminSidebar 
          activePage={activePage} 
          onPageChange={handlePageChange} 
        />
        
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {activePage === "resources" && (
            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">Gerenciar Recursos</h1>
                <Button 
                  onClick={handleAddCategory}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Categoria
                </Button>
              </div>
              
              <div className="space-y-8">
                {categories?.length > 0 ? (
                  categories.map((category: Category) => (
                    <CategoryItem
                      key={category.id}
                      category={category}
                      resources={getResourcesByCategory(category.id)}
                      onEditResource={handleEditResource}
                      onAddResource={handleAddResource}
                    />
                  ))
                ) : (
                  <div className="bg-dark-surface border border-dark-border rounded-lg p-6 text-center">
                    <p className="text-gray-400 mb-4">Nenhuma categoria encontrada.</p>
                    <Button 
                      onClick={handleAddCategory}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Criar primeira categoria
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activePage === "settings" && (
            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1">
              <h1 className="text-2xl font-bold text-white mb-6">Configurações</h1>
              <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                <p className="text-gray-400">Configurações do sistema serão implementadas em uma atualização futura.</p>
              </div>
            </div>
          )}
          
          {activePage === "stats" && (
            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1">
              <h1 className="text-2xl font-bold text-white mb-6">Estatísticas</h1>
              <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                <p className="text-gray-400">Estatísticas de acesso serão implementadas em uma atualização futura.</p>
              </div>
            </div>
          )}
          
          {activePage === "users" && (
            <div className="py-6 px-4 sm:px-6 lg:px-8 flex-1">
              <h1 className="text-2xl font-bold text-white mb-6">Usuários</h1>
              <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
                <p className="text-gray-400">Gerenciamento de usuários será implementado em uma atualização futura.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Forms and Dialogs */}
      {showNewCategoryForm && (
        <CategoryForm onClose={() => setShowNewCategoryForm(false)} />
      )}
      
      {showResourceEditor && (
        <ResourceEditor 
          isOpen={showResourceEditor}
          onClose={handleCloseResourceEditor}
          editingResource={editingResource}
          categories={categories || []}
          onPreview={handlePreviewResource}
        />
      )}
      
      {/* Resource Preview */}
      <ResourceDrawer 
        isOpen={showResourcePreview} 
        onClose={handleClosePreview}
        currentResource={previewData}
      />
    </div>
  );
}
