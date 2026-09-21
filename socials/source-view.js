(() => {
"use strict";

const STORAGE_KEY = "jamicat_source_view";
const MAX_LINES = 340;
const FLUSH_MS = 72;
const PULSE_MS = 155;
const SAMPLE_MS = 620;

const q = (s, r=document) => r.querySelector(s);
const qa = (s, r=document) => [...r.querySelectorAll(s)];
const clean = (v, n=160) => String(v ?? "").replace(/[\r\n\t]+/g," ").replace(/\s{2,}/g," ").slice(0,n);
const finite = v => Number.isFinite(Number(v));
const fixed = (v,d=2) => finite(v) ? Number(v).toFixed(d) : null;

class RuntimeStream {
  constructor() {
    this.enabled=false; this.paused=false; this.root=null; this.feed=null; this.toggle=null;
    this.queue=[]; this.seq=0; this.renderedThisSecond=0; this.dropped=0;
    this.frame={last:performance.now(),count:0,sum:0,min:Infinity,max:0,total:0};
    this.last={theme:null,visibility:null,online:null,focus:null,nodes:null,chatCount:null,socket:null,
      terminalRect:null,playerPlaying:null,playerVideo:null,volume:null,resourceCount:performance.getEntriesByType("resource").length};
    this.pointer={x:0,y:0,lastX:0,lastY:0,moved:false};
    this.mutations=new Map(); this.longTasks=[]; this.perfQueue=[];
    this.lastPulse=performance.now(); this.lastSample=performance.now(); this.lastRate=performance.now();
    this.performanceObservers=[];
    this.layoutShiftTotal=0;
    this.loopSamples=[];
    this.loopTimer=null;
    this.flushCosts=[];
    this.activityHeat=0; this.activityHeatTarget=0;
    this.channelDepth=new Map(); this.lastRenderedChannel=null;
    this.lastRenderedAt=0; this.realDepthRows=[];
    this.build(); this.bind(); this.instrument(); this.loop();
    if(localStorage.getItem(STORAGE_KEY)==="1") this.setEnabled(true,false);
  }

  build(){
    this.toggle=document.createElement("button");
    this.toggle.id="sourceViewToggle"; this.toggle.type="button"; this.toggle.setAttribute("aria-pressed","false");
    this.toggle.innerHTML='<span aria-hidden="true">&lt;/&gt;</span><span class="source-toggle-label">source</span>';

    this.root=document.createElement("section"); this.root.id="sourceView"; this.root.setAttribute("aria-hidden","true");
    this.root.innerHTML=`
      <div class="source-depth source-depth-a" aria-hidden="true"></div>
      <div class="source-depth source-depth-b" aria-hidden="true"></div>
      <header class="source-stream-head"><span><b>jami</b> — execution trace</span><span data-head>standby</span></header>
      <main class="source-feed-wrap"><div class="source-feed" role="log" aria-live="off"></div></main>
      <footer class="source-stream-foot">
        <span data-rate>0 rows/s</span><span data-queue>queue 0</span>
        <form class="source-command" data-command autocomplete="off">
          <label aria-label="Code View command"><span>&gt;</span><input data-command-input spellcheck="false" autocomplete="off" placeholder="help" /></label>
        </form>
        <span class="source-foot-note">secrets omitted</span>
        <button type="button" data-pause>pause</button><button type="button" data-exit>GUI</button>
      </footer>`;
    document.body.append(this.root,this.toggle); this.feed=q(".source-feed",this.root);
    this.emit("runtime","trace.attach",{readyState:document.readyState,timeOrigin:Math.round(performance.timeOrigin),navigation:performance.getEntriesByType("navigation").length},"system");
  }

  traceTone(channel,name,data={}){
    const tag=`${channel||""}.${name||""}`.toLowerCase();

    // Green = successful/healthy/completed/connected state.
    if(/open|ready|complete|canplay|play$|online|resume|connected|success|seeked|pageshow/.test(tag))
      return "green";

    // Blue = browser/runtime/network/media/player measurements and timing.
    if(/network|resource|navigation|eventloop|layout|memory|viewport|media|player|performance|collector|document|font/.test(tag))
      return "blue";

    // Pink = site/chat/theme/input/commands and the default execution language.
    return "pink";
  }

  traceProfile(channel,name,weight){
    const tag=`${channel}.${name}`;
    const important=/error|close|offline|stalled|waiting|ended|layout.shift|watchparty|theme.apply|playback.state|seek|connection.change|longtask/i.test(tag);
    const burst=important||/socket.receive|resource.complete|interaction|pointerdown|click|command/i.test(tag);
    return {important,burst,eventish:weight==="event"||weight==="activity"};
  }
  traceDepth(channel,weight){
    const key=String(channel||"runtime");
    let d=this.channelDepth.get(key);
    if(d==null){d=[...key].reduce((n,c)=>n+c.charCodeAt(0),0)%4;this.channelDepth.set(key,d);}
    return weight==="event"?Math.min(5,d+1):weight==="activity"?d:Math.max(0,d-1);
  }
  choreographyTick(){
    this.activityHeat+=(this.activityHeatTarget-this.activityHeat)*.14;
    this.activityHeatTarget*=.94;
    this.root.style.setProperty("--sv-heat",this.activityHeat.toFixed(3));
    this.root.dataset.activity=this.activityHeat>.68?"burst":this.activityHeat>.28?"active":"quiet";
  }
  recycleDepth(el){
    const text=(el?.textContent||"").trim(); if(!text)return;
    this.realDepthRows.push(text); if(this.realDepthRows.length>110)this.realDepthRows.shift();
    const a=q(".source-depth-a",this.root),b=q(".source-depth-b",this.root);
    if(a)a.textContent=this.realDepthRows.slice(-48).join("\n");
    if(b)b.textContent=this.realDepthRows.slice(-78,-24).join("\n");
  }

  setupRuntimeObservers(){
    const supported=[];
    const observe=(type, handler)=>{
      try{
        if(!("PerformanceObserver" in window))return;
        const supportedTypes=PerformanceObserver.supportedEntryTypes||[];
        if(!supportedTypes.includes(type))return;
        const po=new PerformanceObserver(list=>{
          for(const entry of list.getEntries())handler(entry);
        });
        po.observe({type,buffered:true});
        this.performanceObservers.push(po);
        supported.push(type);
      }catch{}
    };

    observe("layout-shift",entry=>{
      if(entry.hadRecentInput)return;
      this.emit("layout","shift",{
        value:Number(entry.value.toFixed(5)),
        cumulative:Number((this.layoutShiftTotal+=entry.value).toFixed(5)),
        sources:Array.isArray(entry.sources)?entry.sources.length:0
      },"activity");
    });

    observe("event",entry=>{
      if(!entry.duration || entry.duration<16)return;
      this.emit("eventloop","interaction",{
        name:clean(entry.name||"event",36),
        durationMs:Number(entry.duration.toFixed(2)),
        processingMs:Number(Math.max(0,(entry.processingEnd||0)-(entry.processingStart||0)).toFixed(2))
      },"activity");
    });

    observe("first-input",entry=>{
      this.emit("input","first",{
        name:clean(entry.name||"input",36),
        delayMs:Number(Math.max(0,(entry.processingStart||0)-entry.startTime).toFixed(2)),
        durationMs:Number((entry.duration||0).toFixed(2))
      },"event");
    });

    observe("navigation",entry=>{
      this.emit("navigation","timing",{
        domInteractiveMs:Number((entry.domInteractive||0).toFixed(1)),
        domContentLoadedMs:Number((entry.domContentLoadedEventEnd||0).toFixed(1)),
        loadMs:Number((entry.loadEventEnd||0).toFixed(1)),
        transferSize:Number(entry.transferSize||0),
        decodedBodySize:Number(entry.decodedBodySize||0)
      },"event");
    });

    this.emit("runtime","observer.support",{types:supported.join(",")||"none"},"activity");
  }

  startLoopDrift(){
    let expected=performance.now()+1000;
    this.loopTimer=setInterval(()=>{
      const now=performance.now();
      const drift=Math.max(0,now-expected);
      expected=now+1000;
      this.loopSamples.push(drift);
      if(this.loopSamples.length>12)this.loopSamples.shift();
      const avg=this.loopSamples.reduce((a,b)=>a+b,0)/this.loopSamples.length;
      const max=Math.max(...this.loopSamples);
      this.changed("eventloop","drift.bucket",Math.round(avg),{
        avgMs:Number(avg.toFixed(2)),
        maxMs:Number(max.toFixed(2)),
        samples:this.loopSamples.length
      });
    },1000);
  }

  sampleRuntimeDepth(){
    const mem=performance.memory;
    if(mem && Number.isFinite(mem.usedJSHeapSize)){
      this.changed("memory","js.heap",Math.round(mem.usedJSHeapSize/1048576),{
        usedMB:Number((mem.usedJSHeapSize/1048576).toFixed(2)),
        totalMB:Number((mem.totalJSHeapSize/1048576).toFixed(2)),
        limitMB:Number((mem.jsHeapSizeLimit/1048576).toFixed(2))
      });
    }

    const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    if(connection){
      this.changed("network","connection",[
        connection.effectiveType,connection.downlink,connection.rtt,connection.saveData
      ].join("|"),{
        effectiveType:connection.effectiveType||null,
        downlinkMbps:Number.isFinite(connection.downlink)?connection.downlink:null,
        rttMs:Number.isFinite(connection.rtt)?connection.rtt:null,
        saveData:connection.saveData===true
      });
    }

    const media=q("audio, video");
    if(media){
      let bufferedEnd=null,bufferedAhead=null;
      try{
        if(media.buffered?.length){
          bufferedEnd=Number(media.buffered.end(media.buffered.length-1).toFixed(3));
          bufferedAhead=Number(Math.max(0,bufferedEnd-media.currentTime).toFixed(3));
        }
      }catch{}
      this.changed("media","buffer",[
        bufferedEnd,bufferedAhead,media.readyState,media.networkState
      ].join("|"),{
        bufferedEnd,
        bufferedAhead,
        readyState:Number(media.readyState),
        networkState:Number(media.networkState)
      });
    }

    const vv=window.visualViewport;
    if(vv){
      this.changed("viewport","visual",[
        Math.round(vv.width),Math.round(vv.height),vv.scale.toFixed(3),
        Math.round(vv.offsetLeft),Math.round(vv.offsetTop)
      ].join("|"),{
        width:Number(vv.width.toFixed(1)),
        height:Number(vv.height.toFixed(1)),
        scale:Number(vv.scale.toFixed(3)),
        offsetX:Number(vv.offsetLeft.toFixed(1)),
        offsetY:Number(vv.offsetTop.toFixed(1))
      });
    }

    if(document.fonts){
      this.changed("document","fonts",document.fonts.status,{status:document.fonts.status});
    }
  }

  bind(){
    this.toggle.addEventListener("click",()=>this.setEnabled(!this.enabled));
    q("[data-exit]",this.root).addEventListener("click",()=>this.setEnabled(false));
    q("[data-pause]",this.root).addEventListener("click",e=>{
      this.paused=!this.paused; e.currentTarget.textContent=this.paused?"resume":"pause";
      q("[data-head]",this.root).textContent=this.paused?"render paused":"streaming";
    });

    const commandForm=q("[data-command]",this.root);
    const commandInput=q("[data-command-input]",this.root);
    commandForm?.addEventListener("submit",e=>{
      e.preventDefault();
      const raw=commandInput?.value||"";
      if(commandInput)commandInput.value="";
      this.command(raw);
    });
    commandInput?.addEventListener("keydown",e=>{
      if(e.key==="Escape"){e.preventDefault();this.setEnabled(false);}
    });
    window.addEventListener("keydown",e=>{
      if(!this.enabled)return;
      if(e.key==="/" && !e.ctrlKey && !e.metaKey && !e.altKey && e.target!==commandInput){
        e.preventDefault();commandInput?.focus();
      }
      if(e.key==="Escape" && e.target!==commandInput)this.setEnabled(false);
    },true);

    window.addEventListener("jamicat-runtime", event => {
      const packet = event.detail || {};
      const channel = clean(packet.channel || "site", 28);
      const name = clean(packet.name || "event", 56);
      const detail = packet.detail && typeof packet.detail === "object" ? packet.detail : {};
      this.emit(channel, name, detail, "event");
    });

    window.addEventListener("site-player-state",e=>{
      const d=e.detail||{};
      this.emit("player","state.change",{playing:d.playing===true,mode:clean(d.mode||"normal",24),videoId:d.videoId?clean(d.videoId,32):null},"event");
    });
    window.addEventListener("site-theme-change",e=>this.emit("theme","change",{theme:clean(e.detail?.themeName||this.theme(),32)},"event"));
    window.addEventListener("online",()=>this.emit("network","online",{value:true},"event"));
    window.addEventListener("offline",()=>this.emit("network","online",{value:false},"event"));
    document.addEventListener("visibilitychange",()=>this.emit("document","visibility",{state:document.visibilityState},"event"));
    window.addEventListener("focus",()=>this.emit("window","focus",{focused:true},"activity"));
    window.addEventListener("blur",()=>this.emit("window","focus",{focused:false},"activity"));

    window.addEventListener("pointermove",e=>{
      this.pointer.lastX=this.pointer.x; this.pointer.lastY=this.pointer.y;
      this.pointer.x=Math.round(e.clientX); this.pointer.y=Math.round(e.clientY); this.pointer.moved=true;
    },{passive:true});
    window.addEventListener("pointerdown",e=>this.emit("input","pointerdown",{x:Math.round(e.clientX),y:Math.round(e.clientY),button:e.button,target:this.targetName(e.target)},"activity"),{passive:true});
    window.addEventListener("click",e=>this.emit("input","click",{target:this.targetName(e.target)},"event"),true);
    window.addEventListener("keydown",e=>this.emit("input","keydown",{key:this.safeKey(e),repeat:e.repeat,target:this.targetName(e.target)},"activity"),true);
    window.addEventListener("resize",()=>this.emit("viewport","resize",{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},"event"));
  }

  instrument(){
    const mo=new MutationObserver(records=>{
      for(const r of records){
        if(this.root.contains(r.target)||r.target===this.root||r.target===this.toggle) continue;
        const target=this.targetName(r.target);
        const key=`${r.type}|${target}|${r.attributeName||""}`;
        let m=this.mutations.get(key);
        if(!m) m={type:r.type,target,attribute:r.attributeName||null,count:0,added:0,removed:0};
        m.count++;
        if(r.type==="childList"){m.added+=r.addedNodes.length;m.removed+=r.removedNodes.length;}
        this.mutations.set(key,m);
      }
    });
    mo.observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});

    if("PerformanceObserver" in window){
      const observe=(type,fn)=>{
        try{const po=new PerformanceObserver(list=>list.getEntries().forEach(fn));po.observe({type,buffered:false});}catch{}
      };
      observe("resource",e=>this.perfQueue.push({kind:"resource",name:this.resourceName(e.name),initiator:e.initiatorType||"other",duration:fixed(e.duration,1),transfer:finite(e.transferSize)?e.transferSize:null}));
      observe("longtask",e=>this.longTasks.push({duration:fixed(e.duration,1),start:fixed(e.startTime,1)}));
      observe("paint",e=>this.perfQueue.push({kind:"paint",name:clean(e.name,30),start:fixed(e.startTime,1)}));
      observe("largest-contentful-paint",e=>this.perfQueue.push({kind:"lcp",start:fixed(e.startTime,1),size:finite(e.size)?Math.round(e.size):null}));
    }
  }

  loop(){
    const frame=now=>{
      const dt=now-this.frame.last; this.frame.last=now; this.frame.count++; this.frame.total++;
      this.choreographyTick();
      this.frame.sum+=dt; this.frame.min=Math.min(this.frame.min,dt); this.frame.max=Math.max(this.frame.max,dt);

      if(now-this.lastPulse>=PULSE_MS){this.pulse(now);this.lastPulse=now;}
      if(now-this.lastSample>=SAMPLE_MS){this.sample(now);this.lastSample=now;}
      if(now-this.lastRate>=1000){
        q("[data-rate]",this.root).textContent=`${this.renderedThisSecond} rows/s`;
        q("[data-queue]",this.root).textContent=`queue ${this.queue.length}${this.dropped?` · coalesced ${this.dropped}`:""}`;
        this.renderedThisSecond=0; this.dropped=0; this.lastRate=now;
      }
      if(this.enabled&&!this.paused) this.flush();
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  pulse(now){
    const f=this.frame;
    const avg=f.count?f.sum/f.count:0;
    this.emit("render","frame.batch",{frame:f.total,count:f.count,avgMs:fixed(avg,2),minMs:fixed(f.min,2),maxMs:fixed(f.max,2),fps:avg?fixed(1000/avg,1):null},"heartbeat");
    f.count=0;f.sum=0;f.min=Infinity;f.max=0;

    this.emit("clock","monotonic",{nowMs:fixed(now,2),wall:new Date().toISOString().slice(11,23)},"heartbeat");

    const player=this.player();
    if(player&&finite(player.currentTime)){
      const delta=this.lastPlayerTime==null?null:Number(player.currentTime)-this.lastPlayerTime;
      this.emit("media","advance",{time:fixed(player.currentTime,3),delta:delta==null?null:fixed(delta,3),duration:finite(player.duration)?fixed(player.duration,2):null,playing:player.playing},"heartbeat");
      this.lastPlayerTime=Number(player.currentTime);
    }

    if(this.pointer.moved){
      const dx=this.pointer.x-this.pointer.lastX,dy=this.pointer.y-this.pointer.lastY;
      this.emit("input","pointer.sample",{x:this.pointer.x,y:this.pointer.y,dx,dy,speedPx:fixed(Math.hypot(dx,dy),1)},"quiet");
      this.pointer.moved=false;
    }

    this.emit("collector","cycle",{queue:this.queue.length,mutations:this.mutations.size,performance:this.perfQueue.length,longTasks:this.longTasks.length},"heartbeat");
  }

  sample(){
    this.flushMutations();
    this.flushPerformance();

    const theme=this.theme(), nodes=document.getElementsByTagName("*").length, vis=document.visibilityState, online=navigator.onLine, focused=document.hasFocus();
    this.changed("document","nodes",nodes,{count:nodes});
    this.changed("theme","active",theme,{value:theme});
    this.changed("document","visibilityState",vis,{value:vis});
    this.changed("network","navigator.onLine",online,{value:online});
    this.changed("window","hasFocus",focused,{value:focused});

    const terminal=q("#terminal");
    if(terminal){
      const r=terminal.getBoundingClientRect(), sig=[r.left,r.top,r.width,r.height].map(Math.round).join(",");
      this.changed("layout","#terminal.rect",sig,{x:Math.round(r.left),y:Math.round(r.top),width:Math.round(r.width),height:Math.round(r.height)});
    }

    const socket=this.socket(), state=socket?["CONNECTING","OPEN","CLOSING","CLOSED"][socket.readyState]||socket.readyState:"unexposed";
    this.changed("chat","socket.state",state,{state,bufferedAmount:socket&&finite(socket.bufferedAmount)?socket.bufferedAmount:null});

    const chatCount=qa("#chatMessages .chatMessage, #chatMessages [data-message-id]").length;
    this.changed("chat","renderedMessages",chatCount,{count:chatCount});

    const chatWindow=q("#chatWindow");
    if(chatWindow){
      const chatVisible=getComputedStyle(chatWindow).display!=="none";
      this.changed("chat","window.visible",chatVisible,{value:chatVisible,minimized:window.chat?.isMinimized===true});
    }

    const p=this.player();
    if(p){
      this.changed("media","playing",p.playing,{value:p.playing});
      this.changed("media","videoId",p.videoId||null,{value:p.videoId||null});
    }

    const nav=performance.getEntriesByType("navigation")[0];
    if(nav&&this.seq%31===0){
      this.emit("performance","navigation.sample",{domInteractive:fixed(nav.domInteractive,1),loadEnd:fixed(nav.loadEventEnd,1),transfer:finite(nav.transferSize)?nav.transferSize:null},"quiet");
    }
  }

  flushMutations(){
    if(!this.mutations.size)return;
    const rows=[...this.mutations.values()].slice(0,8); const extra=Math.max(0,this.mutations.size-rows.length);
    for(const m of rows){
      const data={target:m.target,count:m.count};
      if(m.type==="childList"){data.added=m.added;data.removed=m.removed;}
      if(m.attribute)data.attribute=m.attribute;
      this.emit("dom",`mutation.${m.type}`,data,"activity");
    }
    if(extra)this.emit("dom","mutation.coalesced",{groups:extra},"quiet");
    this.mutations.clear();
  }

  flushPerformance(){
    while(this.longTasks.length){
      const e=this.longTasks.shift(); this.emit("performance","longtask",e,"event");
    }
    const rows=this.perfQueue.splice(0,5);
    for(const e of rows){
      if(e.kind==="resource")this.emit("network","resource.complete",{name:e.name,initiator:e.initiator,durationMs:e.duration,transferBytes:e.transfer},"activity");
      else this.emit("performance",e.kind,e,"activity");
    }
    if(this.perfQueue.length>20){this.dropped+=this.perfQueue.length-20;this.perfQueue.splice(0,this.perfQueue.length-20);}
  }

  changed(channel,name,value,data){
    const key=`${channel}:${name}`;
    if(this.last[key]===value)return;
    this.last[key]=value; this.emit(channel,name,data,"activity");
  }

  emit(channel,name,data={},weight="normal"){
    const safe={};
    for(const [k,v] of Object.entries(data||{})){
      if(/token|secret|auth|password|passwd|cookie|session|discord|credential|authorization|bearer|csrf|private|admin/i.test(k))continue;
      safe[k]=v;
    }
    const profile=this.traceProfile(channel,name,weight);
    if(profile.burst)this.activityHeatTarget=Math.min(1,this.activityHeatTarget+(profile.important?.42:.20));
    else if(profile.eventish)this.activityHeatTarget=Math.min(1,this.activityHeatTarget+.07);
    this.queue.push({
      id:++this.seq,t:performance.now(),channel,name,data:safe,weight,
      depth:this.traceDepth(channel,weight),important:profile.important,burst:profile.burst,
      tone:this.traceTone(channel,name,safe)
    });
    if(this.queue.length>180){const n=this.queue.length-180;this.queue.splice(0,n);this.dropped+=n;}
  }

  flush(){
    if(!this.queue.length)return;
    const pressure=this.queue.length;
    const take=pressure>70?6:pressure>25?4:this.activityHeat>.62?3:2;
    const batch=this.queue.splice(0,take),frag=document.createDocumentFragment(),rendered=[];
    batch.forEach(e=>{const el=this.row(e);rendered.push(el);frag.appendChild(el);});
    this.feed.appendChild(frag);rendered.forEach(el=>this.recycleDepth(el));this.renderedThisSecond+=batch.length;
    while(this.feed.children.length>MAX_LINES)this.feed.firstElementChild?.remove();
    const wrap=q(".source-feed-wrap",this.root);wrap.scrollTop=wrap.scrollHeight;

  }

  row(e){
    const el=document.createElement("div");el.className=`source-line source-${e.weight}`;el.dataset.seq=e.id;
    el.dataset.channel=clean(e.channel||"runtime",28);
    el.dataset.tone=e.tone||"pink";
    el.dataset.depth=String(e.depth||0);
    el.dataset.burst=e.burst?"1":"0"; el.dataset.important=e.important?"1":"0";
    el.style.setProperty("--trace-depth",String(e.depth||0));
    const gap=this.lastRenderedAt?e.t-this.lastRenderedAt:0; this.lastRenderedAt=e.t;
    if(this.lastRenderedChannel!==e.channel)el.dataset.channelStart="1";
    this.lastRenderedChannel=e.channel; if(gap>520)el.dataset.gap="1";
    const entries=Object.entries(e.data||{});
    const head=`<span class="sv-time">${e.t.toFixed(2).padStart(10," ")}</span><span class="sv-channel">${this.esc(e.channel)}</span><span class="sv-name">${this.esc(e.name)}</span>`;
    if(entries.length<=3){
      el.innerHTML=head+`<span class="sv-punc">(</span>`+entries.map(([k,v])=>`<span class="sv-prop">${this.esc(k)}</span><span class="sv-punc">: </span>${this.val(v)}`).join('<span class="sv-punc">, </span>')+`<span class="sv-punc">);</span>`;
    }else{
      el.innerHTML=head+`<span class="sv-punc">({</span>`;
      const d=document.createElement("div");d.className="source-line-detail";
      d.innerHTML=entries.map(([k,v])=>`<span><i>${this.esc(k)}</i><b>:</b> ${this.val(v)}<b>,</b></span>`).join("");
      el.appendChild(d);const close=document.createElement("span");close.className="sv-close";close.textContent="});";el.appendChild(close);
    }
    return el;
  }

  val(v){
    if(v===null||v===undefined)return '<span class="sv-null">null</span>';
    if(typeof v==="boolean")return `<span class="sv-bool">${v}</span>`;
    if(typeof v==="number")return `<span class="sv-num">${v}</span>`;
    if(Array.isArray(v))return `[${v.map(x=>this.val(x)).join('<span class="sv-punc">, </span>')}]`;
    return `<span class="sv-str">"${this.esc(v)}"</span>`;
  }
  command(raw){
    const text=clean(raw,120).trim();
    if(!text)return;
    const [name,...args]=text.toLowerCase().split(/\s+/);
    this.emit("command","input",{command:name,args:args.slice(0,3)},"event");

    const click=id=>{
      const el=q(id);
      if(!el){this.emit("command","unavailable",{target:id},"event");return false;}
      el.click();return true;
    };
    const call=fn=>{
      if(typeof window[fn]!=="function"){this.emit("command","unavailable",{target:fn},"event");return false;}
      window[fn]();return true;
    };

    switch(name){
      case "help":
        this.emit("command","help",{
          commands:"about art playlist guestbook play next rewind theme chat pause clear gui",
          shortcut:"/ focuses command · Esc returns to GUI"
        },"event");
        break;
      case "about": call("siteFAQ"); break;
      case "art": call("showArt"); break;
      case "playlist": call("showList"); break;
      case "guestbook": call("showGuestBook"); break;
      case "play": click("#videoToggle"); break;
      case "next": click("#nextTrack"); break;
      case "rewind": click("#rewind10"); break;
      case "theme": click("#changeTheme"); break;
      case "chat":
        if(window.chat && typeof window.chat.toggleMinimized==="function"){
          window.chat.toggleMinimized();
          this.emit("command","chat.toggle",{minimized:window.chat.isMinimized===true},"event");
        }else this.emit("command","unavailable",{target:"chat"},"event");
        break;
      case "pause":
        this.paused=!this.paused;
        q("[data-pause]",this.root).textContent=this.paused?"resume":"pause";
        q("[data-head]",this.root).textContent=this.paused?"render paused":"streaming";
        this.emit("command","render.pause",{paused:this.paused},"event");
        break;
      case "clear":
        this.feed.replaceChildren();
        this.emit("command","trace.clear",{},"event");
        break;
      case "gui":
      case "exit":
        this.setEnabled(false);
        break;
      default:
        this.emit("command","unknown",{command:name,hint:"type help"},"event");
    }
  }

  esc(v){return clean(v,180).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");}
  theme(){return document.documentElement.getAttribute("data-theme")||localStorage.getItem("theme")||"Default";}
  safeKey(e){if(e.key.length===1)return "[character]";return clean(e.key,24);}
  targetName(el){
    if(!el||el===document)return "document";
    if(el.id)return `#${clean(el.id,40)}`;
    const cls=typeof el.className==="string"?el.className.trim().split(/\s+/).slice(0,2).join("."):"";
    return `${String(el.tagName||"node").toLowerCase()}${cls?"."+clean(cls,48):""}`;
  }
  resourceName(url){try{const u=new URL(url,location.href);return clean(u.pathname.split("/").pop()||u.pathname,70);}catch{return clean(url,70);}}
  socket(){return [window.chat?.socket,window.chatWidget?.socket,window.chat?.ws,window.chatWidget?.ws].find(s=>s&&typeof s.readyState==="number")||null;}
  player(){
    try{
      if(window.watchPartyPlayer&&typeof window.watchPartyPlayer.getState==="function"){
        const s=window.watchPartyPlayer.getState()||{};
        return {currentTime:Number(s.currentTime),duration:Number(s.duration),playing:s.playing===true,videoId:s.videoId||null};
      }
    }catch{}
    const m=q("audio, video");if(!m)return null;
    let bufferedEnd=null;
    try {
      if(m.buffered && m.buffered.length) bufferedEnd=Number(m.buffered.end(m.buffered.length-1));
    } catch {}
    return {
      currentTime:Number(m.currentTime),
      duration:Number(m.duration),
      playing:!m.paused,
      videoId:null,
      bufferedEnd,
      readyState:Number(m.readyState)
    };
  }
  depth(){ /* Pass 7 depth planes are fed incrementally from genuine rendered rows. */ }
  setEnabled(on,persist=true){
    this.enabled=!!on;document.documentElement.classList.toggle("source-view-active",this.enabled);document.body.classList.toggle("source-view-active",this.enabled);
    this.root.setAttribute("aria-hidden",String(!this.enabled));this.toggle.setAttribute("aria-pressed",String(this.enabled));
    q("[data-head]",this.root).textContent=this.enabled?"streaming":"standby";
    if(persist)localStorage.setItem(STORAGE_KEY,this.enabled?"1":"0");
    if(this.enabled){
      this.emit("runtime","trace.enter",{wall:new Date().toISOString(),queue:this.queue.length},"event");
      this.emit("command","ready",{commands:11,focusShortcut:"/"},"activity");
    }
  }
}

const start=()=>{if(!window.sourceView)window.sourceView=new RuntimeStream();};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();
