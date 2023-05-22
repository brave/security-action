export function getThing(thing) {
    // ruleid: not-using-hasownproperty-proto-access
    if (thing in thingContainer) {
        return thingContainer[thing];
    }
}