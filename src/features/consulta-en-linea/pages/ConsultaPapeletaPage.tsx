import { Search, Printer, Edit2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ConsultaPapeletaPage() {
  const tabs = [
    { label: "Consulta de papeletas", active: true },
    { label: "Registra y paga tu papeleta", active: false },
    { label: "Consulta de papeletas enviadas al MTC", active: false },
    { label: "Consulta de Multas Administrativas", active: false },
  ];

  const data = [
    {
      index: 1,
      placa: "A1G359",
      reglamento: "RNT",
      falta: "G40",
      documento: "CP00155801",
      fecha: "27/12/2025",
      importe: "880.00",
      gastos: "0.00",
      descuento: "730.40",
      deuda: "149.60",
      estado: "Pendiente",
      licencia: "Q44829858",
      tipoDoc: "DNI/LE",
      nroDoc: "44829858",
      compromiso: "",
    },
  ];

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
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
            <BreadcrumbPage>Consulta por DNI</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`whitespace-nowrap rounded-full border px-6 py-2 text-sm font-medium transition-colors ${
              tab.active
                ? "border-platform-blue text-platform-blue ring-1 ring-platform-blue"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-platform-blue md:text-2xl">
            CONSULTA DE PAPELETAS
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            En esta sección se muestran las papeletas pendientes de pago que administra el Servicio de Administración Tributaria.
          </p>
        </div>

        {/* Discount Banner */}
        <div className="rounded-lg bg-green-100 p-4 text-center">
          <p className="text-lg font-semibold text-green-800">
            Ud. tiene papeleta(s) con descuento.
          </p>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700">Filtrar por papeleta</label>
          <div className="flex max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar Papeleta"
                className="pr-10 focus-visible:ring-platform-blue"
              />
            </div>
          </div>
        </div>

        {/* Table Actions */}
        <div className="flex justify-end">
          <Button variant="default" className="bg-[#0072CE] hover:bg-[#005ea8]">
            Imprimir
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader className="bg-platform-blue hover:bg-platform-blue">
              <TableRow className="hover:bg-platform-blue">
                <TableHead className="text-white">1/</TableHead>
                <TableHead className="text-white">Placa</TableHead>
                <TableHead className="text-white">Reglamento</TableHead>
                <TableHead className="text-white">Falta</TableHead>
                <TableHead className="text-white">Nº Documento/Código de pago</TableHead>
                <TableHead className="text-white">Fecha Infracción/Fecha Emisión</TableHead>
                <TableHead className="text-white">Importe</TableHead>
                <TableHead className="text-white">Gastos/Costas</TableHead>
                <TableHead className="text-white">Descuento</TableHead>
                <TableHead className="text-white">Deuda</TableHead>
                <TableHead className="text-white">Estado</TableHead>
                <TableHead className="text-white">Licencia de Conducir</TableHead>
                <TableHead className="text-white">Tipo Doc. Iden.</TableHead>
                <TableHead className="text-white">Nº Doc. Identidad</TableHead>
                <TableHead className="text-white">Nº Compromiso de pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.documento}>
                  <TableCell>{row.index}</TableCell>
                  <TableCell>{row.placa}</TableCell>
                  <TableCell>{row.reglamento}</TableCell>
                  <TableCell>{row.falta}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {row.documento}
                      <Edit2 className="size-4 text-yellow-600 cursor-pointer" />
                    </div>
                  </TableCell>
                  <TableCell>{row.fecha}</TableCell>
                  <TableCell>{row.importe}</TableCell>
                  <TableCell>{row.gastos}</TableCell>
                  <TableCell className="bg-green-50">{row.descuento}</TableCell>
                  <TableCell className="bg-yellow-50">{row.deuda}</TableCell>
                  <TableCell>{row.estado}</TableCell>
                  <TableCell>{row.licencia}</TableCell>
                  <TableCell>{row.tipoDoc}</TableCell>
                  <TableCell>{row.nroDoc}</TableCell>
                  <TableCell>{row.compromiso}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Button variant="default" className="bg-[#0072CE] hover:bg-[#005ea8]">
          Pagos en línea
        </Button>

        {/* Footer info */}
        <div className="mt-8 space-y-4 text-xs text-zinc-500">
          <p>
            <sup>1/</sup> Número de placa asignada en aplicación de la R.D. Nº 4012- 2009- MTC/15 del 21.12.2009 y el D.S. Nº 043-2009 MTC del 18.12.2009.
          </p>
          <p>Fecha de consulta: {new Date().toLocaleDateString('es-PE')}</p>
          <p>
            En caso de requerir el Record de Conductor, realizar la consulta en el siguiente link del Ministerio de Transportes y Comunicaciones:{" "}
            <a
              href="http://slcp.mtc.gob.pe"
              target="_blank"
              rel="noopener noreferrer"
              className="text-platform-blue hover:underline inline-flex items-center gap-1"
            >
              http://slcp.mtc.gob.pe
              <ExternalLink className="size-3" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
