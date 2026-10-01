import { configuracionCircuitoSchema, type Circuito } from '@setpoint/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { guardarCircuito, obtenerCircuito } from './api';

const ESPERA_AUTOGUARDADO_MS = 800;

export type EstadoGuardado = 'sin-cambios' | 'pendiente' | 'guardando' | 'guardado' | 'incompleto' | 'error';

export function useCircuito(slug: string) {
  return useQuery({
    queryKey: ['circuito', slug],
    queryFn: () => obtenerCircuito(slug),
    retry: false,
  });
}

// Guarda la configuración sola, un rato después del último cambio.
// Nunca hay dos guardados en vuelo: si algo cambia mientras se guarda, al terminar se guarda de nuevo.
// Así un PUT viejo no puede llegar después de uno nuevo y pisarlo.
export function useAutoguardadoCircuito(slug: string, circuito: Circuito) {
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<EstadoGuardado>('sin-cambios');
  const actual = useRef(circuito);
  const ultimoGuardado = useRef(JSON.stringify(circuito));
  const enCurso = useRef(false);

  async function guardar() {
    if (enCurso.current) return;

    const valor = actual.current;
    const json = JSON.stringify(valor);
    if (json === ultimoGuardado.current) {
      setEstado('guardado');
      return;
    }

    const configuracion = configuracionCircuitoSchema.safeParse(valor);
    if (!configuracion.success) {
      setEstado('incompleto');
      return;
    }

    enCurso.current = true;
    setEstado('guardando');
    try {
      const guardado = await guardarCircuito(slug, configuracion.data);
      ultimoGuardado.current = json;
      queryClient.setQueryData(['circuito', slug], guardado);
    } catch {
      setEstado('error');
      return;
    } finally {
      enCurso.current = false;
    }

    if (JSON.stringify(actual.current) === json) setEstado('guardado');
    else void guardar();
  }

  useEffect(() => {
    actual.current = circuito;
    if (JSON.stringify(circuito) === ultimoGuardado.current) {
      // Se deshizo un cambio antes de que llegara a guardarse: lo que está en la base ya es esto.
      if (!enCurso.current) {
        setEstado((anterior) => (anterior === 'pendiente' || anterior === 'incompleto' ? 'guardado' : anterior));
      }
      return;
    }

    setEstado('pendiente');
    const espera = setTimeout(() => void guardar(), ESPERA_AUTOGUARDADO_MS);
    return () => clearTimeout(espera);
    // guardar lee todo desde refs: alcanza con reaccionar a los cambios del circuito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuito]);

  return estado;
}
