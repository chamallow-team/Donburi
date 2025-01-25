import client from "../../client.ts";
import {type CommandInteraction} from "eris";
import type Command from "../../models/Command.ts";
import {ResponseType} from "../../models/Command.ts";

export default {
    name: "hello",
    config: {
        description: "Good morning",
        options: [],
    },

    listener: async (interaction: CommandInteraction) => {
        await client.createInteractionResponse(
            interaction.id,
            interaction.token,
            {
                type: ResponseType.APPLICATION_COMMAND,
                data: {
                    content: "Hello World!",
                }
            },
        )
    }
} as Command;