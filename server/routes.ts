import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCategorySchema, 
  insertResourceSchema, 
  insertContentBlockSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories Endpoints
  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await storage.getCategory(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    try {
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const success = await storage.deleteCategory(id);
    if (!success) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(204).end();
  });

  // Resources Endpoints
  app.get("/api/resources", async (req, res) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    
    if (categoryId) {
      if (isNaN(categoryId)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const resources = await storage.getResourcesByCategory(categoryId);
      return res.json(resources);
    }
    
    const resources = await storage.getResources();
    res.json(resources);
  });

  app.get("/api/resources/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }

    const resource = await storage.getResource(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  });

  app.post("/api/resources", async (req, res) => {
    try {
      const validatedData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create resource" });
    }
  });

  app.put("/api/resources/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }

    try {
      const validatedData = insertResourceSchema.partial().parse(req.body);
      const resource = await storage.updateResource(id, validatedData);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update resource" });
    }
  });

  app.delete("/api/resources/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }

    const success = await storage.deleteResource(id);
    if (!success) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.status(204).end();
  });

  // Content Blocks Endpoints
  app.get("/api/resources/:id/blocks", async (req, res) => {
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }

    const blocks = await storage.getContentBlocks(resourceId);
    res.json(blocks);
  });

  app.get("/api/blocks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid block ID" });
    }

    const block = await storage.getContentBlock(id);
    if (!block) {
      return res.status(404).json({ message: "Content block not found" });
    }

    res.json(block);
  });

  app.post("/api/blocks", async (req, res) => {
    try {
      const validatedData = insertContentBlockSchema.parse(req.body);
      const block = await storage.createContentBlock(validatedData);
      res.status(201).json(block);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid content block data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create content block" });
    }
  });

  app.put("/api/blocks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid block ID" });
    }

    try {
      const validatedData = insertContentBlockSchema.partial().parse(req.body);
      const block = await storage.updateContentBlock(id, validatedData);
      
      if (!block) {
        return res.status(404).json({ message: "Content block not found" });
      }
      
      res.json(block);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid content block data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update content block" });
    }
  });

  app.delete("/api/blocks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid block ID" });
    }

    const success = await storage.deleteContentBlock(id);
    if (!success) {
      return res.status(404).json({ message: "Content block not found" });
    }

    res.status(204).end();
  });

  app.post("/api/resources/:id/blocks/reorder", async (req, res) => {
    const resourceId = parseInt(req.params.id);
    if (isNaN(resourceId)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }

    const schema = z.object({
      blockIds: z.array(z.number()),
    });

    try {
      const { blockIds } = schema.parse(req.body);
      const blocks = await storage.reorderContentBlocks(resourceId, blockIds);
      res.json(blocks);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reorder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to reorder blocks" });
    }
  });

  // Theme Settings Endpoints (White Label)
  app.get("/api/theme-settings", async (req, res) => {
    const themes = await storage.getThemeSettings();
    res.json(themes);
  });

  app.get("/api/theme-settings/active", async (req, res) => {
    const theme = await storage.getActiveThemeSetting();
    if (!theme) {
      return res.status(404).json({ message: "No active theme found" });
    }
    res.json(theme);
  });

  app.get("/api/theme-settings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid theme ID" });
    }

    const theme = await storage.getThemeSettingById(id);
    if (!theme) {
      return res.status(404).json({ message: "Theme not found" });
    }
    res.json(theme);
  });

  app.post("/api/theme-settings", async (req, res) => {
    try {
      const themeSettingSchema = z.object({
        name: z.string().min(1, "Theme name is required"),
        primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
        backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
        surfaceColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
        borderColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
        textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid color format"),
        logoUrl: z.string().optional().nullable(),
        isActive: z.boolean().optional()
      });
      
      const validatedData = themeSettingSchema.parse(req.body);
      const theme = await storage.createThemeSetting(validatedData);
      res.status(201).json(theme);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid theme data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create theme" });
    }
  });

  app.put("/api/theme-settings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid theme ID" });
    }

    try {
      const themeSettingSchema = z.object({
        name: z.string().min(1).optional(),
        primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
        backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
        surfaceColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
        borderColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
        textColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
        logoUrl: z.string().optional().nullable(),
        isActive: z.boolean().optional()
      });
      
      const validatedData = themeSettingSchema.parse(req.body);
      const theme = await storage.updateThemeSetting(id, validatedData);
      
      if (!theme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      
      res.json(theme);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid theme data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update theme" });
    }
  });

  app.delete("/api/theme-settings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid theme ID" });
    }

    const success = await storage.deleteThemeSetting(id);
    if (!success) {
      return res.status(404).json({ message: "Theme not found or is currently active" });
    }

    res.status(204).end();
  });

  app.post("/api/theme-settings/:id/activate", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid theme ID" });
    }

    const theme = await storage.setActiveThemeSetting(id);
    if (!theme) {
      return res.status(404).json({ message: "Theme not found" });
    }

    res.json(theme);
  });

  const httpServer = createServer(app);
  return httpServer;
}
