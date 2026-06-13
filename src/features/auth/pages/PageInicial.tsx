import { Bell, Check, FileText, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import satHeaderLogo from "@/assets/logos/logosathd2.png";

export default function PageInicial() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-platform-blue p-3 text-platform-blue-foreground sm:p-6">
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/15 bg-[radial-gradient(circle_at_1px_1px,currentColor_1.25px,transparent_0)] bg-size-[26px_26px]" />
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/10 bg-[linear-gradient(135deg,currentColor_1px,transparent_1px),linear-gradient(45deg,currentColor_1px,transparent_1px)] bg-position-[0_0,14px_14px] bg-size-[56px_56px]" />

      <Card className="relative w-full max-w-5xl border-0 bg-card/95 py-5 text-card-foreground shadow-2xl sm:py-7 md:px-6 lg:px-8">
        <CardHeader className="items-center gap-5 px-4 text-center sm:gap-6 sm:px-6 md:gap-8">
          <div className="flex w-full justify-center">
            <img
              src={satHeaderLogo}
              alt="SAT"
              className="h-auto w-full max-w-36 object-contain sm:max-w-44 md:max-w-52"
            />
          </div>

          <CardTitle className="text-sm font-semibold text-platform-blue sm:text-base md:text-lg">
            Seleccione una plataforma para continuar:
          </CardTitle>
          <CardDescription className="sr-only">
            Elija entre el panel de administración y la plataforma Notifícame.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/consulta-en-linea")}
              className="group flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border bg-background p-4 text-center shadow-sm transition hover:border-platform-blue/40 hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:min-h-40 sm:p-5 md:min-h-48 md:gap-4 md:p-6"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-platform-blue/10 text-platform-blue transition group-hover:bg-platform-blue group-hover:text-platform-blue-foreground sm:size-14 md:size-16">
                <Check className="size-6 sm:size-7 md:size-8" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-foreground sm:text-base">
                  Consulta en Línea 
                </h2>
                <p className="text-left text-sm leading-relaxed text-muted-foreground">
                  Accede a tus consultas en línea
                </p>
              </div>
            </button>

            <button
              type="button"
              className="group relative flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border bg-background p-4 text-center shadow-sm transition hover:border-platform-blue/40 hover:bg-accent focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:min-h-40 sm:p-5 md:min-h-48 md:gap-4 md:p-6"
            >
              <Badge variant="destructive" className="absolute top-3 right-3 sm:top-4 sm:right-4">
                Nuevo
              </Badge>
              <div className="relative flex size-12 items-center justify-center rounded-full bg-platform-blue/10 text-platform-blue transition group-hover:bg-platform-blue group-hover:text-platform-blue-foreground sm:size-14 md:size-16">
                <FileText className="size-7 md:size-9" aria-hidden="true" />
                <ShieldCheck
                  className="absolute -right-1 bottom-0 size-5 rounded-full bg-background text-platform-blue group-hover:bg-platform-blue group-hover:text-platform-blue-foreground md:bottom-1 md:size-6"
                  aria-hidden="true"
                />
                <Bell
                  className="absolute -top-1 -left-1 size-5 rounded-full bg-background text-platform-blue group-hover:bg-platform-blue group-hover:text-platform-blue-foreground md:size-6"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-foreground sm:text-base">Notifícame</h2>
                <p className="text-left text-sm leading-relaxed text-muted-foreground">
                  Recibe notificaciones y alertas sobre tus trámites, multas y
                  obligaciones con el SAT a través de Whatsapp y Correo electrónico.
                </p>
              </div>
            </button>
          </div>
        </CardContent>

        <CardFooter className="justify-center px-4 pt-2 sm:px-6">
          <Button
            type="button"
            size="lg"
            className="w-full bg-platform-blue text-platform-blue-foreground hover:bg-platform-blue/90 sm:w-auto sm:px-12"
          >
            Continuar
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
