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
const discord_js_1 = __importStar(require("discord.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const gptAI_1 = require("./gptAI");
const fs = __importStar(require("fs"));
const speech_1 = require("@google-cloud/speech");
const WavEncoder = require("wav-encoder");
dotenv_1.default.config();
var working = false;
var stablediff = false;
exports.stablediff = stablediff;
var previousPrompt = '';
const omniKey = process.env.OMNIKEY;
var queue = [];
var alreadyplaying = false;
const speechClient = new speech_1.SpeechClient({
    projectId: 'steel-bliss-403523',
    keyFilename: './dolphin.json',
});
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
    else if (command === 'counter') {
        var check = fs.readFileSync('itis.txt', 'utf8');
        message.reply({
            content: `It is what it is counter: ${check}`
        });
    }
}
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function itwit(message, reply) {
    var check = fs.readFileSync('itis.txt', 'utf8');
    var newnumber = +check;
    newnumber++;
    writeFile(newnumber.toString(), 'itis.txt');
    if (reply) {
        message.reply({
            content: `It is what it is counter: ${newnumber}`
        });
    }
}
function writeFile(content, file) {
    fs.writeFileSync(file, content);
}
client.on('messageCreate', (message) => {
    //console.log(message.content)!
    if (!message.content.startsWith(`!p play`)) {
        message.content = message.content.toLowerCase();
    }
    if (message.author === client.user || message.content.startsWith('.')) {
        //Do nothing
        return;
    }
    if (message.guildId === '824352276742275093' && working && (message.content.startsWith('<@1075173399342629024>') || message.channelId == '1102335594253795419' || message.channelId == '1123752426218987601')) {
        message.reply({
            content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
        });
        return;
    }
    if (message.content.startsWith('!p')) {
        runCommand(message, message.content.replace("!p ", ""));
    }
    else if (message.content.startsWith('can you generate that again')) {
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
        if (message.content == 'can you show me what you look like?') {
            generateImage(message, "(AI catgirl named Mela:1.1), light grey hair, cat ears, cat tail, blue eyes, B sized breasts, overwhelmingly cute,", false);
        }
        else if (message.content.startsWith('can you show me you')) {
            var prompt = message.content.replace("can you show me you", "(AI catgirl named Mela:1.1), light grey hair, cat ears, cat tail, blue eyes, B sized breasts, overwhelmingly cute, ");
            console.log(prompt);
            generateImage(message, prompt, false);
        }
        else if (message.content.startsWith('can you generate')) {
            var prompt = message.content.replace("can you generate ", "");
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
    else if (message.channelId == '1168159743320264724') {
        (0, gptAI_1.askGpt)(message, message.content, true);
    }
    else if (message.channelId == '1123703366040690850') { //TEXT private
        if (message.content == 'can you show me what you look like?') {
            generateImage(message, "(AI catgirl named Mela:1.1), light grey hair, cat ears, cat tail, blue eyes, B sized breasts, overwhelmingly cute,", false);
        }
        else if (message.content.startsWith('can you show me you')) {
            var prompt = message.content.replace("can you show me you", "(AI catgirl named Mela:1.1), light grey hair, cat ears, cat tail, blue eyes, B sized breasts, overwhelmingly cute, ");
            console.log(prompt);
            generateImage(message, prompt, false);
        }
        else if (message.content.startsWith('can you generate')) {
            var prompt = message.content.replace("can you generate ", "");
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
    else if (message.channelId == '1167940050680545371') {
        (0, gptAI_1.askGpt)(message, message.content, true);
    }
    else if (message.content.startsWith('it is what it is')) {
        itwit(message, true);
    }
    else if (message.content.startsWith('welp')) {
        message.reply({
            content: 'it is what it is'
        });
        itwit(message, false);
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
            var model = 'majicmixRealistic_v2';
        }
        else {
            var model = 'meinamix_meinaV6_13129';
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
