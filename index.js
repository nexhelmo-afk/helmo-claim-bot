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

// Kanał #list-respawn
const STATUS_CHANNEL_ID = "1541221779954081834";

// Kanał #komendy-bota
const COMMANDS_CHANNEL_ID = "1541231781968224266";

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

let statusMessageIds = [];

// ====================================================
// PODSTAWOWE FUNKCJE
// ====================================================

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

// ====================================================
// LISTA RESPAWNÓW 🟢 / 🔴
// ====================================================

async function updateRespStatus() {
  try {
    const channel = await client.channels.fetch(STATUS_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {
      console.log("❌ Nie znaleziono kanału #list-respawn");
      return;
    }

    let freeCount = 0;
    let busyCount = 0;

    const lines = [];

    for (let id = 1; id <= 76; id++) {

      if (active.has(id)) {
        busyCount++;

        const data = active.get(id);
        const unix = Math.floor(data.endTime / 1000);

        lines.push(
          `🔴 **#${id}** ${RESPS[id]}\n` +
          `👤 <@${data.userId}> • ⏳ <t:${unix}:R>`
        );

      } else {
        freeCount++;

        lines.push(
          `🟢 **#${id}** ${RESPS[id]}`
        );
      }
    }

    const header =
      `# 📋 LISTA RESPAWNÓW\n\n` +
      `🟢 **Wolne: ${freeCount}**\n` +
      `🔴 **Zajęte: ${busyCount}**\n\n`;

    const chunks = [];
    let current = header;

    for (const line of lines) {

      const next = `${line}\n\n`;

      if ((current + next).length > 1900) {
        chunks.push(current);
        current = "";
      }

      current += next;
    }

    if (current.length > 0) {
      chunks.push(current);
    }

    if (statusMessageIds.length === 0) {

      const recentMessages = await channel.messages.fetch({
        limit: 20
      });

      const oldBotMessages = [...recentMessages.values()]
        .filter(msg =>
          msg.author.id === client.user.id &&
          (
            msg.content.includes("LISTA RESPAWNÓW") ||
            msg.content.includes("🟢 **#") ||
            msg.content.includes("🔴 **#")
          )
        )
        .sort((a, b) => a.createdTimestamp - b.createdTimestamp);

      statusMessageIds = oldBotMessages.map(msg => msg.id);
    }

    for (let i = 0; i < chunks.length; i++) {

      let edited = false;

      if (statusMessageIds[i]) {

        try {

          const msg = await channel.messages.fetch(
            statusMessageIds[i]
          );

          await msg.edit(chunks[i]);

          edited = true;

        } catch {
          edited = false;
        }
      }

      if (!edited) {

        const msg = await channel.send(chunks[i]);

        statusMessageIds[i] = msg.id;
      }
    }

    if (statusMessageIds.length > chunks.length) {

      const excessIds =
        statusMessageIds.slice(chunks.length);

      for (const id of excessIds) {

        try {

          const msg =
            await channel.messages.fetch(id);

          await msg.delete();

        } catch {}
      }

      statusMessageIds =
        statusMessageIds.slice(0, chunks.length);
    }

  } catch (error) {

    console.error(
      "❌ Błąd aktualizacji #list-respawn:",
      error
    );
  }
}

// ====================================================
// KANAŁ KOMEND PL / EN
// ====================================================

async function updateCommandsChannel() {

  try {

    const channel =
      await client.channels.fetch(COMMANDS_CHANNEL_ID);

    if (!channel || !channel.isTextBased()) {

      console.log(
        "❌ Nie znaleziono kanału #komendy-bota"
      );

      return;
    }

    const embed = new EmbedBuilder()

      .setColor(0x5865F2)

      .setTitle(
        "📖 HELMO CLAIM BOT — KOMENDY / COMMANDS"
      )

      .setDescription(
        "🇵🇱 **Instrukcja obsługi bota**\n" +
        "🇬🇧 **Bot usage guide**"
      )

      .addFields(

        {
          name: "🎯 !resp 72 2h",
          value:
            "🇵🇱 Zajmuje wybrany resp na określony czas.\n" +
            "Przykład: `!resp 72 2h` → zajmuje RESP #72 na 2 godziny.\n\n" +
            "🇬🇧 Claims the selected respawn for a specified time.\n" +
            "Example: `!resp 72 2h` → claims RESP #72 for 2 hours."
        },

        {
          name: "⏩ !respnext 72",
          value:
            "🇵🇱 Dodaje Cię do kolejki NEXT na zajęty resp.\n" +
            "Gdy obecny gracz zwolni resp, pierwsza osoba z kolejki go przejmuje.\n\n" +
            "🇬🇧 Adds you to the NEXT queue for an occupied respawn.\n" +
            "When the current player releases it, the first player in queue takes over."
        },

        {
          name: "🟢 !respdel 72",
          value:
            "🇵🇱 Zwalnia zajęty przez Ciebie resp.\n" +
            "Jeśli ktoś czeka w NEXT, resp zostanie przekazany pierwszej osobie z kolejki.\n\n" +
            "🇬🇧 Releases your claimed respawn.\n" +
            "If someone is waiting in NEXT, the respawn is transferred to the first player in queue."
        },

        {
          name: "❌ !nextdel 72",
          value:
            "🇵🇱 Usuwa Cię z kolejki NEXT dla danego respa.\n\n" +
            "🇬🇧 Removes you from the NEXT queue for the selected respawn."
        },

        {
          name: "🔎 !respinfo 72",
          value:
            "🇵🇱 Pokazuje status wybranego respa: wolny/zajęty, właściciela, czas i NEXT.\n\n" +
            "🇬🇧 Shows the selected respawn status: free/occupied, owner, time and NEXT queue."
        },

        {
          name: "🔴 !list",
          value:
            "🇵🇱 Pokazuje wszystkie aktualnie zajęte respy.\n\n" +
            "🇬🇧 Shows all currently occupied respawns."
        },

        {
          name: "🟢 !wolne",
          value:
            "🇵🇱 Pokazuje wszystkie aktualnie wolne respy.\n\n" +
            "🇬🇧 Shows all currently available respawns."
        },

        {
          name: "📖 !help",
          value:
            "🇵🇱 Wyświetla skróconą listę komend.\n\n" +
            "🇬🇧 Displays a short list of commands."
        },

        {
          name: "⏱️ FORMAT CZASU / TIME FORMAT",
          value:
            "🇵🇱 `30` = 30 minut • `60` = 60 minut • `1h` = 1 godzina • `2h` = 2 godziny\n\n" +
            "🇬🇧 `30` = 30 minutes • `60` = 60 minutes • `1h` = 1 hour • `2h` = 2 hours"
        }
      )

      .setFooter({
        text: "Helmo Claim Bot • PL / EN"
      });

    const recentMessages =
      await channel.messages.fetch({
        limit: 20
      });

    const existing =
      [...recentMessages.values()].find(msg =>
        msg.author.id === client.user.id &&
        msg.embeds?.some(e =>
          e.title ===
          "📖 HELMO CLAIM BOT — KOMENDY / COMMANDS"
        )
      );

    if (existing) {

      await existing.edit({
        embeds: [embed]
      });

    } else {

      await channel.send({
        embeds: [embed]
      });
    }

  } catch (error) {

    console.error(
      "❌ Błąd aktualizacji #komendy-bota:",
      error
    );
  }
}

// ====================================================
// BOT ONLINE
// ====================================================

client.once("ready", async () => {

  console.log(
    `✅ Bot online jako ${client.user.tag}`
  );

  await updateRespStatus();

  await updateCommandsChannel();
});

// ====================================================
// KOMENDY
// ====================================================

client.on("messageCreate", async message => {

  if (message.author.bot) return;

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content
    .slice(PREFIX.length)
    .trim()
    .split(/\s+/);

  const command =
    args.shift()?.toLowerCase();

  // ==================================================
  // !resp 72 2h
  // ==================================================

  if (command === "resp") {

    const resp = getResp(args[0]);

    const time = parseTime(args[1]);

    if (!resp) {

      return message.reply(
        "❌ Podaj numer respa od `1` do `76`."
      );
    }

    if (!time) {

      return message.reply(
        "❌ Podaj czas, np. `2h` albo `30` minut.\n" +
        "Przykład: `!resp 72 2h`"
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

    const endTime =
      Date.now() + time.ms;

    active.set(resp.id, {

      id: resp.id,

      name: resp.name,

      userId: message.author.id,

      durationMs: time.ms,

      durationText: time.text,

      endTime,

      queue: []
    });

    await updateRespStatus();

    const unix =
      Math.floor(endTime / 1000);

    const embed =
      new EmbedBuilder()

        .setColor(0xED4245)

        .setTitle(
          `🔴 ZAJĘTY RESP #${resp.id}`
        )

        .setDescription(
          `**${resp.name}**\n\n` +
          `👤 Zajęty przez: <@${message.author.id}>\n` +
          `⏳ Do: <t:${unix}:t> (<t:${unix}:R>)`
        );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // ==================================================
  // !respnext 72
  // ==================================================

  if (command === "respnext") {

    const resp =
      getResp(args[0]);

    if (!resp) {

      return message.reply(
        "❌ Podaj numer respa od `1` do `76`."
      );
    }

    const data =
      active.get(resp.id);

    if (!data) {

      return message.reply(
        `🟢 **RESP #${resp.id} jest wolny.**\n` +
        `Użyj \`!resp ${resp.id} 2h\`.`
      );
    }

    if (
      data.userId ===
      message.author.id
    ) {

      return message.reply(
        "❌ Ten resp jest już Twój."
      );
    }

    if (
      data.queue.includes(
        message.author.id
      )
    ) {

      return message.reply(
        "❌ Jesteś już w kolejce NEXT."
      );
    }

    data.queue.push(
      message.author.id
    );

    const embed =
      new EmbedBuilder()

        .setColor(0x5865F2)

        .setTitle(
          "⏩ NEXT — KOLEJKA"
        )

        .setDescription(
          `<@${message.author.id}> wszedł do kolejki.\n\n` +
          `🗺️ **RESP #${resp.id}**\n` +
          `${resp.name}\n\n` +
          `📊 Pozycja: **${data.queue.length}**`
        );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // ==================================================
  // !nextdel 72
  // ==================================================

  if (command === "nextdel") {

    const resp =
      getResp(args[0]);

    if (!resp) {

      return message.reply(
        "❌ Podaj numer respa od `1` do `76`."
      );
    }

    const data =
      active.get(resp.id);

    if (!data) {

      return message.reply(
        "❌ Ten resp nie jest zajęty."
      );
    }

    const position =
      data.queue.indexOf(
        message.author.id
      );

    if (position === -1) {

      return message.reply(
        "❌ Nie jesteś w kolejce NEXT."
      );
    }

    data.queue.splice(
      position,
      1
    );

    return message.reply(
      `✅ Usunięto Cię z kolejki NEXT dla **RESP #${resp.id}**.`
    );
  }

  // ==================================================
  // !respdel 72
  // ==================================================

  if (command === "respdel") {

    const resp =
      getResp(args[0]);

    if (!resp) {

      return message.reply(
        "❌ Podaj numer respa od `1` do `76`."
      );
    }

    const data =
      active.get(resp.id);

    if (!data) {

      return message.reply(
        `🟢 RESP #${resp.id} jest już wolny.`
      );
    }

    if (
      data.userId !==
      message.author.id
    ) {

      return message.reply(
        "❌ Tylko osoba zajmująca resp może go zwolnić."
      );
    }

    if (
      data.queue.length > 0
    ) {

      const oldUser =
        data.userId;

      const nextUser =
        data.queue.shift();

      data.userId =
        nextUser;

      data.endTime =
        Date.now() +
        data.durationMs;

      await updateRespStatus();

      const unix =
        Math.floor(
          data.endTime / 1000
        );

      const embed =
        new EmbedBuilder()

          .setColor(
            0x5865F2
          )

          .setTitle(
            `🔄 NEXT CLAIM — RESP #${resp.id}`
          )

          .setDescription(
            `🗺️ **${resp.name}**\n\n` +
            `👤 <@${oldUser}> zwolnił resp.\n` +
            `👤 <@${nextUser}> przejmuje resp.\n` +
            `⏳ Do: <t:${unix}:t> (<t:${unix}:R>)`
          );

      return message.channel.send({
        embeds: [embed]
      });
    }

    active.delete(
      resp.id
    );

    await updateRespStatus();

    const embed =
      new EmbedBuilder()

        .setColor(
          0x57F287
        )

        .setTitle(
          `🟢 ZWOLNIONY RESP #${resp.id}`
        )

        .setDescription(
          `**${resp.name}**\n\n` +
          `Resp zwolniony przez <@${message.author.id}>.`
        );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // ==================================================
  // !list
  // ==================================================

  if (command === "list") {

    if (active.size === 0) {

      return message.channel.send(
        "📭 **Brak aktywnych respów. Wszystkie są wolne.**"
      );
    }

    const sorted =
      [...active.values()]
        .sort(
          (a, b) =>
            a.id - b.id
        );

    let text = "";

    for (
      const data of sorted
    ) {

      const unix =
        Math.floor(
          data.endTime / 1000
        );

      text +=
        `🔴 **#${data.id} ${data.name}**\n` +
        `👤 <@${data.userId}>\n` +
        `⏳ <t:${unix}:R>\n` +
        `⏩ NEXT: ${data.queue.length}\n\n`;
    }

    if (
      text.length > 4000
    ) {

      text =
        text.slice(
          0,
          3900
        ) + "\n...";
    }

    const embed =
      new EmbedBuilder()

        .setColor(
          0xF1C40F
        )

        .setTitle(
          "🎯 Lista aktywnych respów — EUROPA"
        )

        .setDescription(
          text
        );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // ==================================================
  // !wolne
  // ==================================================

  if (command === "wolne") {

    const free = [];

    for (
      let id = 1;
      id <= 76;
      id++
    ) {

      if (
        !active.has(id)
      ) {

        free.push(
          `#${id} ${RESPS[id]}`
        );
      }
    }

    let text =
      free.join("\n");

    if (
      text.length > 4000
    ) {

      text =
        text.slice(
          0,
          3900
        ) + "\n...";
    }

    const embed =
      new EmbedBuilder()

        .setColor(
          0x57F287
        )

        .setTitle(
          `🟢 Wolne respy (${free.length}/76)`
        )

        .setDescription(
          text ||
          "Brak wolnych respów."
        );

    return message.channel.send({
      embeds: [embed]
    });
  }

  // ==================================================
  // !respinfo 72
  // ==================================================

  if (
    command ===
    "respinfo"
  ) {

    const resp =
      getResp(args[0]);

    if (!resp) {

      return message.reply(
        "❌ Podaj numer respa od `1` do `76`."
      );
    }

    const data =
      active.get(resp.id);

    if (!data) {

      return message.channel.send(
        `🟢 **RESP #${resp.id} — WOLNY**\n` +
        `🗺️ ${resp.name}`
      );
    }

    const unix =
      Math.floor(
        data.endTime / 1000
      );

    return message.channel.send(
      `🔴 **RESP #${resp.id} — ZAJĘTY**\n` +
      `🗺️ ${resp.name}\n` +
      `👤 <@${data.userId}>\n` +
      `⏳ <t:${unix}:R>\n` +
      `⏩ NEXT: ${data.queue.length}`
    );
  }

  // ==================================================
  // !help
  // ==================================================

  if (command === "help") {

    const embed =
      new EmbedBuilder()

        .setColor(
          0x5865F2
        )

        .setTitle(
          "📖 Helmo Claim Bot"
        )

        .setDescription(
          "`!resp 72 2h` — zajmij resp\n\n" +
          "`!respnext 72` — wejdź do NEXT\n\n" +
          "`!respdel 72` — zwolnij resp\n\n" +
          "`!nextdel 72` — wyjdź z NEXT\n\n" +
          "`!respinfo 72` — informacje o respie\n\n" +
          "`!list` — aktywne respy\n\n" +
          "`!wolne` — wolne respy"
        );

    return message.channel.send({
      embeds: [embed]
    });
  }
});

// ====================================================
// AUTOMATYCZNE WYGASANIE
// ====================================================

setInterval(
  async () => {

    const now =
      Date.now();

    let changed =
      false;

    for (
      const [id, data]
      of active.entries()
    ) {

      if (
        now < data.endTime
      ) {
        continue;
      }

      if (
        data.queue.length > 0
      ) {

        const nextUser =
          data.queue.shift();

        data.userId =
          nextUser;

        data.endTime =
          now +
          data.durationMs;

        changed =
          true;

      } else {

        active.delete(id);

        changed =
          true;
      }
    }

    if (changed) {

      await updateRespStatus();
    }

  },
  15000
);

// Odświeżenie listy co minutę

setInterval(
  async () => {

    await updateRespStatus();

  },
  60000
);

// ====================================================
// START
// ====================================================

if (!TOKEN) {

  console.error(
    "❌ Brak DISCORD_TOKEN"
  );

  process.exit(1);
}

client.login(TOKEN);
