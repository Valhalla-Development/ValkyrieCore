import { Category } from '@discordx/utilities';
import {
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { type Client, Discord, Slash } from 'discordx';

@Discord()
@Category('Miscellaneous')
export class Ping {
    /**
     * Get status emoji and description based on latency
     */
    private getLatencyStatus(ms: number): { emoji: string; status: string } {
        if (ms < 100) {
            return { emoji: '🟢', status: 'Excellent' };
        }
        if (ms < 200) {
            return { emoji: '🟡', status: 'Good' };
        }
        if (ms < 500) {
            return { emoji: '🟠', status: 'Fair' };
        }
        return { emoji: '🔴', status: 'Poor' };
    }

    /**
     * Build the ping information container
     */
    private buildPingContainer(client: Client, latency: number): ContainerBuilder {
        const apiLatency = Math.max(0, Math.round(client.ws.ping));
        const botStatus = this.getLatencyStatus(latency);
        const apiStatus = this.getLatencyStatus(apiLatency);

        // Calculate bot start time for uptime display
        const uptimeMs = client.uptime || 0;
        const botStartTime = Math.floor((Date.now() - uptimeMs) / 1000);

        const headerText = new TextDisplayBuilder().setContent(
            `# 🏓 **${client.user?.username} Metrics**`
        );

        const metricsText = new TextDisplayBuilder().setContent(
            [
                '> **🤖 Bot Response Time**',
                `> ${botStatus.emoji} \`${latency}ms\` - *${botStatus.status}*`,
                '',
                '> **🌐 Discord API Latency**',
                `> ${apiStatus.emoji} \`${apiLatency}ms\` - *${apiStatus.status}*`,
                '',
                '> **⏱️ Uptime**',
                `> 🕒 <t:${botStartTime}:R>`,
                '',
            ].join('\n')
        );

        return new ContainerBuilder()
            .addTextDisplayComponents(headerText)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(metricsText);
    }

    /**
     * Display bot status and performance metrics
     */
    @Slash({ description: 'Display bot status and performance metrics.' })
    async ping(interaction: CommandInteraction, client: Client): Promise<void> {
        if (!interaction.channel) {
            return;
        }

        const start = Date.now();
        await interaction.deferReply();
        const end = Date.now();

        const botLatency = Math.max(0, end - start);

        const container = this.buildPingContainer(client, botLatency);

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
