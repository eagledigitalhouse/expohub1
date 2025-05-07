import { useState } from "react";
import { ContentBlock, ChecklistContent, ChecklistItem } from "@shared/schema";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ChecklistBlockProps {
  block: ContentBlock;
}

export default function ChecklistBlock({ block }: ChecklistBlockProps) {
  const [items, setItems] = useState<ChecklistItem[]>(
    (block.content as ChecklistContent).items
  );
  
  const handleCheckItem = (itemId: string) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  return (
    <div className="bg-dark rounded-lg border border-dark-border p-5">
      <div className="flex items-start mb-4">
        <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
          <Check className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-medium text-white">{block.title}</h3>
          {block.description && (
            <p className="mt-1 text-sm text-gray-400">{block.description}</p>
          )}
        </div>
      </div>
      
      <div className="ml-11 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-start">
            <Checkbox
              id={`item-${item.id}`}
              checked={item.checked}
              onCheckedChange={() => handleCheckItem(item.id)}
              className="h-5 w-5 rounded border-gray-600 text-primary focus:ring-primary mt-0.5"
            />
            <label 
              htmlFor={`item-${item.id}`}
              className="ml-3 text-white"
            >
              {item.text}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
