import type ClientEvent from "../models/Event.ts";
import {logger} from "../logger.ts";

export default {
    name: "ready",
    listener: () => {
        logger.info("Client ready");
    }
} as ClientEvent<"ready">;