import { useEffect } from "react";
import { ArrowLeft, MessageCircle, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import satHeaderLogo from "@/assets/logos/logosathd2.png";
import { useVoiceContext } from "@/features/voice/context/voiceContext";

const WHATSAPP_URL = 'https://wa.me/51999431111';

export default function ConsultaEnLineaOptionsPage() {
  const navigate = useNavigate();
  const { registerCommand } = useVoiceContext();

  // Register options page voice commands
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    // "papeletas" / "consultar por DNI" / "ver mis papeletas" → navigate to papeletas
    cleanups.push(registerCommand({
      patterns: ['papeletas', 'consultar por dni', 'ver mis papeletas'],
      action: () => navigate('/consulta-en-linea/papeletas'),
      scope: 'consulta-opciones',
    }));

    // "chatbot" / "whatsapp" / "hablar con asesor" → open WhatsApp link
    cleanups.push(registerCommand({
      patterns: ['chatbot', 'whatsapp', 'hablar con asesor'],
      action: () => window.open(WHATSAPP_URL, '_blank', 'noopener,noreferrer'),
      scope: 'consulta-opciones',
    }));

    // "volver" / "inicio" → navigate to home (already a global command, but this is page-specific)
    cleanups.push(registerCommand({
      patterns: ['volver al inicio'],
      action: () => navigate('/inicio'),
      scope: 'consulta-opciones',
    }));

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [navigate, registerCommand]);

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-platform-blue p-3 text-platform-blue-foreground sm:p-6">
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/15 bg-[radial-gradient(circle_at_1px_1px,currentColor_1.25px,transparent_0)] bg-size-[26px_26px]" />
      
      <div className="z-10 w-full max-w-4xl mb-4 flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList className="text-white/80">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/inicio" className="hover:text-white transition-colors">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-white/60" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white font-semibold">Consulta en Línea</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Button 
          variant="ghost" 
          onClick={() => navigate("/inicio")}
          className="text-white hover:bg-white/10 hover:text-white gap-2"
        >
          <ArrowLeft className="size-4" />
          Volver
        </Button>
      </div>

      <Card className="relative w-full max-w-4xl border-0 bg-card/95 py-5 text-card-foreground shadow-2xl sm:py-7 md:px-6 lg:px-8">
        <CardHeader className="items-center gap-5 px-4 text-center sm:gap-6 sm:px-6 md:gap-8">
          <div className="flex w-full justify-center">
            <img
              src={satHeaderLogo}
              alt="SAT"
              className="h-auto w-full max-w-36 object-contain sm:max-w-44 md:max-w-52"
            />
          </div>
          <CardTitle className="text-xl font-bold text-platform-blue md:text-2xl">
            Consulta en Línea
          </CardTitle>
          <CardDescription>
            Seleccione una de las siguientes opciones para continuar
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Link
              to="/consulta-en-linea/papeletas"
              className="group flex flex-col items-center justify-center gap-4 rounded-xl border bg-background p-8 text-center shadow-sm transition hover:border-platform-blue/40 hover:bg-accent focus-visible:ring-2 focus-visible:ring-platform-blue"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-platform-blue/10 text-platform-blue transition group-hover:bg-platform-blue group-hover:text-platform-blue-foreground">
                <Search className="size-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Consulta por número de papeleta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Ingresa tu PIT para ver el estado y ruta de tu infracción
                </p>
              </div>
            </Link>

            <a
              href="https://wa.me/51999431111"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center justify-center gap-4 rounded-xl border bg-background p-8 text-center shadow-sm transition hover:border-green-500/40 hover:bg-green-50/50 focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 transition group-hover:bg-green-600 group-hover:text-white">
                <MessageCircle className="size-8" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Chatbot SAT
                </h2>
                <p className="text-sm text-muted-foreground">
                  Atención personalizada vía WhatsApp +51 999 431 111
                </p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
