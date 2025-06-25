import { supabase } from './SupabaseClient';
import { MarkdownPage, MarkdownPageInsert, MarkdownPageUpdate } from './types';

export interface SupabaseMarkdownRepositoryInterface {
  save(markdownData: MarkdownPageInsert): Promise<MarkdownPage>;
  findByNotionPageId(notionPageId: string): Promise<MarkdownPage | null>;
  findById(id: string): Promise<MarkdownPage | null>;
  findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<MarkdownPage[]>;
  update(id: string, updateData: MarkdownPageUpdate): Promise<MarkdownPage>;
  delete(id: string): Promise<void>;
  upsert(markdownData: MarkdownPageInsert): Promise<MarkdownPage>;
  search(query: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<MarkdownPage[]>;
}

export class SupabaseMarkdownRepository implements SupabaseMarkdownRepositoryInterface {

  async save(markdownData: MarkdownPageInsert): Promise<MarkdownPage> {
    const { data, error } = await supabase
      .from('markdown_pages')
      .insert(markdownData)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al guardar página de markdown: ${error.message}`);
    }

    return data;
  }

  async findByNotionPageId(notionPageId: string): Promise<MarkdownPage | null> {
    const { data, error } = await supabase
      .from('markdown_pages')
      .select('*')
      .eq('notion_page_id', notionPageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el registro
        return null;
      }
      throw new Error(`Error al buscar página por Notion ID: ${error.message}`);
    }

    return data;
  }

  async findById(id: string): Promise<MarkdownPage | null> {
    const { data, error } = await supabase
      .from('markdown_pages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Error al buscar página por ID: ${error.message}`);
    }

    return data;
  }

  async findAll(options?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDirection?: 'asc' | 'desc';
  }): Promise<MarkdownPage[]> {
    let query = supabase.from('markdown_pages').select('*');

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy, {
        ascending: options.orderDirection === 'asc'
      });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener páginas: ${error.message}`);
    }

    return data || [];
  }

  async update(id: string, updateData: MarkdownPageUpdate): Promise<MarkdownPage> {
    const { data, error } = await supabase
      .from('markdown_pages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar página: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('markdown_pages')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error al eliminar página: ${error.message}`);
    }
  }

  async upsert(markdownData: MarkdownPageInsert): Promise<MarkdownPage> {
    const { data, error } = await supabase
      .from('markdown_pages')
      .upsert(markdownData, {
        onConflict: 'notion_page_id'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error al hacer upsert de página: ${error.message}`);
    }

    return data;
  }

  async search(query: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<MarkdownPage[]> {
    let supabaseQuery = supabase
      .from('markdown_pages')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

    if (options?.limit) {
      supabaseQuery = supabaseQuery.limit(options.limit);
    }

    if (options?.offset) {
      supabaseQuery = supabaseQuery.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    supabaseQuery = supabaseQuery.order('created_at', { ascending: false });

    const { data, error } = await supabaseQuery;

    if (error) {
      throw new Error(`Error al buscar páginas: ${error.message}`);
    }

    return data || [];
  }
} 