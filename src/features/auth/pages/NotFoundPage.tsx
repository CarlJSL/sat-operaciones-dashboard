import { FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100">
        <FileQuestion className="h-10 w-10 text-zinc-400" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-7xl font-bold tracking-tight text-zinc-900">404</h1>
        <p className="max-w-sm text-zinc-500">
          La página que buscas no existe o fue movida.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => navigate(-1)}>
          Ir al inicio
        </Button>
      </div>
    </div>
  );
}
