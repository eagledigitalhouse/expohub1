import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
import { Edit, Trash } from "lucide-react";
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
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
  
  const handleConfirmDelete = () => {
    deleteResourceMutation.mutate();
  };
  
  return (
    <>
      <div className="bg-dark border border-dark-border rounded-md p-3 flex justify-between items-center">
        <div className="flex items-center">
          <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ResourceIcon className="h-4 w-4" />
          </span>
          <div className="ml-3">
            <h4 className="text-white">{resource.title}</h4>
            <p className="text-xs text-gray-400">Última atualização: {date}</p>
          </div>
        </div>
        <div className="flex items-center">
          <button 
            className="p-1.5 text-gray-400 hover:text-white rounded-md transition-colors"
            onClick={handleEditClick}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button 
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
            onClick={handleDeleteClick}
          >
            <Trash className="h-4 w-4" />
          </button>
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
