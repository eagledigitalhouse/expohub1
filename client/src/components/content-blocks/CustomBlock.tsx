import { ContentBlock, CustomContent } from "@shared/schema";
import { Grid } from "lucide-react";

interface CustomBlockProps {
  block: ContentBlock;
}

export default function CustomBlock({ block }: CustomBlockProps) {
  const { content, html = false } = block.content as CustomContent;
  
  return (
    <div className="bg-dark rounded-lg border border-dark-border p-5">
      <div className="flex items-start mb-4">
        <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
          <Grid className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-medium text-white">{block.title}</h3>
        </div>
      </div>
      
      <div className="ml-11">
        {html ? (
          <div 
            className="custom-html-content" 
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-gray-300 whitespace-pre-wrap">
            {content}
          </div>
        )}
      </div>
    </div>
  );
}
