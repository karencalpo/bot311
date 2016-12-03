const fs      = require('fs');
const restify = require('restify');
const builder = require('botbuilder');

const config = fs.existsSync('./config/index.js') ? require('./config') : {};

//=========================================================
// Bot Setup
//=========================================================

// Setup Restify server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat bot
const connector = new builder.ChatConnector({
    appId       : process.env.MICROSOFT_BOT_APP_ID       || config.MICROSOFT_BOT_APP_ID,
    appPassword : process.env.MICROSOFT_BOT_APP_PASSWORD || config.MICROSOFT_BOT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector, {
    localizerSettings: {
        defaultLocale: 'en'
    }
});

// Serve a static web page
server.get(/.*/, restify.serveStatic({
    'directory': './landing',
    'default': 'index.html'
}));

server.post('/api/messages', connector.listen());

//=========================================================
// Bots Dialogs
//=========================================================

bot.dialog('/', [
    function (session) {
        builder.Prompts.choice(session, "initial_prompt", [
            "nearby_choice",
            "report_choice",
            "track_choice"
        ]);
    },
    function (session, results) {
        if (results.response) {
            session.send(results.response.entity);
        }
    }
]);
