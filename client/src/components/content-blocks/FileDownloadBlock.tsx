import { ContentBlock, FileDownloadContent } from "@shared/schema";
import { Download, FileText } from "lucide-react";

interface FileDownloadBlockProps {
  block: ContentBlock;
}

export default function FileDownloadBlock({ block }: FileDownloadBlockProps) {
  const { filename, filesize, url } = block.content as FileDownloadContent;
  
  return (
    <div className="bg-dark rounded-lg border border-dark-border p-5">
      <div className="flex items-start mb-4">
        <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 flex-shrink-0">
          <Download className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-lg font-medium text-white">{block.title}</h3>
          {block.description && (
            <p className="mt-1 text-sm text-gray-400">{block.description}</p>
          )}
        </div>
      </div>
      
      <div className="ml-11">
        <a 
          href={url || "#"} 
          className="bg-dark-surface border border-dark-border rounded-md p-3 flex justify-between items-center hover:border-primary transition-colors"
          download={filename}
        >
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400" />
            <span className="ml-3 text-white">{filename}</span>
          </div>
          {filesize && (
            <span className="text-xs text-gray-500">{filesize}</span>
          )}
        </a>
      </div>
    </div>
  );
}
