import { Search, Printer, Edit2, ExternalLink, CheckCircle2, Clock, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/core/lib/utils";

export default function ConsultaPapeletaPage() {
  const tabs = [
    { label: "Consulta de papeletas", active: true },
    { label: "Registra y paga tu papeleta", active: false },
    { label: "Consulta de papeletas enviadas al MTC", active: false },
    { label: "Consulta de Multas Administrativas", active: false },
  ];

  const papeletaActual = {
    nro: "CP00155801",
    placa: "A1G359",
    falta: "G40",
    fecha: "27/12/2025",
    importe: "880.00",
    descuento: "730.40",
    deuda: "149.60",
    estado: "En Proceso",
    etapaActual: 2 // 0 to 6
  };

  const pasosPAS = [
    { id: 0, title: "Inicio", desc: "Ciudadano recibe la papeleta", status: "completed", deadline: "Día 0" },
    { id: 1, title: "Emisión Informe", desc: "Opinión sobre infracción (IFI)", status: "completed", deadline: "Plazo 5 días" },
    { id: 2, title: "Notificación", desc: "Notificación del informe", status: "current", deadline: "Plazo 5 días" },
    { id: 3, title: "Resolución", desc: "Resol. Final de Sanción (RFS)", status: "upcoming", deadline: "Plazo 5 días" },
    { id: 4, title: "Sanción Firme", desc: "Respuesta de apelación", status: "upcoming", deadline: "15 días hábiles" },
  ];

  const pasosPEC = [
    { id: 5, title: "Inicio PEC", desc: "Resol. de Ejecución Coactiva", status: "upcoming", deadline: "Si deuda pendiente" },
    { id: 6, title: "Medidas Cautelares", desc: "Embargo o captura de vehículo", status: "upcoming", deadline: "7 días hábiles" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 p-4 md:p-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/inicio">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/consulta-en-linea">Consulta en Línea</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Seguimiento de Papeleta</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-platform-blue md:text-3xl">
              RUTA DE TU PAPELETA (PIT)
            </h1>
            <p className="text-zinc-500">
              Sigue el estado de tu papeleta de infracción de tránsito paso a paso.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Buscar otra papeleta..." className="w-full md:w-64 bg-white" />
            <Button size="icon" variant="outline" className="shrink-0"><Search className="size-4" /></Button>
          </div>
        </div>

        {/* Info Card Summary */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 uppercase">Nº Papeleta</p>
            <p className="text-lg font-bold text-platform-blue">{papeletaActual.nro}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 uppercase">Placa</p>
            <p className="text-lg font-bold text-platform-blue">{papeletaActual.placa}</p>
          </div>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-zinc-500 uppercase">Importe Original</p>
            <p className="text-lg font-bold text-platform-blue">S/ {papeletaActual.importe}</p>
          </div>
          <div className="rounded-xl border bg-green-50 p-4 shadow-sm border-green-100">
            <p className="text-xs font-medium text-green-700 uppercase font-bold">Total a Pagar hoy</p>
            <p className="text-2xl font-black text-green-600">S/ {papeletaActual.deuda}</p>
            <p className="text-[10px] text-green-700/70 font-medium italic">¡Ahorras S/ {papeletaActual.descuento} por pronto pago!</p>
          </div>
        </div>

        {/* Tracking Flow */}
        <div className="rounded-2xl border bg-white shadow-xl overflow-hidden">
          <div className="bg-platform-blue p-4 text-center">
             <h2 className="text-lg font-bold text-white uppercase tracking-wider">Flujo de Tránsito y Transporte</h2>
          </div>
          
          <div className="p-6 md:p-10">
            {/* Legend */}
            <div className="mb-12 flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-zinc-600">Completado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full bg-platform-blue animate-pulse" />
                <span className="text-sm font-medium text-zinc-600">En Proceso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-4 rounded-full bg-zinc-200" />
                <span className="text-sm font-medium text-zinc-600">Pendiente</span>
              </div>
            </div>

            <div className="relative">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-0 h-1 w-full -translate-y-1/2 bg-zinc-100 hidden md:block" />

              <div className="grid gap-12 md:grid-cols-7 relative">
                {/* PAS Section */}
                {pasosPAS.map((paso, idx) => (
                  <div key={paso.id} className="relative flex flex-col items-center text-center group">
                    {/* Status Circle */}
                    <div className={cn(
                      "z-10 flex size-14 items-center justify-center rounded-full border-4 transition-all duration-300 shadow-lg",
                      paso.status === "completed" ? "bg-green-500 border-green-100 text-white" : 
                      paso.status === "current" ? "bg-platform-blue border-blue-100 text-white scale-110" : 
                      "bg-white border-zinc-100 text-zinc-300"
                    )}>
                      {paso.status === "completed" ? <CheckCircle2 className="size-7" /> : 
                       paso.status === "current" ? <Clock className="size-7 animate-spin-slow" /> : 
                       <span className="text-lg font-bold">{idx + 1}</span>}
                    </div>

                    {/* Content */}
                    <div className="mt-6">
                      <h3 className={cn(
                        "text-sm font-bold uppercase tracking-tight",
                        paso.status === "upcoming" ? "text-zinc-400" : "text-platform-blue"
                      )}>
                        {paso.title}
                      </h3>
                      <p className="mt-1 text-xs leading-tight text-zinc-500 h-8 line-clamp-2">
                        {paso.desc}
                      </p>
                      <div className={cn(
                        "mt-3 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase",
                        paso.status === "completed" ? "bg-green-100 text-green-700" : 
                        paso.status === "current" ? "bg-blue-100 text-blue-700" : 
                        "bg-zinc-100 text-zinc-400"
                      )}>
                        {paso.deadline}
                      </div>
                    </div>

                    {/* Group Labels (PAS) */}
                    {idx === 0 && (
                      <div className="absolute -top-12 left-1/2 w-[400%] -translate-x-1/2 text-center hidden md:block">
                        <span className="text-xs font-black text-green-600 bg-green-50 px-4 py-1 rounded-full border border-green-200 uppercase tracking-[0.2em]">
                          Procedimiento Administrativo Sancionador (PAS)
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {/* PEC Section */}
                {pasosPEC.map((paso, idx) => (
                  <div key={paso.id} className="relative flex flex-col items-center text-center">
                    <div className={cn(
                      "z-10 flex size-14 items-center justify-center rounded-full border-4 bg-white border-zinc-100 text-zinc-300 shadow-lg"
                    )}>
                      <span className="text-lg font-bold">{pasosPAS.length + idx + 1}</span>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-sm font-bold uppercase tracking-tight text-zinc-400">
                        {paso.title}
                      </h3>
                      <p className="mt-1 text-xs leading-tight text-zinc-500 h-8 line-clamp-2">
                        {paso.desc}
                      </p>
                      <div className="mt-3 inline-block rounded-full bg-zinc-100 px-3 py-1 text-[10px] font-bold uppercase text-zinc-400">
                        {paso.deadline}
                      </div>
                    </div>

                    {/* Group Labels (PEC) */}
                    {idx === 0 && (
                      <div className="absolute -top-12 left-1/2 w-[180%] -translate-x-1/2 text-center hidden md:block">
                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-4 py-1 rounded-full border border-orange-200 uppercase tracking-[0.2em]">
                          Ejecución Coactiva (PEC)
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Current Action / Recommendation */}
            <div className="mt-16 rounded-2xl bg-platform-blue/5 border border-platform-blue/10 p-6">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-platform-blue text-white shadow-lg">
                  <AlertTriangle className="size-8" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-lg font-bold text-platform-blue uppercase">Acción requerida: Notificación pendiente</h4>
                  <p className="text-sm text-zinc-600">
                    Tu papeleta se encuentra en la etapa de <strong>Notificación de Informe</strong>. Tienes hasta el <b>18 de Junio de 2026</b> para presentar un reclamo contra el informe o realizar el pago con descuento.
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button className="bg-platform-blue hover:bg-platform-blue/90 shadow-lg px-8 py-6 h-auto text-base">
                    Pagar con Descuento <ArrowRight className="ml-2 size-5" />
                  </Button>
                  <Button variant="outline" className="border-platform-blue text-platform-blue hover:bg-blue-50">
                    Presentar Reclamo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button variant="ghost" className="text-zinc-500 hover:text-platform-blue">
            <Printer className="mr-2 size-4" /> Imprimir Constancia
          </Button>
          <Button variant="ghost" className="text-zinc-500 hover:text-platform-blue">
             Descargar Expediente Digital
          </Button>
          <a
            href="https://wa.me/51999431111"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
          >
            ¿Necesitas ayuda? Habla con un asesor <ExternalLink className="ml-2 size-4" />
          </a>
        </div>
        
        {/* Footer info */}
        <div className="mt-12 border-t pt-8 space-y-4 text-xs text-zinc-400 text-center max-w-3xl mx-auto">
          <p>
            Esta visualización es una representación informativa del procedimiento sancionador del SAT. Los plazos y etapas pueden variar según la naturaleza de la infracción.
          </p>
          <p>Fecha de consulta: {new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}
