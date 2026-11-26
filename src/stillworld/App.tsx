import { Component, lazy, Suspense, useCallback, useEffect, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { worldConfig } from './config';
import type { Person } from './lib/types';
import { getApproved } from './lib/data';
import { pagePeople } from './lib/core.mjs';
import { useFlowerHover } from './lib/useFlowerHover';
import Join from './components/Join';
import Admin from './components/Admin';
import Dialog from './components/Dialog';
import GardenReadout from './components/GardenReadout';
import { registerWorldTools } from './lib/webmcp';
import { supportsWebGL2 } from '../lib/webgl';
const World=lazy(()=>import('./scene/World'));

class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{
  state={failed:false};static getDerivedStateFromError(){return{failed:true};}
  componentDidCatch(_error:Error,_info:ErrorInfo){this.props.onFailure();}
  render(){return this.state.failed?<div className="scene-fallback"/>:this.props.children;}
}
function useMedia(query:string){const [yes,setYes]=useState(()=>matchMedia(query).matches);useEffect(()=>{const media=matchMedia(query);const change=()=>setYes(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[query]);return yes;}

export default function App(){
  useEffect(registerWorldTools,[]);
  const [approved,setApproved]=useState<Person[]>([]);
  const {activeId,enter,leave,pin,clearAll}=useFlowerHover();
  const [dialog,setDialog]=useState<'join'|'people'|'admin'|null>(()=>location.hash==='#admin'?'admin':null);
  const [webglAvailable]=useState(supportsWebGL2);
  const [paused,setPaused]=useState(false);const [ready,setReady]=useState(!webglAvailable);const [failed,setFailed]=useState(!webglAvailable);const [dataError,setDataError]=useState(false);const [page,setPage]=useState(0);
  const [fallbackPerson,setFallbackPerson]=useState<Person|null>(null);
  const reduced=useMedia('(prefers-reduced-motion: reduce)');const mobile=useMedia('(max-width: 650px)');
  const planted=[worldConfig.owner,...worldConfig.seeded];const all=[...planted,...approved];
  const perPage=mobile?worldConfig.mobilePeoplePerView:worldConfig.peoplePerView;
  const selection=pagePeople(approved,page,perPage);
  const people=[...planted,...selection.people];
  const close=useCallback(()=>{clearAll();document.body.style.cursor='';},[clearAll]);
  const select=useCallback((id:string)=>{
    if(!id){pin(null);return;}
    const person=[worldConfig.owner,...worldConfig.seeded,...approved].find(p=>p.id===id);
    if(!person)return;
    pin(id);
  },[approved,pin]);
  const meshEnter=useCallback((id:string)=>enter(id,'mesh'),[enter]);
  const meshLeave=useCallback((id:string)=>leave(id,'mesh'),[leave]);
  const cardEnter=useCallback((id:string)=>enter(id,'card'),[enter]);
  const cardLeave=useCallback((id:string)=>leave(id,'card'),[leave]);
  const onReady=useCallback(()=>setReady(true),[]);
  const onFailure=useCallback(()=>{setFailed(true);setReady(true);},[]);
  useEffect(()=>{
    let alive=true;
    const refresh=async()=>{try{const rows=await getApproved();if(alive){setApproved(rows);setDataError(false);}}catch{if(alive)setDataError(true);}};
    void refresh();const timer=window.setInterval(()=>{if(!document.hidden)void refresh();},30000);
    window.addEventListener('stillworld-change',refresh);window.addEventListener('storage',refresh);
    return()=>{alive=false;clearInterval(timer);window.removeEventListener('stillworld-change',refresh);window.removeEventListener('storage',refresh);};
  },[]);
  useEffect(()=>{if(activeId&&!all.find(p=>p.id===activeId))close();},[approved,activeId]);
  useEffect(()=>{const change=()=>{if(location.hash==='#admin')setDialog('admin');};const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close();};window.addEventListener('hashchange',change);window.addEventListener('keydown',key);return()=>{window.removeEventListener('hashchange',change);window.removeEventListener('keydown',key);clearAll();};},[close,clearAll]);
  const openDialog=(name:typeof dialog)=>{close();setDialog(name);};
  const closeDialog=()=>{setDialog(null);if(location.hash==='#admin')history.replaceState(null,'',location.pathname+location.search);};
  const visit=(person:Person)=>{if(failed){closeDialog();setFallbackPerson(person);return;}const index=approved.findIndex(p=>p.id===person.id);if(index>=0)setPage(Math.floor(index/perPage));closeDialog();select(person.id);};
  return <main className="world-app">
    <a className="skip-link" href="#people-control">Read the messages</a>
    <div className="scene" aria-hidden="true">{failed?<div className="scene-fallback"/>:<SceneBoundary onFailure={onFailure}><Suspense fallback={null}><World people={people} activeId={activeId} paused={paused||!!dialog} reduced={reduced} onMeshEnter={meshEnter} onMeshLeave={meshLeave} onCardEnter={cardEnter} onCardLeave={cardLeave} onSelect={select} onReady={onReady} onFailure={onFailure}/></Suspense></SceneBoundary>}</div>
    <div className="grain" aria-hidden="true"/><div className="edge-shade" aria-hidden="true"/>
    {ready&&<GardenReadout animate={!reduced&&!paused&&!dialog}/>}
    {worldConfig.invitesOpen&&<header className="header"><button className="join-button" onClick={()=>openDialog('join')}><span className="join-label">Leave a message</span><span className="plus-icon" aria-hidden="true">+</span></button></header>}
    {!ready&&<div className="loading" role="status"><span className="loading-orb"/><span className="sr-only">Loading the garden</span></div>}
    {failed&&<div className="fallback-note"><button className="text-button" onClick={()=>openDialog('people')}>Read the flower messages</button></div>}
    {/* Keyboard controls remain available without introducing persistent visual clutter. */}
    <nav className="quiet-tools" aria-label="Garden controls">
      <button id="people-control" aria-label="Read all messages" onClick={()=>openDialog('people')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/></svg></button>
      {!failed&&<button aria-label={paused?'Resume movement':'Pause movement'} aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'▷':'Ⅱ'}</button>}
      {!failed&&selection.pages>1&&<button aria-label="Show the next flowers" onClick={()=>{close();setPage(selection.index+1);}}>→</button>}
    </nav>
    {dataError&&<div className="sr-only" role="status">Visitor messages are temporarily unavailable.</div>}
    {dialog==='join'&&<Join onClose={closeDialog}/>}{dialog==='admin'&&<Admin onClose={closeDialog}/>}
    {dialog==='people'&&<Dialog title="The flowers here." onClose={closeDialog}><p className="dialog-description">Each flower carries a thought. Choose one to read.</p><div className="people-list">{all.map(person=><button key={person.id} onClick={()=>visit(person)}><span className={`tiny-orb ${person.finish}`}/><span>{person.name}</span><small>{person.id==='owner'?'HOST':person.activity==='walk'?'SWAYING':'STILL'}</small><span>↗</span></button>)}</div></Dialog>}
    {failed&&fallbackPerson&&<Dialog title={fallbackPerson.name} onClose={()=>setFallbackPerson(null)}><p style={{fontSize:'1.125rem',lineHeight:1.7,whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{fallbackPerson.message}</p><button className="text-button" onClick={()=>{setFallbackPerson(null);openDialog('people');}}>All flower messages</button></Dialog>}
  </main>;
}
