export interface DiaInfo {
  id: string;
  label: string;
  matchKeys: string[];
}

/**
 * Catálogo de días de la semana con variantes de matching
 */
export const DIAS_SEMANA: DiaInfo[] = [
  { id: "L", label: "Lun", matchKeys: ["L", "LUN", "LUNES"] },
  { id: "M", label: "Mar", matchKeys: ["M", "MAR", "MARTES"] },
  { id: "X", label: "Mié", matchKeys: ["MI", "X", "MIE", "MIERCOLES"] },
  { id: "J", label: "Jue", matchKeys: ["J", "JUE", "JUEVES"] },
  { id: "V", label: "Vie", matchKeys: ["V", "VIE", "VIERNES"] },
  { id: "S", label: "Sáb", matchKeys: ["S", "SAB", "SABADO"] },
  { id: "D", label: "Dom", matchKeys: ["D", "DOM", "DOMINGO"] },
];

/**
 * Normaliza un string de día removiendo tildes y convirtiendo a mayúsculas
 */
export function normalizeDia(dia: string): string {
  if (!dia) return "";
  return dia
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

/**
 * Busca el detalle de un día en el arreglo de detalles
 */
export function findDetallePorDia(
  detalles: any[],
  diaInfo: DiaInfo
): any | undefined {
  return detalles.find((d) => {
    if (!d.dia) return false;
    const diaUpper = normalizeDia(d.dia);
    return diaInfo.matchKeys.includes(diaUpper);
  });
}
