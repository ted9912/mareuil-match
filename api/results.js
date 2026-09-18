const SUPABASE_FUNCTION='https://hikwcryqqixqjmckhxyh.supabase.co/functions/v1/mareuil-match';
const SUPABASE_REST='https://hikwcryqqixqjmckhxyh.supabase.co/rest/v1';
const SUPABASE_KEY='sb_publishable_LkQYS2DPXHlsgM0brO_84g_Z4KEdWwy';
const headers={apikey:SUPABASE_KEY,Authorization:'Bearer '+SUPABASE_KEY};

async function rest(path){
 const r=await fetch(SUPABASE_REST+path,{headers,cache:'no-store'});
 const text=await r.text();let j;try{j=JSON.parse(text)}catch{j=[]}
 if(!r.ok)throw new Error(j?.message||'Erreur Supabase');
 return j;
}

export default async function handler(req,res){
 try{
  if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée.'});
  const token=String(req.query?.token||'').trim();
  if(!token)return res.status(400).json({error:'Lien de résultats incomplet.'});

  // Les résultats/votes passent par l'Edge Function avec la clé serveur,
  // car les lignes de match_votes ne sont pas publiques via la clé publishable.
  const rr=await fetch(SUPABASE_FUNCTION+'?api=results&token='+encodeURIComponent(token),{cache:'no-store'});
  const rt=await rr.text();
  let data;try{data=JSON.parse(rt)}catch{data={error:rt||'Réponse invalide du serveur.'}}
  if(!rr.ok)return res.status(rr.status).json(data);

  // La liste des votants restants peut être lue publiquement.
  try{
   const matches=await rest('/matches?public_token=eq.'+encodeURIComponent(token)+'&select=id&limit=1');
   if(matches.length){
    const id=matches[0].id;
    const mv=await rest('/match_voters?match_id=eq.'+encodeURIComponent(id)+'&select=voter_id');
    const ids=mv.map(x=>x.voter_id);
    const voters=ids.length?await rest('/voters?id=in.('+ids.join(',')+')&select=id,name&active=eq.true'):[];
    const voted=new Set((data.voted_voter_ids||[]));
    data.pending_voters=voters.filter(v=>!voted.has(v.id)).map(v=>({id:v.id,name:v.name}));
   }
  }catch(e){ data.pending_voters=data.pending_voters||[]; }

  return res.status(200).json(data);
 }catch(e){
  return res.status(502).json({error:e?.message||'Erreur serveur.'});
 }
}