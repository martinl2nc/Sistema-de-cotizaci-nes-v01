import { useLocation, Link } from 'react-router-dom';
import { useCompanyConfig } from '@/hooks/useCompanyConfig';

export default function Header() {
  const location = useLocation();
  const { data: config } = useCompanyConfig();

  // Simple breadcrumb logic
  const getBreadcrumbs = () => {
    if (location.pathname.startsWith('/admin')) {
      const sectionMap: Record<string, string> = {
        '/admin/clientes': 'Clientes',
        '/admin/empresa': 'Empresa',
        '/admin/productos': 'Productos',
        '/admin/vendedores': 'Vendedores',
      };
      const sectionLabel = sectionMap[location.pathname] || 'Clientes';
      return (
        <>
          <Link to="/admin" className="hover:text-[#E2E8F0] transition-colors">Administración</Link>
          <span className="text-[#334155]">/</span>
          <span className="text-[#E2E8F0] font-medium">{sectionLabel}</span>
        </>
      );
    }
    return (
      <>
        <Link to="/" className="hover:text-[#E2E8F0] transition-colors">Inicio</Link>
        <span className="text-[#334155]">/</span>
        <span className="text-[#E2E8F0] font-medium">Cotizaciones</span>
      </>
    );
  };

  return (
    <header className="h-16 bg-[#0F1115] border-b border-[#334155] flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4 min-w-0">
        {config?.logo_url ? (
          <img
            src={config.logo_url}
            alt={config.razon_social || 'Logo Empresa'}
            className="h-8 w-auto object-contain shrink-0"
          />
        ) : null}

        <div className="flex items-center gap-2 text-sm text-[#94A3B8] min-w-0 overflow-x-auto whitespace-nowrap">
        {getBreadcrumbs()}
        </div>
      </div>
      
      <button className="relative p-2 text-[#94A3B8] hover:text-[#E2E8F0] transition-colors rounded-full hover:bg-[#334155]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0F1115]">
        <iconify-icon icon="solar:bell-linear" stroke-width="1.5" class="text-xl"></iconify-icon>
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#3B82F6] rounded-full ring-2 ring-[#0F1115]"></span>
      </button>
    </header>
  );
}
