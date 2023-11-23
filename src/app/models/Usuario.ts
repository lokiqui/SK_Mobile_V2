import { HistoriaClinica } from "./HistoriaClinica";

export interface Usuario {
    'nombre': string;
    'apellido': string;
    'edad': number;
    'dni': number;
    'email': string;
    'rol': string;

    'detallePerfil'?: string; // piloto
    'fotos'?: string[]; // piloto
    // 'historiaClinica'?: HistoriaClinica; // piloto
    'historiaClinica'?: any; // piloto
    'aerodromos'?: string[]; // instructor
    'habilitado'?: boolean; // instructor
    'agenda'?: boolean[]; // instructor
    'foto'?: string; // instructor y administrador
}