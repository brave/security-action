async function x() {
    // ruleid: path-travesal-by-string-interpolation
    await fetch(`${env.API_HOSTNAME}/api/subscriptions/${subscriptionId}`, 1337);
    // ruleid: path-travesal-by-string-interpolation
    await fetch(`${env.API_HOSTNAME}/api/subscriptions/${subscriptionId}`);
    // ok: path-travesal-by-string-interpolation
    await fetch(`${env.API_HOSTNAME}/api/subscriptions/?s=${subscriptionId}`, 123);
}