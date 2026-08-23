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

const TOKEN = process.env.DISCORD_TOKEN;
const PREFIX = "!";

const RESPS = {
  1: "Vampire — Niheim",
  2: "Minotaur / Witch — Niheim",
  3: "Orcs — Niheim",
  4: "Cyclops — Niheim",
  5: "Tortoise — Niheim",
  6: "Octopus — Niheim",
  7: "Dragons / Dragon Lords — Surface — Niheim",
  8: "Dragons / Dragon Lords — -1 — Niheim",
  9: "Dragon Lords — -1 Big Cave — Niheim",
  10: "Hydras — Niheim",
  11: "Stone Refiner — Niheim",
  12: "Storm Dragons — Niheim",
  13: "Energy Witch — Niheim",
  14: "Medusas -1 — Niheim",
  15: "Medusas -2 — Niheim",
  16: "Demons — Niheim",
  17: "Soul Devourer / Hideosface — Niheim",
  18: "Esganed Demons / Demon (Nightmare Boss) — Niheim",
  19: "Black Soul Devourer / Black Hideosface — Niheim",
  20: "Thunder Sabers — Niheim",
  21: "Boquitas -1 — Niheim",
  22: "Boquitas -2 — Niheim",
  23: "Boquitas -3 — Niheim",
  24: "Livraria Ice — Niheim",
  25: "Livraria Earth — Niheim",
  26: "Livraria Fire — Niheim",
  27: "Livraria Death — Niheim",
  28: "Livraria Energy — Niheim",
  29: "Esganed Demons — Niheim",
  30: "Werewolf — Niheim",
  31: "Undead Guardian / Dark Reapers — Cave 400 — Niheim",
  32: "Dark Torturer — Cave 400 — Niheim",
  33: "Torturer Zombie / Cursed Hands — Cave 400 — Niheim",
  34: "Undead Dragon Lord — Cave 400 — Niheim",
  35: "Undead Storm Dragon — Cave 400 — Niheim",
  36: "Undead Gladiator / Warrior / Zombie — Cave 400 — Niheim",
  37: "Dark Reaper / Demon — Cave 400 — Niheim",
  38: "Cursed Death Book / Undead Guardians — Cave 400 — Niheim",
  39: "Cursed Brain / Undead Storm Dragon — Cave 400 — Niheim",
  40: "Undead Dragon Lord — Cave 400 — Niheim",
  41: "Elite Undead Warrior / Infernal Demons (Palancas) — Cave 600 — Niheim",
  42: "Piso Aspiral Undead Medusa — Cave 600 — Niheim",
  43: "Elite Undead Warrior / Infernal Demons (Post Palancas) — Cave 600 — Niheim",
  44: "Ice Spider / Mutated Rat — Mistland",
  45: "Global Warrior — Mistland",
  46: "Glacial Giant — Mistland",
  47: "Snowbeast 1º Piso — Mistland",
  48: "Snowbeast 2º Piso — Mistland",
  49: "Snowbeast / Yeti — Mistland",
  50: "Yeti 1º Piso — Mistland",
  51: "Yeti 2º Piso — Mistland",
  52: "Sabres — Mistland",
  53: "Frost Dragon — Mistland",
  54: "Frost Demon / Frost Vampire 1º Piso — Mistland",
  55: "Frost Demon 2º Piso — Mistland",
  56: "Frost Demon 3º Piso — Mistland",
  57: "Frost Reappers / Ice Mutante Rats — Mistland",
  58: "Dragons / Dragon Lords — Luxor",
  59: "Dragon Lords — Luxor",
  60: "Ancient Slime — Luxor",
  61: "Ancient Scarab -1 — Luxor",
  62: "Ancient Scarab -2 — Luxor",
  63: "Scropion Imperador — Luxor",
  64: "Mummia — Luxor",
  65: "Behebull — Luxor",
  66: "Behebull +1 — Luxor",
  67: "Necromance — Surface — Luxor",
  68: "Necromance -1 — Luxor",
  69: "Necromance / Demons — Luxor",
  70: "Falcons 1st Floor — Luxor",
  71: "Falcon 2nd Floor — Luxor",
  72: "Falcons 1st/2nd Floor (Lvl 800+) — Luxor",
  73: "Green / Blue Djinn 1st Floor — Luxor",
  74: "Green / Blue Djinn 2nd Floor — Luxor",
  75: "Green / Blue Djinn 1st/2nd Floor (Lvl 800+) — Luxor",
  76: "Undead Frost Dragon / Frost Dark Reapers — Mistland"
};

const active = new Map();

function getResp(number) {
  const id = Number(number);

  if (!Number.isInteger(id) || id < 1 || id > 76) {
    return null;
  }

  return {
    id,
    name: RESPS[id]
  };
}

function parseTime(value) {
  if (!value) return null;

  value = value.toLowerCase().trim();

  if (value.endsWith("h")) {
    const hours = Number(value.slice(0, -1));

    if (!hours || hours <= 0) return null;

    return {
      ms: hours * 60 * 60 * 1000,
      text: `${hours}h`
    };
  }

  const minutes = Number(value);

  if (!minutes || minutes <= 0) return null;

  return {
    ms: minutes * 60 * 1000,
    text: `${minutes} min`
  };
}

client.once("ready", () => {
  console.log(`✅ Bot online jako ${client.user.tag}`);
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/\s+/);

  const command = args.shift()?.toLowerCase();

  // ===============================
  // !resp 72 2h
  // ===============================

  if (command === "resp") {
    const resp = getResp(args[0]);
    const time = parseTime(args[1]);

    if (!resp) {
      return message.reply("❌ Podaj numer respa od `1` do `76`.");
    }

    if (!time) {
      return message.reply(
        "❌ Podaj czas, np. `2h` albo `30` minut.\nPrzykład: `!resp 72 2h`"
      );
    }

    if (active.has(resp.id)) {
      const data = active.get(resp.id);

      return message.reply(
        `🔴 **RESP #${resp.id} jest zajęty**\n` +
        `🗺️ ${resp.name}\n` +
        `👤 <@${data.userId}>\n\n` +
        `Użyj \`!respnext ${resp.id}\`, aby wejść do kolejki.`
      );
    }

    active.set(resp.id, {
      id: resp.id,
      name: resp.name,
      userId: message.author.id,
      durationMs: time.ms,
      durationText: time.text,
      endTime: Date.now() + time.ms,
      queue: []
    });

    const unix = Math.floor((Date.now() + time.ms) / 1000);

    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle(`🔴 ZAJĘTY RESP #${resp.id}`)
      .setDescription(
        `**${resp.name}**\n\n` +
        `👤 Zajęty przez: <@${message.author.id}>\n` +
        `⏳ Do: <t:${unix}:t> (<t:${unix}:R>)`
      );

    return message.channel.send({ embeds: [embed] });
  }

  // ===============================
  // !respnext 72
  // ===============================

  if (command === "respnext") {
    const resp = getResp(args[0]);

    if (!resp) {
      return message.reply("❌ Podaj numer respa od `1` do `76`.");
    }

    const data = active.get(resp.id);

    if (!data) {
      return message.reply(
        `🟢 **RESP #${resp.id} jest wolny.**\n` +
        `Użyj \`!resp ${resp.id} 2h\`.`
      );
    }

    if (data.userId === message.author.id) {
      return message.reply("❌ Ten resp jest już Twój.");
    }

    if (data.queue.includes(message.author.id)) {
      return message.reply("❌ Jesteś już w kolejce NEXT.");
    }

    data.queue.push(message.author.id);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("⏩ NEXT — KOLEJKA")
      .setDescription(
        `<@${message.author.id}> wszedł do kolejki.\n\n` +
        `🗺️ **RESP #${resp.id}**\n` +
        `${resp.name}\n\n` +
        `📊 Pozycja: **${data.queue.length}**`
      );

    return message.channel.send({ embeds: [embed] });
  }

  // ===============================
  // !nextdel 72
  // ===============================

  if (command === "nextdel") {
    const resp = getResp(args[0]);

    if (!resp) {
      return message.reply("❌ Podaj numer respa od `1` do `76`.");
    }

    const data = active.get(resp.id);

    if (!data) {
      return message.reply("❌ Ten resp nie jest zajęty.");
    }

    const position = data.queue.indexOf(message.author.id);

    if (position === -1) {
      return message.reply("❌ Nie jesteś w kolejce NEXT.");
    }

    data.queue.splice(position, 1);

    return message.reply(
      `✅ Usunięto Cię z kolejki NEXT dla **RESP #${resp.id}**.`
    );
  }

  // ===============================
  // !respdel 72
  // ===============================

  if (command === "respdel") {
    const resp = getResp(args[0]);

    if (!resp) {
      return message.reply("❌ Podaj numer respa od `1` do `76`.");
    }

    const data = active.get(resp.id);

    if (!data) {
      return message.reply(`🟢 RESP #${resp.id} jest już wolny.`);
    }

    if (data.userId !== message.author.id) {
      return message.reply(
        "❌ Tylko osoba zajmująca resp może go zwolnić."
      );
    }

    if (data.queue.length > 0) {
      const oldUser = data.userId;
      const nextUser = data.queue.shift();

      data.userId = nextUser;
      data.endTime = Date.now() + data.durationMs;

      const unix = Math.floor(data.endTime / 1000);

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`🔄 NEXT CLAIM — RESP #${resp.id}`)
        .setDescription(
          `🗺️ **${resp.name}**\n\n` +
          `👤 <@${oldUser}> zwolnił resp.\n` +
          `👤 <@${nextUser}> przejmuje resp.\n` +
          `⏳ Do: <t:${unix}:t> (<t:${unix}:R>)`
        );

      return message.channel.send({ embeds: [embed] });
    }

    active.delete(resp.id);

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle(`🟢 ZWOLNIONY RESP #${resp.id}`)
      .setDescription(
        `**${resp.name}**\n\n` +
        `Resp zwolniony przez <@${message.author.id}>.`
      );

    return message.channel.send({ embeds: [embed] });
  }

  // ===============================
  // !list
  // ===============================

  if (command === "list") {
    if (active.size === 0) {
      return message.channel.send(
        "📭 **Brak aktywnych respów. Wszystkie są wolne.**"
      );
    }

    const sorted = [...active.values()]
      .sort((a, b) => a.id - b.id);

    let text = "";

    for (const data of sorted) {
      const unix = Math.floor(data.endTime / 1000);

      text +=
        `🔴 **#${data.id} ${data.name}**\n` +
        `👤 <@${data.userId}>\n` +
        `⏳ <t:${unix}:R>\n` +
        `⏩ NEXT: ${data.queue.length}\n\n`;
    }

    if (text.length > 4000) {
      text = text.slice(0, 3900) + "\n...";
    }

    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle("🎯 Lista aktywnych respów — EUROPA")
      .setDescription(text);

    return message.channel.send({ embeds: [embed] });
  }

  // ===============================
  // !wolne
  // ===============================

  if (command === "wolne") {
    const free = [];

    for (let id = 1; id <= 76; id++) {
      if (!active.has(id)) {
        free.push(`#${id} ${RESPS[id]}`);
      }
    }

    let text = free.join("\n");

    if (text.length > 4000) {
      text = text.slice(0, 3900) + "\n...";
    }

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle(`🟢 Wolne respy (${free.length}/76)`)
      .setDescription(text || "Brak wolnych respów.");

    return message.channel.send({ embeds: [embed] });
  }

  // ===============================
  // !respinfo 72
  // ===============================

  if (command === "respinfo") {
    const resp = getResp(args[0]);

    if (!resp) {
      return message.reply("❌ Podaj numer respa od `1` do `76`.");
    }

    const data = active.get(resp.id);

    if (!data) {
      return message.channel.send(
        `🟢 **RESP #${resp.id} — WOLNY**\n🗺️ ${resp.name}`
      );
    }

    const unix = Math.floor(data.endTime / 1000);

    return message.channel.send(
      `🔴 **RESP #${resp.id} — ZAJĘTY**\n` +
      `🗺️ ${resp.name}\n` +
      `👤 <@${data.userId}>\n` +
      `⏳ <t:${unix}:R>\n` +
      `⏩ NEXT: ${data.queue.length}`
    );
  }

  // ===============================
  // !help
  // ===============================

  if (command === "help") {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("📖 Helmo Claim Bot")
      .setDescription(
        "`!resp 72 2h` — zajmij resp\n\n" +
        "`!respnext 72` — wejdź do NEXT\n\n" +
        "`!respdel 72` — zwolnij resp\n\n" +
        "`!nextdel 72` — wyjdź z NEXT\n\n" +
        "`!respinfo 72` — informacje o respie\n\n" +
        "`!list` — aktywne respy\n\n" +
        "`!wolne` — wolne respy"
      );

    return message.channel.send({ embeds: [embed] });
  }
});

// automatyczne wygasanie

setInterval(async () => {
  const now = Date.now();

  for (const [id, data] of active.entries()) {
    if (now < data.endTime) continue;

    if (data.queue.length > 0) {
      const nextUser = data.queue.shift();

      data.userId = nextUser;
      data.endTime = now + data.durationMs;
    } else {
      active.delete(id);
    }
  }
}, 15000);

if (!TOKEN) {
  console.error("❌ Brak DISCORD_TOKEN");
  process.exit(1);
}

client.login(TOKEN);
