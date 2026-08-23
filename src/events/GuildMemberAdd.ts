import { Events } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';
import { updateStatus } from '../utils/Util.js';

/**
 * Discord.js GuildMemberAdd event handler.
 */
@Discord()
export class GuildMemberAdd {
    /**
     * Executes when the GuildMemberAdd event is emitted.
     * @param _payload - Event arguments from discordx.
     * @param client - The Discord client.
     */
    @On({ event: Events.GuildMemberAdd })
    onGuildMemberAdd(_payload: ArgsOf<'guildMemberAdd'>, client: Client) {
        // Set activity
        updateStatus(client);
    }
}
