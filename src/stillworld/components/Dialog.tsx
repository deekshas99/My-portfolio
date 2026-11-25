import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
export default function Dialog({title,onClose,children,wide=false}:{title:string;onClose:()=>void;children:ReactNode;wide?:boolean}){
  const ref=useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const el=ref.current!;const previous=document.activeElement as HTMLElement;
    el.showModal();const bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    return()=>{el.close();document.body.style.overflow=bodyOverflow;previous?.focus();};
  },[]);
  return <dialog ref={ref} className={`dialog ${wide?'dialog-wide':''}`} aria-labelledby="dialog-title" onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)onClose();}}}>
    <div className="dialog-header"><button className="icon-button" onClick={onClose} aria-label="Close dialog">×</button></div>
    <h2 id="dialog-title">{title}</h2>{children}
  </dialog>;
}
