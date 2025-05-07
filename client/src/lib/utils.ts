import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  CheckCircle, 
  Calendar, 
  Package, 
  Clock, 
  Users, 
  Image, 
  AlertTriangle,
  FileText,
  Info,
  Megaphone,
  CheckSquare,
  ExternalLink,
  PlayCircle,
  Download,
  Copy,
  Grid,
  LucideIcon
} from "lucide-react";
import { IconName, FormattedDate, BlockTypeConfig } from "./types";
import { BlockContentByType } from "./types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDisplayDate(isoDate: Date | string, readTime?: number): FormattedDate {
  const date = typeof isoDate === 'string' ? new Date(isoDate) : isoDate;
  
  return {
    date: format(date, "dd/MM/yyyy", { locale: ptBR }),
    readTime: readTime || 5
  };
}

export function getIconByName(iconName: IconName): LucideIcon {
  const iconMap: Record<IconName, LucideIcon> = {
    CheckCircle,
    Calendar,
    Package,
    Clock,
    Users,
    Image,
    MegaPhone: Megaphone,
    FileText,
    Info,
    AlertTriangle,
    FileCheck: CheckSquare,
    ExternalLink,
    Video: PlayCircle,
    Download,
    Copy,
    Grid
  };

  return iconMap[iconName] || Info;
}

export const blockTypeConfigs: Record<string, BlockTypeConfig> = {
  checklist: {
    icon: CheckSquare,
    label: "Checklist",
    emoji: "✅"
  },
  alert: {
    icon: AlertTriangle,
    label: "Alerta ou dica",
    emoji: "⚠️"
  },
  text: {
    icon: Info,
    label: "Texto explicativo",
    emoji: "🧠"
  },
  copyableText: {
    icon: Copy,
    label: "Texto copiável",
    emoji: "📋"
  },
  fileDownload: {
    icon: Download,
    label: "Arquivo para download",
    emoji: "📁"
  },
  link: {
    icon: ExternalLink,
    label: "Link externo",
    emoji: "🔗"
  },
  video: {
    icon: PlayCircle,
    label: "Embed de vídeo",
    emoji: "🎬"
  },
  custom: {
    icon: Grid,
    label: "Bloco personalizado",
    emoji: "🟧"
  },
};

export const getEmptyBlockContent = (blockType: string): BlockContentByType[keyof BlockContentByType] => {
  const emptyContents: BlockContentByType = {
    checklist: { items: [] },
    alert: { content: "", type: "warning" },
    text: { content: "" },
    copyableText: { content: "" },
    fileDownload: { filename: "", filesize: "", url: "" },
    link: { links: [{ url: "", text: "" }] },
    video: { title: "", duration: "", thumbnailUrl: "", embedUrl: "" },
    custom: { content: "", html: false }
  };

  return emptyContents[blockType as keyof BlockContentByType];
};

export function generateRandomId() {
  return Math.random().toString(36).substring(2, 10);
}
