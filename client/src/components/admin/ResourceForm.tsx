import { useState } from "react";
import { Resource } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertResourceSchema } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const resourceFormSchema = insertResourceSchema.extend({
  id: z.number().optional(),
});

type ResourceFormValues = z.infer<typeof resourceFormSchema>;

interface ResourceFormProps {
  resource?: Resource;
  categories: any[];
  onClose: () => void;
  onSave: (data: ResourceFormValues) => void;
}

export default function ResourceForm({ resource, categories, onClose, onSave }: ResourceFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      id: resource?.id,
      title: resource?.title || "",
      description: resource?.description || "",
      categoryId: resource?.categoryId || (categories.length > 0 ? categories[0].id : 0),
      readTime: resource?.readTime || 5,
    },
  });
  
  const onSubmit = (data: ResourceFormValues) => {
    onSave(data);
    handleClose();
  };
  
  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-dark-surface border-dark-border">
        <DialogHeader>
          <DialogTitle>{resource ? "Editar Recurso" : "Novo Recurso"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Recurso</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Digite o título do recurso" 
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Digite uma breve descrição" 
                      {...field} 
                      className="bg-dark"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-dark">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-dark-surface border-dark-border">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="readTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo de Leitura (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min={1}
                        max={60}
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        className="bg-dark"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
              >
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
