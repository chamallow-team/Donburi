import type ClientEvent from "../models/Event.ts";
import config from '../../config.json'
import {logger} from "../logger.ts";
import type {Member} from "eris";
import * as IncidentService from '../services/incident.service.ts'
import {INCIDENT_STATUS_IDS} from "../database.ts";

let timeout: Timer | null = null;

export default {
    name: "presenceUpdate",
    listener: async (member, old_presence) => {
        // If the guild isn't the one who is allowed, then fuck it
        if (member.guild.id !== config.server || !member?.status) return;

        // If this isn't the target, then, who cares?
        if (member.id !== config.target_id) return;

        if (member?.status === 'offline') await target_offline(member)
        else if (timeout) clearTimeout(timeout);
    }
} as ClientEvent<"presenceUpdate">

async function target_offline(member: Member) {
    let current_unresolved_incident = await IncidentService.getUnresolvedIncident();
    if (current_unresolved_incident) return;

    timeout = setTimeout(async () => {
        console.log("Creating the incident")
        try {
            let target = member.guild.members.get(member.id);
            // Resolved, no needs to flag the incident
            if (!target || target.status !== 'offline') return;

            let incident = await IncidentService.createIncident(
                `Détection automatique d'un incident technique`,
                true,
                INCIDENT_STATUS_IDS.Crash
            )

            await IncidentService.sendUpdateToDiscord(incident.incident_id)
        } catch (err) {
            logger.error(err);
        }
    }, 5_000) // wait 5 s
}