import { useState, useEffect, useCallback, useRef } from "react";
import { Search, CheckCircle2, Clock, AlertTriangle, ArrowRight, Loader2, ArrowLeft, Eye, X, SearchX, Camera } from "lucide-react";
import { Link, useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import { ReclamoFlow } from "../components/reclamo-flow";
import { PagoModal } from "../components/pago-modal";
import { RegistroPapeletaModal } from "../components/registro-papeleta-modal";
import { useVoiceContext } from "@/features/voice/context/voiceContext";
import { useSpeechSynthesis } from "@/features/voice/hooks/useSpeechSynthesis";
import { normalize } from "@/features/voice/services/commandMatcher";
import infractionImage from "@/assets/images/image.webp";
import { LanguageSelector } from "@/shared/components/LanguageSelector";

export default function ConsultaPapeletaPage() {
  const { numeroDePapeleta } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { registerCommand, showGuidance } = useVoiceContext();
  const { speak } = useSpeechSynthesis();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
  const [reclamoOpen, setReclamoOpen] = useState(false);
  const [pagoOpen, setPagoOpen] = useState(false);
  const [registroOpen, setRegistroOpen] = useState(false);

  const payButtonRef = useRef<HTMLButtonElement>(null);
  const reclamoButtonRef = useRef<HTMLButtonElement>(null);
  const imprimirButtonRef = useRef<HTMLButtonElement>(null);
  const descargarButtonRef = useRef<HTMLButtonElement>(null);
  const whatsappLinkRef = useRef<HTMLAnchorElement>(null);
  const autoSearchRef = useRef<string | null>(null);

  // Mock initial data
  const [papeletaActual, setPapeletaActual] = useState({
    nro: "",
    placa: "A1G359",
    falta: "G40",
    descripcionFalta: "Circular a una velocidad superior a la máxima permitida, según la señalización o la que establece el Reglamento.",
    fecha: "27/12/2025",
    importe: "880.00",
    descuento: "730.40",
    deuda: "149.60",
    estado: "En Proceso",
    etapaActual: 2
  });

  const pasosPAS = [
    {
      id: 0,
      title: t("platform.consultation.timeline.pas.start.title"),
      desc: t("platform.consultation.timeline.pas.start.desc"),
      status: "completed",
      deadline: t("platform.consultation.timeline.dayZero"),
    },
    {
      id: 1,
      title: t("platform.consultation.timeline.pas.reportIssue.title"),
      desc: t("platform.consultation.timeline.pas.reportIssue.desc"),
      status: "completed",
      deadline: t("platform.consultation.timeline.fiveDayTerm"),
    },
    {
      id: 2,
      title: t("platform.consultation.timeline.pas.notification.title"),
      desc: t("platform.consultation.timeline.pas.notification.desc"),
      status: "current",
      deadline: t("platform.consultation.timeline.fiveDayTerm"),
    },
    {
      id: 3,
      title: t("platform.consultation.timeline.pas.resolution.title"),
      desc: t("platform.consultation.timeline.pas.resolution.desc"),
      status: "upcoming",
      deadline: t("platform.consultation.timeline.fiveDayTerm"),
    },
    {
      id: 4,
      title: t("platform.consultation.timeline.pas.finalPenalty.title"),
      desc: t("platform.consultation.timeline.pas.finalPenalty.desc"),
      status: "upcoming",
      deadline: t("platform.consultation.timeline.fifteenBusinessDays"),
    },
  ];

  const pasosPEC = [
    {
      id: 5,
      title: t("platform.consultation.timeline.pec.start.title"),
      desc: t("platform.consultation.timeline.pec.start.desc"),
      status: "upcoming",
      deadline: t("platform.consultation.timeline.ifPendingDebt"),
    },
    {
      id: 6,
      title: t("platform.consultation.timeline.pec.precautionaryMeasures.title"),
      desc: t("platform.consultation.timeline.pec.precautionaryMeasures.desc"),
      status: "upcoming",
      deadline: t("platform.consultation.timeline.sevenBusinessDays"),
    },
  ];

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    setNotFound(false);

    if (query.trim().toUpperCase() === "CP155801") {
      setPapeletaActual({
        nro: "CP155801",
        placa: "A1G359",
        falta: "G40",
        descripcionFalta: "Circular a una velocidad superior a la máxima permitida, según la señalización o la que establece el Reglamento.",
        fecha: "27/12/2025",
        importe: "880.00",
        descuento: "730.40",
        deuda: "149.60",
        estado: "En Proceso",
        etapaActual: 2
      });
      setHasSearched(true);
    } else {
      setNotFound(true);
      setHasSearched(false);
    }
    setIsLoading(false);
  }, []);

  // Sync URL route param to state
  useEffect(() => {
    if (numeroDePapeleta) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync URL param to local state
      setSearchQuery(numeroDePapeleta);
      performSearch(numeroDePapeleta);
    } else {
      setHasSearched(false);
      setNotFound(false);
      setSearchQuery("");
    }
  }, [numeroDePapeleta, performSearch]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/consulta-en-linea/papeletas/${searchQuery.trim()}`);
    }
  };

  const resetSearch = useCallback(() => {
    setHasSearched(false);
    setNotFound(false);
    setSearchQuery("");
    setShowPhoto(false);
    setReclamoOpen(false);
    setPagoOpen(false);
    navigate("/consulta-en-linea/papeletas");
  }, [navigate]);

  /** Close all open modals before opening a new one. */
  const closeAllModals = useCallback(() => {
    setShowPhoto(false);
    setReclamoOpen(false);
    setPagoOpen(false);
  }, []);

  // Auto-search from URL query param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q !== autoSearchRef.current) {
      autoSearchRef.current = q;
      setSearchQuery(q);
      performSearch(q);
    }
  }, [searchParams, performSearch]);

  // Voice commands
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    if (!hasSearched) {
      // Search state — natural language patterns
      cleanups.push(registerCommand({
        patterns: ['buscar', 'buscar papeleta', 'buscar placa', 'consultar', 'quiero buscar', 'buscame', 'consultame', 'checar', 'chequear', 'ver', 'revisar', 'averiguar'],
        action: (transcript) => {
          const normalized = normalize(transcript ?? '');
          const query = normalized
            .replace(/^(buscar\s*(papeleta|placa)?|consultar|quiero buscar|buscame|consultame|checar|chequear|ver|revisar|averiguar)\s*/, '')
            .trim();
          if (query) {
            setSearchQuery(query.toUpperCase());
            performSearch(query.toUpperCase());
            speak(`Buscando ${query.toUpperCase()}`);
          } else {
            speak('Decime el número de papeleta, placa o DNI que querés buscar');
            showGuidance('Para buscar una papeleta, decí el número.\nPor ejemplo: "buscar CP155801" o "placa A1G359".');
          }
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['buscar dni', 'consultar dni', 'buscar por documento', 'consultar documento', 'ver por dni', 'revisar con dni'],
        action: (transcript) => {
          const normalized = normalize(transcript ?? '');
          const dni = normalized
            .replace(/^(buscar\s*dni|consultar\s*dni|buscar\s*por\s*documento|consultar\s*documento|ver\s*por\s*dni|revisar\s*con\s*dni)\s*/, '')
            .trim();
          if (dni) {
            setSearchQuery(dni.toUpperCase());
            performSearch(dni.toUpperCase());
            speak(`Consultando DNI ${dni}`);
          } else {
            speak('Decime tu número de DNI');
            showGuidance('Para buscar por DNI, decí tu número.\nPor ejemplo: "buscar DNI 12345678".');
          }
        },
        scope: 'consulta-papeleta',
      }));
    } else {
      // Results state — natural language patterns
      cleanups.push(registerCommand({
        patterns: ['pagar', 'pagar ahora', 'pagar la multa', 'pagar mi papeleta', 'quiero pagar', 'cancelar deuda', 'abonar', 'liquidar', 'ponerme al dia', 'pagar con descuento', 'pagame', 'como pago', 'se puede pagar', 'realizar el pago', 'cancelar la multa', 'pagar ya'],
        action: () => {
          closeAllModals();
          speak('Abriendo pasarela de pago');
          payButtonRef.current?.click();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['presentar reclamo', 'hacer reclamo', 'hacer un reclamo', 'apelar', 'reclamar', 'impugnar', 'descargo', 'quejarme', 'no estoy de acuerdo', 'quiero reclamar', 'como reclamo', 'hacer descargo', 'presentar descargo', 'apelar la multa'],
        action: () => {
          closeAllModals();
          speak('Abriendo formulario de reclamo');
          setReclamoOpen(true);
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['imprimir', 'imprimir constancia', 'sacar copia', 'imprimime', 'quiero imprimir', 'dame constancia', 'sacame copia', 'imprimir documento', 'imprimir papeleta'],
        action: () => {
          speak('Preparando constancia para imprimir');
          imprimirButtonRef.current?.click();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['descargar', 'descargar expediente', 'bajar', 'descargame', 'bajar documento', 'quiero descargar', 'bajar archivo', 'obtener copia', 'descargar pdf'],
        action: () => {
          speak('Descargando expediente');
          descargarButtonRef.current?.click();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['whatsapp', 'asesor', 'chatbot', 'chatear', 'hablar con alguien', 'contactar', 'escribir al sat', 'atencion', 'comunicarme', 'quiero hablar', 'necesito un asesor', 'ayuda humana'],
        action: () => {
          speak('Conectando con asesor por WhatsApp');
          whatsappLinkRef.current?.click();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['buscar otra', 'nueva busqueda', 'otra papeleta', 'buscar otra papeleta', 'nueva consulta', 'siguiente', 'quiero buscar otra', 'consultar otra'],
        action: () => {
          speak('Volviendo a la búsqueda');
          resetSearch();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['ver detalle', 'ver infraccion', 'ver foto', 'mostrar foto', 'evidencia', 'mostrame', 'quiero ver la foto', 'a ver', 'ensename', 'mostrar imagen', 'ver la prueba'],
        action: () => {
          closeAllModals();
          speak('Mostrando evidencia visual');
          setShowPhoto(true);
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['cerrar foto', 'ocultar foto', 'cerrar evidencia', 'cierra eso', 'cerrame', 'quitame', 'saca eso', 'cerrar eso', 'cierra la foto', 'ocultar imagen', 'cerrar imagen', 'ya vi la foto', 'listo cerra'],
        action: () => {
          speak('Cerrando evidencia');
          setShowPhoto(false);
        },
        scope: 'consulta-papeleta',
      }));

      // Modal-aware: close any open modal before navigating back
      cleanups.push(registerCommand({
        patterns: ['volver', 'atras', 'retroceder', 'regresar', 'quiero volver', 'regresame', 'volver atras', 'devolverme', 'para atras', 'retrocede'],
        action: () => {
          if (showPhoto) { closeAllModals(); speak('Cerrando foto'); return; }
          if (reclamoOpen) { closeAllModals(); speak('Cerrando reclamo'); return; }
          if (pagoOpen) { closeAllModals(); speak('Cerrando pago'); return; }
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['cerrar', 'cierra', 'cierra eso', 'cerrame', 'cerrar ventana', 'cerrar esto', 'ocultar', 'quitame', 'saca eso', 'cerra', 'cierra la ventana', 'quita eso'],
        action: () => {
          if (showPhoto) { closeAllModals(); speak('Foto cerrada'); return; }
          if (reclamoOpen) { closeAllModals(); speak('Reclamo cerrado'); return; }
          if (pagoOpen) { closeAllModals(); speak('Pago cerrado'); return; }
          speak('No hay nada que cerrar');
        },
        scope: 'consulta-papeleta',
      }));
    }

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [hasSearched, registerCommand, speak, performSearch, resetSearch, showGuidance, showPhoto, reclamoOpen, pagoOpen, closeAllModals]);

  // AI click listener
  useEffect(() => {
    const RESULTS_ONLY = new Set(['pagar', 'reclamo', 'imprimir', 'descargar', 'show-photo', 'close-photo']);

    const handler = (e: Event) => {
      const { target } = (e as CustomEvent<{ target: string }>).detail;

      // Guide user: results-only actions need a search first
      if (!hasSearched && RESULTS_ONLY.has(target)) {
        speak('Primero ingresa el número de tu papeleta, placa o DNI');
        showGuidance('Para continuar, primero buscá tu papeleta.\nDecí "buscar" seguido de tu número de placa o DNI.');
        return;
      }

      switch (target) {
        case 'pagar': closeAllModals(); payButtonRef.current?.click(); break;
        case 'reclamo': closeAllModals(); setReclamoOpen(true); break;
        case 'imprimir': imprimirButtonRef.current?.click(); break;
        case 'descargar': descargarButtonRef.current?.click(); break;
        case 'whatsapp': whatsappLinkRef.current?.click(); break;
        case 'buscar-otra': resetSearch(); break;
        case 'show-photo': closeAllModals(); setShowPhoto(true); break;
        case 'close-photo': setShowPhoto(false); break;
      }
    };
    window.addEventListener('voice:ai-click', handler);
    return () => window.removeEventListener('voice:ai-click', handler);
  }, [hasSearched, resetSearch, speak, showGuidance, closeAllModals]);

  return (
    <div className="min-h-screen bg-zinc-50/50">
      {/* Search State (Initial) */}
      {!hasSearched && (
        <main className="relative flex min-h-svh flex-col overflow-hidden bg-platform-blue p-6 text-white">
          <div className="pointer-events-none absolute inset-0 text-white/5 bg-[radial-gradient(circle_at_1px_1px,currentColor_1.25px,transparent_0)] bg-size-[32px_32px]" />
          
          {/* Breadcrumb for Search State */}
          <div className="z-20 mx-auto mb-8 flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink asChild><Link to="/inicio" className="text-blue-100 hover:text-white transition-colors">{t("common.home")}</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/30" />
                <BreadcrumbItem><BreadcrumbLink asChild><Link to="/consulta-en-linea" className="text-blue-100 hover:text-white transition-colors">{t("platform.consultation.title")}</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator className="text-white/30" />
                <BreadcrumbItem><BreadcrumbPage className="text-white font-black uppercase">{t("platform.consultation.ticketsBreadcrumb")}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <LanguageSelector />
          </div>

          <div className="z-10 m-auto w-full max-w-2xl space-y-10 text-center pb-20">
            <div className="space-y-4">
              <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
                {t("platform.consultation.ticketsTitle")}
              </h1>
              <p className="text-lg font-medium text-blue-100/80">
                {t("platform.consultation.ticketsDescription")}
              </p>
            </div>

            <form onSubmit={handleSearch} className="relative group">
              <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-white/10 p-1.5 md:p-2 backdrop-blur-xl border border-white/20 shadow-2xl transition-all focus-within:bg-white/20">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 size-5 md:size-6 text-white/40 group-focus-within:text-white/70 transition-colors" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (notFound) setNotFound(false);
                      }}
                      placeholder={t("platform.consultation.ticketInputPlaceholder")}
                      className="w-full bg-transparent border-0 h-14 md:h-20 pl-12 md:pl-16 pr-4 text-lg md:text-2xl font-bold text-white placeholder:text-white/30 focus:ring-0 outline-none uppercase"
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit"
                    disabled={isLoading}
                    className="h-11 md:h-16 px-6 md:px-10 rounded-xl md:rounded-2xl bg-white text-platform-blue hover:bg-blue-50 text-sm md:text-xl font-black shadow-xl disabled:bg-white/50"
                  >
                    {isLoading ? <Loader2 className="size-5 md:size-8 animate-spin" /> : t("platform.consultation.searchButton")}
                  </Button>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-6">
                <Link to="/inicio" className="text-sm font-bold text-white/60 hover:text-white flex items-center gap-2 transition-colors">
                  <ArrowLeft className="size-4" /> {t("platform.consultation.backToMainMenu")}
                </Link>
                <span className="text-white/20">|</span>
                <p className="text-sm font-medium text-white/50 italic">
                  {t("platform.consultation.ticketExample")}
                </p>
              </div>
            </form>

            {notFound && (
              <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6 mt-6">
                <SearchX className="size-10 text-slate-400" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-slate-700">
                    {t("platform.consultation.notFoundTitle")}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {t("platform.consultation.notFoundDescription")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setRegistroOpen(true)}
                  className="border-platform-blue text-platform-blue hover:bg-blue-50 mt-2"
                >
                  <Camera className="mr-2 size-4" />
                  {t("platform.consultation.registerWithPhoto")}
                </Button>
              </div>
            )}
          </div>
          <div className="absolute bottom-8 text-center opacity-40">
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">{t("platform.consultation.satFooter")}</p>
          </div>
        </main>
      )}

      {/* Results State */}
      {hasSearched && (
        <div className="p-4 md:p-8">
          <div className="mx-auto max-w-6xl mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink asChild><Link to="/inicio">{t("common.home")}</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><Link to="/consulta-en-linea">{t("platform.consultation.title")}</Link></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink asChild><button onClick={resetSearch}>{t("platform.consultation.ticketsBreadcrumb")}</button></BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>{t("platform.consultation.trackingBreadcrumb", { ticket: papeletaActual.nro })}</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <LanguageSelector />
              <Button variant="outline" onClick={resetSearch} className="border-platform-blue text-platform-blue font-bold gap-2">
                <Search className="size-4" /> {t("platform.consultation.searchAnother")}
              </Button>
            </div>
          </div>

          <div className="mx-auto max-w-6xl space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1">
              <h1 className="text-3xl font-black tracking-tight text-platform-blue md:text-4xl uppercase">{t("platform.consultation.trackingTitle")}</h1>
              <p className="text-zinc-500 font-medium italic">{t("platform.consultation.trackingDescription", { plate: papeletaActual.placa })}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{t("platform.consultation.ticketNumber")}</p>
                <p className="text-xl font-black text-platform-blue tracking-tight">{papeletaActual.nro}</p>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm group relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{t("platform.consultation.vehiclePlate")}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-platform-blue tracking-tight">{papeletaActual.placa}</p>
                  </div>
                  <button 
                    onClick={() => setShowPhoto(true)}
                    className="mt-3 text-[10px] font-black text-platform-blue hover:text-platform-blue/80 uppercase tracking-widest flex items-center gap-2 transition-all underline underline-offset-4 decoration-2 decoration-blue-200 hover:decoration-platform-blue"
                  >
                    {t("platform.consultation.infractionDetail")} <ArrowRight className="size-3" />
                  </button>
                </div>
                <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                  <Eye className="size-16 rotate-12" />
                </div>
              </div>
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{t("platform.consultation.originalAmount")}</p>
                <p className="text-xl font-black text-platform-blue tracking-tight">S/ {papeletaActual.importe}</p>
              </div>
              <div className="rounded-2xl border-2 border-green-500 bg-green-50/50 p-5 shadow-lg shadow-green-100">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t("platform.consultation.totalToPay")}</p>
                  <CustomBadge className="bg-green-500 text-white text-[9px] px-1.5 py-0 border-0 uppercase">{t("platform.consultation.activeSaving")}</CustomBadge>
                </div>
                <p className="text-3xl font-black text-green-600 tracking-tight">S/ {papeletaActual.deuda}</p>
                <p className="mt-2 text-[10px] text-green-700/80 font-bold italic">{t("platform.consultation.savingToday", { amount: papeletaActual.descuento })}</p>
              </div>
            </div>

            <div className="rounded-3xl border bg-white shadow-2xl shadow-zinc-200/50 overflow-hidden">
              <div className="bg-platform-blue px-6 py-6 flex items-center justify-between">
                 <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3"><ArrowRight className="size-5 text-blue-300" /> {t("platform.consultation.trafficFlow")}</h2>
                 <div className="hidden sm:flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><div className="size-2.5 rounded-full bg-green-400" /><span className="text-[10px] font-bold text-white uppercase">{t("platform.consultation.completed")}</span></div>
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full"><div className="size-2.5 rounded-full bg-blue-300 animate-pulse" /><span className="text-[10px] font-bold text-white uppercase">{t("platform.consultation.inProgress")}</span></div>
                 </div>
              </div>
              <div className="p-6 md:p-12 lg:p-16">
                <div className="grid gap-0 md:grid-cols-[5fr_2fr]">
                  <div className="relative bg-green-50/100 px-4 pt-16 pb-8 md:px-6">
                    <div className="absolute top-[92px] left-0 hidden h-1 w-full bg-green-200/80 md:block" />
                    <div className="relative grid gap-y-16 md:grid-cols-5">
                      {pasosPAS.map((paso, idx) => (
                        <div key={paso.id} className="group relative flex flex-col items-center">
                          {idx === 2 && (<div className="pointer-events-none absolute -top-16 left-1/2 z-0 hidden w-[450%] -translate-x-1/2 text-center md:block"><span className="rounded-full bg-green-100 px-5 py-2 text-[10px] font-black tracking-[0.3em] text-green-700 uppercase shadow-sm">{t("platform.consultation.timeline.pasLabel")}</span></div>)}
                          <div className={cn("relative z-10 flex size-14 items-center justify-center rounded-full border-4 shadow-xl transition-all duration-500", paso.status === "completed" ? "border-white bg-green-500 text-white" : paso.status === "current" ? "scale-125 border-blue-50 bg-platform-blue text-white ring-8 ring-platform-blue/5" : "border-zinc-50 bg-white text-zinc-300")}>
                            {paso.status === "completed" ? <CheckCircle2 className="size-7" /> : paso.status === "current" ? <Clock className="size-7 animate-spin-slow" /> : <span className="text-lg font-black">{idx + 1}</span>}
                          </div>
                          <div className="mt-8 max-w-[120px] space-y-1 text-center">
                            <h3 className={cn("flex h-8 items-center justify-center text-xs leading-tight font-black tracking-tighter uppercase", paso.status === "upcoming" ? "text-zinc-400" : "text-platform-blue")}>{paso.title}</h3>
                            <p className="mt-2 min-h-[2.5rem] text-[10px] leading-tight font-medium text-zinc-500">{paso.desc}</p>
                            <div className={cn("mt-4 inline-flex rounded-md px-3 py-1 text-[9px] font-black tracking-tight whitespace-nowrap uppercase", paso.status === "completed" ? "bg-green-100 text-green-700" : paso.status === "current" ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-400")}>{paso.deadline}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="relative bg-orange-50/80 px-4 pt-16 pb-8 md:px-6">
                    <div className="absolute top-[92px] left-0 hidden h-1 w-full bg-orange-200/80 md:block" />
                    <div className="relative grid gap-y-16 md:grid-cols-2">
                      {pasosPEC.map((paso, idx) => (
                        <div key={paso.id} className="group relative flex flex-col items-center">
                          {idx === 0 && (<div className="pointer-events-none absolute -top-16 left-full z-0 hidden w-[200%] -translate-x-1/2 text-center md:block"><span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-[10px] font-black tracking-[0.2em] whitespace-nowrap text-orange-700 uppercase shadow-sm">{t("platform.consultation.timeline.pecLabel")}</span></div>)}
                          <div className="z-10 flex size-14 items-center justify-center rounded-full border-4 border-zinc-50 bg-white text-zinc-300 shadow-xl"><span className="text-lg font-black">{pasosPAS.length + idx + 1}</span></div>
                          <div className="mt-8 max-w-[120px] space-y-1 text-center">
                            <h3 className="flex h-8 items-center justify-center text-xs leading-tight font-black tracking-tighter text-zinc-400 uppercase">{paso.title}</h3>
                            <p className="mt-2 min-h-[2.5rem] text-[10px] leading-tight font-medium text-zinc-500">{paso.desc}</p>
                            <div className="mt-4 inline-flex rounded-md bg-zinc-100 px-3 py-1 text-[9px] font-black tracking-tight whitespace-nowrap text-zinc-400 uppercase">{paso.deadline}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-20 rounded-3xl bg-platform-blue/5 border-2 border-dashed border-platform-blue/20 p-8">
                  <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-platform-blue text-white shadow-2xl rotate-3"><AlertTriangle className="size-10" /></div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-platform-blue animate-ping" /><h4 className="text-xl font-black text-platform-blue uppercase tracking-tight">{t("platform.consultation.requiredAction")}</h4></div>
                      <p className="text-sm text-zinc-600 leading-relaxed font-medium">{t("platform.consultation.requiredActionDescription", { date: t("platform.consultation.requiredActionDate"), discount: "83%" })}</p>
                    </div>
                    <div className="flex flex-col gap-3 shrink-0 sm:flex-row lg:flex-col">
                      <Button
                        ref={payButtonRef}
                        onClick={() => setPagoOpen(true)}
                        className="bg-platform-blue hover:bg-platform-blue/90 shadow-xl shadow-blue-900/10 px-10 py-7 h-auto text-lg font-black transition-all hover:-translate-y-1"
                      >
                        {t("platform.consultation.payNow")} <ArrowRight className="ml-3 size-6" />
                      </Button>
                      <Button
                        ref={reclamoButtonRef}
                        variant="outline"
                        onClick={() => setReclamoOpen(true)}
                        className="border-platform-blue text-platform-blue font-bold hover:bg-blue-50 py-7 h-auto"
                      >
                        {t("platform.consultation.submitClaim")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-16 text-center max-w-2xl mx-auto space-y-4"><p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">SAT 2026</p></div>
          </div>
        </div>
      )}

      {/* Modal de Evidencia Visual */}
      {showPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-platform-blue/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="absolute top-4 right-4 z-10">
              <button onClick={() => setShowPhoto(false)} className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"><X className="size-6" /></button>
            </div>
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 bg-zinc-100 min-h-[350px] flex items-center justify-center relative overflow-hidden">
                <img 
                  src={infractionImage} 
                  alt={t("platform.consultation.evidenceAlt")}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
              <div className="w-full md:w-80 p-8 space-y-6 bg-white border-l">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{t("platform.consultation.infractionDescription")}</p>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-platform-blue uppercase leading-tight">{papeletaActual.falta}</h4>
                    <p className="text-[12px] text-zinc-600 font-medium leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                      {papeletaActual.descripcionFalta}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm border-b pb-2"><span className="text-zinc-500 font-medium">{t("platform.consultation.date")}</span><span className="font-bold text-platform-blue">{papeletaActual.fecha}</span></div>
                  <div className="flex justify-between text-sm border-b pb-2"><span className="text-zinc-500 font-medium">{t("platform.consultation.location")}</span><span className="font-bold text-platform-blue text-right">Av. Javier Prado</span></div>
                </div>
                <div className="pt-4">
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                    <p className="text-[10px] font-black text-green-700 uppercase mb-1">{t("platform.consultation.status")}</p>
                    <p className="text-sm font-black text-green-600 uppercase italic">{t("platform.consultation.verifiedRecord")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReclamoFlow
        open={reclamoOpen}
        onOpenChange={setReclamoOpen}
        papeletaNro={papeletaActual.nro}
        onIrPagar={() => {
          setPagoOpen(true);
        }}
        onSeguimiento={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      <PagoModal
        open={pagoOpen}
        onOpenChange={setPagoOpen}
        papeletaNro={papeletaActual.nro}
        monto={papeletaActual.deuda}
      />

      <RegistroPapeletaModal
        open={registroOpen}
        onOpenChange={setRegistroOpen}
        onRegistroSuccess={() => {
          setPapeletaActual({
            nro: "CP155801",
            placa: "A1G359",
            falta: "G40",
            descripcionFalta: "Circular a una velocidad superior a la máxima permitida, según la señalización o la que establece el Reglamento.",
            fecha: "27/12/2025",
            importe: "880.00",
            descuento: "730.40",
            deuda: "149.60",
            estado: "En Proceso",
            etapaActual: 2,
          });
          setHasSearched(true);
        }}
      />
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
