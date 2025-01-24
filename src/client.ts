import {Client} from "eris";
import {logger} from "./logger.ts";

/**
 * Create the client with the Client configuration
 * @return {Client} The created client
 */
function create_client(): Client {
    logger.log('info', 'Starting')
    if (!process.env.TOKEN) throw new Error('TOKEN env is required');

    return new Client(
        process.env.TOKEN,
        {
            // J'ai abusé là
            intents: Number.parseInt(process.env.INTENTS || "0") || 0,
            disableEvents: {
                MESSAGE_DELETE_BULK: true,
                TYPING_START: true
            },
            getAllUsers: true,

            // Bot privé, donc une seule shard
            maxShards: 1,


            defaultImageFormat: "png",
            defaultImageSize: 1024,

            messageLimit: 100,
            allowedMentions: {
                everyone: false,
                repliedUser: false,
                roles: true,
                users: true
            }
        }
    );
}

export default create_client()