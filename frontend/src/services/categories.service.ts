import { supabase } from '@/config/supabaseClient';

// ─── Types ───────────────────────────────────────────────────

export interface Category {
  id: string;
  nombre: string;
}

export interface CategoryFormData {
  nombre: string;
}

// ─── Service Functions (Capa 1) ──────────────────────────────

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw new Error('Error al cargar categorías: ' + error.message);
  return data as Category[];
};

export const createCategory = async (category: CategoryFormData): Promise<Category> => {
  const { data, error } = await supabase
    .from('categorias')
    .insert(category)
    .select()
    .single();

  if (error) throw new Error('Error al crear categoría: ' + error.message);
  return data as Category;
};

export const updateCategory = async (id: string, category: CategoryFormData): Promise<Category> => {
  const { data, error } = await supabase
    .from('categorias')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Error al actualizar categoría: ' + error.message);
  return data as Category;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === '23503') {
      throw new Error('No se puede eliminar: esta categoría tiene productos asociados.');
    }
    throw new Error('Error al eliminar categoría: ' + error.message);
  }
};
