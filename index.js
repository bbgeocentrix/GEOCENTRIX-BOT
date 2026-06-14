const {
default: makeWASocket,
useMultiFileAuthState
} = require("@whiskeysockets/baileys")

async function startBot() {

const { state, saveCreds } =
await useMultiFileAuthState("sessions")

const sock = makeWASocket({
auth: state
})

sock.ev.on("creds.update", saveCreds)

console.log("GEOCENTRIX-BOT STARTED")

}

startBot()
