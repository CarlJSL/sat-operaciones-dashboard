import { Link } from "react-router-dom";
import { Bell, CheckCircle2, Mail, ShieldCheck } from "lucide-react";

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

export default function NotificameConfirmacionPage() {
  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-platform-blue p-3 text-platform-blue-foreground sm:p-6">
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/15 bg-[radial-gradient(circle_at_1px_1px,currentColor_1.25px,transparent_0)] bg-size-[26px_26px]" />
      <div className="pointer-events-none absolute inset-0 text-platform-blue-foreground/10 bg-[linear-gradient(135deg,currentColor_1px,transparent_1px),linear-gradient(45deg,currentColor_1px,transparent_1px)] bg-position-[0_0,14px_14px] bg-size-[56px_56px]" />

      <Card className="relative w-full max-w-2xl border-0 bg-card/95 py-6 text-card-foreground shadow-2xl sm:py-8">
        <CardHeader className="items-center gap-5 px-4 text-center sm:px-8">
          <div className="flex w-full justify-center">
            <img
              src={satHeaderLogo}
              alt="SAT"
              className="h-auto w-full max-w-36 object-contain sm:max-w-44"
            />
          </div>
          <div className="flex w-full justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-brand-success/10 text-brand-success">
              <CheckCircle2 className="size-9" aria-hidden="true" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl font-semibold text-platform-blue">
              Registro confirmado
            </CardTitle>
            <CardDescription>
              Tu afiliación a Notifícame fue registrada correctamente.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-8">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-xl border bg-background p-4 text-center">
              <Mail className="mx-auto text-platform-blue" aria-hidden="true" />
              <p className="text-sm font-medium">Correo verificado</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border bg-background p-4 text-center">
              <Bell className="mx-auto text-platform-blue" aria-hidden="true" />
              <p className="text-sm font-medium">Alertas activas</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border bg-background p-4 text-center">
              <ShieldCheck className="mx-auto text-platform-blue" aria-hidden="true" />
              <p className="text-sm font-medium">Datos protegidos</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Notifícame te permite suscribirte a comunicaciones digitales para
            recibir avisos sobre trámites, multas y obligaciones asociadas al SAT
            mediante canales como correo electrónico y WhatsApp.
          </p>
        </CardContent>

        <CardFooter className="flex-col gap-3 px-4 sm:px-8">
          <Button asChild className="w-full bg-platform-blue text-platform-blue-foreground hover:bg-platform-blue/90 sm:w-auto sm:px-12">
            <Link to="/inicio">Finalizar</Link>
          </Button>
          <Button asChild variant="link" className="text-platform-blue">
            <Link to="/notificame/registro">Registrar otro usuario</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
