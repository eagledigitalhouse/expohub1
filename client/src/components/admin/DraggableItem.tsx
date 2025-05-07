import { Resource } from "@shared/schema";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
    zIndex: isDragging ? 10 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <ResourceItem
        resource={resource}
        onEdit={onEdit}
      />
    </div>
  );
}