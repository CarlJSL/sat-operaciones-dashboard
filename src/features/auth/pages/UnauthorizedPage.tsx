import { ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/**
 * Página mostrada cuando el usuario está autenticado pero
 * no tiene el rol requerido para acceder a una ruta protegida.
 * ProtectedRoute redirige aquí cuando allowedRoles no incluye el rol del usuario.
 */
export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <ShieldOff className="h-10 w-10 text-red-500" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          Acceso denegado
        </h1>
        <p className="max-w-sm text-zinc-500">
          No tienes permisos para acceder a esta sección. Contacta al
          administrador si crees que es un error.
        </p>
      </div>

      <Button onClick={() => navigate('/', { replace: true })}>
        Volver al inicio
      </Button>
    </div>
  );
}
