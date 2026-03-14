import { useState, useRef, useEffect } from "react"

const SB = "https://axdsyckjfyizmayeeqbk.supabase.co"
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZHN5Y2tqZnlpem1heWVlcWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDgzMzksImV4cCI6MjA4ODkyNDMzOX0.zZiICAMVSq9DJj-MRsYYN4EDY5Sh0eyxBUg9Ei1BiIw"
const P="#C9A084",A="#8B7355",T="#2C2420",M="#9E8E85",BD="#E8E0D8",W="#FFFFFF",BG="#FAF7F4"
const ft="'Raleway',sans-serif"
function bdr(c:string){return "1px solid "+c}

export default function ContactForm(){
  const[nom,sN]=useState("")
  const[email,sE]=useState("")
  const[msg,sM]=useState("")
  const[st,sS]=useState("idle")
  const[er,sR]=useState<any>({})
  const[fc,sF]=useState("")
  const[hv,sH]=useState(false)
  const ref=useRef(false)

  useEffect(()=>{
    if(ref.current)return;ref.current=true
    var s=document.createElement("style")
    s.textContent="@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&family=Raleway:wght@400;500;600&display=swap');@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}"
    document.head.appendChild(s)
  },[])

  var inp=(n:string,e:boolean):any=>{
    var bc=fc===n?P:e?"#C47B7B":BD
    var o:any={width:"100%",padding:"14px 16px",fontSize:15,fontFamily:ft,color:T,backgroundColor:BG,border:bdr(bc),borderRadius:12,outline:"none",transition:"border-color .2s,box-shadow .2s",boxSizing:"border-box"}
    if(fc===n)o.boxShadow="0 0 0 3px rgba(201,160,132,.15)"
    return o
  }

  async function go(e:any){
    e.preventDefault()
    var ne:any={}
    if(!nom.trim())ne.nom=1
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))ne.email=1
    sR(ne);if(Object.keys(ne).length)return
    sS("sending")
    try{
      var r=await fetch(SB+"/rest/v1/leads",{method:"POST",headers:{apikey:SK,Authorization:"Bearer "+SK,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({nom:nom.trim(),email:email.trim(),message:msg.trim()||null})})
      if(r.ok){sS("success");sN("");sE("");sM("");sR({})}else sS("error")
    }catch{sS("error")}
  }

  var lb:any={display:"block",fontSize:13,fontWeight:500,color:T,marginBottom:6,fontFamily:ft}
  var s=st==="sending"

  return(
    <div style={{width:"100%",maxWidth:520,margin:"0 auto",padding:32,backgroundColor:W,borderRadius:16,boxShadow:"0 4px 24px rgba(44,36,32,.06)",border:bdr(BD),fontFamily:ft}}>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,color:T,textAlign:"center",marginBottom:8,lineHeight:1.2}}>Prête à te révéler ?</h2>
      <p style={{fontSize:15,color:M,textAlign:"center",marginBottom:28,lineHeight:1.6}}>Écris-moi pour un échange gratuit et sans engagement.</p>
      <form onSubmit={go} noValidate>
        <div style={{marginBottom:20}}>
          <label style={lb}>Ton prénom et nom</label>
          <input value={nom} onChange={e=>{sN(e.target.value);sR((p:any)=>({...p,nom:undefined}))}} onFocus={()=>sF("n")} onBlur={()=>sF("")} placeholder="Marie Dupont" style={inp("n",!!er.nom)}/>
          {er.nom&&<p style={{fontSize:12,color:"#C47B7B",marginTop:4}}>Indique ton nom.</p>}
        </div>
        <div style={{marginBottom:20}}>
          <label style={lb}>Ton adresse email</label>
          <input value={email} onChange={e=>{sE(e.target.value);sR((p:any)=>({...p,email:undefined}))}} onFocus={()=>sF("e")} onBlur={()=>sF("")} placeholder="marie@exemple.com" style={inp("e",!!er.email)}/>
          {er.email&&<p style={{fontSize:12,color:"#C47B7B",marginTop:4}}>Email invalide.</p>}
        </div>
        <div style={{marginBottom:20}}>
          <label style={lb}>Message <span style={{color:M,fontWeight:400}}>(optionnel)</span></label>
          <textarea value={msg} onChange={e=>sM(e.target.value)} onFocus={()=>sF("m")} onBlur={()=>sF("")} placeholder="Parle-moi de toi..." style={Object.assign({},inp("m",false),{minHeight:110,resize:"vertical"})}/>
        </div>
        <button type="submit" disabled={s} onMouseEnter={()=>sH(true)} onMouseLeave={()=>sH(false)} style={{width:"100%",padding:"16px",fontSize:14,fontWeight:500,fontFamily:ft,textTransform:"uppercase",color:W,backgroundColor:hv&&!s?A:P,border:"none",borderRadius:50,cursor:s?"not-allowed":"pointer",transition:"all .3s",opacity:s?.7:1,transform:hv&&!s?"translateY(-2px)":"none"}}>
          {s?"Envoi...":"Envoyer mon message"}
        </button>
        {st==="success"&&<div style={{padding:16,backgroundColor:"rgba(123,166,134,.12)",color:"#7BA686",border:"1px solid rgba(123,166,134,.25)",borderRadius:12,fontSize:14,textAlign:"center",marginTop:20,animation:"fi .4s ease-out"}}>Message envoyé, je te recontacte vite</div>}
        {st==="error"&&<div style={{padding:16,backgroundColor:"rgba(196,123,123,.12)",color:"#C47B7B",border:"1px solid rgba(196,123,123,.25)",borderRadius:12,fontSize:14,textAlign:"center",marginTop:20}}>Erreur, réessaie plus tard.</div>}
      </form>
    </div>
  )
}
