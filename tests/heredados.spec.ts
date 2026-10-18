import { test, expect } from '@playwright/test';

/**
 * PRUEBAS HEREDADAS (Parte 4b) · diagnóstico y estado final de cada una.
 *
 * H1 → defecto de la PRUEBA (dato desactualizado).
 * H2 → bug del PRODUCTO (el mismo del IVA de US-11 CA-02).
 * H3 → prueba INESTABLE (condición de carrera con la carga de la página).
 *
 * Ojo: estos veredictos hay que COMPROBARLOS con sus propias ejecuciones (ver GUIA) y anotar la evidencia en ENTREGA.md.
 */

// H1 · VEREDICTO: defecto de la prueba. El requisito RF-01 dice "AL MENOS 6 productos" y el catálogo tiene 8.
//      La prueba esperaba exactamente 6: dato viejo. Se corrige la prueba (no hay nada que reportar en Jira).
test('H1 · el catálogo tiene 8 productos (cumple RF-01: al menos 6)', async ({ page }) => {
  await page.goto('/');
  const productos = page.getByRole('heading', { level: 3 });
  await expect(productos).toHaveCount(8);
});

// H2 · VEREDICTO: bug del producto. La prueba afirma lo que dice el requisito (RF-07: IVA sobre el valor ya descontado):
//      (130.000 − 26.000) × 19% = $ 19.760. La tienda muestra $ 24.700 (19% del subtotal sin descontar).
//      Se deja SIN cambios y como fallo esperado, con la clave de Jira (es el mismo bug que US-11 CA-02 y US-12 CA-02).
test('H2 · el IVA de 2 mochilas con DESC20 es $ 19.760', async ({ page }) => {
  test.fail(true, 'TDT-106 · El IVA se calcula sobre el subtotal completo y no sobre el valor descontado (RF-07)');
  await page.goto('/');
  const tarjeta = page
    .locator('.rounded-lg')
    .filter({ has: page.getByRole('heading', { name: 'Mochila escolar', level: 3 }) });
  await tarjeta.getByRole('spinbutton').fill('2');
  await tarjeta.getByRole('button', { name: 'Agregar' }).click();
  await page.getByPlaceholder('Código de descuento').fill('DESC20');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('dt:text-is("IVA (19%)") + dd')).toHaveText('$ 19.760');
});

// H3 · VEREDICTO: prueba inestable. Con waitUntil:'domcontentloaded' el clic puede llegar ANTES de que React
//      "hidrate" la página (cuando los botones todavía no tienen su manejador): el clic se pierde y no pasa nada.
//      Nada en el producto está mal: la prueba no espera la condición correcta.
//      Arreglo: no esperar un TIEMPO (waitForTimeout), esperar la CONDICIÓN. Se usa la espera por defecto de goto
//      (evento "load": ya se descargaron y ejecutaron los scripts de la página).
//      Comprobación (--repeat-each=60 --workers=8): con domcontentloaded 2 de 60 fallaron; con el arreglo, 0 de 60.
test('H3 · agregar un cuaderno justo después de cargar', async ({ page }) => {
  await page.goto('/'); // espera el evento "load" (antes: { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'Agregar' }).first().click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Cuaderno universitario' })).toBeVisible();
});
