import { Events, OAuth2Scopes, PermissionsBitField, version } from 'discord.js';
import { type Client, Discord, Once } from 'discordx';
import si from 'systeminformation';
import { version as botVersion } from '../../package.json' with { type: 'json' };
import { log } from '../utils/Console.js';
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

        if (!client.user) {
            return;
        }

        const memory = await si.mem();
        const cpu = await si.cpu();
        const totalMemory = Math.floor(memory.total / 1024 / 1024);
        const realMemUsed = Math.floor((memory.used - memory.buffcache) / 1024 / 1024);
        const inviteUrl = client.generateInvite({
            permissions: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
            ],
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
        });

        const heapMb = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);
        const shardIds = [...client.ws.shards.keys()];
        const clustered =
            'cluster' in client && client.cluster
                ? `Cluster ${(client.cluster as { id: number }).id}`
                : 'single process';
        const memPctLabel =
            totalMemory > 0 ? `  (${((realMemUsed / totalMemory) * 100).toFixed(1)}%)` : '';

        log.ready({
            boot: `${process.uptime().toFixed(2)}s`,
            channels: client.channels.cache.size,
            cluster: clustered,
            commands: client.application?.commands.cache.size ?? 0,
            cpu: `${cpu.vendor} ${cpu.brand}`,
            discord: `v${version}`,
            events: client.eventNames().length,
            guilds: client.guilds.cache.size,
            heap: `${heapMb.toLocaleString('en')} MB`,
            invite: inviteUrl,
            memory: `${realMemUsed.toLocaleString('en')} / ${totalMemory.toLocaleString('en')} MB${memPctLabel}`,
            name: client.user.username,
            pid: String(process.pid),
            runtime: process.versions.bun
                ? `Bun ${process.versions.bun} · ${process.platform} ${process.arch}`
                : `${process.version} · ${process.platform} ${process.arch}`,
            shards: shardIds.length > 0 ? `${shardIds.length}  ·  ${shardIds.join(', ')}` : '1',
            users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
            version: `v${botVersion}`,
        });

        // Set activity
        updateStatus(client);
    }
}
