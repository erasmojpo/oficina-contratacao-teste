// Chamadas às funções do banco (Supabase RPC) com fetch simples, sem biblioteca.
(function () {
  const C = window.OFC_CONFIG;
  async function rpc(fn, args) {
    const r = await fetch(C.url + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: C.key, Authorization: 'Bearer ' + C.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ p_amb: C.amb }, args || {}))
    });
    const txt = await r.text();
    let j = null;
    try { j = txt ? JSON.parse(txt) : null; } catch (e) { j = null; }
    if (!r.ok) throw new Error((j && (j.message || j.error)) || ('Erro ' + r.status));
    return j;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function qr(url) {
    const q = window.qrcode(0, 'M');
    q.addData(url);
    q.make();
    return q.createSvgTag({ cellSize: 8, margin: 2, scalable: true });
  }
  window.OFC = { rpc, esc, qr, cfg: C };
})();
