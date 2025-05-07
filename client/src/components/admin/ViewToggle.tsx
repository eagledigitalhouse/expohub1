import React from "react";
import { List, Table, MoveHorizontal } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group";

interface ViewToggleProps {
  activeView: "accordion" | "table" | "draggable";
  onViewChange: (view: "accordion" | "table" | "draggable") => void;
}

export default function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={activeView}
      onValueChange={(value) => {
        if (value) onViewChange(value as "accordion" | "table" | "draggable");
      }}
      className="border border-dark-border rounded-md bg-dark/50 h-9"
    >
      <ToggleGroupItem 
        value="draggable" 
        className="h-8 w-8 sm:h-8 sm:w-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
        title="Visualização Kanban"
      >
        <MoveHorizontal className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="accordion" 
        className="h-8 w-8 sm:h-8 sm:w-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
        title="Visualizar como acordeão"
      >
        <List className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="table" 
        className="h-8 w-8 sm:h-8 sm:w-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary"
        title="Visualizar como tabela"
      >
        <Table className="h-3.5 w-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}