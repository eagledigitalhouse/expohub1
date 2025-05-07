import { ContentBlock } from "@shared/schema";
import { X } from "lucide-react";
import { ResourceWithBlocks } from "@/lib/types";
import { cn, formatDisplayDate } from "@/lib/utils";
import ChecklistBlock from "./content-blocks/ChecklistBlock";
import AlertBlock from "./content-blocks/AlertBlock";
import TextBlock from "./content-blocks/TextBlock";
import CopyableTextBlock from "./content-blocks/CopyableTextBlock";
import FileDownloadBlock from "./content-blocks/FileDownloadBlock";
import LinkBlock from "./content-blocks/LinkBlock";
import VideoBlock from "./content-blocks/VideoBlock";
import CustomBlock from "./content-blocks/CustomBlock";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResource: ResourceWithBlocks | null;
}

export default function ResourceModal({ isOpen, onClose, currentResource }: ResourceModalProps) {
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark-surface border-dark-border max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-dark-border py-4 px-6">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold text-white">
                {resource.title}
              </DialogTitle>
              <div className="mt-2 text-sm text-gray-400">
                <span>Última atualização: {date}</span>
                <span className="mx-2">•</span>
                <span>{readTime} min de leitura</span>
              </div>
            </div>
            <DialogClose className="text-gray-400 hover:text-white transition-colors p-1.5">
              <X className="h-6 w-6" />
            </DialogClose>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {resource.description && (
            <div className="px-6 py-4 border-b border-dark-border/50">
              <p className="text-gray-300">{resource.description}</p>
            </div>
          )}
          
          <div className="p-6">
            <div className="space-y-8">
              {blocks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Este recurso não possui conteúdo.
                </div>
              ) : (
                blocks.map((block) => (
                  <div key={block.id} className="bg-dark/50 rounded-lg overflow-hidden">
                    {renderBlockContent(block)}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}