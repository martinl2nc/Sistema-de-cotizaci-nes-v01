export default function Header() {
  return (
    <header className="h-16 bg-[#0F1115] border-b border-[#334155] flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <span className="hover:text-[#E2E8F0] cursor-pointer transition-colors">Inicio</span>
        <span className="text-[#334155]">/</span>
        <span className="text-[#E2E8F0] font-medium">Cotizaciones</span>
      </div>
      
      <button className="relative p-2 text-[#94A3B8] hover:text-[#E2E8F0] transition-colors rounded-full hover:bg-[#334155]/40 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0F1115]">
        <iconify-icon icon="solar:bell-linear" stroke-width="1.5" class="text-xl"></iconify-icon>
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#3B82F6] rounded-full ring-2 ring-[#0F1115]"></span>
      </button>
    </header>
  );
}
