import type ClientEvent from "../models/Event.ts";
import config from '../../config.json'

let status_message_id: string | null = null;

export default {
    name: "guildMemberUpdate",
    listener: async (guild, old_member, new_member) => {
        // If the guild isn't the one who is allowed, then fuck it
        if (guild.id !== config.server || !new_member) return;

        // If this isn't the target, then, who cares?
        if (old_member.id !== config.target_id) return;


    }
} as ClientEvent<"guildMemberUpdate">