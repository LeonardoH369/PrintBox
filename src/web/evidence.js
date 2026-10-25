const content = document.querySelector('#content');
const message = document.querySelector('#message');
const labels = {
  RECEIVED: 'Recibido',
  PRINTING: 'En impresión',
  READY: 'Listo',
  IN_ROUTE: 'En ruta',
  DELIVERED: 'Entregado',
};
const statuses = Object.keys(labels);
let currentUser;
function show(error) {
  message.textContent = error?.message || error || '';
}
async function api(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-PrintBox': '1' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 401 && document.body.dataset.view === 'admin')
    location.assign('/login');
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok)
    throw new Error(data.message || 'No fue posible completar la solicitud');
  return data;
}
function el(tag, value, parent = content) {
  const node = document.createElement(tag);
  node.textContent = value ?? '';
  if (parent) parent.append(node);
  return node;
}
function button(parent, label, action) {
  const node = el('button', label, parent);
  node.type = 'button';
  node.onclick = () => Promise.resolve().then(action).catch(show);
  return node;
}
function field(form, label, name, value = '', type = 'text') {
  const wrapper = el('label', label, form);
  const input = document.createElement(
    type === 'textarea' ? 'textarea' : 'input'
  );
  input.name = name;
  input.value = value;
  if (type !== 'textarea') input.type = type;
  input.required = true;
  wrapper.append(input);
  return input;
}
function select(form, label, name, options, value) {
  const wrap = el('label', label, form);
  const input = el('select', '', wrap);
  input.name = name;
  for (const [key, text] of options) {
    const option = el('option', text, input);
    option.value = key;
  }
  input.value = value;
  return input;
}
function submit(form, action) {
  const node = el('button', 'Guardar', form);
  node.type = 'submit';
  form.onsubmit = async (event) => {
    event.preventDefault();
    node.disabled = true;
    show('');
    try {
      await action(Object.fromEntries(new FormData(form)));
    } catch (error) {
      show(error);
    } finally {
      node.disabled = false;
    }
  };
}
function clear(title) {
  content.replaceChildren();
  show('');
  el('h2', title);
}
function table(headers) {
  const t = el('table');
  const row = el('tr', '', el('thead', '', t));
  headers.forEach((h) => el('th', h, row));
  return el('tbody', '', t);
}
function date(value) {
  return new Date(value).toLocaleString('es-MX');
}
async function users() {
  const data = await api('/api/users');
  clear('Usuarios activos e inactivos');
  button(content, 'Crear usuario', () => userForm());
  const body = table([
    'Nombre',
    'Correo',
    'Rol / departamento',
    'Estado',
    'Acciones',
  ]);
  data.forEach((user) => {
    const row = el('tr', '', body);
    [
      user.name,
      user.email,
      `${user.role} / ${user.department}`,
      user.isActive ? 'Activo' : 'Inactivo',
    ].forEach((v) => el('td', v, row));
    button(el('td', '', row), 'Editar', () => userForm(user));
  });
}
function userForm(user = {}) {
  clear(user.id ? 'Editar usuario' : 'Crear usuario');
  const form = el('form');
  field(form, 'Nombre', 'name', user.name).maxLength = 100;
  field(form, 'Correo', 'email', user.email, 'email').maxLength = 180;
  const password = field(
    form,
    'Contraseña (12 caracteres mínimo; vacía conserva la actual)',
    'password',
    '',
    'password'
  );
  password.required = !user.id;
  password.minLength = 12;
  password.maxLength = 128;
  field(
    form,
    'Departamento',
    'department',
    user.department || 'General'
  ).maxLength = 100;
  select(
    form,
    'Rol',
    'role',
    [
      ['OPERATOR', 'Operador'],
      ['ADMIN', 'Administrador'],
    ],
    user.role || 'OPERATOR'
  );
  select(
    form,
    'Estado',
    'isActive',
    [
      ['true', 'Activo'],
      ['false', 'Inactivo'],
    ],
    String(user.isActive ?? true)
  );
  submit(form, async (data) => {
    data.isActive = data.isActive === 'true';
    await api(
      user.id ? `/api/users/${user.id}` : '/api/users',
      user.id ? 'PUT' : 'POST',
      data
    );
    if (user.id === currentUser.id) location.assign('/login');
    else await users();
  });
}
async function orders(archived = false) {
  const data = await api(`/api/orders?archived=${archived}`);
  clear(
    archived ? 'Pedidos archivados' : 'Pedidos del más reciente al más antiguo'
  );
  if (!archived) button(content, 'Crear pedido', createOrder);
  const body = table(['Folio', 'Cliente', 'Estado', 'Fecha', 'Acciones']);
  for (const order of data) {
    const row = el('tr', '', body);
    [
      order.invoice,
      order.customerName,
      labels[order.status],
      date(order.createdAt),
    ].forEach((v) => el('td', v, row));
    const actions = el('td', '', row);
    button(actions, 'Ver pedido', () => orderDetail(order.id));
    if (currentUser.role === 'ADMIN')
      button(actions, archived ? 'Recuperar' : 'Archivar', async () => {
        await api(
          `/api/orders/${order.id}${archived ? '/restore' : ''}`,
          archived ? 'POST' : 'DELETE'
        );
        await orders(archived);
      });
  }
}
async function createOrder() {
  const products = await api('/api/products');
  clear('Crear pedido');
  const form = el('form');
  field(form, 'Cliente', 'customerName').maxLength = 100;
  field(
    form,
    'Descripción de impresión / entrega',
    'description',
    '',
    'textarea'
  ).maxLength = 3000;
  el(
    'p',
    'Indica cantidades para los productos solicitados. Se descuenta stock en una sola transacción.',
    form
  );
  for (const product of products) {
    const input = field(
      form,
      `${product.name} — $${product.price} MXN — ${product.stock} disponibles`,
      `quantity_${product.id}`,
      '0',
      'number'
    );
    input.min = 0;
    input.max = product.stock;
    input.step = 1;
  }
  submit(form, async (data) => {
    const items = products
      .map((p) => ({
        productId: p.id,
        quantity: Number(data[`quantity_${p.id}`]),
      }))
      .filter((p) => p.quantity > 0);
    const order = await api('/api/orders', 'POST', {
      customerName: data.customerName,
      description: data.description,
      items,
    });
    await orderDetail(order.id);
  });
}
async function readPhoto(file) {
  if (
    !file ||
    file.size > 3 * 1024 * 1024 ||
    !['image/png', 'image/jpeg'].includes(file.type)
  )
    throw new Error('Selecciona una imagen PNG/JPEG de hasta 3 MB');
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return { mime: file.type, base64 };
}
async function orderDetail(id) {
  const order = await api(`/api/orders/${id}`);
  clear(`Pedido ${order.invoice}`);
  el(
    'p',
    `${labels[order.status]} — ${date(order.statusChangedAt)}${order.archivedAt ? ' — Archivado' : ''}`
  );
  el(
    'p',
    'Comparte el folio únicamente con el cliente: permite consultar su estado y fotografía final.'
  );
  const body = table(['Producto', 'Cantidad', 'Precio unitario histórico']);
  order.items.forEach((item) => {
    const row = el('tr', '', body);
    [item.Product.name, item.quantity, `$${item.unitPrice} MXN`].forEach((v) =>
      el('td', v, row)
    );
  });
  const form = el('form');
  field(form, 'Cliente', 'customerName', order.customerName).maxLength = 100;
  field(
    form,
    'Descripción',
    'description',
    order.description,
    'textarea'
  ).maxLength = 3000;
  if (!order.archivedAt && order.status !== 'DELIVERED')
    submit(form, async (data) => {
      await api(`/api/orders/${id}`, 'PUT', data);
      await orderDetail(id);
    });
  if (!order.archivedAt && order.status !== 'DELIVERED') {
    const next = statuses[statuses.indexOf(order.status) + 1];
    const statusForm = el('form');
    el('h3', `Avanzar a ${labels[next]}`, statusForm);
    let file;
    if (['IN_ROUTE', 'DELIVERED'].includes(next)) {
      file = field(
        statusForm,
        'Tomar o adjuntar evidencia (PNG/JPEG, máximo 3 MB)',
        'photo',
        '',
        'file'
      );
      file.accept = 'image/png,image/jpeg';
      file.setAttribute('capture', 'environment');
    }
    submit(statusForm, async () => {
      await api(`/api/orders/${id}/status`, 'POST', {
        status: next,
        ...(file ? { photo: await readPhoto(file.files[0]) } : {}),
      });
      await orderDetail(id);
    });
  }
  el('h3', 'Historial');
  [...order.history]
    .sort((a, b) => a.id - b.id)
    .forEach((h) =>
      el(
        'p',
        `${date(h.createdAt)} — ${labels[h.status]} — Usuario ${h.userId}`
      )
    );
  el('h3', 'Evidencias');
  for (const photo of order.evidence || []) {
    el('p', `${labels[photo.status]} — ${date(photo.createdAt)}`);
    const image = el('img');
    image.src = `/api/orders/${id}/evidence/${photo.id}`;
    image.alt = `Evidencia ${labels[photo.status]}`;
  }
}
async function dashboard() {
  clear('Inicio');
  el(
    'p',
    'Accede a productos, usuarios, pedidos y archivos desde los enlaces del panel.'
  );
  const data = await api('/api/orders');
  el('p', `${data.length} pedidos activos.`);
  button(content, 'Abrir pedidos', () => orders());
}
async function init() {
  const view = document.body.dataset.view;
  if (view === 'tracking')
    document.querySelector('#tracking').onsubmit = async (event) => {
      event.preventDefault();
      const result = document.querySelector('#result');
      result.hidden = true;
      result.replaceChildren();
      show('');
      try {
        const data = await api(
          `/api/tracking/${encodeURIComponent(event.target.invoice.value.trim())}`
        );
        result.hidden = false;
        el('h2', labels[data.status], result);
        el('p', `Fecha del proceso: ${date(data.date)}`, result);
        if (data.photo) {
          const image = el('img', '', result);
          image.src = data.photo;
          image.alt = 'Fotografía de entrega del pedido';
        }
      } catch (error) {
        show(error);
      }
    };
  if (view === 'login')
    document.querySelector('#login').onsubmit = async (event) => {
      event.preventDefault();
      try {
        await api(
          '/api/auth/login',
          'POST',
          Object.fromEntries(new FormData(event.target))
        );
        location.assign('/admin');
      } catch (error) {
        show(error);
      }
    };
  if (view === 'admin') {
    currentUser = await api('/api/auth/me');
    document.querySelector('#welcome').textContent =
      `${currentUser.name} — ${currentUser.role}`;
    const events = {
      dashboard,
      users,
      orders: () => orders(),
      archived: () => orders(true),
      logout: async () => {
        await api('/api/auth/logout', 'POST');
        location.assign('/login');
      },
    };
    for (const [id, action] of Object.entries(events))
      document.getElementById(id).onclick = () =>
        Promise.resolve().then(action).catch(show);
    document.querySelector('#users').hidden = currentUser.role !== 'ADMIN';
    await dashboard();
  }
}
init().catch(show);
