const SB='https://hikwcryqqixqjmckhxyh.supabase.co/rest/v1';
const KEY='sb_publishable_LkQYS2DPXHlsgM0brO_84g_Z4KEdWwy';

export default async function handler(req,res){
  try{
    if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée.'});
    const token=String(req.query?.token||'').trim();
    if(!token)return res.status(400).json({error:'Lien de résultats incomplet.'});
    const r=await fetch(SB+'/rpc/get_public_match_results',{
      method:'POST',
      headers:{apikey:KEY,Authorization:'Bearer '+KEY,'Content-Type':'application/json'},
      body:JSON.stringify({p_token:token}),
      cache:'no-store'
    });
    const text=await r.text();let data;try{data=JSON.parse(text)}catch{data={error:text||'Réponse invalide du serveur.'}}
    if(!r.ok)return res.status(r.status).json(data);
    return res.status(200).json(data);
  }catch(e){return res.status(502).json({error:e?.message||'Erreur serveur.'})}
}