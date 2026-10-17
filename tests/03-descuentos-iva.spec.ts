import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

// El ORÁCULO: el valor correcto se calcula a partir del REQUISITO (RF-07 y RF-08), nunca copiando lo que muestra la tienda.
const formatoCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Math.round(n));
const PRECIO_MOCHILA = 65000;
const DESCUENTO_10 = PRECIO_MOCHILA * 0.1; // 6.500
const IVA_ESPERADO = (PRECIO_MOCHILA - DESCUENTO_10) * 0.19; // 19% del valor YA descontado → 11.115
const TOTAL_ESPERADO = PRECIO_MOCHILA - DESCUENTO_10 + IVA_ESPERADO; // 69.615

/**
 * BLOQUE DESCUENTOS E IMPUESTOS · US-09 a US-12.
 * Mismas reglas que en 02-carrito.spec.ts: borren el test.fixme(...) cuando implementen la prueba.
 * Valores útiles (producto: Mochila escolar, $ 65.000): DESC10 → descuento $ 6.500 · DESC20 → $ 13.000.
 */

test.describe('US-09 · Aplicar un código de descuento', () => {
  test('CA-01: DESC10 descuenta el 10% del subtotal', async ({ page }) => {
    test.fixme(true, 'Pendiente de automatizar');
    // Nivel 1.
    // Agreguen 1 mochila, escriban DESC10 en "Código de descuento", presionen "Aplicar" y comprueben la fila
    // "Descuento" del carrito: debe mostrar $ 6.500.
  });

  test('CA-03: los códigos "desc10" y "Desc10" se reconocen igual que DESC10', async ({ page }) => {
    test.fixme(true, 'Pendiente de automatizar');
    // Nivel 2 · CAZABUGS · PRUEBAS DIRIGIDAS POR DATOS.
    // No escriban tres pruebas casi iguales. Definan una lista de variantes
    //   const VARIANTES = ['desc10', 'Desc10', ' DESC10 '];
    // y generen UNA prueba por variante con un  for (const codigo of VARIANTES) { test(`...${codigo}...`, ...) }
    // Así el reporte dice EXACTAMENTE qué variantes fallan.
  });
});

test.describe('US-10 · Recibir aviso si el código no es válido', () => {
  test('CA-01: un código inexistente muestra el aviso y el total no cambia', async ({ page }) => {
    test.fixme(true, 'Pendiente de automatizar');
    // Nivel 1.
    // Con 1 mochila ($ 77.350 de total), apliquen ABC123: el mensaje debe ser exactamente
    // "Código de descuento no válido." y el total debe seguir en $ 77.350.
  });

  test('CA-02: un código inválido NO borra un descuento válido ya aplicado', async ({ page }) => {
    //test.fail(true, 'PRJ-XX · un código inválido borra el descuento válido ya aplicado');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText(formatoCOP(DESCUENTO_10)); // quedó aplicado

    await tienda.aplicarCodigo('ABC123');

    await expect(tienda.mensajeDescuento()).toHaveText('Código de descuento no válido.');
    await expect(tienda.total('Descuento')).toContainText(formatoCOP(DESCUENTO_10)); // debe mantenerse
  });
});

test.describe('US-11 · Ver el IVA correcto', () => {
  test('CA-02: con descuento, el IVA se calcula sobre el valor descontado', async ({ page }) => {
    test.fail(true, 'PRJ-XX · el IVA se calcula sobre el subtotal completo, no sobre el valor ya descontado (RF-07)');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText(formatoCOP(DESCUENTO_10)); // precondición

    await expect(tienda.total('IVA')).toHaveText(formatoCOP(IVA_ESPERADO)); // $ 11.115
  });
});

test.describe('US-12 · Ver el total a pagar correcto', () => {
  test('CA-02: con descuento, el total es subtotal − descuento + IVA (IVA sobre lo descontado)', async ({ page }) => {
    //test.fail(true, 'PRJ-XX · el total arrastra el IVA mal calculado (RF-07/RF-08); misma causa que US-11 CA-02');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText(formatoCOP(DESCUENTO_10)); // precondición

    await expect(tienda.total('Total')).toHaveText(formatoCOP(TOTAL_ESPERADO)); // $ 69.615
  });
});
