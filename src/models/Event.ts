import Eris, {type ClientEvents} from "eris";

export default interface ClientEvent<K extends keyof Eris.ClientEvents> {
    name: K,
    listener: (...args: ClientEvents[K]) => void;
}