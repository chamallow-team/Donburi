import type Command from "../../../models/Command.ts";
import {type CommandInteraction, Constants} from "eris";

export default {
    name: "incident",
    config: {
        dmPermission: false,
        description: "🏷️ Gérer les incidents techniques",
        defaultMemberPermissions: 8,
        options: [
            {
                name: "resolve",
                description: "Résoudre un incident",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "incident_id",
                        description: "ID de l'incident",
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true,
                    },
                    {
                        name: "message",
                        description: "Message",
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: false,
                    },
                ],
            },
            {
                name: "update",
                description: "Mettre à jour un incident",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "incident_id",
                        description: "ID de l'incident",
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true,
                    },
                    {
                        name: "message",
                        description: "Message",
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true,
                    },
                    {
                        name: "status",
                        description: "Statut",
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true,
                    },
                ],
            },
            {
                name: "list",
                description: "Lister les incidents",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: []
            },
        ],
    },

    listener: async function (interaction: CommandInteraction) {
        // TODO chaque subcommands (fuck...)
    }
} as unknown as Command