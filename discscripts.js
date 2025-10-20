const discordUserId = "160899636637204482";

const statusContainer = document.createElement("div");
statusContainer.id = "discordStatus";
statusContainer.className =
  "absolute top-6 left-6 flex items-center space-x-3 p-2.5 rounded-3xl bg-black/20 backdrop-blur-md border-[1px] border-white/10 text-pink-400 shadow-lg transition-transform duration-300 ease-in-out z-[9999] hover:bg-black/25 hover:border-white/30 font-[Nunito] text-base perspective-[800px]";

statusContainer.innerHTML = `
  <div class="relative">
    <img id="discordAvatar" class="w-[3.25rem] h-[3.25rem] rounded-full border border-pink-400/50 shadow-md object-cover" src="" alt="Discord Avatar">
    <span id="statusDot" class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black"></span>
  </div>
  <div id="discordText" class="flex flex-col leading-tight">
    <span id="discordName" class="text-pink-300 text-[13px] font-semibold">Loading...</span>
    <span id="discordActivity" class="text-pink-500 text-[11px] opacity-90 truncate max-w-[180px]">Fetching status...</span>
  </div>
`;

document.body.appendChild(statusContainer);

let lastOnline = Date.now();

async function fetchDiscordStatus() {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
    const { data } = await response.json();
    if (!data) return;

    const user = data.discord_user;
    const username = `${user.username}${user.discriminator && user.discriminator !== "0" ? `#${user.discriminator}` : ""}`;
    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : "https://cdn.discordapp.com/embed/avatars/0.png";

    const status = data.discord_status;
    const activities = data.activities || [];
    const customStatus = activities.find(a => a.type === 4);
    const playing = activities.find(a => a.type === 0);
    const listening = activities.find(a => a.id === "spotify:1" || a.name === "Spotify");
    const watching = activities.find(a => a.type === 3);

    const avatarEl = document.getElementById("discordAvatar");
    const nameEl = document.getElementById("discordName");
    const activityEl = document.getElementById("discordActivity");
    const statusDot = document.getElementById("statusDot");

    avatarEl.src = avatar;
    nameEl.textContent = username;

    let dotColor = "bg-gray-500";
    if (status === "online") dotColor = "bg-green-400";
    if (status === "idle") dotColor = "bg-yellow-400";
    if (status === "dnd") dotColor = "bg-red-500";

    statusDot.className = `absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-black ${dotColor}`;

    if (status === "offline") {
      const now = Date.now();
      const diffMs = now - lastOnline;
      const diffMins = Math.floor(diffMs / 60000);
      let offlineText = "Offline";

      if (diffMins >= 60) {
        const diffHours = Math.floor(diffMins / 60);
        offlineText = `Offline for ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
      } else if (diffMins > 0) {
        offlineText = `Offline for ${diffMins} min${diffMins > 1 ? "s" : ""}`;
      }

      activityEl.textContent = offlineText;
    } else {
      lastOnline = Date.now();

      if (listening && listening.details && listening.state) {
        const song = listening.details;
        const artist = listening.state;
        const album = listening.assets?.large_text || "";
        activityEl.textContent = `🎵 ${song} — ${artist}${album ? ` (${album})` : ""}`;
      } else if (playing) {
        activityEl.textContent = `🎮 Playing ${playing.name}`;
      } else if (watching) {
        activityEl.textContent = `📺 Watching ${watching.name}`;
      } else if (customStatus && customStatus.state) {
        activityEl.textContent = customStatus.state;
      } else {
        const prettyStatus =
          status === "online"
            ? "Online"
            : status === "idle"
            ? "Idle"
            : status === "dnd"
            ? "Do Not Disturb"
            : "Offline";
        activityEl.textContent = prettyStatus;
      }
    }
  } catch (error) {
    console.error("Failed to fetch Discord status:", error);
    document.getElementById("discordName").textContent = "Unavailable";
    document.getElementById("discordActivity").textContent = "Could not fetch status";
  }
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 20000);

statusContainer.addEventListener("mousemove", (e) => {
  const rect = statusContainer.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * 3;
  const rotateY = ((x - centerX) / centerX) * -3;
  statusContainer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
});

statusContainer.addEventListener("mouseleave", () => {
  statusContainer.style.transform = "rotateX(0) rotateY(0) scale(1)";
});






