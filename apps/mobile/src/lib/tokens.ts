// Tokens de docs/design.md (§3 color, §4 tipografía, §5 medidas). Son los mismos valores que
// apps/web/src/index.css: si cambia uno, cambia en los dos lados (decisión 034).

export const colores = {
  noche900: '#0B1220',
  noche: '#101A2C',
  noche2: '#1A2740',
  bordeNoche: '#2E3D5A',
  pizarra700: '#3B4659',
  pizarra500: '#4A5468',
  pizarra400: '#9AA5B8',
  bordeCampo: '#878FA1',
  linea: '#D8DCE5',
  lineaSuave: '#ECEEF3',
  niebla: '#F4F5F8',
  papel: '#FFFFFF',
  // El texto sobre noche: el mismo valor que el papel, con otro rol.
  blanco: '#FFFFFF',
  cal: '#E9E2D6',
  lona: '#62BB78',
  lonaBorde: '#93D2A3',
  lonaFondo: '#E4F8E7',
  lonaTexto: '#1B6236',
  pelota: '#CDF546',
  azul: '#3567D6',
  azulTexto: '#2A55BC',
  azulFondo: '#ECF1FD',
  rojo: '#E5484D',
  rojoTexto: '#C62A2F',
  rojoFondo: '#FEF6F6',
  rojoLinea: '#F3D3D4',
  ambar: '#8F5200',
  ambarFondo: '#FDF3E3',
  petroleo: '#0F6170',
  petroleoFondo: '#E5F4F6',
} as const;

// En Android cada peso es una familia aparte: el peso se elige con fontFamily, nunca con
// fontWeight. Los nombres son los que registra useFonts en src/app/_layout.tsx.
export const fuentes = {
  sans: {
    400: 'InstrumentSans_400Regular',
    500: 'InstrumentSans_500Medium',
    600: 'InstrumentSans_600SemiBold',
    700: 'InstrumentSans_700Bold',
  },
  mono: {
    400: 'GeistMono_400Regular',
    500: 'GeistMono_500Medium',
    600: 'GeistMono_600SemiBold',
  },
  // Funnel Display, solo para los títulos de pantalla y el nombre del rival.
  display: {
    600: 'FunnelDisplay_600SemiBold',
  },
} as const;

// Todo número va en mono y con cifras de ancho fijo.
export const tabular = { fontVariant: ['tabular-nums'] } as const;

export const radios = {
  chip: 999,
  control: 8,
  tarjeta: 12,
  superficie: 20,
} as const;

export const medidas = {
  toque: 56,
  toqueSecundario: 52,
  margen: 16,
} as const;
