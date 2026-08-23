import { Events } from 'discord.js';
import { type Client, Discord, On } from 'discordx';
import { updateStatus } from '../utils/Util.js';

/**
 * Discord.js GuildMemberAdd event handler.
 */
@Discord()
export class GuildMemberAdd {
    /**
     * Executes when the GuildMemberAdd event is emitted.
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: Events.GuildMemberAdd })
    onGuildMemberAdd(client: Client) {
        // Set activity
        updateStatus(client);
    }
}
