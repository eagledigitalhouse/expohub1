import { formatDisplayDate } from "@/lib/utils";
import { Resource } from "@shared/schema";
import { LucideIcon, Clock, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ResourceCardProps {
  resource: Resource;
  icon: LucideIcon;
  onClick: () => void;
}

// Function to derive tags from resource properties
const getResourceTags = (resource: Resource): string[] => {
  const tags: string[] = [];
  
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
    
  if (tags.length === 0) tags.push("recurso");
  
  return tags;
};

export default function ModernResourceCard({ resource, icon: Icon, onClick }: ResourceCardProps) {
  const { date, readTime } = formatDisplayDate(resource.updatedAt, resource.readTime);
  const tags = getResourceTags(resource);
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      data-resource-id={resource.id} 
      onClick={onClick}
      className="resource-card relative overflow-hidden group cursor-pointer h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl z-0 group-hover:opacity-100 opacity-0 transition-opacity duration-300"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      
      <div className="relative z-10 bg-dark-surface/80 backdrop-blur-md border border-dark-border/60 rounded-xl p-5 h-full flex flex-col shadow-md group-hover:shadow-xl group-hover:shadow-primary/10 transition-all duration-300">
        <div className="flex items-start">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mr-4 flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white leading-tight group-hover:text-white transition-colors duration-300">{resource.title}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  className="h-6 px-2.5 bg-primary/15 text-primary hover:bg-primary/20 border-0 font-medium text-xs"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-gray-400 text-sm mt-4 mb-4 line-clamp-2 flex-grow group-hover:text-gray-300 transition-colors duration-300">{resource.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1.5" />
              <span>{date}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1.5" />
              <span>{readTime} min</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}