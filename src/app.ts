import {logger} from "./logger.ts";
import create_client from "./client.ts";

logger.log('info', 'Starting')

const client = create_client();

client.connect()
    .then(() => logger.info('Client finished'));