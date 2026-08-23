import { codeBlock, Events, MessageFlags } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';
import { config } from '../config/Config.js';
import { log } from '../utils/Console.js';
import { getTextChannel, handleError, ValkyrieContainer } from '../utils/Util.js';

@Discord()
export class InteractionCreate {
    /**
     * Handler for interactionCreate event.
     * @param args - An array containing the interaction and client objects.
     * @param client - The Discord client.
     */
    @On({ event: Events.InteractionCreate })
    async onInteraction([interaction]: ArgsOf<'interactionCreate'>, client: Client) {
        // Check if the interaction is in a guild text-based channel, and is a select menu, slash command, or context menu.
        if (
            !(
                interaction.guild &&
                interaction.channel?.isTextBased() &&
                (interaction.isStringSelectMenu() ||
                    interaction.isChatInputCommand() ||
                    interaction.isContextMenuCommand())
            )
        ) {
            return;
        }

        try {
            await client.executeInteraction(interaction);
        } catch (err) {
            await handleError(client, err);
        }

        if (config.ENABLE_LOGGING) {
            if (!interaction.isChatInputCommand()) {
                return;
            }

            const reply = await interaction.fetchReply().catch(() => null);

            const jumpUrl =
                reply?.guildId && reply?.channelId && reply?.id
                    ? `https://discord.com/channels/${reply.guildId}/${reply.channelId}/${reply.id}`
                    : undefined;

            const nowInSeconds = Math.floor(Date.now() / 1000);
            const executedCommand = interaction.toString();

            const channelName =
                interaction.channel && 'name' in interaction.channel && interaction.channel.name
                    ? `#${interaction.channel.name}`
                    : `#${interaction.channelId}`;

            log.command({
                channel: channelName,
                command: executedCommand,
                guild: interaction.guild.name,
                jump: jumpUrl,
                latency: Date.now() - interaction.createdTimestamp,
                user: interaction.user.displayName,
                userUrl: `https://discord.com/users/${interaction.user.id}`,
            });

            const logContainer = ValkyrieContainer(
                'Command Executed',
                [
                    `**👤 User:** ${interaction.user}`,
                    `**📅 Date:** <t:${nowInSeconds}:F>`,
                    `**📰 Interaction:** ${jumpUrl ?? `<#${interaction.channelId}>`}`,
                    '',
                    `**🖥️ Command**\n${codeBlock('kotlin', executedCommand)}`,
                ].join('\n')
            );

            // Channel logging
            if (config.COMMAND_LOGGING_CHANNEL) {
                const channel = await getTextChannel(client, config.COMMAND_LOGGING_CHANNEL);
                if (channel) {
                    channel
                        .send({
                            allowedMentions: { parse: [] },
                            components: [logContainer],
                            flags: MessageFlags.IsComponentsV2,
                        })
                        .catch((error: unknown) => {
                            log.error('Failed to send command log', error);
                        });
                }
            }
        }
    }
}
