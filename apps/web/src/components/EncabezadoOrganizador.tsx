type ItemNavegacion = {
  etiqueta: string;
  href: string;
};

type Props = {
  organizacion: string;
  navegacion: ItemNavegacion[];
  activo?: string;
};

export function EncabezadoOrganizador({ organizacion, navegacion, activo }: Props) {
  return (
    <header className="flex h-[60px] items-center justify-between gap-6 bg-negro px-7">
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-[9px]">
          <div className="flex size-6 items-center justify-center rounded-[7px] bg-lima">
            <div className="size-2 rounded-full bg-negro" />
          </div>
          <span className="text-base font-semibold tracking-[-0.02em] text-white">SetPoint</span>
        </div>
        <div className="h-[18px] w-px bg-borde-oscuro" />
        <span className="text-sm text-gris-400">{organizacion}</span>
      </div>

      <nav className="flex items-center gap-1">
        {navegacion.map(({ etiqueta, href }) => {
          const esActivo = etiqueta === activo;
          return (
            <a
              key={href}
              href={href}
              aria-current={esActivo ? 'page' : undefined}
              className={`flex h-[34px] items-center rounded-lg px-[13px] text-sm ${
                esActivo ? 'bg-carbon font-semibold text-white' : 'text-gris-400 hover:text-white'
              }`}
            >
              {etiqueta}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
