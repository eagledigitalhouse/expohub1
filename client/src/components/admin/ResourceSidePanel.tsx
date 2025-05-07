import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Eye, Check, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Resource, ContentBlock, insertResourceSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import BlockList from "./BlockList";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getEmptyBlockContent, blockTypeConfigs } from "@/lib/utils";
import { ResourceWithBlocks } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResourceSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  editingResource: Resource | null;
  categories: any[];
  onPreview: (resourceWithBlocks: ResourceWithBlocks) => void;
}

const resourceFormSchema = insertResourceSchema.extend({
  id: z.number().optional(),
});

export default function ResourceSidePanel({ 
  isOpen, 
  onClose, 
  editingResource, 
  categories,
  onPreview
}: ResourceSidePanelProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [showAddBlockMenu, setShowAddBlockMenu] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof resourceFormSchema>>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: 0,
      readTime: 5
    },
  });
  
  // When editing resource, load its blocks
  const { data: resourceBlocks = [] } = useQuery<ContentBlock[]>({
    queryKey: editingResource ? [`/api/resources/${editingResource.id}/blocks`] : ['no-blocks'],
    enabled: !!editingResource,
  });
  
  // Set form values when editing resource
  useEffect(() => {
    if (editingResource) {
      form.reset({
        id: editingResource.id,
        title: editingResource.title,
        description: editingResource.description || "",
        categoryId: editingResource.categoryId,
        readTime: editingResource.readTime || 5
      });
    } else {
      const firstCategoryId = categories && categories.length > 0 ? categories[0].id : 0;
      form.reset({
        title: "",
        description: "",
        categoryId: firstCategoryId,
        readTime: 5
      });
    }
  }, [editingResource, form, categories]);
  
  // Set blocks when resourceBlocks is loaded
  useEffect(() => {
    setBlocks(resourceBlocks);
  }, [resourceBlocks]);
  
  const saveResourceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof resourceFormSchema>) => {
      if (data.id) {
        // Update existing resource
        return apiRequest("PUT", `/api/resources/${data.id}`, data);
      } else {
        // Create new resource
        return apiRequest("POST", "/api/resources", data);
      }
    },
    onSuccess: async (response) => {
      const savedResource: Resource = await response.json();
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      toast({
        title: "Recurso salvo",
        description: "O recurso foi salvo com sucesso.",
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar recurso",
        description: "Ocorreu um erro ao salvar o recurso.",
        variant: "destructive",
      });
    },
  });
  
  const handleAddBlock = (blockType: string) => {
    setShowAddBlockMenu(false);
    
    // Create a new block
    const newBlock: Partial<ContentBlock> = {
      resourceId: editingResource?.id || 0,
      blockType,
      title: `Novo Bloco ${blockTypeConfigs[blockType].label}`,
      description: "",
      content: getEmptyBlockContent(blockType),
      order: blocks.length
    };
    
    if (editingResource?.id) {
      // Save block to API if resource exists
      saveBlockMutation.mutate(newBlock as ContentBlock);
    } else {
      // Otherwise just add to local state (will be saved after resource creation)
      setBlocks([...blocks, newBlock as ContentBlock]);
    }
  };

  const saveBlockMutation = useMutation({
    mutationFn: async (block: ContentBlock) => {
      if (block.id) {
        // Update existing block
        return apiRequest("PUT", `/api/blocks/${block.id}`, block);
      } else {
        // Create new block
        return apiRequest("POST", "/api/blocks", block);
      }
    },
    onSuccess: async (response) => {
      const savedBlock: ContentBlock = await response.json();
      
      if (editingResource) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/resources/${editingResource.id}/blocks`] 
        });
        
        // Update blocks array with the new block
        setBlocks(prevBlocks => {
          const blockIndex = prevBlocks.findIndex(b => b.id === savedBlock.id);
          if (blockIndex >= 0) {
            // Update existing block
            const updatedBlocks = [...prevBlocks];
            updatedBlocks[blockIndex] = savedBlock;
            return updatedBlocks;
          } else {
            // Add new block
            return [...prevBlocks, savedBlock];
          }
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar bloco",
        description: "Ocorreu um erro ao salvar o bloco de conteúdo.",
        variant: "destructive",
      });
    },
  });
  
  const handleBlockChange = (updatedBlock: ContentBlock) => {
    if (editingResource?.id) {
      // Save to API
      saveBlockMutation.mutate(updatedBlock);
    } else {
      // Update local state
      setBlocks(prevBlocks => {
        const blockIndex = prevBlocks.findIndex(b => b.id === updatedBlock.id);
        if (blockIndex >= 0) {
          const updatedBlocks = [...prevBlocks];
          updatedBlocks[blockIndex] = updatedBlock;
          return updatedBlocks;
        }
        return prevBlocks;
      });
    }
  };
  
  const handleBlockDelete = (blockId: number) => {
    if (editingResource?.id) {
      // Delete from API
      deleteBlockMutation.mutate(blockId);
    } else {
      // Remove from local state
      setBlocks(prevBlocks => prevBlocks.filter(b => b.id !== blockId));
    }
  };
  
  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: number) => {
      return apiRequest("DELETE", `/api/blocks/${blockId}`);
    },
    onSuccess: () => {
      if (editingResource) {
        queryClient.invalidateQueries({ 
          queryKey: [`/api/resources/${editingResource.id}/blocks`] 
        });
      }
      
      toast({
        title: "Bloco excluído",
        description: "O bloco de conteúdo foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir bloco",
        description: "Ocorreu um erro ao excluir o bloco de conteúdo.",
        variant: "destructive",
      });
    },
  });
  
  const handleReorderBlocks = (reorderedBlocks: ContentBlock[]) => {
    setBlocks(reorderedBlocks);
    
    if (editingResource?.id) {
      // Save new order to API
      const blockIds = reorderedBlocks.map(block => block.id);
      reorderBlocksMutation.mutate({
        resourceId: editingResource.id,
        blockIds
      });
    }
  };
  
  const reorderBlocksMutation = useMutation({
    mutationFn: async ({ resourceId, blockIds }: { resourceId: number, blockIds: number[] }) => {
      return apiRequest("POST", `/api/resources/${resourceId}/blocks/reorder`, { blockIds });
    },
    onSuccess: async (response) => {
      const updatedBlocks: ContentBlock[] = await response.json();
      setBlocks(updatedBlocks);
    },
    onError: (error) => {
      toast({
        title: "Erro ao reordenar blocos",
        description: "Ocorreu um erro ao reordenar os blocos de conteúdo.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: z.infer<typeof resourceFormSchema>) => {
    saveResourceMutation.mutate(data);
  };
  
  const handlePreview = () => {
    const formData = form.getValues();
    // Ensure all required fields are present
    const previewResource: Resource = {
      id: editingResource?.id || 0,
      title: formData.title,
      description: formData.description || null,
      categoryId: formData.categoryId,
      readTime: formData.readTime || 5,
      createdAt: editingResource?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    onPreview({
      resource: previewResource,
      blocks: blocks || []
    });
  };

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      <div 
        className="bg-background/70 backdrop-blur-sm absolute inset-0"
        onClick={onClose}
      />
      
      <div className="ml-auto relative bg-dark-surface border-l border-dark-border h-full w-full max-w-5xl flex flex-col shadow-xl animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-6 border-b border-dark-border">
          <h2 className="text-xl font-bold text-white">
            {editingResource ? "Editar Recurso" : "Adicionar Novo Recurso"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="p-6 border-b border-dark-border">
            <Form {...form}>
              <div className="space-y-5">
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
                          value={field.value.toString()}
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
              </div>
            </Form>
          </div>
          
          <div className="p-6 border-b border-dark-border">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-medium text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Blocos de Conteúdo
              </h3>
              <Button 
                onClick={() => setShowAddBlockMenu(true)}
                className="bg-primary/20 hover:bg-primary/30 text-primary hover:text-primary"
                variant="outline"
                size="sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Adicionar Bloco
              </Button>
            </div>
            
            {blocks.length === 0 ? (
              <div className="text-center py-10 px-4 bg-dark border border-dashed border-dark-border rounded-lg">
                <div className="text-3xl mb-3">📄</div>
                <h3 className="text-lg font-medium text-white mb-1">Nenhum bloco de conteúdo</h3>
                <p className="text-gray-400 mb-4">Adicione blocos para compor o conteúdo deste recurso</p>
                <Button 
                  onClick={() => setShowAddBlockMenu(true)}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Bloco
                </Button>
              </div>
            ) : (
              <BlockList 
                blocks={blocks} 
                onBlockChange={handleBlockChange}
                onBlockDelete={handleBlockDelete}
                onReorderBlocks={handleReorderBlocks}
              />
            )}
          </div>
        </div>
        
        <div className="p-6 border-t border-dark-border mt-auto">
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancelar
            </Button>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
                onClick={handlePreview}
              >
                <Eye className="mr-2 h-5 w-5" />
                Pré-visualizar
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={form.handleSubmit(onSubmit)}
                disabled={saveResourceMutation.isPending}
              >
                <Check className="mr-2 h-5 w-5" />
                Salvar Recurso
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Block Type Menu */}
      <Dialog open={showAddBlockMenu} onOpenChange={setShowAddBlockMenu}>
        <DialogContent className="bg-dark-surface border-dark-border">
          <DialogHeader>
            <DialogTitle>Selecione o tipo de bloco</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(blockTypeConfigs).map(([blockType, config]) => (
              <Button
                key={blockType}
                variant="outline"
                className="justify-start border-dark-border hover:border-primary hover:bg-dark"
                onClick={() => handleAddBlock(blockType)}
              >
                <div className="flex items-center">
                  <span className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
                    {React.createElement(config.icon, { size: 18 })}
                  </span>
                  <div>
                    <span className="font-medium">{config.label}</span>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}