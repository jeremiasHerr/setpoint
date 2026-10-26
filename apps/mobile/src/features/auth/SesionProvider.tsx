import type { AvisoDeInscripcion, Cuenta, PerfilDeJugador } from '@setpoint/shared';
import type { UseQueryResult } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { olvidarCelular } from '../avisos/avisos';
import { guardarAvisosVistos, leerAvisosVistos } from '../cuenta/avisosVistos';
import { useCuenta } from '../cuenta/useCuenta';
import { borrarSesion, guardarCircuito, guardarSesion, leerCircuito, leerSesion, type Sesion } from './sesion';

type ValorSesion = {
  // Mientras se lee del celular al abrir la app: la splash espera.
  cargando: boolean;
  sesion: Sesion | null;
  // Los circuitos en los que juega: los de la cuenta y, hasta que llega o sin señal, los guardados.
  // Puede estar vacío: quien todavía no juega en ninguno ve sus inscripciones en curso (decisión 054).
  perfiles: PerfilDeJugador[];
  // El circuito en el que está: el único que tiene, o el que eligió. null si juega en varios y
  // todavía no eligió (decisión 040), o si no juega en ninguno.
  perfil: PerfilDeJugador | null;
  // GET /api/auth/cuenta: las inscripciones en curso y los avisos.
  cuenta: UseQueryResult<Cuenta>;
  // Los avisos que todavía no vio en este celular.
  avisos: AvisoDeInscripcion[];
  descartarAviso: (inscripcionId: number) => void;
  ingresar: (sesion: Sesion) => Promise<void>;
  elegirCircuito: (jugadorId: number) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const ContextoSesion = createContext<ValorSesion | null>(null);

function perfilElegido(perfiles: PerfilDeJugador[], jugadorId: number | null) {
  if (perfiles.length === 1) return perfiles[0];
  return perfiles.find((p) => p.jugador.id === jugadorId) ?? null;
}

const mismosPerfiles = (a: PerfilDeJugador[], b: PerfilDeJugador[]) => JSON.stringify(a) === JSON.stringify(b);

export function SesionProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [jugadorIdElegido, setJugadorIdElegido] = useState<number | null>(null);
  const [vistos, setVistos] = useState<number[]>([]);
  const cuenta = useCuenta(sesion?.token);

  useEffect(() => {
    Promise.all([leerSesion(), leerCircuito(), leerAvisosVistos()]).then(([guardada, jugadorId, avisosVistos]) => {
      setSesion(guardada);
      setJugadorIdElegido(jugadorId);
      setVistos(avisosVistos);
      setCargando(false);
    });
  }, []);

  // Cuando cambian los circuitos (se confirmó un pago, o la organización lo dio de baja), la sesión
  // guardada queda con los de ahora: así la app abre bien aunque no haya señal.
  const perfilesDeLaCuenta = cuenta.data?.perfiles;
  useEffect(() => {
    if (!sesion || !perfilesDeLaCuenta || mismosPerfiles(sesion.perfiles, perfilesDeLaCuenta)) return;
    const actualizada = { ...sesion, perfiles: perfilesDeLaCuenta };
    setSesion(actualizada);
    void guardarSesion(actualizada);
  }, [sesion, perfilesDeLaCuenta]);

  const valor = useMemo<ValorSesion>(() => {
    const perfiles = sesion?.perfiles ?? [];
    return {
      cargando,
      sesion,
      perfiles,
      perfil: perfilElegido(perfiles, jugadorIdElegido),
      cuenta,
      avisos: (cuenta.data?.avisos ?? []).filter((a) => !vistos.includes(a.inscripcionId)),
      descartarAviso: (inscripcionId) => {
        const nuevos = [...vistos, inscripcionId];
        setVistos(nuevos);
        void guardarAvisosVistos(nuevos);
      },
      ingresar: async (nueva) => {
        await guardarSesion(nueva);
        setSesion(nueva);
      },
      elegirCircuito: async (jugadorId) => {
        await guardarCircuito(jugadorId);
        setJugadorIdElegido(jugadorId);
      },
      // También olvida el circuito elegido: en un celular compartido, quien entre después elige el suyo.
      cerrarSesion: async () => {
        const perfil = perfilElegido(perfiles, jugadorIdElegido) ?? perfiles[0];
        // Sin esperarlo: sin señal tardaría, y salir no puede depender de la red.
        if (sesion && perfil) void olvidarCelular(perfil.organizacion.slug, sesion.token);
        await borrarSesion();
        setSesion(null);
        setJugadorIdElegido(null);
      },
    };
  }, [cargando, sesion, jugadorIdElegido, cuenta, vistos]);

  return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion() {
  const valor = useContext(ContextoSesion);
  if (!valor) throw new Error('useSesion se usa dentro de SesionProvider');
  return valor;
}
