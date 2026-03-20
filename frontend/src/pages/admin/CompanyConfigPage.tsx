import { useState, useEffect } from 'react';
import { useCompanyConfig, useSaveCompanyConfig } from '@/hooks/useCompanyConfig';
import AdminTabs from '@/components/admin/AdminTabs';
import type { CompanyConfigFormData } from '@/services/companyConfig.service';

const initialFormState: CompanyConfigFormData = {
  razon_social: '',
  ruc: '',
  direccion: '',
  cuentas_bancarias: '',
  terminos_condiciones: '',
};

export default function CompanyConfigPage() {
  const { data: config, isLoading, isError, error } = useCompanyConfig();
  const saveMutation = useSaveCompanyConfig();

  const [formData, setFormData] = useState<CompanyConfigFormData>(initialFormState);
  const [initialized, setInitialized] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Populate form when data loads
  useEffect(() => {
    if (!initialized && !isLoading && config) {
      setFormData({
        razon_social: config.razon_social || '',
        ruc: config.ruc || '',
        direccion: config.direccion || '',
        cuentas_bancarias: config.cuentas_bancarias || '',
        terminos_condiciones: config.terminos_condiciones || '',
      });
      setInitialized(true);
    }
    // If no config exists yet (null), keep defaults
    if (!initialized && !isLoading && config === null) {
      setInitialized(true);
    }
  }, [config, isLoading, initialized]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!formData.razon_social.trim()) {
      setErrorMsg('La Razón Social es obligatoria.');
      return;
    }
    if (!formData.ruc.trim()) {
      setErrorMsg('El RUC es obligatorio.');
      return;
    }

    saveMutation.mutate(
      { id: config?.id ?? null, data: formData },
      {
        onSuccess: () => {
          setSuccessMsg('Configuración guardada correctamente.');
          setTimeout(() => setSuccessMsg(null), 4000);
        },
        onError: (err) => setErrorMsg(err.message),
      }
    );
  };

  // ─── Content area based on state ───────────────────────────
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="max-w-[800px] w-full mx-auto">
          <div className="bg-[#181B21] border border-[#334155] rounded-xl shadow-sm p-6 sm:p-8 space-y-6 animate-pulse">
            <div className="h-6 bg-[#334155]/50 rounded w-2/3"></div>
            <div className="h-4 bg-[#334155]/30 rounded w-1/2"></div>
            <div className="h-px bg-[#334155]"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-10 bg-[#334155]/30 rounded"></div>
              <div className="h-10 bg-[#334155]/30 rounded"></div>
            </div>
            <div className="h-10 bg-[#334155]/30 rounded"></div>
            <div className="h-24 bg-[#334155]/30 rounded"></div>
            <div className="h-24 bg-[#334155]/30 rounded"></div>
          </div>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="max-w-[800px] w-full mx-auto">
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-lg p-4 text-[#EF4444] text-sm font-medium">
            Error al cargar configuración: {error instanceof Error ? error.message : 'Error desconocido'}
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-[800px] w-full mx-auto">
        <div className="bg-[#181B21] border border-[#334155] rounded-xl shadow-sm flex flex-col p-6 sm:p-8">

          {/* Form Header */}
          <div className="mb-8 border-b border-[#334155] pb-5">
            <h2 className="text-lg font-semibold tracking-tight text-[#E2E8F0]">Datos Legales para el PDF</h2>
            <p className="text-sm text-[#94A3B8] mt-1.5">Esta información se imprimirá en la cabecera y pie de página de las cotizaciones.</p>
          </div>

          {/* Alerts */}
          {successMsg && (
            <div className="mb-6 bg-[#10B981]/10 border border-[#10B981]/50 rounded-lg p-4 text-[#10B981] text-sm font-medium flex items-center gap-2">
              <iconify-icon icon="solar:check-circle-linear" class="text-lg"></iconify-icon>
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-lg p-4 text-[#EF4444] text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Razón Social + RUC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Razón Social</label>
                <input
                  type="text"
                  name="razon_social"
                  value={formData.razon_social}
                  onChange={handleChange}
                  placeholder="Ej. Tech Solutions S.A.C."
                  className="block w-full bg-[#0F1115] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#94A3B8]/60 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-shadow"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">RUC</label>
                <input
                  type="text"
                  name="ruc"
                  value={formData.ruc}
                  onChange={handleChange}
                  placeholder="Ej. 20123456789"
                  className="block w-full bg-[#0F1115] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#94A3B8]/60 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-shadow"
                />
              </div>
            </div>

            {/* Row 2: Dirección */}
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Dirección Principal</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej. Av. Principal 123, Distrito, Ciudad"
                className="block w-full bg-[#0F1115] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#94A3B8]/60 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-shadow"
              />
            </div>

            {/* Row 3: Cuentas Bancarias */}
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Cuentas Bancarias</label>
              <textarea
                rows={4}
                name="cuentas_bancarias"
                value={formData.cuentas_bancarias}
                onChange={handleChange}
                placeholder={"Ej. BCP Soles: 191-1234567-0-12\nBCP Dólares: 191-1234567-1-12"}
                className="block w-full bg-[#0F1115] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#94A3B8]/60 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-shadow resize-y"
              ></textarea>
            </div>

            {/* Row 4: Términos y Condiciones */}
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Términos y Condiciones Estándar</label>
              <textarea
                rows={4}
                name="terminos_condiciones"
                value={formData.terminos_condiciones}
                onChange={handleChange}
                placeholder="Ej. La presente cotización tiene una validez de 15 días calendario..."
                className="block w-full bg-[#0F1115] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] placeholder-[#94A3B8]/60 focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-shadow resize-y"
              ></textarea>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6 border-t border-[#334155] mt-8">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="flex justify-center items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#181B21] disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Page Header & Tabs */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-[#E2E8F0]">Administración del Sistema</h1>

          {/* Tabs */}
          <AdminTabs />
        </div>

        {renderContent()}

        {/* Spacer */}
        <div className="h-8"></div>
      </main>
    </div>
  );
}
