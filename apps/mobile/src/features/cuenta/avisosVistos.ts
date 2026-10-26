import * as SecureStore from 'expo-secure-store';

// Los avisos de una solicitud no aprobada o una reserva vencida se muestran una vez: el celular
// recuerda cuáles ya se vieron, por el id de la inscripción (decisión 054). En otro celular
// aparecen otra vez.
const CLAVE = 'setpoint.avisos-vistos';
// La API manda los avisos de los últimos 30 días: con los últimos ids alcanza.
const MAXIMO = 50;

export async function leerAvisosVistos(): Promise<number[]> {
  try {
    const guardados = JSON.parse((await SecureStore.getItemAsync(CLAVE)) ?? '[]');
    return Array.isArray(guardados) ? guardados.filter((id): id is number => Number.isInteger(id)) : [];
  } catch {
    return [];
  }
}

export async function guardarAvisosVistos(ids: number[]) {
  try {
    await SecureStore.setItemAsync(CLAVE, JSON.stringify(ids.slice(-MAXIMO)));
  } catch {
    // Si no se puede guardar, el aviso vuelve a aparecer la próxima vez: no rompe nada.
  }
}
