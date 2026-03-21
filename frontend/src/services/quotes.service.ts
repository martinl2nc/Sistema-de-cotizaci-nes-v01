import { supabase } from '@/config/supabaseClient';
import type { Client } from './clients.service';

export interface QuoteLineItem {
  id?: string;
  cotizacion_id?: string;
  producto_id?: string | null;
  nombre_producto_historico: string;
  cantidad: number;
  precio_unitario: number;
  descuento_linea_monto: number;
  subtotal_linea: number;
}

export type QuoteStatus = 'Aprobada' | 'PDF Generado' | 'Enviada' | 'Cancelada' | 'Borrador';

export interface Quote {
  id: string;
  numero_correlativo: number;
  origen: string;
  woo_order_id?: number | null;
  cliente_id: string;
  vendedor_id?: string | null;
  fecha_emision: string;
  fecha_validez: string;
  estado: QuoteStatus;
  observaciones_pdf?: string;
  aplica_igv: boolean;
  subtotal: number;
  descuento_global_monto: number;
  igv_monto: number;
  total_final: number;
  fecha_creacion: string;
  ultima_actualizacion: string;
  
  // Relaciones
  clientes?: Client;
  perfiles_usuario?: { id: string, nombre: string, email?: string };
  cotizaciones_lineas?: QuoteLineItem[];
}

export interface QuoteFormData extends Omit<Quote, 'id' | 'numero_correlativo' | 'fecha_creacion' | 'ultima_actualizacion' | 'cotizaciones_lineas' | 'clientes' | 'perfiles_usuario'> {
  id?: string;
  lineas: QuoteLineItem[];
}

export const quotesService = {
  async getQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        clientes ( id, razon_social, nombres_contacto, apellidos_contacto, numero_documento ),
        perfiles_usuario ( id, nombre )
      `)
      .order('fecha_emision', { ascending: false })
      .order('numero_correlativo', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getQuoteById(id: string): Promise<Quote> {
    const { data, error } = await supabase
      .from('cotizaciones')
      .select(`
        *,
        clientes ( id, razon_social, nombres_contacto, apellidos_contacto, numero_documento, email, telefono, direccion ),
        perfiles_usuario ( id, nombre, email ),
        cotizaciones_lineas (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async saveQuote(quoteData: QuoteFormData): Promise<Quote> {
    const { lineas, ...headData } = quoteData;
    let finalQuoteId = headData.id;

    if (finalQuoteId) {
      // 1. Update Existing Quote Header
      const { error: headErr } = await supabase
        .from('cotizaciones')
        .update(headData)
        .eq('id', finalQuoteId);
      if (headErr) throw headErr;

      // 2. Delete all existing lines (to rewrite them easily)
      const { error: delErr } = await supabase
        .from('cotizaciones_lineas')
        .delete()
        .eq('cotizacion_id', finalQuoteId);
      if (delErr) throw delErr;

    } else {
      // 1. Insert New Quote Header
      const { data: newHead, error: headErr } = await supabase
        .from('cotizaciones')
        .insert([headData])
        .select()
        .single();
      if (headErr) throw headErr;
      finalQuoteId = newHead.id;
    }

    // 3. Insert Lines mapped with cotizacion_id
    if (lineas && lineas.length > 0 && finalQuoteId) {
      const lineasToInsert = lineas.map(l => ({
        ...l,
        id: l.id || crypto.randomUUID(),
        cotizacion_id: finalQuoteId
      }));

      const { error: linesErr } = await supabase
        .from('cotizaciones_lineas')
        .insert(lineasToInsert);
      if (linesErr) throw linesErr;
    }

    // Return the complete saved quote
    if (!finalQuoteId) throw new Error("Failed to save quote header.");
    return this.getQuoteById(finalQuoteId);
  },

  async deleteQuote(id: string): Promise<void> {
    const { error } = await supabase
      .from('cotizaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
  
  async updateQuoteStatus(id: string, status: QuoteStatus): Promise<Quote> {
    const { data, error } = await supabase
      .from('cotizaciones')
      .update({ estado: status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
};
