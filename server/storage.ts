import { 
  User, 
  InsertUser, 
  Category, 
  InsertCategory, 
  Resource, 
  InsertResource, 
  ContentBlock, 
  InsertContentBlock,
  ThemeSettings,
  InsertThemeSettings
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Resources
  getResources(): Promise<Resource[]>;
  getResourcesByCategory(categoryId: number): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  
  // Content Blocks
  getContentBlocks(resourceId: number): Promise<ContentBlock[]>;
  getContentBlock(id: number): Promise<ContentBlock | undefined>;
  createContentBlock(block: InsertContentBlock): Promise<ContentBlock>;
  updateContentBlock(id: number, block: Partial<InsertContentBlock>): Promise<ContentBlock | undefined>;
  deleteContentBlock(id: number): Promise<boolean>;
  reorderContentBlocks(resourceId: number, blockIds: number[]): Promise<ContentBlock[]>;
  
  // Theme Settings (White Label)
  getThemeSettings(): Promise<ThemeSettings[]>;
  getThemeSettingById(id: number): Promise<ThemeSettings | undefined>;
  getActiveThemeSetting(): Promise<ThemeSettings | undefined>;
  createThemeSetting(themeSetting: InsertThemeSettings): Promise<ThemeSettings>;
  updateThemeSetting(id: number, themeSetting: Partial<InsertThemeSettings>): Promise<ThemeSettings | undefined>;
  deleteThemeSetting(id: number): Promise<boolean>;
  setActiveThemeSetting(id: number): Promise<ThemeSettings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private resources: Map<number, Resource>;
  private contentBlocks: Map<number, ContentBlock>;
  private themeSettings: Map<number, ThemeSettings>;
  
  private userId: number;
  private categoryId: number;
  private resourceId: number;
  private contentBlockId: number;
  private themeSettingId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.resources = new Map();
    this.contentBlocks = new Map();
    this.themeSettings = new Map();
    
    this.userId = 1;
    this.categoryId = 1;
    this.resourceId = 1;
    this.contentBlockId = 1;
    this.themeSettingId = 1;
    
    // Initialize with some sample data
    this.initSampleData();
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const now = new Date();
    const newCategory: Category = { 
      ...category, 
      id, 
      createdAt: now, 
      updatedAt: now,
      icon: category.icon || null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory = { 
      ...existingCategory, 
      ...category,
      updatedAt: new Date() 
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    // Also delete all resources in this category
    const resources = await this.getResourcesByCategory(id);
    for (const resource of resources) {
      await this.deleteResource(resource.id);
    }
    
    return this.categories.delete(id);
  }

  // Resources
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }

  async getResourcesByCategory(categoryId: number): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.categoryId === categoryId
    );
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.resourceId++;
    const now = new Date();
    const newResource: Resource = { 
      ...resource, 
      id, 
      createdAt: now, 
      updatedAt: now,
      description: resource.description || null,
      readTime: resource.readTime || null
    };
    this.resources.set(id, newResource);
    return newResource;
  }

  async updateResource(id: number, resource: Partial<InsertResource>): Promise<Resource | undefined> {
    const existingResource = this.resources.get(id);
    if (!existingResource) return undefined;
    
    const updatedResource = { 
      ...existingResource, 
      ...resource,
      updatedAt: new Date() 
    };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    // Also delete all content blocks for this resource
    const blocks = await this.getContentBlocks(id);
    for (const block of blocks) {
      await this.deleteContentBlock(block.id);
    }
    
    return this.resources.delete(id);
  }

  // Content Blocks
  async getContentBlocks(resourceId: number): Promise<ContentBlock[]> {
    const blocks = Array.from(this.contentBlocks.values()).filter(
      (block) => block.resourceId === resourceId
    );
    
    // Sort by order
    return blocks.sort((a, b) => a.order - b.order);
  }

  async getContentBlock(id: number): Promise<ContentBlock | undefined> {
    return this.contentBlocks.get(id);
  }

  async createContentBlock(block: InsertContentBlock): Promise<ContentBlock> {
    const id = this.contentBlockId++;
    const now = new Date();
    const newBlock: ContentBlock = { 
      ...block, 
      id, 
      createdAt: now, 
      updatedAt: now,
      title: block.title || null,
      description: block.description || null
    };
    this.contentBlocks.set(id, newBlock);
    return newBlock;
  }

  async updateContentBlock(id: number, block: Partial<InsertContentBlock>): Promise<ContentBlock | undefined> {
    const existingBlock = this.contentBlocks.get(id);
    if (!existingBlock) return undefined;
    
    const updatedBlock = { 
      ...existingBlock, 
      ...block,
      updatedAt: new Date() 
    };
    this.contentBlocks.set(id, updatedBlock);
    return updatedBlock;
  }

  async deleteContentBlock(id: number): Promise<boolean> {
    return this.contentBlocks.delete(id);
  }

  async reorderContentBlocks(resourceId: number, blockIds: number[]): Promise<ContentBlock[]> {
    const blocks = await this.getContentBlocks(resourceId);
    const blockMap = new Map<number, ContentBlock>();
    
    blocks.forEach(block => blockMap.set(block.id, block));
    
    const updatedBlocks: ContentBlock[] = [];
    
    // Update order based on the provided blockIds
    for (let i = 0; i < blockIds.length; i++) {
      const blockId = blockIds[i];
      const block = blockMap.get(blockId);
      
      if (block) {
        const updatedBlock = await this.updateContentBlock(blockId, { order: i });
        if (updatedBlock) {
          updatedBlocks.push(updatedBlock);
        }
      }
    }
    
    return updatedBlocks.sort((a, b) => a.order - b.order);
  }

  // Theme Settings (White Label)
  async getThemeSettings(): Promise<ThemeSettings[]> {
    return Array.from(this.themeSettings.values());
  }

  async getThemeSettingById(id: number): Promise<ThemeSettings | undefined> {
    return this.themeSettings.get(id);
  }

  async getActiveThemeSetting(): Promise<ThemeSettings | undefined> {
    return Array.from(this.themeSettings.values()).find(
      (setting) => setting.isActive
    );
  }

  async createThemeSetting(themeSetting: InsertThemeSettings): Promise<ThemeSettings> {
    const id = this.themeSettingId++;
    const now = new Date();
    
    const newThemeSetting: ThemeSettings = {
      ...themeSetting,
      id,
      createdAt: now,
      updatedAt: now,
      logoUrl: themeSetting.logoUrl || null,
    };
    
    // Se o novo tema for definido como ativo, desative todos os outros
    if (newThemeSetting.isActive) {
      await this.deactivateAllThemes();
    }
    
    this.themeSettings.set(id, newThemeSetting);
    return newThemeSetting;
  }

  async updateThemeSetting(id: number, themeSetting: Partial<InsertThemeSettings>): Promise<ThemeSettings | undefined> {
    const existingThemeSetting = this.themeSettings.get(id);
    if (!existingThemeSetting) return undefined;
    
    const wasActive = existingThemeSetting.isActive;
    const willBeActive = themeSetting.isActive !== undefined ? themeSetting.isActive : wasActive;
    
    const updatedThemeSetting = {
      ...existingThemeSetting,
      ...themeSetting,
      updatedAt: new Date(),
    };
    
    // Se o tema está sendo definido como ativo, desative todos os outros
    if (!wasActive && willBeActive) {
      await this.deactivateAllThemes();
    }
    
    this.themeSettings.set(id, updatedThemeSetting);
    return updatedThemeSetting;
  }

  async deleteThemeSetting(id: number): Promise<boolean> {
    // Não permitir excluir o tema ativo
    const theme = this.themeSettings.get(id);
    if (theme?.isActive) {
      return false;
    }
    
    return this.themeSettings.delete(id);
  }

  async setActiveThemeSetting(id: number): Promise<ThemeSettings | undefined> {
    const theme = this.themeSettings.get(id);
    if (!theme) return undefined;
    
    // Desativar todos os temas
    await this.deactivateAllThemes();
    
    // Ativar o tema especificado
    const updatedTheme = {
      ...theme,
      isActive: true,
      updatedAt: new Date(),
    };
    
    this.themeSettings.set(id, updatedTheme);
    return updatedTheme;
  }

  private async deactivateAllThemes(): Promise<void> {
    for (const [id, theme] of this.themeSettings.entries()) {
      if (theme.isActive) {
        const updatedTheme = {
          ...theme,
          isActive: false,
          updatedAt: new Date(),
        };
        this.themeSettings.set(id, updatedTheme);
      }
    }
  }

  private initSampleData() {
    // Inicializa os temas padrão
    this.initDefaultTheme();
    
    // Sample categories
    const preEventCategory: Category = {
      id: this.categoryId++,
      name: "Pré-Evento",
      icon: "CheckCircle",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const duringEventCategory: Category = {
      id: this.categoryId++,
      name: "Durante o Evento",
      icon: "Calendar",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const marketingCategory: Category = {
      id: this.categoryId++,
      name: "Materiais de Marketing",
      icon: "Package",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.categories.set(preEventCategory.id, preEventCategory);
    this.categories.set(duringEventCategory.id, duringEventCategory);
    this.categories.set(marketingCategory.id, marketingCategory);
    
    // Sample resources for pre-event category
    const checklistResource: Resource = {
      id: this.resourceId++,
      title: "Checklist de Preparação",
      description: "Todos os itens que você precisa verificar antes do evento para garantir que seu estande esteja perfeito.",
      categoryId: preEventCategory.id,
      updatedAt: new Date("2023-05-10"),
      createdAt: new Date("2023-05-10"),
      readTime: 5
    };
    
    const documentsResource: Resource = {
      id: this.resourceId++,
      title: "Documentos Obrigatórios",
      description: "Documentação necessária para participação e montagem do seu estande no evento.",
      categoryId: preEventCategory.id,
      updatedAt: new Date("2023-05-02"),
      createdAt: new Date("2023-05-02"),
      readTime: 3
    };
    
    const setupResource: Resource = {
      id: this.resourceId++,
      title: "Orientações de Montagem",
      description: "Instruções detalhadas para a montagem do seu estande, incluindo regras e cronograma.",
      categoryId: preEventCategory.id,
      updatedAt: new Date("2023-05-15"),
      createdAt: new Date("2023-05-15"),
      readTime: 8
    };
    
    // Sample resources for during-event category
    const scheduleResource: Resource = {
      id: this.resourceId++,
      title: "Horários do Evento",
      description: "Cronograma completo de todas as atividades do evento, incluindo abertura e fechamento.",
      categoryId: duringEventCategory.id,
      updatedAt: new Date("2023-05-20"),
      createdAt: new Date("2023-05-20"),
      readTime: 2
    };
    
    const contactsResource: Resource = {
      id: this.resourceId++,
      title: "Contatos de Emergência",
      description: "Lista de contatos importantes para solucionar problemas durante o evento.",
      categoryId: duringEventCategory.id,
      updatedAt: new Date("2023-05-22"),
      createdAt: new Date("2023-05-22"),
      readTime: 1
    };
    
    // Sample resources for marketing category
    const graphicsResource: Resource = {
      id: this.resourceId++,
      title: "Materiais Gráficos",
      description: "Logos, banners e templates para suas comunicações sobre o evento.",
      categoryId: marketingCategory.id,
      updatedAt: new Date("2023-05-05"),
      createdAt: new Date("2023-05-05"),
      readTime: 4
    };
    
    const socialResource: Resource = {
      id: this.resourceId++,
      title: "Anúncios nas Redes Sociais",
      description: "Modelos de posts e textos para divulgação da sua participação no evento.",
      categoryId: marketingCategory.id,
      updatedAt: new Date("2023-05-12"),
      createdAt: new Date("2023-05-12"),
      readTime: 6
    };
    
    this.resources.set(checklistResource.id, checklistResource);
    this.resources.set(documentsResource.id, documentsResource);
    this.resources.set(setupResource.id, setupResource);
    this.resources.set(scheduleResource.id, scheduleResource);
    this.resources.set(contactsResource.id, contactsResource);
    this.resources.set(graphicsResource.id, graphicsResource);
    this.resources.set(socialResource.id, socialResource);
    
    // Sample content blocks for checklist resource
    const checklistBlock: ContentBlock = {
      id: this.contentBlockId++,
      resourceId: checklistResource.id,
      blockType: "checklist",
      title: "Checklist: O que levar para o evento",
      description: "Confira se você preparou todos estes itens antes de ir para o evento.",
      content: {
        items: [
          { id: "1", text: "Banners e materiais gráficos para o estande", checked: false },
          { id: "2", text: "Cartões de visita e materiais promocionais", checked: false },
          { id: "3", text: "Computadores e dispositivos eletrônicos", checked: false },
          { id: "4", text: "Extensões e adaptadores de energia", checked: false },
          { id: "5", text: "Lista de contatos emergenciais", checked: false }
        ]
      },
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const alertBlock: ContentBlock = {
      id: this.contentBlockId++,
      resourceId: checklistResource.id,
      blockType: "alert",
      title: "Informação Importante",
      description: "",
      content: {
        content: "Não esqueça que a montagem do seu estande deve ser concluída até 18:00h do dia anterior ao início do evento. Estandes incompletos não poderão participar.",
        type: "warning"
      },
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const textBlock: ContentBlock = {
      id: this.contentBlockId++,
      resourceId: checklistResource.id,
      blockType: "text",
      title: "Informações sobre Estacionamento",
      description: "",
      content: {
        content: "O evento disponibiliza estacionamento gratuito para expositores mediante apresentação de credencial. O acesso é pela entrada lateral do pavilhão (Portão B).\n\nPara descarregar materiais, utilize a doca de carga e descarga nos seguintes horários:\n- Dia de montagem: 08:00h às 20:00h\n- Durante o evento: 07:00h às 09:00h"
      },
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const copyableTextBlock: ContentBlock = {
      id: this.contentBlockId++,
      resourceId: checklistResource.id,
      blockType: "copyableText",
      title: "Código de Acesso Wi-Fi",
      description: "",
      content: {
        content: "EXPOSITOR2023_VIP"
      },
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const fileDownloadBlock: ContentBlock = {
      id: this.contentBlockId++,
      resourceId: checklistResource.id,
      blockType: "fileDownload",
      title: "Manual do Expositor",
      description: "Download do manual completo com todas as normas e regulamentos.",
      content: {
        filename: "manual_expositor_2023.pdf",
        filesize: "2.4 MB",
        url: "#"
      },
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const linkBlock: ContentBlock = {
      id: this.contentBlockId++,
      resourceId: checklistResource.id,
      blockType: "link",
      title: "Links Úteis",
      description: "",
      content: {
        links: [
          { url: "#", text: "Mapa do Local do Evento" },
          { url: "#", text: "Lista de Hotéis Parceiros" },
          { url: "#", text: "Formulário para Solicitações Especiais" }
        ]
      },
      order: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const videoBlock: ContentBlock = {
      id: this.contentBlockId++,
      resourceId: checklistResource.id,
      blockType: "video",
      title: "Tutorial: Montagem do Estande",
      description: "Assista ao vídeo para instruções detalhadas sobre a montagem.",
      content: {
        title: "Tutorial de Montagem de Estande",
        duration: "8:24",
        thumbnailUrl: "#",
        embedUrl: "#"
      },
      order: 6,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const customBlock: ContentBlock = {
      id: this.contentBlockId++,
      resourceId: checklistResource.id,
      blockType: "custom",
      title: "Programação do Evento",
      description: "",
      content: {
        content: `<table class="min-w-full divide-y divide-dark-border">
          <thead>
            <tr>
              <th class="px-4 py-3 bg-dark-surface text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Dia</th>
              <th class="px-4 py-3 bg-dark-surface text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Horário</th>
              <th class="px-4 py-3 bg-dark-surface text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Atividade</th>
            </tr>
          </thead>
          <tbody class="bg-dark-surface divide-y divide-dark-border">
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Dia 1</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">08:00 - 09:30</td>
              <td class="px-4 py-3 text-sm text-gray-300">Credenciamento</td>
            </tr>
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Dia 1</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">10:00 - 11:30</td>
              <td class="px-4 py-3 text-sm text-gray-300">Cerimônia de Abertura</td>
            </tr>
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Dia 1</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">12:00 - 14:00</td>
              <td class="px-4 py-3 text-sm text-gray-300">Almoço</td>
            </tr>
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">Dia 1</td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-300">14:30 - 16:00</td>
              <td class="px-4 py-3 text-sm text-gray-300">Painel de Discussão</td>
            </tr>
          </tbody>
        </table>`,
        html: true
      },
      order: 7,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.contentBlocks.set(checklistBlock.id, checklistBlock);
    this.contentBlocks.set(alertBlock.id, alertBlock);
    this.contentBlocks.set(textBlock.id, textBlock);
    this.contentBlocks.set(copyableTextBlock.id, copyableTextBlock);
    this.contentBlocks.set(fileDownloadBlock.id, fileDownloadBlock);
    this.contentBlocks.set(linkBlock.id, linkBlock);
    this.contentBlocks.set(videoBlock.id, videoBlock);
    this.contentBlocks.set(customBlock.id, customBlock);
  }

  private initDefaultTheme() {
    // Tema padrão (já ativo)
    const defaultTheme: ThemeSettings = {
      id: this.themeSettingId++,
      name: "Tema Padrão",
      primaryColor: "#9D5CFF",
      backgroundColor: "#0C0D13",
      surfaceColor: "#14151F",
      borderColor: "#1F2231",
      textColor: "#FFFFFF",
      logoUrl: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Tema alternativo
    const alternativeTheme: ThemeSettings = {
      id: this.themeSettingId++,
      name: "Tema Corporativo",
      primaryColor: "#0073E6",
      backgroundColor: "#0F172A",
      surfaceColor: "#1E293B",
      borderColor: "#334155",
      textColor: "#F8FAFC",
      logoUrl: null,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.themeSettings.set(defaultTheme.id, defaultTheme);
    this.themeSettings.set(alternativeTheme.id, alternativeTheme);
  }
}

export const storage = new MemStorage();
