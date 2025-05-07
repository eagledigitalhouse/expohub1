import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import CategoryItem from "./CategoryItem";
import ResourceItem from "./ResourceItem";

interface DraggableResourceListProps {
  categories: Category[];
  getResourcesByCategory: (categoryId: number) => Resource[];
  onEditResource: (resource: Resource) => void;
  onMoveResource?: (resourceId: number, targetCategoryId: number) => void;
}

export default function DraggableResourceList({
  categories,
  getResourcesByCategory,
  onEditResource,
  onMoveResource
}: DraggableResourceListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event) => {
        return {
          x: 0,
          y: 0,
        };
      },
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
          
          // Notificar que o recurso foi movido
          if (onMoveResource) {
            onMoveResource(resourceId, targetCategoryId);
          } else {
            toast({
              title: "Recurso movido",
              description: "O recurso foi movido para outra categoria.",
            });
          }
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
        {categories.map((category) => {
          const resources = getResourcesByCategory(category.id);
          const isOver = overCategoryId === category.id;
          
          return (
            <div 
              key={category.id}
              id={category.id.toString()}
              className={`transition-all ${isOver ? 'ring-2 ring-primary/70 rounded-lg' : ''}`}
            >
              <CategoryItem
                category={category}
                resources={resources}
                onEditResource={onEditResource}
                onAddResource={() => {}}
              />
            </div>
          );
        })}
      </div>
      
      <DragOverlay adjustScale={true} dropAnimation={{
        duration: 150,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeId && activeResource && activeId.startsWith('resource-') && (
          <div className="opacity-95 w-full max-w-md shadow-lg">
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