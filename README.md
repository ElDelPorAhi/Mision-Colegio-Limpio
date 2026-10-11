# Misión Colegio Limpio

«Tu basura no desaparece. Tú decides dónde termina».

Videojuego educativo para quinto grado: cuatro misiones, ocho retos, puntos, insignias y un título final. Está hecho solo con HTML, CSS y JavaScript. No usa librerías, no necesita internet para jugar, no guarda datos personales y no usa base de datos.

## A. Solución técnica

Una página web estática de tres archivos (`index.html`, `style.css`, `script.js`) más un cuarto, `data.js`, donde están todos los textos, residuos, preguntas y puntajes. Así, si quieres cambiar una explicación, solo abres `data.js`.

Elegí archivos separados y no un solo HTML por una razón práctica: es más fácil de corregir y de leer. La desventaja es que hay que subir la carpeta completa al publicar, pero con GitHub Pages o Netlify eso es arrastrar una carpeta.

El progreso se guarda con `sessionStorage` (solo mientras dure la pestaña). Los efectos de sonido se generan con el navegador, así que no hay archivos de efectos que conseguir. La música sí es un MP3 que pones tú.

## B. Estructura de carpetas

```
misionColegioLimpio/
├── index.html
├── style.css
├── data.js          (textos, residuos, preguntas, puntajes)
├── script.js        (lógica del juego)
├── README.md
└── assets/
    ├── audio/
    │   └── musica.mp3        <-- ESTE ARCHIVO LO PONES TÚ
    └── img/
        ├── ecoheroe.png
        ├── caneca_blanca.png, caneca_negra.png, caneca_verde.png
        ├── botella.png, carton.png, papel.png, cascara.png,
        │   servilleta.png, snacks.png, jugo.png
        ├── mapa.png
        ├── patio_limpio.png
        ├── patio/            (11 residuos del patio, uno por archivo)
        ├── insignia_clasificacion.png, insignia_patio_limpio.png,
        │   insignia_detective.png, insignia_racha.png,
        │   insignia_guardian.png
        ├── extra/            (5 dibujos extra en SVG)
        ├── tres_canecas.png  (respaldo, el juego no lo usa)
        └── patio.png         (respaldo, patio original con basura)
```

## C. Código

Está completo en `index.html`, `style.css`, `data.js` y `script.js`. No hay funciones omitidas ni comentarios del tipo «aquí va el resto».

## D. Imágenes y audio

### Tus imágenes, recortadas

Recorté el fondo blanco de todas, separé el cartón, el papel y la cáscara que venían pegados entre sí, y dividí la imagen de las tres canecas en tres archivos para poder pulsarlas por separado.

| Archivo que enviaste | Archivo en el proyecto | Uso |
|---|---|---|
| 01_ecohereo.png | assets/img/ecoheroe.png | Bienvenida, menú, paneles y pantalla final |
| 02_tres_canecas.png | assets/img/caneca_blanca.png, caneca_negra.png, caneca_verde.png | Botones de caneca en todos los retos |
| 03_botella_plastica.png | assets/img/botella.png | Retos 1.1 y 4.x |
| 04_caja_carton.png | assets/img/carton.png | Retos 1.1 y 4.x |
| 05_papel_limpio.png | assets/img/papel.png | Retos 1.2 y 4.x |
| 06_cascara_banano.png | assets/img/cascara.png | Retos 1.1 y 4.x |
| 07_servilleta_usada.png | assets/img/servilleta.png | Retos 1.1 y 4.x |
| 08_bolsa_snacks.png | assets/img/snacks.png | Retos 1.1 y 4.x |
| 09_caja_jugo.png | assets/img/jugo.png | Retos 1.2 y 4.x |
| 10_mapa_colegio.png | assets/img/mapa.png | Reto 3.1 |
| 11_patio_con_residuos.png | assets/img/patio_limpio.png y assets/img/patio/*.png | Reto 2.1 (ver nota) |
| 12_insignia_clasificacion.png | assets/img/insignia_clasificacion.png | Insignia al terminar el reto 1.2 |
| 13_insignia_patio_limpio.png | assets/img/insignia_patio_limpio.png | Insignia al terminar el reto 2.1 |
| 14_insignia_detective_ambiental.png | assets/img/insignia_detective.png | Insignia al terminar el reto 3.1 |
| 15_insignia_racha_ecologica.png | assets/img/insignia_racha.png | Insignia con 5 aciertos seguidos en 4.2 |
| 16_insignia_guardian_ambiental.png | assets/img/insignia_guardian.png | Insignia con 91% o más del puntaje |

**Nota sobre el patio.** Para que los residuos se puedan recoger de verdad, borré digitalmente la basura de tu imagen (`patio_limpio.png`) y guardé cada residuo como una pieza aparte en `assets/img/patio/`. Al ponerlas todas encima del fondo limpio se reconstruye tu imagen original. Tu escena original sigue guardada en `patio.png`.

### Lo que añadí yo (y debes saber)

Con tus 7 residuos no alcanzaba para que el reto 1.2 no repitiera los del 1.1, ni para los retos de rapidez. Por eso dibujé 5 residuos extra en SVG, en `assets/img/extra/`: **lata, frasco de vidrio, hojas secas, vaso de icopor y manzana mordida**. Son sencillos y puedes cambiarlos por los tuyos conservando el nombre del archivo.

### Audio

Pon tu canción en **`assets/audio/musica.mp3`**. Yo no incluí ninguna, y no hay música falsa de relleno. Si el archivo no existe, el juego funciona igual y muestra el aviso «Falta el archivo assets/audio/musica.mp3» al pulsar el botón de música.

Revisa la licencia de la pista. Si la bajas de una biblioteca gratuita (YouTube Audio Library, Pixabay Music, etc.), confirma si pide dar crédito y ponlo en tu presentación.

Si tu archivo tiene otro nombre, cambia `rutaMusica` al inicio de `data.js`.

## E. Cómo probarlo en tu computador

**Forma fácil:** abre `index.html` con doble clic. Funciona en el navegador.

**Forma recomendada** (se parece más a cuando esté publicado). En la carpeta del proyecto, en una terminal:

```
python -m http.server 8000
```

y abre `http://localhost:8000`. Para detenerlo, `Ctrl + C`.

Para probar en tu celular, con el computador y el celular en el mismo wifi, abre `http://IP-DE-TU-PC:8000` en el celular.

## F. Publicarlo con una URL HTTPS

Genially necesita una dirección `https://`. Te recomiendo **GitHub Pages**, porque es gratis, estable y no vence.

1. Crea una cuenta en github.com si no tienes.
2. Crea un repositorio nuevo, público, por ejemplo `mision-colegio-limpio`.
3. Sube **el contenido** de la carpeta (no la carpeta misma): `index.html`, `style.css`, `data.js`, `script.js` y `assets`. Con «Add file → Upload files» basta.
4. Ve a **Settings → Pages**. En «Build and deployment» elige **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guarda.
5. Espera uno o dos minutos. La dirección será `https://TU-USUARIO.github.io/mision-colegio-limpio/`.
6. Ábrela en el computador y en el celular antes de seguir.

Alternativa: **Netlify Drop** (arrastras la carpeta a una página y te da una URL). No pude verificar sus condiciones actuales, así que lee si pide cuenta o si el enlace vence.

## G. Ponerlo en Genially

Lo que sí pude confirmar: Genially tiene una opción en su menú **Insertar** donde se pega código `iframe` para mostrar una página web dentro de un genially (el propio blog de Genially lo explica como un truco). Lo que **no** pude confirmar es en qué planes está disponible ni cómo se llama exactamente el botón hoy, porque su centro de ayuda no me cargó. Así que prueba en tu cuenta antes de depender de esto.

**Opción recomendada: incrustar con iframe**

1. Publica el juego y copia su URL (sección F).
2. En tu genially, abre la diapositiva donde irá el juego.
3. Entra a **Insertar** y busca la opción de contenido interactivo, web o *embed*. Los nombres cambian con el tiempo.
4. Pega este código, cambiando la URL por la tuya:

```html
<iframe src="https://TU-USUARIO.github.io/mision-colegio-limpio/"
        width="100%" height="720" style="border:0"
        allow="autoplay; fullscreen"
        title="Misión Colegio Limpio"></iframe>
```

5. Agranda el elemento para que ocupe casi toda la diapositiva. El juego se adapta al ancho, pero necesita buen alto, mínimo unos 700 px. Si queda corto, aparece una barra de desplazamiento dentro del marco, que funciona pero es incómoda.
6. Pulsa **Vista previa** y juega una misión completa. Hazlo también desde el celular, con el enlace público del genially.

**Plan B si no te deja incrustar:** pon un botón o texto con un **enlace externo** a la URL del juego, configurado para abrirse en una pestaña nueva. Siempre funciona. También puedes poner un código QR hacia la URL para que el curso lo abra desde el celular.

### Limitaciones que debes conocer

- **Audio:** la música nunca arranca sola. El jugador debe pulsar el botón. Dentro del marco funciona igual, pero algunos celulares bajan el volumen o lo bloquean según su configuración.
- **Progreso:** se guarda mientras la pestaña esté abierta. Si el navegador bloquea el almacenamiento dentro de marcos (pasa en algunos Safari), el progreso se pierde al recargar, pero el juego sigue funcionando.
- **Navegación:** el juego tiene su propio menú. Los botones de Genially y los del juego no se hablan entre sí.
- **Puntos:** el juego no envía el puntaje a Genially ni a ningún lado. Se ve solo en pantalla.
- **Pantalla completa:** si el iframe queda pequeño en celular, abrir el juego en pestaña propia se juega mejor.

**No he podido probarlo dentro de Genially**, así que no afirmo que ya esté integrado. Eso lo confirmas tú con la lista de abajo.

## H. Lista de pruebas

Marca cada una cuando la hayas hecho.

**Misión 1**
- [ ] 1.1: salen 5 residuos de uno en uno. Elige una caneca mala y comprueba que te deja reintentar. Acierto a la primera = 10 puntos, tras un error = 5.
- [ ] 1.2: hay que pulsar «Revelar residuo» antes de elegir. Los residuos no se repiten con los de 1.1. Al terminar sale la insignia Clasificación.

**Misión 2**
- [ ] 2.1: tocar los 11 residuos del patio, elegir «Recogerlo» y la caneca. Probar elegir «Dejarlo donde está». Al final salen «¡Patio limpio!» y chispas.
- [ ] 2.2: 5 situaciones, cada una con explicación y botón para continuar.

**Misión 3**
- [ ] 3.1: aparece el aviso de que son escenarios de ejemplo. Evaluar las 4 zonas del mapa. Equivocarse una vez y reintentar.
- [ ] 3.2: elegir una zona, marcar varias medidas, revisar el plan. Con las 4 buenas sale «Plan coherente». Probar «Mejorar mi plan».

**Misión 4**
- [ ] 4.1: el reloj baja desde 45. Probar con teclas 1, 2 y 3. Dejar que se acabe el tiempo y ver que muestra resultados.
- [ ] 4.2: 8 residuos seguidos. Los errores no reinician la partida. Con 3, 5 y 8 aciertos seguidos aparecen bonificaciones.

**Puntos y progreso**
- [ ] El puntaje máximo es 400 y la pantalla final nunca muestra más.
- [ ] Pulsar muchas veces seguidas la misma respuesta no suma puntos repetidos.
- [ ] Las misiones 2, 3 y 4 están bloqueadas hasta terminar la anterior.
- [ ] «Reiniciar misión» pide una segunda pulsación y borra solo esa misión.
- [ ] Pantalla final: puntaje, aciertos, errores, misiones, insignias, título, mensaje, «VOLVER A JUGAR» y «VOLVER AL MENÚ».

**Audio**
- [ ] Sin pulsar nada, no suena música.
- [ ] Con `musica.mp3` puesto: reproducir, pausar, silenciar y volumen funcionan.
- [ ] Los efectos se apagan con su botón sin afectar la música.
- [ ] Sin el archivo de música, el juego sigue y muestra el aviso.

**Dispositivos**
- [ ] Computador, tableta y celular (vertical y horizontal): nada se sale de la pantalla.
- [ ] En celular, los botones de caneca se pulsan fácil y el botón de audio no tapa nada.
- [ ] Navegar solo con teclado: Tab, Enter y teclas 1, 2 y 3.

### Lo que ya probé yo

Con un navegador automatizado (Chromium, en escritorio y en tamaño de celular) jugué las 8 submisiones completas con respuestas perfectas. El puntaje final salió 392 de 400, sin errores de consola ni archivos faltantes, y comprobé que los 11 residuos y las 4 zonas del mapa se pueden tocar con el dedo. **No lo probé en celulares reales, en Safari ni dentro de Genially.**

## Decisiones de contenido que conviene revisar con tu profesor

- **Caja de jugo:** la clasifiqué como **aprovechable (blanca)** si está vacía, aplastada y seca, porque muchas rutas la reciben, y lo explico en el juego. Como depende de tu ciudad, confirma la regla local y, si en tu colegio va a la negra, cambia `caneca: 'blanca'` a `'negra'` en `data.js` (residuo `jugo`) y ajusta su explicación.
- **Empaque de mecato y vaso de icopor:** van a la negra porque en la mayoría de lugares no se reciclan.
- **Zonas de la misión 3:** los casos son inventados y el juego lo avisa en pantalla.

## Puntaje

| Reto | Máximo |
|---|---|
| 1.1 y 1.2 | 50 + 50 |
| 2.1 y 2.2 | 55 + 45 |
| 3.1 y 3.2 | 40 + 50 |
| 4.1 y 4.2 | 40 + 70 |
| **Total** | **400** |

Los títulos se calculan con el porcentaje: 0 a 40% Explorador Ambiental, 41 a 70% Aprendiz Ecológico, 71 a 90% Ecoexperto, 91 a 100% Guardián Ambiental. El máximo se calcula solo en `data.js`, así que si cambias puntajes o preguntas, todo sigue siendo coherente.
