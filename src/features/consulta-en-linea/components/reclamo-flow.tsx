import { useState, useRef, type ChangeEvent } from "react";
import { AlertTriangle, CheckCircle2, FileText, Upload, X, Scale, ShieldAlert, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { cn } from "@/core/lib/utils";
import { useTranslation, Trans } from "react-i18next";
import type { ReclamoMotivo } from "@/domain/models/reclamo";
import { MOTIVOS_RECLAMO } from "@/domain/models/reclamo";

const MAX_ARCHIVOS = 3;
const MAX_FILE_SIZE_MB = 5;

type ReclamoStep = 0 | 1 | 2;

interface ReclamoFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  papeletaNro: string;
  onIrPagar: () => void;
  onSeguimiento: () => void;
}

interface FormErrors {
  motivo?: string;
  descripcion?: string;
}

function generarExpediente(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `REC-2026-${num}`;
}

export function ReclamoFlow({
  open,
  onOpenChange,
  papeletaNro,
  onIrPagar,
  onSeguimiento,
}: ReclamoFlowProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<ReclamoStep>(0);
  const [motivo, setMotivo] = useState<ReclamoMotivo | "">("");
  const [descripcion, setDescripcion] = useState("");
  const [archivos, setArchivos] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [expediente, setExpediente] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setStep(0);
    setMotivo("");
    setDescripcion("");
    setArchivos([]);
    setErrors({});
    setExpediente("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleContinuar = () => {
    setStep(1);
  };

  const handleCancelarPagar = () => {
    resetForm();
    onOpenChange(false);
    onIrPagar();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const nuevos = Array.from(files);
    const disponibles = MAX_ARCHIVOS - archivos.length;
    const aAgregar = nuevos.slice(0, disponibles);

    setArchivos((prev) => [...prev, ...aAgregar]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number): string => {
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!motivo) newErrors.motivo = t("platform.consultation.claim.validation.reasonRequired");
    if (!descripcion.trim()) {
      newErrors.descripcion = t("platform.consultation.claim.validation.descriptionRequired");
    } else if (descripcion.trim().length < 10) {
      newErrors.descripcion = t("platform.consultation.claim.validation.descriptionMin");
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setExpediente(generarExpediente());
    setIsSubmitting(false);
    setStep(2);
  };

  const handleSeguimiento = () => {
    resetForm();
    onOpenChange(false);
    onSeguimiento();
  };

  const alLimite = archivos.length >= MAX_ARCHIVOS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "overflow-x-hidden overflow-y-auto max-h-[90vh]",
          step === 0 && "w-[95vw] sm:max-w-md p-6",
          step === 1 && "sm:max-w-md [&>button.absolute]:hidden",
          step === 2 && "sm:max-w-md",
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={step === 0 ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={step === 0 ? (e) => e.preventDefault() : undefined}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 cursor-pointer rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-0"
          aria-label={t("platform.consultation.claim.close")}
        >
          <X className="size-4" />
        </button>

        {/* ──── STEP 0: Advertencia ──── */}
        {step === 0 && (
          <>
            <DialogHeader className="gap-3 pt-2 sm:items-center sm:text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="size-6 text-amber-600" aria-hidden="true" />
              </div>
              <DialogTitle className="text-base font-bold">
                {t("platform.consultation.claim.beforeTitle")}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
                <ShieldAlert className="size-7 mx-auto text-destructive/70" aria-hidden="true" />
                <p className="text-xs font-semibold text-foreground mt-2">
                  {t("platform.consultation.claim.warningClaimTitle")}
                </p>
                <p className="text-xl font-extrabold text-foreground mt-1">
                  {t("platform.consultation.claim.warningClaimAmount")}
                </p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {t("platform.consultation.claim.warningClaimText")}
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                <CheckCircle2 className="size-7 mx-auto text-green-600" aria-hidden="true" />
                <p className="text-xs font-semibold text-foreground mt-2">
                  {t("platform.consultation.claim.warningPayTitle")}
                </p>
                <p className="text-2xl font-extrabold text-green-700 mt-1">
                  {t("platform.consultation.claim.warningPayAmount")}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">
                  {t("platform.consultation.claim.warningPayText")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full mt-3">
              <Button
                onClick={handleCancelarPagar}
                className="px-4 py-5 h-auto text-sm font-semibold w-full bg-platform-blue hover:bg-platform-blue/90 text-wrap"
              >
                {t("platform.consultation.claim.payWithDiscount")}
              </Button>
              <Button
                variant="outline"
                onClick={handleContinuar}
                className="px-4 py-5 h-auto text-sm font-semibold w-full text-muted-foreground text-wrap"
              >
                {t("platform.consultation.claim.continueClaim")}
              </Button>
            </div>
          </>
        )}

        {/* ──── STEP 1: Formulario ──── */}
        {step === 1 && (
          <>
            <div className="-mx-6 -mt-6 mb-5 flex items-center gap-3 rounded-t-lg bg-platform-blue px-6 py-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20">
                <Scale className="size-5 text-white" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-white">
                  {t("platform.consultation.claim.submitClaim")}
                </h2>
                <p className="text-xs text-blue-100">
                  {t("platform.consultation.claim.ticket")} <span className="font-medium">{papeletaNro}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white transition-colors"
              >
                {t("platform.consultation.claim.back")}
              </button>
            </div>

            <FieldGroup className="gap-5">
              {/* Motivo */}
              <Field data-invalid={!!errors.motivo}>
                <FieldLabel htmlFor="motivo-reclamo">
                  {t("platform.consultation.claim.reasonLabel")} <span className="text-destructive">*</span>
                </FieldLabel>
                <Select
                  value={motivo || undefined}
                  onValueChange={(val) => {
                    setMotivo(val as ReclamoMotivo);
                    if (errors.motivo) setErrors((prev) => ({ ...prev, motivo: undefined }));
                  }}
                >
                  <SelectTrigger
                    id="motivo-reclamo"
                    className="w-full"
                    aria-invalid={!!errors.motivo}
                  >
                    <SelectValue placeholder={t("platform.consultation.claim.reasonPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(MOTIVOS_RECLAMO) as ReclamoMotivo[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {t(`platform.consultation.claim.reasons.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.motivo && (
                  <FieldDescription className="text-destructive">
                    {errors.motivo}
                  </FieldDescription>
                )}
              </Field>

              {/* Descripción */}
              <Field data-invalid={!!errors.descripcion}>
                <FieldLabel htmlFor="descripcion-reclamo">
                  {t("platform.consultation.claim.descriptionLabel")} <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  id="descripcion-reclamo"
                  placeholder={t("platform.consultation.claim.descriptionPlaceholder")}
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: undefined }));
                  }}
                  aria-invalid={!!errors.descripcion}
                />
                {errors.descripcion && (
                  <FieldDescription className="text-destructive">
                    {errors.descripcion}
                  </FieldDescription>
                )}
              </Field>

              {/* Evidencia */}
              <Field>
                <FieldLabel>
                  {t("platform.consultation.claim.evidenceLabel")}{" "}
                  <span className="text-muted-foreground font-normal">
                    {t("platform.consultation.claim.evidenceHelp", { max: MAX_ARCHIVOS })}
                  </span>
                </FieldLabel>

                <input
                  ref={fileInputRef}
                  id="evidencia-reclamo"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label={t("platform.consultation.claim.evidenceAria")}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={alLimite}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-6 text-sm transition-colors",
                    alLimite
                      ? "border-muted bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                      : "border-muted-foreground/30 bg-background text-muted-foreground hover:border-platform-blue/50 hover:bg-blue-50/30 hover:text-platform-blue",
                  )}
                >
                  <Upload className="size-5" aria-hidden="true" />
                  {alLimite
                    ? t("platform.consultation.claim.fileLimitReached")
                    : t("platform.consultation.claim.uploadFiles")}
                </button>

                  {archivos.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {archivos.map((file, index) => (
                      <li
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 rounded-md border bg-muted/50 px-4 py-2.5 text-sm min-w-0"
                      >
                        <FileText className="size-5 shrink-0 text-platform-blue" aria-hidden="true" />
                        <span className="flex-1 truncate font-medium text-foreground min-w-0">
                          {file.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatSize(file.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={t("platform.consultation.claim.removeFile", { file: file.name })}
                        >
                          <X className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <FieldDescription>
                  {t("platform.consultation.claim.formatsHelp", { max: MAX_FILE_SIZE_MB })}
                </FieldDescription>
              </Field>
            </FieldGroup>

            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3 w-full">
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                {t("platform.consultation.claim.cancel")}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-platform-blue hover:bg-platform-blue/90 px-8"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {t("platform.consultation.claim.sending")}
                  </>
                ) : (
                  t("platform.consultation.claim.sendClaim")
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ──── STEP 2: Confirmación ──── */}
        {step === 2 && (
          <>
            <DialogHeader className="gap-4 pt-4 sm:items-center sm:text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="size-7 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-green-800">
                  {t("platform.consultation.claim.successTitle")}
                </DialogTitle>
                <DialogDescription className="mt-1.5 text-sm text-balance">
                  {t("platform.consultation.claim.successDescription")}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="rounded-xl border bg-muted/30 p-5 text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t("platform.consultation.claim.caseNumber")}
              </p>
              <p className="mt-1 text-2xl font-bold text-platform-blue break-all">
                {expediente}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {t("platform.consultation.claim.ticket")} <span className="font-semibold">{papeletaNro}</span>
              </p>
            </div>

            <div className="flex items-start gap-3 rounded-lg bg-blue-50 px-4 py-3.5">
              <FileText className="mt-0.5 size-5 shrink-0 text-platform-blue" aria-hidden="true" />
              <div className="text-sm text-blue-800 text-balance">
                <p className="font-medium">{t("platform.consultation.claim.nextTitle")}</p>
                <p className="mt-1 leading-relaxed">
                  {t("platform.consultation.claim.nextDescription", { section: t("platform.consultation.trackingTitle") })}
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-center">
              <Button
                onClick={handleSeguimiento}
                className="bg-platform-blue hover:bg-platform-blue/90 px-10 py-6 h-auto text-base font-semibold w-full sm:w-auto"
              >
                {t("platform.consultation.claim.goToTracking")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
