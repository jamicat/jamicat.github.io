(() => {
  function init() {
    const c = window.chat;
    if (!c?.window || !c.messageInput) return;
    const w = c.window, input = c.messageInput, commands = new Map(), history = [];
    let active = false, cursor = 0, password = false, nextRef = 1, lastVolume = 50, queueSnapshot = [];
    const refs = new Map();
    const toggle = document.createElement('button');
    toggle.id = 'loungeConsoleToggle'; toggle.type = 'button'; toggle.textContent = 'console';
    document.body.append(toggle);
    const title = document.createElement('span'); title.id = 'loungeConsoleTitle';
    c.chatTitle.after(title);
    const controls = document.getElementById('chatControls');
    const promptRow = document.createElement('div'); promptRow.id = 'loungeConsoleInput';
    const prompt = document.createElement('span'); prompt.id = 'loungeConsolePrompt'; prompt.textContent = 'lounge:~$'; promptRow.append(prompt);
    const statusBar = document.createElement('div'); statusBar.id = 'loungeConsoleStatus';
    controls.before(statusBar, promptRow);
    const avatarHome = c.avatarPicker.parentElement; const avatarNext = c.avatarPicker.nextSibling;
    const localLines = [];
    let clearedAt = -Infinity, inputHome = null, inputNext = null, entered = false;
    let guiPosition = null, consolePosition = null;
    const positionKeys = ['left','top','right','bottom','transform'];
    const savePosition = () => ({styles:positionKeys.map(k=>[k,w.style.getPropertyValue(k),w.style.getPropertyPriority(k)]),x:w.dataset.x,y:w.dataset.y});
    const restorePosition = pos => {
      for(const [k,v,priority] of pos.styles) { if(v) w.style.setProperty(k,v,priority); else w.style.removeProperty(k); }
      for(const k of ['x','y']) { if(pos[k]===undefined) delete w.dataset[k]; else w.dataset[k]=pos[k]; }
    };
    const storageKeys=['chat_x','chat_y','chat_left','chat_top'];
    let guiStorage=null;
    const saveGuiStorage=()=>{try{guiStorage=storageKeys.map(k=>[k,localStorage.getItem(k)]);}catch{}};
    const restoreGuiStorage=()=>{try{for(const [k,v] of guiStorage||[]) {if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}}catch{}};
    const stamp = row => Number(row.dataset.timestamp) || 0;
    function attachInput() {
      if (!active || input.parentElement === promptRow) return;
      inputHome = input.parentElement; inputNext = input.nextSibling;
      promptRow.append(input);
    }
    function reconcile() {
      if (!active) return;
      annotate();
      for (const row of [...c.messages.children]) {
        if (row.classList.contains('lounge-console-local')) continue;
        const hidden = stamp(row) <= clearedAt && (stamp(row) > 0 || row.dataset.consoleCleared === 'true');
        row.classList.toggle('lounge-console-cleared', hidden);
      }
      for (const line of localLines) {
        if (line.parentElement === c.messages) continue;
        const next = [...c.messages.children].find(row => !row.classList.contains('lounge-console-local') && stamp(row) > stamp(line));
        c.messages.insertBefore(line, next || null);
      }
    }
    function clearLocal() {
      clearedAt = Date.now();
      for (const row of [...c.messages.children]) if (!row.classList.contains('lounge-console-local')) { row.dataset.consoleCleared = 'true'; row.classList.add('lounge-console-cleared'); }
      for (const line of localLines.splice(0)) line.remove();
      c.messages.scrollTop = c.messages.scrollHeight;
    }
    const oldPlaceholder = input.placeholder;
    const oldEmojiPosition = c.positionMessageEmojiPicker.bind(c);
    c.positionMessageEmojiPicker = () => {
      if (!active) return oldEmojiPosition();
      const picker = c.emojiPickerContainer;
      if (!picker) return;
      const r = promptRow.getBoundingClientRect(), p = picker.getBoundingClientRect();
      Object.assign(picker.style,{position:'fixed',left:`${Math.max(8,Math.min(r.left,innerWidth-p.width-8))}px`,top:`${Math.max(8,r.top-p.height-8)}px`,right:'auto',bottom:'auto',zIndex:'100004'});
    };
    const log = value => { const line = document.createElement('div'); line.className = 'lounge-console-local'; line.dataset.timestamp = String(Date.now()); line.textContent = String(value); localLines.push(line); c.messages.append(line); if(localLines.length > 300) localLines.shift().remove(); c.messages.scrollTop = c.messages.scrollHeight; };
    const fail = message => { throw new Error(message); };
    const admin = () => { if (!c.isAdmin || !c.adminKey) fail('admin authentication required'); };
    const party = () => { if (!c.watchParty.enabled) fail('watch party is disabled'); };
    const point = () => { const r = input.getBoundingClientRect(); return [r.left, r.top]; };
    const rows = () => [...c.messages.querySelectorAll('.chatMessage[data-reaction-target-id]')];
    function annotate() {
      if (!active) return;
      for (const row of rows()) {
        const key = `${row.dataset.reactionTargetType}:${row.dataset.reactionTargetId}`;
        if (!refs.has(key)) refs.set(key,nextRef++);
        const m = c.getReplyMessageForRow(row);
        const t = new Date(Number(row.dataset.timestamp)||Date.now()).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
        row.dataset.consoleRef = String(refs.get(key));
        row.dataset.consoleLabel = `#${refs.get(key)} [${t}] ${m?.name || 'anonymous'}:`;
      }
    }
    function rowFor(n) { annotate(); const row = rows().find(r=>r.dataset.consoleRef===String(Number(n))); if(!row) fail('message not found; use /messages'); return row; }
    function status() {
      const p = c.watchParty, q = p.queue || [], track = q.find(x=>x.videoId===p.currentVideoId);
      const playing = window.watchPartyPlayer?.getState()?.playing;
      const label = p.enabled ? `party on · ${track ? `${playing?'playing':'paused'}: ${track.title || track.videoId}`:'nothing playing'} · ${q.length} queued` : 'party off';
      const heading = p.enabled ? `cat chat · ${label}` : 'cat chat';
      if(title.textContent!==heading) title.textContent=heading;
      title.title=heading;
      const volume = document.getElementById('volumeSlider')?.value ?? '–';
      const state = window.watchPartyPlayer?.getState();
      const bar = `${label} | vol: ${volume}%${p.enabled && track ? ` | ${Math.floor(state?.currentTime || 0)}/${Math.floor(state?.duration || 0)}s` : ''}`;
      if(statusBar.textContent!==bar) statusBar.textContent=bar;
      prompt.textContent = `${c.nameInput.value || 'guest'}@lounge:~$`;
      if(active) attachInput();
      toggle.textContent=active?'chat':'console';
      const hide = document.body.classList.contains('video-backdrop-active');
      toggle.hidden=hide;
    }
    function setMode(on) {
      if (on === active && entered) return;
      if(on){guiPosition=savePosition();saveGuiStorage();}
      else if(active){consolePosition=savePosition();}
      active=on; entered=true; w.classList.toggle('lounge-console-mode',on); document.body.classList.toggle('lounge-console-active',on);
      if (!on && password) { password=false; input.type='text'; input.value=''; }
      input.placeholder=on?'type /help to start':oldPlaceholder;
      try { localStorage.setItem('lounge_console_mode',String(on)); } catch {}
      if(on) {
        if(c.isMinimized) document.getElementById('chatMinimize')?.click();
        if(consolePosition) restorePosition(consolePosition);
        else {
          for(const k of positionKeys) w.style.removeProperty(k);
          w.style.left=`${Math.max(8,(innerWidth-w.offsetWidth)/2)}px`;
          w.style.top=`${Math.max(8,(innerHeight-w.offsetHeight)/2)}px`;
          w.style.right='auto';w.style.bottom='auto';w.dataset.x='0';w.dataset.y='0';
        }
        c.keepTitleBarInViewport();
        attachInput(); promptRow.append(c.avatarPicker);
        c.closeAvatarPicker(); c.closeEmojiPicker();
        if(c.watchPartyOpen) c.toggleWatchParty();
        reconcile(); if(!localLines.length) log('connected · type /help to start');
        c.messages.scrollTop=c.messages.scrollHeight; input.focus();
      } else {
        c.closeAvatarPicker(); c.closeEmojiPicker();
        if(inputHome && input.parentElement===promptRow) inputHome.insertBefore(input, inputNext?.parentElement===inputHome ? inputNext : null);
        if(c.avatarPicker.parentElement===promptRow) avatarHome.insertBefore(c.avatarPicker, avatarNext?.parentElement===avatarHome ? avatarNext : null);
        if(guiPosition){restorePosition(guiPosition);restoreGuiStorage();guiPosition=null;}
        w.classList.remove('hidden');
        w.style.removeProperty('display');
        c.keepTitleBarInViewport();
        for(const line of localLines) line.remove();
        for(const row of c.messages.children) row.classList.remove('lounge-console-cleared');
      }
      status();
    }
    toggle.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setMode(!active);});
    window.addEventListener('pagehide',()=>{if(active)restoreGuiStorage();});
    const add=(name,usage,fn,restricted=false,publicUsage=usage)=>commands.set(name,{usage,fn,restricted,publicUsage});
    const canAdmin=()=>Boolean(c.isAdmin && c.adminKey);
    const visibleCommands=()=>[...commands].filter(([,v])=>!v.restricted||canAdmin());
    const usageFor=v=>canAdmin()?v.usage:v.publicUsage;
    const click=(selector,root=document)=>{ const el=root.querySelector(selector); if(!el || el.disabled) fail('control unavailable'); el.click(); };
    const panelClick=selector=>{ party(); const was=c.watchPartyOpen; if(!was){c.watchPartyOpen=true;c.renderWatchParty();} try{click(selector,c.watchPartyPanel);} finally {if(!was){c.watchPartyOpen=false;c.renderWatchParty();}} };
    const menuActions=(row,action)=>{
      const m=c.getReplyMessageForRow(row); if(!m) fail('message unavailable');
      c.openModerationMenu(...point(),m);
      const buttons=[...c.moderationMenu.querySelectorAll('button.jami-chat-context-item')];
      if(!action){log(buttons.map((b,i)=>`${i+1}. ${b.textContent.trim()}`).join('\n')); c.closeModerationMenu(); return;}
      const b=buttons.find(b=>b.textContent.trim().toLowerCase()===action.toLowerCase()) || buttons[Number(action)-1];
      if(!b){c.closeModerationMenu();fail('action unavailable; use /actions <message>');} b.click();
    };
    add('help','/help [command]',arg=>{const visible=visibleCommands(); const match=visible.find(([k])=>k===arg.replace(/^\//,'')); log(arg?(match?usageFor(match[1]):'unknown command'):visible.map(([,v])=>usageFor(v)).join('\n'));});
    add('gui','/gui',()=>setMode(false));
    add('login','/login',()=>{if(canAdmin())return log('already authenticated'); password=true; input.value=''; input.type='password'; input.placeholder='admin password'; log('enter admin password'); input.focus();});
    add('logout','/logout',()=>{c.logoutAdmin();log('logged out');},true);
    add('nick','/nick <name>',arg=>{if(!arg)fail('enter a name');if(c.discordUser)fail('name is managed by discord');c.nameInput.value=arg;c.nameInput.dispatchEvent(new Event('input',{bubbles:true}));log('name updated');});
    add('avatar','/avatar [upload]',arg=>{c.openAvatarPicker();if(arg==='upload')click('.jami-lounge-avatar-upload',c.avatarPicker);});
    add('image','/image',()=>c.imageUploadInput.click());
    add('emoji','/emoji',()=>c.toggleEmojiPicker());
    add('record','/record',()=>c.openEmojiAnimationPicker(...point()),true);
    add('emojis','/emojis (manage custom emojis)',()=>c.openLoungeEmojis(),true);
    add('members','/members',()=>log((c.lastRenderedMembers||[]).map(m=>m.name||'anonymous').join('\n')||'nobody online'));
    add('motd','/motd',()=>log(c.currentMotd||'no message of the day'));
    add('setmotd','/setmotd',()=>c.editMotd(),true);
    add('tree','/tree [on|off]',arg=>{admin();if(arg&&!['on','off'].includes(arg))fail('use on or off');return c.setChatTreeActive(arg?arg==='on':!c.chatTreeState?.active);},true);
    add('emojiparty','/emojiparty [on|off]',arg=>{if(arg){if(!canAdmin())fail('unknown command; type /help');if(!['on','off'].includes(arg))fail('use on or off');return c.setEmojiPartyGlobalEnabled(arg==='on');}c.openEmojiPartyMenu();},false,'/emojiparty');
    add('confetti','/confetti',()=>c.postConfettiMessage());
    add('remixes','/remixes',()=>c.openSavedRemixManager());
    add('messages','/messages',()=>{annotate();log(rows().map(r=>r.dataset.consoleLabel).join('\n')||'no messages');});
    add('react','/react <message>',arg=>{const r=rowFor(arg);c.openReactionPicker(c.getReactionTarget(r),r);});
    add('reply','/reply <message|cancel>',arg=>{if(arg==='cancel'){c.clearReplyTarget();return log('reply cancelled');}const row=rowFor(arg);c.setReplyTarget(c.getReplyMessageForRow(row));log(`replying to #${row.dataset.consoleRef}`);});
    add('actions','/actions <message> [action number or name]',arg=>{const [n,...rest]=arg.split(/\s+/);menuActions(rowFor(n),rest.join(' '));});
    for(const [name,label] of [['edit','edit'],['delete','delete message'],['disintegrate','disintegrate message'],['combine','combine emoji record'],['history','name history'],['purge',"delete user's messages"]]) add(name,`/${name} <message>`,arg=>menuActions(rowFor(arg),label),['history','purge'].includes(name));
    add('ban','/ban <message>',arg=>{const m=c.getReplyMessageForRow(rowFor(arg));return c.banClient(m.client_id,m.name);},true);
    add('bans','/bans (manage bans)',()=>c.openBanManager(),true);
    add('clearchat','/clearchat',()=>c.clearEntireChat(),true);
    add('clear','/clear (local terminal buffer)',clearLocal);
    add('party','/party [on|off|panel]',arg=>{if(arg==='panel'){party();c.toggleWatchParty();return;}if(arg){if(!canAdmin())fail('unknown command; type /help');if(!['on','off'].includes(arg))fail('use on, off or panel');return c.setWatchPartyEnabled(arg==='on');}log(statusBar.textContent);},false,'/party [panel]');
    add('queue','/queue [clear]',arg=>{party();if(arg==='clear'){if(!canAdmin())fail('unknown command; type /help');return c.clearWatchPartyQueue();}queueSnapshot=(c.watchParty.queue||[]).map(x=>({...x}));log(queueSnapshot.map((x,i)=>`${i+1}. ${x.title||x.videoId}${x.videoId===c.watchParty.currentVideoId?' [current]':''}`).join('\n')||'queue empty');},false,'/queue');
    const queueItem=n=>{const x=queueSnapshot[Number(n)-1];if(!x||!c.watchParty.queue.some(q=>q.id===x.id))fail('queue changed or item not found; use /queue');return x;};
    for(const name of ['add','playlist']) add(name,`/${name} <youtube url>`,async arg=>{party();if(!arg)fail('enter a youtube url');c.watchPartyAddUrl=arg;c.watchPartyAddPlaylist=name==='playlist';await c.addWatchPartyVideo();log(c.watchPartyAddMessage||'request finished');});
    add('remove','/remove <queue number>',arg=>{party();const x=queueItem(arg);if(!c.isAdmin&&x.requestedByClientId!==c.clientId)fail('you can only remove your own tracks');return c.removeWatchPartyItem(Number(x.id),document.createElement('button'));});
    add('jump','/jump <queue number>',arg=>{const x=queueItem(arg);panelClick(`[data-watch-party-play="${Number(x.id)}"]`);});
    for(const [name,selector] of [['skip','next'],['previous','previous'],['subtitles','subtitles'],['visualizer','visualizer-menu-toggle']]) add(name,`/${name}`,()=>panelClick(`[data-watch-party-${selector}]`));
    for(const name of ['play','pause']) add(name,`/${name}`,()=>{party();if(!c.watchParty.currentVideoId)fail('nothing playing');if(Boolean(window.watchPartyPlayer?.getState()?.playing)===(name==='play'))return log(`already ${name==='play'?'playing':'paused'}`);panelClick('button[data-watch-party-play=""]')});
    add('seek','/seek <seconds or m:ss>',async arg=>{party();if(!c.watchParty.currentVideoId)fail('nothing playing');if(!/^\d+(?::[0-5]\d){0,2}$/.test(arg))fail('enter seconds or m:ss');const time=arg.split(':').reduce((n,x)=>n*60+Number(x),0);const duration=window.watchPartyPlayer?.getState()?.duration;if(duration&&time>duration)fail('timestamp exceeds duration');const response=await fetch(`${c.API}/api/watchparty/seek`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({clientId:c.clientId,currentTime:time})});if(!response.ok)fail('seek failed');window.watchPartyPlayer?.seekTo(time);log(`seek: ${time} seconds`);});
    add('nowplaying','/nowplaying',()=>{const s=window.watchPartyPlayer?.getState();log(`${title.textContent} · ${Math.floor(s?.currentTime||0)} / ${Math.floor(s?.duration||0)} seconds`);});
    add('volume','/volume [0–100|mute|unmute]',arg=>{const slider=document.getElementById('volumeSlider');if(!slider)fail('volume unavailable');if(!arg)return log(`volume: ${slider.value}%`);let n=Number(arg);if(arg==='mute'){if(Number(slider.value)>0)lastVolume=Number(slider.value);n=0;}if(arg==='unmute')n=lastVolume;if(!Number.isFinite(n)||n<0||n>100)fail('volume must be 0–100');slider.value=String(Math.round(n));slider.dispatchEvent(new Event('input',{bubbles:true}));const other=c.watchPartyPanel.querySelector('[data-lounge-party-volume]');if(other)other.value=slider.value;log(`volume: ${slider.value}%`);});
    add('video','/video <fit|cinematic>',arg=>{if(!['fit','cinematic'].includes(arg))fail('use fit or cinematic');c.setWatchPartyVideoMode(arg);});
    add('background','/background <stars|ocean|none>',arg=>{if(!['stars','ocean','none'].includes(arg))fail('use stars, ocean or none');click(`#loungeBackgroundPicker [data-background="${arg}"]`);});
    add('partycolour','/partycolour [colour]',arg=>{if(!arg)return log(c.WATCH_PARTY_COLOURS.join(' · '));if(!c.WATCH_PARTY_COLOURS.includes(arg))fail('unknown colour');c.setWatchPartyTheme(arg);log(`party colour: ${arg}`);});
    add('discord','/discord [login|logout]',arg=>{if(arg==='login')c.avatarPicker.querySelector('#chatDiscordAuthButton').click();else if(arg==='logout')document.getElementById('chatDiscordLogout')?.click();else log(c.discordUser?'discord connected':'discord not connected');});
    add('admin','/admin (party management)',()=>c.openPartyManager(),true);
    async function submit(){const raw=input.value;if(password){password=false;input.type='text';input.value='';input.placeholder='type /help to start';try{if(await c.verifyAdminKey(raw.trim())){c.enableAdminMode(raw.trim());log('admin authenticated');}else log('incorrect admin key');}catch{log('authentication failed');}return;}if(!raw.startsWith('/')){if(raw.trim())await c.sendMessage();return;}input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));const [word,...rest]=raw.trim().slice(1).split(/\s+/);const cmd=commands.get(word.toLowerCase());if(word.toLowerCase()!=='login'){history.push(raw);cursor=history.length;log(`${prompt.textContent} ${raw}`);}else if(rest.length){log('use /login without a password argument');return;}else log(`${prompt.textContent} /login`);try{if(!cmd||cmd.restricted&&!canAdmin())fail('unknown command; type /help');await cmd.fn(rest.join(' '));}catch(e){log(e.message||'command failed');}status();}
    input.addEventListener('keydown',e=>{if(!active||e.isComposing)return;if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();e.stopImmediatePropagation();submit();}else if(!password&&e.ctrlKey&&e.key.toLowerCase()==='l'){e.preventDefault();clearLocal();}else if(!password&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();cursor=Math.max(0,Math.min(history.length,cursor+(e.key==='ArrowUp'?-1:1)));input.value=history[cursor]||'';}else if(!password&&e.key==='Tab'&&/^\/\w*$/.test(input.value)){const matches=visibleCommands().filter(([k])=>k.startsWith(input.value.slice(1)));if(matches.length){e.preventDefault();if(matches.length===1)input.value=`/${matches[0][0]} `;else log(matches.map(([k])=>`/${k}`).join('  '));}}else if(e.key==='Escape'&&password){password=false;input.type='text';input.value='';input.placeholder='type /help to start';}},true);
    c.sendButton.addEventListener('click',e=>{if(active&&(password||input.value.startsWith('/'))){e.preventDefault();e.stopImmediatePropagation();submit();}},true);
    input.addEventListener('input',e=>{if(active&&(password||input.value.startsWith('/')))e.stopImmediatePropagation();},true);
    new MutationObserver(reconcile).observe(c.messages,{childList:true,subtree:true});
    new MutationObserver(attachInput).observe(controls,{childList:true,subtree:true});
    window.addEventListener('site-video-backdrop-state',status);setInterval(status,500);
    try {setMode(localStorage.getItem('lounge_console_mode')==='true');}catch{setMode(false);}
  }
  window.addEventListener('DOMContentLoaded',init);
})();
