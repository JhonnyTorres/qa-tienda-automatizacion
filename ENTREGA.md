# Entrega · Laboratorio 3.1 · Introducción a la automatización de pruebas

**Integrante:** Jonathan Torres Monsalve
**Repositorio:** https://github.com/JhonnyTorres/qa-tienda-automatizacion

## 1. ¿Qué automatizamos y por qué?

Se automatizaron criterios de aceptación relacionados con el catálogo, el carrito de compras, los descuentos, el IVA, el formulario de envío y la confirmación de pedidos. Se eligieron porque son repetitivos, verificables mediante aserciones y relevantes para la calidad del proceso de compra.

| Criterio | ¿Automatizamos? | Justificación |
|---|---|---|
| US-01 · CA-01: Mostrar los productos del catálogo | Sí | Permite comprobar rápidamente que el catálogo contiene los productos esperados. |
| US-01 · CA-02: Mostrar precio y stock de la mochila | Sí | Los datos de precio y disponibilidad afectan las decisiones de compra. |
| US-01 · CA-03: Formato de los precios | Sí | Es repetitivo y fácil de validar automáticamente. |
| US-04 · CA-01: Agregar 15 cuadernos | Sí | Comprueba la gestión de cantidades dentro del stock disponible. |
| US-04 · CA-02: Rechazar 7 mochilas cuando el stock es 6 | Sí | Valida una restricción importante de inventario. |
| US-04 · CA-03: Rechazar 4 + 4 mochilas cuando el stock es 6 | Sí | Detecta un posible exceso de unidades acumuladas en el carrito. |
| US-05 · CA-02: Limitar el incremento de unidades | Sí | Verifica que el carrito respete el stock disponible. |
| US-06 · CA-02: No permitir cantidades inferiores a 1 | Sí | Comprueba una regla básica de integridad del carrito. |
| US-07 · CA-02: Vaciar el carrito al retirar el único producto | Sí | Valida el estado del carrito y su total. |
| US-09 · CA-01: Aplicar DESC10 | Sí | Comprueba automáticamente el cálculo del descuento. |
| US-09 · CA-03: Aceptar variaciones de mayúsculas y minúsculas | Sí | Verifica la tolerancia de la aplicación ante diferentes formatos del código. |
| US-10 · CA-02: Conservar el descuento válido ante un código erróneo | Sí | Protege el estado previo de la compra. |
| US-11 · CA-02: Calcular el IVA después del descuento | Sí | Verifica la exactitud de los cálculos económicos. |
| US-12 · CA-02: Calcular el total con descuento e IVA | Sí | Comprueba la consistencia del valor final que debe pagar el cliente. |
| US-13 · CA-03: Deshabilitar el pago con total cero | Sí | Evita avanzar al pago con una compra sin valor positivo. |
| US-14 · CA-01 y CA-02: Validar campos obligatorios | Sí | Reduce errores de entrada y permite repetir las validaciones. |
| US-15 · CA-01 a CA-03: Aceptar formatos válidos de correo | Sí | Comprueba múltiples variantes de entrada que serían tediosas de repetir manualmente. |
| US-15 · CA-04: Rechazar correos mal formados | Sí | Valida las reglas de entrada del formulario. |
| US-16 · CA-01: Limpiar los datos al iniciar otra compra | Sí | Comprueba que los datos personales no permanezcan visibles en una nueva compra. |
| US-17 · CA-03: No repetir el número de pedido después de recargar | Sí | Verifica la unicidad del identificador de cada pedido. |

Se conservaron las pruebas que detectan comportamientos incorrectos del producto. Estos casos se marcaron con `test.fail()` para registrar los fallos conocidos como esperados, sin cambiar las aserciones para ocultar los defectos.

## 2. Bugs que nuestra suite detecta

Las siguientes pruebas detectan defectos del producto. Las claves corresponden a las que se encuentran actualmente en el código y deben coincidir con los tickets de Jira.

| Prueba | Bug en Jira | ¿Quedó con `test.fail()`? | Evidencia |
|---|---|---|---|
| `tests/02-carrito.spec.ts` · US-04 CA-03: 4 + 4 mochilas superan el stock | TDT-20 | Sí | Ejecución Playwright y resultado del caso |
| `tests/02-carrito.spec.ts` · US-05 CA-02: incrementar supera el stock | TDT-98 | Sí | Ejecución Playwright y resultado del caso |
| `tests/02-carrito.spec.ts` · US-06 CA-02: disminuir permite llegar a cero | TDT-99 | Sí | Ejecución Playwright y resultado del caso |
| `tests/03-descuentos-iva.spec.ts` · US-09 CA-03: código `desc10` | TDT-103 | Sí | Ejecución Playwright y resultado del caso |
| `tests/03-descuentos-iva.spec.ts` · US-09 CA-03: código `Desc10` | TDT-103 | Sí | Ejecución Playwright y resultado del caso |
| `tests/03-descuentos-iva.spec.ts` · US-10 CA-02: código inválido elimina el descuento previo | TDT-104 | Sí | Ejecución Playwright y resultado del caso |
| `tests/03-descuentos-iva.spec.ts` · US-11 CA-02: IVA con descuento | TDT-106 | Sí | Ejecución Playwright y resultado del caso |
| `tests/03-descuentos-iva.spec.ts` · US-12 CA-02: total con descuento e IVA | TDT-107 | Sí | Ejecución Playwright y resultado del caso |
| `tests/04-checkout.spec.ts` · US-13 CA-03: pago habilitado con total cero | TDT-115 | Sí | Ejecución Playwright y resultado del caso |
| `tests/04-checkout.spec.ts` · US-15: correo con punto en el nombre | TDT-111 | Sí | Ejecución Playwright y resultado del caso |
| `tests/04-checkout.spec.ts` · US-15: correo con guion en el nombre | TDT-111 | Sí | Ejecución Playwright y resultado del caso |
| `tests/04-checkout.spec.ts` · US-15: correo con signo `+` | TDT-111 | Sí | Ejecución Playwright y resultado del caso |
| `tests/04-checkout.spec.ts` · US-15: correo con subdominio | TDT-111 | Sí | Ejecución Playwright y resultado del caso |
| `tests/05-confirmacion.spec.ts` · US-16 CA-01: datos personales reaparecen en otra compra | TDT-113 | Sí | Ejecución Playwright y resultado del caso |
| `tests/05-confirmacion.spec.ts` · US-17 CA-03: se repite el número del pedido después de recargar | TDT-116 | Sí | Ejecución Playwright y resultado del caso |
| `tests/heredados.spec.ts` · H2: IVA de dos mochilas con DESC20 | TDT-53 | Sí | Ejecución Playwright y resultado del caso |

**Nota sobre la evidencia:** la salida de la suite demuestra qué pruebas fallaron de manera esperada. Antes de entregar, adjuntar las capturas o los traces solicitados por el profesor y los comentarios correspondientes en Jira. No se deben presentar capturas que todavía no se hayan tomado.

## 3. Pruebas heredadas: nuestro diagnóstico

| Prueba | Veredicto | Cómo lo comprobamos | Qué hicimos |
|---|---|---|---|
| H1 · El catálogo tiene 8 productos | Prueba heredada incorrecta | El requisito RF-01 solicita al menos 6 productos y el catálogo muestra 8. | Se ajustó la prueba para comprobar los 8 productos presentes. |
| H2 · El IVA de dos mochilas con DESC20 es $19.760 | Defecto del producto | Con un subtotal de $130.000 y un descuento de $26.000, el IVA esperado sobre $104.000 es $19.760. La aplicación muestra $24.700, que corresponde al 19 % del subtotal sin descontar. | Se mantuvo la aserción correcta y se marcó el defecto como esperado mediante `test.fail()`, asociado a TDT-53. |
| H3 · Agregar un cuaderno justo después de cargar | Posible inestabilidad de sincronización | Se cambió la navegación para esperar la carga normal de la página y se ejecutó la prueba. En la última ejecución pasó. | Se utilizó `await page.goto('/')` con la espera predeterminada de Playwright. La estabilidad repetida debe respaldarse con ejecuciones adicionales si se exige evidencia de estrés. |

## 4. Medidas

- Casos de prueba registrados en Jira: **51 CP**.
- Pruebas automatizadas en este laboratorio: **42 de 51 (82,35 %)**, considerando la cantidad de casos registrados.
- Tiempo de elaboración: **no se registró un tiempo exacto**. La construcción de los criterios de aceptación, los casos de prueba y el apoyo en la automatización se realizó con asistencia de herramientas de inteligencia artificial, seguida de revisión y ejecución de las pruebas.
- Tiempo de ejecución de la suite completa: **132 segundos (2 minutos y 12 segundos)**.
- Tiempo estimado para ejecutar manualmente los 42 casos automatizados: **210 a 420 minutos (3 h 30 min a 7 h)**, suponiendo entre 5 y 10 minutos por caso.
- Punto de equilibrio de la automatización: no se puede determinar con precisión sin conocer el tiempo invertido en preparar y mantener la automatización. La ejecución automatizada reduce el tiempo de repetición de las pruebas, pero también deben considerarse la revisión de resultados y el mantenimiento de los scripts.

El porcentaje del 82,35 % representa la proporción numérica de casos automatizados frente a los registrados en Jira. No implica que se haya medido una cobertura del 82,35 % de los requisitos o del código fuente.

La última ejecución secuencial reportó `42 passed (2.2m)`. Este resultado incluye pruebas de defectos conocidos marcadas con `test.fail()`, por lo que no significa que todas las funcionalidades evaluadas estén libres de defectos.

## 5. Reflexión

**1. ¿Qué casos de nuestro plan no automatizaríamos y por qué?**

Priorizaríamos la automatización de reglas repetitivas y verificables, como inventario, descuentos y validaciones. Las pruebas exploratorias de usabilidad, claridad de mensajes y facilidad de navegación requieren evaluación humana, aunque pueden complementarse con pruebas automatizadas.

**2. Si la tienda cambia el HTML de un botón, ¿qué parte de nuestro código se rompe y cuál no? ¿Qué aportó el Page Object?**

Si cambia el selector del botón, pueden fallar los métodos que lo localizan e interactúan con él. El Page Object concentra esos selectores y acciones en una clase, por lo que el cambio puede corregirse en un solo lugar sin modificar cada prueba que utiliza el método.

**3. Una prueba roja nuestra que no era un bug del producto: ¿cómo nos dimos cuenta?**

En H1 se esperaba una cantidad exacta de productos, aunque el requisito RF-01 solo exigía un mínimo de seis. Al comprobar que el catálogo mostraba ocho y cumplía el requisito, se identificó que el problema estaba en la prueba heredada, no en el producto.

**4. ¿Qué bug o riesgo no habría encontrado la automatización por sí sola?**

Una prueba automatizada puede verificar resultados y reglas definidas, pero no garantiza que se hayan identificado todos los riesgos. Una revisión exploratoria puede detectar dificultades de comprensión, problemas de accesibilidad o comportamientos no contemplados en los criterios de aceptación.

**5. ¿Qué haríamos distinto en un proyecto real?**

Definiríamos desde el inicio una estrategia de pruebas, mantendríamos las historias y los casos trazables en Jira, revisaríamos los defectos con el equipo y ejecutaríamos la suite en integración continua. También separaríamos los fallos esperados por defectos conocidos de los errores inesperados, para facilitar el mantenimiento y la interpretación de los resultados.