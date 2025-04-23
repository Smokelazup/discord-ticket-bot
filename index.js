const { Client, GatewayIntentBits, Partials, ActionRowBuilder, StringSelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const config = {
    token: process.env.TOKEN,
    guildId: process.env.GUILD_ID,
    categoryId: process.env.CATEGORY_ID,
    roleId: process.env.ROLE_ID
  };
  
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isStringSelectMenu()) {
    const option = interaction.values[0];
    const user = interaction.user;

    const ticketChannel = await interaction.guild.channels.create({
      name: `ticket-${user.username}`,
      type: ChannelType.GuildText,
      parent: config.categoryId,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: config.roleId,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });

    await ticketChannel.send({
      content: `<@${user.id}> Merci pour ta demande (${option.toUpperCase()}) ! <@&${config.roleId}> va te répondre.`,
    });

    await interaction.reply({ content: `Ton ticket a été créé ici : ${ticketChannel}`, ephemeral: true });
  }
});

client.on('ready', async () => {
  const channel = await client.channels.fetch('ID_DU_CHANNEL_DU_MENU');
  const row = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('ticket_menu')
      .setPlaceholder('Fais un choix')
      .addOptions([
        {
          label: 'ACHATS',
          value: 'achats',
          emoji: '🛒',
        },
        {
          label: 'SUPPORT',
          value: 'support',
          emoji: '⚠️',
        },
        {
          label: 'REPRISES ENTREPRISES/GROUPES',
          value: 'reprises',
          emoji: '🚫',
        },
        {
          label: 'RC STAFF/CM',
          value: 'rc',
          emoji: '🛡️',
        },
      ])
  );

  await channel.send({ content: 'Fais un choix pour créer un ticket :', components: [row] });
});

client.login(config.token);
