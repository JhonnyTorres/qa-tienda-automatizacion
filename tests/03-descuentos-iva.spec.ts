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
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText(formatoCOP(DESCUENTO_10)); // debe mostrar $ 6.500
  });

  const VARIANTES = [
    { codigo: 'desc10', bug: 'PRJ-XX' },
    { codigo: 'Desc10', bug: 'PRJ-XX' },
    { codigo: ' DESC10 ', bug: '' },
  ];

  for (const { codigo, bug } of VARIANTES) {
    test(`CA-03: el código "${codigo}" se reconoce igual que DESC10`, async ({ page }) => {
      test.fail(bug !== '', `${bug} · el código de descuento distingue mayúsculas de minúsculas`);
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Mochila escolar');

      await tienda.aplicarCodigo(codigo);

      await expect(tienda.total('Descuento')).toContainText(formatoCOP(DESCUENTO_10)); // $ 6.500
    });
  }
});

test.describe('US-10 · Recibir aviso si el código no es válido', () => {
  test('CA-01: un código inexistente muestra el aviso y el total no cambia', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await expect(tienda.total('Total')).toHaveText('$ 77.350'); // precondición: 65.000 + IVA 19%

    await tienda.aplicarCodigo('ABC123');

    await expect(tienda.mensajeDescuento()).toHaveText('Código de descuento no válido.');
    await expect(tienda.total('Total')).toHaveText('$ 77.350'); // el total no cambia
  });

  test('CA-02: un código inválido NO borra un descuento válido ya aplicado', async ({ page }) => {
    test.fail(true, 'PRJ-XX · un código inválido borra el descuento válido ya aplicado');
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
    test.fail(true, 'PRJ-XX · el total arrastra el IVA mal calculado (RF-07/RF-08); misma causa que US-11 CA-02');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar');
    await tienda.aplicarCodigo('DESC10');
    await expect(tienda.total('Descuento')).toContainText(formatoCOP(DESCUENTO_10)); // precondición

    await expect(tienda.total('Total')).toHaveText(formatoCOP(TOTAL_ESPERADO)); // $ 69.615
  });
});
