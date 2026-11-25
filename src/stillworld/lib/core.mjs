export const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function angleDelta(from,to){return Math.atan2(Math.sin(to-from),Math.cos(to-from));}
export function dampAngle(from,to,speed,dt){return from+angleDelta(from,to)*(1-Math.exp(-speed*Math.min(dt,.05)));}
/** Constant-speed planted foot during stance; eased forward swing above the ground. */
export function gaitFoot(phase,weight=1){
  const u=((phase/(Math.PI*2))%1+1)%1;
  if(u<.5)return{z:(.18-.72*u)*weight,lift:0};
  const t=(u-.5)*2;const ease=t*t*(3-2*t);
  return{z:(-.18+.36*ease)*weight,lift:.064*Math.sin(Math.PI*t)*weight};
}
export function validateDraft(d){
  if(!d || typeof d.name!=='string' || typeof d.message!=='string') return 'Please add your name and message.';
  if(!d.name.trim() || d.name.trim().length>28) return 'Use a name between 1 and 28 characters.';
  if(!d.message.trim() || d.message.trim().length>180) return 'Keep your message between 1 and 180 characters.';
  if(!['walk','pause'].includes(d.activity)) return 'Choose an activity.';
  if(!['blue','silver','ink'].includes(d.finish)) return 'Choose a finish.';
  return null;
}
export function pagePeople(people,page,size){
  const pages=Math.max(1,Math.ceil(people.length/size));
  const index=((page%pages)+pages)%pages;
  return {people:people.slice(index*size,(index+1)*size),pages,index};
}
/** Sagittal two-bone IK. Knee always bends forward (+z); lengths stay invariant. */
export function solveLeg(hipY,ankleY,ankleZ,upper=.4365,lower=.4275){
  const dy=ankleY-hipY, dz=ankleZ;
  const raw=Math.hypot(dy,dz), d=clamp(raw,.025,upper+lower-.001);
  const uy=dy/(raw||1),uz=dz/(raw||1);
  const along=(upper*upper-lower*lower+d*d)/(2*d);
  const perpendicular=Math.sqrt(Math.max(0,upper*upper-along*along));
  return {kneeY:hipY+uy*along+uz*perpendicular,kneeZ:uz*along-uy*perpendicular,ankleY:hipY+uy*d,ankleZ:uz*d};
}
