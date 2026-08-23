import { Category, type ICategory } from '@discordx/utilities';
import {
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    type SelectMenuComponentOptionData,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    type StringSelectMenuInteraction,
    TextDisplayBuilder,
} from 'discord.js';
import type { Client } from 'discordx';
import {
    type DApplicationCommand,
    Discord,
    MetadataStorage,
    SelectMenuComponent,
    Slash,
} from 'discordx';
import { capitalise, deletableCheck, getCommandIds, ValkyrieComponent } from '../../utils/Util.js';

// Map categories to their emojis
const categoryEmojis: Record<string, string> = {
    miscellaneous: '🔧',
};

/**
 * Get the emoji for a category, defaults to wrench
 */
function getCategoryEmoji(category: string): string {
    return categoryEmojis[category.toLowerCase()] || '🔧';
}

/**
 * Pull all unique categories from registered commands and format them
 */
function getCategoriesAsOptions(): SelectMenuComponentOptionData[] {
    const uniqueCategories = Array.from(
        new Set(
            MetadataStorage.instance.applicationCommands
                .filter((cmd: DApplicationCommand & ICategory) => cmd.category)
                .map((cmd: DApplicationCommand & ICategory) => cmd.category as string)
        )
    );

    return uniqueCategories.map((cat) => ({
        label: `${getCategoryEmoji(cat)} ${cat}`,
        value: `help-${cat.toLowerCase()}`,
    }));
}

/**
 * Build the formatted command list for a specific category
 */
async function buildCommandsList(
    category: string,
    client: Client,
    guildId: string
): Promise<string> {
    // Filter commands by category, excluding the help command itself
    const filteredCommands = MetadataStorage.instance.applicationCommands.filter(
        (cmd: DApplicationCommand & ICategory) =>
            cmd.category?.toLowerCase() === category.toLowerCase() &&
            cmd.name?.toLowerCase() !== 'help'
    );

    const commandIds = await getCommandIds(client, guildId);
    return filteredCommands
        .map((cmd) => {
            const commandId = commandIds[cmd.name];
            // Use Discord's command mention format if we have the ID, otherwise just capitalize
            const commandMention = commandId ? `</${cmd.name}:${commandId}>` : capitalise(cmd.name);
            return `> 🔹 **${commandMention}**\n> \u200b \u200b \u200b *${cmd.description}*`;
        })
        .join('\n');
}

/**
 * The main container builder - handles all three display modes based on what options are passed
 */
async function buildHelpContainer(
    client: Client,
    guildId: string,
    options: {
        category?: string;
        selectMenu?: StringSelectMenuBuilder;
        showCategorySelector?: boolean;
    } = {}
): Promise<ContainerBuilder> {
    const { category, selectMenu, showCategorySelector } = options;

    // Every help view starts with this header
    const headerText = new TextDisplayBuilder().setContent(
        [
            `# 🚀 **${client.user?.username} Command Center**`,
            `> 👋 **Welcome to ${client.user?.username}'s command hub!**`,
        ].join('\n')
    );

    const container = new ContainerBuilder()
        .addTextDisplayComponents(headerText)
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large));

    if (showCategorySelector) {
        // Initial view - show category picker
        const selectText = new TextDisplayBuilder().setContent(
            [
                '## 📂 **Command Categories**',
                '',
                '> **Choose a category below to explore available commands**',
                '> Each category contains specialized commands for different features',
            ].join('\n')
        );

        container
            .addTextDisplayComponents(selectText)
            .addActionRowComponents((row) => row.addComponents(selectMenu!));
    } else if (category) {
        // Category view - show commands for the selected category
        const commandsList = await buildCommandsList(category, client, guildId);
        const commandsText = new TextDisplayBuilder().setContent(
            [
                `## ${getCategoryEmoji(category)} **${capitalise(category)} Commands**`,
                '',
                commandsList,
                '',
            ].join('\n')
        );

        container.addTextDisplayComponents(commandsText);

        // Add the dropdown back so users can switch categories
        if (selectMenu) {
            container
                .addSeparatorComponents((separator) =>
                    separator.setSpacing(SeparatorSpacingSize.Small)
                )
                .addActionRowComponents((row) => row.addComponents(selectMenu));
        }
    }

    return container;
}

/**
 * Handle the initial /help command
 */
async function handleHelp(
    interaction: CommandInteraction,
    client: Client,
    selectMenu: StringSelectMenuBuilder
) {
    const cats = getCategoriesAsOptions();

    if (cats.length <= 1) {
        // Single category or no categories
        if (cats.length === 0) {
            return;
        }

        const selectedCategory = cats[0]!.value.replace(/^help-/, '').toLowerCase();
        const container = await buildHelpContainer(client, interaction.guildId!, {
            category: selectedCategory,
        });

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    } else {
        // Multiple categories
        const container = await buildHelpContainer(client, interaction.guildId!, {
            selectMenu,
            showCategorySelector: true,
        });

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}

/**
 * Handle when someone picks a category from the dropdown
 */
async function handleSelectMenu(
    interaction: StringSelectMenuInteraction,
    client: Client,
    selectMenu: StringSelectMenuBuilder
) {
    // Only let the person who ran the command use the dropdown
    const sourceInteraction = interaction.message.interaction;
    if (!sourceInteraction || interaction.user.id !== sourceInteraction.user.id) {
        await ValkyrieComponent(
            interaction,
            'Error',
            'Only the command executor can interact with this menu!\n\n*Run the command yourself to access the help menu*',
            true
        );
        return;
    }

    const [selectedValue] = interaction.values;
    if (!selectedValue) {
        return deletableCheck(interaction.message, 0);
    }

    // Extract the category name from the dropdown value
    const selectedCategory = selectedValue.replace(/^help-/, '').toLowerCase();
    const container = await buildHelpContainer(client, interaction.guildId!, {
        category: selectedCategory,
        selectMenu,
    });

    await interaction.update({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}

@Discord()
@Category('Miscellaneous')
export class Help {
    /**
     * Create the dropdown menu with current categories.
     */
    private createSelectMenu(): StringSelectMenuBuilder {
        return new StringSelectMenuBuilder()
            .setCustomId('helpSelect')
            .setPlaceholder('🎯 Choose a command category...')
            .addOptions(...getCategoriesAsOptions());
    }

    /**
     * Main help command - shows either category picker or single category commands
     */
    @Slash({ description: 'Display list of commands.' })
    async help(interaction: CommandInteraction, client: Client) {
        if (!interaction.channel) {
            return;
        }

        const selectMenu = this.createSelectMenu();
        await handleHelp(interaction, client, selectMenu);
    }

    /**
     * Handles category selection from the dropdown
     */
    @SelectMenuComponent({ id: 'helpSelect' })
    async handle(interaction: StringSelectMenuInteraction, client: Client): Promise<void> {
        const selectMenu = this.createSelectMenu();
        await handleSelectMenu(interaction, client, selectMenu);
    }
}
