import {logger} from "./logger.ts";
import type ClientEvent from "./models/Event.ts";
import Eris from "eris";
import client from "./client.ts";
import create_process_handles from "./process.ts";
import {queryCommands} from './controllers/importers/commands.ts'
import {init_database} from "./database.ts";

await init_database()

function register_event<K extends keyof Eris.ClientEvents>(event: ClientEvent<K>) {
    client.on(event.name, event.listener);
}

import ready from "./events/ready.ts";
import disconnect from "./events/disconnect.ts";
import interactionCreate from "./events/interactionCreate.ts";
import presenceUpdate from "./events/presenceUpdate.ts";

register_event(ready)
register_event(disconnect)
register_event(interactionCreate)
register_event(presenceUpdate)

logger.info("Querying and loading interactions...")
await queryCommands();
logger.info("Interactions ready")

create_process_handles()

try {
    client.connect()
        .then(() => logger.info('Client created'));
} catch (error) {
    logger.error(error);
}