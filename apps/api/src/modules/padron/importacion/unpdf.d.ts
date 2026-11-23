// unpdf solo publica ESM y la API compila como CommonJS: tsc no encuentra sus tipos, aunque al correr
// tsx y Node 22 lo cargan igual. Se declara solo lo que usa leer-pdf.ts (decisión 137).
declare module 'unpdf' {
  type ItemDeTexto = { str: string; transform: number[]; width: number };

  type Pagina = {
    getTextContent(): Promise<{ items: (ItemDeTexto | { type: string })[] }>;
  };

  type DocumentoPdf = {
    numPages: number;
    getPage(numero: number): Promise<Pagina>;
    loadingTask: { destroy(): Promise<void> };
  };

  export function getDocumentProxy(datos: Uint8Array): Promise<DocumentoPdf>;
}
