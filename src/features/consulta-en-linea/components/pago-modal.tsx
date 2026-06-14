import { useState, useCallback } from "react";
import { CheckCircle2, CreditCard, QrCode, Loader2, ArrowRight, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldDescription } from "@/components/ui/field";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

type PagoStep = 1 | 2 | 3;
type MetodoPago = "billetera" | "tarjeta";

interface PagoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  papeletaNro: string;
  monto: string;
}

interface FormErrors {
  nroTarjeta?: string;
  fechaVenc?: string;
  cvv?: string;
}

function generarOperacion(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `OP-${num}`;
}

function formatearFecha(): string {
  const now = new Date();
  return now.toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatearNumeroTarjeta(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 16);
  return digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatearFechaVenc(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 4);
}

export function PagoModal({
  open,
  onOpenChange,
  papeletaNro,
  monto,
}: PagoModalProps) {
  const [step, setStep] = useState<PagoStep>(1);
  const [metodo, setMetodo] = useState<MetodoPago>("billetera");
  const [nroTarjeta, setNroTarjeta] = useState("");
  const [fechaVenc, setFechaVenc] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [operacion, setOperacion] = useState("");
  const [fechaPago, setFechaPago] = useState("");

  const resetForm = useCallback(() => {
    setStep(1);
    setMetodo("billetera");
    setNroTarjeta("");
    setFechaVenc("");
    setCvv("");
    setErrors({});
    setOperacion("");
    setFechaPago("");
  }, []);

  const limpiarError = (campo: keyof FormErrors) => {
    if (errors[campo]) setErrors((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validarTarjeta = (): boolean => {
    const nuevos: FormErrors = {};
    const digitos = nroTarjeta.replace(/\s/g, "");

    if (!digitos) {
      nuevos.nroTarjeta = "Ingresa el número de tarjeta";
    } else if (!/^\d{16}$/.test(digitos)) {
      nuevos.nroTarjeta = "Debe tener 16 dígitos";
    }

    if (!fechaVenc.trim()) {
      nuevos.fechaVenc = "Ingresa la fecha de vencimiento";
    } else if (!/^\d{2}\/\d{2}$/.test(fechaVenc.trim())) {
      nuevos.fechaVenc = "Formato inválido (MM/AA)";
    } else {
      const mes = parseInt(fechaVenc.split("/")[0], 10);
      if (mes > 12) nuevos.fechaVenc = "El mes no puede ser mayor a 12";
    }

    if (!cvv.trim()) {
      nuevos.cvv = "Ingresa el CVV";
    } else if (!/^\d{3,4}$/.test(cvv.trim())) {
      nuevos.cvv = "Debe tener 3 o 4 dígitos";
    }

    setErrors(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handlePagar = () => {
    if (metodo === "tarjeta" && !validarTarjeta()) return;
    setStep(2);
    setTimeout(() => {
      setOperacion(generarOperacion());
      setFechaPago(formatearFecha());
      setStep(3);
    }, 2500);
  };

  const handleDescargarPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");

    const bluePrimary = [25, 64, 103];
    const greenSuccess = [22, 163, 74];
    const grayText = [100, 100, 100];
    const grayLabel = [150, 150, 150];
    const bgCard = [248, 250, 252];
    const drawColor = [226, 232, 240];

    doc.setFillColor(bluePrimary[0], bluePrimary[1], bluePrimary[2]);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("SAT LIMA", 20, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("CONSTANCIA OFICIAL DE REGULARIZACIÓN", 20, 23);

    const cardY = 38;
    const cardH = 80;

    doc.setDrawColor(drawColor[0], drawColor[1], drawColor[2]);
    doc.setFillColor(bgCard[0], bgCard[1], bgCard[2]);
    doc.roundedRect(20, cardY, 170, cardH, 3, 3, "FD");

    doc.setTextColor(bluePrimary[0], bluePrimary[1], bluePrimary[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumen de Operación", 28, cardY + 10);

    doc.setLineWidth(0.3);
    doc.line(28, cardY + 16, 182, cardY + 16);

    let yPos = cardY + 24;
    doc.setFontSize(10);

    const drawField = (label: string, value: string, y: number, customValueColor: number[] = [0, 0, 0]) => {
      doc.setTextColor(grayLabel[0], grayLabel[1], grayLabel[2]);
      doc.setFont("helvetica", "normal");
      doc.text(`${label}:`, 28, y);

      doc.setTextColor(customValueColor[0], customValueColor[1], customValueColor[2]);
      doc.setFont("helvetica", "bold");
      doc.text(value, 60, y);
    };

    drawField("Ciudadano", "Juan Pérez", yPos); yPos += 8;
    drawField("Documento", "DNI 12345678", yPos); yPos += 8;
    drawField("Operación", operacion || "OP-54910", yPos); yPos += 8;
    drawField("Fecha de Pago", fechaPago || new Date().toLocaleDateString("es-PE"), yPos); yPos += 8;

    doc.setTextColor(grayLabel[0], grayLabel[1], grayLabel[2]);
    doc.setFont("helvetica", "normal");
    doc.text("Papeleta:", 28, yPos);

    doc.setTextColor(greenSuccess[0], greenSuccess[1], greenSuccess[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`#${papeletaNro}`, 60, yPos);

    yPos += 11;

    doc.line(28, yPos - 3, 182, yPos - 3);

    doc.setTextColor(bluePrimary[0], bluePrimary[1], bluePrimary[2]);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Total Pagado", 28, yPos + 4);

    doc.setTextColor(greenSuccess[0], greenSuccess[1], greenSuccess[2]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`S/ ${monto}`, 182, yPos + 6, { align: "right" });

    doc.setTextColor(grayText[0], grayText[1], grayText[2]);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Este documento certifica la regularización de la infracción de tránsito.", 105, 125, { align: "center" });
    doc.text("Servicio de Administración Tributaria de Lima - SAT", 105, 130, { align: "center" });

    doc.save(`constancia_SAT_${papeletaNro}.pdf`);
  };

  const handleCerrar = () => {
    resetForm();
    onOpenChange(false);
    toast.success("Papeleta regularizada con éxito");
  };

  const bloqueado = step === 2;

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}
    >
      <DialogContent
        className="w-[95vw] sm:max-w-md overflow-x-hidden overflow-y-auto max-h-[90vh] p-6"
        showCloseButton={!bloqueado}
        onInteractOutside={bloqueado ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={bloqueado ? (e) => e.preventDefault() : undefined}
      >
        {/* ──── STEP 1: Checkout ──── */}
        {step === 1 && (
          <>
            <DialogHeader className="gap-3 pt-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Pago de Papeleta
                </p>
                <DialogTitle className="text-base font-bold text-foreground mt-0.5">
                  #{papeletaNro}
                </DialogTitle>
              </div>
              <div className="mx-auto mt-1 rounded-xl bg-platform-blue/5 px-8 py-4 text-center">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total a pagar
                </p>
                <p className="mt-0.5 text-3xl font-black text-platform-blue tracking-tight">
                  S/ {monto}
                </p>
              </div>
            </DialogHeader>

            <Tabs
              defaultValue="billetera"
              value={metodo}
              onValueChange={(v) => {
                setMetodo(v as MetodoPago);
                setErrors({});
              }}
              className="mt-2"
            >
              <TabsList className="w-full">
                <TabsTrigger value="billetera" className="flex-1 gap-2">
                  <QrCode className="size-4" />
                  Billetera Digital
                </TabsTrigger>
                <TabsTrigger value="tarjeta" className="flex-1 gap-2">
                  <CreditCard className="size-4" />
                  Tarjeta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="billetera" className="mt-5">
                <div className="relative flex flex-col items-center gap-5 rounded-2xl border bg-gradient-to-b from-blue-50/60 to-white p-6 shadow-sm">
                  <div className="relative flex size-44 items-center justify-center rounded-2xl bg-white shadow-lg shadow-blue-900/5">
                    <div className="absolute inset-0 rounded-2xl border-2 border-platform-blue/10" />
                    <div className="absolute -top-1.5 -left-1.5 size-6 rounded-tl-lg border-t-4 border-l-4 border-platform-blue/40" />
                    <div className="absolute -top-1.5 -right-1.5 size-6 rounded-tr-lg border-t-4 border-r-4 border-platform-blue/40" />
                    <div className="absolute -bottom-1.5 -left-1.5 size-6 rounded-bl-lg border-b-4 border-l-4 border-platform-blue/40" />
                    <div className="absolute -bottom-1.5 -right-1.5 size-6 rounded-br-lg border-b-4 border-r-4 border-platform-blue/40" />
                    <div className="flex flex-col items-center gap-0.5">
                      <QrCode className="size-28 text-platform-blue" />
                      <div className="flex items-center justify-center">
                        <div className="size-2.5 rounded-full bg-platform-blue animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
                      Abre la app de tu banco, escanea el código y confirma el
                      pago desde tu celular.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tarjeta" className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="nro-tarjeta">Número de tarjeta</Label>
                  <Input
                    id="nro-tarjeta"
                    placeholder="1234 5678 9012 3456"
                    value={nroTarjeta}
                    onChange={(e) => {
                      setNroTarjeta(formatearNumeroTarjeta(e.target.value));
                      limpiarError("nroTarjeta");
                    }}
                    maxLength={19}
                    className="mt-1.5"
                    aria-invalid={!!errors.nroTarjeta}
                  />
                  {errors.nroTarjeta && (
                    <FieldDescription className="text-destructive mt-1">
                      {errors.nroTarjeta}
                    </FieldDescription>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="fecha-venc">MM/AA</Label>
                    <Input
                      id="fecha-venc"
                      placeholder="12/28"
                      value={fechaVenc}
                      onChange={(e) => {
                        setFechaVenc(formatearFechaVenc(e.target.value));
                        limpiarError("fechaVenc");
                      }}
                      maxLength={5}
                      className="mt-1.5"
                      aria-invalid={!!errors.fechaVenc}
                    />
                    {errors.fechaVenc && (
                      <FieldDescription className="text-destructive mt-1">
                        {errors.fechaVenc}
                      </FieldDescription>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cvv}
                      onChange={(e) => {
                        setCvv(soloDigitos(e.target.value));
                        limpiarError("cvv");
                      }}
                      maxLength={4}
                      className="mt-1.5"
                      aria-invalid={!!errors.cvv}
                    />
                    {errors.cvv && (
                      <FieldDescription className="text-destructive mt-1">
                        {errors.cvv}
                      </FieldDescription>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                onClick={handlePagar}
                className="w-full bg-platform-blue hover:bg-platform-blue/90 py-6 h-auto text-base font-semibold gap-2"
              >
                Pagar ahora
                <ArrowRight className="size-5" />
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ──── STEP 2: Procesando ──── */}
        {step === 2 && (
          <div className="flex flex-col items-center justify-center gap-6 py-16">
            <Loader2 className="size-12 animate-spin text-platform-blue" />
            <div className="text-center">
              <p className="text-base font-semibold text-foreground">
                Procesando pago seguro...
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                No cierres esta ventana
              </p>
            </div>
          </div>
        )}

        {/* ──── STEP 3: Confirmación ──── */}
        {step === 3 && (
          <>
            <DialogHeader className="gap-4 pt-4 sm:items-center sm:text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="size-7 text-green-600" aria-hidden="true" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-green-800">
                  ¡Pago exitoso!
                </DialogTitle>
                <p className="mt-1 text-sm text-muted-foreground text-balance">
                  Tu papeleta ha sido regularizada.
                </p>
              </div>
            </DialogHeader>

            <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">N° de Operación</span>
                <span className="font-bold text-foreground">{operacion}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fecha</span>
                <span className="font-medium text-foreground">{fechaPago}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto</span>
                <span className="font-bold text-platform-blue">S/ {monto}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Papeleta</span>
                <span className="font-medium text-foreground">#{papeletaNro}</span>
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-row mt-2">
              <Button
                variant="outline"
                onClick={handleDescargarPDF}
                className="w-full sm:w-auto gap-2"
              >
                <Download className="size-4" />
                Descargar Constancia
              </Button>
              <Button
                onClick={handleCerrar}
                className="w-full sm:w-auto bg-platform-blue hover:bg-platform-blue/90"
              >
                Cerrar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
