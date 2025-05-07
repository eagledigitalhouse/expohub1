import { LucideIcon } from "lucide-react";

interface CategoryHeaderProps {
  title: string;
  icon: LucideIcon;
}

export default function CategoryHeader({ title, icon: Icon }: CategoryHeaderProps) {
  return (
    <h2 className="text-xl font-bold text-white mb-4 flex items-center">
      <Icon className="h-5 w-5 mr-2 text-primary" />
      {title}
    </h2>
  );
}
