import type { PartidoDelTablero, RecordatorioEnviado, Tablero } from '@setpoint/shared';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { MensajeError } from '../../components/Aviso';
import { Boton } from '../../components/Boton';
import { Campo } from '../../components/Campo';
import { ErrorApi } from '../../lib/api';
import { diaConSemana } from '../torneos/texto';
import { useExtenderPlazo, useRecordarPartido } from './useTablero';

type Props = { slug: string; tablero: Tablero; partido: PartidoDelTablero; sangria: string };

// El día siguiente a uno 'AAAA-MM-DD'.
const diaSiguiente = (dia: string) => {
  const fecha = new Date(`${dia}T12:00:00.000Z`);
  fecha.setUTCDate(fecha.getUTCDate() + 1);
  return fecha.toISOString().slice(0, 10);
};

const hoyEnArgentina = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date());

// "Bravo", "Bravo y Vera".
const yLista = (apellidos: string[]) => (apellidos.length < 2 ? apellidos.join('') : `${apellidos.slice(0, -1).join(', ')} y ${apellidos.at(-1)}`);

function aQuienLlego({ conAviso, conEmail, sinCanal }: RecordatorioEnviado) {
  const partes = [
    conAviso.length > 0 && `Aviso en el celular a ${yLista(conAviso)}`,
    conEmail.length > 0 && `email a ${yLista(conEmail)}`,
  ].filter(Boolean);
  const llego = partes.length > 0 ? `${partes.join(' y ')}.` : 'No le llegó a ninguno.';
  const falta =
    sinCanal.length === 0 ? '' : ` ${yLista(sinCanal)} no ${sinCanal.length === 1 ? 'tiene' : 'tienen'} cuenta: escribiles por WhatsApp.`;
  return llego.charAt(0).toUpperCase() + llego.slice(1) + falta;
}

// "Más" en una fila de lo que falta (decisión 135): lo que la organización hace con un partido que
// se atrasa, además de escribirles. Se abre debajo de la fila, como Escribirles.
export function MasAcciones({ slug, tablero, partido, sangria }: Props) {
  const minimo = partido.fechaLimite && partido.fechaLimite >= hoyEnArgentina() ? diaSiguiente(partido.fechaLimite) : hoyEnArgentina();
  const [fecha, setFecha] = useState(minimo);
  const extender = useExtenderPlazo(slug, tablero.torneoId, partido.id);
  const recordar = useRecordarPartido(slug, tablero.torneoId, partido.id);
  const deZona = partido.grupo !== null;

  function guardarPlazo(evento: FormEvent) {
    evento.preventDefault();
    extender.mutate({ fechaLimite: fecha });
  }

  return (
    <div className={`px-5 pb-4 ${sangria}`}>
      <div className="flex flex-col gap-4 rounded-control border border-linea bg-niebla p-4">
        <form onSubmit={guardarPlazo} className="flex flex-wrap items-end gap-3">
          <Campo
            id={`plazo-${partido.id}`}
            rotulo="Extender el plazo hasta"
            type="date"
            min={minimo}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-[200px]"
          />
          <Boton type="submit" disabled={extender.isPending || !fecha}>
            {extender.isPending ? 'Guardando…' : 'Extender el plazo'}
          </Boton>
          <p className="basis-full text-[13px] text-pizarra-500">
            {partido.fechaLimite ? `Hoy el plazo es hasta el ${diaConSemana(partido.fechaLimite)}. ` : ''}
            Solo cambia este partido.
          </p>
          {extender.error && (
            <MensajeError>
              {extender.error instanceof ErrorApi && extender.error.codigo === 'DATOS_INVALIDOS'
                ? 'Elegí un día posterior al plazo actual.'
                : 'No pudimos extender el plazo. Recargá el tablero y probá de nuevo.'}
            </MensajeError>
          )}
        </form>

        <div className="flex flex-col gap-2 border-t border-linea pt-4">
          <div className="flex flex-wrap items-center gap-3">
            <Boton disabled={recordar.isPending || recordar.isSuccess} onClick={() => recordar.mutate()}>
              {recordar.isPending ? 'Mandando…' : recordar.isSuccess ? 'Recordatorio enviado' : 'Recordarles el partido'}
            </Boton>
            <span className="text-[13px] text-pizarra-500">Aviso a quien tiene la app y email a quien tiene cuenta.</span>
          </div>
          {recordar.data && <p className="text-sm">{aQuienLlego(recordar.data)}</p>}
          {recordar.error && <MensajeError>No pudimos mandar el recordatorio. Probá de nuevo.</MensajeError>}
        </div>

        {/* En un cuadro alguien tiene que avanzar: el doble W.O. es solo de las zonas. */}
        {deZona && (
          <div className="flex flex-wrap items-center gap-3 border-t border-linea pt-4">
            <Link
              to={`/torneos/${tablero.torneoId}/resultados/${partido.id}?tipo=doble_walkover`}
              className="inline-flex h-10 items-center rounded-control border border-borde-campo px-4 text-sm font-medium hover:bg-papel"
            >
              Ninguno se presentó: doble W.O.
            </Link>
            <span className="text-[13px] text-pizarra-500">Pierden los dos 0-6 0-6. Antes de guardar se ve cómo queda la zona.</span>
          </div>
        )}
      </div>
    </div>
  );
}
