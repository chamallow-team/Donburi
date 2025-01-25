import prisma from '../database.ts'
import {v4 as uuid} from 'uuid';
import client from "../client.ts";
import config from "../../config.json";
import {type AnyGuildTextableChannel, type EmbedOptions, NewsChannel, TextChannel} from "eris";
import {logger} from "../logger.ts";

export function getUnresolvedIncident() {
    return prisma.incident.findFirst({
        where: {
            resolved: {
                equals: false
            }
        },
        include: {
            updates: {
                include: {
                    status: true
                }
            },
        }
    })
}

export function getIncident(incident_id: string) {
    prisma.incident.findUnique({
        where: {
            incident_id
        },
        include: {
            updates: {
                include: {
                    status: true
                }
            },
        }
    })
}

export async function createIncident(
    message: string,
    automatic: boolean,
    status_id: string
) {
    let incident_id = uuid();

    let incident = await prisma.incident.create({
        data: {
            incident_id,
            discord_message_id: null
        }
    })

    await createNewIncidentUpdate(incident_id, message, automatic, status_id);

    return incident;
}

export function createNewIncidentUpdate(
    incident_id: string,
    message: string,
    automatic: boolean,
    status_id: string
) {
    return prisma.incidentUpdate.create({
        data: {
            update_id: uuid(),
            message, automatic,
            status: {
                connect: {status_id}
            },
            incident: {
                connect: {incident_id}
            }
        }
    })
}

export function defineUpdateMessage(incident_id: string, message_id: string | null) {
    return prisma.incident.update({
        data: {discord_message_id: message_id},
        where: {
            incident_id
        }
    })
}

type Incident = ({
    updates: ({ status: { status_id: string, status_label: string } } & {
        incident_id: string,
        update_id: string,
        message: string,
        automatic: boolean,
        status_id: string
    })[]
} & { incident_id: string, discord_message_id: string | null, resolved: boolean });

function generate_incident_message(incident: Incident): EmbedOptions[] {
    let updates = `🔎 **Status:** \`${incident.updates[incident.updates.length - 1]?.status?.status_label || 'UNKNOWN'}\`\n❔ **Résolu:** ${incident.resolved ? '✅' : '❌'}\n🏷️ **Informations:**\n\n`;

    const MAX_UPDATE_LENGTH = 200;

    let last_update_status = "unknown";
    for (let [index, {automatic, message, status}] of incident.updates.entries()) {
        if (updates.length > 2048) break;

        let t = `${automatic ? '🤖' : '** **'} **${status.status_label}** - ${message}`.slice(0, MAX_UPDATE_LENGTH);

        updates += ((index === incident.updates.length - 1)
            || updates.length + MAX_UPDATE_LENGTH > 2048)
            ? t : `~~${t}~~`;
        last_update_status = status.status_label;
    }

    function get_color() {
        switch (last_update_status) {
            case "Crash":
            case "Update":
                return 11413287;
            case "Resolved":
                return 2600544;
            default:
                return 2829617
        }
    }

    return [
        {
            author: {
                name: `ID: ${incident.incident_id}`,
            },
            color: get_color(),
            description: updates,
            footer: {
                text: `Dernière mise à jour: ${(new Date()).toLocaleString()}`
            }
        }
    ]
}

export async function sendUpdateToDiscord(incident_id: string) {
    let incident = await prisma.incident.findUnique({
        where: {
            incident_id
        },
        include: {
            updates: {
                include: {
                    status: true
                }
            }
        }
    })

    if (!incident) return;

    let embeds = generate_incident_message(incident)

    // try to get the channel
    try {
        let channel = client.getChannel(config.status_channel);
        if (!channel || !((channel instanceof TextChannel) || (channel instanceof NewsChannel))) return;

        if (incident.discord_message_id) {
            let message = await channel.getMessage(incident.discord_message_id);

            if (!message) await create_incident_message(channel, embeds, incident_id)
            else {
                await message.edit({
                    embeds
                })
            }
        } else {
            await create_incident_message(channel, embeds, incident_id)
        }
    } catch (err) {
        logger.error(err);
    }
}

async function create_incident_message(channel: AnyGuildTextableChannel, embeds: EmbedOptions[], incident_id: string) {
    let message = await client.createMessage(channel.id, {embeds});

    await prisma.incident.update({
        data: {discord_message_id: message.id},
        where: {incident_id}
    })
}