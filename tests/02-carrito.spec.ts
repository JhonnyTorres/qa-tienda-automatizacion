import { test, expect } from '@playwright/test';
import { TiendaPage } from '../pages/TiendaPage';

/**
 * BLOQUE CARRITO · US-04 a US-07.
 *
 * Cómo se trabaja este archivo:
 *  - La primera prueba ya está resuelta (EJEMPLO GUIADO).
 *  - Las demás están "pendientes": traen un test.fixme(...) que las salta. Para activar una, escriban su cuerpo
 *    y BORREN esa línea. Las pistas están en los comentarios.
 *  - "Nivel" va de 1 (fácil) a 3 (reto). "CAZABUGS" = el criterio probablemente destapa un bug de la tienda.
 *  - Los localizadores de la tienda están en el "Mapa de la tienda" de la guía del laboratorio.
 */

test.describe('US-04 · Agregar productos sin superar el stock', () => {
  // ─────────────── EJEMPLO GUIADO (resuelto) ───────────────
  test('CA1: se pueden agregar 15 cuadernos (stock 15)', async ({ page }) => {
    // ARRANGE: abrir la tienda
    await page.goto('/');

    // ACT: ubicar la tarjeta del cuaderno, escribir 15 en su cantidad y presionar "Agregar"
    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Cuaderno universitario', level: 3 }) });
    await tarjeta.getByRole('spinbutton').fill('15');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();

    // ASSERT: en el carrito (la tarjeta con el encabezado "Carrito") aparece el cuaderno con cantidad 15
    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' });
    await expect(linea.locator('span')).toHaveText('15');
  });

  // ─────────────── PENDIENTES ───────────────
  test('CA-02: no deja agregar 7 mochilas de una vez (stock 6) y avisa', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();

    // El alert() bloquea la página: el manejador se registra ANTES del clic.
    let aviso = '';
    page.once('dialog', async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    await tienda.agregar('Mochila escolar', 7);

    expect(aviso).toContain('Solo hay 6 unidades');
    await expect(tienda.linea('Mochila escolar')).toHaveCount(0); // no se agrega nada
    await expect(tienda.carrito.getByText('Tu carrito está vacío.')).toBeVisible();
  });

  test('CA-03: 4 + 4 mochilas supera el stock (6) y debe rechazarse', async ({ page }) => {
    //test.fail(true, 'PRJ-XX · el stock solo se valida por cada clic, no contra lo que ya hay en el carrito');
    // Este test se deja con localizadores directos (sin Page Object) para poder comparar "antes" y "después".
    await page.goto('/');
    // La tienda avisa con un alert(): se registra el manejador ANTES de la acción que lo provoca.
    // Se guarda el último aviso para comprobar que informa el stock disponible.
    let aviso = '';
    page.on('dialog', async (dialogo) => {
      aviso = dialogo.message();
      await dialogo.accept();
    });

    const tarjeta = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
    const carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
    const linea = carrito.getByRole('listitem').filter({ hasText: 'Mochila escolar' });

    await tarjeta.getByRole('spinbutton').fill('4');
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();
    await expect(linea.locator('span')).toHaveText('4'); // la primera compra sí es válida
    await tarjeta.getByRole('button', { name: 'Agregar' }).click(); // otras 4 → 8 en total, stock 6

    // El criterio exige que el stock no se supere: la cantidad debe quedarse en 4.
    await expect(linea.locator('span')).toHaveText('4');
    // ...y el sistema debe informar el stock disponible.
    expect(aviso).toContain('Solo hay 6 unidades');
  });

  test('CA-04: el contador del encabezado suma las unidades de todo el carrito (3 cuadernos + 2 esferos = 5)', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();

    await tienda.agregar('Cuaderno universitario', 3);
    await tienda.agregar('Esfero azul', 2);

    await expect(tienda.contador()).toContainText('5 artículo(s)');
  });
});

test.describe('US-05 · Aumentar la cantidad desde el carrito', () => {
  test('CA-02: "+" no pasa del stock (6 mochilas)', async ({ page }) => {
    //test.fail(true, 'PRJ-XX · el botón "+" del carrito no valida el stock');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar', 6); // todo el stock
    await expect(tienda.cantidad('Mochila escolar')).toHaveText('6');

    await tienda.aumentar('Mochila escolar');

    await expect(tienda.cantidad('Mochila escolar')).toHaveText('6'); // no puede pasar del stock
  });
});

test.describe('US-06 · Disminuir la cantidad desde el carrito', () => {
  test('CA-02 (elegimos: se queda en 1): con cantidad 1, "−" no la deja en 0 ni en negativo', async ({ page }) => {
    //test.fail(true, 'PRJ-XX · el botón "−" baja la cantidad a 0 (y más) en vez de respetar el mínimo de 1');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar', 1);

    await tienda.disminuir('Mochila escolar');

    await expect(tienda.cantidad('Mochila escolar')).toHaveText('1');
  });
});

test.describe('US-07 · Quitar un producto del carrito', () => {
  test('CA-02: quitar el único producto deja el carrito vacío y el total en $ 0', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await expect(tienda.linea('Esfero azul')).toBeVisible(); // precondición: el producto sí quedó en el carrito

    await tienda.eliminar('Esfero azul');

    await expect(tienda.carrito.getByText('Tu carrito está vacío.')).toBeVisible();
    await expect(tienda.total('Total')).toHaveText('$ 0');
  });
});


