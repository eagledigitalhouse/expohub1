import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Category, insertCategorySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconName } from "@/lib/types";

const iconOptions: { value: IconName; label: string }[] = [
  { value: "CheckCircle", label: "Checkmark" },
  { value: "Calendar", label: "Calendar" },
  { value: "Package", label: "Package" },
  { value: "Clock", label: "Clock" },
  { value: "Users", label: "Users" },
  { value: "Image", label: "Image" },
  { value: "MegaPhone", label: "Megaphone" },
  { value: "FileText", label: "Document" },
  { value: "Info", label: "Information" },
  { value: "AlertTriangle", label: "Alert" },
];

const categoryFormSchema = insertCategorySchema.extend({
  id: z.number().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category?: Category;
  onClose: () => void;
}

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || "",
      icon: category?.icon || "Package",
    },
  });
  
  const saveCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormValues) => {
      if (category?.id) {
        return apiRequest("PUT", `/api/categories/${category.id}`, data);
      } else {
        return apiRequest("POST", "/api/categories", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoria salva",
        description: "A categoria foi salva com sucesso.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar categoria",
        description: "Ocorreu um erro ao salvar a categoria.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: CategoryFormValues) => {
    saveCategoryMutation.mutate(data);
  };
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-surface border-dark-border">
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o nome da categoria" 
                      {...field} 
                      className="bg-dark"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-dark">
                        <SelectValue placeholder="Selecione um ícone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-surface border-dark-border">
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={saveCategoryMutation.isPending}
              >
                {saveCategoryMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
