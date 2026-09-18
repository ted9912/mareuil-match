const SB='https://hikwcryqqixqjmckhxyh.supabase.co/rest/v1';
const KEY='sb_publishable_LkQYS2DPXHlsgM0brO_84g_Z4KEdWwy';
const headers={apikey:KEY,Authorization:'Bearer '+KEY};

async function q(path){
  const r=await fetch(SB+path,{headers,cache:'no-store'});
  const text=await r.text();let j;try{j=JSON.parse(text)}catch{j=[]}
  if(!r.ok)throw new Error(j?.message||'Erreur Supabase');
  return j;
}
export default async function handler(req,res){
 try{
  if(req.method!=='GET')return res.status(405).json({error:'Méthode non autorisée.'});
  const token=String(req.query?.token||'').trim();
  if(!token)return res.status(400).json({error:'Lien de résultats incomplet.'});
  const matches=await q('/matches?public_token=eq.'+encodeURIComponent(token)+'&select=id,opponent,match_date,status&limit=1');
  if(!matches.length)return res.status(404).json({error:'Match introuvable.'});
  const m=matches[0];
  const mp=await q('/match_players?match_id=eq.'+encodeURIComponent(m.id)+'&select=player_id');
  const ids=mp.map(x=>x.player_id);
  const ps=ids.length?await q('/players?id=in.('+ids.join(',')+')&select=id,name&active=eq.true'):[]; 
  const mv=await q('/match_votes?match_id=eq.'+encodeURIComponent(m.id)+'&select=voter_id,top_1,top_2,top_3,top_4,flop_1,flop_2,flop_3,flop_4');
  const matchVoters=await q('/match_voters?match_id=eq.'+encodeURIComponent(m.id)+'&select=voter_id');
  const voterIds=matchVoters.map(x=>x.voter_id);
  const voters=voterIds.length?await q('/voters?id=in.('+voterIds.join(',')+')&select=id,name&active=eq.true'):[];
  const voted=new Set(mv.map(x=>x.voter_id));
  const pending_voters=voters.filter(v=>!voted.has(v.id)).map(v=>({id:v.id,name:v.name}));
  const results=ps.map(p=>{
   const tv=[1,2,3,4].map(n=>mv.filter(v=>v['top_'+n]===p.id).length);
   const fv=[1,2,3,4].map(n=>mv.filter(v=>v['flop_'+n]===p.id).length);
   const tp=[4,3,2,1].reduce((s,n,i)=>s+n*tv[i],0);
   const fp=[-4,-3,-2,-1].reduce((s,n,i)=>s+n*fv[i],0);
   return {id:p.id,name:p.name,top_votes:tv,flop_votes:fv,top_points:tp,flop_points:fp,total:tp+fp};
  });
  return res.status(200).json({match:m,results,voters_count:voterIds.length,voted_count:voted.size,pending_voters});
 }catch(e){return res.status(502).json({error:e?.message||'Erreur serveur.'})}
}