// ===== Magic Film - Maqueta Interactiva v 0.1 =====

// ===== BASE DE DATOS SIMULADA DE PELÍCULAS =====

const moviesDB = {

    // =============================================
    //  MIDSOMMAR — MODO PROFUNDO
    // =============================================
    'midsommar': {
        id: 'midsommar', title: 'Midsommar', highlight: '', year: '2019', genre: 'Folk Horror',
        duration: '2h 28min', type: 'profound', rating: '7.1', awards: '27 Premios', prize: 'Saturn Award',
        synopsis: 'Una pareja en crisis viaja a Suecia para un festival rural que se celebra solo cada 90 años. Lo que parece un paraíso nórdico se convierte en una pesadilla de rituales paganos.',
        fullSynopsis: 'Dani Ardor acaba de perder a toda su familia en una tragedia. Su novio Christian, que quería terminar la relación, la lleva por lástima a Suecia con sus amigos. La comunidad de Hårga los recibe con flores y rituales que pronto revelan su oscuro propósito. Es, en el fondo, una historia de ruptura amorosa narrada como cuento de terror folclórico.',
        poster: '../assets/images/Midsommar.jpg', hero: '../assets/images/MidsommarBanner.jpg',
        cast: [
            { name: 'Florence Pugh', role: 'Dani Ardor', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
            { name: 'Jack Reynor', role: 'Christian Hughes', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
            { name: 'Will Poulter', role: 'Mark', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
            { name: 'William J. Harper', role: 'Josh', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
        ],
        stats: [
            { value: '27', color: 'yellow', label: 'Premios' },
            { value: '$41M', color: 'green', label: 'Recaudación' },
            { value: '7.1', color: 'red', label: 'IMDb' },
            { value: '$9M', color: 'blue', label: 'Presupuesto' }
        ],
        analysis: {
            intro: 'Midsommar no es una película de terror convencional. Es una autopsia emocional de una relación tóxica, envuelta en luz perpetua y rituales paganos. Ari Aster convierte el verano sueco en el escenario más perturbador del cine moderno.',
            sections: [
                { title: 'El viaje como metáfora del duelo', text: 'Todo en Midsommar refleja el estado emocional de Dani. La película abre con oscuridad absoluta y migra hacia una luz cegadora e interminable. Este paso no es liberación: es disociación. Dani no sana, se pierde en algo más grande que ella misma.', quote: { text: 'Una película extraordinaria sobre el dolor, los rituales y la transformación personal. Perturbadora por las razones correctas.', cite: 'The Guardian, 2019' } },
                { title: 'El simbolismo de los rituales Hårga', text: 'Los rituales no son invención pura: Ari Aster investigó antroposofía y folclore escandinavo. El Attestupa (el salto del anciano) refleja tradiciones reales de sacrificio voluntario. La comunidad Hårga funciona como una mente colmena donde el dolor individual se disuelve en lo colectivo —algo que Dani, profundamente sola, inconscientemente busca.' },
                { title: 'El vestido de flores: coronación o posesión', text: 'El final, cuando Dani es coronada May Queen y cubierta de flores, puede leerse de dos formas opuestas: como liberación de una relación que la oprimía, o como su total absorción por un culto. Aster no elige por el espectador. La sonrisa final de Dani condensa toda la ambigüedad moral de la película.' },
                { title: 'Técnica cinematográfica: terror a plena luz', text: 'El DP Pawel Pogorzelski filmó con luz natural sueca. Nunca hay oscuridad para esconder el horror: todo ocurre con claridad sobrenatural. Los drones que voltean 180° al llegar a Suecia invierten literalmente el mundo. La música de Bobby Krlic usa coros femeninos que imitan el llanto de Dani.' }
            ]
        },
        symbolism: [
            { icon: 'fas fa-sun', title: 'La luz perpetua', text: 'El sol que nunca se pone representa la imposibilidad de esconderse. De los rituales, de las emociones, de uno mismo. Es terror sin sombras ni oscuridad donde refugiarse.' },
            { icon: 'fas fa-seedling', title: 'Las flores y el ciclo', text: 'Cada elemento floral tiene un propósito ritual. Los bordados en las paredes de la aldea narran la historia completa del ciclo Hårga. El espectador atento puede leerlos como un libro.' },
            { icon: 'fas fa-fire', title: 'El oso: contenedor del mal', text: 'En la mitología nórdica el oso absorbe el espíritu de lo que lleva dentro. Poner a Christian en el oso no es solo ejecutarlo: es purgar su energía negativa de la tierra de Hårga para siempre.' },
            { icon: 'fas fa-eye', title: 'Las runas talladas', text: 'Las runas por todo el poblado no son decorativas. Cada una tiene un significado específico sobre fertilidad, muerte o protección que Aster investigó durante meses antes del rodaje.' }
        ],
        themes: [
            { title: 'La ruptura tóxica como terror', relevance: 'Tema Central', text: 'Ari Aster escribió Midsommar tras una ruptura personal. La relación de Dani y Christian es tan dolorosamente real porque nació de esa experiencia. El horror exterior refleja el horror interior de una relación que ya murió pero ninguno sabe cómo terminar.' },
            { title: 'Comunidad vs. Individualismo', relevance: 'Metáfora Principal', text: 'La propuesta más inquietante: ¿qué pasaría si una comunidad realmente compartiera el dolor? Los Hårga lloran juntos, ríen juntos, mueren juntos. Es perturbador precisamente porque en algún nivel parece deseable para quien está solo.' },
            { title: 'Folk Horror y el retorno ancestral', relevance: 'Subgénero', text: 'Junto a The Witch (2015), Midsommar pertenece al renacimiento del folk horror —un género que enfrenta al individuo moderno contra fuerzas colectivas ancestrales. La referencia directa e intencionada es The Wicker Man (1973).' }
        ],
        director: {
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            name: 'Ari Aster',
            role: 'Director y Guionista',
            bio: 'Graduado del American Film Institute. Su debut Hereditary (2018) es considerado un clásico del terror moderno. Midsommar es su segunda película. Ambas exploran trauma familiar y duelo a través de un terror que incomoda más que asusta.',
            style: [
                { bold: 'Terror de proceso', text: 'No busca sustos sino terror psicológico acumulativo. El espectador no sabe cuándo empezó a sentirse incómodo' },
                { bold: 'Planos simétricos', text: 'Influencia directa de Kubrick en la geometría visual. Cada encuadre en Midsommar es calculadamente perfecto' },
                { bold: 'Ambigüedad moral', text: 'Nunca dice al espectador qué pensar. El final de Midsommar es radicalmente abierto a interpretación personal' },
                { bold: 'Trauma autobiográfico', text: 'Cada película procesa experiencias personales: duelo familiar en Hereditary, ruptura amorosa en Midsommar' }
            ]
        },
        context: [
            { icon: 'fas fa-film', title: 'Rodada en Budapest, no en Suecia', text: 'Aunque transcurre en Hälsingland, Suecia, toda la película fue rodada en Budapest. El equipo construyó la aldea de Hårga desde cero basándose en granjas históricas suecas del siglo XIX. El festival Midsommar existe en Suecia, pero sin rituales de sangre.' },
            { icon: 'fas fa-globe', title: 'El renacimiento del Folk Horror', text: 'A mediados de los 2010 el folk horror experimentó un renacimiento con The Witch y Midsommar. El subgénero explora el miedo a lo rural, lo ancestral y lo colectivo que el mundo moderno ha perdido pero no olvidado.' },
            { icon: 'fas fa-cut', title: "Director's Cut: 30 minutos más", text: 'Existe una versión extendida de 3h 58min que profundiza en la relación de Dani y Christian antes del viaje. Aster considera esta su versión definitiva. Cambia radicalmente cómo se lee el personaje de Christian.' }
        ],
        youtube: { id: 'NI2g7yoRcXs', label: 'El Verdadero Significado de MIDSOMMAR (Detalles + Explicación + Análisis)' }
    },

    // =============================================
    //  LA MONJA — MODO ENTRETENIMIENTO
    // =============================================
    'monja': {
        id: 'monja', title: 'La Monja', highlight: 'Monja', year: '2018', genre: 'Terror Gótico',
        duration: '1h 36min', type: 'entertainment', rating: '5.4', boxoffice: '$365M', audience: '72%',
        synopsis: 'El Vaticano envía a un sacerdote y una novicia a investigar el suicidio de una monja en un monasterio de Rumanía. Lo que encuentran es Valak: una entidad demoníaca con siglos de historia.',
        fullSynopsis: 'En 1952, el monasterio de Cârţa en Rumanía esconde un secreto oscuro: una grieta en las catacumbas sella a Valak, demonio con forma de monja. Cuando una novicia se suicida para no ser poseída, el Vaticano manda al Padre Burke y a la Hermana Irene. Es la quinta entrega del Conjuring Universe y la precuela que explica el origen del icono más famoso de la saga.',
        poster: '../assets/images/Nun.jpg', hero: '../assets/images/Nun2.jpeg',
        cast: [
            { name: 'Taissa Farmiga', role: 'Hermana Irene', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
            { name: 'Demián Bichir', role: 'Padre Burke', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
            { name: 'Jonas Bloquet', role: 'Frenchie', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
            { name: 'Bonnie Aarons', role: 'Valak / La Monja', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
        ],
        stats: [
            { value: '26%', color: 'red', label: 'Rotten Tomatoes' },
            { value: '$365M', color: 'green', label: 'Recaudación' },
            { value: '5.4', color: 'yellow', label: 'IMDb' },
            { value: '5ª', color: 'blue', label: 'Del Conjuroverso' }
        ],
        analysis: {
            intro: 'La película más taquillera de toda la franquicia Warren. Con $22M de presupuesto recaudó $365M globales. La crítica la detesta, el público la adora. Valak se convirtió en el icono de terror de su generación —y el anuncio censurado en YouTube fue la mejor publicidad gratis de la historia.',
            points: [
                { title: '¿Por qué Valak da tanto miedo?', text: 'El diseño fue creado por James Wan para The Conjuring 2 (2016). El maquillaje tarda 3 horas en aplicarse. Bonnie Aarons tiene facciones naturalmente inquietantes que aprovechó conscientemente.' },
                { title: 'Rodada en el Castillo de Corvin:', text: 'Uno de los castillos medievales mejor conservados de Europa, con 600 años reales en Hunedoara, Rumanía. Se dice que fue prisión de Vlad el Empalador. El equipo reportó sonidos inexplicables de noche.' },
                { title: 'Las hermanas Farmiga en el universo:', text: 'Taissa Farmiga (Hermana Irene) es hermana menor de Vera Farmiga (Lorraine Warren). Un detalle familiar real que conecta las películas de una forma que ningún guionista podría haber inventado.' },
                { title: 'El anuncio censurado en YouTube:', text: 'El video promotional oficial fue eliminado antes del estreno por ser "demasiado perturbador". La polémica viral les generó millones de visitas y cobertura mediática completamente gratuita.' }
            ]
        },
        timeline: [
            { time: '00:05', color: 'red', tag: 'Inicio', title: 'Primera víctima: Hermana Victoria', text: 'La monja que abre el film se suicida para no ser poseída. Establece el tono: en este monasterio, la muerte es preferible a lo que acecha en las catacumbas.' },
            { time: '00:28', color: 'yellow', tag: 'Dato', title: 'El monasterio que nunca duerme', text: 'Las monjas rezan en turnos de 24h ininterrumpidos. Llevan décadas así para mantener al demonio encerrado. Y están agotadas — lo que explica que todo esté a punto de colapsar.' },
            { time: '01:02', color: 'cyan', tag: 'Giro', title: 'Irene ora sola — sin saberlo', text: 'Durante casi 20 minutos, Irene reza junto a otras monjas. Luego descubre que estaba completamente sola: ninguna de ellas era real. Uno de los mejores giros de la saga Warren.' },
            { time: '01:25', color: 'purple', tag: 'Clímax', title: 'La sangre de Cristo vs. Valak', text: 'El único arma efectiva resulta ser una reliquia con sangre de Cristo. La llave que llevaba la hermana suicidada desde el inicio guardaba esto. La pista estuvo siempre visible.' },
            { time: '01:34', color: 'red', tag: 'Conexión', title: 'Frenchie queda poseído', text: 'La escena final conecta directamente con The Conjuring (2013), explicando quién introduce a Valak en la vida de los Warren. El círculo del universo se cierra perfectamente.' }
        ],
        hotScenes: [
            { img: '../assets/images/Irene.jpg', timestamp: '01:02', title: 'Irene descubre que estaba sola', text: 'El momento más perturbador: cuando se revela que las monjas con quienes rezaba no eran reales. El silencio que le sigue es peor que cualquier susto convencional de la película.', tags: ['Psicológico', 'Giro'] },
            { img: '../assets/images/French.jpg', timestamp: '01:34', title: 'Frenchie es poseído por Valak', text: 'La escena que conecta con El Conjuro (2013). El epílogo que convierte toda la película en una pieza de un puzzle más grande. Quien vio el Conjuroverso lo reconoce inmediatamente.', tags: ['Conexión', 'Final'] }
        ],
        easterEggs: [
            { title: 'Las cruces invertidas en las paredes', text: 'Antes de cada aparición de Valak, si pausas el video puedes ver cruces invertidas talladas en las paredes del monasterio. Están visibles desde el primer plano de la película — nadie las nota la primera vez.' },
            { title: 'El ojo de Valak en los espejos', text: 'En varias escenas aparentemente vacías, el ojo de Valak aparece reflejado en un espejo o ventana por menos de 3 fotogramas. El equipo de edición los incluyó intencionalmente para los espectadores más atentos.' },
            { title: 'El libro del Duque siempre presente', text: 'El tomo que el Duque de Santa Carta usó para convocar a Valak aparece como elemento de atrezzo en el fondo de múltiples escenas, antes de ser protagonista de la trama hacia el final.' }
        ],
        curiosities: [
            { icon: 'fas fa-dollar-sign', title: 'Retorno del 1,561%', text: 'Con $22M de presupuesto y $365M de recaudación, La Monja es uno de los personajes de terror más rentables de la historia. Cada dólar invertido regresó multiplicado por 16.' },
            { icon: 'fas fa-ban', title: 'Anuncio censurado en YouTube', text: 'El video oficial fue eliminado antes del estreno por ser demasiado perturbador. La polémica viral les generó millones de visitas y cobertura mediática completamente gratuita.' },
            { icon: 'fas fa-chess-rook', title: 'Castillo con 600 años de historia', text: 'El Castillo de Corvin en Hunedoara, Rumanía. Una de las construcciones medievales mejor conservadas de Europa. La historia real del lugar es tan oscura como la ficción que alberga.' },
            { icon: 'fas fa-users', title: 'Las hermanas Farmiga', text: 'Taissa (Irene) y Vera Farmiga (Lorraine Warren) son hermanas en la vida real — conectadas dentro y fuera del Conjuring Universe de una forma que ningún guionista podría haber planeado mejor.' }
        ],
        youtube: { id: 'wFOn7tmDSSI', label: '37 Curiosidades, Secretos, Easter Eggs Y Referencias Que No Viste En La Monja (The Nun)' }
    },

    // =============================================
    //  LOKI — MODO ENTRETENIMIENTO
    // =============================================
    'loki': {
        id: 'loki', title: 'Loki', highlight: 'Loki', year: '2021', genre: 'Ciencia Ficción',
        duration: '2 Temporadas · 12 eps', type: 'entertainment', rating: '8.2', boxoffice: 'Disney+ #1', audience: '91%',
        synopsis: 'Una variante de Loki es capturada por la Autoridad de Variación Temporal (AVT). Lo que comienza como una misión para cazar variantes termina desatando el multiverso del MCU.',
        fullSynopsis: 'Después de robar el Tesseract en Endgame, este Loki alternativo es arrestado por la AVT. El agente Mobius le ofrece un trato: cazar una variante peligrosa de sí mismo. La serie introduce el multiverso, los Guardianes del Tiempo y Kang el Conquistador. La T2 concluye con Loki convirtiéndose en el guardián eterno de toda la realidad.',
        poster: '../assets/images/Loki.jpg', hero: '../assets/images/Loki.jpg',
        cast: [
            { name: 'Tom Hiddleston', role: 'Loki', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
            { name: 'Owen Wilson', role: 'Mobius M. Mobius', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
            { name: 'Sophia Di Martino', role: 'Sylvie', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
            { name: 'Jonathan Majors', role: 'He Who Remains', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
        ],
        stats: [
            { value: '91%', color: 'red', label: 'Audiencia' },
            { value: '#1', color: 'yellow', label: 'Disney+' },
            { value: '8.2', color: 'green', label: 'IMDb' },
            { value: '2', color: 'blue', label: 'Temporadas' }
        ],
        analysis: {
            intro: 'La serie que cambió el MCU para siempre. Loki introdujo el multiverso, presentó al próximo gran villano y le dio a Tom Hiddleston el rol definitivo de su carrera. La química entre Loki y Mobius es el corazón de todo.',
            points: [
                { title: 'Owen Wilson no leyó los cómics:', text: 'Wilson le pidió a Tom Hiddleston que le explicara TODO el MCU en persona. Tardaron horas. Fue la preparación más entretenida del proyecto según el propio Hiddleston.' },
                { title: 'El género de Loki es "fluido":', text: 'La AVT clasifica el género de Loki como "fluido" — un guiño a los cómics de Marvel donde Loki es no binario, y a la mitología nórdica donde Loki se transforma constantemente de forma.' },
                { title: 'Tom Hiddleston: 15 años en el rol:', text: 'Desde Thor (2011) hasta el final de T2 (2023). Hiddleston tiñe su cabello rubio de negro y se aclara la piel para cada producción. El actor más longevo del MCU en su personaje.' },
                { title: 'Kang fue introducido aquí primero:', text: 'Antes de Ant-Man 3, Kang fue presentado en el final de T1 como "He Who Remains". Toda la Saga del Multiverso del MCU nació en ese único episodio de esta serie.' }
            ]
        },
        timeline: [
            { time: 'T1 Ep.1', color: 'yellow', tag: 'Inicio', title: 'Loki es arrestado por la AVT', text: 'Después de robar el Tesseract en Endgame, es capturado. La AVT le muestra su propia vida en un VHS, incluyendo su muerte. El personaje cambia en ese instante.' },
            { time: 'T1 Ep.3', color: 'cyan', tag: 'Favorito', title: 'Lamentis-1: el planeta más triste', text: 'El episodio más elogiado visualmente. Loki y Sylvie atrapados en un planeta moribundo. Aquí se confirman sus sentimientos mutuos. El fandom entró en crisis total.' },
            { time: 'T1 Ep.6', color: 'red', tag: 'Histórico', title: 'Se libera el Multiverso', text: 'Sylvie mata a He Who Remains. La línea de tiempo sagrada se rompe en infinitas ramas. El MCU nunca volvió a ser el mismo. Todo lo que vino después nació aquí.' },
            { time: 'T2 Ep.6', color: 'purple', tag: 'Final', title: 'Loki: el nuevo Guardián del Tiempo', text: 'Para salvar a todos, Loki toma el peso del multiverso sobre sí mismo eternamente. El villano más amado completa su arco de héroe con el sacrificio más solitario de la franquicia.' }
        ],
        hotScenes: [
            { img: '../assets/images/Loki11.jpeg', timestamp: 'T1 Ep.6', title: 'La liberación del Multiverso', text: 'El momento que cambió el MCU. Cuando Sylvie mata a He Who Remains y las ramas temporales explotan en pantalla, el espectador siente que algo fundamental en el universo cambió para siempre.', tags: ['Histórico', 'MCU'] },
            { img: '../assets/images/Loki1.jpg', timestamp: 'T2 Ep.6', title: 'Loki sostiene el árbol del tiempo', text: 'El sacrificio final. Loki solo, cargando todo el multiverso por la eternidad. El arco más completo de todo el MCU termina con el personaje más solo y más poderoso del universo.', tags: ['Emotivo', 'Final'] }
        ],
        easterEggs: [
            { title: 'Miss Minutes y los años 50', text: 'La mascota animada de la AVT habla con acento del Sur de EE.UU. y está diseñada como los relojes de los años 50. Su estética retrofuturista esconde que es mucho más peligrosa de lo que aparenta.' },
            { title: 'La puerta número 1 de la AVT', text: 'El número de la puerta principal de la AVT es "1" — referencia directa al Universo Principal del MCU conocido como Tierra-616. Un detalle para fans del cómic enterrado en el set.' },
            { title: 'Las motos de agua de Mobius', text: 'La obsesión de Mobius con las motos de agua es un running gag de toda la serie. Nunca ha montado una en su vida. El final de T2 le da su merecido momento de revancha con ellas.' }
        ],
        curiosities: [
            { icon: 'fas fa-graduation-cap', title: 'El seminario del MCU', text: 'Todo el elenco nuevo recibió clases sobre el universo Marvel impartidas por el propio Tom Hiddleston. Owen Wilson fue el alumno más aplicado y entusiasta del grupo.' },
            { icon: 'fas fa-map-marker-alt', title: 'Rodada en Atlanta y Reino Unido', text: 'Los sets de la AVT de T1 fueron construidos en Atlanta, Georgia. La T2 se filmó en el Reino Unido. La estética retrofuturista de los años 70 fue una decisión deliberada: lo atemporal dentro del tiempo.' },
            { icon: 'fas fa-infinity', title: 'La serie que inició la Saga del Multiverso', text: 'Todo el Arco del Multiverso del MCU —Fases 4, 5 y 6— nació en el último minuto del episodio final de Loki T1. Sin esta serie, Spider-Man No Way Home y Doctor Strange 2 no existirían como los conocemos.' },
            { icon: 'fas fa-theater-masks', title: '15 años siendo Loki', text: 'Tom Hiddleston ha interpretado al mismo personaje desde Thor (2011) hasta Loki T2 (2023). El arco más largo y completo de cualquier actor en la historia del MCU.' }
        ],
        youtube: { id: '8go4lQnFuTo', label: 'LOKI: el ARTE de ENCONTRARSE a UNO MISMO' }
    },

    // =============================================
    //  SCARY MOVIE — MODO ENTRETENIMIENTO
    // =============================================
    'scary': {
        id: 'scary', title: 'Scary Movie', highlight: 'Scary Movie', year: '2000', genre: 'Comedia / Parodia',
        duration: '1h 28min', type: 'entertainment', rating: '6.3', boxoffice: '$278M', audience: '88%',
        synopsis: 'Un grupo de adolescentes es acosado por un asesino enmascarado mientras parodian sin piedad Scream, The Blair Witch Project, The Matrix, El Sexto Sentido y más. La comedia de terror más irreverente del año 2000.',
        fullSynopsis: 'Cindy Campbell y sus amigos tienen un secreto: atropellaron a alguien y lo tiraron al lago. Un año después, alguien con una máscara de Ghostface los elimina uno a uno de la manera más absurda posible. La película fusionó dos guiones distintos de parodia que la productora Dimension Films compró y combinó, resultando en más de 10 versiones del guion.',
        poster: '../assets/images/Scary.jpg', hero: '../assets/images/Scary.jpg',
        cast: [
            { name: 'Anna Faris', role: 'Cindy Campbell', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
            { name: 'Regina Hall', role: 'Brenda Meeks', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face' },
            { name: 'Shawn Wayans', role: 'Ray Wilkins', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
            { name: 'Marlon Wayans', role: 'Shorty', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' }
        ],
        stats: [
            { value: '35%', color: 'red', label: 'Rotten Tomatoes' },
            { value: '$278M', color: 'green', label: 'Recaudación' },
            { value: '6.3', color: 'yellow', label: 'IMDb' },
            { value: '$19M', color: 'blue', label: 'Presupuesto' }
        ],
        analysis: {
            intro: '$278 millones con solo $19M de presupuesto. Scary Movie es la película que su propio eslogan prometía que no existiría: "Sin piedad. Sin vergüenza. Sin secuelas." El éxito fue tan brutal que generó 4 secuelas y una nueva en desarrollo para 2026.',
            points: [
                { title: '¿Por qué Cindy se llama Campbell?', text: 'El apellido es un guiño a Neve Campbell de Scream. Así con todos: "Buffy" Gilmore mezcla a Sarah Michelle Gellar de Buffy y de Sé lo que Hiciste; "Drew" Decker es por Drew Barrymore de Scream.' },
                { title: '"Scary Movie" era el título de Scream:', text: 'Ese fue el título provisional de Scream (1996) antes de que Wes Craven lo cambiara. Los Wayans se lo apropiaron intencionalmente para crear el gag más meta de la historia del cine de parodia.' },
                { title: 'El cameo que nunca fue:', text: 'Jamie Lee Curtis, Britney Spears (rechazó el papel de Drew), Jared Leto (rechazó a Bobby para hacer Réquiem por un Sueño) y Alicia Silverstone declinaron participar. El casting de reemplazos terminó siendo perfecto.' },
                { title: 'Marlon Brando y $2 millones:', text: 'Para Scary Movie 2, Brando negoció $2M solo por aparecer en la parodia de El Exorcista. Sus problemas de salud lo impidieron finalmente. James Woods tomó el papel por considerablemente menos.' }
            ]
        },
        timeline: [
            { time: '00:03', color: 'yellow', tag: 'Inicio', title: 'La parodia perfecta de Scream', text: 'Carmen Electra como la chica que muere al inicio —igual que Drew Barrymore en Scream— pero el asesino se distrae con su belleza. El tono de toda la película queda establecido en 3 minutos.' },
            { time: '00:31', color: 'cyan', tag: 'Parodia', title: 'La escena del cine', text: 'Brenda arruina Shakespeare In Love hablando en voz alta, contando el final y encendiendo el celular. Los espectadores dentro del cine la atacan. Una crítica real al comportamiento de algunos públicos.' },
            { time: '00:52', color: 'red', tag: 'Acción', title: 'Pelea estilo Matrix', text: 'Cindy y el asesino pelean en cámara lenta estilo Matrix (estreno del año anterior). Con efectos especiales de bajo presupuesto que hacen la escena aún más graciosa de lo planeado originalmente.' },
            { time: '01:20', color: 'purple', tag: 'Final', title: 'El giro de Doofy', text: 'Parodia directa de The Usual Suspects: Doofy (que fingía ser discapacitado todo el film) camina perfectamente hacia un carro donde lo espera Gail. Nadie en el cine lo vio venir la primera vez.' }
        ],
        hotScenes: [
            { img: '../assets/images/Carmen.jpg', timestamp: '00:03', title: 'La apertura con Carmen Electra', text: 'La parodia de la apertura de Scream es perfecta: misma configuración, misma tensión, mismo resultado completamente diferente. Establece el contrato cómico con el espectador desde el primer minuto.', tags: ['Icónico', 'Parodia'] },
            { img: '../assets/images/Woof.jpg', timestamp: '01:20', title: 'El giro final de Doofy', text: 'El mejor final de la película. La parodia de The Usual Suspects ejecutada con un personaje que fingió discapacidad durante todo el film. Ridículo, brillante y completamente inesperado.', tags: ['Giro', 'Memorable'] }
        ],
        easterEggs: [
            { title: 'REDRUM en los vestuarios', text: 'El asesino susurra "REDRUM" (de El Resplandor) mientras acecha por los vestuarios. Si no conoces la referencia de Kubrick, suena como palabras aleatorias. Un guiño para quienes saben.' },
            { title: '"Scary Movie" en boca de Ghostface', text: 'El asesino en Scream original dice "scary movie" (película de miedo) durante la llamada inicial. Los Wayans convirtieron ese guiño interno en el título completo de su parodia.' },
            { title: 'Amistad 2: el falso tráiler', text: 'Antes de la película hay un falso tráiler de "Amistad 2" —parodia de Titanic con esclavos en un barco— que incluye un cameo del director Keenen Ivory Wayans como uno de los pasajeros del barco.' }
        ],
        curiosities: [
            { icon: 'fas fa-fire', title: 'Debut #1 con $42M en un fin de semana', text: 'Abrió en el primer puesto de taquilla con $42M —más del doble de su presupuesto total en un solo fin de semana. Miramax no esperaba ni remotamente este resultado.' },
            { icon: 'fas fa-scroll', title: 'Más de 10 versiones del guion', text: 'Marlon Wayans dijo en entrevistas que reescribieron el guion más de diez veces para fusionar dos proyectos distintos que Dimension Films había comprado por separado.' },
            { icon: 'fas fa-trophy', title: 'La más rentable en la historia de Miramax', text: 'Superó a Scream como la película más rentable en la historia de Miramax. Solo fue superada por Chicago (2002) dos años después.' },
            { icon: 'fas fa-film', title: 'Scream 3 se estrenó el mismo año', text: 'En el 2000 también se estrenó Scream 3. La parodia superó a la franquicia original en taquilla ese mismo año, lo que los propios Wayans consideraron la broma perfecta.' }
        ],
        youtube: { id: 'qHDW92ZdTRw', label: '15 Curiosidades de Scary Movie | Cosas que quizás no sabías' }
    },

    // Películas extra para búsqueda
    'endgame': {
        id: 'endgame', title: 'Avengers: Endgame', highlight: 'Endgame', year: '2019', genre: 'Acción',
        duration: '3h 2min', type: 'entertainment', rating: '8.4', boxoffice: '$2.7B', audience: '94%',
        synopsis: 'Los Vengadores restantes deben encontrar una manera de viajar en el tiempo para recuperar las Gemas del Infinito y revertir la masacre causada por Thanos.',
        fullSynopsis: 'Después de los eventos de Infinity War, los Vengadores supervivientes y sus aliados intentan revertir las acciones de Thanos viajando en el tiempo para recuperar las Gemas del Infinito.',
        poster: '../assets/images/Avengers.jpg',
        hero: '../assets/images/Avengers2.jpg',
        cast: [
            { name: 'Robert Downey Jr.', role: 'Iron Man', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
            { name: 'Chris Evans', role: 'Capitán América', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' }
        ],
        stats: [ { value: '94%', color: 'red', label: 'Rotten Tomatoes' }, { value: '$2.7B', color: 'green', label: 'Recaudación' } ],
        analysis: { intro: 'El cierre épico de 11 años del MCU.', points: [{ title: 'El fan service definitivo:', text: 'Todos los héroes del MCU reunidos para la batalla final.' }] },
        timeline: [{ time: '15:00', color: 'red', tag: 'Épico', title: 'Thor decapita a Thanos', text: '"Yo soy inevitable" — Thor le decapita. Problema resuelto... o no.' }],
        hotScenes: [{ img: '../assets/images/Yosoy.jpg', timestamp: '2:50:00', title: 'Yo soy Iron Man', text: 'El chasquido que salva al universo y define un personaje de 11 años.', tags: ['Épico', 'Final'] }],
        easterEggs: [{ title: '"On your left"', text: 'La frase que Sam le dice a Steve es la misma que Cap le dijo a él en Winter Soldier. El círculo se cierra.' }],
        curiosities: [{ icon: 'fas fa-clock', title: '3 horas 2 minutos', text: 'La película más larga del MCU hasta la fecha.' }],
        youtube: { id: 'hPsMN0nUS34', label: '30 DETALLES ALUCINANTES de VENGADORES ENDGAME' }
    },
    'jacobs_ladder': {
        id: 'jacobs_ladder', title: 'La Escalera de Jacob', highlight: 'Terror Psicológico', year: '1990', genre: 'Horror/Drama',
        duration: '1h 53min', type: 'profound', rating: '7.5', awards: 'Cult Classic', prize: 'Avoriaz Film Festival',
        synopsis: 'Jacob Singer, un veterano de Vietnam, intenta descubrir su pasado mientras sufre de fragmentación de la realidad y visiones demoníacas.',
        fullSynopsis: 'Tras regresar de la guerra, un cartero de Nueva York comienza a experimentar alucinaciones perturbadoras y recuerdos fragmentados. A medida que la línea entre la realidad, el purgatorio y la memoria se desvanece, Jacob debe enfrentar una verdad aterradora sobre su unidad militar.',
        poster: '../assets/images/Jacob.jpg', 
        hero: '../assets/images/Jacob2.jpg',
        cast: [
            { name: 'Tim Robbins', role: 'Jacob Singer', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
            { name: 'Elizabeth Peña', role: 'Jezzie', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' }
        ],
        stats: [{ value: '73%', color: 'red', label: 'Rotten Tomatoes' }, { value: '2', color: 'yellow', label: 'Premios Ganados' }, { value: '$26M', color: 'green', label: 'Recaudación' }, { value: '7.5', color: 'blue', label: 'IMDb' }],
        analysis: {
            intro: 'Un descenso dantesco a la psique de un hombre roto. Adrian Lyne utiliza el surrealismo para explorar el proceso de morir y la aceptación del trauma.',
            sections: [
                { title: 'La Naturaleza del Infierno', text: 'Basándose en las enseñanzas de Meister Eckhart, la película propone que el infierno no es un lugar, sino la resistencia del alma a soltar la vida.', quote: { text: 'Si tienes miedo de morir y te resistes, verás diablos arrancándote la vida. Pero si te liberas, los diablos se volverán ángeles.', cite: 'Meister Eckhart (citado en el film), 1990' } },
                { title: 'El Horror de lo Cotidiano', text: 'El genio del film reside en insertar lo grotesco en lo mundano: una fiesta de baile o un hospital se convierten en escenarios de pesadilla mediante efectos prácticos innovadores.' },
                { title: 'La Escalera: Ascensión o Caída', text: 'El título hace referencia al pasaje bíblico. Jacob está en una lucha espiritual donde cada nivel de su "alucinación" es un peldaño hacia la liberación de su dolor terrenal.' }
            ]
        },
        symbolism: [
            { icon: 'fas fa-subway', title: 'El Metro de Nueva York', text: 'Representa el purgatorio. Estaciones cerradas y vías sin salida simbolizan el estado de estancamiento espiritual de Jacob entre la vida y la muerte.' },
            { icon: 'fas fa-eye', title: 'La Mirada Fragmentada', text: 'El uso de vibraciones rápidas de cámara y rostros deformados representa la incapacidad de la mente para procesar un trauma bélico insoportable.' },
            { icon: 'fas fa-dove', title: 'Gabe (El Hijo)', text: 'Simboliza la pureza y la guía espiritual. Es la fuerza que finalmente ayuda a Jacob a subir la escalera y dejar atrás el sufrimiento.' },
            { icon: 'fas fa-pills', title: 'La Escalera Químicas', text: 'Una referencia a experimentos militares reales. Representa la traición del estado hacia el individuo, convirtiendo la mente en un arma y luego en una prisión.' }
        ],
        themes: [
            { title: 'Aceptación de la Muerte', relevance: 'Tema Central', text: 'La película es, en esencia, el proceso de un hombre aceptando su propia muerte en una camilla de campaña, construyendo una narrativa mental para despedirse.' },
            { title: 'Trauma de Guerra y Conspiración', relevance: 'Contexto Político', text: 'Explora los efectos psicológicos del agente naranja y otros experimentos químicos en soldados de Vietnam, mezclando paranoia con realidad.' },
            { title: 'Teología y Espiritualidad', relevance: 'Filosofía', text: 'Bebe directamente de la Divina Comedia y el Libro Tibetano de los Muertos, tratando la existencia como un tránsito de purificación.' }
        ],
        director: {
            photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            name: 'Adrian Lyne', role: 'Director',
            bio: 'Director británico conocido por thrillers visualmente estilizados. Con Jacob\'s Ladder, se alejó de sus dramas eróticos habituales para crear una de las visiones más perturbadoras del cine de los 90.',
            style: [
                { bold: 'Edición Frenética:', text: 'Uso de técnicas de obturación para crear movimientos inhumanos y aterradores en los "demonios".' },
                { bold: 'Atmósfera Opresiva:', text: 'Nueva York es retratada como un lugar sucio, oscuro y hostil que refleja el estado interno del protagonista.' },
                { bold: 'Simbolismo Religioso:', text: 'Integración de iconografía cristiana y oriental de manera orgánica en el guion.' },
                { bold: 'Efectos Prácticos:', text: 'Evitó el uso de efectos ópticos complejos, prefiriendo trucos de cámara en vivo para una sensación de realismo crudo.' }
            ]
        },
        context: [
            { icon: 'fas fa-vial', title: 'El experimento BZ', text: 'La película se inspiró en rumores reales sobre el uso de una droga llamada BZ en soldados en Vietnam para aumentar la agresividad.' },
            { icon: 'fas fa-film', title: 'Influencia en Silent Hill', text: 'Esta película es la principal inspiración visual y narrativa de la saga de videojuegos Silent Hill, especialmente el diseño de sus monstruos.' },
            { icon: 'fas fa-history', title: 'Legado del Horror Psicológico', text: 'En su estreno dividió a la crítica, pero hoy es considerada una obra maestra por su forma de tratar temas tan densos como el duelo y la metafísica.' }
        ],
        youtube: { id: 'KiCvRepakDg', label: 'La Escalera de Jacob | La PESADILLA entre la vida y la muerte (EXPLICACIÓN y ANÁLISIS)' }
    },
    'scream': {
        id: 'scream', title: 'Scream', highlight: '', year: '2022', genre: 'Terror',
        duration: '1h 54min', type: 'entertainment', rating: '6.9',
        boxoffice: '$137M', audience: '76%',
        synopsis: 'Un nuevo asesino con la máscara de Ghostface ataca Woodsboro, obligando a Sidney Prescott a volver a su pueblo natal.',
        fullSynopsis: 'Veinticinco años después de los ataques originales de Ghostface en Woodsboro, un nuevo asesino usa la máscara para atacar a un grupo de adolescentes conectados a los crímenes del pasado.',
        poster: '../assets/images/Scream.jpg',
        hero: '../assets/images/Scream2.jpeg',
        cast: [{ name: 'Neve Campbell', role: 'Sidney Prescott', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' }],
        stats: [{ value: '76%', color: 'red', label: 'Rotten Tomatoes' }],
        analysis: { intro: 'El requiem y reinicio de un clásico del terror.', points: [{ title: 'Legacy sequel:', text: 'Conecta personajes originales con una nueva generación de forma hábil.' }] },
        timeline: [{ time: '00:10', color: 'red', tag: 'Inicio', title: 'El regreso de Ghostface', text: 'La icónica llamada telefónica actualizada para la era streaming.' }],
        hotScenes: [{ img: '../assets/images/llamada.jpg', timestamp: '00:10', title: 'La llamada de Ghostface', text: 'Actualización del icónico comienzo de la saga original.', tags: ['Icónico', 'Terror'] }],
        easterEggs: [{ title: 'Referencias a Stab', text: 'Las películas "Stab" dentro del universo de Scream son parodias de los propios eventos reales de la saga.' }],
        curiosities: [{ icon: 'fas fa-film', title: '26 años de la saga', text: 'La quinta entrega honra la trilogía original mientras reinicia la franquicia.' }],
        youtube: { id: 'KiCvRepakDg', label: '30 Curiosidades de CREAM 2022' }
    },
    'ironman': {
        id: 'ironman', title: 'Iron Man', highlight: '', year: '2008', genre: 'Acción',
        duration: '2h 6min', type: 'entertainment', rating: '7.9',
        boxoffice: '$585M', audience: '91%',
        synopsis: 'Tony Stark, millonario fabricante de armas, construye una armadura tecnológica para escapar del cautiverio y convertirse en Iron Man.',
        fullSynopsis: 'Tony Stark es capturado por terroristas y forzado a construir un arma. En cambio, construye una armadura de alta tecnología y escapa. De vuelta en casa, perfecciona la armadura y adopta la identidad de Iron Man.',
        poster: '../assets/images/Iron.jpg',
        hero: '../assets/images/iron2.jpg',
        cast: [{ name: 'Robert Downey Jr.', role: 'Tony Stark', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' }],
        stats: [{ value: '94%', color: 'red', label: 'Rotten Tomatoes' }],
        analysis: { intro: 'La película que dio inicio a la era del superhéroe moderno.', points: [{ title: 'Punto de partida del MCU:', text: 'Nadie sabía que este film construiría el universo cinematográfico más rentable de la historia.' }] },
        timeline: [{ time: '00:05', color: 'red', tag: 'Inicio', title: 'Tony es capturado', text: 'El incidente que transforma al magnate de armas en superhéroe.' }],
        hotScenes: [{ img: '../assets/images/iron3.jpg', timestamp: '01:30', title: 'Primera vuelta de Iron Man', text: 'El traje Mark III en su primer vuelo. El nacimiento de un icono.', tags: ['Épico', 'Inicio'] }],
        easterEggs: [{ title: '"I am Iron Man"', text: 'La conferencia de prensa final fue improvisada por Downey Jr. Cambió el MCU: los superhéroes podían revelar su identidad.' }],
        curiosities: [{ icon: 'fas fa-film', title: 'El inicio de todo', text: 'Iron Man (2008) fue el primer film del MCU. Recaudó $585M con $140M de presupuesto.' }],
        youtube: { id: 'P0KBt3sy8j0', label: '47 DETALLES que te PERDISTE en IRON MAN (Análisis, Easter Eggs y Curiosidades)' }
    }
};

// =============================================
//  ESTADO DE LA APLICACIÓN
// =============================================
let userProfile = { username: 'CinefiloExplorador', level: 'entusiasta', genres: [], isFirstTime: true };
let setupState = { level: 'entusiasta', genres: [] };

// =============================================
//  NAVEGACIÓN
// =============================================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) link.classList.add('active');
    });
    window.scrollTo(0, 0);
}

// =============================================
//  SETUP PROFILE
// =============================================
function selectLevel(element, level) {
    document.querySelectorAll('#setup-profile .level-card').forEach(c => c.classList.remove('active'));
    element.classList.add('active');
    setupState.level = level;
}

function toggleSetupGenre(element) {
    element.classList.toggle('active');
    const genre = element.textContent;
    if (element.classList.contains('active')) {
        if (!setupState.genres.includes(genre)) setupState.genres.push(genre);
    } else {
        setupState.genres = setupState.genres.filter(g => g !== genre);
    }
}

function completeSetup() {
    const username = document.getElementById('setup-username').value;
    if (!username || username.trim() === '') { alert('Por favor ingresa un nombre de usuario'); return; }
    if (setupState.genres.length < 3) { alert('Por favor selecciona al menos 3 géneros'); return; }
    userProfile.username = username;
    userProfile.level = setupState.level;
    userProfile.genres = [...setupState.genres];
    userProfile.isFirstTime = false;
    updateUserProfilePage();
    alert(`¡Bienvenido a Magic Film, ${username}! Tu perfil cinematográfico está listo.`);
    showPage('explore');
}

function updateUserProfilePage() {
    const nameEl = document.querySelector('#user-profile .profile-info h2');
    if (nameEl) nameEl.textContent = userProfile.username;
    const levelEl = document.querySelector('#user-profile .profile-level');
    if (levelEl) {
        const t = { 'explorador': 'Explorador', 'entusiasta': 'Entusiasta', 'experto': 'Experto del cine' };
        levelEl.innerHTML = `<i class="fas fa-film"></i> Nivel: ${t[userProfile.level]}`;
    }
    const genresEl = document.querySelector('#user-profile .favorite-genres');
    if (genresEl && userProfile.genres.length > 0) {
        genresEl.innerHTML = userProfile.genres.map(g => `<span class="fav-genre">${g}</span>`).join('');
    }
}

// =============================================
//  BÚSQUEDA
// =============================================
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    if (query.length < 2) {
        document.getElementById('searchResults').style.display = 'none';
        document.getElementById('recommendations').style.display = 'block';
        return;
    }
    const results = Object.values(moviesDB).filter(m =>
        m.title.toLowerCase().includes(query) || (m.genre && m.genre.toLowerCase().includes(query))
    );
    displaySearchResults(results);
}

function quickSearch(genre) {
    document.getElementById('searchInput').value = genre;
    const results = Object.values(moviesDB).filter(m =>
        m.genre === genre || (m.genre && m.genre.toLowerCase().includes(genre.toLowerCase()))
    );
    displaySearchResults(results);
}

function displaySearchResults(results) {
    const grid = document.getElementById('resultsGrid');
    const section = document.getElementById('searchResults');
    const recs = document.getElementById('recommendations');
    if (results.length === 0) {
        grid.innerHTML = '<p style="color:var(--text-secondary);text-align:center;grid-column:1/-1;">No se encontraron películas. Intenta con otro término.</p>';
    } else {
        grid.innerHTML = results.map(m => `
            <div class="result-item" onclick="showMovieDetail('${m.id}')">
                <div class="result-poster">
                    <img src="${m.poster}" alt="${m.title}">
                    <span class="result-type ${m.type}">${m.type === 'profound' ? 'PROFUNDO' : 'ENTRETENIMIENTO'}</span>
                </div>
                <span class="result-title">${m.title}</span>
                <span class="result-year">${m.year}</span>
            </div>`).join('');
    }
    section.style.display = 'block';
    recs.style.display = 'none';
}

// =============================================
//  DETALLE DE PELÍCULA
// =============================================
function showMovieDetail(movieId) {
    const movie = moviesDB[movieId];
    if (!movie) { loadMovieData('midsommar'); return; }
    loadMovieData(movieId);
}

function loadMovieData(movieId) {
    const movie = moviesDB[movieId] || moviesDB['midsommar'];

    if (movie.type === 'entertainment') {
        // ---- Cabecera ----
        document.getElementById('ent-hero-img').src = movie.hero;
        document.getElementById('ent-poster-img').src = movie.poster;
        document.getElementById('ent-title').innerHTML = movie.highlight
            ? `${movie.title.replace(movie.highlight, '')}<span class="highlight">${movie.highlight}</span>`
            : movie.title;
        document.getElementById('ent-genre').textContent = movie.genre || 'Acción';
        document.getElementById('ent-year').textContent = movie.year;
        document.getElementById('ent-duration').textContent = movie.duration || '2h';
        document.getElementById('ent-synopsis').textContent = movie.synopsis;
        document.getElementById('ent-sinopsis-full').textContent = movie.fullSynopsis || movie.synopsis;
        document.getElementById('ent-rating').textContent = movie.rating;
        document.getElementById('ent-boxoffice').textContent = movie.boxoffice || '$100M';
        document.getElementById('ent-audience').textContent = movie.audience || '85%';

        // ---- Análisis ----
        if (movie.analysis) {
            document.getElementById('ent-analysis').innerHTML = `
                <p><strong class="highlight-text">${movie.analysis.intro}</strong></p>
                <div class="analysis-points">
                    ${(movie.analysis.points || []).map(p => `
                        <div class="point">
                            <i class="fas fa-check-circle"></i>
                            <span><strong>${p.title}</strong> ${p.text}</span>
                        </div>`).join('')}
                </div>`;
        }

        // ---- Reparto ----
        if (movie.cast) {
            document.getElementById('ent-cast').innerHTML = movie.cast.map(a => `
                <div class="cast-member">
                    <img src="${a.img}" alt="${a.name}">
                    <span class="cast-name">${a.name}</span>
                    <span class="cast-role">${a.role}</span>
                </div>`).join('');
        }

        // ---- Stats ----
        if (movie.stats) {
            document.getElementById('ent-stats-row').innerHTML = movie.stats.map(s => `
                <div class="stat-item">
                    <span class="stat-value ${s.color}">${s.value}</span>
                    <span class="stat-label">${s.label}</span>
                </div>`).join('');
        }

        // ---- Timeline ----
        if (movie.timeline) {
            document.getElementById('ent-timeline').innerHTML = movie.timeline.map(t => `
                <div class="timeline-item">
                    <div class="timeline-marker ${t.color}"></div>
                    <div class="timeline-content ${t.color === 'yellow' ? 'highlight' : t.color === 'purple' ? 'highlight-purple' : ''}">
                        <div class="timeline-header">
                            <span class="timestamp">${t.time}</span>
                            <span class="tag ${t.color === 'red' ? 'epic' : t.color === 'yellow' ? 'easter' : t.color === 'purple' ? 'emotional' : 'epic'}">${t.tag}</span>
                        </div>
                        <h4>${t.title}</h4>
                        <p>${t.text}</p>
                    </div>
                </div>`).join('');
        }

        // ---- Escenas Hot ----
        if (movie.hotScenes) {
            document.getElementById('ent-escenas-grid').innerHTML = movie.hotScenes.map(s => `
                <div class="hot-scene-card">
                    <div class="scene-image">
                        <img src="${s.img}" alt="${s.title}">
                        <span class="scene-timestamp">${s.timestamp}</span>
                    </div>
                    <h4>${s.title}</h4>
                    <p>${s.text}</p>
                    <div class="scene-tags">${(s.tags || []).map(t => `<span class="scene-tag">${t}</span>`).join('')}</div>
                </div>`).join('');
        }

        // ---- Easter Eggs ----
        if (movie.easterEggs) {
            document.getElementById('ent-easter-list').innerHTML = movie.easterEggs.map(e => `
                <div class="easter-item">
                    <div class="easter-icon"><i class="fas fa-egg"></i></div>
                    <div class="easter-content">
                        <h4>${e.title}</h4>
                        <p>${e.text}</p>
                    </div>
                </div>`).join('');
        }

        // ---- Curiosidades ----
        if (movie.curiosities) {
            document.getElementById('ent-curiosidades-grid').innerHTML = movie.curiosities.map(c => `
                <div class="curiosity-card">
                    <i class="${c.icon}"></i>
                    <h4>${c.title}</h4>
                    <p>${c.text}</p>
                </div>`).join('');
        }

        // ---- YouTube ----
        if (movie.youtube) {
            document.getElementById('ent-youtube-section').innerHTML = `
                <div class="youtube-section">
                    <p class="yt-label"><i class="fab fa-youtube"></i> ${movie.youtube.label}</p>
                    <div class="yt-embed">
                        <iframe src="https://www.youtube.com/embed/${movie.youtube.id}"
                            title="Video relacionado" frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>
                    </div>
                </div>`;
        }

        showPage('movie-detail-entertainment');

    } else {
        // ---- Cabecera ----
        document.getElementById('prof-hero-img').src = movie.hero;
        document.getElementById('prof-poster-img').src = movie.poster;
        document.getElementById('prof-title').textContent = movie.title;
        document.getElementById('prof-genre').textContent = movie.genre || 'Drama';
        document.getElementById('prof-year').textContent = movie.year;
        document.getElementById('prof-duration').textContent = movie.duration || '2h';
        document.getElementById('prof-synopsis').textContent = movie.synopsis;
        document.getElementById('prof-sinopsis-full').textContent = movie.fullSynopsis || movie.synopsis;
        document.getElementById('prof-rating').textContent = movie.rating;
        document.getElementById('prof-awards').textContent = movie.awards || 'Premios';
        document.getElementById('prof-prize').textContent = movie.prize || 'Reconocido';

        // ---- Análisis profundo ----
        if (movie.analysis) {
            let html = `<p class="analysis-intro"><strong class="highlight-text">${movie.analysis.intro}</strong></p>`;
            if (movie.analysis.sections) {
                html += movie.analysis.sections.map(s => `
                    <div class="deep-analysis-section">
                        <h5>${s.title}</h5>
                        <p>${s.text}</p>
                        ${s.quote ? `<div class="quote-box"><i class="fas fa-quote-left"></i><blockquote>"${s.quote.text}"</blockquote><cite>— ${s.quote.cite}</cite></div>` : ''}
                    </div>`).join('');
            }
            document.getElementById('prof-analysis').innerHTML = html;
        }

        // ---- Reparto ----
        if (movie.cast) {
            document.getElementById('prof-cast').innerHTML = movie.cast.map(a => `
                <div class="cast-member">
                    <img src="${a.img}" alt="${a.name}">
                    <span class="cast-name">${a.name}</span>
                    <span class="cast-role">${a.role}</span>
                </div>`).join('');
        }

        // ---- Stats ----
        if (movie.stats) {
            document.getElementById('prof-stats-row').innerHTML = movie.stats.map(s => `
                <div class="stat-item">
                    <span class="stat-value ${s.color}">${s.value}</span>
                    <span class="stat-label">${s.label}</span>
                </div>`).join('');
        }

        // ---- Simbolismo ----
        if (movie.symbolism) {
            document.getElementById('prof-simbolismo-grid').innerHTML = movie.symbolism.map(s => `
                <div class="symbol-card">
                    <div class="symbol-icon"><i class="${s.icon}"></i></div>
                    <h4>${s.title}</h4>
                    <p>${s.text}</p>
                </div>`).join('');
        }

        // ---- Temas ----
        if (movie.themes) {
            document.getElementById('prof-temas-list').innerHTML = movie.themes.map(t => `
                <div class="theme-item">
                    <div class="theme-header">
                        <h4>${t.title}</h4>
                        <span class="theme-relevance">${t.relevance}</span>
                    </div>
                    <p>${t.text}</p>
                </div>`).join('');
        }

        // ---- Director ----
        if (movie.director) {
            const d = movie.director;
            document.getElementById('prof-director-section').innerHTML = `
                <div class="director-section">
                    <div class="director-info">
                        <img src="${d.photo}" alt="${d.name}" class="director-photo">
                        <div class="director-text">
                            <h4>${d.name}</h4>
                            <p class="director-role">${d.role}</p>
                            <p class="director-bio">${d.bio}</p>
                        </div>
                    </div>
                    <div class="director-style">
                        <h5>Estilo Distintivo</h5>
                        <ul>${(d.style || []).map(s => `<li><strong>${s.bold}</strong> ${s.text}</li>`).join('')}</ul>
                    </div>
                </div>`;
        }

        // ---- Contexto ----
        if (movie.context) {
            document.getElementById('prof-contexto-section').innerHTML = `
                <div class="context-section">
                    ${movie.context.map(c => `
                        <div class="context-card">
                            <h4><i class="${c.icon}"></i> ${c.title}</h4>
                            <p>${c.text}</p>
                        </div>`).join('')}
                </div>`;
        }

        // ---- YouTube ----
        if (movie.youtube) {
            document.getElementById('prof-youtube-section').innerHTML = `
                <div class="youtube-section">
                    <p class="yt-label"><i class="fab fa-youtube"></i> ${movie.youtube.label}</p>
                    <div class="yt-embed">
                        <iframe src="https://www.youtube.com/embed/${movie.youtube.id}"
                            title="Análisis en video" frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen></iframe>
                    </div>
                </div>`;
        }

        showPage('movie-detail-profound');
    }

    resetTabs();
}

// =============================================
//  TABS
// =============================================
function showTab(tabId) {
    const page = document.getElementById(tabId)?.closest('.page');
    if (!page) return;
    page.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    page.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
    const btn = page.querySelector(`.tab[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');
}

function resetTabs() {
    ['movie-detail-entertainment', 'movie-detail-profound'].forEach(pageId => {
        const page = document.getElementById(pageId);
        if (!page) return;
        const tabs = page.querySelectorAll('.tab-content');
        const btns = page.querySelectorAll('.tab');
        tabs.forEach((t, i) => { t.classList.remove('active'); if (i === 0) t.classList.add('active'); });
        btns.forEach((b, i) => { b.classList.remove('active'); if (i === 0) b.classList.add('active'); });
    });
}

// =============================================
//  INICIALIZACIÓN
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    showPage('home');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.dataset.page);
        });
    });
});

// Parallax suave
document.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    document.querySelectorAll('.hero-background img').forEach(bg => {
        if (bg) bg.style.transform = `translateY(${scrolled * 0.3}px)`;
    });
});

// Animaciones de entrada
setTimeout(() => {
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.movie-item, .category-card, .result-item, .timeline-item, .saved-movie, .rec-movie').forEach(el => {
        if (el) {
            el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            obs.observe(el);
        }
    });
}, 100);

// =============================================
//  REGISTRO — Paso 1 del flujo
// =============================================
function completeRegister() {
    const name     = document.getElementById('reg-name')?.value.trim();
    const email    = document.getElementById('reg-email')?.value.trim();
    const password = document.getElementById('reg-password')?.value;
    const confirm  = document.getElementById('reg-confirm')?.value;

    if (!name || name.length < 2) {
        showRegisterError('Por favor ingresa tu nombre completo.'); return;
    }
    if (!email || !email.includes('@')) {
        showRegisterError('Ingresa un correo electrónico válido.'); return;
    }
    if (!password || password.length < 6) {
        showRegisterError('La contraseña debe tener al menos 6 caracteres.'); return;
    }
    if (password !== confirm) {
        showRegisterError('Las contraseñas no coinciden.'); return;
    }

    // Guardar nombre en el setup para pre-rellenarlo
    const usernameInput = document.getElementById('setup-username');
    if (usernameInput) usernameInput.value = name.split(' ')[0]; // primer nombre

    // Avanzar al paso 2
    showPage('setup-profile');
}

function showRegisterError(msg) {
    // Remueve error anterior si existe
    const existing = document.getElementById('register-error-msg');
    if (existing) existing.remove();

    const errDiv = document.createElement('p');
    errDiv.id = 'register-error-msg';
    errDiv.textContent = msg;
    errDiv.style.cssText = 'color:#e74c3c;font-size:0.85rem;text-align:center;margin-top:0.75rem;';

    const btn = document.querySelector('#register .btn-primary');
    if (btn) btn.insertAdjacentElement('afterend', errDiv);

    // Auto-desaparecer
    setTimeout(() => { errDiv.remove(); }, 3500);
}

function checkPasswordStrength(value) {
    const bar = document.getElementById('strength-bar');
    if (!bar) return;
    let strength = 0;
    if (value.length >= 6)  strength += 25;
    if (value.length >= 10) strength += 25;
    if (/[A-Z]/.test(value) || /[0-9]/.test(value)) strength += 25;
    if (/[^A-Za-z0-9]/.test(value)) strength += 25;

    const colors = { 25: '#e74c3c', 50: '#e67e22', 75: '#f1c40f', 100: '#2ecc71' };
    bar.style.width = strength + '%';
    bar.style.background = colors[strength] || '#e74c3c';
}

