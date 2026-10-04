import { convocatoriaSchema, type DatosConvocatoria } from '@setpoint/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { ErrorApi } from '../../lib/api';
import { crearConvocatoria, editarConvocatoria, obtenerConvocatoria } from './api';

const ESPERA_AUTOGUARDADO_MS = 800;

export type EstadoGuardado = 'sin-cambios' | 'pendiente' | 'guardando' | 'guardado' | 'incompleto' | 'error';

// Mensaje por campo, con la clave que usa la API: 'nombre', 'categorias.0.cupo'.
export type ErroresConvocatoria = Record<string, string>;

export const claveConvocatoria = (slug: string, id: number | null) => ['convocatoria', slug, id];

// id null = torneo nuevo: todavía no hay nada que pedir.
export function useConvocatoria(slug: string, id: number | null) {
  return useQuery({
    queryKey: claveConvocatoria(slug, id),
    queryFn: () => obtenerConvocatoria(slug, id!),
    enabled: id !== null,
    retry: false,
  });
}

// Guarda el borrador solo, un rato después del último cambio (ver docs/decisiones/004).
// La primera vez crea la convocatoria con un POST y avisa el id con alCrear; después, PUT.
// Nunca hay dos guardados en vuelo: si algo cambia mientras se guarda, al terminar se guarda de nuevo.
// Así no se crean dos torneos ni llega un PUT viejo después de uno nuevo.
export function useAutoguardadoConvocatoria(
  slug: string,
  idInicial: number | null,
  datos: DatosConvocatoria,
  alCrear: (id: number) => void,
) {
  const queryClient = useQueryClient();
  const [estado, setEstado] = useState<EstadoGuardado>('sin-cambios');
  const [errores, setErrores] = useState<ErroresConvocatoria>({});
  const id = useRef(idInicial);
  const actual = useRef(datos);
  const ultimoGuardado = useRef(JSON.stringify(datos));
  const enCurso = useRef<Promise<void> | null>(null);
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);
  const montado = useRef(true);

  async function mandar() {
    for (;;) {
      const json = JSON.stringify(actual.current);
      if (id.current !== null && json === ultimoGuardado.current) {
        setEstado('guardado');
        return;
      }

      // Lo que no pasa el schema no se manda: la API lo rechazaría igual.
      const convocatoria = convocatoriaSchema.safeParse(actual.current);
      if (!convocatoria.success) {
        const campos: ErroresConvocatoria = {};
        for (const issue of convocatoria.error.issues) campos[issue.path.map(String).join('.')] ??= issue.message;
        setErrores(campos);
        setEstado('incompleto');
        return;
      }

      setEstado('guardando');
      try {
        const guardada =
          id.current === null
            ? await crearConvocatoria(slug, convocatoria.data)
            : await editarConvocatoria(slug, id.current, convocatoria.data);
        ultimoGuardado.current = json;
        setErrores({});
        queryClient.setQueryData(claveConvocatoria(slug, guardada.id), guardada);
        if (id.current === null) {
          id.current = guardada.id;
          if (montado.current) alCrear(guardada.id);
        }
      } catch (error) {
        if (error instanceof ErrorApi && error.codigo === 'NOMBRE_REPETIDO') {
          setErrores({ nombre: 'Ya tenés un torneo con ese nombre' });
          setEstado('incompleto');
        } else if (error instanceof ErrorApi && error.codigo === 'DATOS_INVALIDOS') {
          setErrores(error.campos);
          setEstado('incompleto');
        } else {
          setEstado('error');
        }
        return;
      }
    }
  }

  function guardar() {
    enCurso.current ??= mandar().finally(() => {
      enCurso.current = null;
    });
    return enCurso.current;
  }

  // Guarda sin esperar, para publicar o salir. Devuelve el id si lo que está en pantalla
  // quedó guardado, o null si no se pudo.
  async function guardarAhora() {
    clearTimeout(espera.current);
    await guardar();
    return JSON.stringify(actual.current) === ultimoGuardado.current ? id.current : null;
  }

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  useEffect(() => {
    actual.current = datos;
    if (JSON.stringify(datos) === ultimoGuardado.current) {
      // Se deshizo un cambio antes de que llegara a guardarse: lo guardado ya es esto.
      if (!enCurso.current) {
        setErrores({});
        setEstado((anterior) => {
          if (anterior !== 'pendiente' && anterior !== 'incompleto') return anterior;
          return id.current === null ? 'sin-cambios' : 'guardado';
        });
      }
      return;
    }

    setEstado('pendiente');
    espera.current = setTimeout(() => void guardar(), ESPERA_AUTOGUARDADO_MS);
    return () => clearTimeout(espera.current);
    // guardar lee todo desde refs: alcanza con reaccionar a los cambios de los datos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos]);

  return { estado, errores, guardarAhora };
}
