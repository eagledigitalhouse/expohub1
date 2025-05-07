import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
import { Edit, Trash, Plus, ChevronDown, ChevronUp, FileText } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

interface CategoryAccordionProps {
  category: Category;
  resources: Resource[];
  onEditResource: (resource: Resource) => void;
  onAddResource: (categoryId: number) => void;
}

export default function CategoryAccordion({ 
  category, 
  resources, 
  onEditResource,
  onAddResource
}: CategoryAccordionProps) {
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
  
  const handleAddResourceClick = () => {
    onAddResource(category.id);
  };
  
  return (
    <>
      <Accordion type="single" collapsible defaultValue={category.id.toString()} className="w-full">
        <AccordionItem value={category.id.toString()} className="border-dark-border bg-dark-surface rounded-lg overflow-hidden mb-0">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-start">
                <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3 mt-0.5">
                  <CategoryIcon className="h-5 w-5" />
                </div>
                <div className="text-left flex items-center">
                  <div className="text-lg font-medium text-white leading-5">{category.name}</div>
                  <Badge className="ml-2 h-5 px-2 bg-primary/15 text-primary border-0 font-medium text-xs">
                    {resources.length}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 mr-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-gray-400 hover:text-primary hover:bg-primary/5"
                  onClick={handleEditClick}
                  title="Editar categoria"
                >
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-gray-400 hover:text-destructive hover:bg-destructive/5"
                  onClick={handleDeleteClick}
                  title="Excluir categoria"
                >
                  <Trash className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-3 px-4">
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
              <div className="text-center py-3 px-3 bg-dark/50 border border-dashed border-dark-border rounded-lg">
                <p className="text-gray-500 text-xs">Nenhum recurso nesta categoria</p>
              </div>
            ) : (
              <div className="grid gap-1.5">
                {resources.map((resource) => (
                  <ResourceItem 
                    key={resource.id} 
                    resource={resource}
                    onEdit={() => onEditResource(resource)}
                  />
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
    </>
  );
}