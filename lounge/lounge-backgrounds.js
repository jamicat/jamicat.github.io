(() => {
  const ocean = document.getElementById('loungeOcean');
  const picker = document.getElementById('loungeBackgroundPicker');
  if (!ocean || !picker) return;
  const key = 'lounge_background_v1';
  const choices = ['stars', 'ocean', 'none'];
  let selected = 'stars';
  try { selected = localStorage.getItem(key) || 'stars'; } catch {}
  const shark = `<svg viewBox="0 0 150 90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <path class="lounge-shark-tail" d="M39 43Q17 33 9 15Q5 35 20 46Q5 58 10 75Q24 61 41 52Z" fill="#719bb6"/>
    <path d="M59 30Q58 13 77 5Q76 19 91 31Z" fill="#719bb6"/>
    <path d="M30 45C38 24 70 18 99 26C124 31 141 42 140 49C138 65 109 74 79 70C54 68 38 58 30 45Z" fill="#92b7cf"/>
    <path d="M35 51Q73 60 139 48C137 65 109 74 79 70Q49 67 35 51Z" fill="#d6e8ee"/>
    <path d="M76 52Q73 70 90 80Q99 65 98 55Z" fill="#719bb6"/>
    <path d="M91 37q-4 6 0 11m6-10q-4 6 0 11" fill="none" stroke="#628aa5" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="116" cy="40" r="4.2" fill="#192c40"/><circle cx="117.2" cy="38.7" r="1.3" fill="#fff"/>
    <ellipse cx="116" cy="49" rx="5.5" ry="2.5" fill="#e9afc4" opacity=".85"/>
    <path d="M126 49q4 4 7-1" fill="none" stroke="#47657e" stroke-width="1.3" stroke-linecap="round"/>
  </svg>`;
  const swimmers = [[12,110,43,0.82,0],[34,66,60,0.4,1],[66,125,52,0.86,1],[82,80,72,0.5,0],[5,48,82,0.31,1],[49,55,69,0.36,0]];
  swimmers.forEach(([depth,size,duration,alpha,reverse],i) => {
    const el = document.createElement('div');
    el.className = `lounge-shark${reverse ? ' reverse' : ''}`;
    el.style.cssText = `--depth:${depth}%;--size:${size}px;--duration:${duration}s;--delay:${-duration*(.17+i*.29)%duration}s;--alpha:${alpha};--direction:${reverse?-1:1};--rest:${(i*37+8)%86}%;`;
    el.innerHTML = shark;
    ocean.append(el);
  });
  for (let i=0;i<30;i++) {
    const el = document.createElement('div');
    const duration = 15+(i*7)%23;
    el.className = 'lounge-ocean-bubble';
    el.style.cssText = `--x:${(i*37+3)%100}%;--size:${3+(i*5)%11}px;--duration:${duration}s;--delay:${-(i*9)%duration}s;--rest:${(i*29)%100}%;`;
    ocean.append(el);
  }
  function select(value) {
    selected = choices.includes(value) ? value : 'stars';
    document.body.dataset.loungeBackground = selected;
    picker.querySelectorAll('button[data-background]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.background === selected));
    });
    try { localStorage.setItem(key, selected); } catch {}
  }
  picker.addEventListener('click', event => {
    const button = event.target.closest('button[data-background]');
    if (button && picker.contains(button)) select(button.dataset.background);
  });
  document.addEventListener('visibilitychange', () => document.body.classList.toggle('lounge-background-inactive', document.hidden));
  document.body.classList.toggle('lounge-background-inactive', document.hidden);
  select(selected);
})();
