import { supabase } from '@/config/supabaseClient';

// ─── Types ───────────────────────────────────────────────────

export interface Client {
  id: string;
  tipo_documento: string;
  numero_documento: string | null;
  razon_social: string | null;
  nombres_contacto: string;
  apellidos_contacto: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  comprobante_preferido: string;
  fecha_creacion: string;
}

export interface ClientFormData {
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  nombres_contacto: string;
  apellidos_contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  comprobante_preferido: string;
}

// ─── Service Functions (Capa 1) ──────────────────────────────

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('fecha_creacion', { ascending: false });

  if (error) throw new Error('Error al cargar clientes: ' + error.message);
  return data as Client[];
};

export const createClient = async (client: ClientFormData): Promise<Client> => {
  const { data, error } = await supabase
    .from('clientes')
    .insert(client)
    .select()
    .single();

  if (error) throw new Error('Error al crear cliente: ' + error.message);
  return data as Client;
};

export const updateClient = async (id: string, client: Partial<ClientFormData>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clientes')
    .update(client)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Error al actualizar cliente: ' + error.message);
  return data as Client;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === '23503') {
      throw new Error('No se puede eliminar: este cliente tiene cotizaciones asociadas.');
    }
    throw new Error('Error al eliminar cliente: ' + error.message);
  }
};
