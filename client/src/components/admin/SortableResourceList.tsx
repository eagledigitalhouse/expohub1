import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { useToast } from "@/hooks/use-toast";
import { GripVertical } from "lucide-react";
import ResourceItem from "./ResourceItem";
import { apiRequest } from "@/lib/queryClient";

interface SortableResourceItemProps {
  id: number;
  resource: Resource;
  onEdit: () => void;
}

function SortableResourceItem({ id, resource, onEdit }: SortableResourceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

interface SortableResourceListProps {
  resources: Resource[];
  onEditResource: (resource: Resource) => void;
  onReorderResources?: (resources: Resource[]) => void;
}

export default function SortableResourceList({ 
  resources,
  onEditResource,
  onReorderResources
}: SortableResourceListProps) {
  const [items, setItems] = useState<Resource[]>(resources);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Atualizar items quando os recursos mudam
  useEffect(() => {
    setItems(resources);
  }, [resources]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        
        // Opcional: Persistir a ordem no backend
        if (onReorderResources) {
          onReorderResources(reorderedItems);
        }
        
        // Poderia ser implementado para persistir a ordem no backend
        // apiRequest("PUT", `/api/resources/reorder`, { resourceIds: reorderedItems.map(item => item.id) })
        //   .then(() => {
        //     queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
        //     toast({
        //       title: "Recursos reordenados",
        //       description: "A ordem dos recursos foi atualizada.",
        //     });
        //   })
        //   .catch(() => {
        //     toast({
        //       title: "Erro ao reordenar recursos",
        //       description: "Ocorreu um erro ao reordenar os recursos.",
        //       variant: "destructive",
        //     });
        //   });
        
        return reorderedItems;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext 
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-1.5">
          {items.map((resource) => (
            <SortableResourceItem
              key={resource.id}
              id={resource.id}
              resource={resource}
              onEdit={() => onEditResource(resource)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}