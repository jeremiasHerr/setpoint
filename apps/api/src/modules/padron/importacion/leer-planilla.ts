import * as XLSX from "xlsx";

export type Celda = string | number | null;
export type FilaPlanilla = {
    fila: number;
    celdas: Celda[];
}

function limpiarCelda(valor: unknown): Celda {
    if(valor === null || valor === undefined) return null;
    
    if(typeof valor === "number") return valor;

    const texto = String(valor).trim();
    return texto === "" ? null : texto;
}

// La primera hoja del libro, con su nombre: muchas veces es la categoría ("Tercera").
export function leerHoja(archivo: Buffer): { nombre: string; filas: FilaPlanilla[] } {
    const libro = XLSX.read(archivo, {type: "buffer"});
    const nombre = libro.SheetNames[0];
    return { nombre, filas: filasDeLaHoja(libro.Sheets[nombre]) };
}

export function leerPlanilla(archivo: Buffer): FilaPlanilla[] {
    return leerHoja(archivo).filas;
}

function filasDeLaHoja(hoja: XLSX.WorkSheet): FilaPlanilla[] {
    const ref = hoja["!ref"];
    if (!ref) return [];

    const rango = XLSX.utils.decode_range(ref);

    const matriz = XLSX.utils.sheet_to_json<unknown[]>(hoja, {
        header: 1,
        defval:null,
        blankrows: true,
    });
    
    const filas: FilaPlanilla[] = matriz.map((celdas, i) => ({
        fila: rango.s.r + i + 1,
        celdas: celdas.map(limpiarCelda),
    }));

    return filas.filter((f) => f.celdas.some((c) => c !== null));

}