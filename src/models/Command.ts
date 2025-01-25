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
            || command.config.dmPermission !== old.dmPermission
            || command.config.defaultMemberPermissions !== old.defaultMemberPermissions
            || command.config.options !== old.options
            || command.config.type !== old.type;

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
    PING: 1 as InteractionResponseTypes,
    APPLICATION_COMMAND: 2 as InteractionResponseTypes,
    MESSAGE_COMPONENT: 3 as InteractionResponseTypes,
    APPLICATION_COMMAND_AUTOCOMPLETE: 4 as InteractionResponseTypes,
    MODAL_SUBMIT: 5 as InteractionResponseTypes,
}