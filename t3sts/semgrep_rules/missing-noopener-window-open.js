// ruleid: missing-noopener-window-open-native
window.open("something")
// ruleid: missing-noopener-window-open-native
window.open("ciao", "biao")
// ruleid: missing-noopener-window-open-native
open("ciao", "ciao")

// ok: missing-noopener-window-open-native
window.open("ciao", "bao", "noopener", "asd")
