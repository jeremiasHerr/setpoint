# 087 — La organización se crea con un código en el email

**Estado:** aceptada — 12 de noviembre de 2026. Ajusta la [decisión 049](049-identidad-e-ingreso-con-codigo.md), que dejaba el registro de los administradores sin verificar.

## Contexto

Con la versión publicada ([decisión 086](086-version-publicada.md)), cualquiera puede registrar una organización desde `setpoint.com.ar`. El registro pedía nombre, email y contraseña y creaba la cuenta en el momento, sin comprobar que el email fuera de quien lo escribía.

Eso trae dos problemas. Alguien puede registrar una organización con un email ajeno, y el dueño real queda sin poder registrarse ni entrar como jugador con ese email, porque ya tiene cuenta. Y los mails de la organización (recuperar la contraseña, los avisos) salen hacia una casilla que nadie confirmó.

Los jugadores ya verifican su email con un código de 6 dígitos (decisión 049). Queríamos que el registro tampoco se pudiera hacer sin código.

## Opciones consideradas

1. **Verificar antes de crear.** El formulario manda un código; la organización se crea recién al escribirlo.
   - En contra: si el mail no llega, no se puede crear la organización.
2. **Crear en el momento y verificar después.** La organización queda "sin verificar", con acciones bloqueadas hasta poner el código.
   - En contra: una migración, decidir en cada ruta de administración qué se bloquea, y organizaciones que quedan creadas con emails ajenos.
3. **Primero el email y el código, después el resto del formulario**, como la inscripción del jugador.
   - En contra: la pantalla del jugador habla de "no hay contraseña"; habría que duplicarla o parametrizarla, y un email con cuenta se descubre después de escribir el código.

## Decisión

Opción 1.

- **`POST /api/auth/registro/codigo`** recibe los datos del formulario, rechaza con `EMAIL_EN_USO` un email que ya tiene cuenta, y manda el código. No crea nada.
- **`POST /api/auth/registro`** pide además el `codigo`. Lo revisa y lo consume antes de crear la organización. Sin código no hay registro.
- **El código es el mismo de los jugadores:** la misma tabla, la misma validez de 10 minutos, los mismos 5 pedidos por email y 5 intentos, y el límite por IP en las dos rutas. Cambia solo el asunto del mail: "para crear tu organización".
- **En la web, el código se escribe en la misma tarjeta del registro.** "Cambiar el email" vuelve al formulario con los datos escritos.
- **Los administradores siguen entrando con contraseña.** El código solo se pide una vez, al crear la cuenta.

## Por qué

- **Nunca queda una organización con un email sin verificar**, y no hace falta ningún estado nuevo en la base.
- **Reutiliza todo lo del código del jugador**, que ya está probado: tabla, límites, mail y el campo de seis casillas.
- **El email con cuenta se avisa antes de mandar el código**, no después de que la persona lo busque en su casilla.

## Qué se resigna

- **Registrarse depende de que llegue el mail.** En la entrega lo muestra Mailpit; en la versión publicada, Resend. Si el proveedor falla, no se pueden crear organizaciones.
- **Las organizaciones creadas antes de este cambio** quedan como están, sin verificar.
- **El pedido del código revela si un email tiene cuenta**, igual que lo hacía el registro. El ingreso sigue sin revelarlo.
