import {
    ActivityType,
    type ButtonInteraction,
    ChannelType,
    type CommandInteraction,
    ContainerBuilder,
    codeBlock,
    type Message,
    MessageFlags,
    type ModalSubmitInteraction,
    PermissionsBitField,
    SectionBuilder,
    SeparatorSpacingSize,
    type StringSelectMenuInteraction,
    type TextChannel,
    TextDisplayBuilder,
    ThumbnailBuilder,
    type UserSelectMenuInteraction,
} from 'discord.js';
import type { Client } from 'discordx';
import { config } from '../config/Config.js';
import { log } from './Console.js';

/**
 * Capitalises the first letter of each word in a string.
 * @param str - The string to be capitalised.
 * @returns The capitalised string.
 */
export const capitalise = (str: string): string => str.replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Deletes a message after a specified delay if it's deletable.
 * @param message - The message to delete.
 * @param time - The delay before deletion, in milliseconds.
 */
export function deletableCheck(message: Message, time: number): void {
    setTimeout(() => {
        message.delete().catch((error) => log.error('Failed to delete message', error));
    }, time);
}

/**
 * Deletes a message after a delay if the bot has Manage Messages and the message is deletable.
 * Ignores Unknown Message (10008) races. Use `deletableCheck` to delete the bot's own messages.
 */
export async function messageDelete(message: Message, time: number): Promise<void> {
    try {
        const botMember = message.guild?.members.cache.get(message.client.user.id);
        if (!botMember?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return;
        }

        await new Promise<void>((resolve) => {
            setTimeout(resolve, time);
        });

        if (!message.deletable) {
            return;
        }

        await message.delete().catch((error: unknown) => {
            const err = error as { code?: number; message?: string };
            if (err.code === 10_008 || err.message?.includes('Unknown Message')) {
                return;
            }
            throw error;
        });
    } catch (error) {
        log.error('Failed to delete the message', error);
        throw error;
    }
}

/**
 * Creates and sends a Components V2 message in response to an interaction.
 * @param interaction - The interaction that triggered the function.
 * @param type - Label shown in the header (Error, Success, Warn, Info, …).
 * @param content - The body of the message.
 * @param ephemeral - Whether the response should be ephemeral.
 */
export async function ValkyrieComponent(
    interaction:
        | CommandInteraction
        | ButtonInteraction
        | StringSelectMenuInteraction
        | ModalSubmitInteraction
        | UserSelectMenuInteraction,
    type: string,
    content: string,
    ephemeral = false
): Promise<void> {
    const lowerType = type.toLowerCase();
    const typeEmoji =
        lowerType.includes('error') || lowerType.includes('fail')
            ? '⛔'
            : lowerType.includes('warn')
              ? '⚠️'
              : lowerType.includes('success')
                ? '✅'
                : 'ℹ️';

    const tagLine = new TextDisplayBuilder().setContent(`**${typeEmoji} ${type}**`);
    const contentLine = new TextDisplayBuilder().setContent(content);
    const container = new ContainerBuilder()
        .addTextDisplayComponents(tagLine)
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(contentLine);

    try {
        if (interaction.deferred) {
            await interaction.editReply({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        await interaction.reply({
            components: [container],
            flags: ephemeral
                ? [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2]
                : MessageFlags.IsComponentsV2,
        });
    } catch (error) {
        log.error('Failed to send component response', error);
    }
}

/**
 * Builds a Components V2 container with a title and body text.
 * If the body contains a `**Avatar:** https://...` line, that URL is shown as a thumbnail.
 * @param title - Heading shown at the top of the container.
 * @param body - Markdown body content.
 */
export function ValkyrieContainer(title: string, body: string): ContainerBuilder {
    const header = new TextDisplayBuilder().setContent(`# ${title}`);
    const lines = body.split('\n');
    const avatarLineIndex = lines.findIndex((line) => line.startsWith('**Avatar:**'));
    const avatarUrlRaw =
        avatarLineIndex >= 0 ? lines[avatarLineIndex]?.replace('**Avatar:**', '').trim() : null;
    const avatarUrl = avatarUrlRaw && /^https?:\/\//.test(avatarUrlRaw) ? avatarUrlRaw : null;

    if (avatarLineIndex >= 0 && avatarUrl) {
        lines.splice(avatarLineIndex, 1);
    }

    const contentText = lines.join('\n').trim();
    const content = new TextDisplayBuilder().setContent(contentText.length > 0 ? contentText : '-');

    const container = new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small));

    if (avatarUrl) {
        const section = new SectionBuilder()
            .addTextDisplayComponents(content)
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarUrl));
        container.addSectionComponents(section);
        return container;
    }

    return container.addTextDisplayComponents(content);
}

/**
 * Fetches command IDs for both global and guild commands.
 * @param client - The Discord client instance
 * @returns Promise resolving to a record of command names to their IDs
 */
export async function getCommandIds(
    client: Client,
    guildId: string
): Promise<Record<string, string>> {
    if (!client.application) {
        throw new Error('Client application is not available');
    }

    const commandIds = new Map<string, string>();
    const isGuildOnly = client.botGuilds && client.botGuilds.length > 0;

    // Fetch global commands
    if (!isGuildOnly) {
        try {
            const globalCommands = await client.application.commands.fetch();
            for (const cmd of globalCommands.values()) {
                commandIds.set(cmd.name, cmd.id);
            }
        } catch (error) {
            log.warn('Could not fetch global commands', error);
        }
    }

    // Fetch guild commands
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
        try {
            const guildCommands = await guild.commands.fetch();
            for (const cmd of guildCommands.values()) {
                commandIds.set(cmd.name, cmd.id);
            }
        } catch (error) {
            log.warn(`Could not fetch commands for guild ${guild.name}`, error);
        }
    }

    return Object.fromEntries(commandIds);
}

const STATUS_INTERVAL_MS = 15_000;
let lastStatusAt = 0;
let statusScheduled = false;
let queuedClient: Client | undefined;

/**
 * Updates the status of the Discord client with information about guilds and users.
 * @param client - The Discord client instance.
 */
export function updateStatus(client: Client) {
    queuedClient = client;
    const remaining = STATUS_INTERVAL_MS - (Date.now() - lastStatusAt);

    if (remaining > 0) {
        if (statusScheduled) {
            return;
        }
        statusScheduled = true;
        setTimeout(() => {
            statusScheduled = false;
            flushStatus();
        }, remaining);
        return;
    }

    flushStatus();
}

function flushStatus() {
    const client = queuedClient;
    queuedClient = undefined;
    if (!client) {
        return;
    }

    lastStatusAt = Date.now();
    client.user?.setActivity({
        name: `${client.guilds.cache.size.toLocaleString('en')} Guilds
            ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
        type: ActivityType.Watching,
    });
}

/**
 * Resolves a guild text channel by ID, fetching it if it is not in cache.
 */
export async function getTextChannel(
    client: Client,
    channelId: string
): Promise<TextChannel | undefined> {
    const cached = client.channels.cache.get(channelId);
    if (cached?.type === ChannelType.GuildText) {
        return cached;
    }

    try {
        const fetched = await client.channels.fetch(channelId);
        if (fetched?.type === ChannelType.GuildText) {
            return fetched;
        }
    } catch (error) {
        log.error(`Failed to fetch channel ${channelId}`, error);
    }

    return undefined;
}

/**
 * Handles given error by logging it and optionally sending it to a Discord channel.
 * @param client - The Discord client instance
 * @param error - The unknown error
 */
export async function handleError(client: Client, error: unknown): Promise<void> {
    const normalizedError = error instanceof Error ? error : new Error(String(error));
    const errorStack = normalizedError.stack || normalizedError.message || String(error);

    log.error(normalizedError.message, normalizedError);

    if (!(config.ENABLE_LOGGING && config.ERROR_LOGGING_CHANNEL)) {
        return;
    }

    /**
     * Truncates the description if it exceeds the maximum length.
     * @param description - The description to truncate
     * @returns The truncated description
     */
    function truncateDescription(description: string): string {
        const maxLength = 4096;
        if (description.length <= maxLength) {
            return description;
        }
        const numTruncatedChars = description.length - maxLength;
        return `${description.slice(0, maxLength)}... ${numTruncatedChars} more`;
    }

    try {
        const channel = await getTextChannel(client, config.ERROR_LOGGING_CHANNEL!);
        if (!channel) {
            log.error(`Invalid logging channel ${config.ERROR_LOGGING_CHANNEL}`);
            return;
        }

        const typeOfError = normalizedError.name || 'Unknown Error';
        const timeOfError = `<t:${Math.floor(Date.now() / 1000)}>`;

        const fullString = [
            `From: \`${typeOfError}\``,
            `Time: ${timeOfError}`,
            '',
            'Error:',
            codeBlock('js', errorStack),
        ].join('\n');

        const container = ValkyrieContainer('Error', truncateDescription(fullString));
        await channel.send({
            allowedMentions: { parse: [] },
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    } catch (sendError) {
        log.error('Failed to send the error log', sendError);
    }
}
