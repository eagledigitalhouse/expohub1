import { ContentBlock, TextContent } from "@shared/schema";
import { Info } from "lucide-react";

interface TextBlockProps {
  block: ContentBlock;
}

export default function TextBlock({ block }: TextBlockProps) {
  const { content } = block.content as TextContent;
  
  // Convert new lines to paragraphs and lists
  const formatContent = (text: string) => {
    // First, split by double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((paragraph, i) => {
      // Check if this paragraph is a list
      if (paragraph.includes("\n- ")) {
        const [listTitle, ...listItems] = paragraph.split("\n- ");
        return (
          <div key={i}>
            {listTitle && <p className="mb-2">{listTitle}</p>}
            <ul className="list-disc pl-5 space-y-1">
              {listItems.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Regular paragraph
      return <p key={i} className={i < paragraphs.length - 1 ? "mb-4" : ""}>{paragraph}</p>;
    });
  };
  
  return (
    <div className="bg-dark rounded-lg border border-dark-border p-5">
      <div className="flex items-start mb-4">
        <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
          <Info className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-medium text-white">{block.title}</h3>
        </div>
      </div>
      
      <div className="ml-11 text-gray-300 space-y-4">
        {formatContent(content)}
      </div>
    </div>
  );
}
