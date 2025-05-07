import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThemeSettings } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, X, CheckCircle2, Trash2, Upload, Edit3, Palette } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker = ({ label, value, onChange }: ColorPickerProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={label}>{label}</Label>
        <div className="flex items-center gap-2">
          <div 
            className="h-5 w-5 rounded border border-dark-border" 
            style={{ backgroundColor: value }}
          />
          <Input
            id={label}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-24"
          />
        </div>
      </div>
      <Input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-full cursor-pointer"
      />
    </div>
  );
};

interface ThemeCardProps {
  theme: ThemeSettings;
  isActive: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onActivate: () => void;
}

const ThemeCard = ({ theme, isActive, onEdit, onDelete, onActivate }: ThemeCardProps) => {
  return (
    <Card className={`w-full transition-all duration-300 ${isActive ? 'border-primary border-2 bg-dark-surface/80' : 'bg-dark-surface/50'}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span>{theme.name}</span>
          {isActive && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Ativo
            </span>
          )}
        </CardTitle>
        <CardDescription>ID: {theme.id}</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex gap-3 mb-4">
          <div 
            className="h-8 w-8 rounded-full border border-dark-border shadow-md" 
            style={{ backgroundColor: theme.primaryColor }}
          />
          <div 
            className="h-8 w-16 rounded-md border border-dark-border shadow-md" 
            style={{ backgroundColor: theme.backgroundColor }}
          />
          <div 
            className="h-8 w-16 rounded-md border border-dark-border shadow-md" 
            style={{ backgroundColor: theme.surfaceColor }}
          />
        </div>
        <div className="space-y-2 text-xs text-gray-400">
          <div>Cor Primária: <span className="text-white">{theme.primaryColor}</span></div>
          <div>Cor de Fundo: <span className="text-white">{theme.backgroundColor}</span></div>
          <div>Cor de Superfície: <span className="text-white">{theme.surfaceColor}</span></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        {isActive ? (
          <Button variant="ghost" size="sm" disabled className="opacity-50">
            <CheckCircle2 className="h-4 w-4 mr-1" /> Ativo
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={onActivate}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Ativar
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" disabled={isActive} onClick={isActive ? undefined : onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

interface ThemeFormData {
  id?: number;
  name: string;
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  textColor: string;
  isActive?: boolean;
}

export default function ThemeSettingsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeFormData | null>(null);
  const [formData, setFormData] = useState<ThemeFormData>({
    name: "",
    primaryColor: "#9D5CFF",
    backgroundColor: "#0C0D13",
    surfaceColor: "#14151F",
    borderColor: "#1F2231",
    textColor: "#FFFFFF",
    isActive: false,
  });

  const { data: themes = [], isLoading } = useQuery<ThemeSettings[]>({
    queryKey: ["/api/theme-settings"],
  });

  const createThemeMutation = useMutation({
    mutationFn: (theme: ThemeFormData) => 
      apiRequest("POST", "/api/theme-settings", theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme-settings"] });
      toast({
        title: "Tema criado",
        description: "O tema foi criado com sucesso."
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar tema",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });

  const updateThemeMutation = useMutation({
    mutationFn: (theme: ThemeFormData) => 
      apiRequest("PUT", `/api/theme-settings/${theme.id}`, theme),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme-settings"] });
      toast({
        title: "Tema atualizado",
        description: "O tema foi atualizado com sucesso."
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar tema",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });

  const deleteThemeMutation = useMutation({
    mutationFn: (themeId: number) => 
      apiRequest("DELETE", `/api/theme-settings/${themeId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme-settings"] });
      toast({
        title: "Tema excluído",
        description: "O tema foi excluído com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir tema",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });

  const activateThemeMutation = useMutation({
    mutationFn: (themeId: number) => 
      apiRequest("POST", `/api/theme-settings/${themeId}/activate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/theme-settings"] });
      toast({
        title: "Tema ativado",
        description: "O tema foi ativado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao ativar tema",
        description: `Ocorreu um erro: ${error}`,
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      primaryColor: "#9D5CFF",
      backgroundColor: "#0C0D13",
      surfaceColor: "#14151F",
      borderColor: "#1F2231",
      textColor: "#FFFFFF",
      isActive: false,
    });
    setCurrentTheme(null);
  };

  const handleInputChange = (field: keyof ThemeFormData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (currentTheme?.id) {
      updateThemeMutation.mutate({ ...formData, id: currentTheme.id });
    } else {
      createThemeMutation.mutate(formData);
    }
  };

  const handleEdit = (theme: ThemeSettings) => {
    setCurrentTheme(theme);
    setFormData({
      id: theme.id,
      name: theme.name,
      primaryColor: theme.primaryColor,
      backgroundColor: theme.backgroundColor,
      surfaceColor: theme.surfaceColor,
      borderColor: theme.borderColor,
      textColor: theme.textColor,
      isActive: Boolean(theme.isActive),
    });
    setIsCreateDialogOpen(true);
  };

  const handleActivate = (themeId: number) => {
    activateThemeMutation.mutate(themeId);
  };

  const handleDelete = (themeId: number) => {
    if (confirm("Tem certeza que deseja excluir este tema?")) {
      deleteThemeMutation.mutate(themeId);
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Configurações de Tema</h2>
          <p className="text-gray-400">Gerencie a aparência visual da plataforma.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsCreateDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Tema
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="w-full">
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-9 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {themes.length === 0 ? (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-dark-border bg-dark-surface/50 p-8 text-center">
              <Palette className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white">Nenhum tema configurado</h3>
              <p className="text-gray-400 mt-2 mb-6">Crie um novo tema para personalizar a aparência da plataforma.</p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Criar Tema
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {themes.map((theme) => (
                <ThemeCard
                  key={theme.id}
                  theme={theme}
                  isActive={Boolean(theme.isActive)}
                  onEdit={() => handleEdit(theme)}
                  onDelete={() => handleDelete(theme.id)}
                  onActivate={() => handleActivate(theme.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Dialog para criar/editar tema */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] border border-dark-border bg-dark-surface shadow-2xl p-0 overflow-hidden text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/80 to-primary"></div>
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                {currentTheme ? 'Editar Tema' : 'Criar Novo Tema'}
              </DialogTitle>
              <DialogDescription>
                {currentTheme 
                  ? 'Modifique as configurações do tema existente.'
                  : 'Configure as cores e estilos para um novo tema.'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
              <div className="space-y-4">
                <div className="grid w-full gap-1.5">
                  <Label htmlFor="name">Nome do Tema</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Tema Corporativo"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-dark-surface/90 border-dark-border"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium mb-3">Configurar Cores</h4>
                  <div className="space-y-4">
                    <ColorPicker
                      label="Cor Primária"
                      value={formData.primaryColor}
                      onChange={(value) => handleInputChange("primaryColor", value)}
                    />
                    <ColorPicker
                      label="Cor de Fundo"
                      value={formData.backgroundColor}
                      onChange={(value) => handleInputChange("backgroundColor", value)}
                    />
                    <ColorPicker
                      label="Cor de Superfície"
                      value={formData.surfaceColor}
                      onChange={(value) => handleInputChange("surfaceColor", value)}
                    />
                    <ColorPicker
                      label="Cor de Borda"
                      value={formData.borderColor}
                      onChange={(value) => handleInputChange("borderColor", value)}
                    />
                    <ColorPicker
                      label="Cor de Texto"
                      value={formData.textColor}
                      onChange={(value) => handleInputChange("textColor", value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-3">
                  <Switch
                    id="isActive"
                    checked={Boolean(formData.isActive)}
                    onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">Definir como tema ativo</Label>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90" 
                onClick={handleSubmit}
                disabled={createThemeMutation.isPending || updateThemeMutation.isPending}
              >
                {createThemeMutation.isPending || updateThemeMutation.isPending ? (
                  <>Processando...</>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {currentTheme ? 'Atualizar Tema' : 'Criar Tema'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}