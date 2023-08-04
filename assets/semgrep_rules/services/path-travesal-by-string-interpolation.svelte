<script>
function getThing(thing) {
    if (thing in thingContainer) {
        return thingContainer[thing];
    }
}
</script>

x

<script>
   async function x() {
    // ruleid: path-travesal-by-string-interpolation
    await fetch(`${env.API_HOSTNAME}/api/subscriptions/${subscriptionId}`, 1337);
    // ruleid: path-travesal-by-string-interpolation
    await fetch(`${env.API_HOSTNAME}/api/subscriptions/${subscriptionId}`);
    // ok: path-travesal-by-string-interpolation
    await fetch(`${env.API_HOSTNAME}/api/subscriptions/?s=${subscriptionId}`, 123);
}
</script>

<script>var unsafe = new URL(`${variable}/xyz`, constantOrVariable);</script>

<a href="{{ result.url }}">link</a>