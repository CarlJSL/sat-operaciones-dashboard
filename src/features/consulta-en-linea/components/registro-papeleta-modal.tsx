import { useState, useRef, type ChangeEvent } from "react";
import { Camera, CheckCircle2, Upload, Loader2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useTranslation } from "react-i18next";

interface RegistroPapeletaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistroSuccess: () => void;
}

export function RegistroPapeletaModal({
  open,
  onOpenChange,
  onRegistroSuccess,
}: RegistroPapeletaModalProps) {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nroPapeleta, setNroPapeleta] = useState("");
  const [placa, setPlaca] = useState("");
  const [infraccion, setInfraccion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setSubmitted(false);
    setIsSubmitting(false);
    setNroPapeleta("");
    setPlaca("");
    setInfraccion("");
    setArchivo(null);
    setErrores({});
  };

  const limpiarError = (campo: string) => {
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = (): boolean => {
    const nuevos: Record<string, string> = {};

    if (!nroPapeleta.trim()) nuevos.nroPapeleta = t("platform.consultation.earlyRegistration.validation.ticketRequired");
    else if (nroPapeleta.trim().length < 6) nuevos.nroPapeleta = t("platform.consultation.earlyRegistration.validation.ticketMinLength");

    if (!placa.trim()) nuevos.placa = t("platform.consultation.earlyRegistration.validation.plateRequired");

    if (!infraccion) nuevos.infraccion = t("platform.consultation.earlyRegistration.validation.infractionRequired");

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const handleViewTracking = () => {
    resetForm();
    onOpenChange(false);
    onRegistroSuccess();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setArchivo(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent
        className={`w-[95vw] sm:max-w-md overflow-x-hidden overflow-y-auto max-h-[90vh] p-6 ${submitted ? "[&>button.absolute]:hidden" : ""}`}
        onInteractOutside={submitted ? (e) => e.preventDefault() : undefined}
      >
        {submitted ? (
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="flex size-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-7 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-bold text-green-800 mt-4 mb-6 text-center">
              {t("platform.consultation.earlyRegistration.successTitle")}
            </h2>
            <Button
              onClick={handleViewTracking}
              className="w-full bg-platform-blue hover:bg-platform-blue/90 py-6 h-auto text-base font-semibold gap-2"
            >
              {t("platform.consultation.earlyRegistration.viewTracking")}
              <ArrowRight className="size-5" />
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="gap-2 pt-1">
              <DialogTitle className="text-lg font-bold">
                {t("platform.consultation.earlyRegistration.title")}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {t("platform.consultation.earlyRegistration.description")}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup className="mt-3 gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>
                    {t("platform.consultation.earlyRegistration.ticketNumber")}{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    placeholder={t("platform.consultation.earlyRegistration.ticketPlaceholder")}
                    value={nroPapeleta}
                    onChange={(e) => {
                      setNroPapeleta(e.target.value);
                      limpiarError("nroPapeleta");
                    }}
                    className="mt-1.5"
                    aria-invalid={!!errores.nroPapeleta}
                  />
                  {errores.nroPapeleta && (
                    <FieldDescription className="text-destructive mt-1 font-medium">
                      {errores.nroPapeleta}
                    </FieldDescription>
                  )}
                </Field>
                <Field>
                  <FieldLabel>
                    {t("platform.consultation.earlyRegistration.plate")}{" "}
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    placeholder={t("platform.consultation.earlyRegistration.platePlaceholder")}
                    value={placa}
                    onChange={(e) => {
                      setPlaca(e.target.value);
                      limpiarError("placa");
                    }}
                    className="mt-1.5"
                    aria-invalid={!!errores.placa}
                  />
                  {errores.placa && (
                    <FieldDescription className="text-destructive mt-1 font-medium">
                      {errores.placa}
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel>
                  {t("platform.consultation.earlyRegistration.infractionCode")}{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <Select value={infraccion} onValueChange={(val) => {
                  setInfraccion(val);
                  limpiarError("infraccion");
                }}>
                  <SelectTrigger className="w-full mt-1.5" aria-invalid={!!errores.infraccion}>
                    <SelectValue placeholder={t("platform.consultation.earlyRegistration.infractionPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(["M20", "G47", "M17", "G57", "G01", "L01"] as const).map((key) => (
                      <SelectItem key={key} value={key}>
                        {t(`platform.consultation.earlyRegistration.infractions.${key}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errores.infraccion && (
                  <FieldDescription className="text-destructive mt-1 font-medium">
                    {errores.infraccion}
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <input
                  ref={fileInputRef}
                  id="foto-papeleta"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-platform-blue/30 bg-slate-50 px-4 py-10 text-sm text-muted-foreground transition-colors hover:border-platform-blue/60 hover:bg-blue-50/40"
                >
                  {archivo ? (
                    <>
                      <Upload className="size-6 text-platform-blue" aria-hidden="true" />
                      <span className="font-medium text-foreground">{archivo.name}</span>
                    </>
                  ) : (
                    <>
                      <Camera className="size-8 text-platform-blue" aria-hidden="true" />
                      <span className="text-sm font-medium text-platform-blue/80">
                        {t("platform.consultation.earlyRegistration.photoArea")}
                      </span>
                    </>
                  )}
                </button>
              </Field>
            </FieldGroup>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-platform-blue hover:bg-platform-blue/90 py-6 h-auto text-base font-semibold gap-2 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  {t("platform.consultation.claim.sending")}
                </>
              ) : (
                t("platform.consultation.earlyRegistration.submit")
              )}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
