const SUPABASE_FUNCTION = 'https://hikwcryqqixqjmckhxyh.supabase.co/functions/v1/mareuil-match';
const SUPABASE_REST = 'https://hikwcryqqixqjmckhxyh.supabase.co/rest/v1';
const SUPABASE_KEY = 'sb_publishable_LkQYS2DPXHlsgM0brO_84g_Z4KEdWwy';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const token = String(req.query?.token || '').trim();
      let activeToken = token;
      if (!activeToken) {
        const mr = await fetch(`${SUPABASE_REST}/matches?status=eq.open&order=match_date.desc&limit=1&select=public_token`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }, cache: 'no-store' });
        const matches = await mr.json();
        if (!mr.ok || !matches?.length) return res.status(404).json({ error: 'Aucun match ouvert actuellement.' });
        activeToken = matches[0].public_token;
      }
      const r = await fetch(`${SUPABASE_FUNCTION}?api=match&token=${encodeURIComponent(activeToken)}`, { cache: 'no-store' });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { data = { error: text || 'Réponse invalide.' }; }
      return res.status(r.status).json(data);
    }
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const r = await fetch(SUPABASE_FUNCTION, { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body) });
      const text = await r.text();
      let data; try { data = JSON.parse(text); } catch { data = { error: text || 'Réponse invalide.' }; }
      return res.status(r.status).json(data);
    }
    res.setHeader('Allow','GET, POST');
    return res.status(405).json({error:'Méthode non autorisée.'});
  } catch(e) {
    return res.status(502).json({error:e?.message || 'Erreur serveur.'});
  }
}
