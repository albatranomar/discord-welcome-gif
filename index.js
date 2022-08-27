require('dotenv').config();
const Discord = require('discord.js');
const path = require('path');
const canvasGif = require('canvas-gif');
const editor = require("editor-canvas");
const { loadImage } = require('canvas');

let client = new Discord.Client({
  intents: [
    'MessageContent',
    'GuildMessages',
    'GuildMembers',
    'Guilds',
    'GuildMessages'
  ]
});

client.once('ready', readyClient => {
  client = readyClient;

  console.log(`WE ARE ON.`);
})

client.on('messageCreate', message => {
  if (message.author.id == '349124522747887616' && message.content == 'join') {
    console.log('Joinning....');
    client.emit('guildMemberAdd', message.member);
  }
});

client.on('guildMemberAdd', async member => {
  let avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png' }));
  let imageLocation = {
    x: 87,
    y: 60,
    radius: 105
  }
  let buffer = await canvasGif(
    path.resolve(__dirname, 'welcome.gif'),
    async (ctx, width, height, totalFrames, currentFrame) => {
      // ctx.font = '40px sans-serif';
      ctx.font = editor.resizeText(ctx, {
        text: member.user.username,
        font: 40,
        width: 150
      }) + '';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(member.user.username.slice(0, currentFrame), 296, 220)

      ctx.beginPath();
      ctx.arc(imageLocation.x + imageLocation.radius, imageLocation.y + imageLocation.radius, imageLocation.radius, 0, Math.PI * 2, true);
      ctx.stroke();
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatar, imageLocation.x, imageLocation.y, imageLocation.radius * 2, imageLocation.radius * 2);
    },
    {
      coalesce: false, // whether the gif should be coalesced first, default: false
      delay: 0, // the delay between each frame in ms, default: 0
      algorithm: 'neuquant', // the algorithm the encoder should use, default: 'neuquant',
      optimiser: true, // whether the encoder should use the in-built optimiser, default: false,
      fps: 15, // the amount of frames to render per second, default: 60
      quality: 100, // the quality of the gif, a value between 1 and 100, default: 100
    }
  );

  let channel = await client.channels.fetch('823797907026214953');

  if (channel && channel.isTextBased()) {
    const attachment = new Discord.AttachmentBuilder(buffer, { name: 'welcome.gif' });

    channel.send({ files: [attachment] });
  }
});

client.login(process.env.TOKEN);