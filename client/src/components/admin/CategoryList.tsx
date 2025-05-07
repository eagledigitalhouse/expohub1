import { useState, useEffect } from "react";
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
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import CategoryItem from "./CategoryItem";
import ResourceItem from "./ResourceItem";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface SortableCategoryProps {
  category: Category;
  resources: Resource[];
  onEditResource: (resource: Resource) => void;
  onAddResource: (categoryId: number) => void;
}

function SortableCategory({ category, resources, onEditResource, onAddResource }: SortableCategoryProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative" {...attributes} {...listeners}>
      <CategoryItem
        category={category}
        resources={resources}
        onEditResource={onEditResource}
        onAddResource={onAddResource}
      />
    </div>
  );
}

interface CategoryListProps {
  categories: Category[];
  getResourcesByCategory: (categoryId: number) => Resource[];
  onEditResource: (resource: Resource) => void;
  onAddResource: (categoryId: number) => void;
  onReorderCategories?: (categories: Category[]) => void;
}

// Componente para um item de recurso que pode ser arrastado
interface DraggableResourceItemProps {
  resource: Resource;
  categoryId: number;
  onEdit: () => void;
}

function DraggableResourceItem({ resource, categoryId, onEdit }: DraggableResourceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
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
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="relative cursor-grab active:cursor-grabbing"
    >
      <ResourceItem
        resource={resource}
        onEdit={onEdit}
      />
    </div>
  );
}

export default function CategoryList({ 
  categories,
  getResourcesByCategory,
  onEditResource,
  onAddResource,
  onReorderCategories
}: CategoryListProps) {
  const [items, setItems] = useState<Category[]>(categories);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Atualizar items quando as categorias mudam
  useEffect(() => {
    setItems(categories);
  }, [categories]);

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
    const activeId = active.id.toString();
    
    setActiveId(activeId);
    
    // Se for um recurso sendo arrastado
    if (activeId.startsWith('resource-')) {
      const resourceId = parseInt(activeId.split('-')[1]);
      const data = active.data.current;
      
      if (data && data.resource) {
        setActiveResource(data.resource);
      } else {
        // Procura o recurso com esse ID
        for (const category of categories) {
          const resources = getResourcesByCategory(category.id);
          const resource = resources.find(r => r.id === resourceId);
          if (resource) {
            setActiveResource(resource);
            break;
          }
        }
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
      let newCategoryId = null;
      
      // Se estamos sobre uma categoria
      if (typeof over.id === 'number') {
        newCategoryId = over.id as number;
      } 
      // Se estamos sobre outro recurso
      else if (overId.startsWith('resource-')) {
        const data = over.data.current;
        if (data && data.categoryId) {
          newCategoryId = data.categoryId;
        }
      }
      
      if (newCategoryId !== null) {
        setOverCategoryId(newCategoryId);
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
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Se estamos reordenando categorias
    if (!activeId.startsWith('resource-') && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        // Opcional: Persistir a ordem no backend
        if (onReorderCategories) {
          onReorderCategories(reorderedItems);
        }
        
        return reorderedItems;
      });
    }
    // Se estamos movendo um recurso entre categorias
    else if (activeId.startsWith('resource-')) {
      // Determinar o ID do recurso sendo arrastado
      const resourceId = parseInt(activeId.split('-')[1]);
      const resourceData = active.data.current as any;
      
      // Determinar a categoria de destino
      let targetCategoryId = overCategoryId;
      
      // Se o recurso foi solto sobre outro recurso, pegamos a categoria desse recurso
      if (overId.startsWith('resource-')) {
        const overData = over.data.current as any;
        if (overData && overData.categoryId) {
          targetCategoryId = overData.categoryId;
        }
      }
      
      // Se a categoria destino não for encontrada ou for a mesma, não fazemos nada
      if (!targetCategoryId || (resourceData && resourceData.categoryId === targetCategoryId)) {
        setActiveId(null);
        setActiveResource(null);
        setOverCategoryId(null);
        return;
      }
      
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
          description: "Ocorreu um erro ao mover o recurso para outra categoria.",
          variant: "destructive",
        });
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
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
        <SortableContext 
          items={items.map(item => item.id)}
          strategy={horizontalListSortingStrategy}
        >
          {items.map((category) => {
            const resources = getResourcesByCategory(category.id);
            const isOver = overCategoryId === category.id;
            
            return (
              <div 
                key={category.id}
                className={`relative transition-all ${isOver ? 'ring-2 ring-primary shadow-lg shadow-primary/20 ring-opacity-70 rounded-lg scale-[1.01]' : ''}`}
              >
                <SortableCategory
                  category={category}
                  resources={resources}
                  onEditResource={onEditResource}
                  onAddResource={onAddResource}
                />
                {isOver && (
                  <div className="absolute inset-0 bg-primary/5 rounded-lg pointer-events-none z-0"></div>
                )}
              </div>
            );
          })}
        </SortableContext>
      </div>
      
      <DragOverlay>
        {activeId && !activeId.startsWith('resource-') && (
          <div className="opacity-90 w-full max-w-sm">
            <SortableCategory
              category={items.find(item => item.id.toString() === activeId) || items[0]}
              resources={[]}
              onEditResource={() => {}}
              onAddResource={() => {}}
            />
          </div>
        )}
        {activeId && activeResource && activeId.startsWith('resource-') && (
          <div className="opacity-90 w-full max-w-sm shadow-xl">
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