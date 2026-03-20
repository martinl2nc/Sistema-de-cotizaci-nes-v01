import { supabase } from '@/config/supabaseClient';

export interface QuoteListItem {
  id: string;
  numero_correlativo: string;
  fecha_emision: string;
  estado: 'Borrador' | 'Por Revisar' | 'Enviada' | 'Aprobada' | 'Rechazada';
  total_final: number;
  cliente: {
    nombres_contacto: string | null;
    apellidos_contacto: string | null;
    razon_social: string | null;
    numero_documento: string | null;
  };
  vendedor: {
    nombre: string;
  };
}

export const getQuotesList = async (): Promise<QuoteListItem[]> => {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      id,
      numero_correlativo,
      fecha_emision,
      estado,
      total_final,
      cliente:clientes(nombres_contacto, apellidos_contacto, razon_social, numero_documento),
      vendedor:vendedores(nombre)
    `)
    .order('fecha_emision', { ascending: false });

  if (error) {
    console.error('Error fetching quotes full:', error);
    throw new Error(`Error ${error.code}: ${error.message} - ${error.details || ''}`);
  }

  // Supabase syntax returns an array for foreign keys technically, but practically it's one object if it's a 1-to-many.
  // We type assertion to safely map because we know our schema is 1-to-many relationship
  return data as unknown as QuoteListItem[];
};

export const updateQuoteStatus = async (id: string, newStatus: string) => {
  const { error } = await supabase
    .from('cotizaciones')
    .update({ estado: newStatus, ultima_actualizacion: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error('Error updating status: ' + error.message);
  return true;
};

export const deleteQuote = async (id: string) => {
  const { error } = await supabase
    .from('cotizaciones')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Error deleting quote: ' + error.message);
  return true;
};

export const getSellers = async () => {
  const { data, error } = await supabase
    .from('vendedores')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre');

  if (error) throw new Error('Error fetching sellers: ' + error.message);
  return data;
};
