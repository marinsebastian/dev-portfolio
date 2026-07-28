# GeoInsights CTA & Engagement Review

**Alcance:** El CTA del Hero hacia GeoInsights Bolivia (`#flagship`), el nombre del proyecto, y todo lo que rodea la decisión de hacer clic — nav, microcopy, mobile, tooltip.
**Método:** Lectura del código fuente actual (`HeroSection.tsx`, `Header.tsx`, `FlagshipGeoSection.tsx`, `RealBlockMapWidget.client.tsx`, `data/translations.ts`, `app/globals.css`) + inspección en vivo en el navegador a 1440×900 y 390×844 (viewport real, no clamped), con medición de posición exacta vía DOM (`getBoundingClientRect`), no capturas de pantalla.
**No se implementó ningún cambio.** Este documento es solo diagnóstico, como se pidió.

---

## Executive Summary

El CTA actual — *"Explorar GeoInsights Bolivia"* — ya está bien posicionado técnicamente: es visible en el primer viewport tanto en desktop como en mobile (390px), y ya tiene un tratamiento visual distinto (glow animado) que lo separa de los otros dos botones del Hero. El problema no es visibilidad, es **información**: el botón le pide al visitante que confíe en un nombre propio ("GeoInsights Bolivia") sin decirle qué va a encontrar — ni mapa, ni datos reales del Censo 2024, ni IA conversacional se mencionan antes del clic. Un CEO o CFO con 10 segundos de atención tiene que *inferir* valor de un nombre, no leerlo. El nav superior tampoco distingue este proyecto de "Casos de Estudio" o "Herramientas" — compite en igualdad de condiciones con secciones secundarias. Y until recientemente, el botón "IA" del mapa (relacionado, ver hallazgo adicional) perdió su etiqueta descriptiva completa y ahora es solo dos letras. La recomendación central: **no tocar el botón en sí (posición, tamaño, tratamiento visual ya funcionan) — agregar una línea de microcopy específica y concreta debajo, y una marca discreta de "destacado" en el nav.** Sin rediseño, sin agresividad, sin inventar features que no existen.

---

## Current CTA Assessment

**Texto actual:** `Explorar GeoInsights Bolivia` (clave `hero.launchGeo`)
**Posición medida:** top ≈ 659px a 1440×900 (dentro del viewport de 900px) · top ≈ 568px a 390×844 (dentro del viewport). **Visible sin scroll en ambos casos.**
**Tratamiento visual:** clase `.apple-intelligence-glow-btn` — pill oscuro (`#090d16`) con borde animado (`conic-gradient` azul-cobalto → violeta, rotación 6s, blur 14px, se intensifica en hover). Es el único elemento con esta animación en el primer viewport, lo cual es correcto: un solo elemento en movimiento invita, varios distraen.
**Target táctil medido:** 43.6px de alto en mobile — justo debajo del mínimo ideal de 44px. No es un bloqueador, pero es ajustable sin esfuerzo.
**Tooltip/title:** no existe (`title` ausente, `aria-label` ausente). Un mouse-hover hoy no agrega ninguna información.

### Claridad
Media. "Explorar" es un verbo correcto (invita a interactuar, no es pasivo), pero "GeoInsights Bolivia" es un nombre propio que no se auto-explica. No hay ninguna palabra en el botón ni cerca de él que diga "mapa", "datos", "en vivo" o "IA" — las cuatro cosas que realmente hacen que este proyecto sea diferente a cualquier otro portfolio.

### Atractivo
Visualmente alto (el glow funciona, la jerarquía frente a los otros dos botones del Hero es correcta). Verbalmente medio-bajo: no hay ganchos de curiosidad ni de valor, solo una invitación genérica a "explorar" un nombre.

### Probabilidad de clic
Estimada **media-alta para quien ya scrollea con intención de evaluar el portfolio completo** (un reclutador técnico, un CTO que sabe que va a revisar todo) — pero **media-baja para alguien con prisa real** (un CEO con 3-5 minutos) que puede leer "GeoInsights Bolivia", no reconocer nada concreto, y seguir bajando hacia "Ver Casos de Estudio" en su lugar, que suena más genérico pero al menos promete "casos" plurales y conocidos.

### Problemas encontrados (verificados, no especulados)
1. **Cero descripción de contenido antes del clic.** El Hero entero habla del candidato (`"Desarrollador Full-Stack enfocado en..."`), nunca del proyecto. "GeoInsights Bolivia" aparece exactamente en dos lugares antes de hacer clic: el botón y el link del nav — en ninguno de los dos hay una sola palabra adicional de contexto.
2. **Sin preview visual.** Confirmado en código: la columna derecha del Hero es una tarjeta de texto ("RESUMEN PROFESIONAL"), no hay ningún fragmento de mapa, miniatura o captura.
3. **El nav no distingue el proyecto insignia.** Los 6 links de navegación (`Visión General`, `GeoInsights Bolivia`, `Casos de Estudio`, `Herramientas`, `CV & Resume`, `Contacto`) comparten exactamente el mismo tratamiento visual — mismo ícono, mismo tamaño, mismo estilo activo/inactivo. Nada le dice al visitante "este es el importante".
4. **Hallazgo adicional, relacionado:** el botón flotante de IA dentro del propio mapa (que abre el copiloto conversacional) fue reducido recientemente de una etiqueta completa a solo `"IA"` + un ícono de sparkle, sin `title` ni tooltip visible — un usuario sighted en desktop no tiene forma de saber qué hace ese botón sin hacer clic primero. No es el CTA que se pidió evaluar, pero vive dentro del mismo proyecto y usa el mismo tratamiento de glow que el CTA del Hero, así que compite por el mismo lenguaje visual de "esto es especial". Lo señalo en "What Not To Do" y en la recomendación de Hero.

---

## Reviewer Perspectives

### CEO
**¿Haría clic?** Probablemente sí, pero por el movimiento del botón (el glow), no por el texto. Si el glow no existiera, el texto solo ("Explorar GeoInsights Bolivia") no le daría ninguna razón de negocio para preferirlo sobre "Ver Casos de Estudio".
**¿Por qué sí/no?** El nombre no comunica resultado ni capacidad de iniciativa por sí mismo — un CEO lee "insights" y lo asocia correctamente con análisis de datos, lo cual es un punto a favor, pero no hay ninguna cifra ni promesa concreta (no dice "en vivo", no dice "datos reales", no dice "247 mil registros") que lo distinga de un dashboard genérico de portfolio.
**Texto que le funcionaría mejor:** algo que mencione conversión de datos en decisión — p. ej. *"Ver cómo convierto datos públicos en una herramienta operativa"* — o al menos un microcopy con esa promesa debajo del botón actual.

### CTO
**¿Haría clic?** Sí, con alta probabilidad — un CTO técnico ya sabe que va a revisar todo el sitio, y "GeoInsights" + el ícono de MapPin en el nav ya sugieren geoespacial.
**¿Por qué sí/no?** El nombre por sí solo no promete arquitectura, pero el contexto circundante (badges de stack en el Hero: MapLibre GL, PHP, Next.js) ya comunica profundidad técnica antes de llegar al botón, así que el CTO llega "pre-convencido" por otras señales, no por el CTA en sí.
**Texto que le funcionaría mejor:** algo explícito sobre la pila técnica o el dato real — *"Abrir mapa + API + copiloto IA"* o un microcopy que mencione "arquitectura multi-proveedor" cerca del botón.

### CFO
**¿Haría clic?** Incierto — un CFO lee más rápido y busca riesgo/costo/valor, no "features". "GeoInsights Bolivia" no le da ninguna de esas tres cosas.
**¿Por qué sí/no?** Sin microcopy, el botón es indistinguible de cualquier otro proyecto de portfolio con nombre en inglés. Si compite visualmente contra "Ver Casos de Estudio" (que sí usa una palabra clara y plural, "casos"), un CFO orientado a evidencia concreta podría preferir el botón más aburrido pero más explícito.
**Texto que le funcionaría mejor:** algo con la palabra "real" o "en vivo" — *"Ver datos reales del Censo 2024 en un mapa interactivo"* — el CFO reacciona bien a "real" porque implica que no es una maqueta.

### Community Manager
**¿Haría clic?** Sí, y es quien mejor reaccionaría al glow (elemento compartible, genera curiosidad visual).
**¿Por qué sí/no?** "GeoInsights Bolivia" es memorable a medias — suena a producto SaaS genérico, no cuenta una historia. No hay un gancho de una línea que se pueda copiar y pegar en un mensaje de WhatsApp o LinkedIn ("mira esto que hizo con datos del censo boliviano...").
**Texto que le funcionaría mejor:** algo con gancho narrativo, no descriptivo — *"Pregúntale al mapa de Bolivia"* — es lo suficientemente inusual para generar curiosidad y compartirse.

### UI/UX Expert
**¿Haría clic?** Sí — la jerarquía visual actual (glow vs. dos botones planos) ya hace su trabajo correctamente.
**¿Por qué sí/no?** El problema no es competencia visual (el botón gana esa batalla con claridad), es la ausencia total de contexto textual de apoyo. El hover/motion ayuda, no distrae — es la única animación continua en el primer viewport, que es exactamente la cantidad correcta. En mobile, el camino al proyecto es claro (confirmado: visible sin scroll, sin overflow horizontal), pero el touch target de 43.6px está justo debajo del mínimo recomendado de 44px.
**Texto que le funcionaría mejor:** cualquiera de los anteriores — desde UX, el texto importa menos que agregar una línea de microcopy con `text-slate-400` debajo del botón, que no compite visualmente pero añade la información que falta.

---

## Project Name Alternatives

| Name | Clarity | Premium Feel | Not Too Geolabs-Obvious | CTO Appeal | CEO/CFO Appeal | Verdict |
|---|---:|---:|---:|---:|---:|---|
| **GeoInsights Bolivia** (actual) | 7/10 | 7/10 | 7/10 | 7/10 | 7/10 | Mantener — ya es sólido, el problema es la falta de apoyo textual, no el nombre en sí |
| Bolivia Data Explorer | 8/10 | 5/10 | 8/10 | 5/10 | 7/10 | Descartar — suena a portal gubernamental genérico, pierde la especificidad geoespacial |
| Atlas de Datos Bolivia | 8/10 | 8/10 | 8/10 | 6/10 | 8/10 | Fuerte alternativa — "Atlas" evoca mapas con elegancia, encaja con el tono en español del sitio |
| Mapa de Datos Bolivia | 9/10 | 4/10 | 8/10 | 5/10 | 6/10 | Descartar — demasiado literal, suena a nombre de dashboard interno, no a proyecto insignia |
| Bolivia GeoData Explorer | 6/10 | 6/10 | 6/10 | 8/10 | 5/10 | Descartar — más técnico que "GeoInsights" pero menos ejecutivo, no mejora nada sustancial |
| Explorador Territorial Bolivia | 7/10 | 7/10 | 9/10 | 6/10 | 7/10 | Alternativa viable — gravitas institucional, cero riesgo de sonar "hecho para Geolabs", pero algo burocrático |
| GeoData Bolivia | 7/10 | 6/10 | 7/10 | 6/10 | 6/10 | Neutral — más corto que el actual pero no resuelve el problema de fondo (sigue siendo un nombre sin contexto) |
| Censo 2024 en Vivo | 9/10 | 6/10 | 10/10 | 7/10 | 8/10 | Interesante como **subtítulo**, no como nombre — ancla en el dato real, cero riesgo Geolabs, pero pierde la marca "GeoInsights" ya establecida en el sitio |
| GeoConsola Bolivia | 6/10 | 7/10 | 7/10 | 7/10 | 6/10 | Descartar — coherente con la identidad "Operational Data Console" del sitio, pero introduce una tercera variante de nombre sin necesidad clara |

**Recomendación de naming: mantener "GeoInsights Bolivia".** Ningún candidato supera claramente al actual en el balance de los 5 criterios, y cambiar el nombre ahora tiene un costo real (aparece en nav, hero, flagship section, translations ES/EN, metadata OG) para un beneficio incierto. El problema real no es el nombre — es que nadie más que el nombre está haciendo el trabajo de explicar el proyecto.

---

## CTA Button Alternatives

| CTA Text | Audience Fit | Desktop Fit | Mobile Fit | Click Motivation | Verdict |
|---|---|---|---|---|---|
| Explorar GeoInsights Bolivia (actual) | Balanceado | Sí | Sí (286px de 358px disponibles) | Media — depende 100% del glow visual | Mantener como base, reforzar con microcopy |
| Ver el Censo 2024 en un Mapa Interactivo | CEO/CFO | Sí, algo largo | Ajustado, cerca del límite en una línea | Alta — "real" + "interactivo" son ganchos concretos | Recomendado como alternativa fuerte |
| Explorar Bolivia con IA y Mapas en Vivo | CTO/CM | Sí | Largo, probable wrap a 2 líneas | Alta — combina dos ganchos (IA + en vivo) | Recomendado si se acorta ("con IA en vivo") |
| Abrir el Mapa + Copiloto IA | CTO | Sí | Sí | Media-alta — técnico pero puede sonar a herramienta interna | Viable como CTA secundario, no primario |
| Ver Proyecto Destacado: Mapas + IA + Datos Reales | Todos | No, demasiado largo | No | Alta en teoría, pero el largo mata la legibilidad | No recomendado tal cual — dividir en label + microcopy |
| Pregúntale al Mapa de Bolivia | Community Manager | Sí | Sí | Alta — curiosidad genuina, memorable, compartible | Recomendado como alternativa de tono más humano |
| Explorar 247,000 Manzanos del Censo 2024 | CTO/CFO | Sí, ajustado | Wrap probable | Alta para quien entiende "manzano" (bloque urbano), confuso para quien no | No recomendado sin apoyo de contexto previo |
| Ver Demo en Vivo: Datos Espaciales + IA | Todos | Sí | Ajustado | Alta — "demo en vivo" gestiona expectativa correctamente | Recomendado |
| Abrir Caso Insignia: GeoInsights Bolivia | CEO | Sí, largo | Wrap probable | Media-alta — resuelve el problema de "¿es el principal?" explícitamente | Viable pero se siente menos natural, más autodeclarado |
| Ver Mapa Interactivo de Bolivia | Todos | Sí | Sí | Media-alta — simple y claro, pierde la marca "GeoInsights" | Alternativa segura si se prioriza claridad sobre branding |
| Explorar el Proyecto Principal | Todos | Sí | Sí | Media — muy directo, puede sonar auto-declarado en exceso | No recomendado como texto de botón (mejor como microcopy o tag) |
| Ver Cómo Convierto Datos en Decisiones | CEO/CFO | Sí, largo | Wrap probable | Alta para perfil ejecutivo, baja para CTO | Recomendado específicamente para el ángulo ejecutivo |
| Abrir GeoInsights: Mapa + API + IA | CTO/CEO | Sí | Ajustado | Alta — mantiene marca y agrega especificidad en el mismo texto | **Recomendación principal** |
| Ver el Caso Full-Stack con Mapas Reales | CTO | Sí | Sí | Media-alta | Viable, redundante con microcopy si ambos se usan juntos |

---

## Recommended CTA System

**Primary button text:**
`Explorar GeoInsights Bolivia` (sin cambio) — o, si se acepta un ajuste mínimo de una palabra:
`Abrir GeoInsights: Mapa + IA` (mantiene la marca, agrega especificidad sin alargar demasiado).

**Secondary button:** sin cambios (`Ver Casos de Estudio`) — no compite, ya tiene jerarquía correcta por estar en estilo plano.

**Microcopy debajo del CTA (nueva):**
`Mapa interactivo con datos reales del Censo 2024 y un copiloto de IA que responde en lenguaje natural.`
— una sola línea, `text-slate-400`, sin badge, sin ícono adicional, para no competir visualmente con el glow del botón.

**Hover tooltip (desktop, opcional — ver sección siguiente):**
`Datos reales del Censo 2024 · Mapa + IA en vivo`

**Focus behavior:** el tooltip debe activarse también con `:focus-visible` (no solo `:hover`), usando el mismo componente Tippy.js que ya existe en el código para el tooltip del bloque seleccionado en el mapa — no requiere una dependencia nueva.

**Mobile replacement:** no un tooltip (no aplica), sino la misma línea de microcopy siempre visible (no oculta detrás de hover), más un ajuste de 43.6px → 44px en el alto del botón.

---

## Hero Layout Recommendation

- **Mantener la estructura actual.** El grid de 12 columnas (7 para narrativa + 5 para tarjeta ejecutiva) funciona y no necesita reconstrucción.
- **No agregar mini project preview en esta iteración.** Se evaluó y se descarta: requeriría un asset nuevo (captura o canvas en miniatura), añade peso de carga al primer viewport, y el glow del botón ya cumple la función de "esto es diferente" sin necesidad de una imagen. Si en el futuro se agrega, debe ser el choropleth del censo (colores vivos), nunca una captura genérica de UI.
- **Mover badges:** no es necesario. Los 4 badges de stack (Next.js, PHP, MapLibre, Linux) ya funcionan como prueba técnica ambiental; no compiten con el CTA.
- **Destacar más el proyecto:** sí, pero con texto, no con más elementos visuales — agregar la línea de microcopy propuesta arriba es suficiente.
- **Cambiar el orden de los botones:** no. El orden actual (GeoInsights → Casos de Estudio → CV) ya prioriza correctamente el proyecto insignia primero.
- **Agregar "Proyecto Destacado":** sí, pero no en el Hero — en el **nav**, como un punto o badge discreto junto al link "GeoInsights Bolivia" (ver Mobile/Nav abajo). Ponerlo en el Hero sería redundante con el glow, que ya cumple esa función.

---

## Mobile Recommendation

**Confirmado en navegador real a 390×844 (no clamped):** el CTA ya es visible sin scroll (top ≈ 568px), sin overflow horizontal, con ancho de 286px sobre 358px disponibles.

**Propuesta concreta para 360px y 390px:**

1. **No agregar sticky bottom CTA.** La evidencia real contradice la necesidad: el botón ya está en el primer viewport. Un sticky bar agregaría persistencia visual constante — exactamente el tipo de "truco agresivo" que se pidió evitar — para resolver un problema (descubribilidad) que no existe.
2. **Sí agregar la microcopy de una línea**, visible siempre (no requiere hover), justo debajo de la fila de 3 botones. En 360-390px probablemente necesite su propia línea completa (`w-full`, `text-xs`, `pt-2`).
3. **Ajustar el alto táctil del botón** de 43.6px a 44px exactos — cambio trivial (`py-3` → `py-3.5` o equivalente), no visual, solo de accesibilidad táctil.
4. **Sin mini preview en mobile tampoco**, por la misma razón que en desktop — y en mobile el costo de peso/carga es aún más sensible.
5. **Tap-to-expand "¿por qué verlo?" — no recomendado.** Agregaría un paso de interacción extra para información que cabe perfectamente en la microcopy de una línea ya propuesta. Un acordeón aquí sería complejidad sin beneficio.
6. **Navegación simplificada:** ya confirmado sin overflow horizontal, drawer mobile ya funcional. Sin cambios necesarios más allá del badge de nav (ver abajo).
7. **Sin animaciones nuevas.** El glow existente ya es la única animación continua visible; no se necesita ni se recomienda agregar otra.

---

## Copy Recommendations

**Hero CTA (sin cambio, o alternativa mínima):**
- ES: `Explorar GeoInsights Bolivia`
- Alternativa: `Abrir GeoInsights: Mapa + IA`

**Microcopy (nueva, bajo el CTA):**
- ES: `Mapa interactivo con datos reales del Censo 2024 y un copiloto de IA que responde en lenguaje natural.`
- EN: `Interactive map with real 2024 Census data and an AI copilot that answers in plain language.`

**Tooltip (desktop, opcional):**
- ES: `Datos reales del Censo 2024 · Mapa + IA en vivo`
- EN: `Real 2024 Census data · Live map + AI`

**Mobile sticky CTA:**
No se recomienda implementar (ver justificación arriba). Si en el futuro cambia la evidencia (p. ej. analytics mostrando bajo scroll-through hacia `#flagship`), reconsiderar.

**Project teaser (para nav badge, discreto):**
- ES: `Destacado`
- EN: `Featured`
— como una etiqueta de 9-10px, no como texto adicional en el link mismo, para no romper la consistencia visual del resto del nav.

---

## What Not To Do

- **No sonar desesperadamente geoespacial.** El sitio ya tiene suficiente peso geoespacial (mapa, MapLibre, PMTiles, censo); agregar más lenguaje "geo-geo-geo" en el CTA sería redundante y notorio.
- **No prometer PostGIS ni bases de datos espaciales que no existen.** El proyecto usa PMTiles + GeoJSON del lado del cliente, no PostGIS — cualquier copy que lo insinúe sería una afirmación falsa verificable por un CTO en minutos.
- **No usar el hover/tooltip como portador de información esencial.** Ya se diseñó la microcopy para que viva siempre visible, precisamente porque mobile no tiene hover — el tooltip debe ser refuerzo, nunca la única fuente.
- **No meter más badges.** El Hero ya tiene 4 badges de stack + potencialmente un badge de "Destacado" en el nav — no agregar un quinto elemento visual compitiendo por atención en el primer viewport.
- **No agregar animación que distraiga.** El único elemento en movimiento continuo en el primer viewport debe seguir siendo el glow del CTA. El botón "IA" del mapa comparte el mismo tratamiento de glow — vale la pena, en una iteración futura, decidir si eso diluye la señal del Hero o si al estar en secciones distintas del scroll no importa; no se resuelve en este documento porque no era el alcance pedido.
- **No ocultar el CV detrás del proyecto.** El botón de CV ya está en la misma fila con igual accesibilidad — mantenerlo así. Ningún cambio propuesto aquí reduce su visibilidad.
- **No renombrar el proyecto sin necesidad.** Como se documentó arriba, ningún nombre alternativo supera claramente al actual; cambiarlo ahora es costo sin beneficio claro.
- **No agregar un sticky mobile CTA "porque es una práctica común".** La evidencia real de este sitio (CTA ya visible sin scroll) no lo justifica — agregar uno sería copiar una táctica sin diagnóstico, exactamente lo que se pidió evitar.

---

## Final Recommendation

# ADD MICROCOPY + MOBILE CTA

Con una aclaración importante sobre el alcance de "mobile CTA": **no significa agregar un elemento sticky nuevo** — la evidencia real (medida en navegador, no supuesta) muestra que el CTA actual ya es visible sin scroll tanto en desktop como en 390px, con buena jerarquía visual y sin overflow. "Mobile CTA" aquí significa **confirmar y afinar lo que ya existe**: subir el touch target de 43.6px a 44px, y asegurar que la nueva microcopy se vea completa en una línea propia sin romper el layout de 3 botones.

El cambio real y necesario es agregar la **microcopy de una línea** debajo del CTA (desktop y mobile) y un **badge discreto de "Destacado" en el nav** — dos adiciones mínimas, de texto, sin rediseño de layout, sin nuevos assets, sin animaciones nuevas, que resuelven el problema real encontrado: el proyecto depende hoy 100% de un nombre propio y un efecto visual para comunicar valor, sin una sola palabra de apoyo que diga qué es. Esto cumple exactamente con lo pedido: que el proyecto se sienta naturalmente importante, no que se le agregue urgencia artificial.

**No se recomienda** tooltip obligatorio (es opcional/nice-to-have, ya que la microcopy siempre visible cubre el mismo objetivo sin depender de hover), ni preview visual (costo/beneficio no lo justifica todavía), ni rediseño de jerarquía del Hero (ya es correcta).
