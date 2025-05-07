import { ContentBlock, AlertContent } from "@shared/schema";
import { AlertTriangle, Info, Check, AlertCircle } from "lucide-react";

interface AlertBlockProps {
  block: ContentBlock;
}

export default function AlertBlock({ block }: AlertBlockProps) {
  const { content, type = "warning" } = block.content as AlertContent;
  
  const getAlertIcon = () => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4" />;
      case "success":
        return <Check className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "warning":
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };
  
  const getAlertColor = () => {
    switch (type) {
      case "info":
        return "text-blue-500 bg-blue-500/10";
      case "success":
        return "text-green-500 bg-green-500/10";
      case "error":
        return "text-red-500 bg-red-500/10";
      case "warning":
      default:
        return "text-amber-500 bg-amber-500/10";
    }
  };
  
  return (
    <div className="bg-dark rounded-lg border border-dark-border p-5">
      <div className="flex items-start">
        <span className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${getAlertColor()}`}>
          {getAlertIcon()}
        </span>
        <div>
          <h3 className="text-lg font-medium text-white">{block.title}</h3>
          <div 
            className="mt-2 text-sm text-gray-300"
            dangerouslySetInnerHTML={{ 
              __html: content.replace(
                /\b([^\s]+)\b/g, 
                (match, word) => {
                  if (/^\d+:\d+h$/.test(word) || /^\d+\/\d+\/\d+$/.test(word)) {
                    return `<span class="text-amber-400 font-medium">${word}</span>`;
                  }
                  return word;
                }
              )
            }}
          />
        </div>
      </div>
    </div>
  );
}
