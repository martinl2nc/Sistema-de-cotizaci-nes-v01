import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getQuotesList, updateQuoteStatus, deleteQuote, getSellers } from '@/services/quotesService';
import type { QuoteListItem } from '@/services/quotesService';

export default function QuotesList() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState<QuoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sellers, setSellers] = useState<{id: string, nombre: string}[]>([]);

  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);
        const [quotesData, sellersData] = await Promise.all([
          getQuotesList(),
          getSellers()
        ]);
        setQuotes(quotesData || []);
        setSellers(sellersData || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    initData();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      const data = await getQuotesList();
      setQuotes(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Optimistic update
      setQuotes((prev: QuoteListItem[]) => prev.map(q => q.id === id ? { ...q, estado: newStatus as any } : q));
      await updateQuoteStatus(id, newStatus);
    } catch (err: any) {
      setError('Error al actualizar estado: ' + err.message);
      loadQuotes(); // Rollback
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta cotización?');
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteQuote(id);
      setQuotes((prev: QuoteListItem[]) => prev.filter(q => q.id !== id));
    } catch (err: any) {
      setError('Error al eliminar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const [saving, setSaving] = useState(false);

  // Normalizar cadena para búsqueda (quitar acentos y pasar a minúsculas)
  const normalizeAccent = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Filtering Logic
  const filteredQuotes = useMemo(() => {
    try {
      if (!quotes) return [];
      const search = normalizeAccent(searchTerm.trim());

      return quotes.filter(quote => {
        // 1. Search Logic
        let matchSearch = true;
        if (search !== '') {
          // Obtener datos del cliente de forma segura (objeto o primer elemento de array)
          const cliente = Array.isArray(quote.cliente) ? quote.cliente[0] : quote.cliente;
          
          const searchableFields = [
            String(quote.numero_correlativo || ''),
            String(cliente?.razon_social || ''),
            String(cliente?.numero_documento || ''),
            String(cliente?.nombres_contacto || ''),
            String(cliente?.apellidos_contacto || '')
          ];

          matchSearch = searchableFields.some(field => 
            normalizeAccent(field).includes(search)
          );
        }

        // 2. Seller filter
        const sellerName = Array.isArray(quote.vendedor) ? quote.vendedor[0]?.nombre : quote.vendedor?.nombre;
        const matchSeller = selectedSeller === '' || sellerName === selectedSeller;

        // 3. Status filter
        const matchStatus = selectedStatus === '' || quote.estado === selectedStatus;

        return matchSearch && matchSeller && matchStatus;
      });
    } catch (err) {
      console.error('Error in filteredQuotes:', err);
      return [];
    }
  }, [quotes, searchTerm, selectedSeller, selectedStatus]);

  // Helpers para formateo
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount || 0);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getClientName = (clienteData: any) => {
    if (!clienteData) return 'Desconocido';
    const cliente = Array.isArray(clienteData) ? clienteData[0] : clienteData;
    if (!cliente) return 'Desconocido';

    if (cliente.razon_social && cliente.razon_social.trim() !== '') {
      return `${cliente.razon_social} (Doc: ${cliente.numero_documento || 'N/A'})`;
    }
    const fullName = `${cliente.nombres_contacto || ''} ${cliente.apellidos_contacto || ''}`.trim();
    if (fullName) return `${fullName} (Doc: ${cliente.numero_documento || 'N/A'})`;
    
    return 'Sin Nombre';
  };

  const getSellerName = (vendedor: any) => {
    if (!vendedor) return 'No asignado';
    return vendedor.nombre || 'Desconocido';
  };

  return (
    <div className="max-w-7xl w-full mx-auto flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-[#E2E8F0]">
          Gestor de Cotizaciones
        </h1>
        <button
          onClick={() => navigate('/cotizaciones/nueva')}
          className="hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-[#0F1115] flex gap-2 text-sm font-medium text-white bg-[#3B82F6] rounded-md pt-2 pr-4 pb-2 pl-4 shadow-sm items-center justify-center cursor-pointer"
        >
          <iconify-icon icon="solar:add-circle-linear" stroke-width="1.5" class="text-lg"></iconify-icon>
          Crear Cotización
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#181B21] border border-[#334155] rounded-lg p-4 mb-6 shadow-sm flex flex-col lg:flex-row gap-4">
        {/* Dropdowns */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative group">
            <select
              title="Filtrar por vendedor"
              value={selectedSeller}
              onChange={(e) => setSelectedSeller(e.target.value)}
              className="appearance-none w-full sm:w-44 bg-[#0F1115] border border-[#334155] rounded-md py-2 pl-3 pr-10 text-sm text-[#E2E8F0] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors cursor-pointer"
            >
              <option value="">Por Vendedor</option>
              {sellers.map(s => (
                <option key={s.id} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8] group-hover:text-[#E2E8F0] transition-colors">
              <iconify-icon icon="solar:alt-arrow-down-linear" stroke-width="1.5" class="text-lg"></iconify-icon>
            </div>
          </div>

          <div className="relative group">
            <select
              title="Filtrar por estado"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="appearance-none w-full sm:w-44 bg-[#0F1115] border border-[#334155] rounded-md py-2 pl-3 pr-10 text-sm text-[#E2E8F0] shadow-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors cursor-pointer"
            >
              <option value="">Por Estado</option>
              <option value="Borrador">Borrador</option>
              <option value="Por Revisar">Por Revisar</option>
              <option value="Aprobada">Aprobada</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#94A3B8] group-hover:text-[#E2E8F0] transition-colors">
              <iconify-icon icon="solar:alt-arrow-down-linear" stroke-width="1.5" class="text-lg"></iconify-icon>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#94A3B8]">
            <iconify-icon icon="solar:magnifer-linear" stroke-width="1.5" class="text-lg"></iconify-icon>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por RUC o Nombre..."
            className="w-full bg-[#0F1115] border border-[#334155] rounded-md py-2 pl-10 pr-4 text-sm text-[#E2E8F0] placeholder-[#94A3B8]/60 shadow-sm focus:outline-none focus:ring-1 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
          />
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-[#181B21] border border-[#334155] rounded-lg overflow-hidden flex flex-col shadow-sm mb-6 flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0F1115]">
                <th className="px-5 py-3 text-xs font-medium tracking-wider text-[#94A3B8] uppercase w-[100px]">ID</th>
                <th className="px-5 py-3 text-xs font-medium tracking-wider text-[#94A3B8] uppercase w-[120px]">Fecha</th>
                <th className="px-5 py-3 text-xs font-medium tracking-wider text-[#94A3B8] uppercase">Cliente</th>
                <th className="px-5 py-3 text-xs font-medium tracking-wider text-[#94A3B8] uppercase w-[160px]">Vendedor</th>
                <th className="px-5 py-3 text-xs font-medium tracking-wider text-[#94A3B8] uppercase w-[120px] text-right">Total</th>
                <th className="px-5 py-3 text-xs font-medium tracking-wider text-[#94A3B8] uppercase w-[140px]">Estado</th>
                <th className="px-5 py-3 text-xs font-medium tracking-wider text-[#94A3B8] uppercase w-[200px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155] bg-[#181B21]">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#94A3B8] text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <iconify-icon icon="solar:spinner-linear" class="animate-spin text-xl text-[#3B82F6]"></iconify-icon>
                      Cargando cotizaciones...
                    </div>
                  </td>
                </tr>
              )}
              
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-red-400 text-sm">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#94A3B8] text-sm">
                    No se encontraron cotizaciones con los filtros aplicados.
                  </td>
                </tr>
              )}

              {!loading && !error && filteredQuotes.map((quote) => (
                <tr key={quote.id} className="group hover:bg-[#334155]/10 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-[#E2E8F0] font-medium">{quote.numero_correlativo}</td>
                  <td className="px-5 py-3.5 text-sm text-[#94A3B8]">{formatDate(quote.fecha_emision)}</td>
                  <td className="px-5 py-3.5 text-sm text-[#E2E8F0]">{getClientName(quote.cliente)}</td>
                  <td className="px-5 py-3.5 text-sm text-[#94A3B8]">{getSellerName(quote.vendedor)}</td>
                  <td className="px-5 py-3.5 text-sm text-[#E2E8F0] font-medium text-right">{formatCurrency(quote.total_final)}</td>
                  <td className="px-5 py-3.5 text-sm uppercase">
                    <select 
                      value={quote.estado}
                      onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-full border-none cursor-pointer focus:ring-1 focus:ring-blue-500 transition-colors
                        ${quote.estado === 'Aprobada' ? 'bg-[#10B981]/10 text-[#10B981]' : 
                          quote.estado === 'Por Revisar' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 
                          'bg-[#94A3B8]/10 text-[#94A3B8]'}`}
                    >
                      <option value="Borrador" className="bg-[#181B21]">Borrador</option>
                      <option value="Por Revisar" className="bg-[#181B21]">Por Revisar</option>
                      <option value="Aprobada" className="bg-[#181B21]">Aprobada</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/cotizaciones/editar/${quote.id}`)}
                      className="border border-[#334155] text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-[#334155]/50 transition-colors whitespace-nowrap"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(quote.id)}
                      disabled={saving}
                      className="border border-red-500/50 text-red-500 text-xs font-medium px-2 py-1.5 rounded-md hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <iconify-icon icon="solar:trash-bin-trash-linear" class="text-lg"></iconify-icon>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
