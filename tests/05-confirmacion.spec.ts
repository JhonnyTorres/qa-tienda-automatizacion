import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CONFIRMACIÓN · US-16 a US-19.
 *
 * Un pedido completo son varios pasos (agregar, ir a pagar, llenar datos, confirmar). Cuando lo escriban por tercera vez
 * en la misma forma, ya sienten por qué existe el Page Object (Parte 5): escribir "comprar()" una sola vez.
 * Datos válidos de ejemplo: nombre "Ana Gómez", correo "ana@correo.com", dirección "Calle 10 # 20-30".
 * Recuerden: cada prueba arranca con el navegador limpio (carrito vacío, sin memoria de la anterior).
 */

test.describe('US-16 · Que mis datos no queden a la vista de otra persona', () => {
  test('CA-01: tras confirmar y empezar otra compra, el formulario aparece vacío', async ({ page }) => {
    test.fail(true, 'TDT-113 · los datos del cliente no se borran y reaparecen en la compra siguiente');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    await tienda.volverALaTienda();
    await tienda.agregar('Cuaderno universitario');
    await tienda.irAPagar();

    await expect(tienda.campo('Nombre completo')).toHaveValue('');
    await expect(tienda.campo('Correo electrónico')).toHaveValue('');
    await expect(tienda.campo('Dirección de entrega')).toHaveValue('');
  });
});

test.describe('US-17 · Confirmar mi pedido', () => {
  test('CA-01: con datos válidos veo "¡Pedido confirmado!" y un número de pedido', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();

    await tienda.comprar('Esfero azul');

    await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).toBeVisible();
    await expect(page.getByText(/Número de pedido:/)).toContainText(/#\d+/);
  });

  test('CA-02: un segundo pedido (sin recargar) tiene otro número', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();

    await tienda.volverALaTienda();
    await tienda.comprar('Esfero azul');
    const segundo = await tienda.numeroDePedido();

    expect(segundo).not.toBe(primero);
  });

  test('CA-03: un pedido hecho después de recargar la página no repite un número anterior', async ({ page }) => {
    test.fail(true, 'TDT-116 · el consecutivo de pedidos se reinicia al recargar y se repite el número (RF-10: debe ser único)');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');
    const primero = await tienda.numeroDePedido();

    await page.reload();
    await tienda.comprar('Esfero azul');
    const segundo = await tienda.numeroDePedido();

    expect(segundo).not.toBe(primero);
  });
});

test.describe('US-19 · Empezar una compra nueva con el carrito limpio', () => {
  test('CA-01: tras confirmar, el carrito está vacío y el contador marca 0', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.comprar('Esfero azul');

    await tienda.volverALaTienda();

    await expect(tienda.carrito.getByText('Tu carrito está vacío.')).toBeVisible();
    await expect(tienda.contador()).toContainText('0 artículo(s)');
  });;
});
