import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { BANDERAS_QUIETO, ESC, MOV, type Bandera, type CeldaDeSet, type Guion, type Objetivo, type Paso } from './lineaDeTiempo';
import type { NombreDeElemento, Registro, RegistroDeElementos } from './registro';

export type Estado = {
  banderas: ReadonlySet<Bandera>;
  // Dónde está el cursor en el lienzo de la compu (sin escala) y cuánto tarda en llegar.
  cursor: { x: number; y: number; ms: number; sale: boolean };
  foco: CeldaDeSet | null;
  apretado: Objetivo | null;
  // El toque en el celular; `n` cambia en cada toque para que la animación arranque de nuevo.
  toque: { x: number; y: number; n: number } | null;
  paso: 1 | 2 | 3 | 4;
  corriendo: boolean;
  pausado: boolean;
  // Cuánto bajó la pantalla de carga en cada ventana.
  desplazo: { esc: number; cel: number };
  // Para volver al principio (o quedar quieto) sin que nada se anime.
  sinTransicion: boolean;
};

const CURSOR_INICIAL = { x: 1150, y: 760, ms: 0, sale: false };
const CELU = '(max-width: 1023px)';
const REDUCIR = '(prefers-reduced-motion: reduce)';

function estadoInicial(): Estado {
  // Con "reducir movimiento" el primer cuadro ya es el quieto, así no hay un salto al cargar.
  const quieto = window.matchMedia(REDUCIR).matches;
  return {
    banderas: new Set<Bandera>(quieto ? BANDERAS_QUIETO : []),
    cursor: CURSOR_INICIAL,
    foco: null,
    apretado: null,
    toque: null,
    paso: quieto ? (window.matchMedia(CELU).matches ? 2 : 3) : 1,
    corriendo: false,
    pausado: false,
    desplazo: { esc: 0, cel: 0 },
    sinTransicion: quieto,
  };
}

// Posición de un elemento en coordenadas del lienzo, sin escala y sin el desplazamiento de la pantalla.
function posicion(el: HTMLElement, lienzo: HTMLElement) {
  let x = 0;
  let y = 0;
  let actual: HTMLElement | null = el;
  while (actual && actual !== lienzo) {
    x += actual.offsetLeft;
    y += actual.offsetTop;
    actual = actual.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

function centro(r: Registro, nombre: NombreDeElemento, desplazo: number): [number, number] | null {
  const el = r[nombre];
  const lienzo = r.lienzo;
  if (!el || !lienzo) return null;
  const p = posicion(el, lienzo);
  return [p.x + p.w / 2, p.y + p.h / 2 + (r.mov?.contains(el) ? desplazo : 0)];
}

// Al abrir un partido la pantalla baja hasta la carga, como en el producto. En el celular baja dos
// veces: primero a la grilla y después a "Al guardar" y los botones.
function medirBajada(r: Registro, n: 1 | 2, celular: boolean): number | null {
  const { lienzo, mov, carga } = r;
  if (!lienzo || !mov || !carga || !mov.offsetParent) return null;
  const arriba = posicion(carga, lienzo).y - posicion(mov, lienzo).y;
  const y1 = 12 - arriba;
  if (!celular) return y1;
  const alto = mov.parentElement?.clientHeight ?? 0;
  const y2 = alto - 12 - (arriba + carga.offsetHeight);
  return n === 1 ? y1 : Math.min(y1, y2);
}

type Entradas = {
  grupoRef: RefObject<HTMLElement | null>;
  // La línea de progreso se mueve directo en el DOM: re-renderizar el demo 60 veces por segundo sobra.
  progresoRef: RefObject<HTMLElement | null>;
  esc: RegistroDeElementos;
  cel: RegistroDeElementos;
};

// El reloj del demo: un rAF que ejecuta los pasos del guion a su hora. Pausar congela el tiempo y la
// vuelta al principio no se ve. Arranca cuando el demo está a la vista, y se frena al salir o al
// cambiar de pestaña.
export function useLineaDeTiempo({ grupoRef, progresoRef, esc, cel }: Entradas) {
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const alternar = useRef<(() => void) | null>(null);

  useEffect(() => {
    const grupo = grupoRef.current;
    if (!grupo) return;
    const mqCelu = window.matchMedia(CELU);
    const mqReducir = window.matchMedia(REDUCIR);
    const elEsc = esc.elementos;
    const elCel = cel.elementos;

    let activo = true;
    let guion: Guion = mqCelu.matches ? MOV : ESC;
    let k = 0;
    let t0 = 0;
    let tPausa = 0;
    let raf = 0;
    let arranque: ReturnType<typeof setTimeout> | undefined;
    let corre = false;
    let pausado = false;
    let quieto = false;
    let fuentes = false;
    let enVista = false;
    let cursor = { ...CURSOR_INICIAL };
    let toques = 0;
    const desplazo = { esc: 0, cel: 0 };

    const actualizar = (parcial: Partial<Estado>) => setEstado((e) => ({ ...e, ...parcial }));
    const progreso = (v: number) => {
      if (progresoRef.current) progresoRef.current.style.transform = `scaleX(${v})`;
    };

    // Vuelve al estado inicial sin transiciones. Con velo, lo deja puesto: el reinicio queda tapado.
    // flushSync: el estado limpio tiene que llegar al DOM antes de volver a prender las transiciones.
    function limpiar(conVelo: boolean) {
      desplazo.esc = 0;
      desplazo.cel = 0;
      cursor = { ...CURSOR_INICIAL };
      flushSync(() =>
        setEstado((e) => ({
          ...e,
          banderas: new Set<Bandera>(conVelo && e.banderas.has('velado') ? ['velado'] : []),
          cursor,
          foco: null,
          apretado: null,
          toque: null,
          paso: 1,
          desplazo: { esc: 0, cel: 0 },
          sinTransicion: true,
        })),
      );
      progreso(0);
      requestAnimationFrame(() => {
        if (activo) actualizar({ sinTransicion: quieto });
      });
    }

    function ejecutar(paso: Paso) {
      const enCelu = guion === MOV;
      const parcial: Partial<Estado> = {};

      if (paso.bajar) {
        const y = medirBajada(enCelu ? elCel : elEsc, paso.bajar, enCelu);
        if (y !== null) {
          desplazo[enCelu ? 'cel' : 'esc'] = y;
          parcial.desplazo = { ...desplazo };
        }
      }
      if (paso.ir) {
        const c = centro(elEsc, paso.ir[0], desplazo.esc);
        if (c) {
          cursor = { x: c[0], y: c[1], ms: paso.ir[1], sale: false };
          parcial.cursor = cursor;
        }
      }
      if (paso.sale) {
        cursor = { x: cursor.x + 120, y: cursor.y + 120, ms: 600, sale: true };
        parcial.cursor = cursor;
      }
      if (paso.tocar) {
        const c = centro(elCel, paso.tocar, desplazo.cel);
        if (c) {
          toques += 1;
          parcial.toque = { x: c[0], y: c[1], n: toques };
          parcial.apretado = paso.tocar;
        }
      }
      if (paso.apretar) parcial.apretado = paso.apretar;
      if (paso.soltar) parcial.apretado = null;
      if (paso.foco !== undefined) parcial.foco = paso.foco;
      if (paso.leyenda) parcial.paso = paso.leyenda;

      setEstado((e) => {
        const banderas = new Set(e.banderas);
        paso.off?.forEach((b) => banderas.delete(b));
        paso.on?.forEach((b) => banderas.add(b));
        if (paso.apretar) banderas.add('clic');
        if (paso.soltar) banderas.delete('clic');
        return { ...e, ...parcial, banderas };
      });
    }

    function frame(ahora: number) {
      let t = ahora - t0;
      if (t >= guion.duracion) {
        t0 = ahora;
        t = 0;
        k = 0;
        limpiar(false);
      }
      while (k < guion.pasos.length && guion.pasos[k][0] <= t) {
        const [, paso] = guion.pasos[k];
        if (paso.reiniciar) limpiar(true);
        else ejecutar(paso);
        k += 1;
      }
      progreso(t < guion.fin ? t / guion.fin : t < guion.reinicio ? 1 : 0);
      raf = requestAnimationFrame(frame);
    }

    function arrancar() {
      if (corre) return;
      corre = true;
      pausado = false;
      quieto = false;
      guion = mqCelu.matches ? MOV : ESC;
      limpiar(false);
      actualizar({ corriendo: true, pausado: false });
      k = 0;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function parar() {
      cancelAnimationFrame(raf);
      clearTimeout(arranque);
      arranque = undefined;
      corre = false;
      pausado = false;
      quieto = false;
      limpiar(false);
      actualizar({ corriendo: false, pausado: false });
    }

    function pausar() {
      cancelAnimationFrame(raf);
      tPausa = performance.now() - t0;
      pausado = true;
      actualizar({ pausado: true });
    }

    function reanudar() {
      pausado = false;
      t0 = performance.now() - tPausa;
      actualizar({ pausado: false });
      raf = requestAnimationFrame(frame);
    }

    // Arranca 1200 ms después de que el demo esté a la vista y las fuentes hayan cargado.
    function programar() {
      if (corre || arranque !== undefined || mqReducir.matches) return;
      arranque = setTimeout(() => {
        arranque = undefined;
        if (fuentes && enVista && !document.hidden) arrancar();
      }, 1200);
    }

    // Con "reducir movimiento" queda el cuadro quieto: la carga con la vista previa de la zona.
    function cuadroQuieto() {
      parar();
      quieto = true;
      flushSync(() =>
        setEstado((e) => ({
          ...e,
          banderas: new Set<Bandera>(BANDERAS_QUIETO),
          sinTransicion: true,
          paso: mqCelu.matches ? 2 : 3,
        })),
      );
      const yEsc = medirBajada(elEsc, 1, false);
      const yCel = medirBajada(elCel, 1, true);
      if (yEsc !== null) desplazo.esc = yEsc;
      if (yCel !== null) desplazo.cel = yCel;
      actualizar({ desplazo: { ...desplazo } });
    }

    alternar.current = () => {
      if (!corre) return;
      if (pausado) reanudar();
      else pausar();
    };

    const alCambiarCelu = () => {
      if (mqReducir.matches) {
        cuadroQuieto();
        return;
      }
      if (corre || arranque !== undefined) {
        parar();
        if (enVista) programar();
      }
    };
    const alCambiarReducir = () => {
      if (mqReducir.matches) {
        cuadroQuieto();
      } else {
        parar();
        if (enVista) programar();
      }
    };
    const alCambiarVisibilidad = () => {
      if (mqReducir.matches) return;
      if (document.hidden) parar();
      else if (enVista) programar();
    };

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          enVista = e.isIntersecting && e.intersectionRatio >= 0.2;
          if (enVista) programar();
          else if (!e.isIntersecting && !mqReducir.matches) parar();
        }
      },
      { threshold: [0, 0.2] },
    );
    observador.observe(grupo);

    mqCelu.addEventListener('change', alCambiarCelu);
    mqReducir.addEventListener('change', alCambiarReducir);
    document.addEventListener('visibilitychange', alCambiarVisibilidad);

    // Las posiciones dependen de las fuentes: con ellas listas se mide de nuevo.
    void document.fonts.ready.then(() => {
      if (!activo) return;
      fuentes = true;
      if (mqReducir.matches) cuadroQuieto();
      else if (enVista) programar();
    });
    if (mqReducir.matches) {
      queueMicrotask(() => {
        if (activo) cuadroQuieto();
      });
    }

    return () => {
      activo = false;
      cancelAnimationFrame(raf);
      clearTimeout(arranque);
      observador.disconnect();
      mqCelu.removeEventListener('change', alCambiarCelu);
      mqReducir.removeEventListener('change', alCambiarReducir);
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      alternar.current = null;
    };
  }, [grupoRef, progresoRef, esc, cel]);

  const alternarPausa = useCallback(() => alternar.current?.(), []);

  return { ...estado, alternarPausa };
}
