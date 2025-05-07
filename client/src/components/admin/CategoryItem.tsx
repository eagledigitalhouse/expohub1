import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
import { Edit, Trash, Plus, FileText } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  
  const handleEditClick = () => {
    setIsEditing(true);
  };
  
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = () => {
    deleteCategoryMutation.mutate();
  };
  
  const handleAddResourceClick = () => {
    onAddResource(category.id);
  };
  
  return (
    <Card className="bg-dark-surface border-dark-border h-full overflow-hidden">
      <CardHeader className="p-3 pb-2.5 sm:p-4 sm:pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-start min-w-0 pr-2">
            <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0 mt-0.5">
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex items-center">
              <CardTitle className="text-base sm:text-lg text-white truncate leading-5" title={category.name}>
                {category.name}
              </CardTitle>
              <Badge className="ml-2 h-5 px-2 bg-primary/15 text-primary border-0 font-medium text-xs">
                {resources.length}
              </Badge>
            </div>
          </div>
          
          <div className="flex space-x-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400 hover:text-primary hover:bg-primary/5"
              onClick={handleEditClick}
              title="Editar categoria"
            >
              <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 sm:h-7 sm:w-7 text-gray-400 hover:text-destructive hover:bg-destructive/5"
              onClick={handleDeleteClick}
              title="Excluir categoria"
            >
              <Trash className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 pt-0 pb-3 sm:px-4 sm:pb-4">
        <div className="mb-2 flex justify-end">
          <Button
            size="sm"
            variant="default"
            className="h-7 bg-primary text-white hover:bg-primary/90 flex items-center px-3.5 text-xs rounded-md"
            onClick={handleAddResourceClick}
          >
            <Plus className="h-3.5 w-3.5 mr-2" />
            <span className="whitespace-nowrap font-medium">Adicionar</span>
          </Button>
        </div>
        
        {resources.length === 0 ? (
          <div className="text-center py-2 sm:py-3 px-2 sm:px-3 bg-dark/50 border border-dashed border-dark-border rounded-lg">
            <p className="text-gray-500 text-xs">Nenhum recurso nesta categoria</p>
          </div>
        ) : (
          <div className="grid gap-1 sm:gap-1.5">
            {resources.map((resource) => (
              <ResourceItem 
                key={resource.id} 
                resource={resource}
                onEdit={() => onEditResource(resource)}
              />
            ))}
          </div>
        )}
      </CardContent>
      
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
    </Card>
  );
}
