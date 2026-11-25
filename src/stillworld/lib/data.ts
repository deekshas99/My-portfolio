import { createClient } from '@supabase/supabase-js';
import type { Draft, Submission } from './types';
import { validateDraft } from './core.mjs';

const url=import.meta.env.VITE_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase=url && key ? createClient(url,key) : null;
export const isDemo=!supabase;
const LOCAL_KEY='stillworld:local-demo:v1';

function localRows():Submission[]{
  try {
    const value=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]');
    if(!Array.isArray(value))return [];
    return value.filter((r)=>!validateDraft(r) && typeof r.id==='string' && ['pending','approved','rejected'].includes(r.status));
  } catch{return [];}
}
function save(rows:Submission[]){localStorage.setItem(LOCAL_KEY,JSON.stringify(rows));window.dispatchEvent(new Event('stillworld-change'));}
export async function getApproved():Promise<Submission[]>{
  if(!supabase)return localRows().filter(r=>r.status==='approved');
  const {data,error}=await supabase.from('inhabitants').select('id,name,message,activity,finish,status,created_at').eq('status','approved').order('created_at');
  if(error)throw error;return data as Submission[];
}
export async function submitMessage(draft:Draft,website:string):Promise<void>{
  const error=validateDraft(draft);if(error)throw new Error(error);
  const clean={...draft,name:draft.name.trim(),message:draft.message.trim()};
  if(!supabase){
    if(website)return;
    const rows=localRows();if(rows.length>=200)throw new Error('This local preview is full. Remove a message in the demo review panel.');
    save([...rows,{...clean,id:crypto.randomUUID(),status:'pending',created_at:new Date().toISOString()}]);return;
  }
  const {data,error:failure}=await supabase.functions.invoke('submit-message',{body:{...clean,website}});
  if(failure){
    let detail='Could not send your message. Please try again shortly.';
    try{if('context' in failure){const response=await (failure.context as Response).json();detail=response.error||detail;}}catch{}
    throw new Error(detail);
  }
  if(data?.error)throw new Error(data.error);
}
export async function getSubmissions():Promise<Submission[]>{
  if(!supabase)return localRows().slice().reverse();
  const {data,error}=await supabase.from('inhabitants').select('*').order('created_at',{ascending:false});
  if(error)throw error;return data as Submission[];
}
export async function setStatus(id:string,status:Submission['status']){
  if(!supabase){save(localRows().map(r=>r.id===id?{...r,status}:r));return;}
  const {data,error}=await supabase.from('inhabitants').update({status}).eq('id',id).select('id');
  if(error)throw error;if(!data?.length)throw new Error('This account cannot approve messages.');
  window.dispatchEvent(new Event('stillworld-change'));
}
export async function removeSubmission(id:string){
  if(!supabase){save(localRows().filter(r=>r.id!==id));return;}
  const {data,error}=await supabase.from('inhabitants').delete().eq('id',id).select('id');
  if(error)throw error;if(!data?.length)throw new Error('This account cannot remove messages.');
  window.dispatchEvent(new Event('stillworld-change'));
}
