import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import MainLayout from '@/layouts/MainLayout';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';

// Lazy loading following Vite best practices
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage'));
const QuotesList = lazy(() => import('@/pages/quotes/QuotesList'));
const QuoteForm = lazy(() => import('@/pages/quotes/QuoteForm'));
const ClientsPage = lazy(() => import('@/pages/admin/ClientsPage'));
const CompanyConfigPage = lazy(() => import('@/pages/admin/CompanyConfigPage'));
const ProductsPage = lazy(() => import('@/pages/admin/ProductsPage'));
const SellersPage = lazy(() => import('@/pages/admin/SellersPage'));
const ComingSoonPage = lazy(() => import('@/pages/admin/ComingSoonPage'));
const LoginPage = lazy(() => import('@/pages/auth/Login'));

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" theme="dark" duration={5000} richColors />
      <Router>
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#0F1115] text-[#E2E8F0]">Cargando...</div>}>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Layout Wraps Everything Inside y Protege que el usuario esté logueado */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="cotizaciones" element={<QuotesList />} />
                <Route path="cotizaciones/nueva" element={<QuoteForm />} />
                <Route path="cotizaciones/editar/:id" element={<QuoteForm />} />

                {/* Administration Routes restricted to admin role */}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  <Route path="admin" element={<Navigate to="/admin/clientes" replace />} />
                  <Route path="admin/clientes" element={<ClientsPage />} />
                  <Route path="admin/empresa" element={<CompanyConfigPage />} />
                  <Route path="admin/productos" element={<ProductsPage />} />
                  <Route path="admin/vendedores" element={<SellersPage />} />
                </Route>
                
                {/* Catch all to redirect home for now */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
