import { z } from 'zod';
import { armarSchemaRespuesta } from '../src/modules/padron/importacion/schema-respuesta';

const schema = armarSchemaRespuesta();

console.log(JSON.stringify(z.toJSONSchema(schema), null, 2));