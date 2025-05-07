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
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import ResourceItem from "./ResourceItem";
import { useToast } from "@/hooks/use-toast";
import { GripVertical } from "lucide-react";

interface SortableResourceItemProps {
  resource: Resource;
  onEdit: () => void;
}

function SortableResourceItemWrapper({
  resource,
  onEdit
}: SortableResourceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: resource.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <ResourceItem
        resource={resource}
        onEdit={onEdit}
      />
      <div 
        className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-70 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-gray-400" />
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
  const [items, setItems] = useState(resources);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
        const oldIndex = items.findIndex(item => item.id.toString() === active.id);
        const newIndex = items.findIndex(item => item.id.toString() === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Opcional: Atualizar no backend
        if (onReorderResources) {
          onReorderResources(newItems);
        }
        
        return newItems;
      });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <SortableContext 
        items={items.map(item => item.id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid gap-1.5">
          {items.map((resource) => (
            <SortableResourceItemWrapper
              key={resource.id}
              resource={resource}
              onEdit={() => onEditResource(resource)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}