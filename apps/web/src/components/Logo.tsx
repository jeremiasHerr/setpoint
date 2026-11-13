type Props = {
  sobreNegro?: boolean;
  // El de la landing, en el encabezado y el pie.
  grande?: boolean;
};

export function Logo({ sobreNegro = false, grande = false }: Props) {
  return (
    <div className={`flex items-center ${grande ? 'gap-2.5' : 'gap-[9px]'}`}>
      <div
        className={`flex items-center justify-center bg-lima ${grande ? 'size-[30px] rounded-lg' : 'size-6 rounded-[7px]'}`}
      >
        <div className={`rounded-full bg-negro ${grande ? 'size-2.5' : 'size-2'}`} />
      </div>
      <span
        className={`font-semibold ${grande ? 'text-[21px] tracking-[-0.03em]' : 'text-base tracking-[-0.02em]'} ${sobreNegro ? 'text-white' : 'text-negro'}`}
      >
        SetPoint
      </span>
    </div>
  );
}
