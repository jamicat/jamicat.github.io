const discordUserId = "160899636637204482"; 
const statusContainer = document.createElement("div");
statusContainer.id = "discordStatus";
statusContainer.innerHTML = `
  <img id="discordAvatar" src="" alt="Discord Avatar">
  <div id="discordText">
    <span id="discordName">Loading...</span>
    <span id="discordActivity">Fetching status...</span>
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

    let statusColor = "#f472b6"; // pink default
    if (status === "online") statusColor = "#86efac";
    if (status === "idle") statusColor = "#facc15";
    if (status === "dnd") statusColor = "#f87171";
    if (status === "offline") statusColor = "#9ca3af";

    nameEl.style.color = statusColor;
    activityEl.textContent = activity;
  } catch (error) {
    console.error("Failed to fetch Discord status:", error);
    document.getElementById("discordName").textContent = "Unavailable";
    document.getElementById("discordActivity").textContent = "Could not fetch status";
  }
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 20000);
