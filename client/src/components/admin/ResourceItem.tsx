import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
import { Edit, Trash, Clock } from "lucide-react";
import { formatDisplayDate, getIconByName } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
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
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ResourceItemProps {
  resource: Resource;
  onEdit: () => void;
}

export default function ResourceItem({ resource, onEdit }: ResourceItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get appropriate icon based on resource title
  const getResourceIcon = () => {
    if (resource.title.toLowerCase().includes("checklist")) {
      return getIconByName("FileCheck");
    } else if (resource.title.toLowerCase().includes("documento")) {
      return getIconByName("FileText");
    } else if (resource.title.toLowerCase().includes("orientações")) {
      return getIconByName("Info");
    } else if (resource.title.toLowerCase().includes("horário")) {
      return getIconByName("Clock");
    } else if (resource.title.toLowerCase().includes("contato")) {
      return getIconByName("Users");
    } else if (resource.title.toLowerCase().includes("gráfico")) {
      return getIconByName("Image");
    } else if (resource.title.toLowerCase().includes("anúncio") || resource.title.toLowerCase().includes("redes")) {
      return getIconByName("MegaPhone");
    } else {
      return getIconByName("FileText");
    }
  };
  
  const ResourceIcon = getResourceIcon();
  
  const { date } = formatDisplayDate(resource.updatedAt);
  
  const deleteResourceMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/resources/${resource.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      toast({
        title: "Recurso excluído",
        description: "O recurso foi excluído com sucesso.",
      });
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir recurso",
        description: "Ocorreu um erro ao excluir o recurso.",
        variant: "destructive",
      });
    },
  });
  
  const handleEditClick = () => {
    onEdit();
  };
  
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = () => {
    deleteResourceMutation.mutate();
  };
  
  return (
    <>
      <div className="bg-dark border border-dark-border hover:border-primary/30 rounded-md p-2.5 flex justify-between items-center group">
        <div className="flex items-center">
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <ResourceIcon className="h-3.5 w-3.5" />
          </div>
          <div className="ml-2 overflow-hidden">
            <h4 className="text-white text-sm font-medium truncate">{resource.title}</h4>
            <div className="flex items-center text-xs text-gray-400 mt-0.5">
              <Clock className="h-2.5 w-2.5 mr-1" />
              <span className="text-[10px]">{date}</span>
              {resource.readTime && (
                <>
                  <span className="mx-1 text-[10px]">•</span>
                  <span className="text-[10px]">{resource.readTime} min</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-gray-400 hover:text-primary hover:bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleEditClick}
            title="Editar recurso"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-gray-400 hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDeleteClick}
            title="Excluir recurso"
          >
            <Trash className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-dark-surface border-dark-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Recurso</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o recurso "{resource.title}" e todos os seus blocos de conteúdo.
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
