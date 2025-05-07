import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ContentBlock, Resource } from "@shared/schema";
import { cn } from "@/lib/utils";
import { ResourceWithBlocks } from "@/lib/types";
import ChecklistBlock from "./content-blocks/ChecklistBlock";
import AlertBlock from "./content-blocks/AlertBlock";
import TextBlock from "./content-blocks/TextBlock";
import CopyableTextBlock from "./content-blocks/CopyableTextBlock";
import FileDownloadBlock from "./content-blocks/FileDownloadBlock";
import LinkBlock from "./content-blocks/LinkBlock";
import VideoBlock from "./content-blocks/VideoBlock";
import CustomBlock from "./content-blocks/CustomBlock";

interface ResourceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentResource: ResourceWithBlocks | null;
}

export default function ResourceDrawer({ isOpen, onClose, currentResource }: ResourceDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Set up animation states
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isOpen) {
      setIsAnimating(true);
    } else {
      timeoutId = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen]);
  
  if (!isAnimating && !isOpen) return null;
  
  const renderBlockContent = (block: ContentBlock) => {
    switch (block.blockType) {
      case "checklist":
        return <ChecklistBlock block={block} />;
      case "alert":
        return <AlertBlock block={block} />;
      case "text":
        return <TextBlock block={block} />;
      case "copyableText":
        return <CopyableTextBlock block={block} />;
      case "fileDownload":
        return <FileDownloadBlock block={block} />;
      case "link":
        return <LinkBlock block={block} />;
      case "video":
        return <VideoBlock block={block} />;
      case "custom":
        return <CustomBlock block={block} />;
      default:
        return <div className="p-4 bg-dark-surface rounded-md">Bloco não reconhecido</div>;
    }
  };
  
  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 bg-black transition-opacity duration-300",
            isOpen ? "bg-opacity-75" : "bg-opacity-0"
          )}
          onClick={onClose}
        />
        
        <section className="absolute inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16 transition-drawer">
          <div 
            className={cn(
              "w-screen max-w-2xl transition-transform transform duration-300",
              isOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            <div className="h-full flex flex-col bg-dark-surface border-l border-dark-border shadow-xl">
              {currentResource && (
                <>
                  <div className="p-6 border-b border-dark-border flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {currentResource.resource.title}
                      </h2>
                      <p className="mt-1 text-sm text-gray-400">
                        {currentResource.resource.description}
                      </p>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-white transition-colors p-1.5"
                      onClick={onClose}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                      {currentResource.blocks.map((block) => (
                        <div key={block.id}>
                          {renderBlockContent(block)}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
