import { formatDisplayDate } from "@/lib/utils";
import { Resource } from "@shared/schema";
import { LucideIcon } from "lucide-react";

interface ResourceCardProps {
  resource: Resource;
  icon: LucideIcon;
  onClick: () => void;
}

export default function ResourceCard({ resource, icon: Icon, onClick }: ResourceCardProps) {
  const { date, readTime } = formatDisplayDate(resource.updatedAt, resource.readTime);
  
  return (
    <div 
      data-resource-id={resource.id} 
      onClick={onClick}
      className="resource-card bg-dark-surface border border-dark-border rounded-lg overflow-hidden hover:border-primary hover:shadow-md hover:shadow-primary/20 transition-all transform hover:scale-[1.02] cursor-pointer"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <span className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="ml-3 text-lg font-medium text-white">{resource.title}</h3>
          </div>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{resource.description}</p>
        <div className="flex items-center text-xs text-gray-500">
          <span>Última atualização: {date}</span>
          <span className="mx-2">•</span>
          <span>{readTime} min de leitura</span>
        </div>
      </div>
    </div>
  );
}
