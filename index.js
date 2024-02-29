const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');
require('dotenv').config()

let client;

async function startSession() {
  try {
    client = new Client({
      authStrategy: new LocalAuth({
        clientId: "And3ers0n"
      })
    });

    client.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', async () => {
      console.log('Client is ready!');
    });

    process.on('SIGINT', async () => {
      console.log('(SIGINT) Shutting down...');
      await client.destroy();
      console.log('Client destroyed');
      process.exit(0);
    });

    await client.initialize();
  } catch (error) {
    console.error('Error starting session:', error);
  }
}

async function sendMessage(number, text) {
  try {
    const contacts = await client.getContacts();
    const data = {
      number: "",
      serialized: ""
    };

    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i].id.user.includes(number)) {
        data.number = contacts[i].id.user;
        data.serialized = contacts[i].id._serialized;
        break;
      }
    }

    if (data.number && data.serialized) {
      await client.sendMessage(data.serialized, text);
      console.log(`Message sent to ${data.number}: ${text}`);
    } else {
      console.log(`Contact with number ${number} not found.`);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

async function sendPdfMessage(number, filePath, caption) {
  try {
    const contacts = await client.getContacts();
    const contact = contacts.find((c) => c.id.user.includes(number));

    if (!contact) {
      console.log(`Contact with number ${number} not found.`);
      return;
    }

    const media = MessageMedia.fromFilePath(filePath);

    await client.sendMessage(contact.id._serialized, media, { caption });
    console.log(`PDF file sent to ${contact.id.user}`);
  } catch (error) {
    console.error('Error sending PDF message:', error);
  }
}

const targetNumber = process.env.NUMERO;
const messageText = "Olá, aqui é BOT do WhatsApp... Tá fluindo.. ou não.. Bye!";
const pdfFilePath = path.resolve(process.cwd(), 'files', process.env.FILE);
const pdfCaption = 'Check out this PDF file!';

(async () => {
  await startSession();
  // await sendMessage(targetNumber, messageText);
  // await sendPdfMessage(targetNumber, pdfFilePath, pdfCaption);
})();
