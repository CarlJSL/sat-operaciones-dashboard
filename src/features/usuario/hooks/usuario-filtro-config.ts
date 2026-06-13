import { useMemo } from 'react';
import type { FilterFieldConfig } from '@/shared/types/filter.types';
import type { UsuarioCombo } from '@/domain/models/usuario'; // Tipado de tu init
// Lo volvemos un Hook de React que recibe el resultado de init()
export const useUsuarioFiltrosConfig = (combos?: UsuarioCombo): FilterFieldConfig[] => {

    return useMemo(() => [
        {
            id: 'name',
            label: 'Nombre completo',
            type: 'text',
            placeholder: 'Ej. Pedro Duarte',
        },
        {
            id: 'numeroDocumento',
            label: 'Número de Documento',
            type: 'text',
            placeholder: 'Ingrese el número de documento',
        },
        {
            id: 'estado',
            label: 'Estado de cuenta',
            type: 'select',
            placeholder: 'Selecciona un estado',
            options: combos?.estados?.list.map((item: any) => ({
                label: item.nombre,
                value: item.codigo
            })) ?? [],
        },
        {
            id: 'rol',
            label: 'Rol de Usuario',
            type: 'select',
            placeholder: 'Selecciona un Rol',
            options: combos?.roles?.list.map((item) => ({
                label: item.nombre,
                value: item.id
            })) ?? [],
        }

    ], [combos]); // Solo se recrea si cambian los combos
};