import { pgTable, text, serial, integer, json, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Resources
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  categoryId: integer("category_id").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readTime: integer("read_time").default(5),
});

export const insertResourceSchema = createInsertSchema(resources).pick({
  title: true,
  description: true,
  categoryId: true,
  readTime: true,
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Content Blocks
export const blockTypes = [
  "checklist",
  "alert",
  "text",
  "copyableText",
  "fileDownload",
  "link",
  "video",
  "custom",
] as const;

export const contentBlocks = pgTable("content_blocks", {
  id: serial("id").primaryKey(),
  resourceId: integer("resource_id").notNull(),
  blockType: varchar("block_type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  content: json("content").notNull(), // store content based on block type
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blockTypeEnum = z.enum(blockTypes);

export const insertContentBlockSchema = createInsertSchema(contentBlocks).pick({
  resourceId: true,
  blockType: true,
  title: true,
  description: true,
  content: true,
  order: true,
});

export type InsertContentBlock = z.infer<typeof insertContentBlockSchema>;
export type ContentBlock = typeof contentBlocks.$inferSelect;

// Specific Block Content Schemas
export const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  checked: z.boolean().optional(),
});

export const checklistContentSchema = z.object({
  items: z.array(checklistItemSchema),
});

export const alertContentSchema = z.object({
  content: z.string(),
  type: z.enum(["warning", "info", "success", "error"]).optional(),
});

export const textContentSchema = z.object({
  content: z.string(),
});

export const copyableTextContentSchema = z.object({
  content: z.string(),
});

export const fileDownloadContentSchema = z.object({
  filename: z.string(),
  filesize: z.string().optional(),
  url: z.string().optional(),
});

export const linkContentSchema = z.object({
  links: z.array(z.object({
    url: z.string(),
    text: z.string(),
  })),
});

export const videoContentSchema = z.object({
  embedUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  title: z.string().optional(),
  duration: z.string().optional(),
});

export const customContentSchema = z.object({
  content: z.string(),
  html: z.boolean().optional(),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type ChecklistContent = z.infer<typeof checklistContentSchema>;
export type AlertContent = z.infer<typeof alertContentSchema>;
export type TextContent = z.infer<typeof textContentSchema>;
export type CopyableTextContent = z.infer<typeof copyableTextContentSchema>;
export type FileDownloadContent = z.infer<typeof fileDownloadContentSchema>;
export type LinkContent = z.infer<typeof linkContentSchema>;
export type VideoContent = z.infer<typeof videoContentSchema>;
export type CustomContent = z.infer<typeof customContentSchema>;

// Esquema para configurações de tema (white label)
export const themeSettings = pgTable("theme_settings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  primaryColor: varchar("primary_color", { length: 50 }).notNull().default("#9D5CFF"), // Cor primária (botões, links, destacados)
  backgroundColor: varchar("background_color", { length: 50 }).notNull().default("#0C0D13"), // Cor de fundo principal
  surfaceColor: varchar("surface_color", { length: 50 }).notNull().default("#14151F"), // Cor de superfície (cards, painéis)
  borderColor: varchar("border_color", { length: 50 }).notNull().default("#1F2231"), // Cor de bordas
  textColor: varchar("text_color", { length: 50 }).notNull().default("#FFFFFF"), // Cor de texto principal
  logoUrl: text("logo_url"), // URL para logotipo personalizado
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(false),
});

export const insertThemeSettingsSchema = createInsertSchema(themeSettings).pick({
  name: true,
  primaryColor: true,
  backgroundColor: true,
  surfaceColor: true,
  borderColor: true,
  textColor: true,
  logoUrl: true,
  isActive: true,
});

export type InsertThemeSettings = z.infer<typeof insertThemeSettingsSchema>;
export type ThemeSettings = typeof themeSettings.$inferSelect;
