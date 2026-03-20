import { supabase } from '@/config/supabaseClient';

export interface Seller {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
}

export interface SellerFormData {
  nombre: string;
  email: string;
  activo: boolean;
}

export const sellersService = {
  async getSellers(): Promise<Seller[]> {
    const { data, error } = await supabase
      .from('vendedores')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createSeller(seller: SellerFormData): Promise<Seller> {
    const { data, error } = await supabase
      .from('vendedores')
      .insert([seller])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateSeller(id: string, seller: Partial<SellerFormData>): Promise<Seller> {
    const { data, error } = await supabase
      .from('vendedores')
      .update(seller)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteSeller(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendedores')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleSellerActive(id: string, currentStatus: boolean): Promise<Seller> {
    const { data, error } = await supabase
      .from('vendedores')
      .update({ activo: !currentStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
