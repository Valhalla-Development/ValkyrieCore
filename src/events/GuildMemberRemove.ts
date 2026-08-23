import { Events } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';
import { updateStatus } from '../utils/Util.js';

/**
 * Discord.js GuildMemberRemove event handler.
 */
@Discord()
export class GuildMemberRemove {
    /**
     * Executes when the GuildMemberRemove event is emitted.
     * @param _payload - Event arguments from discordx.
     * @param client - The Discord client.
     */
    @On({ event: Events.GuildMemberRemove })
    onGuildMemberRemove(_payload: ArgsOf<'guildMemberRemove'>, client: Client) {
        // Set activity
        updateStatus(client);
    }
}
