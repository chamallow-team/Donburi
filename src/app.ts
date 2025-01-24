import {logger} from "./logger.ts";
import type ClientEvent from "./models/Event.ts";
import Eris from "eris";
import client from "./client.ts";
import create_process_handles from "./process.ts";


function register_event<K extends keyof Eris.ClientEvents>(event: ClientEvent<K>) {
    client.on(event.name, event.listener);
}

import ready from "./events/ready.ts";
import disconnect from "./events/disconnect.ts";

register_event(ready)
register_event(disconnect)

create_process_handles()

client.connect()
    .then(() => logger.info('Client created'));
