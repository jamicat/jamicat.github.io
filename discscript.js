const discordUserId = "160899636637204482";

let discordAvatarURL = "";
let lastOnline = Date.now();

async function fetchDiscordStatus() {
  try {
    const response = await fetch(
      `https://api.lanyard.rest/v1/users/${discordUserId}`
    );
    const { data } = await response.json();
    if (!data) return;

    const user = data.discord_user;
    const username = `${user.username}${
      user.discriminator && user.discriminator !== "0"
        ? `#${user.discriminator}`
        : ""
    }`;

    let avatar;
    if (user.avatar) {
      const isAnimated = user.avatar.startsWith("a_");
      const extension = isAnimated ? "gif" : "png";

      avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
    } else {
      avatar = "https://cdn.discordapp.com/embed/avatars/0.png";
    }

    discordAvatarURL = avatar;

    document.querySelectorAll(".replyAvatar").forEach((img) => {
      img.src = discordAvatarURL;
    });

    const status = data.discord_status;
    const activities = data.activities || [];

    const customStatus = activities.find((a) => a.type === 4);
    const playing = activities.find((a) => a.type === 0);
    const listening = activities.find(
      (a) => a.id === "spotify:1" || a.name === "Spotify"
    );
    const watching = activities.find((a) => a.type === 3);

    console.log("Discord user:", username, status);

    if (status === "offline") {
      const now = Date.now();
      const diffMins = Math.floor((now - lastOnline) / 60000);

      console.log(
        diffMins >= 60
          ? `Offline for ${Math.floor(diffMins / 60)}h`
          : `Offline for ${diffMins}m`
      );
    } else {
      lastOnline = Date.now();

      if (listening?.details && listening?.state) {
        console.log(
          `Listening to ${listening.details} — ${listening.state}`
        );
      } else if (playing) {
        console.log(`Playing ${playing.name}`);
      } else if (watching) {
        console.log(`Watching ${watching.name}`);
      } else if (customStatus?.state) {
        console.log(customStatus.state);
      } else {
        console.log(status);
      }
    }
  } catch (error) {
    console.error("Failed to fetch Discord status:", error);
  }
}

fetchDiscordStatus();
setInterval(fetchDiscordStatus, 20000);
