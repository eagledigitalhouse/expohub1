import { ContentBlock } from "@shared/schema";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { ResourceWithBlocks } from "@/lib/types";
import { cn, formatDisplayDate } from "@/lib/utils";
import { useEffect } from "react";
import ChecklistBlock from "./content-blocks/ChecklistBlock";
import AlertBlock from "./content-blocks/AlertBlock";
import TextBlock from "./content-blocks/TextBlock";
import CopyableTextBlock from "./content-blocks/CopyableTextBlock";
import FileDownloadBlock from "./content-blocks/FileDownloadBlock";
import LinkBlock from "./content-blocks/LinkBlock";
import VideoBlock from "./content-blocks/VideoBlock";
import CustomBlock from "./content-blocks/CustomBlock";
import { Button } from "@/components/ui/button";

interface ResourceSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentResource: ResourceWithBlocks | null;
}

export default function ResourceSidePanel({ isOpen, onClose, currentResource }: ResourceSidePanelProps) {
  // Adiciona uma classe ao body quando o painel está aberto para impedir o scroll
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  if (!currentResource) return null;
  
  const { resource, blocks } = currentResource;
  const { date, readTime } = formatDisplayDate(resource.updatedAt, resource.readTime);
  
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
    <>
      {/* Overlay escuro */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Painel lateral */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 bg-dark z-50 shadow-xl transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Cabeçalho */}
          <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between bg-dark-surface/80 backdrop-blur-sm sticky top-0 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full text-gray-400 hover:text-white hover:bg-dark-border"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-medium text-white flex-1 text-center mr-10">Detalhes do Recurso</h2>
          </div>
          
          {/* Conteúdo */}
          <div className="overflow-y-auto flex-1 custom-scrollbar pb-6">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-4">{resource.title}</h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary/80" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-primary/80" />
                  <span>{readTime} min de leitura</span>
                </div>
              </div>
              
              {resource.description && (
                <div className="mb-8 p-4 bg-dark-surface/50 rounded-lg border border-dark-border/50">
                  <p className="text-gray-300">{resource.description}</p>
                </div>
              )}
              
              <div className="space-y-8">
                {blocks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-dark-surface/30 rounded-lg border border-dark-border/30">
                    <div className="text-5xl mb-3">📋</div>
                    <p>Este recurso não possui conteúdo detalhado.</p>
                  </div>
                ) : (
                  blocks.map((block) => (
                    <div 
                      key={block.id} 
                      className="bg-dark-surface/40 backdrop-blur-sm rounded-lg overflow-hidden border border-dark-border/50 shadow-lg"
                    >
                      {renderBlockContent(block)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}