import { useState, useEffect, useCallback, useRef } from "react";
import { Search, CheckCircle2, AlertTriangle, ArrowRight, Loader2, ArrowLeft, Eye, X, FileText, Camera, MousePointer2 } from "lucide-react";
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
  
  const [reclamoOpen, setReclamoOpen] = useState(false);
  const [pagoOpen, setPagoOpen] = useState(false);

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
    // Simular retraso de API
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Lógica de búsqueda (mock)
    if (query.toLowerCase().includes("a1g") || query.includes("155") || query.length > 5) {
      const nroNormalizado = query.toUpperCase().startsWith("CP") ? query.toUpperCase() : "CP" + query;
      setPapeletaActual({
        nro: nroNormalizado,
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
      toast.success(t("platform.consultation.searchSuccess"));
    } else {
      toast.error(t("platform.consultation.searchNotFound"));
      setHasSearched(false);
    }
    setIsLoading(false);
  }, [t]);

  // Sync URL route param to state
  useEffect(() => {
    if (numeroDePapeleta) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: sync URL param to local state
      setSearchQuery(numeroDePapeleta);
      performSearch(numeroDePapeleta);
    } else {
      setHasSearched(false);
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
        patterns: ['buscar', 'buscar papeleta', 'buscar placa', 'consultar', 'quiero buscar', 'buscame', 'consultame', 'checar', 'chequear', 'ver', 'revisar', 'averiguar', 'maskay', 'papeleta maskay', 'placa maskay', 'tapukuy', 'qaway', 'qatipay'],
        action: (transcript) => {
          const normalized = normalize(transcript ?? '');
          const query = normalized
            .replace(/^(buscar\s*(papeleta|placa)?|consultar|quiero buscar|buscame|consultame|checar|chequear|ver|revisar|averiguar|maskay|papeleta\s*maskay|placa\s*maskay|tapukuy|qaway|qatipay)\s*/, '')
            .trim();
          if (query) {
            setSearchQuery(query.toUpperCase());
            performSearch(query.toUpperCase());
            speak(t('voice.searchStarted', { query: query.toUpperCase() }));
          } else {
            speak(t('voice.askTicketQuery'));
            showGuidance(t('voice.ticketSearchGuidance'));
          }
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['buscar dni', 'consultar dni', 'buscar por documento', 'consultar documento', 'ver por dni', 'revisar con dni', 'dni maskay', 'dni tapukuy', 'documentowan maskay'],
        action: (transcript) => {
          const normalized = normalize(transcript ?? '');
          const dni = normalized
            .replace(/^(buscar\s*dni|consultar\s*dni|buscar\s*por\s*documento|consultar\s*documento|ver\s*por\s*dni|revisar\s*con\s*dni|dni\s*maskay|dni\s*tapukuy|documentowan\s*maskay|maskay\s*dni|tapukuy\s*dni)\s*/, '')
            .trim();
          if (dni) {
            setSearchQuery(dni.toUpperCase());
            performSearch(dni.toUpperCase());
            speak(t('voice.dniSearchStarted', { dni }));
          } else {
            speak(t('voice.askDni'));
            showGuidance(t('voice.dniSearchGuidance'));
          }
        },
        scope: 'consulta-papeleta',
      }));
    } else {
      // Results state — natural language patterns
      cleanups.push(registerCommand({
        patterns: ['pagar', 'pagar ahora', 'pagar la multa', 'pagar mi papeleta', 'quiero pagar', 'cancelar deuda', 'abonar', 'liquidar', 'ponerme al dia', 'pagar con descuento', 'pagame', 'como pago', 'se puede pagar', 'realizar el pago', 'cancelar la multa', 'pagar ya', 'pagay', 'kunan pagay', 'deudata pagay'],
        action: () => {
          closeAllModals();
          speak(t('voice.openingPayment'));
          payButtonRef.current?.click();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['presentar reclamo', 'hacer reclamo', 'hacer un reclamo', 'apelar', 'reclamar', 'impugnar', 'descargo', 'quejarme', 'no estoy de acuerdo', 'quiero reclamar', 'como reclamo', 'hacer descargo', 'presentar descargo', 'apelar la multa', 'reclamo apachiy', 'reclamota ruray', 'mana allinchu', 'descargo apachiy'],
        action: () => {
          closeAllModals();
          speak(t('voice.openingClaim'));
          setReclamoOpen(true);
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['imprimir', 'imprimir constancia', 'sacar copia', 'imprimime', 'quiero imprimir', 'dame constancia', 'sacame copia', 'imprimir documento', 'imprimir papeleta', 'imprimir', 'constancia imprimir', 'copia hurquy'],
        action: () => {
          speak(t('voice.preparingPrint'));
          imprimirButtonRef.current?.click();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['descargar', 'descargar expediente', 'bajar', 'descargame', 'bajar documento', 'quiero descargar', 'bajar archivo', 'obtener copia', 'descargar pdf', 'uraykachiy', 'expediente uraykachiy', 'archivo uraykachiy'],
        action: () => {
          speak(t('voice.downloadingFile'));
          descargarButtonRef.current?.click();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['whatsapp', 'asesor', 'chatbot', 'chatear', 'hablar con alguien', 'contactar', 'escribir al sat', 'atencion', 'comunicarme', 'quiero hablar', 'necesito un asesor', 'ayuda humana', 'yanapaq', 'yanapawan rimay', 'whatsappwan rimay', 'runawan rimay'],
        action: () => {
          speak(t('voice.connectingAdvisor'));
          whatsappLinkRef.current?.click();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['buscar otra', 'nueva busqueda', 'otra papeleta', 'buscar otra papeleta', 'nueva consulta', 'siguiente', 'quiero buscar otra', 'consultar otra', 'hukta maskay', 'musuq maskay', 'huk papeleta'],
        action: () => {
          speak(t('voice.returningSearch'));
          resetSearch();
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['ver detalle', 'ver infraccion', 'ver foto', 'mostrar foto', 'evidencia', 'mostrame', 'quiero ver la foto', 'a ver', 'ensename', 'mostrar imagen', 'ver la prueba', 'siqita qaway', 'evidencia qaway', 'foto qaway', 'rikuchiy'],
        action: () => {
          closeAllModals();
          speak(t('voice.showingEvidence'));
          setShowPhoto(true);
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['cerrar foto', 'ocultar foto', 'cerrar evidencia', 'cierra eso', 'cerrame', 'quitame', 'saca eso', 'cerrar eso', 'cierra la foto', 'ocultar imagen', 'cerrar imagen', 'ya vi la foto', 'listo cerra', 'siqita wichqay', 'evidenciata wichqay', 'pakay', 'wichqay'],
        action: () => {
          speak(t('voice.closingEvidence'));
          setShowPhoto(false);
        },
        scope: 'consulta-papeleta',
      }));

      // Modal-aware: close any open modal before navigating back
      cleanups.push(registerCommand({
        patterns: ['volver', 'atras', 'retroceder', 'regresar', 'quiero volver', 'regresame', 'volver atras', 'devolverme', 'para atras', 'retrocede', 'kutiy', 'qhipaman', 'kutichiy'],
        action: () => {
          if (showPhoto) { closeAllModals(); speak(t('voice.closingPhoto')); return; }
          if (reclamoOpen) { closeAllModals(); speak(t('voice.closingClaim')); return; }
          if (pagoOpen) { closeAllModals(); speak(t('voice.closingPayment')); return; }
        },
        scope: 'consulta-papeleta',
      }));

      cleanups.push(registerCommand({
        patterns: ['cerrar', 'cierra', 'cierra eso', 'cerrame', 'cerrar ventana', 'cerrar esto', 'ocultar', 'quitame', 'saca eso', 'cerra', 'cierra la ventana', 'quita eso', 'wichqay', 'pakay', 'chinkachiy'],
        action: () => {
          if (showPhoto) { closeAllModals(); speak(t('voice.photoClosed')); return; }
          if (reclamoOpen) { closeAllModals(); speak(t('voice.claimClosed')); return; }
          if (pagoOpen) { closeAllModals(); speak(t('voice.paymentClosed')); return; }
          speak(t('voice.nothingToClose'));
        },
        scope: 'consulta-papeleta',
      }));
    }

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [hasSearched, registerCommand, speak, performSearch, resetSearch, showGuidance, showPhoto, reclamoOpen, pagoOpen, closeAllModals, t]);

  // AI click listener
  useEffect(() => {
    const RESULTS_ONLY = new Set(['pagar', 'reclamo', 'imprimir', 'descargar', 'show-photo', 'close-photo']);

    const handler = (e: Event) => {
      const { target } = (e as CustomEvent<{ target: string }>).detail;

      // Guide user: results-only actions need a search first
      if (!hasSearched && RESULTS_ONLY.has(target)) {
        speak(t('voice.searchRequired'));
        showGuidance(t('voice.searchRequiredGuidance'));
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
  }, [hasSearched, resetSearch, speak, showGuidance, closeAllModals, t]);

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
                      onChange={(e) => setSearchQuery(e.target.value)}
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
          </div>
          <div className="absolute bottom-8 text-center opacity-40">
             <p className="text-[10px] font-black uppercase tracking-[0.3em]">{t("platform.consultation.satFooter")}</p>
          </div>
        </main>
      )}

      {/* Results State */}
      {hasSearched && (
        <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,#e2f1ff_0,transparent_34%),linear-gradient(180deg,#fbfdff,#f3f7fb)] p-4 md:p-8">
          <div className="mx-auto max-w-6xl pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              <LanguageSelector />
            </div>

            <section className="mb-5 grid gap-5 lg:grid-cols-[1fr_minmax(320px,420px)] lg:items-end">
              <div>
                <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-[#073b72] md:text-4xl">
                  {t("platform.consultation.trackingTitle")}
                </h1>
                <p className="mt-2.5 text-sm font-extrabold text-[#2f6da8]">
                  {t("platform.consultation.trackingDescription", { plate: papeletaActual.placa })}
                </p>
              </div>

              <form onSubmit={handleSearch} className="flex gap-2 rounded-[18px] border border-[#dbe7f4] bg-white/95 p-2 shadow-[0_16px_32px_rgba(15,45,82,.08)]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label={t("platform.consultation.ticketInputPlaceholder")}
                  placeholder={t("platform.consultation.ticketSearchPlaceholder")}
                  className="min-w-0 flex-1 rounded-xl border-0 bg-[#f8fbff] px-4 font-black uppercase text-[#073b72] outline-none placeholder:text-slate-400"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading} className="rounded-xl bg-platform-blue font-black text-white hover:bg-platform-blue/90">
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : t("platform.consultation.searchAnother")}
                </Button>
              </form>
            </section>

            <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <article className="flex min-h-[72px] flex-col justify-center rounded-[18px] border border-slate-200 bg-white/95 p-4 shadow-[0_12px_26px_rgba(15,45,82,.06)]">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{t("platform.consultation.ticketNumber")}</p>
                <p className="text-2xl font-black leading-none text-[#073b72]">{papeletaActual.nro}</p>
              </article>
              <article className="group relative flex min-h-[72px] flex-col justify-center overflow-hidden rounded-[18px] border border-slate-200 bg-white/95 p-4 shadow-[0_12px_26px_rgba(15,45,82,.06)]">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{t("platform.consultation.vehiclePlate")}</p>
                <p className="text-2xl font-black leading-none text-[#073b72]">{papeletaActual.placa}</p>
                <Eye className="absolute -right-2 -bottom-2 size-16 rotate-12 text-platform-blue opacity-[0.04] transition-opacity group-hover:opacity-10" />
              </article>
              <article className="flex min-h-[72px] flex-col justify-center rounded-[18px] border border-slate-200 bg-white/95 p-4 shadow-[0_12px_26px_rgba(15,45,82,.06)]">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{t("platform.consultation.originalAmount")}</p>
                <p className="text-2xl font-black leading-none text-[#073b72]">S/ {papeletaActual.importe}</p>
              </article>
              <article className="relative flex min-h-[72px] flex-col justify-center overflow-hidden rounded-[18px] border border-green-300 bg-gradient-to-br from-green-50 to-white p-4 shadow-[0_12px_26px_rgba(15,45,82,.06)] after:absolute after:right-3 after:top-3 after:rounded-full after:border after:border-green-200 after:bg-green-100 after:px-2.5 after:py-1 after:text-[11px] after:font-black after:text-green-700 after:content-['83%']">
                <p className="mb-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-green-700">{t("platform.consultation.totalToPay")}</p>
                <p className="text-3xl font-black leading-none text-green-600">S/ {papeletaActual.deuda}</p>
                <p className="mt-1.5 text-[11px] font-bold text-green-700/80">{t("platform.consultation.savingToday", { amount: papeletaActual.descuento })}</p>
              </article>
            </section>

            <section className="mb-5 flex flex-col gap-4 rounded-[22px] border border-slate-200 border-l-4 border-l-platform-blue bg-white p-5 shadow-[0_14px_30px_rgba(15,45,82,.06)] sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">{t("platform.consultation.infractionReason")}</span>
                  <strong className="rounded-full bg-[#073b72] px-3 py-1 text-xs font-black text-white">{papeletaActual.falta}</strong>
                </div>
                <p className="text-sm font-semibold leading-relaxed text-slate-600">{t("platform.consultation.infractionG40Description")}</p>
              </div>
              <Button variant="outline" onClick={() => setShowPhoto(true)} className="shrink-0 border-platform-blue font-black text-platform-blue hover:bg-blue-50">
                <Eye className="size-4" /> {t("platform.consultation.viewEvidence")}
              </Button>
            </section>

            <section className="overflow-hidden rounded-[30px] border border-[#dde8f3] bg-white shadow-[0_24px_60px_rgba(18,50,86,.12)]">
              <div className="flex flex-col gap-4 bg-gradient-to-r from-platform-blue to-[#2469ad] px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-3 text-lg font-black uppercase tracking-widest">
                  <ArrowRight className="size-5 text-blue-200" /> {t("platform.consultation.procedureRoute")}
                </h2>
                <div className="flex flex-wrap justify-end gap-2 text-[11px] font-black">
                  <span className="rounded-full border border-blue-100 bg-white px-3 py-2 text-platform-blue shadow-sm">{t("platform.consultation.activeStage")}: {t("platform.consultation.timeline.pas.notification.title")}</span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 shadow-sm">{t("platform.consultation.due")}: {t("platform.consultation.deadlineDateShort")}</span>
                </div>
              </div>

              <div className="grid gap-6 p-5 md:p-8 lg:p-10">
                <section className="grid gap-5 rounded-[26px] border border-dashed border-[#bad1ea] bg-gradient-to-br from-[#f8fbff] to-white p-6 lg:grid-cols-[64px_1fr_auto] lg:items-center">
                  <div className="flex size-16 items-center justify-center rounded-[20px] bg-platform-blue text-white shadow-[0_16px_28px_rgba(23,79,143,.22)]">
                    <AlertTriangle className="size-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-[#073b72]">{t("platform.consultation.requiredAction")}</h3>
                    <p className="text-sm font-medium leading-relaxed text-slate-600">
                      {t("platform.consultation.requiredActionDescription", { date: t("platform.consultation.requiredActionDate"), discount: "83%" })}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[204px] lg:grid-cols-1">
                    <Button ref={payButtonRef} onClick={() => setPagoOpen(true)} className="h-auto rounded-xl bg-platform-blue px-6 py-4 text-base font-black shadow-[0_14px_26px_rgba(23,79,143,.24)] hover:-translate-y-0.5 hover:bg-platform-blue/90">
                      {t("platform.consultation.payNow")} <ArrowRight className="ml-2 size-5" />
                    </Button>
                    <Button ref={reclamoButtonRef} variant="outline" onClick={() => setReclamoOpen(true)} className="h-auto rounded-xl border-platform-blue bg-white px-6 py-4 font-black text-platform-blue hover:-translate-y-0.5 hover:bg-blue-50">
                      {t("platform.consultation.submitClaim")}
                    </Button>
                  </div>
                </section>

                <div className="flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-extrabold text-platform-blue">
                  <MousePointer2 className="size-4" />
                  {t("platform.consultation.hoverHint")}
                </div>

                <section className="relative overflow-visible rounded-[30px] border border-[#dce8f4] bg-[linear-gradient(90deg,rgba(18,183,106,.08)_0_70%,rgba(245,158,11,.11)_70%_100%),linear-gradient(180deg,#ffffff,#f8fbff)] p-6 shadow-[0_20px_48px_rgba(15,45,82,.08)] before:absolute before:inset-x-0 before:top-0 before:h-1.5 before:rounded-t-[30px] before:bg-[linear-gradient(90deg,#12b76a_0_42%,#174f8f_42%_48%,#dbe6f2_48%_70%,#f59e0b_70%_100%)]">
                  <div className="mb-5">
                    <h3 className="text-sm font-black uppercase tracking-[0.13em] text-[#073b72]">{t("platform.consultation.procedureProgress")}</h3>
                  </div>

                  <div className="mb-5 hidden grid-cols-[70%_30%] text-center md:grid">
                    <span className="mx-auto rounded-full bg-green-100 px-6 py-2 text-[11px] font-black uppercase tracking-[0.26em] text-green-700 shadow-sm">{t("platform.consultation.timeline.pasLabel")}</span>
                    <span className="mx-auto rounded-full bg-orange-100 px-6 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-orange-700 shadow-sm">{t("platform.consultation.timeline.pecLabel")}</span>
                  </div>

                  <div className="relative flex overflow-x-auto pb-28 pt-2 md:overflow-visible md:pb-8" aria-label={t("platform.consultation.procedureRoute")}>
                    {[...pasosPAS, ...pasosPEC].map((paso, idx, steps) => (
                      <div key={paso.id} className="flex min-w-[120px] flex-1 items-start">
                        <div tabIndex={0} className="group relative z-10 flex min-w-[98px] flex-col items-center text-center outline-none">
                          <div className={cn(
                            "flex size-16 items-center justify-center rounded-[22px] border-2 text-xl font-black shadow-[0_10px_22px_rgba(15,45,82,.08)] transition-all duration-200 group-hover:-translate-y-1.5 group-hover:scale-105 group-focus:-translate-y-1.5 group-focus:scale-105",
                            paso.status === "completed" && "border-green-500 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-green-200",
                            paso.status === "current" && "-mt-1 size-[74px] rounded-[26px] border-white bg-gradient-to-br from-[#073b72] to-[#1f6db8] text-white shadow-[0_0_0_8px_rgba(23,79,143,.10),0_18px_30px_rgba(23,79,143,.28)]",
                            paso.status === "upcoming" && paso.id >= 5 && "border-orange-200 bg-orange-50 text-orange-700",
                            paso.status === "upcoming" && paso.id < 5 && "border-slate-200 bg-white text-slate-400"
                          )}>
                            {paso.status === "completed" ? <CheckCircle2 className="size-7" /> : idx + 1}
                          </div>
                          <p className={cn("mt-3 max-w-[112px] text-xs font-black leading-tight", paso.status === "current" ? "text-[#073b72]" : "text-slate-500")}>{paso.title}</p>
                          <small className={cn(
                            "mt-2.5 rounded-full px-2.5 py-1.5 text-[10px] font-black uppercase whitespace-nowrap",
                            paso.status === "completed" && "bg-green-100 text-green-700",
                            paso.status === "current" && "bg-blue-100 text-blue-700",
                            paso.status === "upcoming" && paso.id >= 5 && "bg-orange-50 text-orange-700",
                            paso.status === "upcoming" && paso.id < 5 && "bg-slate-100 text-slate-500"
                          )}>{paso.deadline}</small>

                          <div className="pointer-events-none absolute left-1/2 top-[116px] z-30 w-56 -translate-x-1/2 translate-y-2 rounded-[18px] border border-[#dbe6f2] bg-white p-3.5 text-left opacity-0 shadow-[0_18px_42px_rgba(15,45,82,.16)] transition-all duration-200 before:absolute before:left-1/2 before:-top-2 before:size-4 before:-translate-x-1/2 before:rotate-45 before:border-l before:border-t before:border-[#dbe6f2] before:bg-white before:content-[''] group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                            <strong className="mb-1.5 block text-sm font-black text-[#073b72]">{paso.title}</strong>
                            <p className="m-0 text-xs font-medium leading-relaxed text-slate-600">{paso.desc}</p>
                          </div>
                        </div>

                        {idx < steps.length - 1 && (
                          <div className={cn(
                            "relative mt-7 h-2.5 min-w-9 flex-1 overflow-hidden rounded-full bg-slate-200 shadow-inner",
                            paso.status === "completed" && steps[idx + 1]?.status === "completed" && "bg-gradient-to-r from-green-500 to-green-400",
                            paso.status === "completed" && steps[idx + 1]?.status === "current" && "bg-gradient-to-r from-green-500 via-green-300 to-platform-blue after:absolute after:inset-0 after:-translate-x-full after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent)] after:content-['']",
                            idx >= 4 && "bg-gradient-to-r from-orange-200 to-orange-400"
                          )} />
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(320px,.85fr)_minmax(0,1.15fr)]">
                  <article className="rounded-[26px] bg-gradient-to-br from-[#073b72] to-platform-blue p-7 text-white shadow-[0_24px_45px_rgba(23,79,143,.22)]">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-white/70">{t("platform.consultation.youAreHere")}</p>
                    <h3 className="mb-3 text-3xl font-black">{t("platform.consultation.timeline.pas.notification.title")}</h3>
                    <p className="mb-5 text-sm font-medium leading-relaxed text-blue-100">{t("platform.consultation.currentStageDescription")}</p>
                    <div className="mb-5 flex justify-between gap-4 rounded-[18px] border border-white/20 bg-white/10 p-4">
                      <div>
                        <small className="text-white/70">{t("platform.consultation.deadline")}</small>
                        <strong className="block text-2xl">{t("platform.consultation.deadlineDateShort")}</strong>
                      </div>
                      <div>
                        <small className="text-white/70">{t("platform.consultation.discount")}</small>
                        <strong className="block text-2xl">83%</strong>
                      </div>
                    </div>
                    <Button onClick={() => toast.info(t("platform.consultation.comingSoon"))} className="w-full bg-white font-black text-platform-blue hover:bg-blue-50">
                      {t("platform.consultation.viewNextSteps")}
                    </Button>
                  </article>

                  <article className="rounded-[26px] border border-[#dce8f4] bg-white p-5 shadow-[0_18px_38px_rgba(15,45,82,.08)]">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-[#073b72]">{t("platform.consultation.caseDocuments")}</h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{t("platform.consultation.caseDocumentsDescription")}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-2 text-[11px] font-black text-platform-blue">{t("platform.consultation.swipe")}</span>
                    </div>

                    <div className="grid auto-cols-[minmax(240px,42%)] grid-flow-col gap-4 overflow-x-auto pb-3">
                      <button onClick={() => setShowPhoto(true)} className="group relative min-h-[330px] overflow-hidden rounded-[22px] border border-[#dce8f4] bg-slate-50 text-left shadow-[0_14px_28px_rgba(15,45,82,.08)]">
                        <img src={infractionImage} alt={t("platform.consultation.evidenceAlt")} className="h-full w-full object-cover object-top transition-transform group-hover:scale-105" />
                        <span className="absolute inset-x-4 bottom-4 grid gap-1 rounded-2xl bg-[#073b72]/95 p-4 text-white">
                          <strong className="text-sm font-black">{t("platform.consultation.originalTicket")}</strong>
                          <small className="text-xs opacity-80">{t("platform.consultation.clickToExpand")}</small>
                        </span>
                      </button>

                      <article className="relative flex min-h-[330px] flex-col justify-end gap-2 rounded-[22px] border border-[#dce8f4] bg-[radial-gradient(circle_at_30%_18%,rgba(23,79,143,.18),transparent_34%),linear-gradient(145deg,#ffffff,#eef6ff)] p-6 shadow-[0_14px_28px_rgba(15,45,82,.08)]">
                        <div className="absolute left-6 top-6 grid size-14 place-items-center rounded-[20px] bg-white text-platform-blue shadow-[0_12px_24px_rgba(15,45,82,.10)]"><FileText className="size-7" /></div>
                        <strong className="text-sm font-black text-[#073b72]">{t("platform.consultation.adminReport")}</strong>
                        <small className="text-xs font-semibold text-slate-500">{t("platform.consultation.availableWhenIssued")}</small>
                      </article>

                      <article className="relative flex min-h-[330px] flex-col justify-end gap-2 rounded-[22px] border border-[#dce8f4] bg-[radial-gradient(circle_at_30%_18%,rgba(255,179,92,.25),transparent_34%),linear-gradient(145deg,#ffffff,#fff5e8)] p-6 shadow-[0_14px_28px_rgba(15,45,82,.08)]">
                        <div className="absolute left-6 top-6 grid size-14 place-items-center rounded-[20px] bg-white text-orange-500 shadow-[0_12px_24px_rgba(15,45,82,.10)]"><Camera className="size-7" /></div>
                        <strong className="text-sm font-black text-[#073b72]">{t("platform.consultation.photoEvidence")}</strong>
                        <small className="text-xs font-semibold text-slate-500">{t("platform.consultation.addedIfApplies")}</small>
                      </article>
                    </div>
                  </article>
                </section>
              </div>
            </section>

            <div className="mt-12 text-center max-w-2xl mx-auto space-y-4"><p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em]">SAT 2026</p></div>
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
                      {t("platform.consultation.infractionG40Description")}
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
    </div>
  );
}
