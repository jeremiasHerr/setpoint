type Props = {
  // Tamaño y grosor del trazo, con clases: size-[13px] stroke-[2.6].
  className?: string;
};

export function IconoMas({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
