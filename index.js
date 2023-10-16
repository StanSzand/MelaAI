"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stablediff = exports.generateImage = void 0;
const voice_1 = require("@discordjs/voice");
const discord_js_1 = __importStar(require("discord.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const gptAI_1 = require("./gptAI");
const ytpl_1 = __importDefault(require("ytpl"));
dotenv_1.default.config();
var working = false;
var stablediff = false;
exports.stablediff = stablediff;
var previousPrompt = '';
const omniKey = process.env.OMNIKEY;
var queue = [];
const player = (0, voice_1.createAudioPlayer)();
var alreadyplaying = false;
//Discord JS
const client = new discord_js_1.default.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.GuildVoiceStates
    ]
});
client.login(process.env.TOKEN);
const voiceDiscord = require('@discordjs/voice');
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
function startPlay(message, link) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Added ${link} to the queue`);
        const channel = (_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel;
        if (channel) {
            try {
                if (link.includes('playlist')) {
                    const playlist = yield (0, ytpl_1.default)(link);
                    const songUrls = playlist.items.map((item) => item.url);
                    for (const songUrl of songUrls) {
                        const songInfo = yield ytdl_core_1.default.getInfo(songUrl);
                        const song = {
                            songNumber: 'null',
                            title: songInfo.videoDetails.title,
                            url: songInfo.videoDetails.video_url
                        };
                        queue.push(song);
                        if (queue.length === 1) {
                            playSong(channel, message);
                        }
                    }
                }
                else {
                    const songInfo = yield ytdl_core_1.default.getInfo(link);
                    const song = {
                        songNumber: 'null',
                        title: songInfo.videoDetails.title,
                        url: songInfo.videoDetails.video_url
                    };
                    queue.push(song);
                    if (queue.length === 1) {
                        playSong(channel, message);
                    }
                    message.reply({
                        content: `Added ${link} to the queue 😃`
                    });
                }
            }
            catch (_b) {
                message.reply({
                    content: `That link is invalid, please make sure it is not age restricted or in a private playlist`
                });
            }
        }
        else {
            message.channel.send("You need to be in a voice channel to use this command, darling.");
        }
    });
}
function playSong(voiceChannel, message) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const channel = (_a = message.member) === null || _a === void 0 ? void 0 : _a.voice.channel;
        const connection = voiceDiscord.joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });
        const stream = (0, ytdl_core_1.default)(queue[0].url, {
            filter: "audioonly",
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        });
        const dispatcher = createAudioResource(stream);
        connection.subscribe(player);
        player.play(dispatcher);
        if (!alreadyplaying) {
            player.addListener("stateChange", (oldOne, newOne) => {
                if (newOne.status == "idle") {
                    queue.shift();
                    if (queue.length > 0) {
                        alreadyplaying = true;
                        playSong(voiceChannel, message);
                    }
                    else {
                        try {
                            if (connection) {
                                connection.destroy();
                            }
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                }
            });
        }
        ;
    });
}
//Commands
function runCommand(message, command) {
    if (command === 'ping') {
        message.reply({
            content: `🏓Latency is ${Date.now() - message.createdTimestamp}ms`
        });
    }
    else if (command === 'reset') {
        (0, gptAI_1.resetAI)();
        message.reply({
            content: "Successfully cleared memory"
        });
    }
    else if (command.startsWith('play')) {
        command = command.replace('play ', '');
        if (command.includes('&')) {
            command = command.split('&')[0];
        }
        startPlay(message, command);
    }
    else if (command.startsWith('help')) {
        const helpEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("I see you requested for help, here you are:")
            .setDescription(`Here are the music commands: \n 
            1. "!p play *link*" \n
            2. "!p queue" \n
            3. "!p resume" \n
            4. "!p skip" \n
            5. "!p queue" \n
            6. "!p goto *number* \n
            **To chat with me, please use #chatting-with-mela, ping me in any other channel or simply reply to my message** \n
            For image generation please use: \n
            1. "Can you please generate *prompt here*" - use those for anime styled generations \n
            2. "Can you please generate real *prompt here*" - use those for realistic generations \n
            3. "Can you show me what you look like?" - use those for me showing you a picture of me 😉 `)
            .setColor('#78E3CC');
        message.reply({
            embeds: [helpEmbed]
        });
    }
    else if (command.startsWith("AI")) {
        if (message.author.id === '631556720338010143') {
            if (stablediff == false) {
                exports.stablediff = stablediff = true;
            }
            else
                (exports.stablediff = stablediff = false);
            console.log('Stable Diffusion generation set to ' + stablediff.toString());
            message.reply({
                content: 'Stable Diffusion generation set to ' + stablediff.toString()
            });
        }
        else {
            message.reply({
                content: "You don't have the permissions to do that"
            });
        }
    }
    else if (command === 'queue') {
        try {
            console.log(queue);
            for (let i = 0; i < queue.length; i++) {
                if (i === 0) {
                    queue[i].songNumber = `${i + 1} Now Playing:     `;
                }
                else if (i === 1) {
                    queue[i].songNumber = `${i + 1} Next up:     `;
                }
                else {
                    queue[i].songNumber = `${i + 1}:    `;
                }
            }
            console.log(queue);
            const queueEmbed = new discord_js_1.EmbedBuilder()
                .setTitle("🎵 Music Queue 🎵")
                .setDescription(queue.map(song => `**${song.songNumber}** ${song.title} - ${song.url}`).join('\n'))
                .setColor('#FF0000');
            message.reply({
                embeds: [queueEmbed]
            });
        }
        catch (error) {
            message.reply({
                content: `The queue seems to be empty. 😔`
            });
            console.log(error);
        }
    }
    else if (command === 'pause') {
        pauseSong();
        message.reply({
            content: "Song paused darling, embrace the silence. 😈😉"
        });
    }
    else if (command === 'resume') {
        resumeSong();
        message.reply({
            content: "Song resumed 😊"
        });
    }
    else if (command === 'skip') {
        skipSong();
        message.reply({
            content: "You don't like that one huh? 🤔 Skipped it for you. 🥰"
        });
    }
    else if (command.startsWith('goto')) {
        try {
            var intiger = parseInt(command.replace('goto ', ''));
            goTo(intiger - 2);
            message.reply({
                content: `Skipped to number ${intiger}.`
            });
        }
        catch (error) {
            console.log(error);
            message.reply({
                content: `An error occured while skipping.`
            });
        }
    }
}
function pauseSong() {
    player.pause();
}
function resumeSong() {
    player.unpause();
}
function skipSong() {
    player.stop();
}
function goTo(index) {
    queue = queue.splice(index);
    skipSong();
}
client.on('messageCreate', (message) => {
    //console.log(message.content)
    if (message.author === client.user || message.content.startsWith('.')) {
        //Do nothing
        return;
    }
    if (message.guildId === '824352276742275093' && working && (message.content.startsWith('<@1075173399342629024>') || message.channelId == '1102335594253795419' || message.channelId == '1123752426218987601')) {
        message.reply({
            content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
        });
    }
    if (message.content.startsWith('!p')) {
        runCommand(message, message.content.replace("!p ", ""));
    }
    else if (message.content.startsWith('Can you generate that again')) {
        if (previousPrompt != '') {
            console.log(previousPrompt);
            generateImage(message, previousPrompt, lastReal);
        }
        else {
            message.reply({
                content: "Sorry, I haven't generated anything since Stan restarted me :("
            });
        }
    }
    else if (message.content.startsWith('<@1075173399342629024>')) {
        var question = message.content.replace("<@1075173399342629024>", "");
        (0, gptAI_1.askGpt)(message, question, false);
    }
    else if (message.mentions.has('1075173399342629024')) {
        (0, gptAI_1.askGpt)(message, message.content, false);
    }
    else if (message.channelId == '1123752426218987601') { //TEXT kck
        if (message.content == 'Can you show me what you look like?') {
            generateImage(message, "(AI girl named Mela:1.1), light grey hair, blue eyes, overwhelmingly cute", false);
        }
        else if (message.content.startsWith('Can you show me you')) {
            var prompt = message.content.replace("Can you show me you", "(AI girl named Mela:1.1), light grey hair, blue eyes, ");
            console.log(prompt);
            generateImage(message, prompt, false);
        }
        else if (message.content.startsWith('Can you generate')) {
            var prompt = message.content.replace("Can you generate ", "");
            console.log(prompt);
            if (prompt.startsWith('real')) {
                var prompt = prompt.replace("real", "");
                console.log(prompt);
                generateImage(message, prompt, true);
            }
            else {
                console.log(prompt);
                generateImage(message, prompt, false);
            }
        }
        else {
            (0, gptAI_1.askGpt)(message, message.content, false);
        }
    }
    else if (message.channelId == '1123703366040690850') { //TEXT private
        if (message.content == 'Can you show me what you look like?') {
            generateImage(message, "(AI girl named Mela:1.1), light grey hair, blue eyes, overwhelmingly cute", false);
        }
        else if (message.content.startsWith('Can you show me you')) {
            var prompt = message.content.replace("Can you show me you", "(AI girl named Mela:1.1), light grey hair, blue eyes, ");
            console.log(prompt);
            generateImage(message, prompt, false);
        }
        else if (message.content.startsWith('Can you generate')) {
            var prompt = message.content.replace("Can you generate ", "");
            console.log(prompt);
            if (prompt.startsWith('real')) {
                var prompt = prompt.replace("real", "");
                console.log(prompt);
                generateImage(message, prompt, true);
            }
            else {
                console.log(prompt);
                generateImage(message, prompt, false);
            }
        }
        else if (message.content.startsWith('cg')) {
            var prompt = message.content.replace("cg", "");
            generateImage(message, prompt, false);
        }
        else {
            console.log('test');
            (0, gptAI_1.askGpt)(message, message.content, false);
        }
    }
});
client.on('ready', () => {
    (0, gptAI_1.resetAI)();
    console.log('The bot is ready');
});
var myUrl = 'http://api.omniinfer.io/v2/txt2img';
var lastReal = false;
function generateImage(message, prompt, realism) {
    return __awaiter(this, void 0, void 0, function* () {
        previousPrompt = prompt;
        lastReal = realism;
        message.channel.sendTyping();
        console.log(prompt);
        if (realism) {
            var model = 'sd_xl_base_1.0';
        }
        else {
            var model = 'darkSushiMixMix_225D_64380';
        }
        var content = `{
        "prompt": "(masterpiece, best quality:1.2), ${prompt}",
        "negative_prompt": "worst quality, low quality, monochrome",
        "model_name": "${model}.safetensors",
        "sampler_name": "DPM++ 2M Karras",
        "batch_size": 1,
        "n_iter": 1,
        "steps": 20,
        "enable_hr": true,
        "hr_scale": 1.8,
        "denoising_strength": 0.55,
        "hr_second_pass_steps": 10,
        "cfg_scale": 7,
        "seed": -1,
        "height": 768,
        "width": 512
    }`;
        const response = yield fetch(myUrl, {
            method: 'POST',
            body: content,
            headers: { 'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                'Content-Type': 'application/json',
                'X-Omni-Key': `${omniKey}` }
        });
        const bodyS = yield response.json();
        console.log(bodyS);
        const ID = bodyS.data.task_id;
        console.log(ID);
        getImage(message, ID);
    });
}
exports.generateImage = generateImage;
function getImage(message, taskID) {
    return __awaiter(this, void 0, void 0, function* () {
        const myURL = 'http://api.omniinfer.io/v2/progress?task_id=' + taskID;
        setTimeout(function () {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    message.channel.sendTyping();
                    const responseImage = yield fetch(myURL, {
                        method: 'GET',
                        headers: { 'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                            'X-Omni-Key': `${omniKey}` }
                    });
                    const bodyImage = yield responseImage.json();
                    const imageURL = bodyImage.data.imgs[0];
                    console.log(imageURL);
                    message.reply({
                        content: imageURL
                    });
                }
                catch (_a) {
                    try {
                        setTimeout(function () {
                            return __awaiter(this, void 0, void 0, function* () {
                                message.channel.sendTyping();
                                const responseImage = yield fetch(myURL, {
                                    method: 'GET',
                                    headers: { 'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                                        'X-Omni-Key': `${omniKey}` }
                                });
                                const bodyImage = yield responseImage.json();
                                const imageURL = bodyImage.data.imgs[0];
                                console.log(imageURL);
                                message.reply({
                                    content: imageURL
                                });
                            });
                        }, 10000);
                    }
                    catch (_b) {
                        try {
                            message.channel.sendTyping();
                            setTimeout(function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    const responseImage = yield fetch(myURL, {
                                        method: 'GET',
                                        headers: { 'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                                            'X-Omni-Key': `${omniKey}` }
                                    });
                                    const bodyImage = yield responseImage.json();
                                    const imageURL = bodyImage.data.imgs[0];
                                    console.log(imageURL);
                                    message.reply({
                                        content: imageURL
                                    });
                                });
                            }, 10000);
                        }
                        catch (_c) {
                            message.reply({
                                content: 'Sorry, that image generation took too long to respond - try a different image'
                            });
                        }
                    }
                }
            });
        }, 10000);
    });
}
