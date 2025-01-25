import type ClientEvent from "../models/Event.ts";
import {logger} from "../logger.ts";
import {push_commands_to_discord} from "../controllers/importers/commands.ts";

export default {
    name: "ready",
    listener: async () => {
        logger.info("Client ready");

        await push_commands_to_discord()
    }
} as ClientEvent<"ready">;