import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  fetchDropdownData,
  saveQuote,
  fetchQuoteById,
  deleteQuote
} from '@/services/quotesFormService';
import type {
  ClientOption,
  SellerOption,
  ProductOption,
  QuoteFormData,
  QuoteFormLineItem
} from '@/services/quotesFormService';

export default function QuoteForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dropdown lists
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [sellers, setSellers] = useState<SellerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);

  // Quote Header State
  const [quoteData, setQuoteData] = useState<QuoteFormData>({
    cliente_id: '',
    vendedor_id: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    fecha_validez: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    aplica_igv: true,
    descuento_global_monto: 0,
    observaciones_pdf: '',
    subtotal: 0,
    igv_monto: 0,
    total_final: 0,
    estado: 'Por Revisar'
  });

  // Line Items State
  const [lineItems, setLineItems] = useState<QuoteFormLineItem[]>([]);

  useEffect(() => {
    loadInitialData();
  }, [id]);

  useEffect(() => {
    calculateTotals();
  }, [lineItems, quoteData.aplica_igv, quoteData.descuento_global_monto]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dropdowns = await fetchDropdownData();
      setClients(dropdowns.clients);
      setSellers(dropdowns.sellers);
      setProducts(dropdowns.products);

      if (isEditing && id) {
        const { quote, lineItems: lines } = await fetchQuoteById(id);
        setQuoteData({
          id: quote.id,
          cliente_id: quote.cliente_id,
          vendedor_id: quote.vendedor_id || '',
          fecha_emision: quote.fecha_emision,
          fecha_validez: quote.fecha_validez,
          aplica_igv: quote.aplica_igv,
          descuento_global_monto: quote.descuento_global_monto,
          observaciones_pdf: quote.observaciones_pdf || '',
          subtotal: quote.subtotal,
          igv_monto: quote.igv_monto,
          total_final: quote.total_final,
          estado: quote.estado
        });
        setLineItems(lines.map((l: any) => ({
          producto_id: l.producto_id,
          nombre_producto_historico: l.nombre_producto_historico,
          cantidad: l.cantidad,
          precio_unitario: l.precio_unitario,
          descuento_linea_monto: l.descuento_linea_monto,
          subtotal_linea: l.subtotal_linea
        })));
      } else {
        // Initial empty line
        addLineItem();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const currentDisplayId = isEditing ? 'Editando Cotización' : 'Nueva Cotización';

  // Calculations
  const calculateTotals = () => {
    let newSubtotal = 0;

    // Recalculate each line and sum subtotal
    lineItems.forEach(item => {
      const lineSubtotal = (item.cantidad * item.precio_unitario) - item.descuento_linea_monto;
      newSubtotal += lineSubtotal;
    });

    const descuentoGlobal = Number(quoteData.descuento_global_monto) || 0;
    const baseParaIgv = Math.max(0, newSubtotal - descuentoGlobal);
    const newIgv = quoteData.aplica_igv ? baseParaIgv * 0.18 : 0;
    const newTotal = baseParaIgv + newIgv;

    // Only update if something changed to avoid absolute infinite loops, but React batches well
    setQuoteData(prev => ({
      ...prev,
      subtotal: newSubtotal,
      igv_monto: newIgv,
      total_final: newTotal
    }));
  };

  // Event Handlers
  const handleQuoteChange = (field: keyof QuoteFormData, value: any) => {
    setQuoteData(prev => ({ ...prev, [field]: value }));
  };

  const addLineItem = () => {
    setLineItems([...lineItems, {
      producto_id: null,
      nombre_producto_historico: '',
      cantidad: 1,
      precio_unitario: 0,
      descuento_linea_monto: 0,
      subtotal_linea: 0
    }]);
  };

  const removeLineItem = (index: number) => {
    const newLines = [...lineItems];
    newLines.splice(index, 1);
    setLineItems(newLines);
  };

  const updateLineItem = (index: number, field: keyof QuoteFormLineItem, value: any) => {
    const newLines = [...lineItems];
    const item = { ...newLines[index], [field]: value };

    if (field === 'producto_id' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        item.nombre_producto_historico = selectedProduct.nombre;
        item.precio_unitario = selectedProduct.precio_base || 0;
      }
    }

    item.subtotal_linea = (item.cantidad * item.precio_unitario) - item.descuento_linea_monto;
    newLines[index] = item;
    setLineItems(newLines);
  };

  const handleSave = async (status: string) => {
    if (!quoteData.cliente_id) {
      setError('Por favor selecciona un cliente.');
      return;
    }

    // Validate lines
    const invalidLines = lineItems.some(l => l.nombre_producto_historico.trim() === '' || l.cantidad <= 0 || l.precio_unitario < 0);
    if (invalidLines) {
      setError('Asegúrate de que todas las líneas tengan nombre de producto y cantidades válidas.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const finalQuoteData = { ...quoteData, estado: status };
      await saveQuote(finalQuoteData, lineItems);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    const confirmed = window.confirm('¿Estás seguro de que deseas eliminar esta cotización? Esta acción no se puede deshacer y eliminará también todos sus ítems.');
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteQuote(id);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError('Error al eliminar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getClientDisplayName = (client: ClientOption) => {
    if (client.razon_social && client.razon_social.trim() !== '') {
      return `${client.razon_social} (Doc: ${client.numero_documento || 'N/A'})`;
    }
    return `${client.nombres_contacto || ''} ${client.apellidos_contacto || ''}`.trim() || 'Sin Nombre';
  };

  const formatCurrency = (val: number) => 'S/ ' + val.toFixed(2);

  if (loading) {
    return <div className="p-6 text-[#94A3B8]">Cargando cotización...</div>;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0F1115]">
      {/* Top Header */}
      <header className="flex shrink-0 bg-[#0F1115] h-16 border-[#334155] border-b px-6 items-center justify-between z-10 relative">
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <span className="hover:text-[#E2E8F0] cursor-pointer" onClick={() => navigate('/')}>Inicio</span>
          <span className="text-[#334155]">/</span>
          <span className="hover:text-[#E2E8F0] cursor-pointer" onClick={() => navigate('/')}>Cotizaciones</span>
          <span className="text-[#334155]">/</span>
          <span className="text-[#E2E8F0] font-medium">{currentDisplayId}</span>
        </div>
        <button className="relative p-2 text-[#94A3B8] hover:text-[#E2E8F0] rounded-full hover:bg-[#334155]/40 transition-colors">
          <iconify-icon icon="solar:bell-linear" stroke-width="1.5" class="text-xl"></iconify-icon>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {error && (
          <div className="bg-[#EF4444]/10 border border-[#EF4444]/50 rounded-lg p-4 text-[#EF4444] text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#E2E8F0]">{currentDisplayId}</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
            {quoteData.estado}
          </span>
        </div>

        {/* Master Data */}
        <div className="bg-[#181B21] border border-[#334155] rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-[#94A3B8]">Cliente</label>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#3B82F6] hover:text-[#60A5FA] px-2 py-0.5 rounded hover:bg-[#3B82F6]/10 transition-colors focus:outline-none flex items-center gap-1"
                  >
                    <iconify-icon icon="solar:add-circle-linear" class="text-sm"></iconify-icon>
                    Nuevo
                  </button>
                </div>
                <select
                  className="w-full bg-[#0F1115] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] px-3 py-2.5 focus:outline-none focus:border-[#3B82F6]"
                  value={quoteData.cliente_id}
                  onChange={(e) => handleQuoteChange('cliente_id', e.target.value)}
                >
                  <option value="">Seleccionar Cliente</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{getClientDisplayName(c)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Vendedor</label>
                <select
                  className="w-full bg-[#0F1115] border border-[#334155] rounded-lg text-sm text-[#E2E8F0] px-3 py-2.5 focus:outline-none focus:border-[#3B82F6]"
                  value={quoteData.vendedor_id}
                  onChange={(e) => handleQuoteChange('vendedor_id', e.target.value)}
                >
                  <option value="">Seleccionar Vendedor</option>
                  {sellers.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-medium text-[#E2E8F0]">Aplicar IGV (18%)</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={quoteData.aplica_igv} onChange={(e) => handleQuoteChange('aplica_igv', e.target.checked)} />
                  <div className="w-11 h-6 bg-[#334155] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Descuento Global (S/)</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[#94A3B8] sm:text-sm font-medium">S/</span>
                  </div>
                  <input
                    type="number"
                    value={quoteData.descuento_global_monto}
                    onChange={(e) => handleQuoteChange('descuento_global_monto', parseFloat(e.target.value) || 0)}
                    className="block w-full bg-[#0F1115] border border-[#334155] rounded-lg pl-8 pr-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#94A3B8] mb-1.5">Observaciones</label>
                <textarea
                  rows={3}
                  value={quoteData.observaciones_pdf}
                  onChange={(e) => handleQuoteChange('observaciones_pdf', e.target.value)}
                  placeholder="Notas internas..."
                  className="block w-full bg-[#0F1115] border border-[#334155] rounded-lg px-3 py-2.5 text-sm text-[#E2E8F0] focus:outline-none focus:border-[#3B82F6] resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="bg-[#181B21] border border-[#334155] rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#0F1115] border-b border-[#334155]">
                  <th className="py-3 px-4 text-xs font-medium text-[#94A3B8] uppercase w-[220px]">Catálogo</th>
                  <th className="py-3 px-4 text-xs font-medium text-[#94A3B8] uppercase min-w-[250px]">Producto</th>
                  <th className="py-3 px-4 text-xs font-medium text-[#94A3B8] uppercase w-[100px]">Cant.</th>
                  <th className="py-3 px-4 text-xs font-medium text-[#94A3B8] uppercase w-[140px]">Precio U.</th>
                  <th className="py-3 px-4 text-xs font-medium text-[#94A3B8] uppercase w-[130px]">Desc. Línea</th>
                  <th className="py-3 px-4 text-xs font-medium text-[#94A3B8] uppercase w-[120px] text-right">Subtotal</th>
                  <th className="py-3 px-4 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#334155]">
                {lineItems.map((item, index) => (
                  <tr key={index} className="hover:bg-[#334155]/10">
                    <td className="py-3 px-4">
                      <select
                        value={item.producto_id || ''}
                        onChange={(e) => updateLineItem(index, 'producto_id', e.target.value || null)}
                        className="w-full bg-[#0F1115] border border-[#334155] rounded text-sm text-[#E2E8F0] px-2 py-1.5 focus:border-[#3B82F6] focus:outline-none"
                      >
                        <option value="">Personalizado...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.nombre}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={item.nombre_producto_historico}
                        onChange={(e) => updateLineItem(index, 'nombre_producto_historico', e.target.value)}
                        placeholder="Nombre del producto"
                        className="w-full bg-[#0F1115] border border-[#334155] rounded px-2 py-1.5 text-sm text-[#E2E8F0] focus:border-[#3B82F6] focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => updateLineItem(index, 'cantidad', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0F1115] border border-[#334155] rounded px-2 py-1.5 text-sm text-[#E2E8F0] text-center focus:border-[#3B82F6] focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={item.precio_unitario}
                        onChange={(e) => updateLineItem(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0F1115] border border-[#334155] rounded px-2 py-1.5 text-sm text-[#E2E8F0] text-right focus:border-[#3B82F6] focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        value={item.descuento_linea_monto}
                        onChange={(e) => updateLineItem(index, 'descuento_linea_monto', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#0F1115] border border-[#334155] rounded px-2 py-1.5 text-sm text-[#E2E8F0] text-right focus:border-[#3B82F6] focus:outline-none"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm font-medium text-[#94A3B8] text-right pt-1.5">{formatCurrency(item.subtotal_linea)}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => removeLineItem(index)} className="text-[#EF4444]/80 hover:text-[#EF4444] p-1.5 rounded hover:bg-[#EF4444]/10">
                        <iconify-icon icon="solar:trash-bin-trash-linear" class="text-lg block"></iconify-icon>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-[#334155] bg-[#181B21]">
            <button onClick={addLineItem} className="flex items-center gap-2 text-sm font-medium text-[#3B82F6] hover:bg-[#3B82F6]/10 px-3 py-1.5 rounded transition-colors">
              <iconify-icon icon="solar:add-circle-linear" class="text-lg"></iconify-icon> Añadir Fila
            </button>
          </div>
        </div>

        <div className="h-28"></div>
      </main>

      {/* Footer Totals & Actions */}
      <footer className="shrink-0 bg-[#181B21] border-t border-[#334155] p-6 shadow-xl z-20">
        <div className="flex flex-col items-end w-full">
          <div className="w-full sm:w-80 space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm text-[#94A3B8]">
              <span>Subtotal</span>
              <span className="font-medium text-[#E2E8F0]">{formatCurrency(quoteData.subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-[#94A3B8]">
              <span>Descuento Global</span>
              <span className="font-medium text-[#EF4444]">- {formatCurrency(quoteData.descuento_global_monto)}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-[#94A3B8]">
              <span>IGV (18%)</span>
              <span className="font-medium text-[#E2E8F0]">{formatCurrency(quoteData.igv_monto)}</span>
            </div>
            <div className="h-px bg-[#334155] w-full my-3"></div>
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-[#94A3B8] pb-1.5">Total Final</span>
              <span className="text-3xl font-medium tracking-tight text-[#E2E8F0]">{formatCurrency(quoteData.total_final)}</span>
            </div>
          </div>

          <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3 justify-end items-center">
            {isEditing && (
              <button 
                onClick={handleDelete}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 text-sm font-medium disabled:opacity-50 transition-colors mr-auto sm:mr-0"
              >
                Eliminar Cotización
              </button>
            )}
            <button
              onClick={() => handleSave('Borrador')}
              disabled={saving}
              className="px-5 py-2.5 rounded-lg border border-[#334155] bg-[#181B21] text-[#E2E8F0] hover:bg-[#334155]/40 text-sm font-medium disabled:opacity-50"
            >
              Guardar Borrador
            </button>
            <button
              onClick={() => handleSave('Por Revisar')}
              disabled={saving}
              className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Generar PDF'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
