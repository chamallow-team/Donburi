import path from 'path'
import {queryDirectory} from "./utils.ts";
import type Command from "../../models/Command.ts";
import {CommandPushStatus} from "../../models/Command.ts";
import {push_command} from "../../models/Command.ts";
import {logger} from "../../logger.ts";
import client from "../../client.ts";

export const commands: Command[] = [];

/**
 * Import all commands from the directory `src/interactions/commands`
 */
export async function queryCommands() {
    let commands_path = queryDirectory(
        path.join(__dirname, '../../interactions/commands'),
        'ts'
    );

    logger.debug(`Loading ${commands_path.length} commands`);

    await Promise.all(
        commands_path.map(async (command) =>
            commands.push((await import(command))?.default)
        )
    )
}

export async function push_commands_to_discord() {
    let old_commands = await client.getCommands();

    let actions;
    // Supprimer les commandes qui n'ont pas leur place
    actions = old_commands
        .filter((oc) => !commands.some(c => c.name === oc.name))
        .map(async function (command) {
            await client.deleteCommand(command.id)
        })
    await Promise.all(actions);
    logger.debug(`${actions.length} commands deleted`)

    // Créer/update les commandes
    actions = commands.map((command) => push_command(command, old_commands));
    actions = await Promise.all(actions);
    logger.debug(`${actions.filter(a => a == CommandPushStatus.Created).length} command(s) created`);
    logger.debug(`${actions.filter(a => a == CommandPushStatus.Updated).length} command(s) updated`);
    logger.debug(`${actions.filter(a => a == CommandPushStatus.NoChange).length} command(s) didn't changed a bit`);
}