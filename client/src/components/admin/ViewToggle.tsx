import React from "react";
import { Grid, List, Table } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group";

interface ViewToggleProps {
  activeView: "cards" | "accordion" | "table";
  onViewChange: (view: "cards" | "accordion" | "table") => void;
}

export default function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  return (
    <ToggleGroup 
      type="single" 
      value={activeView}
      onValueChange={(value) => {
        if (value) onViewChange(value as "cards" | "accordion" | "table");
      }}
      className="border border-dark-border rounded-md bg-dark/50 h-9"
    >
      <ToggleGroupItem 
        value="cards" 
        className="h-8 w-8 sm:h-8 sm:w-8 data-[state=on]:bg-primary/10 data-[state=on]:text-primary" 
        title="Visualizar como cards"
      >
        <Grid className="h-3.5 w-3.5" />
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