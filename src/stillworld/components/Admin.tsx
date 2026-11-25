import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Dialog from './Dialog';
import { getSubmissions, isDemo, removeSubmission, setStatus, supabase } from '../lib/data';
import type { Submission } from '../lib/types';

export default function Admin({onClose}:{onClose:()=>void}){
  const [allowed,setAllowed]=useState(isDemo);const [checking,setChecking]=useState(!isDemo);
  const [rows,setRows]=useState<Submission[]>([]);const [error,setError]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');
  const [busy,setBusy]=useState<string|null>(null);const [filter,setFilter]=useState<Submission['status']>('pending');
  const refresh=async()=>{try{setRows(await getSubmissions());}catch(e){setError(e instanceof Error?e.message:'Could not load messages.');}};
  const check=async()=>{
    if(!supabase)return;
    try{const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user){setAllowed(false);return;}
      const {data,error}=await supabase.from('world_admins').select('user_id').eq('user_id',user.id).maybeSingle();
      if(error)throw error;setAllowed(!!data);if(!data)setError('This account is not a world administrator.');
    }catch(e){setError(e instanceof Error?e.message:'Unable to check your account.');}finally{setChecking(false);}
  };
  useEffect(()=>{void check();},[]);
  useEffect(()=>{if(allowed)void refresh();},[allowed]);
  const login=async(e:FormEvent)=>{e.preventDefault();if(!supabase)return;setError('');setBusy('login');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else{setPassword('');await check();}setBusy(null);};
  const update=async(id:string,status:Submission['status']|'delete')=>{setBusy(id);setError('');try{if(status==='delete')await removeSubmission(id);else await setStatus(id,status);await refresh();}catch(e){setError(e instanceof Error?e.message:'Could not update this message.');}finally{setBusy(null);}};
  const logout=async()=>{await supabase?.auth.signOut();setAllowed(false);setRows([]);};
  return <Dialog title={isDemo?'Demo review':'Your garden, curated.'} onClose={onClose} wide={allowed}>
    {checking?<p>Checking your account…</p>:!allowed?<form onSubmit={login}>
      <p className="dialog-description">Sign in to review the flowers waiting to join.</p>
      <label className="field-label" htmlFor="admin-email">Email</label><input id="admin-email" type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/>
      <label className="field-label" htmlFor="admin-password">Password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/>
      <button className="primary-button" disabled={!!busy}>Sign in <span>↗</span></button>
    </form>:<>
      {isDemo&&<p className="notice">Local demonstration only. These approvals affect this browser. Live moderation requires your Supabase setup.</p>}
      <div className="review-tabs" role="group" aria-label="Filter messages">{(['pending','approved','rejected'] as const).map(s=><button key={s} className={filter===s?'selected':''} aria-pressed={filter===s} onClick={()=>setFilter(s)}>{s}<span>{rows.filter(r=>r.status===s).length}</span></button>)}</div>
      <div className="review-list">{rows.filter(r=>r.status===filter).length===0?<p className="empty-state">{filter==='pending'?'No one is waiting. A little room to breathe.':`No ${filter} messages yet.`}</p>:rows.filter(r=>r.status===filter).map(row=><article className="review-item" key={row.id}>
        <div className="review-name"><span className={`tiny-orb ${row.finish}`}/><strong>{row.name}</strong><time>{new Date(row.created_at).toLocaleDateString()}</time></div>
        <p>{row.message}</p>
        <div className="review-actions">{row.status!=='approved'&&<button disabled={busy===row.id} onClick={()=>update(row.id,'approved')}>Approve</button>}{row.status!=='rejected'&&<button disabled={busy===row.id} onClick={()=>update(row.id,'rejected')}>{row.status==='approved'?'Unpublish':'Decline'}</button>}{isDemo&&<button disabled={busy===row.id} onClick={()=>update(row.id,'delete')}>Delete</button>}</div>
      </article>)}</div>
      {!isDemo&&<button className="text-button" onClick={logout}>Sign out</button>}
    </>}
    {error&&<p className="error" role="alert">{error}</p>}
  </Dialog>;
}
