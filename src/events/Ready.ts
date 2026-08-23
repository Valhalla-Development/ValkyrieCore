import colors from '@colors/colors/safe';
import { Events, OAuth2Scopes, PermissionsBitField, version } from 'discord.js';
import { type Client, Discord, Once } from 'discordx';
import si from 'systeminformation';
import { version as botVersion } from '../../package.json' with { type: 'json' };
import { updateStatus } from '../utils/Util.js';

/**
 * Discord.js Ready event handler.
 */
@Discord()
export class Ready {
    /**
     * Executes when the ready event is emitted.
     * @param client - The Discord client.
     * @returns void
     */
    @Once({ event: Events.ClientReady })
    async onReady([client]: [Client]) {
        // Init slash commands
        await client.initApplicationCommands();

        async function logStartup(): Promise<void> {
            const memory = await si.mem();
            const cpu = await si.cpu();
            const totalMemory = Math.floor(memory.total / 1024 / 1024);
            const realMemUsed = Math.floor((memory.used - memory.buffcache) / 1024 / 1024);

            const divider = '*~'.repeat(20);
            const inviteUrl = client.generateInvite({
                permissions: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                ],
                scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
            });
            const sections = [
                {
                    content: [
                        colors.bold(colors.rainbow(divider)),
                        colors.bold(colors.cyan(`${client.user?.username} is online and ready!`)),
                        colors.bold(colors.rainbow(divider)),
                    ],
                },
                {
                    content: [
                        colors.white(`${colors.red('>>')} Users: `) +
                            colors.red(
                                client.guilds.cache
                                    .reduce((acc: number, guild) => acc + guild.memberCount, 0)
                                    .toLocaleString('en')
                            ),
                        colors.white(`${colors.green('>>')} Guilds: `) +
                            colors.green(client.guilds.cache.size.toLocaleString('en')),
                        colors.white(`${colors.yellow('>>')} Slash Commands: `) +
                            colors.yellow(`${client.application?.commands.cache.size ?? 0}`),
                        colors.white(`${colors.blue('>>')} Events: `) +
                            colors.blue(client.eventNames().length.toString()),
                    ],
                    title: `${client.user?.username} Stats`,
                },
                {
                    content: [
                        colors.white(`${colors.magenta('>>')} Node: `) +
                            colors.magenta(process.version) +
                            colors.white(' on ') +
                            colors.magenta(`${process.platform} ${process.arch}`),
                        colors.white(`${colors.cyan('>>')} Memory: `) +
                            colors.cyan(
                                `${realMemUsed.toLocaleString('en')}/${totalMemory.toLocaleString('en')} MB`
                            ),
                        colors.white(`${colors.red('>>')} CPU: `) +
                            colors.red(`${cpu.vendor} ${cpu.brand}`),
                        colors.white(`${colors.yellow('>>')} Discord.js: `) +
                            colors.yellow(`v${version}`),
                        colors.white(`${colors.blue('>>')} Version: `) +
                            colors.blue(`v${botVersion}`),
                    ],
                    title: `${client.user?.username} Specs`,
                },
                {
                    content: [
                        colors.white(`${colors.blue('>>')} `) +
                            colors.underline(colors.blue(inviteUrl)),
                    ],
                    title: `${client.user?.username} Invite Link`,
                },
            ];

            console.log(`\n${colors.bold('='.repeat(50))}`);
            for (const section of sections) {
                if (section.title) {
                    console.log(colors.bold(colors.magenta(`\n>>> ${section.title} <<<`)));
                }
                for (const line of section.content) {
                    console.log(colors.bold(line));
                }
            }
            console.log(colors.bold('='.repeat(50)));
        }

        await logStartup();

        // Set activity
        updateStatus(client);
    }
}
