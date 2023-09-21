const { SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType, ButtonBuilder, ButtonStyle } = require('discord.js');
const { roles } = require('../config.json');

function findRole(input) {
    for (const role of roles) {
        if (input == role.id) {
            return role;
        }
    }
}

function findMemberRole(interaction, role) {
    return interaction.member.roles.cache.find(r => r.id == role.id);
}

async function awaitNoChange(interaction) {
    await interaction.editReply({ content: 'There were no changes in your roles!', components: [] });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('Assign game role'),
    async execute(interaction) {
        const options = [];
        for (const role of roles) {
            const existingRole = interaction.member.roles.cache.find(r => r.id == role.id);
            options.push(new StringSelectMenuOptionBuilder()
                .setLabel(`${role.name} [${role.tag}]`)
                .setValue(role.id)
                .setDefault(existingRole !== undefined),
            );
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('games')
            .setPlaceholder('Games:')
            .setMinValues(0)
            .setMaxValues(options.length)
            .addOptions(options);

        const confirm = new ButtonBuilder()
            .setCustomId('confirm')
            .setLabel('Assign!')
            .setStyle(ButtonStyle.Primary);

        const rowSelect = new ActionRowBuilder()
            .addComponents(select);
        const rowConfirm = new ActionRowBuilder()
            .addComponents(confirm);

        const response = await interaction.reply({
            content: 'Select your games!',
            components: [rowSelect, rowConfirm],
            ephemeral: true,
        });

        const selectCollector = response.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 3_600_000 });
        const buttonCollector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });

        let isChanged = false;
        let savedValues = [];

        selectCollector.on('collect', async i => {
            isChanged = true;
            savedValues = i.values;
            i.deferUpdate();
        });

        buttonCollector.on('collect', async i => {
            if (!isChanged) {
                awaitNoChange(interaction);
                return;
            }

            const addedRoles = [];
            for (const savedValue of savedValues) {
                const role = findRole(savedValue);
                if (!findMemberRole(i, role)) {
                    const discordRole = i.guild.roles.cache.find(r => r.id == role.id);
                    i.member.roles.add(discordRole);
                    addedRoles.push(role);
                }
            }

            const removedRoles = [];
            for (const role of roles) {
                if (!savedValues.includes(role.id)) {
                    const memberRole = findMemberRole(i, role);
                    if (memberRole) {
                        i.member.roles.remove(memberRole);
                        removedRoles.push(role);
                    }
                }
            }

            if (addedRoles.length == 0 && removedRoles.length == 0) {
                awaitNoChange(interaction);
                return;
            }

            await interaction.editReply({ content: 'Your roles were successfully changed!', components: [] });

            const replies = [];
            const removedRoleNames = removedRoles.filter(role => !role.silent).map(role => `*${role.name}*`);
            if (removedRoleNames.length > 0) {
                replies.push(`${i.user.globalName} just dropped ${removedRoleNames.join(', ')}!`);
            }
            const addedRoleNames = addedRoles.filter(role => !role.silent).map(role => `*${role.name}*`);
            if (addedRoleNames.length > 0) {
                replies.push(`${i.user.globalName} now plays ${addedRoleNames.join(', ')}!`);
            }
            if (replies.length) {
                await i.reply(replies.join('\n'));
            }
        });
    },
};
