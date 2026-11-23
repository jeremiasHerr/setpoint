import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// Los tokens de MercadoPago de cada organización se guardan cifrados (decisión 137): con la base
// sola no se puede cobrar ni ver pagos en nombre de nadie. La clave vive en una variable de
// entorno, no en la base. AES-256-GCM, que además rechaza un texto que alguien tocó.

const VERSION = 'v1';

function clave() {
  const texto = process.env.CLAVE_TOKENS_MERCADOPAGO ?? '';
  if (!/^[0-9a-f]{64}$/i.test(texto)) {
    throw new Error(
      'CLAVE_TOKENS_MERCADOPAGO tiene que ser una clave de 32 bytes en hex: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  }
  return Buffer.from(texto, 'hex');
}

export function hayClaveDeCifrado() {
  try {
    clave();
    return true;
  } catch {
    return false;
  }
}

export function cifrar(texto: string) {
  const iv = randomBytes(12);
  const cifrador = createCipheriv('aes-256-gcm', clave(), iv);
  const datos = Buffer.concat([cifrador.update(texto, 'utf8'), cifrador.final()]);
  return [VERSION, iv, cifrador.getAuthTag(), datos].map((parte) => (typeof parte === 'string' ? parte : parte.toString('base64url'))).join('.');
}

export function descifrar(guardado: string) {
  const [version, iv, etiqueta, datos] = guardado.split('.');
  if (version !== VERSION || !iv || !etiqueta || datos === undefined) throw new Error('Texto cifrado con un formato desconocido');
  const descifrador = createDecipheriv('aes-256-gcm', clave(), Buffer.from(iv, 'base64url'));
  descifrador.setAuthTag(Buffer.from(etiqueta, 'base64url'));
  return Buffer.concat([descifrador.update(Buffer.from(datos, 'base64url')), descifrador.final()]).toString('utf8');
}
