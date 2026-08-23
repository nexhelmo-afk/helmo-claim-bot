const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ==============================
// USTAWIENIA
// ==============================

const PREFIX = "!";

// Token będzie dodany później w Railway.
// NIE wpisuj tokenu bota bezpośrednio tutaj.
const TOKEN = process.env.DISCORD_TOKEN;

// Aktywne respy
// nazwa => { userId, username, endTime, durationText, queue: [] }
const respawns = new Map();


// ==============================
// FUNKCJE
// ==============================

function parseTime(text) {
  if (!text) return null;

  text = text.toLowerCase().trim();

  // np. 2h
  if (text.endsWith("h")) {
    const hours = parseFloat(text.slice(0, -1));

    if (isNaN(hours) || hours <= 0) return null;

    return {
      ms: hours * 60 * 60 * 1000,
      text: `${hours}h`
    };
  }

  // bez "h" = minuty
  const minutes = parseInt(text);

  if (isNaN(minutes) || minutes <= 0) return null;

  return {
    ms: minutes * 60 * 1000,
    text: `${minutes} min`
  };
}


function normalizeResp(name) {
  return name.trim().toLowerCase();
}


function prettyName(name) {
  return name
    .split(" ")
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
}


// ==============================
// BOT ONLINE
// ==============================

client.once("ready", () => {
  console.log(`✅ Bot online jako ${client.user.tag}`);
});


// ==============================
// KOMENDY
// ==============================

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/\s+/);

  const command = args.shift()?.toLowerCase();


  // =====================================
  // !resp nazwa czas
  //
  // przykład:
  // !resp falcons 2h
  // =====================================

  if (command === "resp") {

    if (args.length < 2) {
      return message.reply(
        "❌ Użycie: `!resp nazwa_respa czas`\nPrzykład: `!resp falcons 2h`"
      );
    }

    const timeText = args.pop();
    const time = parseTime(timeText);

    if (!time) {
      return message.reply(
        "❌ Nieprawidłowy czas.\nPrzykład: `2h` albo `30`."
      );
    }

    const originalName = args.join(" ");
    const key = normalizeResp(originalName);

    if (respawns.has(key)) {

      const data = respawns.get(key);

      return message.reply(
        `❌ Ten resp jest już zajęty przez <@${data.userId}>.\n` +
        `Użyj \`!respnext ${originalName}\`, aby wejść do kolejki.`
      );
    }

    const endTime = Date.now() + time.ms;

    respawns.set(key, {
      name: originalName,
      userId: message.author.id,
      username: message.author.username,
      endTime,
      durationMs: time.ms,
      durationText: time.text,
      queue: []
    });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle("🎯 Respawn Marked")
      .setDescription(
        `<@${message.author.id}> marked a respawn!`
      )
      .addFields(
        {
          name: "🗺️ Hunt",
          value: prettyName(originalName)
        },
        {
          name: "⚔️ Server",
          value: "EUROPA"
        },
        {
          name: "⏱️ Time",
          value: time.text
        }
      )
      .setTimestamp();

    await message.channel.send({
      embeds: [embed]
    });

    return;
  }


  // =====================================
  // !respnext nazwa
  // =====================================

  if (command === "respnext") {

    if (!args.length) {
      return message.reply(
        "❌ Użycie: `!respnext nazwa_respa`"
      );
    }

    const originalName = args.join(" ");
    const key = normalizeResp(originalName);

    if (!respawns.has(key)) {
      return message.reply(
        "❌ Ten resp nie jest obecnie zajęty."
      );
    }

    const data = respawns.get(key);

    if (data.userId === message.author.id) {
      return message.reply(
        "❌ Już jesteś właścicielem tego respa."
      );
    }

    if (data.queue.includes(message.author.id)) {
      return message.reply(
        "❌ Już jesteś w kolejce NEXT."
      );
    }

    data.queue.push(message.author.id);

    const position = data.queue.length;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("⏩ Next en Cola")
      .setDescription(
        `<@${message.author.id}> wszedł do kolejki NEXT!`
      )
      .addFields(
        {
          name: "🗺️ Hunt",
          value: prettyName(data.name)
        },
        {
          name: "📊 Position",
          value: String(position)
        }
      )
      .setTimestamp();

    await message.channel.send({
      embeds: [embed]
    });

    return;
  }


  // =====================================
  // !nextdel nazwa
  // =====================================

  if (command === "nextdel") {

    if (!args.length) {
      return message.reply(
        "❌ Użycie: `!nextdel nazwa_respa`"
      );
    }

    const originalName = args.join(" ");
    const key = normalizeResp(originalName);

    if (!respawns.has(key)) {
      return message.reply(
        "❌ Nie znaleziono tego respa."
      );
    }

    const data = respawns.get(key);

    const index = data.queue.indexOf(message.author.id);

    if (index === -1) {
      return message.reply(
        "❌ Nie jesteś w kolejce NEXT."
      );
    }

    data.queue.splice(index, 1);

    return message.reply(
      `✅ Usunięto Cię z kolejki NEXT dla **${prettyName(data.name)}**.`
    );
  }


  // =====================================
  // !respdel nazwa
  // =====================================

  if (command === "respdel") {

    if (!args.length) {
      return message.reply(
        "❌ Użycie: `!respdel nazwa_respa`"
      );
    }

    const originalName = args.join(" ");
    const key = normalizeResp(originalName);

    if (!respawns.has(key)) {
      return message.reply(
        "❌ Ten resp nie jest zajęty."
      );
    }

    const data = respawns.get(key);

    if (data.userId !== message.author.id) {
      return message.reply(
        "❌ Tylko osoba zajmująca resp może go zwolnić."
      );
    }

    // Jeśli ktoś jest NEXT
    if (data.queue.length > 0) {

      const oldUser = data.userId;
      const nextUser = data.queue.shift();

      data.userId = nextUser;
      data.endTime = Date.now() + data.durationMs;

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle("🔄 Next Claim!")
        .setDescription(
          `👤 <@${oldUser}> opuścił hunt **${prettyName(data.name)}**\n` +
          `👤 <@${nextUser}> jest teraz na respie.`
        )
        .setTimestamp();

      await message.channel.send({
        embeds: [embed]
      });

    } else {

      respawns.delete(key);

      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle("📭 Respawn Free")
        .setDescription(
          `**${prettyName(data.name)}** jest teraz wolny.`
        )
        .setTimestamp();

      await message.channel.send({
        embeds: [embed]
      });
    }

    return;
  }


  // =====================================
  // !list
  // =====================================

  if (command === "list") {

    if (respawns.size === 0) {
      return message.channel.send(
        "📭 **Brak aktywnych respów.**"
      );
    }

    let text = "";

    for (const data of respawns.values()) {

      const unix = Math.floor(data.endTime / 1000);

      text +=
        `🎯 **${prettyName(data.name)}**\n` +
        `👤 <@${data.userId}>\n` +
        `⏱️ koniec: <t:${unix}:R>\n` +
        `⏩ NEXT: ${data.queue.length}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle("🎯 Lista Respawns Activos – EUROPA")
      .setDescription(text);

    await message.channel.send({
      embeds: [embed]
    });

    return;
  }


  // =====================================
  // !help
  // =====================================

  if (command === "help") {

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle("📖 Helmo Claim Bot")
      .setDescription(
        "**Komendy:**\n\n" +

        "`!resp nazwa 2h`\n" +
        "Zajmuje resp.\n\n" +

        "`!respnext nazwa`\n" +
        "Dodaje Cię do NEXT.\n\n" +

        "`!respdel nazwa`\n" +
        "Zwalnia resp.\n\n" +

        "`!nextdel nazwa`\n" +
        "Usuwa Cię z NEXT.\n\n" +

        "`!list`\n" +
        "Pokazuje aktywne respy."
      );

    await message.channel.send({
      embeds: [embed]
    });

    return;
  }

});


// ==============================
// AUTOMATYCZNE KOŃCZENIE CLAIMÓW
// ==============================

setInterval(async () => {

  const now = Date.now();

  for (const [key, data] of respawns) {

    if (now < data.endTime) continue;

    if (data.queue.length > 0) {

      const nextUser = data.queue.shift();

      data.userId = nextUser;
      data.endTime = Date.now() + data.durationMs;

    } else {

      respawns.delete(key);

    }
  }

}, 30000);


// ==============================
// START
// ==============================

if (!TOKEN) {
  console.error("❌ Brak zmiennej DISCORD_TOKEN");
  process.exit(1);
}

client.login(TOKEN);
