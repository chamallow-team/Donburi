import prisma from '../database.ts'
import {v4 as uuid} from 'uuid';

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

export interface IncidentUpdate {
    incident_id?: string,
    message: string,
    automatic: boolean,
    status_id: string
}

export async function createIncident(
    message: string,
    automatic: boolean,
    status_id: string
) {
    let incident_id = uuid();

    await prisma.incident.create({
        data: {
            incident_id,
            discord_message_id: null
        }
    })

    await createNewIncidentUpdate(incident_id, message, automatic, status_id);
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