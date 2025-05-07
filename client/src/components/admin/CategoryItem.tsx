import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
import { Settings, Plus, FileText } from "lucide-react";
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
      <CardHeader className="p-4 pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center min-w-0 pr-2">
            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
              <CategoryIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg text-white truncate leading-tight" title={category.name}>
                {category.name}
              </CardTitle>
              <div className="flex items-center mt-1">
                <Badge className="h-6 px-2.5 bg-primary/15 text-primary border-0 font-medium text-xs">
                  {resources.length} recurso{resources.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/5"
              onClick={handleEditClick}
              title="Configurações da categoria"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 py-3 flex-grow">
        {resources.length === 0 ? (
          <div className="text-center py-6 px-3 bg-dark/50 border border-dashed border-dark-border rounded-lg mb-2">
            <p className="text-gray-400 text-sm">Nenhum recurso nesta categoria</p>
          </div>
        ) : (
          <div className="grid gap-2">
            {resources.map((resource) => (
              <div 
                key={resource.id} 
                id={`resource-${resource.id}`} 
                data-category-id={category.id} 
                className="resource-item group hover:cursor-grab active:cursor-grabbing"
              >
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="flex flex-col space-y-1">
                      <div className="w-4 h-0.5 bg-gray-400 rounded-full"></div>
                      <div className="w-4 h-0.5 bg-gray-400 rounded-full"></div>
                      <div className="w-4 h-0.5 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  <ResourceItem 
                    resource={resource}
                    onEdit={() => onEditResource(resource)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <div className="px-4 pb-4 pt-2 mt-auto border-t border-dark-border/30">
        <Button
          size="default"
          variant="default"
          className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-2"
          onClick={handleAddResourceClick}
        >
          <Plus className="h-4 w-4" />
          <span className="whitespace-nowrap font-medium">Adicionar Recurso</span>
        </Button>
      </div>
      
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
