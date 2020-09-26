const config = require('./config');
const Discord = require('discord.js');
const client = new Discord.Client();
const gifCreator = require('./src/gif-creator');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  if (message.guild && message.content === 'join' && message.member.hasPermission('ADMINISTRATOR')) {
    client.emit('guildMemberAdd', message.member);
  }
});

client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.find(ch => ch.id === '514798095536488459');
  if (!channel) return console.log(`Cannot find channel`);

  let gif = new gifCreator(`https://cdn.discordapp.com/attachments/752221897860841526/757937439800033290/Untitled_design_-_2020-09-22T151241.218.gif`, {
    width: 1440, height: 810, isRepeated: true
  });

  let a = await gif.init();

  await gif.editFrame('all', async (ctx, fw, fh, Canvas) => {
    return new Promise(async (res, rej) => {
      ctx.beginPath();
      ctx.arc(500 + 200, 250 + 200, 200, 0, Math.PI * 2, true);
      ctx.stroke();
      ctx.closePath();
      ctx.clip();

      let avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
      ctx.drawImage(avatar, 500, 250, 400, 400);
      res(null);
    });
  });

  let finle = await gif.out();

  await channel.send(`Welcome to the server ${member}`, {
    files: [
      {
        attachment: finle,
        name: 'Welcome.gif'
      }
    ]
  });
});

client.login(config.discord.bot.token);
