require('dotenv').config()
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
var parseMessage = require('gmail-api-parse-message');
const { htmlToText } = require('html-to-text');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

/**
 * Lists the all messages in the user's account.
 *
 * @param auth An authorized OAuth2 client.
 * @param maxResults Maximum number of messages to return.
 * @param query Only return messages matching the specified query.
 */

function getMessages(auth, maxResults, query = null) {
    return new Promise((resolve, reject) => {
        const gmail = google.gmail({ version: 'v1', auth });
        gmail.users.messages.list(
            {
                userId: 'me',
                q: query,
                maxResults: maxResults
            }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!res.data.messages) {
                    resolve([]);
                    return;
                } resolve(res.data.messages);
            }
        );
    });
};

/**
 * Moves the specified message to the trash.
 *
 * @param auth An authorized OAuth2 client.
 * @param msgId The ID of the message to remove.
 */
function deleteMessage(auth, msgId) {
    return new Promise((resolve, reject) => {
        const gmail = google.gmail({ version: 'v1', auth });
        gmail.users.messages.trash(
            {
                userId: 'me',
                id: msgId
            }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                } resolve(res.status);
            }
        );
    });
};

/**
 * Gets the specified message
 *
 * @param auth An authorized OAuth2 client.
 * @param msgId The ID of the message to retrieve.
 */
function getMessage(auth, msgId) {
    return new Promise((resolve, reject) => {
        const gmail = google.gmail({ version: 'v1', auth });
        gmail.users.messages.get(
            {
                userId: 'me',
                id: msgId,
            }, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (res) {
                    var body = res.data;
                    var parsedMessage = parseMessage(body);
                    var textHtml = parsedMessage.textHtml;
                    var text = htmlToText(textHtml, {
                        wordwrap: 130,
                        // whitespaceCharacters: '\t\r\n\f\u200b'
                    });
                } resolve(text);
            }
        );
    });
};

/**
 * Sends the specified message to the recipients.
 *
 * @param auth An authorized OAuth2 client.
 * @param msgId The ID of the message to remove.
 */
async function sendMail() {
    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: "me",
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: 'TITLE <from_my_email>',
            to: '<test_email>',
            subject: 'Hello from gmail using API',
            text: 'Hello from gmail email using API',
            html: '<h1>Hello from gmail email using API</h1>',
        };

        const result = await transport.sendMail(mailOptions);
        return result;
    } catch (error) {
        return error;
    }
}

module.exports = {
    getMessage,
    getMessages,
    deleteMessage,
    oAuth2Client
};