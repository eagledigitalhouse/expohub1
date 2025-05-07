import { 
  ChecklistContent,
  AlertContent,
  TextContent,
  CopyableTextContent,
  FileDownloadContent,
  LinkContent,
  VideoContent,
  CustomContent,
  ContentBlock
} from "@shared/schema";

export type IconName = 
  | "CheckCircle" 
  | "Calendar" 
  | "Package" 
  | "Clock" 
  | "Users" 
  | "Image" 
  | "MegaPhone" 
  | "FileText" 
  | "Info" 
  | "AlertTriangle"
  | "FileCheck"
  | "ExternalLink"
  | "Video"
  | "Download"
  | "Copy"
  | "Grid";

export interface BlockTypeConfig {
  icon: any; // Using any here to accommodate the LucideIcon type
  label: string;
  emoji: string;
}

export interface ResourceWithBlocks {
  resource: any;
  blocks: ContentBlock[];
}

export type BlockContentByType = {
  checklist: ChecklistContent;
  alert: AlertContent;
  text: TextContent;
  copyableText: CopyableTextContent;
  fileDownload: FileDownloadContent;
  link: LinkContent;
  video: VideoContent;
  custom: CustomContent;
};

export type FormattedDate = {
  date: string;
  readTime: number;
};

export interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (blockType: string) => void;
}

export interface BlockDragItem {
  id: number;
  index: number;
  blockType: string;
}
