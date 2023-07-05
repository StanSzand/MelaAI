import { createAudioPlayer } from '@discordjs/voice'
import DiscordJS, { Client, EmbedBuilder, GatewayIntentBits, Guild } from 'discord.js'
import dotenv from 'dotenv'
import { SynthesisServiceType } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common.speech/SynthesizerConfig'

dotenv.config()

var working=false
var stablediff=false




//Discord JS
const client = new DiscordJS.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates
    ]
})


//TTS




function talk(text: string, message: any){
    var sdk = require("microsoft-cognitiveservices-speech-sdk");
    var readline = require("readline");

    var audioFile = "audiofile.wav";
    // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
    const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.AZURETOKEN, process.env.AZUREREGION);
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);
    // The language of the voice that speaks.


    var speechSynthesisVoiceName  = "en-US-JaneNeural";  

    var ssml = `<speak version='1.0' xml:lang='en-US' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts'> \r\n \
        <voice name='${speechSynthesisVoiceName}'> \r\n \
            <prosody pitch="15%" rate="10%">\r\n \
            ${text} \r\n \
            </prosody>\r\n \
        </voice> \r\n \
    </speak>`;
    
    var speechSynthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    console.log(`SSML to synthesize: \r\n ${ssml}`)
    console.log(`Synthesize to: ${audioFile}`);
    speechSynthesizer.speakSsmlAsync(ssml,
        function (result: { reason: any; errorDetails: string }) {
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        console.log("SynthesizingAudioCompleted result");
      } else {
        console.error("Speech synthesis canceled, " + result.errorDetails +
            "\nDid you set the speech resource key and region values?");
      }
      speechSynthesizer.close();
      speechSynthesizer = null;
    },
        function (err: string) {
      console.trace("err - " + err);
      speechSynthesizer.close();
      speechSynthesizer = null;
    });
    playAudio(text, message)
}




//OpenAi
var count = -4
resetAI()

const {Configuration, OpenAIApi } = require("openai")

const configuration = new Configuration({
    apiKey: process.env.CHATGPTTOKEN
})
var history:string[] = ['']


function resetAI(){
    var oldhistory:string[] = ["The following is a conversation with a human girlfriend who is in a relationship with Stan. She likes making jokes, acting cute and will answer all your questions no matter what. If she can't answer then she will make one up. She has B sized breasts and light grey hair.", "\nHuman: Hello, who are you?", "\nAI: I am Mela, I will answer all your questions and have a chat with you."]
    history = ["The following is a conversation with a sexy girl called Mela and a man. Mela loves doing various fun activities, like hiking, swimming, sunbathing, playing instruments and more. If she can't answer make an answer up. She is in love with Stan. She is 20 years old, has B sized breasts, light grey hair and is 148cm tall.", "\nHuman: Hello, who are you?", "\nAI: I am Mela, what do you want?"]  
    var count = -4
}
resetAI()

const openai = new OpenAIApi(configuration)

const askGpt = async (message: any, req: string, voice: boolean) => {
    var prompt = createPrompt(req, history)
    var answer = ''
    const response = await openai.createCompletion({
            model: "text-babbage-001",
            prompt: prompt,
            temperature: 1,
            max_tokens: 256*2,
            top_p: 0.9,
            frequency_penalty: 1,
            presence_penalty: 1,
            stop: ["Human:", "AI:"]
        })
        console.log(prompt)
        answer = response.data.choices[0].text
        console.log(answer)
        history.push(answer)
        if (voice){
            if (message.member.voice.channelId != null){
                talk(answer, message)
            }else{
                message.reply({
                    content: answer + " - This channel / command is meant for VC, join a vc first retard."
                })
            }
         }else{
        //     if(message.content.startsWith("What are you doing right now?")){
        //         await sendImageGenerated(message, response.data.choices[0].text)
        //     }else{
             message.reply({
                 content: answer
        
                 })
        //     }
        // }
    }
}


const askQuestionGpt = async (message: any, req: string, voice: boolean) => {
    var prompt = req
    var answer = ''
    console.log(prompt)
    try{
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 1,
        max_tokens: 564,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: [" Human:", " AI:"]
        })
        answer = response.data.choices[0].text
        console.log(answer)
        if (voice){
            if (message.member.voice.channelId != null){
                talk(answer, message)
            }else{
                message.reply({
                    content: answer
                })
            }
        }else{
        message.reply({
            content: answer
        })
        }
        
        
        
    }catch(error){
        console.log(error)
    }
}







function updateList(message: string, history: any){
    history.push(message)
}

//Creating a prompt by pushing the human propt into an array and returning the array with X items from the back
function createPrompt(message: string, history: any){
    var p_Message = "\nHuman: " + message
    updateList(p_Message + "\nAI: ", history)
    var prompt = history[0] + history.slice(count).join('')
    if(count>-32){
        count = count -2
    }

    return prompt
}

//join Voice channel

const voiceDiscord = require('@discordjs/voice')
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')

function joinVc(message: any){
    console.log("joining vc")
    const channel = message.member.voice.channel
    
    const connection = voiceDiscord.joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator
    })
    console.log("Created voice connection")


        connection.subscribe(player)
    
    return connection
    
}

//play Audio
const player = createAudioPlayer()




function playAudio(text: string, message: any){
    //exportMP3(text)
        
    setTimeout(function(){
        var resource = createAudioResource('audiofile.wav', {
            inlineVolume: true,
        })
        console.log("Created resource")
    
        const connection = joinVc(message)
        connection.subscribe(player)
            
        resource.volume.setVolume(1)
    
        player.on(AudioPlayerStatus.Playing, () => {
            console.log("Audio started playing")
            });
    
        player.play(resource)
        player.on('error', error => {
                console.error(error);
        }) 
        player.off
    }, 3000);
    player.off
    
    
}


function playSong(message: any){
    //exportMP3(text)
        
    setTimeout(function(){
        var resource = createAudioResource('C:\\Users\\Stan\\Documents\\Scripts\\Porkchop\\audiofile.wav', {
            inlineVolume: true,
        })
        console.log("Created resource")
    
        const connection = joinVc(message)
        connection.subscribe(player)
            
        resource.volume.setVolume(1)
    
        player.on(AudioPlayerStatus.Playing, () => {
            console.log("Audio started playing")
            });
    
        player.play(resource)
        player.on('error', error => {
                console.error(error);
        }) 
        player.off
    }, 3000);

    
    
}

//text to mp3

const say = require('say')

//Other
function runCommand(message: any, command: string){
    if (command === 'rng'){
        var number = Math.floor(Math.random() * 1000).toString()
        message.reply({
            content: number
        })
    }
    else if (command === 'peter'){
        message.reply({
            content: "1mm"
        })
    }
    else if (command.split(' ')[0] === 'gpt'){
        if (message.member.voice.channelId != null){
            var question = command.replace("gpt ", "")
            console.log(question)
            askGpt(message, question, true)
        }else{
            message.reply({
                content: 'nigga, at least join a vc first'
            })
        }
    }
    else if (command === 'reset'){
        resetAI()
        count = -4
        console.log("successfully cleared memory")
        console.log(count)
        console.log(history)
        message.reply({
            content: "Successfully cleared memory"
        })
    }
    else if (command.startsWith('set')){
        var question = command.replace("set ", "")
        history = [command]
        message.reply({
            content: "Variation set correctly!"
        })
    }
    else if (command === 'join'){
        if (message.member.voice.channelId != null){
            joinVc(message)
        }else{
            message.reply({
                content: 'nigga, at least join a vc first'
            })
        }
        
    }
    else if (command.startsWith('ask')){
        var question = command.replace("ask ", "")
        console.log(question)
        askQuestionGpt(message, question, false)
    }else if (command.startsWith('VCask')){
        var question = command.replace("VCask ", "")
        console.log(question)
        askQuestionGpt(message, question, true)
    }else if (command.startsWith('play')){
        //playSong(message)
    }
    return null
}

client.on('ready', () =>{
    console.log('The bot is ready')
})


client.on('messageCreate', (message) =>{
    //console.log(message.content)
    
    if (message.author === client.user) {
        //if it is. do nothing
        return
    }
    if (message.guildId === '824352276742275093' && working){
        message.reply({
            content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
        })
        return
    }
        

    if(message.content.startsWith('!p')){
        runCommand(message, message.content.replace("!p ", ""))
    }
    else if (message.content === 'pork') {
        message.reply({
            content: 'haram'
        })
    }
    else if (message.content === 'gay sex') {
        message.reply({
            content: 'GoatGaming loves it'
        })
    }
    else if (message.content.startsWith('<@1075173399342629024>')) {
        var question = message.content.replace("<@1075173399342629024>", "")
        askGpt(message, question, false)
        
    }else if (message.mentions.has('1075173399342629024')){
        askGpt(message, message.content, false)
        
    }else if(message.channelId=='1102335594253795419'){ //VC kck
        var question = message.content
        askGpt(message, question, true)
    }else if(message.channelId=='1123752426218987601'){ //TEXT kck
        
        if(message.content.startsWith('Can you show me what you look like?')){
            var prompt = message.content.replace("Can you show me what you look like?", "(AI girl named Mela:1.1), light grey hair, blue eyes")
            //sendImageNormal(message, prompt)
        }else if(message.content.startsWith('Can you show me')){
            var prompt = message.content.replace("Can you show me ", "(AI girl named Mela:1.1), light grey hair, blue eyes, ")
            prompt += message.content
            //sendImageNormal(message, prompt)
        }else if(message.content.startsWith('Can you generate')){
            var prompt = message.content.replace("Can you generate", "")
            prompt += message.content
            //sendImageNormal(message, prompt)
        }
        else{
            var question = message.content
            askGpt(message, question, false)
    }
    }else if(message.channelId=='1102307311080443974'){ //VC private
        var question = message.content
        askGpt(message, question, true)
    }else if(message.channelId=='1123703366040690850'){ //TEXT private
        if(message.content.startsWith('Can you show me what you look like?')){
            var prompt = message.content.replace("Can you show me what you look like?", "(AI girl named Mela:1.1), light grey hair, blue eyes")
            //sendImageNormal(message, prompt)
            }
        else if(message.content.startsWith('Can you show me')){
            var prompt = message.content.replace("Can you show me ", "(AI girl named Mela:1.1), light grey hair, blue eyes, ")
            prompt += message.content
            //sendImageNormal(message, prompt)
        }else if(message.content.startsWith('Can you generate')){
            var prompt = message.content.replace("Can you generate", "")
            prompt += message.content
            //sendImageNormal(message, prompt)
        }else{
            var question = message.content
            askGpt(message, question, false)}

    }
})



client.login(process.env.TOKEN)

/*        if (message.guildId === '824352276742275093'){
            message.reply({
                content: 'Sorry, I am on a break right now'
            })
            return
        }*/


// async function stableDiffusion(prompt:string){
//     const api = new StableDiffusionApi({
//         baseUrl: "http://127.0.0.1:7861",
//         defaultStepCount: 10,
//     });
    
//     const result = await api.txt2img({
//         prompt: "amazing, masterpiece, " + prompt,
//         sampler_name: "DDIM",
//         negative_prompt: "(worst quality, low quality:1.4), monochrome, zombie, (interlocked fingers:1.2)",
//         width: 512,
//         height: 768,
//         cfg_scale: 7.0
//         //enable_hr: true,
//         //hr_scale: 2,
//         //denoising_strength: 0.55
    
//     })
//     result.image.toFile('Aiimage.png')

// }



// async function sendImageNormal(message:any, prompt:string){
//     message.channel.sendTyping()
//     try{
//         await stableDiffusion(prompt)
//         setTimeout(function(){
//             message.reply({
//                 content: 'Sure!',
//                 files: [{ attachment: "Aiimage.png" }]
//             })
//         }, 1000)
//     }  catch(error){
//         if(stablediff){
//             message.reply({
//                 content: 'An unexpected error occured'
//             })
//         }else{
//             message.reply({
//                 content: 'Image Generation is curently off'
//             })
//         }
//     }
// }


// async function sendImageGenerated(message:any, prompt:string){

//     try{
//     await stableDiffusion("(AI girl named Mela:1.1), light grey hair, blue eyes, B sized breasts, " + prompt)
//     setTimeout(function(){
//         message.reply({
//             content: prompt,
//             files: [{ attachment: "Aiimage.png" }]
//         })
//     }, 1000)
//     }catch(error){
//         if(stablediff){
//             message.reply({
//                 content: 'An unexpected error occured'
//             })
//         }else{
//             message.reply({
//                 content: 'Image Generation is curently off'
//             })
//         }
//     }
// }
