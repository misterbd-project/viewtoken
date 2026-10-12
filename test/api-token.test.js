import assert from 'node:assert'
import { handleTokenRequest } from '../api/token.js'

async function runTests() {
  console.log('--- Memulai Pengujian Serverless API api/token.js ---')

  // Setup env mock untuk pengujian
  process.env.ADMIN_SECRET = 'rahasia123'
  process.env.VITE_SUPABASE_URL = 'https://mock.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock-key'

  // Helper untuk membuat fake response
  function createFakeRes() {
    return {
      statusCode: 200,
      headers: {},
      body: null,
      setHeader(k, v) { this.headers[k] = v },
      status(code) { this.statusCode = code; return this },
      json(data) { this.body = data; return this }
    }
  }

  // Uji 1: POST tanpa secret harus ditolak 401 Unauthorized
  {
    const req = {
      method: 'POST',
      headers: {},
      body: { token: 'TEST-123' }
    }
    const res = createFakeRes()
    await handleTokenRequest(req, res)
    assert.strictEqual(res.statusCode, 401, 'Harus mengembalikan 401 jika secret kosong')
    console.log('✓ Uji 1 Berhasil: Request tanpa secret ditolak dengan 401')
  }

  // Uji 2: POST dengan secret salah harus ditolak 401
  {
    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer kunci-salah' },
      body: { token: 'TEST-123' }
    }
    const res = createFakeRes()
    await handleTokenRequest(req, res)
    assert.strictEqual(res.statusCode, 401, 'Harus 401 jika secret salah')
    console.log('✓ Uji 2 Berhasil: Request dengan secret salah ditolak dengan 401')
  }

  // Uji 3: POST dengan secret benar tetapi token kosong / spasi harus ditolak 400
  {
    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer rahasia123' },
      body: { token: '   ' }
    }
    const res = createFakeRes()
    await handleTokenRequest(req, res)
    assert.strictEqual(res.statusCode, 400, 'Harus 400 jika token hanya spasi')
    console.log('✓ Uji 3 Berhasil: Token kosong/spasi ditolak dengan 400')
  }

  // Uji 4: POST dengan token melebihi 100 karakter harus ditolak 400
  {
    const req = {
      method: 'POST',
      headers: { authorization: 'Bearer rahasia123' },
      body: { token: 'A'.repeat(101) }
    }
    const res = createFakeRes()
    await handleTokenRequest(req, res)
    assert.strictEqual(res.statusCode, 400, 'Harus 400 jika token > 100 karakter')
    console.log('✓ Uji 4 Berhasil: Token terlalu panjang ditolak dengan 400')
  }

  // Uji 5: OPTIONS request mengembalikan 200 (CORS preflight)
  {
    const req = { method: 'OPTIONS', headers: {} }
    const res = createFakeRes()
    await handleTokenRequest(req, res)
    assert.strictEqual(res.statusCode, 200, 'CORS preflight OPTIONS harus 200')
    console.log('✓ Uji 5 Berhasil: CORS preflight mengembalikan 200')
  }

  console.log('Semua pengujian keamanan serverless api/token.js LOLOS 100%!\n')
}

runTests().catch(err => {
  console.error('Pengujian gagal:', err)
  process.exit(1)
})
