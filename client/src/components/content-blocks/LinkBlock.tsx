import { ContentBlock, LinkContent } from "@shared/schema";
import { ExternalLink } from "lucide-react";

interface LinkBlockProps {
  block: ContentBlock;
}

export default function LinkBlock({ block }: LinkBlockProps) {
  const { links } = block.content as LinkContent;
  
  return (
    <div className="bg-dark rounded-lg border border-dark-border p-5">
      <div className="flex items-start mb-4">
        <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
          <ExternalLink className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-medium text-white">{block.title}</h3>
        </div>
      </div>
      
      <div className="ml-11 space-y-3">
        {links.map((link, index) => (
          <a 
            key={index}
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block text-primary hover:text-primary-light hover:underline transition-colors"
          >
            <div className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-2" />
              {link.text}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
