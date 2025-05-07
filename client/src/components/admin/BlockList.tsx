import { useState } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentBlock } from "@shared/schema";
import BlockEditor from "./BlockEditor";

interface SortableBlockProps {
  block: ContentBlock;
  onBlockChange: (block: ContentBlock) => void;
  onBlockDelete: (blockId: number) => void;
}

function SortableBlock({ block, onBlockChange, onBlockDelete }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginBottom: "1rem",
  };
  
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BlockEditor
        block={block}
        onBlockChange={onBlockChange}
        onBlockDelete={onBlockDelete}
      />
    </div>
  );
}

interface BlockListProps {
  blocks: ContentBlock[];
  onBlockChange: (block: ContentBlock) => void;
  onBlockDelete: (blockId: number) => void;
  onReorderBlocks: (blocks: ContentBlock[]) => void;
}

export default function BlockList({ blocks, onBlockChange, onBlockDelete, onReorderBlocks }: BlockListProps) {
  const [items, setItems] = useState(blocks);
  
  // Update items when blocks prop changes
  if (JSON.stringify(blocks) !== JSON.stringify(items)) {
    setItems(blocks);
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));
      
      setItems(newItems);
      onReorderBlocks(newItems);
    }
  };
  
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="p-4 text-center text-gray-400 border border-dashed border-dark-border rounded-lg">
          Adicione blocos de conteúdo clicando no botão "Adicionar Bloco" abaixo.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(item => item.id)} 
            strategy={verticalListSortingStrategy}
          >
            {items.map((block) => (
              <SortableBlock
                key={block.id}
                block={block}
                onBlockChange={onBlockChange}
                onBlockDelete={onBlockDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
