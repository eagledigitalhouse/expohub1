import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
import { Edit, Trash, Plus, FileText, ChevronRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatDisplayDate, getIconByName } from "@/lib/utils";
import CategoryForm from "./CategoryForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CategoryTableProps {
  categories: Category[];
  getResourcesByCategory: (categoryId: number) => Resource[];
  onEditResource: (resource: Resource) => void;
  onAddResource: (categoryId: number) => void;
}

export default function CategoryTable({ 
  categories,
  getResourcesByCategory,
  onEditResource,
  onAddResource
}: CategoryTableProps) {
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      return apiRequest("DELETE", `/api/categories/${categoryId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      setShowDeleteDialog(null);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir categoria",
        description: "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    },
  });
  
  const handleEditCategory = (categoryId: number) => {
    setIsEditing(categoryId);
  };
  
  const handleDeleteCategory = (categoryId: number) => {
    setShowDeleteDialog(categoryId);
  };
  
  const handleConfirmDelete = () => {
    if (showDeleteDialog !== null) {
      deleteCategoryMutation.mutate(showDeleteDialog);
    }
  };
  
  const handleAddResourceClick = (categoryId: number) => {
    onAddResource(categoryId);
  };
  
  const toggleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      return apiRequest("DELETE", `/api/resources/${resourceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Recurso excluído",
        description: "O recurso foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir recurso",
        description: "Ocorreu um erro ao excluir o recurso.",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteResource = (resourceId: number) => {
    deleteResourceMutation.mutate(resourceId);
  };
  
  if (categories.length === 0) {
    return (
      <div className="bg-dark-surface border border-dark-border rounded-lg p-6 text-center max-w-md mx-auto">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="text-xl font-medium text-white mb-2">Nenhuma categoria</h3>
        <p className="text-gray-400 mb-4">Crie sua primeira categoria para começar a organizar seus recursos.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-auto">
      <Table className="border-collapse w-full">
        <TableHeader className="bg-dark-surface/80">
          <TableRow className="hover:bg-dark-surface/90 border-b border-dark-border">
            <TableHead className="w-[5%] text-gray-400"></TableHead>
            <TableHead className="w-[30%] text-gray-400">Categoria</TableHead>
            <TableHead className="w-[15%] text-gray-400">Recursos</TableHead>
            <TableHead className="w-[30%] text-gray-400">Última atualização</TableHead>
            <TableHead className="w-[20%] text-center text-gray-400">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => {
            const resources = getResourcesByCategory(category.id);
            const CategoryIcon = getIconByName(category.icon as any || "Package");
            const isExpanded = expandedCategories.includes(category.id);
            
            return (
              <>
                <TableRow 
                  key={category.id} 
                  className="hover:bg-dark-surface/70 border-b border-dark-border cursor-pointer"
                  onClick={() => toggleCategoryExpand(category.id)}
                >
                  <TableCell className="p-2 text-center">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 p-0.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCategoryExpand(category.id);
                      }}
                    >
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </Button>
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
                        <CategoryIcon className="h-4 w-4" />
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-white">{category.name}</span>
                        <Badge className="ml-2 h-5 px-2 bg-primary/15 text-primary border-0 font-medium text-xs">
                          {resources.length}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    
                  </TableCell>
                  <TableCell className="p-2 text-gray-400 text-sm">
                    {resources.length > 0 
                      ? formatDisplayDate(resources[0].updatedAt).date
                      : '-'}
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex justify-center space-x-1">
                      <Button
                        size="sm"
                        variant="default"
                        className="h-7 bg-primary text-white hover:bg-primary/90 flex items-center px-3.5 rounded-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddResourceClick(category.id);
                        }}
                        title="Adicionar recurso"
                      >
                        <Plus className="h-3.5 w-3.5 mr-2" />
                        <span className="font-medium text-xs">Adicionar</span>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-gray-400 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category.id);
                        }}
                        title="Editar categoria"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-gray-400 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id);
                        }}
                        title="Excluir categoria"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {isExpanded && resources.length > 0 && resources.map(resource => {
                  const ResourceIcon = getIconByName(
                    resource.title.toLowerCase().includes("checklist") 
                      ? "FileCheck" 
                      : resource.title.toLowerCase().includes("documento") 
                        ? "FileText" 
                        : resource.title.toLowerCase().includes("orientações") 
                          ? "Info" 
                          : resource.title.toLowerCase().includes("horário") 
                            ? "Clock" 
                            : resource.title.toLowerCase().includes("contato") 
                              ? "Users" 
                              : resource.title.toLowerCase().includes("gráfico") 
                                ? "Image" 
                                : resource.title.toLowerCase().includes("anúncio") || resource.title.toLowerCase().includes("redes") 
                                  ? "MegaPhone" 
                                  : "FileText"
                  );
                  
                  return (
                    <TableRow key={`resource-${resource.id}`} className="bg-dark/50 hover:bg-dark border-b border-dark-border/50">
                      <TableCell className="p-2"></TableCell>
                      <TableCell className="p-2" colSpan={2}>
                        <div className="flex items-center pl-6">
                          <div className="h-5 w-5 rounded bg-primary/5 flex items-center justify-center text-primary/70 mr-2">
                            <ResourceIcon className="h-3 w-3" />
                          </div>
                          <span className="text-gray-300 text-sm">{resource.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 text-gray-500 text-xs">
                        {formatDisplayDate(resource.updatedAt).date}
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex justify-center space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-gray-400 hover:text-primary"
                            onClick={() => onEditResource(resource)}
                            title="Editar recurso"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-gray-400 hover:text-destructive"
                            onClick={() => handleDeleteResource(resource.id)}
                            title="Excluir recurso"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {isExpanded && resources.length === 0 && (
                  <TableRow className="bg-dark/30 border-b border-dark-border/50">
                    <TableCell className="p-2" colSpan={5}>
                      <div className="text-center py-2">
                        <p className="text-gray-500 text-xs">Nenhum recurso nesta categoria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
      
      {/* Edit Category Dialog */}
      {isEditing !== null && (
        <CategoryForm
          category={categories.find(c => c.id === isEditing) || undefined}
          onClose={() => setIsEditing(null)}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent className="bg-dark-surface border-dark-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria e todos os seus recursos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}