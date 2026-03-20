import AdminTabs from '@/components/admin/AdminTabs';

export default function ComingSoonPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Page Header & Tabs */}
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold tracking-tight text-[#E2E8F0]">Administración del Sistema</h1>
          <AdminTabs />
        </div>

        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center text-3xl">
            <iconify-icon icon="solar:clock-circle-linear" />
          </div>
          <h1 className="text-2xl font-semibold text-[#E2E8F0]">Próximamente</h1>
          <p className="text-[#94A3B8] text-center max-w-md">
            Esta sección está actualmente en desarrollo. Estará disponible en una futura actualización.
          </p>
          <a 
            href="/"
            className="bg-[#334155] hover:bg-[#475569] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors mt-4"
          >
            Volver al Inicio
          </a>
        </div>
      </main>
    </div>
  );
}
