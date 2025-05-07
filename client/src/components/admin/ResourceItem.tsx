import { Settings } from "lucide-react";
import { Resource } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { getIconByName } from "@/lib/utils";

interface ResourceItemProps {
  resource: Resource;
  onEdit: () => void;
}

export default function ResourceItem({ resource, onEdit }: ResourceItemProps) {
  const ResourceIcon = getIconByName(resource.icon as any || "FileText");
  
  return (
    <div className="bg-background/95 border border-gray-800 hover:border-gray-700 rounded-md p-3 transition-all hover:shadow relative group">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
          <ResourceIcon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white truncate">{resource.title}</h4>
          {resource.description && (
            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{resource.description}</p>
          )}
        </div>
        
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-gray-400 hover:text-primary hover:bg-primary/5 flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Settings className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}