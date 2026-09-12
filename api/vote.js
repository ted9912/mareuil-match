const SUPABASE_FUNCTION =
  'https://hikwcryqqixqjmckhxyh.supabase.co/functions/v1/mareuil-match';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const token = String(req.query?.token || '').trim();

      if (!token) {
        return res.status(400).json({ error: 'Token manquant.' });
      }

      const r = await fetch(
        `${SUPABASE_FUNCTION}?api=match&token=${encodeURIComponent(token)}`
      );

      const text = await r.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || 'Réponse invalide.' };
      }

      return res.status(r.status).json(data);
    }

    if (req.method === 'POST') {
      const r = await fetch(SUPABASE_FUNCTION, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(req.body || {})
      });

      const text = await r.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text || 'Réponse invalide.' };
      }

      return res.status(r.status).json(data);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({
      error: 'Méthode non autorisée.'
    });

  } catch (e) {
    return res.status(502).json({
      error: e?.message || 'Erreur serveur.'
    });
  }
}
