import { useState } from "react";
import { ContentBlock, CopyableTextContent } from "@shared/schema";
import { Copy, Check } from "lucide-react";

interface CopyableTextBlockProps {
  block: ContentBlock;
}

export default function CopyableTextBlock({ block }: CopyableTextBlockProps) {
  const [copied, setCopied] = useState(false);
  const { content } = block.content as CopyableTextContent;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  
  return (
    <div className="bg-dark rounded-lg border border-dark-border p-5">
      <div className="flex items-start mb-4">
        <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
          <Copy className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-medium text-white">{block.title}</h3>
        </div>
      </div>
      
      <div className="ml-11">
        <div className="bg-dark-surface border border-dark-border rounded-md p-3 flex justify-between items-center">
          <code className="text-gray-200 font-mono">{content}</code>
          <button 
            className="text-primary hover:text-primary-light transition-colors p-1.5"
            onClick={copyToClipboard}
            aria-label="Copiar para a área de transferência"
          >
            {copied ? (
              <Check className="h-5 w-5" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
