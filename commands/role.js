const { SlashCommandBuilder } = require('discord.js');
const { roles } = require('../config.json')

function findRole(input) {
    for (const role of roles) {
        if (input == role.id) {
            return role;
        }
    }
}

function filterRoles(input) {
    const filteredRoles = [];
    for (const role of roles) {
        let choices = []
        choices.push(role.name);
        choices.push(...role.alternatives);
        for (const choice of choices) {
            if (choice.toLowerCase().includes(input.toLowerCase())) {
                filteredRoles.push(role);
                break;
            }
        }
    }
    return filteredRoles;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Assign game role')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Game to search for')
                .setRequired(true)
                .setAutocomplete(true)),
    async execute(interaction) {
        const input = interaction.options.getString('game');
        const role = findRole(input);
        if (role) {
            let memberRole = interaction.member.roles.cache.find(r => r.id == role.id);
            if (memberRole) {
                interaction.member.roles.remove(memberRole);
                console.log(`Removing from member "${interaction.user.username}" role "${memberRole.name}"`);
                await interaction.reply(`Removed role: ${memberRole.name}!`);
            } else {
                let discordRole = interaction.guild.roles.cache.find(r => r.id == role.id);
                interaction.member.roles.add(discordRole);
                console.log(`Adding to member "${interaction.user.username}" role "${discordRole.name}"`);
                await interaction.reply(`Added role: ${discordRole.name}!`);
            }
        } else {
            await interaction.reply(`Role was not found: ${input}`);
        }
    },
    async autocomplete(interaction) {
        const input = interaction.options.getFocused();
        const filteredRoles = filterRoles(input);
        await interaction.respond(filteredRoles.map(role => ({ name: role.name, value: role.id })));
    },
};
