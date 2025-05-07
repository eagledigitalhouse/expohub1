import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
import { Edit, Trash, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getIconByName } from "@/lib/utils";
import ResourceItem from "./ResourceItem";
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

interface CategoryItemProps {
  category: Category;
  resources: Resource[];
  onEditResource: (resource: Resource) => void;
  onAddResource: (categoryId: number) => void;
}

export default function CategoryItem({ 
  category, 
  resources, 
  onEditResource,
  onAddResource
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const CategoryIcon = getIconByName(category.icon as any || "Package");
  
  const deleteCategoryMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/categories/${category.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria excluída",
        description: "A categoria foi excluída com sucesso.",
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir categoria",
        description: "Ocorreu um erro ao excluir a categoria.",
        variant: "destructive",
      });
    },
  });
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = () => {
    deleteCategoryMutation.mutate();
  };
  
  const handleAddResourceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddResource(category.id);
  };
  
  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden">
      <div 
        className="flex justify-between items-center p-4 border-b border-dark-border cursor-pointer"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center">
          <CategoryIcon className="h-5 w-5 mr-2 text-primary" />
          <h2 className="text-lg font-medium text-white">{category.name}</h2>
        </div>
        <div className="flex items-center">
          <button 
            className="p-2 text-gray-400 hover:text-white rounded-md transition-colors"
            onClick={handleEditClick}
          >
            <Edit className="h-5 w-5" />
          </button>
          <button 
            className="p-2 text-gray-400 hover:text-red-500 rounded-md transition-colors"
            onClick={handleDeleteClick}
          >
            <Trash className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 ml-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-400">Recursos nesta categoria</h3>
            <button 
              className="text-sm text-primary hover:text-primary-light flex items-center"
              onClick={handleAddResourceClick}
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar Recurso
            </button>
          </div>
          
          <div className="space-y-3">
            {resources.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nenhum recurso nesta categoria.
              </div>
            ) : (
              resources.map((resource) => (
                <ResourceItem 
                  key={resource.id} 
                  resource={resource}
                  onEdit={() => onEditResource(resource)}
                />
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Edit Category Dialog */}
      {isEditing && (
        <CategoryForm
          category={category}
          onClose={() => setIsEditing(false)}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-dark-surface border-dark-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a categoria "{category.name}" e todos os seus recursos.
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
