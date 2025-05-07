import { formatDisplayDate } from "@/lib/utils";
import { Resource } from "@shared/schema";
import { LucideIcon, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ResourceCardProps {
  resource: Resource;
  icon: LucideIcon;
  onClick: () => void;
}

// Function to derive tags from resource properties
const getResourceTags = (resource: Resource): string[] => {
  const tags: string[] = [];
  
  // Derive tags from title or description
  if (resource.title.toLowerCase().includes("checklist")) tags.push("checklist");
  if (resource.title.toLowerCase().includes("manual") || 
      (resource.description && resource.description.toLowerCase().includes("manual"))) 
    tags.push("manual");
  if (resource.title.toLowerCase().includes("document") || 
      resource.title.toLowerCase().includes("documento")) 
    tags.push("documento");
  if (resource.title.toLowerCase().includes("vídeo") || 
      resource.title.toLowerCase().includes("video")) 
    tags.push("vídeo");
  if (resource.title.toLowerCase().includes("template") || 
      (resource.description && resource.description.toLowerCase().includes("template"))) 
    tags.push("template");
  if (resource.title.toLowerCase().includes("contato")) 
    tags.push("contatos");
    
  // Ensure we have at least one tag
  if (tags.length === 0) tags.push("recurso");
  
  return tags;
};

export default function ResourceCard({ resource, icon: Icon, onClick }: ResourceCardProps) {
  const { date, readTime } = formatDisplayDate(resource.updatedAt, resource.readTime);
  const tags = getResourceTags(resource);
  
  return (
    <div 
      data-resource-id={resource.id} 
      onClick={onClick}
      className="resource-card bg-dark-surface border border-dark-border rounded-lg overflow-hidden hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all transform hover:scale-[1.02] cursor-pointer flex flex-col h-full"
    >
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start mb-4">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mr-4 flex-shrink-0">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white leading-tight">{resource.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="bg-dark border-primary/30 text-primary/90 text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">{resource.description}</p>
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-dark-border mt-auto">
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1.5" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1.5" />
            <span>{readTime} min</span>
          </div>
        </div>
      </div>
    </div>
  );
}
