const { getMessage, getMessages, deleteMessage, oAuth2Client } = require('./index');
const { expect } = require('chai');
let msgId;
let message;
let url;

describe('Verify message', function () {

    before(async function () {
        const messages = await getMessages(oAuth2Client, 10, 'from:no-reply@email.test.com');
        msgId = messages[0].id;

        const body = await getMessage(msgId, oAuth2Client);
        message = body.split('\n');
        url = message.filter(el => el.includes('https'))[0];
    });

    it('Check that message contains the text', () => {
        expect(message).to.include("Don't miss out on this Cyber Monday deal");
    });

    it('Check that message contains the link', () => {
        expect(url).to.include('https://click.email.test.com');
    });

    it('Should move the message to trash', async () => {
        const status = await deleteMessage(msgId, oAuth2Client);
        expect(status).to.eql(200);
    });
});