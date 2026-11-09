const LETTERS_API = 'https://api.jmeow.co.uk';
const LETTERS_KEY_STORAGE = 'jmeow_letters_admin_key';

const mailboxState = {
  key: '',
  letters: [],
  index: -1
};

function mailboxRequest(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${mailboxState.key}`
  };

  return fetch(
    `${LETTERS_API}${path}`,
    {
      ...options,
      headers
    }
  );
}

function mailboxPlainText(html) {
  const element = document.createElement('div');
  element.innerHTML = html || '';
  return element.textContent
    .replace(/\s+/g, ' ')
    .trim();
}

function mailboxDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: 'medium',
      timeStyle: 'short'
    }
  ).format(date);
}

function setMailboxLoginStatus(message) {
  const status =
    document.getElementById(
      'mailboxLoginStatus'
    );

  if (status) {
    status.textContent = message || '';
  }
}

function showMailboxLogin() {
  const login =
    document.getElementById('mailboxLogin');
  const inbox =
    document.getElementById('mailboxInbox');

  if (login) {
    login.hidden = false;
  }

  if (inbox) {
    inbox.hidden = true;
  }
}

function showMailboxInbox() {
  const login =
    document.getElementById('mailboxLogin');
  const inbox =
    document.getElementById('mailboxInbox');

  if (login) {
    login.hidden = true;
  }

  if (inbox) {
    inbox.hidden = false;
  }
}

function renderMailboxUnread() {
  const unread =
    mailboxState.letters.filter(
      letter => !letter.read_at
    ).length;

  const element =
    document.getElementById('mailboxUnread');

  if (element) {
    element.textContent =
      `${unread} unread`;
  }
}

function renderMailboxList() {
  const list =
    document.getElementById('mailboxList');

  if (!list) {
    return;
  }

  list.replaceChildren();

  mailboxState.letters.forEach(
    (letter, index) => {
      const button =
        document.createElement('button');
      const title =
        document.createElement('div');
      const preview =
        document.createElement('div');
      const date =
        document.createElement('div');

      button.type = 'button';
      button.className =
        'mailbox-list-item';

      if (!letter.read_at) {
        button.classList.add('is-unread');
      }

      if (index === mailboxState.index) {
        button.classList.add('is-selected');
      }

      title.className = 'mailbox-list-title';
      title.textContent =
        letter.signature_html
          ? mailboxPlainText(
              letter.signature_html
            ) || 'anonymous'
          : 'anonymous';

      preview.className =
        'mailbox-list-preview';
      preview.textContent =
        mailboxPlainText(
          letter.message_html
        ) || 'letter';

      date.className = 'mailbox-list-date';
      date.textContent =
        mailboxDate(letter.created_at);

      button.append(
        title,
        preview,
        date
      );

      button.addEventListener(
        'click',
        () => selectMailboxLetter(index)
      );

      list.appendChild(button);
    }
  );
}

async function markMailboxLetterRead(letter) {
  if (!letter || letter.read_at) {
    return;
  }

  try {
    const response =
      await mailboxRequest(
        '/api/admin/letters/read',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            id: letter.id
          })
        }
      );

    if (!response.ok) {
      return;
    }

    const result = await response.json();
    letter.read_at = result.readAt ||
      new Date().toISOString();
    renderMailboxUnread();
    renderMailboxList();
  } catch {
  }
}

function renderMailboxLetter() {
  const empty =
    document.getElementById('mailboxEmpty');
  const wrapper =
    document.getElementById('mailboxLetter');
  const letter =
    mailboxState.letters[
      mailboxState.index
    ];

  if (!letter) {
    if (empty) {
      empty.hidden = false;
    }
    if (wrapper) {
      wrapper.hidden = true;
    }
    return;
  }

  if (empty) {
    empty.hidden = true;
  }

  if (wrapper) {
    wrapper.hidden = false;
  }

  const paper =
    document.getElementById('mailboxPaper');
  const image =
    document.getElementById(
      'mailboxPaperImage'
    );
  const messageBlock =
    document.getElementById(
      'mailboxMessageBlock'
    );
  const signatureBlock =
    document.getElementById(
      'mailboxSignatureBlock'
    );
  const message =
    document.getElementById('mailboxMessage');
  const signature =
    document.getElementById(
      'mailboxSignature'
    );
  const date =
    document.getElementById('mailboxDate');
  const number =
    document.getElementById('mailboxNumber');
  const previous =
    document.getElementById(
      'mailboxPrevious'
    );
  const next =
    document.getElementById('mailboxNext');

  const template = Math.max(
    1,
    Math.min(
      18,
      Number(letter.template_number) || 1
    )
  );

  if (paper) {
    paper.dataset.letterFont =
      letter.font || 'nintendoh';
    paper.dataset.letterSize =
      letter.size || 'medium';
    paper.style.setProperty(
      '--letter-text-colour',
      letter.colour || '#333238'
    );
  }

  if (image) {
    image.src =
      `/tmplates/Letter${String(template).padStart(2, '0')}.png`;
    image.alt =
      `letter paper ${String(template).padStart(2, '0')}`;
  }

  if (messageBlock) {
    messageBlock.style.left =
      `${Number(letter.message_x) || 0}%`;
    messageBlock.style.top =
      `${Number(letter.message_y) || 0}%`;
  }

  if (signatureBlock) {
    signatureBlock.style.left =
      `${Number(letter.signature_x) || 0}%`;
    signatureBlock.style.top =
      `${Number(letter.signature_y) || 0}%`;
  }

  if (message) {
    message.innerHTML =
      letter.message_html || '';
  }

  if (signature) {
    signature.innerHTML =
      letter.signature_html || '';
  }

  if (date) {
    date.textContent =
      mailboxDate(letter.created_at);
  }

  if (number) {
    number.textContent =
      `${mailboxState.index + 1} / ${mailboxState.letters.length}`;
  }

  if (previous) {
    previous.disabled =
      mailboxState.index >=
      mailboxState.letters.length - 1;
  }

  if (next) {
    next.disabled =
      mailboxState.index <= 0;
  }
}

function selectMailboxLetter(index) {
  if (
    index < 0 ||
    index >= mailboxState.letters.length
  ) {
    return;
  }

  mailboxState.index = index;
  renderMailboxList();
  renderMailboxLetter();
  markMailboxLetterRead(
    mailboxState.letters[index]
  );
}

async function loadMailboxLetters() {
  const response =
    await mailboxRequest(
      '/api/admin/letters?limit=100'
    );

  if (response.status === 401) {
    throw new Error('invalid admin key');
  }

  if (!response.ok) {
    throw new Error(
      'could not load letters'
    );
  }

  const result = await response.json();
  mailboxState.letters =
    Array.isArray(result.letters)
      ? result.letters
      : [];

  if (!mailboxState.letters.length) {
    mailboxState.index = -1;
  } else if (
    mailboxState.index < 0 ||
    mailboxState.index >=
      mailboxState.letters.length
  ) {
    mailboxState.index = 0;
  }

  renderMailboxUnread();
  renderMailboxList();
  renderMailboxLetter();
}

async function openMailbox(key) {
  const cleaned = String(key || '').trim();

  if (!cleaned) {
    setMailboxLoginStatus(
      'enter your admin key'
    );
    return;
  }

  mailboxState.key = cleaned;
  setMailboxLoginStatus('opening...');

  const response =
    await mailboxRequest(
      '/api/admin/login',
      { method: 'POST' }
    );

  if (!response.ok) {
    mailboxState.key = '';
    setMailboxLoginStatus(
      'invalid admin key'
    );
    return;
  }

  sessionStorage.setItem(
    LETTERS_KEY_STORAGE,
    cleaned
  );

  await loadMailboxLetters();
  setMailboxLoginStatus('');
  showMailboxInbox();
}

async function deleteMailboxLetter() {
  const letter =
    mailboxState.letters[
      mailboxState.index
    ];

  if (!letter) {
    return;
  }

  if (!window.confirm('delete this letter?')) {
    return;
  }

  const response =
    await mailboxRequest(
      '/api/admin/letters/delete',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          id: letter.id
        })
      }
    );

  if (!response.ok) {
    return;
  }

  mailboxState.letters.splice(
    mailboxState.index,
    1
  );

  if (
    mailboxState.index >=
    mailboxState.letters.length
  ) {
    mailboxState.index =
      mailboxState.letters.length - 1;
  }

  renderMailboxUnread();
  renderMailboxList();
  renderMailboxLetter();
}

function initializeMailbox() {
  const keyInput =
    document.getElementById('mailboxKey');
  const loginButton =
    document.getElementById(
      'mailboxLoginButton'
    );
  const refresh =
    document.getElementById('mailboxRefresh');
  const logout =
    document.getElementById('mailboxLogout');
  const previous =
    document.getElementById(
      'mailboxPrevious'
    );
  const next =
    document.getElementById('mailboxNext');
  const deleteButton =
    document.getElementById('mailboxDelete');

  loginButton?.addEventListener(
    'click',
    () => openMailbox(keyInput?.value)
  );

  keyInput?.addEventListener(
    'keydown',
    event => {
      if (event.key === 'Enter') {
        openMailbox(keyInput.value);
      }
    }
  );

  refresh?.addEventListener(
    'click',
    async () => {
      try {
        await loadMailboxLetters();
      } catch {
        showMailboxLogin();
      }
    }
  );

  logout?.addEventListener(
    'click',
    () => {
      sessionStorage.removeItem(
        LETTERS_KEY_STORAGE
      );
      mailboxState.key = '';
      mailboxState.letters = [];
      mailboxState.index = -1;
      if (keyInput) {
        keyInput.value = '';
      }
      showMailboxLogin();
    }
  );

  previous?.addEventListener(
    'click',
    () => selectMailboxLetter(
      mailboxState.index + 1
    )
  );

  next?.addEventListener(
    'click',
    () => selectMailboxLetter(
      mailboxState.index - 1
    )
  );

  deleteButton?.addEventListener(
    'click',
    deleteMailboxLetter
  );

  const stored =
    sessionStorage.getItem(
      LETTERS_KEY_STORAGE
    );

  if (stored) {
    openMailbox(stored).catch(() => {
      sessionStorage.removeItem(
        LETTERS_KEY_STORAGE
      );
      mailboxState.key = '';
      showMailboxLogin();
    });
  } else {
    showMailboxLogin();
  }
}

initializeMailbox();
