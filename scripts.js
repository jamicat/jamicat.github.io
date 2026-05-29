
function showGuestBook() {

  if (document.getElementById('guestBookWindow')) {
    return;
  }

   const guestBookWindow = document.createElement('div');
  guestBookWindow.className = 'terminal2 absolute p-6 max-w-full w-[90vw] sm:w-[500px] text-white rounded-3xl bg-pink-200/15 border border-pink-200/20';
  guestBookWindow.style.zIndex = 11;
  guestBookWindow.style.top = '50%';
  guestBookWindow.style.left = '50%';
  guestBookWindow.style.transform = 'translate(-50%, -50%)';
  guestBookWindow.id = 'guestBookWindow';

  guestBookWindow.innerHTML = `
  <div class="drag-area flex justify-between items-center select-none mb-2 text-sm">
    <span class="flex items-center space-x-2">
      <img src="g2.gif" alt="Avatar2" class="avatar-icon2" />
      <span id="typed2" class="font-medium text-lg mt-4 mb-4 text-blue-glow no-theme-glow">Guestbook</span>
    </span>
    <div class="flex items-center space-x-2 mr-3 -mt-12">
      <button onclick="closeGuestBook()" class="text-pink-200 hover:text-pink-100 transition-colors duration-200 text-lg leading-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-pink-200 hover:text-pink-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>

  <div class="flex flex-col sm:flex-row gap-6">
    <div class="w-full">
      <div class="text-blue-100/80 text-md mt-2 mb-4 text-center">
       <p id="welcomeMessage" class="text-base text-blue-100">meow</p>
      </div>
      <form id="guestbookForm" class="space-y-4 text-blue-100">
        <input id="name" type="text" name="name" placeholder="Name"
          class="w-full p-2 rounded border border-pink-200/40 bg-pink-100/20 bg-opacity-30 text-pink-100 placeholder-pink-100/80" required />
        <textarea id="message" name="message" placeholder="Message"
          class="w-full p-2 rounded border border-pink-200/40 bg-pink-100/20 bg-opacity-30 text-pink-100 placeholder-pink-100/80" required></textarea>
        <div class="text-center">
          <button type="submit" class="terminal-button bg-pink-50 hover:bg-pink-50 opacity-90 text-black guestbook-submit">Submit</button>
        </div>
      </form>
    </div>
  </div>
`;
document.body.appendChild(guestBookWindow);

/*var typed2 = new Typed('#typed2', {
  strings: ['guestbook'],  
  typeSpeed: 0,            
  backSpeed: 0,
  showCursor: false,
  smartBackspace: false,
  loop: false
});*/

const guestbookCommentBox = document.createElement('div');
guestbookCommentBox.id = 'guestbookComments';
guestbookCommentBox.className = `
 terminal 
  absolute 
  p-4 
  w-[300px] 
  overflow-y-auto 
  bg-pink-200/15
  border-pink-200/20
  text-white 
  text-sm 
  scrollbar-thin 
  scrollbar-thumb-pink-300 
  scrollbar-track-black 
  rounded-3xl
`;

guestbookCommentBox.style.zIndex = 10;
document.body.appendChild(guestbookCommentBox);

function updateCommentBoxPosition() {
  const guestWindow = document.getElementById('guestBookWindow');
  const commentBox = document.getElementById('guestbookComments');

  if (!guestWindow || !commentBox) return;

  const rect = guestWindow.getBoundingClientRect();

  commentBox.style.position = 'absolute';
  commentBox.style.top = `${rect.top}px`;
  commentBox.style.left = `${rect.right + 10}px`;
  commentBox.style.height = `${rect.height}px`; 
}

requestAnimationFrame(() => {
  updateCommentBoxPosition();
});

const guestWindow = document.getElementById('guestBookWindow');
const commentBox = document.getElementById('guestbookComments');

if (guestWindow && commentBox) {
  const resizeObserver = new ResizeObserver(() => {
    updateCommentBoxPosition();
  });
  resizeObserver.observe(guestWindow);
}

interact(guestBookWindow)
  .draggable({
    allowFrom: '.drag-area',
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true,
      }),
    ],
    listeners: {
      start(event) {
        const target = event.target;

        if (target.style.transform.includes('translate(-50%, -50%)')) {
          const rect = target.getBoundingClientRect();
          const scrollTop = window.scrollY || document.documentElement.scrollTop;
          const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

          target.style.top = rect.top + scrollTop + 'px';
          target.style.left = rect.left + scrollLeft + 'px';
          target.style.transform = 'translate(0, 0)';
          target.setAttribute('data-x', 0);
          target.setAttribute('data-y', 0);

          updateCommentBoxPosition();
        }
      },
      move(event) {
        const target = event.target;
        const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
        const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.transform = `translate(${x}px, ${y}px)`;
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        updateCommentBoxPosition();
      }
    }
  });

document.getElementById('guestbookForm').addEventListener('submit', async function (e) {
e.preventDefault();

const name = document.getElementById("name").value.trim();
const message = document.getElementById("message").value.trim();
const now = Date.now();

if (!name || !message) {
alert("Fill in the fields!");
return;
}

if (now - lastGbSubmissionTime < 300000) {
alert("5 minutes between submits");
return;
}

lastGbSubmissionTime= now;

const data = {
name: name,
comment: message,
timestamp: new Date().toISOString(),
};

const url = "/api/comments";

await fetch(url, {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify(data),
});

document.getElementById("name").value = "";
document.getElementById("message").value = "";
const welcomeMessage = document.querySelector('p.text-base');
welcomeMessage.textContent = "meow!";

  setTimeout(() => {
    welcomeMessage.textContent = "meow";
  }, 5000);
  loadGuestbookComments();
  });

  /*const name = this.name.value.trim();
  const message = this.message.value.trim();
  if (!name || !message) return;

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  try {
    await fetch('YOUR_SUBMIT_URL_HERE', {
      method: 'POST',
      body: new URLSearchParams({ name, message })
    });

    this.reset();
    //loadGuestbookComments(); 
  } catch (err) {
    alert('Failed to send message');
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});*/
function connectGuestbookSocket() {
  if (guestbookSocket && guestbookSocket.readyState === WebSocket.OPEN) {
    return;
  }
  guestbookSocket = new WebSocket(`wss://${location.host}/api/ws`);
  guestbookSocket.onmessage = (event) => {
    if (event.data === "refresh") {
      loadGuestbookComments();
    }
  };
  guestbookSocket.onclose = () => {
    console.log("Guestbook WS closed, reconnecting...");
    setTimeout(connectGuestbookSocket, 2000);
  };
  guestbookSocket.onerror = (err) => {
    console.error("Guestbook WS error:", err);
  };
}
connectGuestbookSocket();
loadGuestbookComments();
}
                                                          
async function loadGuestbookComments() {

  const container = document.getElementById('guestbookComments');
  if (!container) return;

  container.innerHTML = '<p class="text-blue-100 text-sm">Loading ฅᨐฅ</p>';

  try {

    const response = await fetch('/api/list');
    const data = await response.json();

    const comments = data.comments || [];

    container.innerHTML = '';

    comments.forEach(entry => {

      const div = document.createElement('div');

      div.className = 'bg-pink-50 bg-opacity-[0.03] rounded p-3 mb-2 text-sm';

      div.innerHTML = `
        <div class="mb-1 font-medium text-white text-blue-glow no-theme-glow">
          ${entry.name || 'Anonymous'}
        </div>

        <div class="mb-1 text-pink-100">
          ${entry.comment || ''}
        </div>

        <div class="text-blue-100 opacity-80 text-[0.65rem] text-right">
          ${entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
        </div>
      `;

      container.appendChild(div);

    });

  } catch (err) {

    console.error("Guestbook load error:", err);
    container.innerHTML = '<p class="text-blue-100 text-sm">Failed to load.</p>';

  }
}

function closeGuestBook() {
  const gbWindow = document.getElementById('guestBookWindow');
  const commentBox = document.getElementById('guestbookComments');
  if (gbWindow) gbWindow.remove();
  if (commentBox) commentBox.remove();
}
