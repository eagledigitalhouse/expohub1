import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
import { 
  DndContext, 
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useToast } from "@/hooks/use-toast";
import { Plus, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import ResourceItem from "./ResourceItem";
import { getIconByName } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TrelloBoardProps {
  categories: Category[];
  getResourcesByCategory: (categoryId: number) => Resource[];
  onEditResource: (resource: Resource) => void;
  onAddResource: (categoryId: number) => void;
  onEditCategory: (category: Category) => void;
}

export default function TrelloBoard({
  categories,
  getResourcesByCategory,
  onEditResource,
  onAddResource,
  onEditCategory
}: TrelloBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Configuração para o mouse requer um pequeno movimento para iniciar o arrasto
      activationConstraint: {
        distance: 5, // Distância em pixels antes de iniciar o arrasto
      }
    }),
    useSensor(TouchSensor, {
      // Configuração para touch é um pouco mais sensível
      activationConstraint: {
        delay: 150, // Pequeno delay em ms antes de iniciar o arrasto
        tolerance: 5, // Tolerância em pixels para considerar um toque como arrasto
      }
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
    
    // Se estamos arrastando um recurso
    if (active.id.toString().startsWith('resource-')) {
      const resourceId = parseInt(active.id.toString().split('-')[1]);
      const resources = categories.flatMap(category => 
        getResourcesByCategory(category.id));
      const resource = resources.find(r => r.id === resourceId);
      
      if (resource) {
        setActiveResource(resource);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Só nos importamos com mover recursos entre categorias
    if (active.id.toString().startsWith('resource-')) {
      // Verificar se estamos sobre uma categoria
      const overId = over.id.toString();
      
      // Se está sobre uma categoria
      if (!overId.startsWith('resource-')) {
        const categoryId = parseInt(overId);
        setOverCategoryId(categoryId);
      } 
      // Se está sobre outro recurso, determine a categoria desse recurso
      else {
        const resourceId = parseInt(overId.split('-')[1]);
        const resources = categories.flatMap(category => 
          getResourcesByCategory(category.id));
        const resource = resources.find(r => r.id === resourceId);
        
        if (resource) {
          setOverCategoryId(resource.categoryId);
        }
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveResource(null);
      setOverCategoryId(null);
      return;
    }
    
    // Só nos importamos com mover recursos entre categorias
    if (active.id.toString().startsWith('resource-')) {
      const resourceId = parseInt(active.id.toString().split('-')[1]);
      const overId = over.id.toString();
      
      // Determinar a categoria destino
      let targetCategoryId = overCategoryId;
      
      // Se o recurso foi solto em outro recurso
      if (overId.startsWith('resource-')) {
        const overResourceId = parseInt(overId.split('-')[1]);
        const resources = categories.flatMap(category => 
          getResourcesByCategory(category.id));
        const resource = resources.find(r => r.id === overResourceId);
        
        if (resource) {
          targetCategoryId = resource.categoryId;
        }
      }
      // Se foi solto diretamente em uma categoria
      else if (!isNaN(parseInt(overId))) {
        targetCategoryId = parseInt(overId);
      }
      
      // Verificar se o recurso ativo existe e tem uma categoria diferente da destino
      if (activeResource && targetCategoryId && activeResource.categoryId !== targetCategoryId) {
        try {
          // Atualizar no backend
          await apiRequest("PATCH", `/api/resources/${resourceId}`, {
            categoryId: targetCategoryId
          });
          
          // Invalidar queries
          queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
          
          toast({
            title: "Recurso movido",
            description: "O recurso foi movido para outra categoria.",
          });
        } catch (error) {
          toast({
            title: "Erro ao mover recurso",
            description: "Ocorreu um erro ao mover o recurso.",
            variant: "destructive",
          });
        }
      }
    }
    
    setActiveId(null);
    setActiveResource(null);
    setOverCategoryId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="flex gap-6 pb-6 overflow-x-auto py-4 px-2 min-h-[calc(100vh-150px)]">
        {categories.map((category) => {
          const resources = getResourcesByCategory(category.id);
          const CategoryIcon = getIconByName(category.icon as any || "Package");
          const isOver = overCategoryId === category.id;
          
          return (
            <div 
              key={category.id}
              id={category.id.toString()}
              className={`flex flex-col flex-shrink-0 bg-dark-surface border border-dark-border rounded-lg w-[320px] shadow-md ${
                isOver ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
              }`}
            >
              {/* Cabeçalho */}
              <div className="p-3 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
                    <CategoryIcon className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium text-white truncate max-w-[150px]">{category.name}</h3>
                  <div className="ml-2 h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center text-primary">
                    <span className="text-xs font-medium">{resources.length}</span>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/5"
                  onClick={() => onEditCategory(category)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Recursos */}
              <div className="flex-grow p-2 space-y-2 overflow-y-auto max-h-[60vh]">
                {resources.length === 0 ? (
                  <div className="flex items-center justify-center h-20 border border-dashed border-dark-border rounded-md">
                    <p className="text-sm text-gray-400">Nenhum recurso</p>
                  </div>
                ) : (
                  <div>
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        id={`resource-${resource.id}`}
                        className="mb-2 cursor-grab active:cursor-grabbing"
                        data-resource-id={resource.id}
                        data-category-id={category.id}
                      >
                        <ResourceItem
                          resource={resource}
                          onEdit={() => onEditResource(resource)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Adicionar recurso */}
              <div className="p-2 pt-0">
                <Button
                  variant="default"
                  className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-2"
                  onClick={() => onAddResource(category.id)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Adicionar Recurso</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      
      <DragOverlay adjustScale={true} zIndex={999} dropAnimation={{
        duration: 150,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeId && activeResource && activeId.startsWith('resource-') && (
          <div className="w-[280px] opacity-95 shadow-xl">
            <ResourceItem 
              resource={activeResource}
              onEdit={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}