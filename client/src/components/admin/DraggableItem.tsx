import { Resource } from "@shared/schema";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import ResourceItem from "./ResourceItem";

interface DraggableItemProps {
  resource: Resource;
  categoryId: number;
  onEdit: () => void;
}

export default function DraggableItem({ resource, categoryId, onEdit }: DraggableItemProps) {
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
    opacity: isDragging ? 0.3 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 10 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group cursor-grab active:cursor-grabbing"
    >
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className="pl-12">
          <ResourceItem
            resource={resource}
            onEdit={onEdit}
          />
        </div>
      </div>
    </div>
  );
}