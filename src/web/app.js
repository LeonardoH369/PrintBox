const page = document.body.dataset.page;
const message = document.getElementById('message');
const money = (value) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(
    value
  );
const show = (text, error = false) => {
  message.textContent = text;
  message.className = `message${error ? ' error' : ''}`;
};
let canManageProducts = false;
async function request(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: { ...options?.headers, 'X-PrintBox': '1' },
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok)
    throw new Error(
      (data?.errors || []).join(', ') ||
        data?.message ||
        `Error HTTP ${response.status}`
    );
  return data;
}
function cell(tr, value) {
  const td = document.createElement('td');
  td.textContent = value;
  tr.append(td);
  return td;
}
async function loadProducts() {
  const body = document.getElementById('products');
  try {
    const products = await request('/api/products');
    body.replaceChildren();
    if (!products.length) {
      const tr = document.createElement('tr');
      const td = cell(tr, 'No hay productos activos todavía.');
      td.colSpan = 5;
      td.className = 'empty';
      body.append(tr);
      return;
    }
    for (const product of products) {
      const tr = document.createElement('tr');
      cell(tr, product.name);
      cell(tr, product.category || 'Sin categoría');
      cell(tr, money(product.price));
      cell(tr, String(product.stock));
      const actions = document.createElement('td');
      actions.className = 'actions';
      const edit = document.createElement('a');
      edit.className = 'button secondary';
      edit.href = `/products/${product.id}/edit`;
      edit.textContent = 'Editar';
      const del = document.createElement('button');
      del.className = 'danger';
      del.textContent = 'Eliminar';
      del.addEventListener('click', async () => {
        if (!confirm(`¿Desactivar el producto "${product.name}"?`)) return;
        try {
          await request(`/api/products/${product.id}`, { method: 'DELETE' });
          show('Producto desactivado correctamente.');
          await loadProducts();
        } catch (e) {
          show(e.message, true);
        }
      });
      if (canManageProducts) actions.append(edit, del);
      tr.append(actions);
      body.append(tr);
    }
  } catch (error) {
    body.replaceChildren();
    show(`No fue posible cargar el catálogo: ${error.message}`, true);
  }
}
function drawFields() {
  document.getElementById('fields').innerHTML =
    `<label for="name">Nombre *</label><input id="name" name="name" maxlength="100" required><label for="description">Descripción</label><textarea id="description" name="description"></textarea><div class="form-grid"><div><label for="price">Precio (MXN) *</label><input id="price" name="price" type="number" min="0" step="0.01" required></div><div><label for="stock">Existencias *</label><input id="stock" name="stock" type="number" min="0" step="1" required></div></div><label for="category">Categoría</label><input id="category" name="category" maxlength="50">`;
}
async function setupForm() {
  drawFields();
  const form = document.getElementById('product-form');
  const match = location.pathname.match(/^\/products\/(\d+)\/edit$/);
  const id = match?.[1];
  if (page === 'edit') {
    if (!id) {
      show('ID de producto inválido.', true);
      form.hidden = true;
      return;
    }
    try {
      const item = await request(`/api/products/${id}`);
      for (const key of ['name', 'description', 'price', 'stock', 'category'])
        form.elements[key].value = item[key] ?? '';
    } catch (e) {
      show(e.message, true);
      form.hidden = true;
      return;
    }
  } else {
    form.elements.stock.value = '0';
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.price = Number(data.price);
    data.stock = Number(data.stock);
    try {
      await request(id ? `/api/products/${id}` : '/api/products', {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      window.location.assign('/products');
    } catch (error) {
      show(error.message, true);
    }
  });
}
async function initProducts() {
  const user = await request('/api/auth/me');
  canManageProducts = user.role === 'ADMIN';
  if (page === 'index') {
    const create = document.querySelector('.heading a.button');
    if (create && !canManageProducts) create.remove();
    await loadProducts();
  } else await setupForm();
}
initProducts().catch((error) => show(error.message, true));
