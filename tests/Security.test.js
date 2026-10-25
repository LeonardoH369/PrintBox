const test = require('node:test');
const assert = require('node:assert/strict');
const {
  passwordHash,
  verifyPassword,
  nextStatus,
  photo,
  positiveId,
} = require('../src/application/security');
test('contraseñas con salt y rechazo de contraseña equivocada', () => {
  const hash = passwordHash('ContraseñaPrueba123');
  assert.notEqual(hash, passwordHash('ContraseñaPrueba123'));
  assert.equal(verifyPassword('ContraseñaPrueba123', hash), true);
  assert.equal(verifyPassword('otra contraseña', hash), false);
  assert.throws(() => passwordHash('123'));
});
test('impide saltar estados y regresar una entrega', () => {
  nextStatus('READY', 'IN_ROUTE');
  assert.throws(() => nextStatus('READY', 'DELIVERED'));
  assert.throws(() => nextStatus('DELIVERED', 'RECEIVED'));
  assert.throws(() => nextStatus('IN_ROUTE', 'IN_ROUTE'));
});
test('rechaza imagen falsa, imagen grande e identificadores inválidos', () => {
  assert.throws(() =>
    photo({
      mime: 'image/png',
      base64: Buffer.from('<script>').toString('base64'),
    })
  );
  assert.throws(() =>
    photo({
      mime: 'image/png',
      base64: Buffer.alloc(3 * 1024 * 1024 + 1).toString('base64'),
    })
  );
  for (const id of [0, -1, 1.5, '1 OR 1=1', '9007199254740992'])
    assert.throws(() => positiveId(id));
});
