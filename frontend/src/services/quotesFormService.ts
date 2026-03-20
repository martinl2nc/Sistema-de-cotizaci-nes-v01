import { supabase } from '@/config/supabaseClient';
import { deleteQuote as deleteQuoteBase } from './quotesService';

export interface ClientOption {
  id: string;
  razon_social: string | null;
  nombres_contacto: string | null;
  apellidos_contacto: string | null;
  numero_documento: string | null;
}

export interface SellerOption {
  id: string;
  nombre: string;
}

export interface ProductOption {
  id: string;
  nombre: string;
  precio_base: number | null;
}

export const fetchDropdownData = async () => {
  const [clientsRes, sellersRes, productsRes] = await Promise.all([
    supabase.from('clientes').select('id, razon_social, nombres_contacto, apellidos_contacto, numero_documento').order('razon_social'),
    supabase.from('vendedores').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('productos').select('id, nombre, precio_base').eq('activo', true).order('nombre')
  ]);

  if (clientsRes.error) throw new Error('Error fetching clients: ' + clientsRes.error.message);
  if (sellersRes.error) throw new Error('Error fetching sellers: ' + sellersRes.error.message);
  if (productsRes.error) throw new Error('Error fetching products: ' + productsRes.error.message);

  return {
    clients: clientsRes.data as ClientOption[],
    sellers: sellersRes.data as SellerOption[],
    products: productsRes.data as ProductOption[]
  };
};

export interface QuoteFormData {
  id?: string;
  cliente_id: string;
  vendedor_id: string;
  fecha_emision: string;
  fecha_validez: string;
  aplica_igv: boolean;
  descuento_global_monto: number;
  observaciones_pdf: string;
  subtotal: number;
  igv_monto: number;
  total_final: number;
  estado: string;
}

export interface QuoteFormLineItem {
  id?: string;
  producto_id: string | null;
  nombre_producto_historico: string;
  cantidad: number;
  precio_unitario: number;
  descuento_linea_monto: number;
  subtotal_linea: number;
}

export const saveQuote = async (quote: QuoteFormData, lineItems: QuoteFormLineItem[]) => {
  // 1. Save or Update the quote header
  let quoteId = quote.id;
  
  if (quoteId) {
    // Update
    const { error } = await supabase
      .from('cotizaciones')
      .update({
        cliente_id: quote.cliente_id,
        vendedor_id: quote.vendedor_id,
        fecha_emision: quote.fecha_emision,
        fecha_validez: quote.fecha_validez,
        aplica_igv: quote.aplica_igv,
        descuento_global_monto: quote.descuento_global_monto,
        observaciones_pdf: quote.observaciones_pdf,
        subtotal: quote.subtotal,
        igv_monto: quote.igv_monto,
        total_final: quote.total_final,
        estado: quote.estado,
        ultima_actualizacion: new Date().toISOString()
      })
      .eq('id', quoteId);
      
    if (error) throw new Error('Error updating quote: ' + error.message);
    
    // For simplicity in a basic app, we delete existing lines and re-insert them when updating.
    // In a highly optimized production app, you would upsert/delete selectively.
    const { error: deleteError } = await supabase
      .from('cotizaciones_lineas')
      .delete()
      .eq('cotizacion_id', quoteId);
      
    if (deleteError) throw new Error('Error clearing old lines: ' + deleteError.message);

  } else {
    // Insert
    const { data, error } = await supabase
      .from('cotizaciones')
      .insert([{
        cliente_id: quote.cliente_id,
        vendedor_id: quote.vendedor_id,
        fecha_emision: quote.fecha_emision,
        fecha_validez: quote.fecha_validez,
        aplica_igv: quote.aplica_igv,
        descuento_global_monto: quote.descuento_global_monto,
        observaciones_pdf: quote.observaciones_pdf,
        subtotal: quote.subtotal,
        igv_monto: quote.igv_monto,
        total_final: quote.total_final,
        estado: quote.estado
      }])
      .select('id')
      .single();
      
    if (error) throw new Error('Error creating quote: ' + error.message);
    quoteId = data.id;
  }

  // 2. Insert line items
  if (lineItems.length > 0 && quoteId) {
    const linesToInsert = lineItems.map(item => ({
      cotizacion_id: quoteId,
      producto_id: item.producto_id || null, // null if custom item
      nombre_producto_historico: item.nombre_producto_historico,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      descuento_linea_monto: item.descuento_linea_monto,
      subtotal_linea: item.subtotal_linea
    }));

    const { error: linesError } = await supabase
      .from('cotizaciones_lineas')
      .insert(linesToInsert);

    if (linesError) throw new Error('Error saving line items: ' + linesError.message);
  }

  return quoteId;
};

export const fetchQuoteById = async (id: string) => {
  // Fetch header
  const { data: quote, error: quoteError } = await supabase
    .from('cotizaciones')
    .select('*')
    .eq('id', id)
    .single();

  if (quoteError) throw new Error('Error fetching quote: ' + quoteError.message);

  // Fetch lines
  const { data: lineItems, error: linesError } = await supabase
    .from('cotizaciones_lineas')
    .select('*')
    .eq('cotizacion_id', id)
    .order('id'); // Or some line number if you had it, using id preserves insertion order generally

  if (linesError) throw new Error('Error fetching quote lines: ' + linesError.message);

  return { quote, lineItems };
};

export const deleteQuote = deleteQuoteBase;
