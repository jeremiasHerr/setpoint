import { useState } from 'react';
import type { Objetivo } from './lineaDeTiempo';

// Los elementos que el guion necesita medir: los botones y partidos que se señalan, más el lienzo, la
// pantalla que se desplaza y la tarjeta de carga. Cada ventana (compu y celular) tiene el suyo.
export type NombreDeElemento = Objetivo | 'lienzo' | 'mov' | 'carga';
export type Registro = Partial<Record<NombreDeElemento, HTMLElement | null>>;

export type RegistroDeElementos = {
  elementos: Registro;
  // El ref de cada elemento, siempre la misma función por nombre para que React no lo suelte y lo vuelva a poner.
  reg: (nombre: NombreDeElemento) => (el: HTMLElement | null) => void;
};

function crear(): RegistroDeElementos {
  const elementos: Registro = {};
  const guardados = new Map<NombreDeElemento, (el: HTMLElement | null) => void>();
  return {
    elementos,
    reg(nombre) {
      let ref = guardados.get(nombre);
      if (!ref) {
        ref = (el) => {
          elementos[nombre] = el;
        };
        guardados.set(nombre, ref);
      }
      return ref;
    },
  };
}

export function useRegistro(): RegistroDeElementos {
  return useState(crear)[0];
}
