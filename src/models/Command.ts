import {
    ApplicationCommand,
    type ApplicationCommandCreateOptions, type ApplicationCommandEditOptions, type ApplicationCommandTypes,
    type CommandInteraction,
    type CommandOptions,
    type InteractionResponseTypes,
    Permission,
} from "eris";
import client from "../client";


export default interface Command {
    name: string,
    config: {
        description?: string,
        options?: CommandOptions[],
        defaultMemberPermissions?: BigInt | Number | String | Permission,
        dmPermission?: Boolean,
        type?: Number
    }

    listener: (interaction: CommandInteraction) => void | Promise<void>,
}

export enum CommandPushStatus {
    Created,
    Updated,
    NoChange,
}

export async function push_command(command: Command, old_commands: ApplicationCommand<false>[]): Promise<CommandPushStatus> {
    let old = old_commands.find((c) => c.name === command.name)
    if (old) {
        // Update
        // Check if the command NEEDS to be updated
        let need_update = command.config.description !== old.description
            || (command.config.dmPermission && command.config.dmPermission !== old.dmPermission)
            || (command.config.defaultMemberPermissions && command.config.defaultMemberPermissions !== old.defaultMemberPermissions)
            || (command.config.type && command.config.type !== old.type);
        
        if (need_update) {
            await client.editCommand(
                old.id,
                {
                    ...command.config,
                    name: command.name
                } as ApplicationCommandEditOptions<false>
            )
            return CommandPushStatus.Updated
        }

        return CommandPushStatus.NoChange
    } else {
        await client.createCommand(
            {
                ...command.config,
                name: command.name
            } as ApplicationCommandCreateOptions<false>
        )
        return CommandPushStatus.Created
    }
}

export const ResponseType = {
    PONG: 1 as InteractionResponseTypes,
    CHANNEL_MESSAGE_WITH_SOURCE: 4 as InteractionResponseTypes,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5 as InteractionResponseTypes,
    DEFERRED_UPDATE_MESSAGE: 6 as InteractionResponseTypes,
    UPDATE_MESSAGE: 7 as InteractionResponseTypes,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8 as InteractionResponseTypes,
    MODAL: 9 as InteractionResponseTypes,
    PREMIUM_REQUIRED: 10 as InteractionResponseTypes,
    LAUNCH_ACTIVITY: 12 as InteractionResponseTypes,
}