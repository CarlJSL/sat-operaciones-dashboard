export type FilterFieldType = 'text' | 'select' | 'number';

export interface FilterOption {
    label: string;
    value: string | number;
}

export interface FilterFieldConfig {
    id: string;

    label: string;

    type: FilterFieldType

    placeholder?: string;

    options?: FilterOption[];
}