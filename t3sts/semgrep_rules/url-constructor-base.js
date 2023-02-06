// ruleid: url-constructor-base
var unsafe = new URL(variable, "https://brave.com");
// ruleid: url-constructor-base
var unsafe = new URL(variable + "xyz", constantOrVariable);
// ruleid: url-constructor-base
var unsafe = new URL(`${variable}/xyz`, constantOrVariable);
// ruleid: url-constructor-base
var unsafe = new URL(`/${variable}/xyz`, constantOrVariable);
// ruleid: url-constructor-base
var unsafe = new URL("https://brave.com" + variable, constantOrVariable);
// ruleid: url-constructor-base
var unsafe = new URL("/" + variable, constantOrVariable);
// ruleid: url-constructor-base
var unsafe = new URL("https://" + variable, constantOrVariable);
// ruleid: url-constructor-base
var unsafe = new URL("file" + variable, constantOrVariable);


// No base:

// ok: url-constructor-base
var notUnsafe0 = new URL(variable);
// ok: url-constructor-base
var notUnsafe1 = new URL(variable + "xyz");
// ok: url-constructor-base
var notUnsafe2 = new URL(`${variable}/xyz`);

// Unable to start with double forward slashes, double backslashes, https:// or mess with hostname

// ok: url-constructor-base
var notUnsafe3 = new URL(`/const`, location.origin);
// todook: url-constructor-base
var notUnsafe4 = new URL("?" + variable, constantOrVariable);
// todook: url-constructor-base
var notUnsafe5 = new URL(`/a${variable}/xyz`, "https://brave.com");
// todook: url-constructor-base
var notUnsafe6 = new URL("https://not.sure/" + variable, "https://brave.com");
// todook: url-constructor-base
var notUnsafe7 = new URL(`#${variable}`, constantOrVariable);

// ok: url-constructor-base
var notUnsafe8 = new URL("https://not.sure/" + variable, "https://brave.com");
if(notUnsafe8.origin !== "https://brave.com") {
    throw new Error("X");
}