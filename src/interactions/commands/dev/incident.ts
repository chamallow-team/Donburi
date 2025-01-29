import type Command from "../../../models/Command.ts";
import {
    type CommandInteraction,
    Constants,
    type InteractionDataOptions, type InteractionDataOptionsString,
    type InteractionDataOptionsSubCommand
} from "eris";

import prisma, {INCIDENT_STATUS_IDS} from "../../../database.ts";
import client from "../../../client.ts";
import {getIncident, getIncidentList, getIncidentsCount} from "../../../services/incident.service.ts";
import {EMBED_COLOR} from "../../../models/colors.ts";
import type {Incident} from "../../../services/incident.service.ts";
import {getModerationChannel} from "../../../services/moderation.service.ts";
import type {IncidentUpdate} from "@prisma/client";

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
                name: "lookup",
                description: "Afficher un incident",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
                    {
                        name: "incident_id",
                        description: "ID de l'incident",
                        type: Constants.ApplicationCommandOptionTypes.STRING,
                        required: true,
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
                name: "create",
                description: "Créer un nouvel incident",
                type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
                options: [
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
        if (!interaction.data?.options) {
            await interaction.createMessage({
                content: "> ❌ **ERROR** Une sous-commande doit être sélectionnée"
            })
        }
        const subcommand = interaction.data?.options as InteractionDataOptions[];

        switch ((subcommand || [])[0]?.name) {
            case "list": {
                await incident_list(interaction);
                break
            }
            case "lookup": {
                const subcommand_options = subcommand[0] as InteractionDataOptionsSubCommand;
                await lookup_incident(interaction, subcommand_options?.options as InteractionDataOptionsString[]);
                break;
            }
            default: {
                await interaction.createMessage({
                    content: "> ❌ **ERROR** Cette sous-commande n'est pas implémentée"
                })
            }
        }
    }
} as unknown as Command

export const INCIDENT_LIST_TAKES = 10;

function getIncidentEmoji(incident: Incident) {
    if (incident.resolved) return "✅"
    else return "💥"
}

function getIncidentUpdateEmoji(incident: IncidentUpdate) {
    if (incident.status_id !== INCIDENT_STATUS_IDS.Resolved) return "💥"
    else return "✅"
}

async function deferInteraction(interaction: CommandInteraction) {
    let flags: number = Constants.MessageFlags.EPHEMERAL;
    if (await getModerationChannel(interaction.channel.id)) flags = 0;

    await interaction.defer(flags)
}


async function incident_list(interaction: CommandInteraction) {
    await deferInteraction(interaction);

    const incidents = await getIncidentList(0, INCIDENT_LIST_TAKES)
    const incident_count = await getIncidentsCount();

    const embed = {
        color: EMBED_COLOR,
        description: "**Incidents:** (du plus récent au plus ancien)\n\n"
            + incidents.map((i) => `${getIncidentEmoji(i)} - **${i.updatedAt.toLocaleString()}** - ${i.incident_id}`)
                .join("\n"),
        footer: {
            text: `Page 1/${incident_count}`
        },
        author: {
            name: interaction.member?.globalName || interaction.member?.username || "ERROR",
            icon_url: interaction.member?.dynamicAvatarURL("png", 1024)
        }
    }

    await interaction.createFollowup({
        embeds: [embed],
        components: [
            {
                type: Constants.ComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        custom_id: "INCIDENT_LIST_BACK&page=0",
                        style: Constants.ButtonStyles.SECONDARY,
                        label: "<",
                        disabled: incident_count <= 1,
                    },
                    {
                        type: Constants.ComponentTypes.BUTTON,
                        custom_id: "INCIDENT_LIST_NEXT&page=0",
                        style: Constants.ButtonStyles.SECONDARY,
                        label: ">",
                        disabled: incident_count <= 1,
                    }
                ]
            }
        ]
    })
}

async function lookup_incident(interaction: CommandInteraction, options: InteractionDataOptionsString[]) {
    let incident_id = options[0]?.value;
    if (!incident_id) {
        await interaction.createMessage({
            content: "> ❌ **ERROR** Vous devez donner l'identifiant d'un incident."
        })
        return;
    }

    await deferInteraction(interaction);

    const incident = await getIncident(incident_id);

    if (!incident) {
        await interaction.createFollowup({
            content: `> 🔎 **404** Aucun incident avec l'ID \`${incident_id}\` n'as été trouvé.`
        })
        return
    }

    const embed = {
        color: EMBED_COLOR,
        author: {
            name: interaction.member?.globalName || interaction.member?.username || "ERROR",
            icon_url: interaction.member?.dynamicAvatarURL("png", 1024)
        },
        description: `**Résolu:** ${incident.resolved ? "✅" : '❌'}\n\n**Mises à jours:**\n`
            + incident.updates.map(u => `${u.automatic ? '🤖' : '** **'} ${getIncidentUpdateEmoji(u)} -- ${u.update_date.toLocaleString('fr-FR')}\n${u.message.slice(0, 200)}`),
        footer: {
            text: `Dernière mise à jour: ${incident.updatedAt.toLocaleString("fr-FR")}`,
        }
    }


    await interaction.createFollowup({
        embeds: [embed],
    })
}