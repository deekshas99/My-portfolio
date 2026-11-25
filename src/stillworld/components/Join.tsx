import { useState } from 'react';
import type { FormEvent } from 'react';
import Dialog from './Dialog';
import { isDemo, submitMessage } from '../lib/data';
import type { Draft, Finish, Activity } from '../lib/types';

export default function Join({onClose}:{onClose:()=>void}){
  const [draft,setDraft]=useState<Draft>({name:'',message:'',activity:'walk',finish:'silver'});
  const [website,setWebsite]=useState('');const [busy,setBusy]=useState(false);const [sent,setSent]=useState(false);const [error,setError]=useState('');
  const submit=async(e:FormEvent)=>{e.preventDefault();setBusy(true);setError('');try{await submitMessage(draft,website);setSent(true);}catch(e){setError(e instanceof Error?e.message:'Something went wrong. Please try again.');}finally{setBusy(false);}};
  return <Dialog title={sent?'A thought, left here.':'Leave a little of yourself.'} onClose={onClose}>
    {sent?<div className="success-state"><div className="success-orbit" aria-hidden="true">✓</div><p>{isDemo?'Your message is waiting in the local demo review panel. It is saved only in this browser.':'Your message is waiting for approval. Once approved, your flower will take its place in the garden.'}</p><button className="primary-button" onClick={onClose}>Back to the garden <span>↗</span></button></div>:
    <form onSubmit={submit}>
      <p className="dialog-description">A name. A small thought. A flower to carry it.</p>
      {isDemo&&<p className="notice">Local preview · messages stay in this browser until a live connection is configured.</p>}
      <label className="field-label" htmlFor="person-name">Your name</label><input id="person-name" autoComplete="nickname" maxLength={28} required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} placeholder="How should we know you?"/>
      <div className="field-heading"><label className="field-label" htmlFor="person-message">Your message</label><span className="counter">{draft.message.length}/180</span></div>
      <textarea id="person-message" rows={4} maxLength={180} required value={draft.message} onChange={e=>setDraft({...draft,message:e.target.value})} placeholder="Something you want to leave behind…"/>
      <div className="honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label></div>
      <fieldset><legend>Choose your petals</legend><div className="finish-options">{(['blue','silver','ink'] as Finish[]).map(f=><label key={f} className={`finish-option ${draft.finish===f?'chosen':''}`}><input type="radio" name="finish" value={f} checked={draft.finish===f} onChange={()=>setDraft({...draft,finish:f})}/><i className={`finish-sample ${f}`} aria-hidden="true"/><span>{f==='blue'?'Blue steel':f==='silver'?'Silver':'Ink'}</span></label>)}</div></fieldset>
      <fieldset><legend>Your flower’s movement</legend><div className="activity-options">{(['walk','pause'] as Activity[]).map(a=><label key={a} className={draft.activity===a?'chosen':''}><input type="radio" name="activity" value={a} checked={draft.activity===a} onChange={()=>setDraft({...draft,activity:a})}/>{a==='walk'?'Sway gently':'Stay still'}</label>)}</div></fieldset>
      {error&&<p className="error" role="alert">{error}</p>}
      <button className="primary-button" disabled={busy} type="submit">{busy?'Leaving your message…':'Send for approval'}<span>↗</span></button>
      <p className="fine-print">Every message is reviewed before its flower joins the garden.</p>
    </form>}
  </Dialog>;
}
