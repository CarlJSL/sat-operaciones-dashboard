import type { Menu } from "@/domain/roles";

export const MOCK_MENU: Menu[] = [
  {
    menuRolId: "mock-operacion",
    icono: "ClipboardList",
    text: "Operaciones",
    title: "Gestión Operativa",
    children: [
      {
        menuRolId: "mock-operacion-revision",
        icono: "XCircle",
        text: "Revision",
        title: "En Revisión",
        to: "/operaciones/por-verificar",
      },
      {
        menuRolId: "mock-operacion-autorizar",
        icono: "XCircle",
        text: "Autorizar",
        title: "Por Autorizar",
        to: "/operaciones/autorizar",
      },
      {
        menuRolId: "mock-operacion-observados",
        icono: "XCircle",
        text: "Observador",
        title: "Observados",
        to: "/operaciones/observados",
      },
      {
        menuRolId: "mock-operacion-finalizados",
        icono: "XCircle",
        text: "Finalizados",
        title: "Finalizados",
        to: "/operaciones/finalizados",
      },
      {
        menuRolId: "mock-operacion-proceso",
        icono: "XCircle",
        text: "Proceso",
        title: "En Proceso",
        to: "/operaciones/proceso",
      },
      {
        menuRolId: "mock-operacion-cancelados",
        icono: "XCircle",
        text: "Cancelados",
        title: "Cancelados",
        to: "/operaciones/cancelados",
      },
    ],
  },
  {
    menuRolId: "mock-configuracion",
    icono: "Settings",
    text: "Configuración",
    title: "Configuración",
    children: [
      {
        menuRolId: "mock-configuracion-bancos",
        icono: "Building2",
        text: "Catálogo Bancos",
        title: "Catalogo",
        to: "/catalogo",
      },
      {
        menuRolId: "mock-configuracion-cuentas",
        icono: "CreditCard",
        text: "Cuentas Empresa",
        title: "Cuentas Bancarias",
        to: "/cuentas",
      },
    ],
  },
  {
    menuRolId: "mock-seguridad",
    icono: "ShieldCheck",
    text: "Seguridad",
    title: "Seguridad",
    children: [
      {
        menuRolId: "mock-seguridad-usuarios-cuentas",
        icono: "Users",
        text: "Usuarios y Clientes",
        title: "Usuarios",
        to: "/usuarios",
      },
      {
        menuRolId: "mock-seguridad-roles",
        icono: "Eye",
        text: "Roles y Permisos",
        title: "Roles",
        to: "/roles",
      },
    ],
  },
  {
    menuRolId: "mock-reportes",
    icono: "FileText",
    text: "Reportes",
    title: "Reportes",
    children: [
      {
        menuRolId: "mock-reportes-operaciones",
        icono: "DownloadCloud",
        text: "Exportar Operaciones",
        title: "Operaciones",
        to: "/reportes/operaciones",
      },
    ],
  },
  {
    menuRolId: "mock-usuario",
    icono: "Users",
    text: "Usuario",
    title: "Área Usuario",
    children: [
      {
        menuRolId: "mock-usuario-mis-operaciones",
        icono: "ClipboardList",
        text: "Mis Operaciones",
        title: "Mis Operaciones",
        to: "/mis-operaciones",
      },
      {
        menuRolId: "mock-usuario-crear-solicitud",
        icono: "PlusCircle",
        text: "Cotizar",
        title: "Cotizar",
        to: "/cotizador",
      },
    ],
  },
];
