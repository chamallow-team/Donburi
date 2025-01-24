import {logger} from "../logger.ts";
import type ClientEvent from "../models/Event.ts";

export default {
    name: "disconnect",
    listener: () => {
        console.log('[info] Client disconnected');
    }
} as ClientEvent<"disconnect">