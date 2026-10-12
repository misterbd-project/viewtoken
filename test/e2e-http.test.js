import assert from 'node:assert'

async function runE2ETests() {
  console.log('--- Pengujian Endpoint & Routing Lokal (Vite Dev Server) ---')

  const baseUrl = 'http://localhost:5173'

  // 1. Uji Landing Page
  {
    const res = await fetch(`${baseUrl}/`)
    assert.strictEqual(res.status, 200, 'Landing page harus merespons 200')
    const html = await res.text()
    assert.ok(html.includes('Token Display'), 'HTML harus mengandung Token Display')
    console.log('✓ Uji 1: Route Landing Page (/) aktif dan mengembalikan HTML utama')
  }

  // 2. Uji Route /admin
  {
    const res = await fetch(`${baseUrl}/admin`)
    assert.strictEqual(res.status, 200, 'Route /admin harus merespons 200')
    const html = await res.text()
    assert.ok(html.includes('id="root"'), 'Route /admin harus merespons SPA template')
    console.log('✓ Uji 2: Route Admin (/admin) aktif tanpa error 404')
  }

  // 3. Uji Route /client
  {
    const res = await fetch(`${baseUrl}/client`)
    assert.strictEqual(res.status, 200, 'Route /client harus merespons 200')
    const html = await res.text()
    assert.ok(html.includes('id="root"'), 'Route /client harus merespons SPA template')
    console.log('✓ Uji 3: Route Client (/client) aktif tanpa error 404')
  }

  // 4. Uji API Serverless Middleware /api/token (POST tanpa secret)
  {
    const res = await fetch(`${baseUrl}/api/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'TEST-99' })
    })
    assert.strictEqual(res.status, 401, 'Endpoint /api/token harus menolak request tanpa secret')
    const json = await res.json()
    assert.ok(json.error, 'Respons harus memuat pesan error')
    console.log('✓ Uji 4: POST /api/token tanpa secret ditolak dengan status 401 Unauthorized')
  }

  // 5. Uji API Serverless Middleware /api/token (POST dengan secret benar tapi token kosong)
  {
    const res = await fetch(`${baseUrl}/api/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer admin123'
      },
      body: JSON.stringify({ token: '   ' })
    })
    assert.strictEqual(res.status, 400, 'Token kosong harus ditolak dengan 400')
    const json = await res.json()
    assert.strictEqual(json.error, 'Token tidak boleh kosong atau hanya berisi spasi.')
    console.log('✓ Uji 5: POST /api/token dengan token kosong/spasi ditolak dengan status 400 Bad Request')
  }

  console.log('\nSeluruh 5 pengujian E2E & routing pada dev server LOLOS 100%!')
}

runE2ETests().catch(err => {
  console.error('Pengujian E2E gagal:', err)
  process.exit(1)
})
