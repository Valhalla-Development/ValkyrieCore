import { type CommandInteraction, PermissionsBitField } from 'discord.js';
import type { GuardFunction } from 'discordx';
import { ValkyrieComponent } from '../utils/Util.js';

/**
 * Checks if the interaction user has the required permissions before executing a command.
 * @param requiredPermissions An array of bigint values representing the required permissions.
 * @returns A GuardFunction to be used as middleware in Discord interactions.
 */
export function UserHasPerm(requiredPermissions: bigint[]): GuardFunction<CommandInteraction> {
    return async (interaction, _client, next) => {
        const permissions = interaction.member?.permissions as PermissionsBitField | undefined;
        const missingPermissions = requiredPermissions.filter(
            (permission) => !permissions?.has(permission)
        );

        if (missingPermissions.length > 0) {
            const permissionNames = new PermissionsBitField(missingPermissions).toArray();

            await ValkyrieComponent(
                interaction,
                'Error',
                `You lack the following permissions required for this action: \`${permissionNames.join(', ')}\``,
                true
            );
            return;
        }

        await next();
    };
}
