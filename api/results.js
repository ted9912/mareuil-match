const SUPABASE_FUNCTION='https://hikwcryqqixqjmckhxyh.supabase.co/functions/v1/mareuil-match';

export default async function handler(req,res){
  try{
    if(req.method!=='GET') return res.status(405).json({error:'Méthode non autorisée.'});
    const token=String(req.query?.token||'').trim();
    if(!token) return res.status(400).json({error:'Lien de résultats incomplet.'});
    const r=await fetch(SUPABASE_FUNCTION+'?api=results&token='+encodeURIComponent(token),{cache:'no-store'});
    const text=await r.text();
    let data; try{data=JSON.parse(text)}catch{data={error:text||'Réponse invalide.'}}
    return res.status(r.status).json(data);
  }catch(e){
    return res.status(502).json({error:e?.message||'Erreur serveur.'});
  }
}