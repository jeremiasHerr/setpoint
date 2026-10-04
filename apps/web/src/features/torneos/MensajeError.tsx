type Props = {
  id: string;
  children?: string;
};

export function MensajeError({ id, children }: Props) {
  if (!children) return null;
  return (
    <p id={id} className="text-[13px] text-rojo-texto">
      {children}
    </p>
  );
}
