import { useEffect, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parse } from "date-fns";
import { Calendar as CalendarIcon, Pencil } from "lucide-react";
import { cn } from "@/core/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { es } from "date-fns/locale";
import type { Frecuencia } from "@/domain/models/frecuencia";
import type { IComboItem } from "@/domain/models/config/combo";

// Elimina tildes/diacríticos para comparaciones robustas con la API
const normalizeStr = (str: string) =>
  str
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// Mapeo de iniciales a nombre completo
const diasNombres: Record<string, string> = {
  D: "domingo",
  L: "lunes",
  M: "martes",
  X: "miércoles",
  J: "jueves",
  V: "viernes",
  S: "sábado",
};

interface CustomRecurrencePickerProps {
  onSave?: (frecuencia: Frecuencia) => void;
  diaOptions: IComboItem[];
  initialValue?: Frecuencia | null;
  nombreActual?: string;
}

type RecurrenceFormState = {
  intervalo: number;
  frecuencia: string;
  diasSeleccionados: string[];
  tipoFin: string;
  fechaFin?: Date;
};

type RecurrenceFormAction =
  | { type: "set-all"; payload: RecurrenceFormState }
  | { type: "set-intervalo"; payload: number }
  | { type: "set-frecuencia"; payload: string }
  | { type: "set-dias"; payload: string[] }
  | { type: "set-tipo-fin"; payload: string }
  | { type: "set-fecha-fin"; payload?: Date };

const initialRecurrenceFormState: RecurrenceFormState = {
  intervalo: 1,
  frecuencia: "semana",
  diasSeleccionados: [],
  tipoFin: "nunca",
  fechaFin: undefined,
};

function recurrenceFormReducer(
  state: RecurrenceFormState,
  action: RecurrenceFormAction,
): RecurrenceFormState {
  switch (action.type) {
    case "set-all":
      return action.payload;
    case "set-intervalo":
      return { ...state, intervalo: action.payload };
    case "set-frecuencia":
      return { ...state, frecuencia: action.payload };
    case "set-dias":
      return { ...state, diasSeleccionados: action.payload };
    case "set-tipo-fin":
      return { ...state, tipoFin: action.payload };
    case "set-fecha-fin":
      return { ...state, fechaFin: action.payload };
    default:
      return state;
  }
}

export function CustomRecurrencePicker({
  onSave,
  diaOptions,
  initialValue,
}: CustomRecurrencePickerProps) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isEditMode = !!initialValue;
  const isLoading = false;

  const [formState, dispatch] = useReducer(
    recurrenceFormReducer,
    initialRecurrenceFormState,
  );
  const { intervalo, frecuencia, diasSeleccionados, tipoFin, fechaFin } =
    formState;

  // Carga los datos del servidor cuando abre el modal en modo editar
  useEffect(() => {
    if (!open) return;

    if (!initialValue) {
      dispatch({ type: "set-all", payload: initialRecurrenceFormState });
      return;
    }

    let nextState: RecurrenceFormState = {
      ...initialRecurrenceFormState,
      intervalo: initialValue.valor ?? 1,
    };

    // Detectar tipo de frecuencia según diaCodigos
    if (initialValue.diaCodigos?.length) {
      nextState.frecuencia = "semana";

      // Mapear códigos de día (ej: "DIA001") → iniciales del toggle (ej: "L")
      const iniciales = initialValue.diaCodigos.reduce<string[]>((acc: string[], codigo: string) => {
        const found = diaOptions.find((d) => d.codigo === codigo);
        if (!found?.nombre) return acc;

        // normalizeStr quita tildes para comparar correctamente "MIERCOLES" vs "MIÉRCOLES"
        const key = Object.entries(diasNombres).find(
          ([, v]) => normalizeStr(v) === normalizeStr(found.nombre || ""),
        )?.[0];

        if (key) {
          acc.push(key);
        }

        return acc;
      }, []);
      nextState.diasSeleccionados = iniciales;
    } else {
      nextState.frecuencia = "día";
      nextState.diasSeleccionados = [];
    }

    // Fecha fin
    if (initialValue.fechaFin) {
      try {
        const parsed = parse(
          initialValue.fechaFin.substring(0, 10),
          "yyyy-MM-dd",
          new Date(),
        );
        nextState = {
          ...nextState,
          fechaFin: parsed,
          tipoFin: "fecha",
        };
      } catch {
        nextState = {
          ...nextState,
          fechaFin: undefined,
          tipoFin: "nunca",
        };
      }
    } else {
      nextState = {
        ...nextState,
        fechaFin: undefined,
        tipoFin: "nunca",
      };
    }

    dispatch({ type: "set-all", payload: nextState });
  }, [open, initialValue, diaOptions]);

  // --- LÓGICA PARA EL TEXTO RESUMEN ---
  const generarTextoResumen = () => {
    let texto = `Cada ${intervalo > 1 ? `${intervalo} ` : ""}${frecuencia}${intervalo > 1 ? "s" : ""}`;

    if (frecuencia === "semana" && diasSeleccionados.length > 0) {
      const orden = ["D", "L", "M", "X", "J", "V", "S"];
      const diasOrdenados = [...diasSeleccionados].sort(
        (a, b) => orden.indexOf(a) - orden.indexOf(b),
      );
      const diasTexto = diasOrdenados.map((d) => diasNombres[d]).join(", ");
      texto += ` el ${diasTexto}`;
    }

    if (frecuencia === "mes") {
      const diaActual = new Date().getDate();
      texto += ` el día ${diaActual}`;
    }

    if (tipoFin === "fecha" && fechaFin)
      texto += `, hasta el ${format(fechaFin, "PPP", { locale: es })}`;

    return texto;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const diasFull = diasSeleccionados.map((d) =>
        diasNombres[d].toUpperCase(),
      );
      const extractedCodigos = diasFull.reduce<string[]>((acc, dayName) => {
        const found = diaOptions.find(
          (d) => normalizeStr(d.nombre || "") === normalizeStr(dayName),
        );

        if (found?.codigo) {
          acc.push(found.codigo);
        }

        return acc;
      }, []);

      const nombreGenerado = generarTextoResumen().toUpperCase();

      const extractedId =
        initialValue?.frecuenciaId ||
        (initialValue as Frecuencia & { id?: string })?.id ||
        "";

      const payload: Frecuencia = {
        frecuenciaId: extractedId,
        nombre: nombreGenerado,
        valor: intervalo,
        diaCodigos: frecuencia === "semana" ? extractedCodigos : [],
        fechaFin:
          tipoFin === "fecha" && fechaFin
            ? format(fechaFin, "yyyy-MM-dd'T'23:59:59")
            : "",
        frecuenciaCodigo: "FREC004",
        tipoCodigo: "FREC004",
        codigo: "FREC004",
      };

      onSave?.(payload);
      setOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* BOTÓN TRIGGER: muestra resumen si ya existe, o "Seleccione fecha" si es nuevo */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={
          isEditMode ? "Editar periodicidad" : "Seleccionar periodicidad"
        }
        title={isEditMode ? "Editar periodicidad" : "Seleccionar periodicidad"}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md border bg-slate-50/50 px-3 text-sm font-normal",
          "hover:bg-slate-100 transition-colors w-full sm:w-auto shrink-0",
          isEditMode ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {isEditMode ? (
          <Pencil className="w-4 h-4 shrink-0 text-primary" />
        ) : (
          <>
            <CalendarIcon className="w-4 h-4 shrink-0" />
            <span className="ml-2">Seleccione fecha</span>
          </>
        )}
      </button>

      {/* MODAL */}
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="w-[calc(100%-1rem)] max-h-[calc(100vh-1rem)] overflow-y-auto sm:max-w-106 bg-[#f0f4f8] border border-slate-300/80 shadow-2xl rounded-3xl justify-center p-4 sm:p-6"
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-normal text-slate-800">
            {isEditMode ? "Editar periodicidad" : "Periodicidad personalizada"}
          </DialogTitle>
          <DialogDescription className="hidden">
            Configura la periodicidad personalizada para esta pregunta.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 py-0.5">
            {/* 1. REPETIR CADA */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Label className="text-sm sm:text-base text-slate-600 font-normal">
                Repetir cada
              </Label>
              <Input
                type="number"
                min={1}
                value={intervalo}
                onChange={(e) =>
                  dispatch({
                    type: "set-intervalo",
                    payload: Number(e.target.value),
                  })
                }
                className="w-full sm:w-20 bg-slate-200/50 border-none text-center"
              />
              <Select
                value={frecuencia}
                onValueChange={(value) =>
                  dispatch({ type: "set-frecuencia", payload: value })
                }
              >
                <SelectTrigger className="w-full sm:w-30 bg-slate-200/50 border-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="día">día</SelectItem>
                  <SelectItem value="semana">semana</SelectItem>
                  <SelectItem value="mes">mes</SelectItem>
                  <SelectItem value="año">año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 2. SE REPITE EL (Solo visible si es semana) */}
            {frecuencia === "semana" && (
              <div className="space-y-3">
                <Label className="text-sm sm:text-base text-slate-600 font-normal">
                  Se repite el
                </Label>
                <ToggleGroup
                  type="multiple"
                  value={diasSeleccionados}
                  onValueChange={(value) =>
                    dispatch({ type: "set-dias", payload: value })
                  }
                  className="justify-start gap-1.5 sm:gap-2 flex-wrap"
                >
                  {["D", "L", "M", "X", "J", "V", "S"].map((dia) => (
                    <ToggleGroupItem
                      key={dia}
                      value={dia}
                      className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-slate-200/50 text-primary text-sm data-[state=on]:bg-primary data-[state=on]:text-white hover:bg-slate-300 transition-colors border-none cursor-pointer"
                    >
                      {dia}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
            )}

            {/* 3. TERMINA */}
            <div className="space-y-4">
              <Label className="text-sm sm:text-base font-normal">
                Termina
              </Label>
              <RadioGroup
                value={tipoFin}
                onValueChange={(value) =>
                  dispatch({ type: "set-tipo-fin", payload: value })
                }
                className="gap-3 sm:gap-4"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem
                    value="nunca"
                    id="nunca"
                    className="border-slate-400"
                  />
                  <Label htmlFor="nunca" className="font-normal text-slate-700">
                    Nunca
                  </Label>
                </div>

                <div className="flex items-center gap-3 sm:space-x-3">
                  <RadioGroupItem
                    value="fecha"
                    id="fecha"
                    className="border-slate-400"
                  />
                  <Label
                    htmlFor="fecha"
                    className="font-normal text-slate-700 whitespace-nowrap"
                  >
                    El
                  </Label>
                  <div className="ml-auto w-50">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-slate-200/50 border border-slate-300/70 min-h-10",
                            !fechaFin && "text-slate-500",
                          )}
                          disabled={tipoFin !== "fecha"}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {fechaFin
                              ? format(fechaFin, "PPP", { locale: es })
                              : "Seleccione..."}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={fechaFin}
                          onSelect={(value) =>
                            dispatch({ type: "set-fecha-fin", payload: value })
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* 4. FOOTER */}
        <DialogFooter className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving || isLoading}
            className="w-full sm:w-auto font-medium rounded-full px-6"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="w-full sm:w-auto rounded-full px-8 font-medium"
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
