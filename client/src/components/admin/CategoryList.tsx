import { useState, useEffect } from "react";
import { Category, Resource } from "@shared/schema";
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
  horizontalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import CategoryItem from "./CategoryItem";

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

export default function CategoryList({ 
  categories,
  getResourcesByCategory,
  onEditResource,
  onAddResource,
  onReorderCategories
}: CategoryListProps) {
  const [items, setItems] = useState<Category[]>(categories);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
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
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToHorizontalAxis]}
    >
      <SortableContext 
        items={items.map(item => item.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {items.map((category) => (
            <SortableCategory
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