import { API_ENDPOINTS } from "./constants";
import type { Category, Resource, ContentBlock, ThemeSettings } from "@shared/schema";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || response.statusText);
  }
  return response.json();
}

export const api = {
  // Categories
  getCategories: () => 
    fetch(API_ENDPOINTS.CATEGORIES)
      .then(res => handleResponse<Category[]>(res)),
      
  getCategory: (id: number) => 
    fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`)
      .then(res => handleResponse<Category>(res)),
      
  createCategory: (data: Partial<Category>) => 
    fetch(API_ENDPOINTS.CATEGORIES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Category>(res)),
    
  updateCategory: (id: number, data: Partial<Category>) =>
    fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Category>(res)),
    
  deleteCategory: (id: number) =>
    fetch(`${API_ENDPOINTS.CATEGORIES}/${id}`, {
      method: "DELETE"
    }).then(res => handleResponse<void>(res)),

  // Resources
  getResources: () =>
    fetch(API_ENDPOINTS.RESOURCES)
      .then(res => handleResponse<Resource[]>(res)),
      
  getResourcesByCategory: (categoryId: number) =>
    fetch(`${API_ENDPOINTS.RESOURCES}?categoryId=${categoryId}`)
      .then(res => handleResponse<Resource[]>(res)),
      
  getResource: (id: number) =>
    fetch(`${API_ENDPOINTS.RESOURCES}/${id}`)
      .then(res => handleResponse<Resource>(res)),
      
  createResource: (data: Partial<Resource>) =>
    fetch(API_ENDPOINTS.RESOURCES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Resource>(res)),
    
  updateResource: (id: number, data: Partial<Resource>) =>
    fetch(`${API_ENDPOINTS.RESOURCES}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => handleResponse<Resource>(res)),
    
  deleteResource: (id: number) =>
    fetch(`${API_ENDPOINTS.RESOURCES}/${id}`, {
      method: "DELETE"
    }).then(res => handleResponse<void>(res)),

  // Content Blocks
  getResourceBlocks: (resourceId: number) =>
    fetch(`${API_ENDPOINTS.RESOURCES}/${resourceId}/blocks`)
      .then(res => handleResponse<ContentBlock[]>(res)),
      
  createBlock: (data: Partial<ContentBlock>) =>
    fetch(API_ENDPOINTS.BLOCKS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => handleResponse<ContentBlock>(res)),
    
  updateBlock: (id: number, data: Partial<ContentBlock>) =>
    fetch(`${API_ENDPOINTS.BLOCKS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => handleResponse<ContentBlock>(res)),
    
  deleteBlock: (id: number) =>
    fetch(`${API_ENDPOINTS.BLOCKS}/${id}`, {
      method: "DELETE"
    }).then(res => handleResponse<void>(res)),
    
  reorderBlocks: (resourceId: number, blockIds: number[]) =>
    fetch(`${API_ENDPOINTS.RESOURCES}/${resourceId}/blocks/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockIds })
    }).then(res => handleResponse<ContentBlock[]>(res)),

  // Theme Settings
  getThemeSettings: () =>
    fetch(API_ENDPOINTS.THEME_SETTINGS)
      .then(res => handleResponse<ThemeSettings[]>(res)),
      
  getActiveTheme: () =>
    fetch(`${API_ENDPOINTS.THEME_SETTINGS}/active`)
      .then(res => handleResponse<ThemeSettings>(res)),
      
  createTheme: (data: Partial<ThemeSettings>) =>
    fetch(API_ENDPOINTS.THEME_SETTINGS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => handleResponse<ThemeSettings>(res)),
    
  updateTheme: (id: number, data: Partial<ThemeSettings>) =>
    fetch(`${API_ENDPOINTS.THEME_SETTINGS}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(res => handleResponse<ThemeSettings>(res)),
    
  deleteTheme: (id: number) =>
    fetch(`${API_ENDPOINTS.THEME_SETTINGS}/${id}`, {
      method: "DELETE"
    }).then(res => handleResponse<void>(res)),
    
  activateTheme: (id: number) =>
    fetch(`${API_ENDPOINTS.THEME_SETTINGS}/${id}/activate`, {
      method: "POST"
    }).then(res => handleResponse<ThemeSettings>(res))
};