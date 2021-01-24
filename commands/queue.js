const Discord = require('discord.js')

module.exports = {
    name: "queue",
    aliases: ["q"],
    run: async (client, message, args) => {
        const queue = client.distube.getQueue(message)
        if (!queue) return message.channel.send(`${client.emotes.error} | There is nothing playing!`)
        const q = queue.songs.map((song, i) => `${i === 0 ? "Playing:" : `${i}.`} ${song.name} - \`${song.formattedDuration}\``).join("\n")

        let embed = new Discord.MessageEmbed()
        embed.setColor('#3e39db')
        embed.setTitle(`${client.emotes.queue} | **Server Queue**`)
        embed.setDescription(q)
        if (embed.description.length >= 2048)
            embed.description = `${embed.description.substr(0, 2045)}...`;
        embed.setFooter('More songs will show up as you keep listening')
        message.channel.send(embed)
    }
}