const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ] 
});

const PREFIX = '!'; 
const warnings = {}; 

client.once('ready', () => {
  console.log(`${client.user.tag} is now online!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const targetMember = message.mentions.members.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  // BAN
  if (command === 'ban') {
    if (!message.member.permissions.has('BanMembers')) return message.reply("❌ No permission.");
    if (!targetMember) return message.reply('❌ Mention a member to ban.');
    if (!targetMember.bannable) return message.reply('❌ I cannot ban this member.');
    await targetMember.ban({ reason: reason });
    return message.reply(`🔨 **${targetMember.user.tag}** has been banned. Reason: ${reason}`);
  }

  // MUTE (TIMEOUT)
  if (command === 'mute') {
    if (!message.member.permissions.has('ModerateMembers')) return message.reply("❌ No permission.");
    if (!targetMember) return message.reply('❌ Mention a member to mute.');
    const durationInput = parseInt(args[1]) || 10; 
    const durationMs = durationInput * 60 * 1000;
    try {
      await targetMember.timeout(durationMs, reason);
      return message.reply(`🔇 **${targetMember.user.tag}** muted for ${durationInput} mins. Reason: ${reason}`);
    } catch (e) {
      return message.reply('❌ Failed to mute. Check role hierarchy.');
    }
  }

  // WARN
  if (command === 'warn') {
    if (!message.member.permissions.has('ManageMessages')) return message.reply("❌ No permission.");
    if (!targetMember || targetMember.user.bot) return message.reply('❌ Invalid member.');
    const userId = targetMember.id;
    if (!warnings[userId]) warnings[userId] = 0;
    warnings[userId] += 1;
    return message.reply(`⚠️ **${targetMember.user.tag}** warned! (Total Warnings: ${warnings[userId]}). Reason: ${reason}`);
  }
});

// Notice how we use process.env here so your token is NEVER written in plaintext on GitHub!
client.login(process.env.DISCORD_TOKEN);
                                    
