import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Category, Resource } from "@shared/schema";
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
import CategoryItem from "./CategoryItem";
import { useToast } from "@/hooks/use-toast";
import { GripVertical } from "lucide-react";

interface SortableCategoryItemProps {
  category: Category;
  resources: Resource[];
  onEditResource: (resource: Resource) => void;
  onAddResource: (categoryId: number) => void;
}

function SortableCategoryItem({
  category,
  resources,
  onEditResource,
  onAddResource
}: SortableCategoryItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3 relative group">
      <CategoryItem
        category={category}
        resources={resources}
        onEditResource={onEditResource}
        onAddResource={onAddResource}
      />
      <div 
        className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-70 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
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

export default function CategoryList({
  categories,
  getResourcesByCategory,
  onEditResource,
  onAddResource,
  onReorderCategories
}: CategoryListProps) {
  const [items, setItems] = useState(categories);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id.toString() === active.id);
        const newIndex = items.findIndex(item => item.id.toString() === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Opcional: Atualizar no backend
        if (onReorderCategories) {
          onReorderCategories(newItems);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((category) => (
            <SortableCategoryItem
              key={category.id}
              category={category}
              resources={getResourcesByCategory(category.id)}
              onEditResource={onEditResource}
              onAddResource={onAddResource}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}