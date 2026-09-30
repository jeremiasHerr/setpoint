type Props = {
  sobreNegro?: boolean;
};

export function Logo({ sobreNegro = false }: Props) {
  return (
    <div className="flex items-center gap-[9px]">
      <div className="flex size-6 items-center justify-center rounded-[7px] bg-lima">
        <div className="size-2 rounded-full bg-negro" />
      </div>
      <span className={`text-base font-semibold tracking-[-0.02em] ${sobreNegro ? 'text-white' : 'text-negro'}`}>
        SetPoint
      </span>
    </div>
  );
}
