import { type Locator, type Page } from '@playwright/test';

/** Datos válidos para completar el formulario de envío. */
export const DATOS_VALIDOS = {
  nombre: 'Ana Gómez',
  correo: 'ana@correo.com',
  direccion: 'Calle 10 # 20-30',
};

/**
 * PARTE 5 · PAGE OBJECT DE LA TIENDA.
 * Las pruebas cuentan la HISTORIA; el "cómo" (los localizadores) vive aquí, en un solo lugar.
 * Regla de oro: acciones (agregar, aplicarCodigo...) y localizadores (cantidad, total...). Los expect van en las pruebas.
 */
export class TiendaPage {
  /** El panel del carrito (la tarjeta que tiene el encabezado "Carrito"). */
  readonly carrito: Locator;

  constructor(readonly page: Page) {
    this.carrito = page
      .locator('.rounded-lg')
      .filter({ has: page.getByRole('heading', { name: 'Carrito' }) });
  }

  // ---------- Catálogo ----------
  async abrir(): Promise<void> {
    await this.page.goto('/');
  }

  tarjeta(producto: string): Locator {
    return this.page
      .locator('.rounded-lg')
      .filter({ has: this.page.getByRole('heading', { name: producto, level: 3 }) });
  }

  async agregar(producto: string, cantidad = 1): Promise<void> {
    const tarjeta = this.tarjeta(producto);
    await tarjeta.getByRole('spinbutton').fill(String(cantidad));
    await tarjeta.getByRole('button', { name: 'Agregar' }).click();
  }

  /** El contador del encabezado ("🛒 5 artículo(s)"). */
  contador(): Locator {
    return this.page.getByRole('banner').getByText(/artículo\(s\)/);
  }

  // ---------- Carrito ----------
  linea(producto: string): Locator {
    return this.carrito.getByRole('listitem').filter({ hasText: producto });
  }

  cantidad(producto: string): Locator {
    return this.linea(producto).locator('span');
  }

  async aumentar(producto: string): Promise<void> {
    await this.carrito.getByRole('button', { name: `Aumentar cantidad de ${producto}` }).click();
  }

  async disminuir(producto: string): Promise<void> {
    await this.carrito.getByRole('button', { name: `Disminuir cantidad de ${producto}` }).click();
  }

  async eliminar(producto: string): Promise<void> {
    await this.carrito.getByRole('button', { name: `Eliminar ${producto}` }).click();
  }

  async aplicarCodigo(codigo: string): Promise<void> {
    await this.carrito.getByPlaceholder('Código de descuento').fill(codigo);
    await this.carrito.getByRole('button', { name: 'Aplicar' }).click();
  }

  mensajeDescuento(): Locator {
    return this.carrito.locator('p.text-xs');
  }

  /** Valor de una fila del resumen: 'Subtotal', 'Descuento', 'IVA' o 'Total'. */
  total(fila: 'Subtotal' | 'Descuento' | 'IVA' | 'Total'): Locator {
    const etiquetas = {
      Subtotal: 'dt:text-is("Subtotal") + dd',
      Descuento: 'dt:text("Descuento") + dd', // la etiqueta incluye el porcentaje: "Descuento (10%)"
      IVA: 'dt:text-is("IVA (19%)") + dd',
      Total: 'dt:text-is("Total") + dd',
    };
    return this.carrito.locator(etiquetas[fila]);
  }

  get botonPagar(): Locator {
    return this.carrito.getByRole('button', { name: 'Ir a pagar' });
  }

  async irAPagar(): Promise<void> {
    await this.botonPagar.click();
  }

  // ---------- Checkout y confirmación ----------
  /** getByLabel no funciona: la etiqueta no está asociada al campo. */
  campo(etiqueta: 'Nombre completo' | 'Correo electrónico' | 'Dirección de entrega'): Locator {
    return this.page.locator(`label:text-is("${etiqueta}") + input`);
  }

  async llenarDatos(datos: { nombre?: string; correo?: string; direccion?: string }): Promise<void> {
    if (datos.nombre !== undefined) await this.campo('Nombre completo').fill(datos.nombre);
    if (datos.correo !== undefined) await this.campo('Correo electrónico').fill(datos.correo);
    if (datos.direccion !== undefined) await this.campo('Dirección de entrega').fill(datos.direccion);
  }

  async confirmar(): Promise<void> {
    await this.page.getByRole('button', { name: 'Confirmar pedido' }).click();
  }

  async volverALaTienda(): Promise<void> {
    await this.page.getByRole('button', { name: 'Volver a la tienda' }).click();
  }

  /** Lee el número de pedido de la pantalla de confirmación (ej. "1001"). */
  async numeroDePedido(): Promise<string> {
    const texto = await this.page.getByText(/Número de pedido:/).innerText();
    const numero = texto.match(/#(\d+)/);
    if (!numero) throw new Error(`No encontré el número de pedido en: "${texto}"`);
    return numero[1];
  }

  /** Atajo: compra completa de un producto con datos válidos, hasta ver "¡Pedido confirmado!". */
  async comprar(producto: string): Promise<void> {
    await this.agregar(producto);
    await this.irAPagar();
    await this.llenarDatos(DATOS_VALIDOS);
    await this.confirmar();
    // Esperar la pantalla de confirmación (no es una aserción: evita leer el número demasiado pronto).
    await this.page.getByRole('heading', { name: '¡Pedido confirmado!' }).waitFor();
  }
}