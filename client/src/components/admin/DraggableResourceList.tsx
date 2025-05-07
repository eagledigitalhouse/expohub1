import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ResourceItem from "./ResourceItem";
import { GripVertical } from "lucide-react";

// Componente para um recurso que pode ser arrastado
interface DraggableItemProps {
  resource: Resource;
  categoryId: number;
  onEdit: () => void;
}

function DraggableItem({ resource, categoryId, onEdit }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: `resource-${resource.id}`,
    data: {
      type: 'resource',
      resource,
      categoryId
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group cursor-grab active:cursor-grabbing"
    >
      <div className="relative flex">
        <div className="absolute left-3 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className="w-full pl-12">
          <ResourceItem
            resource={resource}
            onEdit={onEdit}
          />
        </div>
      </div>
    </div>
  );
}

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

  // Sensores para detectar eventos de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id.toString();
    
    setActiveId(activeId);
    
    if (activeId.startsWith('resource-')) {
      const data = active.data.current as any;
      if (data && data.resource) {
        setActiveResource(data.resource);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Se estivermos arrastando um recurso
    if (activeId.startsWith('resource-')) {
      // Se estamos sobre uma categoria
      if (typeof over.id === 'number') {
        setOverCategoryId(over.id as number);
      } 
      // Se estamos sobre outro recurso
      else if (overId.startsWith('resource-')) {
        const data = over.data.current as any;
        if (data && data.categoryId) {
          setOverCategoryId(data.categoryId);
        }
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !overCategoryId) {
      setActiveId(null);
      setActiveResource(null);
      setOverCategoryId(null);
      return;
    }
    
    const activeId = active.id.toString();
    
    // Se estamos movendo um recurso entre categorias
    if (activeId.startsWith('resource-')) {
      const resourceId = parseInt(activeId.split('-')[1]);
      const resourceData = active.data.current as any;
      
      if (resourceData && resourceData.categoryId !== overCategoryId) {
        try {
          // Callback para atualizar a UI
          if (onMoveResource) {
            onMoveResource(resourceId, overCategoryId);
          }
          
          // Atualizar no backend
          await apiRequest("PATCH", `/api/resources/${resourceId}`, {
            categoryId: overCategoryId
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
    
    setActiveId(null);
    setActiveResource(null);
    setOverCategoryId(null);
  };

  // Agrupar todos os recursos por categoria
  const allResources: JSX.Element[] = [];
  categories.forEach(category => {
    const resources = getResourcesByCategory(category.id);
    const categoryResources = resources.map(resource => (
      <DraggableItem
        key={resource.id}
        resource={resource}
        categoryId={category.id}
        onEdit={() => onEditResource(resource)}
      />
    ));
    
    if (categoryResources.length > 0) {
      allResources.push(
        <div key={`category-${category.id}`} className="mb-4">
          <div 
            className={`mb-2 px-3 py-2 rounded-md ${overCategoryId === category.id 
              ? 'bg-primary/15 ring-1 ring-primary/40' 
              : 'bg-dark-surface'}`}
            id={category.id.toString()}
          >
            <h3 className="text-white text-base font-medium flex items-center">
              <span className="h-2 w-2 rounded-full bg-primary mr-2"></span>
              {category.name}
              <span className="ml-2 text-xs text-gray-400">({resources.length})</span>
            </h3>
          </div>
          <div className="pl-4 space-y-2">
            {categoryResources}
          </div>
        </div>
      );
    }
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-2">
        {allResources}
      </div>
      
      <DragOverlay>
        {activeId && activeResource && (
          <div className="opacity-95 w-full max-w-md">
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