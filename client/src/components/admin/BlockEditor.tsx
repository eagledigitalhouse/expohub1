import { useState, useEffect } from "react";
import { ContentBlock } from "@shared/schema";
import { GripVertical, Trash } from "lucide-react";
import { blockTypeConfigs, getEmptyBlockContent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { generateRandomId } from "@/lib/utils";

interface BlockEditorProps {
  block: ContentBlock;
  onBlockChange: (block: ContentBlock) => void;
  onBlockDelete: (blockId: number) => void;
}

export default function BlockEditor({ block, onBlockChange, onBlockDelete }: BlockEditorProps) {
  const [blockData, setBlockData] = useState<ContentBlock>(block);
  
  // Update blockData when the block prop changes
  useEffect(() => {
    setBlockData(block);
  }, [block]);
  
  const handleBlockTypeChange = (blockType: string) => {
    const updatedBlock = {
      ...blockData,
      blockType,
      content: getEmptyBlockContent(blockType)
    };
    setBlockData(updatedBlock);
    onBlockChange(updatedBlock);
  };
  
  const handleInputChange = (field: string, value: string) => {
    const updatedBlock = { ...blockData, [field]: value };
    setBlockData(updatedBlock);
    onBlockChange(updatedBlock);
  };
  
  const renderBlockTypeFields = () => {
    switch (blockData.blockType) {
      case "checklist":
        return renderChecklistFields();
      case "alert":
        return renderAlertFields();
      case "text":
        return renderTextFields();
      case "copyableText":
        return renderCopyableTextFields();
      case "fileDownload":
        return renderFileDownloadFields();
      case "link":
        return renderLinkFields();
      case "video":
        return renderVideoFields();
      case "custom":
        return renderCustomFields();
      default:
        return null;
    }
  };
  
  const renderChecklistFields = () => {
    const content = blockData.content as any;
    
    const handleItemChange = (index: number, text: string) => {
      const items = [...content.items];
      items[index] = { ...items[index], text };
      
      const updatedBlock = {
        ...blockData,
        content: { ...content, items }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    const handleAddItem = () => {
      const items = [...content.items, { id: generateRandomId(), text: "", checked: false }];
      
      const updatedBlock = {
        ...blockData,
        content: { ...content, items }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    const handleRemoveItem = (index: number) => {
      const items = content.items.filter((_: any, i: number) => i !== index);
      
      const updatedBlock = {
        ...blockData,
        content: { ...content, items }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Itens do Checklist</label>
          <div className="mt-2 space-y-2">
            {content.items.map((item: any, index: number) => (
              <div className="flex items-center" key={item.id || index}>
                <Input
                  value={item.text}
                  onChange={(e) => handleItemChange(index, e.target.value)}
                  className="block w-full bg-dark-surface border-dark-border text-white"
                  placeholder={`Item ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2 text-gray-400 hover:text-red-500"
                  onClick={() => handleRemoveItem(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 text-primary hover:text-primary-light"
            onClick={handleAddItem}
          >
            + Adicionar item
          </Button>
        </div>
      </div>
    );
  };
  
  const renderAlertFields = () => {
    const content = blockData.content as any;
    
    const handleAlertContentChange = (value: string) => {
      const updatedBlock = {
        ...blockData,
        content: { ...content, content: value }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    const handleAlertTypeChange = (value: string) => {
      const updatedBlock = {
        ...blockData,
        content: { ...content, type: value }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Tipo de Alerta</label>
          <Select
            value={content.type || "warning"}
            onValueChange={handleAlertTypeChange}
          >
            <SelectTrigger className="mt-1 bg-dark-surface">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="bg-dark-surface border-dark-border">
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="info">Informação</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Conteúdo do Alerta</label>
          <Textarea
            value={content.content}
            onChange={(e) => handleAlertContentChange(e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
            rows={3}
            placeholder="Digite o conteúdo do alerta"
          />
        </div>
      </div>
    );
  };
  
  const renderTextFields = () => {
    const content = blockData.content as any;
    
    const handleTextContentChange = (value: string) => {
      const updatedBlock = {
        ...blockData,
        content: { content: value }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-400">Conteúdo do texto</label>
        <Textarea
          value={content.content}
          onChange={(e) => handleTextContentChange(e.target.value)}
          className="mt-1 bg-dark-surface border-dark-border text-white"
          rows={6}
          placeholder="Digite o conteúdo do texto. Use linhas em branco para separar parágrafos. Use '- ' para criar listas."
        />
      </div>
    );
  };
  
  const renderCopyableTextFields = () => {
    const content = blockData.content as any;
    
    const handleCopyableTextChange = (value: string) => {
      const updatedBlock = {
        ...blockData,
        content: { content: value }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-400">Texto Copiável</label>
        <Input
          value={content.content}
          onChange={(e) => handleCopyableTextChange(e.target.value)}
          className="mt-1 bg-dark-surface border-dark-border text-white"
          placeholder="Digite o texto que será copiado"
        />
      </div>
    );
  };
  
  const renderFileDownloadFields = () => {
    const content = blockData.content as any;
    
    const handleFileFieldChange = (field: string, value: string) => {
      const updatedBlock = {
        ...blockData,
        content: { ...content, [field]: value }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Nome do arquivo</label>
          <Input
            value={content.filename}
            onChange={(e) => handleFileFieldChange("filename", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
            placeholder="Ex: manual_expositor.pdf"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Tamanho do arquivo (opcional)</label>
          <Input
            value={content.filesize}
            onChange={(e) => handleFileFieldChange("filesize", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
            placeholder="Ex: 2.4 MB"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">URL do arquivo</label>
          <Input
            value={content.url}
            onChange={(e) => handleFileFieldChange("url", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
            placeholder="URL para download do arquivo"
          />
        </div>
      </div>
    );
  };
  
  const renderLinkFields = () => {
    const content = blockData.content as any;
    
    const handleLinkChange = (index: number, field: string, value: string) => {
      const links = [...content.links];
      links[index] = { ...links[index], [field]: value };
      
      const updatedBlock = {
        ...blockData,
        content: { links }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    const handleAddLink = () => {
      const links = [...content.links, { url: "", text: "" }];
      
      const updatedBlock = {
        ...blockData,
        content: { links }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    const handleRemoveLink = (index: number) => {
      const links = content.links.filter((_: any, i: number) => i !== index);
      
      const updatedBlock = {
        ...blockData,
        content: { links }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    return (
      <div className="space-y-4">
        {content.links.map((link: any, index: number) => (
          <div key={index} className="p-3 bg-dark border border-dark-border rounded-md space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-400">Link {index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-red-500"
                onClick={() => handleRemoveLink(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">Texto do Link</label>
              <Input
                value={link.text}
                onChange={(e) => handleLinkChange(index, "text", e.target.value)}
                className="mt-1 bg-dark-surface border-dark-border text-white"
                placeholder="Texto que será exibido"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">URL</label>
              <Input
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                className="mt-1 bg-dark-surface border-dark-border text-white"
                placeholder="https://..."
              />
            </div>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary-light"
          onClick={handleAddLink}
        >
          + Adicionar link
        </Button>
      </div>
    );
  };
  
  const renderVideoFields = () => {
    const content = blockData.content as any;
    
    const handleVideoFieldChange = (field: string, value: string) => {
      const updatedBlock = {
        ...blockData,
        content: { ...content, [field]: value }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Título do Vídeo (opcional)</label>
          <Input
            value={content.title || ""}
            onChange={(e) => handleVideoFieldChange("title", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
            placeholder="Título do vídeo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Duração (opcional)</label>
          <Input
            value={content.duration || ""}
            onChange={(e) => handleVideoFieldChange("duration", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
            placeholder="Ex: 8:24"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">URL do embed</label>
          <Input
            value={content.embedUrl || ""}
            onChange={(e) => handleVideoFieldChange("embedUrl", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
            placeholder="Ex: https://www.youtube.com/embed/VIDEO_ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">URL da thumbnail (opcional)</label>
          <Input
            value={content.thumbnailUrl || ""}
            onChange={(e) => handleVideoFieldChange("thumbnailUrl", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
            placeholder="URL da imagem de preview"
          />
        </div>
      </div>
    );
  };
  
  const renderCustomFields = () => {
    const content = blockData.content as any;
    
    const handleCustomContentChange = (value: string) => {
      const updatedBlock = {
        ...blockData,
        content: { ...content, content: value }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    const handleHtmlToggle = (value: boolean) => {
      const updatedBlock = {
        ...blockData,
        content: { ...content, html: value }
      };
      
      setBlockData(updatedBlock);
      onBlockChange(updatedBlock);
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="use-html" 
            checked={content.html || false}
            onChange={(e) => handleHtmlToggle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 text-primary focus:ring-primary"
          />
          <label htmlFor="use-html" className="text-sm font-medium text-gray-400">
            Usar HTML
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Conteúdo personalizado</label>
          <Textarea
            value={content.content || ""}
            onChange={(e) => handleCustomContentChange(e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white font-mono"
            rows={8}
            placeholder={content.html ? "<p>Conteúdo HTML personalizado</p>" : "Conteúdo de texto personalizado"}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-dark border border-dark-border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="block-handle h-5 w-5 text-gray-500 mr-2 cursor-move">
            <GripVertical className="h-5 w-5" />
          </span>
          <Select
            value={blockData.blockType}
            onValueChange={handleBlockTypeChange}
          >
            <SelectTrigger className="bg-dark border-none py-1 focus:ring-0 text-sm w-auto">
              <SelectValue>
                <span className={blockData.blockType === "alert" ? "text-amber-500" : "text-primary"}>
                  {blockTypeConfigs[blockData.blockType]?.emoji || "📦"} {blockTypeConfigs[blockData.blockType]?.label || "Bloco"}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-dark-surface border-dark-border">
              {Object.entries(blockTypeConfigs).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  <span>{config.emoji} {config.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="p-1.5 text-gray-400 hover:text-red-500"
            onClick={() => onBlockDelete(blockData.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400">Título do Bloco</label>
          <Input
            value={blockData.title || ""}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400">Descrição (opcional)</label>
          <Input
            value={blockData.description || ""}
            onChange={(e) => handleInputChange("description", e.target.value)}
            className="mt-1 bg-dark-surface border-dark-border text-white"
          />
        </div>
        
        {renderBlockTypeFields()}
      </div>
    </div>
  );
}
