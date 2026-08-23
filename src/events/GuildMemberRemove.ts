import { Events } from 'discord.js';
import { type Client, Discord, On } from 'discordx';
import { updateStatus } from '../utils/Util.js';

/**
 * Discord.js GuildMemberRemove event handler.
 */
@Discord()
export class GuildMemberRemove {
    /**
     * Executes when the GuildMemberRemove event is emitted.
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: Events.GuildMemberRemove })
    onGuildMemberRemove(client: Client) {
        // Set activity
        updateStatus(client);
    }
}
