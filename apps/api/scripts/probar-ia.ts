import Anthropic from '@anthropic-ai/sdk';

async function main() {
  const client = new Anthropic(); // toma ANTHROPIC_API_KEY sola

  const respuesta = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 100,
    messages: [{ role: 'user', content: 'Decí hola en una palabra.' }],
  });

  console.log(respuesta);
}

main();