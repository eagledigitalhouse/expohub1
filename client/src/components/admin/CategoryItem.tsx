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
    <Card className="bg-dark-surface border-dark-border">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">{category.name}</CardTitle>
              <div className="flex items-center mt-1">
                <Badge variant="outline" className="bg-dark/80 border-primary/30 text-primary/80">
                  {resources.length} {resources.length === 1 ? 'recurso' : 'recursos'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 border-dark-border hover:border-primary hover:bg-dark flex items-center"
              onClick={handleEditClick}
            >
              <Edit className="h-4 w-4 mr-1.5" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 border-dark-border hover:border-destructive hover:text-destructive flex items-center"
              onClick={handleDeleteClick}
            >
              <Trash className="h-4 w-4 mr-1.5" />
              Excluir
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="mb-3 flex justify-between items-center">
          <div className="flex items-center">
            <FileText className="h-4 w-4 text-gray-400 mr-2" />
            <h3 className="text-sm font-medium text-gray-400">Recursos</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-primary hover:text-primary-light hover:bg-primary/5 flex items-center px-2.5"
            onClick={handleAddResourceClick}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar
          </Button>
        </div>
        
        {resources.length === 0 ? (
          <div className="text-center py-5 px-4 bg-dark/50 border border-dashed border-dark-border rounded-lg">
            <p className="text-gray-500 text-sm">Nenhum recurso nesta categoria</p>
          </div>
        ) : (
          <div className="grid gap-2">
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
