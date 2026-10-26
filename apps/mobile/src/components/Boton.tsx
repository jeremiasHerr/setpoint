import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { colores, fuentes, medidas, radios } from '../lib/tokens';

// Los mismos nombres que en la web (design.md §6). "organizador" es el negro, que la app también usa
// para acciones como Ingresar; "principal" es el lima, para pagar.
type Variante = 'principal' | 'organizador' | 'secundario';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  texto: string;
  variante?: Variante;
};

export function Boton({ texto, variante = 'secundario', disabled, ...props }: Props) {
  const oscuro = variante === 'organizador';
  const lima = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        estilos.base,
        lima ? estilos.principal : oscuro ? estilos.organizador : estilos.secundario,
        pressed && (lima ? estilos.principalApretado : oscuro ? estilos.organizadorApretado : estilos.secundarioApretado),
        disabled && estilos.deshabilitado,
      ]}
      {...props}
    >
      <Text style={[estilos.texto, lima ? estilos.textoPrincipal : oscuro ? estilos.textoOrganizador : estilos.textoSecundario]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    borderRadius: radios.control,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  principal: {
    height: medidas.toque,
    backgroundColor: colores.lima,
  },
  principalApretado: {
    opacity: 0.85,
  },
  organizador: {
    height: medidas.toque,
    backgroundColor: colores.negro,
  },
  organizadorApretado: {
    backgroundColor: colores.carbon,
  },
  secundario: {
    height: medidas.toqueSecundario,
    borderWidth: 1,
    borderColor: colores.linea,
  },
  secundarioApretado: {
    backgroundColor: colores.fondo,
  },
  deshabilitado: {
    opacity: 0.4,
  },
  texto: {
    fontSize: 17,
  },
  textoPrincipal: {
    fontFamily: fuentes.sans[600],
    color: colores.negro,
  },
  textoOrganizador: {
    fontFamily: fuentes.sans[600],
    color: colores.blanco,
  },
  textoSecundario: {
    fontFamily: fuentes.sans[500],
    color: colores.negro,
  },
});
