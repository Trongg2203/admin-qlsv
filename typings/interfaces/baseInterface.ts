interface UpdatedByName {
    id: string;
    name: string;
}

export interface BaseInterface<T> {
    id: T;
    created_at?: string;
    created_by?: string;
    updated_at?: string;
    updated_by?: string;
    updated_by_name?: UpdatedByName,
    created_by_name?: UpdatedByName,
    style?: Object; //set row style
    checked?: boolean;
}
