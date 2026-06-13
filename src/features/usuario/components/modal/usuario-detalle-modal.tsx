import { ModalContainer } from "@/shared/components/modal/modalContainer";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usuarioService } from "@/shared/services/usuario.service";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";



interface UsuarioDetalleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    usuarioId: string | null
}

export function UsuarioDetalleModal({
    open, onOpenChange, usuarioId
}: UsuarioDetalleModalProps) {
    const { data: usuarioDetalle, isLoading } = useQuery({
        queryKey: ["usuario", "detalle", usuarioId],
        queryFn: () => usuarioService.getById(usuarioId!),
        enabled: !!usuarioId && open,
    });
    return (
        <ModalContainer
            open={open}
            onOpenChange={onOpenChange}
            title="Visualizar Usuario"
            description=""
            className="sm:max-w-3xl"
        >
            {isLoading && (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            )}
            {!isLoading && usuarioDetalle && (
                // Fondo ligeramente gris para que las tarjetas blancas resalten
                <div className="flex flex-col gap-6 -mx-2 p-2">

                    {/* --- TARJETA 1: DATOS PERSONALES --- */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-5">

                        {/* Fila 1: Documento */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-slate-600 font-normal">Tipo documento</Label>
                                <Input
                                    readOnly
                                    value={usuarioDetalle.tipoDocumento || ""}
                                    className="bg-slate-50 text-slate-700 font-medium cursor-default focus-visible:ring-0"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-slate-600 font-normal">Número de documento</Label>
                                <Input
                                    readOnly
                                    value={usuarioDetalle.numeroDocumento || ""}
                                    className="bg-slate-50 text-slate-700 font-medium cursor-default focus-visible:ring-0"
                                />
                            </div>
                        </div>

                        {/* Fila 2: Nombre Completo (Ocupa todo el ancho) */}
                        <div className="flex flex-col gap-2">
                            <Label className="text-slate-600 font-normal">Nombre Completo</Label>
                            <Input
                                readOnly
                                value={usuarioDetalle.nombreCompleto || ""}
                                className="bg-slate-50 text-slate-700 font-medium cursor-default focus-visible:ring-0"
                            />
                        </div>

                        {/* Fila 3: Contacto */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-slate-600 font-normal">Correo electrónico</Label>
                                <Input
                                    readOnly
                                    value={usuarioDetalle.correo || "Correo electrónico no encontrado"}
                                    className="bg-slate-50 text-slate-700 font-medium cursor-default focus-visible:ring-0"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-slate-600 font-normal">Teléfono</Label>
                                <Input
                                    readOnly
                                    value={usuarioDetalle.telefono || "Teléfono no encontrado"}
                                    className="bg-slate-50 text-slate-700 font-medium cursor-default focus-visible:ring-0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* --- TARJETA 2: DATOS DEL SISTEMA --- */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-slate-600 font-normal">Usuario</Label>
                            <Input
                                readOnly
                                value={usuarioDetalle.usuario || ""}
                                className="bg-slate-50 text-slate-700 font-medium cursor-default focus-visible:ring-0"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-slate-600 font-normal">Rol</Label>
                            <Input
                                readOnly
                                value={usuarioDetalle.rol || ""}
                                className="bg-slate-50 text-slate-700 font-medium cursor-default focus-visible:ring-0"
                            />
                        </div>
                    </div>

                </div>
            )}

        </ModalContainer>
    );
}