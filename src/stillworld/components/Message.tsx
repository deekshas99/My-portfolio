import { useEffect, useState, useRef } from 'react';
import type { Person } from '../lib/types';
import { worldConfig } from '../config';

export default function Message({person,open,reduced,onEnter,onLeave,onClose}:{person:Person|null;open:boolean;reduced:boolean;onEnter:()=>void;onLeave:()=>void;onClose:()=>void}){
  const [count,setCount]=useState(0);const seen=useRef(new Set<string>());
  useEffect(()=>{
    if(!person||!open)return;
    if(reduced||seen.current.has(person.id)){setCount(person.message.length);return;}
    setCount(0);let n=0;let interval:number|undefined;
    const start=window.setTimeout(()=>{interval=window.setInterval(()=>{n++;setCount(n);if(n>=person.message.length){window.clearInterval(interval);seen.current.add(person.id);}},worldConfig.typeIntervalMs);},420);
    return()=>{window.clearTimeout(start);window.clearInterval(interval);};
  },[person?.id,person?.message,open,reduced]);
  if(!person)return null;
  return <section className={`message ${open?'message-open':''}`} aria-hidden={!open} onPointerEnter={onEnter} onPointerLeave={onLeave}>
    <div className="message-top"><button className="icon-button" tabIndex={open?0:-1} onClick={onClose} aria-label="Close message">×</button></div>
    <p className="message-text" aria-hidden="true">{person.message.slice(0,count)}{count<person.message.length&&<span className="type-cursor">▌</span>}</p>
    {/* Screen readers receive one complete message, not a stream of single letters. */}
    {open&&<p className="sr-only" role="status">{person.name}: {person.message}</p>}
    <div className="message-signature"><span className={`tiny-orb ${person.finish}`}/><span>{person.name}</span></div>
  </section>;
}
