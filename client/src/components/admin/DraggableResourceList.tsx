import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Resource, Category } from "@shared/schema";
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
  DragOverlay,
  UniqueIdentifier
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/hooks/use-toast";
import { GripVertical } from "lucide-react";
import ResourceItem from "./ResourceItem";
import { apiRequest } from "@/lib/queryClient";

interface SortableResourceItemProps {
  id: string;
  resource: Resource;
  onEdit: () => void;
  categoryId: number;
  isDragging?: boolean;
}

export function SortableResourceItem({
  id,
  resource,
  onEdit,
  categoryId,
  isDragging
}: SortableResourceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id,
    data: {
      resource,
      categoryId,
      type: 'resource'
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    position: 'relative' as 'relative',
    zIndex: isDragging ? 1 : 'auto' as any
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab z-10 opacity-0 group-hover:opacity-70 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>
      <div className="pl-4">
        <ResourceItem
          resource={resource}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}

export function DraggableResourceItem({
  resource,
  onEdit,
  categoryId
}: {
  resource: Resource,
  onEdit: () => void,
  categoryId: number
}) {
  return (
    <div className="relative group">
      <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab z-10 opacity-0 group-hover:opacity-70 transition-opacity">
        <GripVertical className="w-3 h-3 text-gray-400" />
      </div>
      <div className="pl-4">
        <ResourceItem
          resource={resource}
          onEdit={onEdit}
        />
      </div>
    </div>
  );
}

interface DraggableResourceListProps {
  categories: Category[];
  getResourcesByCategory: (categoryId: number) => Resource[];
  onEditResource: (resource: Resource) => void;
  onResourceMove?: (resourceId: number, fromCategoryId: number, toCategoryId: number) => void;
}

export default function DraggableResourceList({
  categories,
  getResourcesByCategory,
  onEditResource,
  onResourceMove
}: DraggableResourceListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  // Para cada categoria, obter seus recursos
  const resourcesByCategory = categories.reduce((acc, category) => {
    acc[category.id] = getResourcesByCategory(category.id);
    return acc;
  }, {} as Record<number, Resource[]>);

  // Sensors para detectar eventos de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // O formato do ID é "resource-resourceId-categoryId"
    const idParts = active.id.toString().split('-');
    if (idParts[0] === 'resource' && idParts.length === 3) {
      const resourceId = parseInt(idParts[1]);
      const categoryId = parseInt(idParts[2]);
      
      // Encontrar o recurso ativo
      const resource = resourcesByCategory[categoryId]?.find(r => r.id === resourceId);
      if (resource) {
        setActiveResource(resource);
        setActiveCategoryId(categoryId);
      }
    }
    
    setActiveId(active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Sem operações adicionais necessárias aqui por enquanto
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveResource(null);
      setActiveCategoryId(null);
      return;
    }
    
    // Extrair IDs do formato "resource-resourceId-categoryId"
    const activeIdParts = active.id.toString().split('-');
    const overIdParts = over.id.toString().split('-');
    
    // Verificar se estamos arrastando um recurso
    if (activeIdParts[0] === 'resource' && activeIdParts.length === 3) {
      const resourceId = parseInt(activeIdParts[1]);
      const fromCategoryId = parseInt(activeIdParts[2]);
      
      // Verificar se estamos largando sobre outro recurso ou sobre uma categoria
      if (overIdParts[0] === 'resource' && overIdParts.length === 3) {
        // Recurso sobre recurso
        const toCategoryId = parseInt(overIdParts[2]);
        
        if (fromCategoryId !== toCategoryId) {
          // Mover para outra categoria
          try {
            // Chamar callback para persistir a mudança
            if (onResourceMove) {
              onResourceMove(resourceId, fromCategoryId, toCategoryId);
            }
            
            // Atualizar no backend
            await apiRequest("PATCH", `/api/resources/${resourceId}`, {
              categoryId: toCategoryId
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
              description: "Ocorreu um erro ao mover o recurso para outra categoria.",
              variant: "destructive",
            });
          }
        }
      } else if (overIdParts[0] === 'category' && overIdParts.length === 2) {
        // Recurso sobre categoria
        const toCategoryId = parseInt(overIdParts[1]);
        
        if (fromCategoryId !== toCategoryId) {
          // Mover para outra categoria
          try {
            // Chamar callback para persistir a mudança
            if (onResourceMove) {
              onResourceMove(resourceId, fromCategoryId, toCategoryId);
            }
            
            // Atualizar no backend
            await apiRequest("PATCH", `/api/resources/${resourceId}`, {
              categoryId: toCategoryId
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
              description: "Ocorreu um erro ao mover o recurso para outra categoria.",
              variant: "destructive",
            });
          }
        }
      }
    }
    
    setActiveId(null);
    setActiveResource(null);
    setActiveCategoryId(null);
  };

  const findResource = (id: UniqueIdentifier): [Resource | undefined, number | undefined] => {
    // O formato do ID é "resource-resourceId-categoryId"
    const idParts = id.toString().split('-');
    if (idParts[0] === 'resource' && idParts.length === 3) {
      const resourceId = parseInt(idParts[1]);
      const categoryId = parseInt(idParts[2]);
      
      const resource = resourcesByCategory[categoryId]?.find(r => r.id === resourceId);
      return [resource, categoryId];
    }
    
    return [undefined, undefined];
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {categories.map((category) => {
          const categoryResources = resourcesByCategory[category.id] || [];
          
          return (
            <div 
              key={category.id} 
              id={`category-${category.id}`}
              className="p-2 border border-dashed border-gray-700 rounded-lg"
              data-category-id={category.id}
            >
              <h3 className="text-white font-medium mb-2">{category.name}</h3>
              
              <SortableContext 
                items={categoryResources.map(r => `resource-${r.id}-${category.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1.5">
                  {categoryResources.map((resource) => (
                    <SortableResourceItem
                      key={`resource-${resource.id}-${category.id}`}
                      id={`resource-${resource.id}-${category.id}`}
                      resource={resource}
                      onEdit={() => onEditResource(resource)}
                      categoryId={category.id}
                      isDragging={activeId === `resource-${resource.id}-${category.id}`}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
      
      <DragOverlay>
        {activeId && activeResource && activeCategoryId !== null && (
          <ResourceItem 
            resource={activeResource}
            onEdit={() => onEditResource(activeResource)}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}