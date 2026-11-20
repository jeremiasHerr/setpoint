import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { colores, fuentes, medidas, radios } from '../lib/tokens';

// Los mismos nombres que en la web (design.md §6). "principal" y "organizador" son el mismo botón:
// el noche de la barra con el texto blanco (decisión 115). Queda el nombre para no tocar cada pantalla.
type Variante = 'principal' | 'organizador' | 'secundario';

type Props = Omit<PressableProps, 'style' | 'children'> & {
  texto: string;
  variante?: Variante;
};

export function Boton({ texto, variante = 'secundario', disabled, ...props }: Props) {
  const oscuro = variante === 'organizador';
  const esPrincipal = variante === 'principal';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        estilos.base,
        esPrincipal ? estilos.principal : oscuro ? estilos.organizador : estilos.secundario,
        pressed && (esPrincipal ? estilos.principalApretado : oscuro ? estilos.organizadorApretado : estilos.secundarioApretado),
        disabled && estilos.deshabilitado,
      ]}
      {...props}
    >
      <Text style={[estilos.texto, esPrincipal ? estilos.textoPrincipal : oscuro ? estilos.textoOrganizador : estilos.textoSecundario]}>
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
    backgroundColor: colores.noche900,
  },
  principalApretado: {
    backgroundColor: colores.noche2,
  },
  organizador: {
    height: medidas.toque,
    backgroundColor: colores.noche900,
  },
  organizadorApretado: {
    backgroundColor: colores.noche2,
  },
  secundario: {
    height: medidas.toqueSecundario,
    borderWidth: 1,
    borderColor: colores.linea,
  },
  secundarioApretado: {
    backgroundColor: colores.niebla,
  },
  deshabilitado: {
    opacity: 0.4,
  },
  texto: {
    fontSize: 17,
  },
  textoPrincipal: {
    fontFamily: fuentes.sans[600],
    color: colores.blanco,
  },
  textoOrganizador: {
    fontFamily: fuentes.sans[600],
    color: colores.blanco,
  },
  textoSecundario: {
    fontFamily: fuentes.sans[500],
    color: colores.noche,
  },
});
