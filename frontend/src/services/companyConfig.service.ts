import { supabase } from '@/config/supabaseClient';

// ─── Types ───────────────────────────────────────────────────

export interface CompanyConfig {
  id: string;
  razon_social: string;
  ruc: string;
  direccion: string | null;
  cuentas_bancarias: string | null;
  terminos_condiciones: string | null;
}

export interface CompanyConfigFormData {
  razon_social: string;
  ruc: string;
  direccion: string;
  cuentas_bancarias: string;
  terminos_condiciones: string;
}

// ─── Service Functions (Capa 1) ──────────────────────────────

/**
 * Gets the single company configuration row.
 * This table follows a singleton pattern (always 1 row).
 */
export const getCompanyConfig = async (): Promise<CompanyConfig | null> => {
  const { data, error } = await supabase
    .from('empresa_configuracion')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    // PGRST116 = no rows found — valid for first-time setup
    if (error.code === 'PGRST116') return null;
    throw new Error('Error al cargar configuración: ' + error.message);
  }
  return data as CompanyConfig;
};

/**
 * Updates the existing company configuration row.
 * If no row exists, inserts a new one (upsert).
 */
export const saveCompanyConfig = async (
  id: string | null,
  data: CompanyConfigFormData
): Promise<CompanyConfig> => {
  if (id) {
    // Update existing row
    const { data: updated, error } = await supabase
      .from('empresa_configuracion')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error('Error al guardar configuración: ' + error.message);
    return updated as CompanyConfig;
  } else {
    // Insert new row (first-time setup)
    const { data: created, error } = await supabase
      .from('empresa_configuracion')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error('Error al crear configuración: ' + error.message);
    return created as CompanyConfig;
  }
};
