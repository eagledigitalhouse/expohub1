import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  PointerSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
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

// Componente Draggable para recursos
function DraggableResource({ 
  resource, 
  onEdit 
}: { 
  resource: Resource; 
  onEdit: (e?: React.MouseEvent) => void 
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `resource-${resource.id}`,
    data: { type: 'resource', resource }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`mb-3 cursor-grab touch-manipulation ${isDragging ? 'opacity-30' : ''}`}
    >
      <ResourceItem
        resource={resource}
        onEdit={onEdit}
      />
    </div>
  );
}

// Componente DroppableColumn para categorias
function DroppableColumn({ 
  category, 
  resources,
  isOver, 
  onEditCategory,
  onEditResource,
  onAddResource 
}: {
  category: Category;
  resources: Resource[];
  isOver: boolean;
  onEditCategory: (category: Category) => void;
  onEditResource: (resource: Resource) => void;
  onAddResource: (categoryId: number) => void;
}) {
  // Usamos useDraggable para tornar a coluna arrastável
  const { attributes, listeners, setNodeRef: setDragNodeRef, isDragging } = useDraggable({
    id: `category-${category.id}`,
    data: { type: 'category', category }
  });

  // Usamos useDroppable para tornar a coluna também um local para soltar recursos
  const { setNodeRef: setDropNodeRef } = useDroppable({
    id: `category-${category.id}`,
    data: { type: 'category', category }
  });

  // Combinamos as refs do useDraggable e useDroppable
  const setNodeRef = (node: HTMLElement | null) => {
    setDragNodeRef(node);
    setDropNodeRef(node);
  };

  const CategoryIcon = getIconByName(category.icon as any || "Package");

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col flex-shrink-0 bg-dark-surface border border-dark-border rounded-lg w-[320px] shadow-md transition-all duration-200 ${
        isOver ? 'ring-2 ring-primary shadow-lg shadow-primary/20 border-primary/30 bg-primary/5' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* Cabeçalho - Arrastável */}
      <div 
        className="p-3 border-b border-dark-border flex items-center justify-between cursor-move"
        {...listeners}
        {...attributes}
      >
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
          onClick={(e) => {
            e.stopPropagation();
            onEditCategory(category);
          }}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Recursos */}
      <div className="flex-grow p-2 space-y-2 overflow-y-auto max-h-[60vh]">
        {resources.length === 0 ? (
          <div className="flex items-center justify-center h-32 border border-dashed border-dark-border rounded-md">
            <p className="text-sm text-gray-400">Solte recursos aqui</p>
          </div>
        ) : (
          <div className="min-h-[50px] py-1">
            {resources.map((resource) => (
              <DraggableResource
                key={resource.id}
                resource={resource}
                onEdit={(e) => {
                  e?.stopPropagation();
                  onEditResource(resource);
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Adicionar recurso */}
      <div className="p-2 pt-0">
        <Button
          variant="default"
          className="w-full bg-primary text-white hover:bg-primary/90 flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onAddResource(category.id);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Adicionar Recurso</span>
        </Button>
      </div>
    </div>
  );
}

export default function TrelloBoard({
  categories,
  getResourcesByCategory,
  onEditResource,
  onAddResource,
  onEditCategory
}: TrelloBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [activeResource, setActiveResource] = useState<Resource | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<number | null>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 8 }
    }),
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {})
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
    
    const data = active.data.current;
    if (data?.type === 'resource') {
      setActiveResource(data.resource);
    } else if (data?.type === 'category') {
      setActiveCategory(data.category);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    // Só processa quando arrastamos um recurso
    if (active.data.current?.type === 'resource') {
      // Verificar se estamos sobre uma categoria
      const overId = over.id.toString();
      const overData = over.data.current;
      
      if (overData?.type === 'category') {
        setOverCategoryId(overData.category.id);
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveResource(null);
      setActiveCategory(null);
      setOverCategoryId(null);
      return;
    }
    
    // Se estamos arrastando um recurso
    if (active.data.current?.type === 'resource') {
      const resource = active.data.current.resource as Resource;
      const resourceId = resource.id;
      
      // Determinar a categoria destino
      let targetCategoryId = null;
      
      if (over.data.current?.type === 'category') {
        targetCategoryId = over.data.current.category.id;
      }
      
      // Verificar se o recurso ativo existe e tem uma categoria diferente da destino
      if (targetCategoryId && resource.categoryId !== targetCategoryId) {
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
    setActiveCategory(null);
    setOverCategoryId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="flex gap-6 pb-6 overflow-x-auto py-4 px-2 min-h-[calc(100vh-150px)]">
        {categories.map((category) => {
          const resources = getResourcesByCategory(category.id);
          const isOver = overCategoryId === category.id;
          
          return (
            <DroppableColumn
              key={category.id}
              category={category}
              resources={resources}
              isOver={isOver}
              onEditCategory={onEditCategory}
              onEditResource={onEditResource}
              onAddResource={onAddResource}
            />
          );
        })}
      </div>
      
      <DragOverlay adjustScale={false} zIndex={999} dropAnimation={{
        duration: 150,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {/* Renderiza overlay do recurso sendo arrastado */}
        {activeId && activeResource && (
          <div className="w-[300px] shadow-xl opacity-95 rotate-1">
            <ResourceItem 
              resource={activeResource}
              onEdit={() => {}}
            />
          </div>
        )}

        {/* Renderiza overlay de categoria sendo arrastada */}
        {activeId && activeCategory && (
          <div className="w-[320px] shadow-xl opacity-95 rotate-1">
            <div className="flex flex-col flex-shrink-0 bg-dark-surface border border-dark-border rounded-lg shadow-md">
              <div className="p-3 border-b border-dark-border flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
                    {getIconByName(activeCategory.icon as any || "Package")({ className: "h-5 w-5" })}
                  </div>
                  <h3 className="font-medium text-white truncate max-w-[150px]">{activeCategory.name}</h3>
                </div>
              </div>
              <div className="p-3 bg-dark-surface/50 h-20 flex items-center justify-center">
                <p className="text-gray-400 text-sm">Arrastando categoria...</p>
              </div>
            </div>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}