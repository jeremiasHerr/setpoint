import { useEffect, useState } from 'react';

export default function App() {
  const [api, setApi] = useState('consultando…');

  useEffect(() => {
    fetch('/api/salud')
      .then((r) => r.json())
      .then((d) => setApi(d.ok ? 'API conectada' : 'respuesta rara'))
      .catch(() => setApi('sin conexión con la API'));
  }, []);

  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">SetPoint</h1>
      <div className="flex gap-3">
        <div className="size-16 rounded-control bg-lima" />
        <div className="size-16 rounded-control bg-negro" />
        <div className="size-16 rounded-control bg-rojo" />
      </div>
      <p className="font-mono text-gris-500">165 puntos · {api}</p>
    </div>
  );
}