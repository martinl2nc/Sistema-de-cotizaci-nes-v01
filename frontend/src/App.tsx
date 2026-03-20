import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';

// Lazy loading following Vite best practices
const QuotesList = lazy(() => import('@/pages/quotes/QuotesList'));
const QuoteForm = lazy(() => import('@/pages/quotes/QuoteForm'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#0F1115] text-[#E2E8F0]">Cargando...</div>}>
        <Routes>
          {/* Default layout wraps everything inside */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<QuotesList />} />
            <Route path="cotizaciones/nueva" element={<QuoteForm />} />
            <Route path="cotizaciones/editar/:id" element={<QuoteForm />} />
            
            {/* Catch all to redirect home for now */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
