'use strict';
/* ==========================================================================
   MISIÓN COLEGIO LIMPIO · Contenido del juego
   Aquí están los textos, residuos, preguntas y puntajes. Si quieres cambiar
   una explicación o una pregunta, este es el único archivo que debes tocar.
   ========================================================================== */

const MCL = {
  titulo: 'Misión Colegio Limpio',
  eslogan: 'Tu basura no desaparece. Tú decides dónde termina.',

  /* Ruta del archivo de música (pon aquí tu MP3, ver README) */
  rutaMusica: 'assets/audio/musica.mp3',
  volumenInicial: 0.2,

  /* Reto relámpago */
  tiempoRelampago: 45,   // segundos
  cantidadRelampago: 8,  // residuos
  cantidadRacha: 8,

  /* ---------- Puntajes ---------- */
  puntos: {
    '1.1': { primera: 10, reintento: 5 },
    '1.2': { primera: 10, reintento: 5 },
    '2.1': { primera: 5, reintento: 2 },
    '2.2': { acierto: 9 },
    '3.1': { primera: 10, reintento: 5 },
    '3.2': { medidaLimpia: 10, medidaConError: 5, bonificacion: 10 },
    '4.1': { acierto: 5 },
    '4.2': { acierto: 5, bonos: { 3: 5, 5: 10, 8: 15 } }
  },
  /* Puntaje máximo posible: se calcula abajo, no lo escribas a mano */
  puntajeMaximo: 0,

  rangos: [
    { id: 'explorador', max: 40, nombre: 'Explorador Ambiental',
      mensaje: 'Buen comienzo. Ya diste los primeros pasos para cuidar el colegio. Si repites las misiones vas a subir de nivel muy rápido.' },
    { id: 'aprendiz', max: 70, nombre: 'Aprendiz Ecológico',
      mensaje: 'Vas muy bien. Ya sabes separar varios residuos. Con un repaso más te conviertes en experto.' },
    { id: 'ecoexperto', max: 90, nombre: 'Ecoexperto',
      mensaje: 'Excelente trabajo. Casi lo tienes todo. Con un pequeño repaso puedes llegar a Guardián Ambiental.' },
    { id: 'guardian', max: 100, nombre: 'Guardián Ambiental',
      mensaje: 'Lo lograste. Sabes dónde va cada residuo y cómo cuidar los espacios comunes. El colegio cuenta contigo.' }
  ],

  /* ---------- Canecas (código de colores de Colombia) ---------- */
  canecas: {
    blanca: { id: 'blanca', color: 'Blanca', grupo: 'Aprovechables', tecla: '1',
      img: 'assets/img/caneca_blanca.png',
      alt: 'Caneca blanca para residuos aprovechables: papel, cartón, plástico, vidrio y metales' },
    negra: { id: 'negra', color: 'Negra', grupo: 'No aprovechables', tecla: '2',
      img: 'assets/img/caneca_negra.png',
      alt: 'Caneca negra para residuos no aprovechables: servilletas usadas y papeles contaminados' },
    verde: { id: 'verde', color: 'Verde', grupo: 'Orgánicos', tecla: '3',
      img: 'assets/img/caneca_verde.png',
      alt: 'Caneca verde para residuos orgánicos: restos de comida, frutas, verduras y hojas' }
  },

  /* ---------- Residuos ----------
     "caneca" es la respuesta correcta. "explicacion" se muestra siempre. */
  residuos: {
    botella: { nombre: 'Botella de plástico', caneca: 'blanca', img: 'assets/img/botella.png',
      alt: 'Botella de plástico transparente con tapa azul',
      explicacion: 'El plástico limpio se aprovecha. Vacíala, aplástala y ciérrala con su tapa para que ocupe menos espacio.' },
    carton: { nombre: 'Caja de cartón', caneca: 'blanca', img: 'assets/img/carton.png',
      alt: 'Caja de cartón abierta',
      explicacion: 'El cartón limpio y seco se recicla. Si está mojado o con grasa ya no sirve y debe ir a la caneca negra.' },
    papel: { nombre: 'Hojas de papel limpias', caneca: 'blanca', img: 'assets/img/papel.png',
      alt: 'Pila de hojas de papel blancas',
      explicacion: 'El papel limpio y seco se recicla. Si tuviera comida o estuviera mojado, iría a la caneca negra.' },
    cascara: { nombre: 'Cáscara de banano', caneca: 'verde', img: 'assets/img/cascara.png',
      alt: 'Cáscara de banano abierta',
      explicacion: 'Es un resto de fruta, o sea un residuo orgánico. Se descompone y puede convertirse en abono.' },
    servilleta: { nombre: 'Servilleta usada', caneca: 'negra', img: 'assets/img/servilleta.png',
      alt: 'Servilleta de papel arrugada',
      explicacion: 'Una servilleta usada queda sucia con comida o saliva, y el papel contaminado no se puede reciclar.' },
    snacks: { nombre: 'Empaque de mecato', caneca: 'negra', img: 'assets/img/snacks.png',
      alt: 'Bolsa roja de papitas fritas',
      explicacion: 'Los empaques de mecato tienen varias capas pegadas de plástico y aluminio. En la mayoría de ciudades no se reciclan.' },
    jugo: { nombre: 'Caja de jugo', caneca: 'blanca', img: 'assets/img/jugo.png',
      alt: 'Caja de jugo de naranja con pitillo',
      explicacion: 'Mezcla cartón, plástico y aluminio. Si la vacías, la aplastas y la dejas seca, muchas rutas de reciclaje la reciben. Si en tu ciudad no la reciben, va a la negra, así que pregunta cómo funciona en tu colegio.' },
    lata: { nombre: 'Lata de gaseosa', caneca: 'blanca', img: 'assets/img/extra/lata.svg',
      alt: 'Lata de gaseosa roja y plateada',
      explicacion: 'El metal se aprovecha. Enjuágala, aplástala y échala sin restos de bebida.' },
    frasco: { nombre: 'Frasco de vidrio', caneca: 'blanca', img: 'assets/img/extra/frasco.svg',
      alt: 'Frasco de vidrio con tapa dorada',
      explicacion: 'El vidrio limpio se aprovecha. Si se rompe no lo toques: avisa a un adulto para que lo recoja con cuidado.' },
    hojas: { nombre: 'Hojas secas', caneca: 'verde', img: 'assets/img/extra/hojas.svg',
      alt: 'Tres hojas secas de árbol',
      explicacion: 'Las hojas secas son orgánicas. Se descomponen y sirven para hacer abono.' },
    vasoIcopor: { nombre: 'Vaso de icopor', caneca: 'negra', img: 'assets/img/extra/vaso_icopor.svg',
      alt: 'Vaso blanco de icopor',
      explicacion: 'El icopor casi nunca se recicla porque se desmenuza y se ensucia. En la mayoría de lugares va a la caneca negra.' },
    manzana: { nombre: 'Manzana mordida', caneca: 'verde', img: 'assets/img/extra/manzana.svg',
      alt: 'Manzana roja con una mordida',
      explicacion: 'Los restos de fruta son orgánicos y pueden convertirse en abono.' }
  },

  /* Misión 1 */
  sub11: ['botella', 'carton', 'cascara', 'servilleta', 'snacks'],
  sub12: ['papel', 'jugo', 'lata', 'hojas', 'vasoIcopor'],

  /* Pool para las misiones 4.1 y 4.2 (todos los residuos) */
  pool4: ['botella', 'carton', 'papel', 'cascara', 'servilleta', 'snacks', 'jugo',
          'lata', 'frasco', 'hojas', 'vasoIcopor', 'manzana'],

  /* ---------- Misión 2.1: el patio ----------
     x, y, w, h están en píxeles de la imagen original (469 x 454). */
  patio: {
    base: 'assets/img/patio_limpio.png',
    alt: 'Patio del colegio con una cancha, una banca y un árbol',
    w: 469, h: 454,
    items: [
      { id: 'botella1', residuo: 'botella', nombre: 'Botella de plástico', x: 37, y: 267, w: 77, h: 37 },
      { id: 'aplastado', residuo: 'botella', nombre: 'Botella de plástico aplastada', x: 102, y: 325, w: 64, h: 44 },
      { id: 'carton', residuo: 'carton', nombre: 'Caja de cartón', x: 134, y: 282, w: 57, h: 38 },
      { id: 'papel_chico', residuo: 'papel', nombre: 'Trozo de papel', x: 196, y: 289, w: 32, h: 15 },
      { id: 'servilleta', residuo: 'servilleta', nombre: 'Servilleta usada', x: 223, y: 241, w: 36, h: 23 },
      { id: 'jugo', residuo: 'jugo', nombre: 'Caja de jugo', x: 272, y: 263, w: 42, h: 54 },
      { id: 'snacks', residuo: 'snacks', nombre: 'Empaque de mecato', x: 343, y: 300, w: 53, h: 43 },
      { id: 'cascara', residuo: 'cascara', nombre: 'Cáscara de banano', x: 197, y: 311, w: 93, h: 54 },
      { id: 'papel_grande', residuo: 'papel', nombre: 'Hojas de papel', x: 313, y: 370, w: 71, h: 48 },
      { id: 'botella2', residuo: 'botella', nombre: 'Botella de plástico', x: 164, y: 381, w: 81, h: 56 },
      { id: 'papel_izq', residuo: 'papel', nombre: 'Hoja de papel', x: 19, y: 323, w: 44, h: 21 }
    ],
    /* Primera pregunta de la tarjeta: ¿qué haces? La tercera es la correcta. */
    acciones: [
      { id: 'dejar', texto: 'Dejarlo donde está',
        feedback: 'Si lo dejas ahí, el patio sigue sucio y el viento lo puede regar más. Mejor recógelo.' },
      { id: 'esperar', texto: 'Esperar a que otra persona lo recoja',
        feedback: 'Si todos esperamos a que otro lo haga, nadie lo hace. Cuidar el colegio es cosa de todos.' },
      { id: 'recoger', texto: 'Recogerlo y llevarlo a la caneca', correcta: true }
    ]
  },

  /* ---------- Misión 2.2: ¿Qué harías tú? ---------- */
  situaciones: [
    {
      id: 's1',
      texto: 'Terminaste de comer unas papitas y tienes el empaque en la mano. ¿Qué haces?',
      opciones: [
        { texto: 'Lo guardo debajo del pupitre para que nadie lo vea.', ok: false,
          why: 'Eso solo esconde la basura. Se queda en el salón y alguien más tiene que recogerla.' },
        { texto: 'Lo llevo a la caneca negra.', ok: true,
          why: 'Muy bien. Los empaques de mecato son no aprovechables y van a la caneca negra.' },
        { texto: 'Lo tiro al piso, seguro alguien lo recoge.', ok: false,
          why: 'Tirar basura al piso ensucia el colegio y cada uno es responsable de lo que bota.' }
      ]
    },
    {
      id: 's2',
      texto: 'Un compañero termina su botella de agua y la deja caer en el patio. ¿Qué haces?',
      opciones: [
        { texto: 'Me río y sigo caminando.', ok: false,
          why: 'Reírse no ayuda. Con el ejemplo y las palabras amables se cambian los hábitos.' },
        { texto: 'Le digo con respeto que la recoja y la ponga en la caneca blanca.', ok: true,
          why: 'Correcto. Un recordatorio amable ayuda mucho, y la botella de plástico va a la caneca blanca.' },
        { texto: 'La pateo hacia otra zona para que no se vea.', ok: false,
          why: 'Moverla no resuelve nada. La basura debe llegar a la caneca correcta.' }
      ]
    },
    {
      id: 's3',
      texto: 'Ves una cáscara de mandarina en el pasillo y nadie parece haberla visto. ¿Qué haces?',
      opciones: [
        { texto: 'La dejo, yo no la tiré.', ok: false,
          why: 'Aunque no la hayas tirado tú, puedes ayudar. Un pasillo limpio es mejor para todos.' },
        { texto: 'La recojo, la llevo a la caneca verde y me lavo las manos.', ok: true,
          why: 'Excelente. Las cáscaras son orgánicas y van a la caneca verde. Lavarse las manos después siempre es buena idea.' },
        { texto: 'La escondo detrás de una planta.', ok: false,
          why: 'Esconderla ensucia la zona verde y atrae insectos.' }
      ]
    },
    {
      id: 's4',
      texto: 'En clase de artes te sobraron hojas de papel limpias que ya no necesitas. ¿Qué haces?',
      opciones: [
        { texto: 'Las pongo en la caneca blanca, limpias y secas.', ok: true,
          why: 'Muy bien. El papel limpio y seco se puede reciclar, y por eso va a la caneca blanca.' },
        { texto: 'Las pongo en la caneca verde porque vienen de un árbol.', ok: false,
          why: 'Aunque el papel viene de los árboles, no es un resto de comida. El papel limpio va a la caneca blanca.' },
        { texto: 'Las arrugo y las dejo en el salón.', ok: false,
          why: 'Dejarlas en el salón hace más trabajo a los demás y se pierde un material reciclable.' }
      ]
    },
    {
      id: 's5',
      texto: 'Es la hora del descanso y la caneca del patio está llena hasta el borde. ¿Qué haces?',
      opciones: [
        { texto: 'Dejo mi basura al lado de la caneca.', ok: false,
          why: 'La basura al lado de la caneca se riega con el viento y la tumban los animales.' },
        { texto: 'Aviso a un profesor o al monitor ambiental para que la vacíen.', ok: true,
          why: 'Correcto. Avisar es la forma de resolverlo. Mientras tanto, guarda tu residuo hasta que haya espacio.' },
        { texto: 'La aplasto con el pie para meter más cosas.', ok: false,
          why: 'Así se rompe la caneca y la basura se sale. Mejor que la vacíen.' }
      ]
    }
  ],

  /* ---------- Misión 3.1: Mapa ---------- */
  niveles: [
    { id: 'bien', texto: 'Va bien', clase: 'nivel-bien' },
    { id: 'atencion', texto: 'Necesita atención', clase: 'nivel-atencion' },
    { id: 'urgente', texto: 'Atención urgente', clase: 'nivel-urgente' }
  ],
  mapa: { img: 'assets/img/mapa.png', alt: 'Mapa ilustrado del colegio con zona verde, pasillos, canchas y patio', w: 508, h: 467 },
  zonas: [
    { id: 'zonaverde', nombre: 'Zona verde', nivel: 'urgente',
      rect: { x: 20, y: 14, w: 195, h: 138 },
      escenario: 'Entre las plantas aparecen empaques de mecato y bolsas. No hay ninguna caneca cerca.',
      porque: 'Sin canecas cerca, la basura se queda entre las plantas y puede dañarlas. Es urgente.' },
    { id: 'pasillos', nombre: 'Pasillos', nivel: 'bien',
      rect: { x: 216, y: 26, w: 254, h: 130 },
      escenario: 'Solo se encontró una servilleta. Hay una caneca en cada esquina y el piso está limpio.',
      porque: 'Está limpio y tiene canecas bien ubicadas. Va bien, solo hay que mantenerlo así.' },
    { id: 'canchas', nombre: 'Canchas', nivel: 'atencion',
      rect: { x: 44, y: 160, w: 188, h: 130 },
      escenario: 'Junto a la cancha hay algunas botellas vacías. Hay canecas cerca, pero casi nadie las usa.',
      porque: 'Hay canecas pero no se usan. Conviene reforzar el hábito antes de que el problema crezca.' },
    { id: 'patio', nombre: 'Patio', nivel: 'urgente',
      rect: { x: 284, y: 168, w: 184, h: 160 },
      escenario: 'Después del descanso se ven muchas envolturas, botellas y cáscaras en el piso. La caneca está llena.',
      porque: 'Hay mucha basura en el piso y la caneca está llena. Necesita atención urgente.' }
  ],

  /* ---------- Misión 3.2: Plan de rescate ---------- */
  medidas: [
    { id: 'senal', texto: 'Instalar señalización clara', ok: true,
      aporte: 'Los carteles y colores recuerdan en qué caneca va cada residuo, justo donde se necesita.' },
    { id: 'canecas', texto: 'Reforzar el uso de las canecas', ok: true,
      aporte: 'Con canecas suficientes, visibles y siempre cerca, es más fácil botar bien que dejar la basura en el piso.' },
    { id: 'educar', texto: 'Hacer actividades educativas', ok: true,
      aporte: 'Los juegos, carteleras y charlas ayudan a entender por qué se separa, y así los hábitos cambian de verdad.' },
    { id: 'monitores', texto: 'Organizar monitores ambientales', ok: true,
      aporte: 'Estudiantes que cuidan la zona en cada descanso recuerdan a los demás y avisan cuando una caneca se llena.' },
    { id: 'castigo', texto: 'Dejar a todo el curso sin recreo', ok: false,
      aporte: 'Un castigo general no enseña a separar ni a cuidar. Se aprende mejor participando.' },
    { id: 'aseo', texto: 'Dejar todo el trabajo al personal de aseo', ok: false,
      aporte: 'El personal de aseo ayuda mucho, pero cuidar el colegio es tarea de todos. Si cada quien bota bien, el trabajo se reparte.' }
  ],

  /* ---------- Insignias ---------- */
  insignias: {
    clasificacion: { nombre: 'Clasificación', img: 'assets/img/insignia_clasificacion.png',
      alt: 'Insignia verde Clasificación', como: 'Completa La caneca misteriosa (1.2).' },
    patio: { nombre: 'Patio limpio', img: 'assets/img/insignia_patio_limpio.png',
      alt: 'Insignia azul Patio limpio', como: 'Recoge todos los residuos del patio (2.1).' },
    detective: { nombre: 'Detective ambiental', img: 'assets/img/insignia_detective.png',
      alt: 'Insignia amarilla Detective ambiental', como: 'Evalúa las cuatro zonas del colegio (3.1).' },
    racha: { nombre: 'Racha ecológica', img: 'assets/img/insignia_racha.png',
      alt: 'Insignia morada Racha ecológica', como: 'Logra 5 aciertos seguidos en la Racha ecológica (4.2).' },
    guardian: { nombre: 'Guardián ambiental', img: 'assets/img/insignia_guardian.png',
      alt: 'Insignia dorada Guardián ambiental', como: 'Termina con 91% o más del puntaje total.' }
  },

  /* ---------- Misiones ---------- */
  misiones: [
    { id: 1, nombre: '¿Dónde va?', objetivo: 'Aprende a clasificar los residuos en la caneca correcta.',
      subs: [ { id: '1.1', nombre: 'Clasificación básica' }, { id: '1.2', nombre: 'La caneca misteriosa' } ] },
    { id: 2, nombre: 'El descanso', objetivo: 'Mira el problema de los residuos abandonados y actúa.',
      subs: [ { id: '2.1', nombre: 'Limpia el patio' }, { id: '2.2', nombre: '¿Qué harías tú?' } ] },
    { id: 3, nombre: 'Zona crítica', objetivo: 'Encuentra las zonas que necesitan ayuda y arma un plan.',
      subs: [ { id: '3.1', nombre: 'Detectives ambientales' }, { id: '3.2', nombre: 'Plan de rescate' } ] },
    { id: 4, nombre: 'Decide rápido', objetivo: 'Clasifica con rapidez y mantén tu racha.',
      subs: [ { id: '4.1', nombre: 'Clasificación relámpago' }, { id: '4.2', nombre: 'Racha ecológica' } ] }
  ]
};

/* Cálculo automático del puntaje máximo, para que siempre sea coherente */
(function () {
  const p = MCL.puntos;
  const m11 = MCL.sub11.length * p['1.1'].primera;
  const m12 = MCL.sub12.length * p['1.2'].primera;
  const m21 = MCL.patio.items.length * p['2.1'].primera;
  const m22 = MCL.situaciones.length * p['2.2'].acierto;
  const m31 = MCL.zonas.length * p['3.1'].primera;
  const validas = MCL.medidas.filter(function (x) { return x.ok; }).length;
  const m32 = validas * p['3.2'].medidaLimpia + p['3.2'].bonificacion;
  const m41 = MCL.cantidadRelampago * p['4.1'].acierto;
  const bonos = Object.values(p['4.2'].bonos).reduce(function (a, b) { return a + b; }, 0);
  const m42 = MCL.cantidadRacha * p['4.2'].acierto + bonos;
  MCL.maximos = { '1.1': m11, '1.2': m12, '2.1': m21, '2.2': m22, '3.1': m31, '3.2': m32, '4.1': m41, '4.2': m42 };
  MCL.puntajeMaximo = m11 + m12 + m21 + m22 + m31 + m32 + m41 + m42;
})();
