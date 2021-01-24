require("dotenv").config();//Loading .env
const fs = require("fs");
const DisTube = require("distube")
const Discord = require("discord.js");
const client = new Discord.Client()
const config = require("./config.json")


client.config = require("./config.json")
client.distube = new DisTube(client, { emitNewSongOnly: true, leaveOnFinish: true, customFilters: { "8d": "apulsator=hz=0.08", "vibrato": "vibrato=f=6.5", "pulsator": "apulsator=hz=1", "earrape": "superequalizer=1b=20:2b=20:3b=20:4b=20:5b=20:6b=20:7b=20:8b=20:9b=20:10b=20:11b=20:12b=20:13b=20:14b=20:15b=20:16b=20:17b=20:18b=20,volume=10" } })
client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.emotes = config.emoji

fs.readdir("./commands/", (err, files) => {
    if (err) return console.log("Could not find any commands!")
    const jsFiles = files.filter(f => f.split(".").pop() === "js")
    if (jsFiles.length <= 0) return console.log("Could not find any commands!")
    jsFiles.forEach(file => {
        const cmd = require(`./commands/${file}`)
        console.log(`Loaded ${file}`)
        client.commands.set(cmd.name, cmd)
        if (cmd.aliases) cmd.aliases.forEach(alias => client.aliases.set(alias, cmd.name))
    })
})

client.on("ready", () => {
    console.log(`${client.user.tag} is ready to play music.`)
    setInterval(() => {
        const server = client.voice.connections.size
        client.user.setActivity(`music${server == 0 ? '' : ` in ${server} ${server == 1 ? 'server' : 'servers'}`}`, { type: "PLAYING" })
    }, 20000)
})

client.on("message", async message => {
    const prefix = config.prefix
    if (!message.content.startsWith(prefix)) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
    if (!cmd) return
    if (cmd.inVoiceChannel && !message.member.voice.channel) return message.channel.send(`${client.emotes.error} | You must be in a voice channel!`)
    try {
        cmd.run(client, message, args)
    } catch (e) {
        console.error(e)
        message.reply(`Error: ${e}`)
    }
})

const status = queue => `**Volume:** \`${queue.volume}%\` | **Filter:** \`${queue.filter || "Off"}\` | **Loop:** \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | **Autoplay:** \`${queue.autoplay ? "On" : "Off"}\``

let embed = new Discord.MessageEmbed()
embed.setColor('#3e39db')
client.distube

    .on("playSong", (message, queue, song) => {
        embed.setDescription(`${client.emotes.play} | **Playing** \`${song.name}\` - \`${song.formattedDuration}\`\n**Requested by:** ${song.user}\n${status(queue)}`)
        return message.channel.send(embed)
    })

    .on("addSong", async (message, queue, song) => {
        let msg = await message.channel.send(`Searching for the song...`)
        embed.setDescription(`${client.emotes.success} | Added \`${song.name}\` - \`${song.formattedDuration}\` to the queue by ${song.user}`)
        return message.channel.send(embed).then(() => {
            msg.delete()
        })
    })

    .on("playList", (message, queue, playlist, song) => {
        embed.setDescription(`${client.emotes.play} | Playing \`${playlist.name}\` playlist.\n**Requested by:** ${song.user}\n**Now playing** \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`)
        return message.channel.send(embed)
    })

    .on("addList", (message, queue, playlist) => message.channel.send(
        `${client.emotes.success} | Added \`${playlist.name}\` playlist to queue\n${status(queue)}`
    ))

    .on("searchResult", (message, result) => {
        let i = 0
        embed.setDescription(`**Choose an option from below**\n\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n\n*Enter anything else or wait 60 seconds to cancel*`)
        return message.channel.send(embed)
    })

    // DisTubeOptions.searchSongs = true
    .on("searchCancel", message => message.channel.send(`${client.emotes.error} | Searching canceled`))
    .on("error", (message, err) => message.channel.send(`${client.emotes.error} | An error encountered: ${err}`))

client.login(process.env.TOKEN)

process.on("unhandledRejection", (err) => {
    console.error(err)
});