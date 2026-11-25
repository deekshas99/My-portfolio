import { worldConfig } from '../config';
import { getApproved, submitMessage, isDemo } from './data';
import { validateDraft } from './core.mjs';
import type { Draft } from './types';

type Tool = { name:string;description:string;inputSchema:object;annotations:object;execute:(input:unknown)=>unknown|Promise<unknown> };
type Context = {registerTool:(tool:Tool,options:{signal:AbortSignal})=>void|Promise<void>};

/** Optional browser-native agent interface; uses the same actions as the visible form. */
export function registerWorldTools(){
  const context=(document as Document & {modelContext?:Context}).modelContext;
  if(!context?.registerTool)return;
  const lifecycle=new AbortController();
  const register=(tool:Tool)=>{try{void Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{/* Optional browser capability. */}};
  register({name:'read_world_people',description:'Read the host and approved visitor messages carried by flowers in this garden.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:true},async execute(){return{people:[worldConfig.owner,...await getApproved()],mode:isDemo?'local-demo':'shared'};}});
  register({name:'submit_world_message',description:'Submit a visitor flower and short message for owner approval. Does not publish or approve it. In local demo mode it is saved only in this browser.',inputSchema:{type:'object',properties:{name:{type:'string',minLength:1,maxLength:28},message:{type:'string',minLength:1,maxLength:180},activity:{type:'string',enum:['walk','pause'],description:'Legacy storage values: walk means gentle flower sway; pause means still.'},finish:{type:'string',enum:['blue','silver','ink']}},required:['name','message','activity','finish'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){const error=validateDraft(input);if(error)throw new Error(error);await submitMessage(input as Draft,'');return{status:'pending',mode:isDemo?'local-demo':'shared'};}});
  return()=>lifecycle.abort();
}
