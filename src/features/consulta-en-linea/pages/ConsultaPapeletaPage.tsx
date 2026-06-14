import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Printer, ExternalLink, CheckCircle2, Clock, AlertTriangle, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/core/lib/utils";
import { toast } from "sonner";
import { useVoiceContext } from "@/features/voice/context/voiceContext";
import { useSpeechSynthesis } from "@/features/voice/hooks/useSpeechSynthesis";
import { normalize } from "@/features/voice/services/commandMatcher";

export default function ConsultaPapeletaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { registerCommand } = useVoiceContext();
  const { speak } = useSpeechSynthesis();

  // Refs for voice-activated buttons (results state)
  const payButtonRef = useRef<HTMLButtonElement>(null);
  const reclamoButtonRef = useRef<HTMLButtonElement>(null);
  const imprimirButtonRef = useRef<HTMLButtonElement>(null);
  const descargarButtonRef = useRef<HTMLButtonElement>(null);
  const whatsappLinkRef = useRef<HTMLAnchorElement>(null);

  // Mock initial data
  const [papeletaActual, setPapeletaActual] = useState({
    nro: "CP00155801",
    placa: "A1G359",
    falta: "G40",
    fecha: "27/12/2025",
    importe: "880.00",
    descuento: "730.40",
    deuda: "149.60",
    estado: "En Proceso",
    etapaActual: 2
  });

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

  /** Shared search logic — can be called from form submit or voice command. */
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Simulate finding the data (or not)
    if (query.toLowerCase().includes("a1g") || query.includes("155") || query.length > 5) {
      setPapeletaActual({
        nro: query.toUpperCase().startsWith("CP") ? query.toUpperCase() : "CP" + Math.floor(Math.random() * 900000 + 100000),
        placa: "A1G359",
        falta: "G40",
        fecha: "27/12/2025",
        importe: "880.00",
        descuento: "730.40",
        deuda: "149.60",
        estado: "En Proceso",
        etapaActual: 2
      });
      setHasSearched(true);
      toast.success("Información recuperada correctamente");
    } else {
      toast.error("No se encontró la papeleta ingresada");
    }
    setIsLoading(false);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    performSearch(searchQuery);
  };

  const resetSearch = useCallback(() => {
    setHasSearched(false);
    setSearchQuery("");
  }, []);

  // Voice command registration — re-register when search state changes
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    if (!hasSearched) {
      // ── Search state commands ──
      // "buscar {query}", "buscar papeleta {query}", "buscar DNI {query}" → extract query and search
      const searchAction = (transcript?: string) => {
        if (!transcript) return;
        const norm = normalize(transcript);

        // Try longer prefixes first to avoid stripping only "buscar" from "buscar papeleta CP155801"
        const prefixes = [
          'buscar papeleta', 'buscar dni',
          'consultar papeleta', 'consultar dni',
          'buscar', 'consultar',
        ];
        let query = norm;
        for (const prefix of prefixes) {
          if (norm.startsWith(prefix + ' ')) {
            query = norm.slice(prefix.length).trim();
            break;
          }
          if (norm === prefix) {
            // User said just "buscar" with no query — do nothing meaningful
            query = '';
            break;
          }
        }

        if (query) {
          const upperQuery = query.toUpperCase();
          setSearchQuery(upperQuery);
          performSearch(upperQuery);
        }
      };

      cleanups.push(registerCommand({
        patterns: ['buscar', 'buscar papeleta', 'buscar dni', 'consultar', 'consultar papeleta', 'consultar dni'],
        action: searchAction,
        scope: 'consulta-papeleta',
      }));
    } else {
      // ── Results state commands ──

      // Pagar con Descuento
      cleanups.push(registerCommand({
        patterns: ['pagar', 'pagar papeleta', 'pagar multa', 'cancelar', 'abonar'],
        action: () => payButtonRef.current?.click(),
        scope: 'consulta-papeleta',
      }));

      // Presentar Reclamo
      cleanups.push(registerCommand({
        patterns: ['reclamo', 'presentar reclamo', 'apelar', 'impugnar'],
        action: () => reclamoButtonRef.current?.click(),
        scope: 'consulta-papeleta',
      }));

      // Imprimir Constancia
      cleanups.push(registerCommand({
        patterns: ['imprimir', 'imprimir constancia'],
        action: () => imprimirButtonRef.current?.click(),
        scope: 'consulta-papeleta',
      }));

      // Descargar Expediente Digital
      cleanups.push(registerCommand({
        patterns: ['descargar', 'descargar expediente', 'bajar expediente'],
        action: () => descargarButtonRef.current?.click(),
        scope: 'consulta-papeleta',
      }));

      // Ayuda / WhatsApp
      cleanups.push(registerCommand({
        patterns: ['hablar con asesor', 'contactar asesor', 'whatsapp'],
        action: () => whatsappLinkRef.current?.click(),
        scope: 'consulta-papeleta',
      }));

      // Nueva búsqueda / reset
      cleanups.push(registerCommand({
        patterns: ['buscar otra', 'nueva búsqueda', 'consultar otra papeleta'],
        action: () => resetSearch(),
        scope: 'consulta-papeleta',
      }));

      // Step tracker voice descriptions
      const stepDescriptions: Record<string, string> = {
        'ver paso 1': 'Paso 1: Inicio — El ciudadano recibe la papeleta de infracción.',
        'ver paso 2': 'Paso 2: Emisión de Informe — Opinión sobre la infracción, IFI.',
        'ver paso 3': 'Paso 3: Notificación — Notificación del informe. Etapa actual.',
        'ver paso 4': 'Paso 4: Resolución — Resolución Final de Sanción.',
        'ver paso 5': 'Paso 5: Sanción Firme — Respuesta de apelación.',
        'etapa inicio': 'Etapa de Inicio — El ciudadano recibe la papeleta.',
        'etapa emisión': 'Etapa de Emisión — Opinión sobre la infracción.',
        'etapa notificación': 'Etapa de Notificación — Notificación del informe. Etapa actual.',
        'etapa resolución': 'Etapa de Resolución — Resolución Final de Sanción.',
        'etapa sanción': 'Etapa de Sanción Firme — Respuesta de apelación.',
      };

      for (const [pattern, description] of Object.entries(stepDescriptions)) {
        const desc = description;
        cleanups.push(registerCommand({
          patterns: [pattern],
          action: () => {
            speak(desc);
          },
          scope: 'consulta-papeleta',
        }));
      }
    }

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [hasSearched, registerCommand, speak, performSearch, resetSearch]);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Search State (Initial) */}
      {!hasSearched && (
        <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-platform-blue p-6 text-white">
          {/* Background Pattern */}
          <div className="pointer-events-none absolute inset-0 text-white/5 bg-[radial-gradient(circle_at_1px_1px,currentColor_1.25px,transparent_0)] bg-size-[32px_32px]" />
          
          <div className="z-10 w-full max-w-2xl space-y-10 text-center">
            <div className="space-y-4">
              <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
                Consulta de Papeletas
              </h1>
              <p className="text-lg font-medium text-blue-100/80">
                Ingresa el número de tu papeleta de infracción (PIT) para conocer su estado y ruta legal paso a paso.
              </p>
            </div>

            <form onSubmit={handleSearch} className="relative group">
              <div className="relative overflow-hidden rounded-3xl bg-white/10 p-2 backdrop-blur-xl border border-white/20 shadow-2xl transition-all focus-within:bg-white/20">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-6 text-white/40 group-focus-within:text-white/70 transition-colors" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Escribe el Nº de Papeleta aquí..."
                      className="w-full bg-transparent border-0 h-20 pl-16 pr-6 text-2xl font-bold text-white placeholder:text-white/30 focus:ring-0 outline-none uppercase"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="h-16 px-10 rounded-2xl bg-white text-platform-blue hover:bg-blue-50 text-xl font-black shadow-xl disabled:bg-white/50"
                  >
                    {isLoading ? <Loader2 className="size-8 animate-spin" /> : "BUSCAR"}
                  </Button>
                </div>
              </div>
              
              {/* Help Text */}
              <div className="mt-6 flex flex-wrap justify-center gap-6">
                <Link to="/inicio" className="text-sm font-bold text-white/60 hover:text-white flex items-center gap-2 transition-colors">
                  <ArrowLeft className="size-4" /> Volver al menú principal
                </Link>
                <span className="text-white/20">|</span>
                <p className="text-sm font-medium text-white/50 italic">
                  Ejemplo: CP155801 o A1G359
                </p>
              </div>
            </form>
          </div>

          {/* Floating Logos or info */}
          <div className="absolute bottom-8 text-center opacity-40">
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">Servicio de Administración Tributaria - SAT 2026</p>
          </div>
        </main>
      )}

      {/* Results State */}
      {hasSearched && (
        <div className="p-4 md:p-8">
          {/* Breadcrumb & Search Back */}
          <div className="mx-auto max-w-6xl mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/inicio">Inicio</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <button onClick={resetSearch}>Consulta de Papeleta</button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Seguimiento #{papeletaActual.nro}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <Button 
              variant="outline" 
              onClick={resetSearch}
              className="border-platform-blue text-platform-blue font-bold gap-2"
            >
              <Search className="size-4" />
              BUSCAR OTRA PAPELETA
            </Button>
          </div>

          <div className="mx-auto max-w-6xl space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-platform-blue md:text-4xl uppercase">
                Ruta de tu Papeleta
              </h1>
              <p className="text-zinc-500 font-medium">
                Expediente digital recuperado. Estado actual: <span className="text-platform-blue font-bold">EN PROCESO</span>
              </p>
            </div>

            {/* Info Card Summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Nº Papeleta</p>
                <p className="text-xl font-black text-platform-blue tracking-tight">{papeletaActual.nro}</p>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Placa Vehicular</p>
                <p className="text-xl font-black text-platform-blue tracking-tight">{papeletaActual.placa}</p>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Importe Original</p>
                <p className="text-xl font-black text-platform-blue tracking-tight">S/ {papeletaActual.importe}</p>
              </div>
              <div className="rounded-2xl border-2 border-green-500 bg-green-50/50 p-5 shadow-lg shadow-green-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Total a Pagar</p>
                  <CustomBadge className="bg-green-500 text-white text-[9px] px-1.5 py-0 border-0 uppercase">Ahorro Activo</CustomBadge>
                </div>
                <p className="text-3xl font-black text-green-600 tracking-tight">S/ {papeletaActual.deuda}</p>
                <p className="mt-2 text-[10px] text-green-700/80 font-bold italic">Ahorras S/ {papeletaActual.descuento} si pagas hoy</p>
              </div>
            </div>

            {/* Tracking Flow */}
            <div className="rounded-3xl border bg-white shadow-2xl shadow-zinc-200/50 overflow-hidden">
              <div className="bg-platform-blue px-6 py-6 flex items-center justify-between">
                 <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <ArrowRight className="size-5 text-blue-300" />
                    Flujo de Tránsito y Transporte
                 </h2>
                 <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                      <div className="size-2.5 rounded-full bg-green-400" />
                      <span className="text-[10px] font-bold text-white uppercase">Completado</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                      <div className="size-2.5 rounded-full bg-blue-300 animate-pulse" />
                      <span className="text-[10px] font-bold text-white uppercase">En Proceso</span>
                    </div>
                 </div>
              </div>
              
              <div className="p-6 md:p-12 lg:p-16">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute top-[28px] left-0 h-1 w-full bg-zinc-100 hidden md:block" />

                  <div className="grid gap-y-16 md:grid-cols-7 relative">
                    {/* PAS Section */}
                    {pasosPAS.map((paso, idx) => (
                      <div key={paso.id} className="relative flex flex-col items-center group">
                        {idx === 2 && (
                          <div className="absolute -top-16 left-1/2 w-[450%] -translate-x-1/2 text-center hidden md:block z-0 pointer-events-none">
                            <span className="text-[10px] font-black text-green-600 bg-green-50 px-5 py-2 rounded-full border border-green-200 uppercase tracking-[0.3em] shadow-sm">
                              Procedimiento Administrativo Sancionador (PAS)
                            </span>
                          </div>
                        )}

                        <div className={cn(
                          "z-10 flex size-14 items-center justify-center rounded-full border-4 transition-all duration-500 shadow-xl relative",
                          paso.status === "completed" ? "bg-green-500 border-white text-white" : 
                          paso.status === "current" ? "bg-platform-blue border-blue-50 text-white scale-125 ring-8 ring-platform-blue/5" : 
                          "bg-white border-zinc-50 text-zinc-300"
                        )}>
                          {paso.status === "completed" ? <CheckCircle2 className="size-7" /> : 
                           paso.status === "current" ? <Clock className="size-7 animate-spin-slow" /> : 
                           <span className="text-lg font-black">{idx + 1}</span>}
                        </div>

                        <div className="mt-8 text-center space-y-1 max-w-[120px]">
                          <h3 className={cn(
                            "text-xs font-black uppercase tracking-tighter leading-tight h-8 flex items-center justify-center",
                            paso.status === "upcoming" ? "text-zinc-400" : "text-platform-blue"
                          )}>
                            {paso.title}
                          </h3>
                          <p className="text-[10px] leading-tight text-zinc-500 font-medium min-h-[2.5rem] mt-2">
                            {paso.desc}
                          </p>
                          <div className={cn(
                            "mt-4 inline-flex rounded-md px-3 py-1 text-[9px] font-black uppercase tracking-tight whitespace-nowrap",
                            paso.status === "completed" ? "bg-green-100 text-green-700" : 
                            paso.status === "current" ? "bg-blue-100 text-blue-700" : 
                            "bg-zinc-100 text-zinc-400"
                          )}>
                            {paso.deadline}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* PEC Section */}
                    {pasosPEC.map((paso, idx) => (
                      <div key={paso.id} className="relative flex flex-col items-center group">
                        {idx === 0 && (
                          <div className="absolute -top-16 left-1/2 w-[180%] -translate-x-1/2 text-center hidden md:block z-0 pointer-events-none">
                            <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-5 py-2 rounded-full border border-orange-200 uppercase tracking-[0.3em] shadow-sm">
                              Ejecución Coactiva (PEC)
                            </span>
                          </div>
                        )}

                        <div className={cn(
                          "z-10 flex size-14 items-center justify-center rounded-full border-4 bg-white border-zinc-50 text-zinc-300 shadow-xl"
                        )}>
                          <span className="text-lg font-black">{pasosPAS.length + idx + 1}</span>
                        </div>

                        <div className="mt-8 text-center space-y-1 max-w-[120px]">
                          <h3 className="text-xs font-black uppercase tracking-tighter leading-tight h-8 flex items-center justify-center text-zinc-400">
                            {paso.title}
                          </h3>
                          <p className="text-[10px] leading-tight text-zinc-500 font-medium min-h-[2.5rem] mt-2">
                            {paso.desc}
                          </p>
                          <div className="mt-4 inline-flex rounded-md bg-zinc-100 px-3 py-1 text-[9px] font-black uppercase tracking-tight text-zinc-400 whitespace-nowrap">
                            {paso.deadline}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="mt-20 rounded-3xl bg-platform-blue/5 border-2 border-dashed border-platform-blue/20 p-8">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-platform-blue text-white shadow-2xl rotate-3">
                      <AlertTriangle className="size-10" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-platform-blue animate-ping" />
                        <h4 className="text-xl font-black text-platform-blue uppercase tracking-tight">Acción requerida: Etapa de Notificación</h4>
                      </div>
                      <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                        Tu expediente <span className="font-bold text-platform-blue">#{papeletaActual.nro}</span> se encuentra en revisión. 
                        Cuentas con un plazo legal hasta el <b className="text-platform-blue px-1.5 py-0.5 bg-blue-100 rounded">18 de Junio de 2026</b> para proceder con el descargo o beneficiarte del descuento del <span className="text-green-600 font-bold italic">83%</span>.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 shrink-0 sm:flex-row lg:flex-col">
                      <Button ref={payButtonRef} className="bg-platform-blue hover:bg-platform-blue/90 shadow-xl shadow-blue-900/10 px-10 py-7 h-auto text-lg font-black transition-all hover:-translate-y-1">
                        PAGAR AHORA <ArrowRight className="ml-3 size-6" />
                      </Button>
                      <Button ref={reclamoButtonRef} variant="outline" className="border-platform-blue text-platform-blue font-bold hover:bg-blue-50 py-7 h-auto">
                        Presentar Reclamo
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <button ref={imprimirButtonRef} className="flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-platform-blue uppercase tracking-widest transition-colors">
                <Printer className="size-4" /> Imprimir Constancia
              </button>
              <button ref={descargarButtonRef} className="flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-platform-blue uppercase tracking-widest transition-colors">
                 Expediente Digital
              </button>
              <a
                ref={whatsappLinkRef}
                href="https://wa.me/51999431111"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-black text-green-600 hover:text-green-700 uppercase tracking-widest transition-colors"
              >
                Chat con Asesor <ExternalLink className="size-4" />
              </a>
            </div>
            
            {/* Legal Disclaimer */}
            <div className="mt-16 text-center max-w-2xl mx-auto space-y-4">
              <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">Servicio de Administración Tributaria - SAT 2026</p>
              <p className="text-[9px] leading-relaxed text-zinc-400 italic">
                La información mostrada es referencial y está sujeta a la actualización de los sistemas del SAT. 
                El uso de este portal no reemplaza las notificaciones legales oficiales enviadas a su domicilio físico o electrónico.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", className)}>
      {children}
    </span>
  );
}