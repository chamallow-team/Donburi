function stop_client() {
    // Tenter de stopper les shards ou le logger provoque un exit code 1
    console.log('SIGINT received, stopping gracefully');
    process.exit(0)
}

export default function () {
    process.on("SIGINT", stop_client);
    process.on("SIGTERM", stop_client);
}