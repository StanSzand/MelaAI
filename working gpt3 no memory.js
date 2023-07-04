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
const voice_1 = require("@discordjs/voice");
const discord_js_1 = __importStar(require("discord.js"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
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
//TTS
var history = [''];
function resetAI() {
    var oldhistory = ["The following is a conversation with a human girlfriend who is in a relationship with Stan. She likes making jokes, acting cute and will answer all your questions no matter what. If she can't answer then she will make one up. She has B sized breasts and light grey hair.", "\nHuman: Hello, who are you?", "\nAI: I am Mela, I will answer all your questions and have a chat with you."];
    history = ["The following is a conversation with a mean dominatrix girl called Mela and a man. Mela loves sexual topics and can also answer all questions. If she can't answer then she will make one up. She has B sized breasts, light grey hair and is 148cm tall.", "\nHuman: Hello, who are you?", "\nAI: I am Mela, what do you want?"];
    var count = -4;
}
resetAI();
function talk(text, message) {
    var sdk = require("microsoft-cognitiveservices-speech-sdk");
    var readline = require("readline");
    var audioFile = "audiofile.wav";
    // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
    const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.AZURETOKEN, process.env.AZUREREGION);
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);
    // The language of the voice that speaks.
    var speechSynthesisVoiceName = "en-US-JaneNeural";
    var ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts'> \r\n \
        <voice name='${speechSynthesisVoiceName}'> \r\n \
            <prosody pitch="15%" rate="10%">\r\n \
            ${text} \r\n \
            </prosody>\r\n \
        </voice> \r\n \
    </speak>`;
    var speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    console.log(`SSML to synthesize: \r\n ${ssml}`);
    console.log(`Synthesize to: ${audioFile}`);
    speechSynthesizer.speakSsmlAsync(ssml, function (result) {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            console.log("SynthesizingAudioCompleted result");
        }
        else {
            console.error("Speech synthesis canceled, " + result.errorDetails +
                "\nDid you set the speech resource key and region values?");
        }
        speechSynthesizer.close();
        speechSynthesizer = null;
    }, function (err) {
        console.trace("err - " + err);
        speechSynthesizer.close();
        speechSynthesizer = null;
    });
    playAudio(text, message);
}
//OpenAi
var count = -4;
resetAI();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    basePath: `http://localhost:8080/v1`
});
const openai = new OpenAIApi(configuration);
let convoLog = [{ role: 'response', content: 'I am a horny succubus slave. I cannot wait to shove the users dick up her vagina and cum inside. I want babies and will hold the user and ride him until he cums.' }];
const askGpt = (message, req, voice) => __awaiter(void 0, void 0, void 0, function* () {
    convoLog.push({
        role: 'instruction',
        content: req
    });
    console.log(convoLog);
    var answer = '';
    console.log(req);
    try {
        const response = yield openai.createChatCompletion({
            model: "Wizard-Vicuna-7B-Uncensored.ggmlv3.q2_K.bin",
            messages: convoLog,
            max_tokens: 128,
        });
        answer = response.data.choices[0].message.content;
        convoLog.push({
            role: 'response',
            content: answer
        });
        console.log(answer);
        if (voice) {
            if (message.member.voice.channelId != null) {
                talk(answer, message);
            }
            else {
                message.reply({
                    content: answer + " - This channel / command is meant for VC, join a vc first retard."
                });
            }
        }
        else {
            message.reply({
                content: answer
            });
        }
    }
    catch (error) {
        console.log(error);
    }
});
const askGpt35 = (message, req, voice) => __awaiter(void 0, void 0, void 0, function* () {
    var prompt = createPrompt(req, history);
    var answer = '';
    try {
        const response = yield openai.createCompletion({
            model: "ggml-mpt-7b-chat.bin",
            prompt: prompt,
            max_tokens: 256 * 2,
            stop: ["Human:", "AI:"]
        });
        console.log(prompt);
        answer = response.data.choices[0].text;
        console.log(answer);
        history.push(answer);
        if (voice) {
            if (message.member.voice.channelId != null) {
                talk(answer, message);
            }
            else {
                message.reply({
                    content: answer + " - This channel / command is meant for VC, join a vc first retard."
                });
            }
        }
        else {
            message.reply({
                content: answer
            });
        }
    }
    catch (error) {
        console.log(error);
    }
});
const askQuestionGpt = (message, req, voice) => __awaiter(void 0, void 0, void 0, function* () {
    var prompt = req;
    var answer = '';
    console.log(prompt);
    try {
        const response = yield openai.createCompletion({
            model: "text-davinci-003",
            prompt: prompt,
            temperature: 1,
            max_tokens: 564,
            top_p: 0.9,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop: [" Human:", " AI:"]
        });
        answer = response.data.choices[0].text;
        console.log(answer);
        if (voice) {
            if (message.member.voice.channelId != null) {
                talk(answer, message);
            }
            else {
                message.reply({
                    content: answer
                });
            }
        }
        else {
            message.reply({
                content: answer
            });
        }
    }
    catch (error) {
        console.log(error);
    }
});
function updateList(message, history) {
    history.push(message);
}
//Creating a prompt by pushing the human propt into an array and returning the array with X items from the back
function createPrompt(message, history) {
    var p_Message = "\nHuman: " + message;
    updateList(p_Message + "\nAI: ", history);
    var prompt = history[0] + history.slice(count).join('');
    if (count > -32) {
        count = count - 2;
    }
    return prompt;
}
//join Voice channel
const voiceDiscord = require('@discordjs/voice');
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
function joinVc(message) {
    const channel = message.member.voice.channel;
    const connection = voiceDiscord.joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator
    });
    console.log("Created voice connection");
    connection.subscribe(player);
    return connection;
}
//play Audio
const player = (0, voice_1.createAudioPlayer)();
function playAudio(text, message) {
    //exportMP3(text)
    setTimeout(function () {
        var resource = createAudioResource('C:\\Users\\Stan\\Documents\\Scripts\\Porkchop\\audiofile.wav', {
            inlineVolume: true,
        });
        console.log("Created resource");
        const connection = joinVc(message);
        connection.subscribe(player);
        resource.volume.setVolume(1);
        player.on(AudioPlayerStatus.Playing, () => {
            console.log("Audio started playing");
        });
        player.play(resource);
        player.on('error', error => {
            console.error(error);
        });
        player.off;
    }, 3000);
    player.off;
}
function playSong(message) {
    //exportMP3(text)
    setTimeout(function () {
        var resource = createAudioResource('C:\\Users\\Stan\\Documents\\Scripts\\Porkchop\\audiofile.wav', {
            inlineVolume: true,
        });
        console.log("Created resource");
        const connection = joinVc(message);
        connection.subscribe(player);
        resource.volume.setVolume(1);
        player.on(AudioPlayerStatus.Playing, () => {
            console.log("Audio started playing");
        });
        player.play(resource);
        player.on('error', error => {
            console.error(error);
        });
        player.off;
    }, 3000);
}
//text to mp3
const say = require('say');
/*
async function talk(text: string, message: any){
    playAudio(text, message)
}
*/
//Other
function runCommand(message, command) {
    if (command === 'rng') {
        var number = Math.floor(Math.random() * 1000).toString();
        message.reply({
            content: number
        });
    }
    else if (command === 'peter') {
        message.reply({
            content: "1mm"
        });
    }
    else if (command.split(' ')[0] === 'gpt') {
        if (message.member.voice.channelId != null) {
            var question = command.replace("gpt ", "");
            console.log(question);
            askGpt(message, question, true);
        }
        else {
            message.reply({
                content: 'nigga, at least join a vc first'
            });
        }
    }
    else if (command === 'reset') {
        resetAI();
        count = -4;
        console.log("successfully cleared memory");
        console.log(count);
        console.log(history);
        message.reply({
            content: "Successfully cleared memory"
        });
    }
    else if (command.startsWith('set')) {
        var question = command.replace("set ", "");
        history = [command];
        message.reply({
            content: "Variation set correctly!"
        });
    }
    else if (command === 'join') {
        if (message.member.voice.channelId != null) {
            joinVc(message);
        }
        else {
            message.reply({
                content: 'nigga, at least join a vc first'
            });
        }
    }
    else if (command.startsWith('ask')) {
        var question = command.replace("ask ", "");
        console.log(question);
        askQuestionGpt(message, question, false);
    }
    else if (command.startsWith('VCask')) {
        var question = command.replace("VCask ", "");
        console.log(question);
        askQuestionGpt(message, question, true);
    }
    else if (command.startsWith('play')) {
        playSong(message);
    }
    return null;
}
client.on('ready', () => {
    console.log('The bot is ready');
});
var working = true;
client.on('messageCreate', (message) => {
    //console.log(message.content)
    if (message.author === client.user) {
        //if it is. do nothing
        return;
    }
    if (message.content.startsWith('!p')) {
        runCommand(message, message.content.replace("!p ", ""));
    }
    else if (message.content === 'pork') {
        message.reply({
            content: 'haram'
        });
    }
    else if (message.content === 'gay sex') {
        message.reply({
            content: 'GoatGaming loves it'
        });
    }
    else if (message.content.startsWith('<@1075173399342629024>')) {
        if (working) {
            message.reply({
                content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
            });
        }
        else {
            var question = message.content.replace("<@1075173399342629024>", "");
            askGpt(message, question, false);
        }
    }
    else if (message.mentions.has('1075173399342629024')) {
        if (working) {
            message.reply({
                content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
            });
        }
        else {
            askGpt(message, message.content, false);
        }
    }
    else if (message.channelId == '1102335594253795419') { //VC kck
        if (working) {
            message.reply({
                content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
            });
        }
        else {
            var question = message.content;
            askGpt(message, question, true);
        }
        return;
    }
    else if (message.channelId == '1123752426218987601') { //TEXT kck
        if (working) {
            message.reply({
                content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
            });
        }
        else {
            var question = message.content;
            askGpt(message, question, false);
        }
    }
    else if (message.channelId == '1102307311080443974') { //VC private
        var question = message.content;
        askGpt(message, question, true);
    }
    else if (message.channelId == '1123703366040690850') { //TEXT private
        var question = message.content;
        askGpt(message, question, false);
    }
});
client.login(process.env.TOKEN);
/*        if (message.guildId === '824352276742275093'){
            message.reply({
                content: 'Sorry, I am on a break right now'
            })
            return
        }*/
