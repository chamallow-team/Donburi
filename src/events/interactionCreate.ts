import type ClientEvent from "../models/Event.ts";
import {CommandInteraction} from "eris";
import commandReceiver from "../controllers/handlers/commandReceiver.ts";

export default {
    name: "interactionCreate",
    listener: async (interaction) => {
        if (interaction instanceof CommandInteraction) {
            await commandReceiver(interaction);
        }
    }
} as ClientEvent<"interactionCreate">