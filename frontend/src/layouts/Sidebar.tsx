import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="flex-shrink-0 flex flex-col hidden md:flex bg-[#181B21] w-[250px] border-[#334155] border-r justify-between h-screen">
      <div>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#334155]">
          <span className="text-xl font-semibold tracking-tight text-[#E2E8F0]">
            COTIZADOR<span className="text-[#3B82F6]">PRO</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-[#3B82F6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#334155]/40'
            }`}
          >
            <iconify-icon icon="solar:document-text-linear" stroke-width="1.5" class="text-lg"></iconify-icon>
            Cotizaciones
          </Link>
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/admin')
                ? 'bg-[#3B82F6] text-white shadow-sm'
                : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#334155]/40'
            }`}
          >
            <iconify-icon icon="solar:settings-linear" stroke-width="1.5" class="text-lg"></iconify-icon>
            Administración
          </Link>
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[#334155]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#334155]/40 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center font-semibold text-xs border border-[#3B82F6]/30">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#E2E8F0] truncate">Admin Usuario</p>
            <p className="text-xs text-[#94A3B8] truncate">admin@empresa.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
