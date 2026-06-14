import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';

const PageInicial = lazy(() => import('../features/auth/pages/PageInicial'));
const NotificameRegistroPage = lazy(() => import('../features/auth/pages/NotificameRegistroPage'));
const NotificameConfirmacionPage = lazy(() => import('../features/auth/pages/NotificameConfirmacionPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const UsuarioListaPage = lazy(() => import('../features/usuario/pages/usuario-lista'));

const CatalogoListaPage = lazy(() => import('../features/catalogo/pages/catalogo-lista'));
const CatalogoSubItemListaPage = lazy(() => import('../features/catalogo/pages/catalogo-lista-subItem'));

const RolListaPage = lazy(() => import('../features/rol/pages/rol-lista'));

/**
 * Consulta en Línea
 */
const ConsultaEnLineaOptionsPage = lazy(() => import('../features/consulta-en-linea/pages/ConsultaEnLineaOptionsPage'));
const ConsultaPapeletaPage = lazy(() => import('../features/consulta-en-linea/pages/ConsultaPapeletaPage'));

/**
 * Vistas Core
 */

const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPasswordPage'));
const VerifyCodePage      = lazy(() => import('../features/auth/pages/VerifyCodePage'));
const ResetPasswordPage   = lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const UnauthorizedPage    = lazy(() => import('../features/auth/pages/UnauthorizedPage'));
const NotFoundPage        = lazy(() => import('../features/auth/pages/NotFoundPage'));


const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-zinc-50">
    <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin" />
  </div>
);

export function AppRouter() {
  return (
    <HashRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/inicio" element={<PageInicial />} />
          <Route path="/notificame/registro" element={<NotificameRegistroPage />} />
          <Route path="/notificame/confirmacion" element={<NotificameConfirmacionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-code" element={<VerifyCodePage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Consulta en Línea */}
          <Route path="/consulta-en-linea" element={<ConsultaEnLineaOptionsPage />} />
          <Route path="/consulta-en-linea/papeletas" element={<ConsultaPapeletaPage />} />
          <Route path="/consulta-en-linea/papeletas/:numeroDePapeleta" element={<ConsultaPapeletaPage />} />

          {/*
           * Rutas protegidas — patrón de nested routes (react-router v7):
           *   1. ProtectedRoute verifica la autenticación (renderiza <Outlet /> si pasa).
           *   2. DashboardLayout provee el shell visual (Sidebar + Header + <Outlet />).
           *   3. Las páginas internas sólo contienen su propia lógica, sin layout.
           */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/usuarios" replace />} />
              <Route path="/usuario-lista" element={<UsuarioListaPage />} />
              <Route path="/usuarios" element={<UsuarioListaPage />} />
              <Route path="/catalogo" element={<CatalogoListaPage />} />
              <Route path="/catalogo/:catalogoId/subitems" element={<CatalogoSubItemListaPage />} />
              <Route path="/roles" element={<RolListaPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
