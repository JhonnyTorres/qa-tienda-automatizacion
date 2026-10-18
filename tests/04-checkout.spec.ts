import { test, expect } from '@playwright/test';
import { TiendaPage, DATOS_VALIDOS } from '../pages/TiendaPage';

/**
 * BLOQUE CHECKOUT · US-13 a US-15.
 *
 * IMPORTANTE: en el formulario de envío page.getByLabel('Nombre completo') NO encuentra el campo. Pruébenlo y
 * diagnostiquen por qué (inspeccionen el HTML). Mientras tanto, esto SÍ funciona:
 *     page.locator('label:text-is("Nombre completo") + input')
 * (la etiqueta va justo antes del campo). Los textos de las etiquetas son: "Nombre completo",
 * "Correo electrónico" y "Dirección de entrega".
 */

// Datos listos para la prueba dirigida por datos (US-15). Escribir cada correo a mano invita al error.
const CORREOS_VALIDOS = [
  'juan@correo.com',
  'ana_gomez@gmail.com',
  'ana.gomez@gmail.com',
  'ana-gomez@gmail.com',
  'ana+tienda@gmail.com',
  'ana@universidad.edu.co',
];
const CORREOS_MAL_FORMADOS = ['ana.gmail.com', 'ana@', '@gmail.com', 'ana gomez@gmail.com', 'ana@@gmail.com', 'ana@gmail'];

test.describe('US-13 · Ir a pagar desde el carrito', () => {
  test('CA-03: con total cero o negativo no se puede ir a pagar', async ({ page }) => {
    test.fail(true, 'TDT-115 · El botón Ir a pagar permanece habilitado con total cero');
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Mochila escolar', 1);
    await tienda.disminuir('Mochila escolar');

    await expect(tienda.botonPagar).toBeDisabled();
  });

});

test.describe('US-14 · Completar mis datos de envío', () => {
  test('CA-01: con el formulario vacío hay un error por cada campo obligatorio', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    await tienda.confirmar();

    await expect(page.getByText('El nombre es obligatorio')).toBeVisible();
    await expect(page.getByText('El correo es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
    await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).toHaveCount(0);
  });

  test('CA-02: un nombre y una dirección de solo espacios se rechazan como vacíos', async ({ page }) => {
    const tienda = new TiendaPage(page);
    await tienda.abrir();
    await tienda.agregar('Esfero azul');
    await tienda.irAPagar();

    await tienda.llenarDatos({ nombre: '   ', correo: 'ana@correo.com', direccion: '   ' });
    await tienda.confirmar();

    await expect(page.getByText('El nombre es obligatorio.')).toBeVisible();
    await expect(page.getByText('La dirección es obligatoria.')).toBeVisible();
    await expect(page.getByText('El correo es obligatorio.')).toHaveCount(0); // el correo sí era válido
    await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).toHaveCount(0);
  });
});

test.describe('US-15 · Ingresar un correo electrónico válido', () => {
  // PARTE 4a · prueba dirigida por datos: UNA prueba por correo, así el reporte dice exactamente qué filas fallan.
  // IMPORTANTE: este conjunto se llena DESPUÉS de ejecutar la primera vez SIN test.fail y ver qué filas salen rojas.
  // (Primero comenten la línea test.fail de abajo, ejecuten, anoten las filas rojas y verifiquen cada una a mano.)
  const FALLAN_HOY = new Set([
    'ana.gomez@gmail.com',
    'ana-gomez@gmail.com',
    'ana+tienda@gmail.com',
    'ana@universidad.edu.co',
  ]);

  for (const correo of CORREOS_VALIDOS) {
    test(`CA-01 a CA-03: se acepta el correo válido ${correo}`, async ({ page }) => {
      // Solo las filas que fallan quedan como "fallo esperado"; las demás deben pasar de verdad.
      test.fail(FALLAN_HOY.has(correo), 'TDT-111 · el formato de correo rechaza correos válidos (puntos, guiones, "+" o subdominios)');
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();
      await tienda.llenarDatos({ ...DATOS_VALIDOS, correo });
      await tienda.confirmar();

      await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).toBeVisible();
    });
  }

  for (const correo of CORREOS_MAL_FORMADOS) {
    test(`CA-04: se rechaza el correo mal formado "${correo}"`, async ({ page }) => {
      const tienda = new TiendaPage(page);
      await tienda.abrir();
      await tienda.agregar('Esfero azul');
      await tienda.irAPagar();
      await tienda.llenarDatos({ ...DATOS_VALIDOS, correo });
      await tienda.confirmar();

      await expect(page.getByText('El correo no tiene un formato válido.')).toBeVisible();
      await expect(page.getByRole('heading', { name: '¡Pedido confirmado!' })).toHaveCount(0);
    });
  }
});
