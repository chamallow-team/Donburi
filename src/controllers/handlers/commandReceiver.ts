import {type CommandInteraction} from "eris";
import client from "../../client.ts";
import {commands} from "../importers/commands.ts";
import type Command from "../../models/Command.ts";
import {ResponseType} from "../../models/Command.ts";

export default async function (interaction: CommandInteraction) {
    // Search command
    let command: Command | undefined = commands.find((c) => c.name === interaction.data.name);

    if (!command) {
        await client.createInteractionResponse(
            interaction.id,
            interaction.token,
            {
                type: ResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: "> 🔎 **Cette commande n'existe pas**\nIl semblerait que cette commande n'existe plus, redémarrez Discord pour voir les changements"
                }
            }
        )
        return;
    }

    // Call the command
    await command.listener(interaction);
}