// discscripts.js
const discordUserId = "YOUR_DISCORD_ID_HERE"; // Replace with your Discord user ID

// Create Discord status container
const statusContainer = document.createElement("div");
statusContainer.id = "discordStatus";
statusContainer.className =
  "absolute top-4 left-4 flex items-center space-x-3 p-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-pink-400 shadow-lg transition duration-300 ease-in-out z-[9999] hover:bg-black/50 hover:border-white/20 font-[Nunito]";

statusContainer.innerHTML = `
  <img id="discordAvatar" class="w-10 h-10 rounded-full border border-pink-400/40 shadow-md" src="" alt="Discord Avatar">
  <div id="discordText" class="flex flex-col leading-tight">
    <span id="discordName" class="text-pink-300 text-sm font-semibold">Loading...</span>
    <span id="discordActivity" class="text-pink-500 text-xs opacity-80">Fetching status...</span>
  </div>
`;

document.body.appendChild(statusContainer);

async function fetchDiscordStatus() {
  try {
    const response = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
    const { data } = await response.json();

    if (!data) return;

    const avatar = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`;
    const name = data.discord_user.display_name || data.discord_user.username;
    const status = data.discord_status;
    const activities = data.activities || [];
    const activity = activities.length > 0 ? activities[0].name : "Idle";

    const avatarEl = document.getElementById("discordAvatar");
    const nameEl = document.getElementById("discordName");
    const activityEl = document.getElementById("discordActivity");

    avatarEl.src = avatar;
    nameEl.textContent = name;

    let statusColor = "text-pink-300"; // default
    if (status === "online") statusColor = "text-green-300";
    if (status === "idle") statusColor = "text-yellow-300";
    if (status === "dnd") statusColor = "text-red-400";
    if (status === "offline") statusColor = "text-gray-400";

    // reset and apply color
    nameEl.className = `text-sm font-semibold ${statusColor}`;
    activityEl.textContent = activity;
  } catch (error) {
    console.error("Failed to fetch Discord status:", error);
    document.getElementById("discordName").textContent = "Unavailable";
    document.getElementById("discordActivity").textContent = "Could not fetch status";
  }
}

// Fetch on load and refresh every 20 seconds
fetchDiscordStatus();
setInterval(fetchDiscordStatus, 20000);
