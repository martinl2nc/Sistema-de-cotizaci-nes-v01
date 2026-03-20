import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { id: 'productos', label: 'Productos y Categorías', path: '/admin/productos' },
  { id: 'empresa', label: 'Configuración de Empresa', path: '/admin/empresa' },
  { id: 'clientes', label: 'Clientes y Vendedores', path: '/admin/clientes' },
];

export default function AdminTabs() {
  const location = useLocation();

  return (
    <div className="border-b border-[#334155]">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-[#3B82F6] text-[#E2E8F0]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#E2E8F0] hover:border-[#334155]'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
