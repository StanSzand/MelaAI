import DiscordJS, { Client, EmbedBuilder, GatewayIntentBits, Guild, VoiceChannel } from 'discord.js'
import dotenv from 'dotenv'
import ytdl from 'ytdl-core';
import {resetAI, askGpt} from './gptAI'
import ytpl from 'ytpl'
import search from 'youtube-search'
import * as fs from 'fs'
import { SpeechClient } from '@google-cloud/speech';
import {opus} from 'prism-media'


const WavEncoder = require("wav-encoder");
dotenv.config()

var working=false
var stablediff=false
var previousPrompt = ''
const omniKey = process.env.OMNIKEY
var queue:any[] = []
var alreadyplaying = false
const speechClient = new SpeechClient({
    projectId: 'steel-bliss-403523',
    keyFilename: './dolphin.json',
  });


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

client.login(process.env.TOKEN)

 

//Commands
function runCommand(message: any, command: string){
    if (command === 'ping'){
        message.reply({
            content: `🏓Latency is ${Date.now() - message.createdTimestamp}ms`
        })
    }
    else if (command === 'reset'){
        resetAI()
        message.reply({
            content: "Successfully cleared memory"
        })
         
    }else if (command.startsWith('help')){
            const helpEmbed = new EmbedBuilder()
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
            .setColor('#78E3CC')

            message.reply({
                embeds: [helpEmbed]
            })

    }else if (command.startsWith("AI")){
        if (message.author.id === '631556720338010143'){
            if (stablediff == false){
                stablediff = true
            }else(
                stablediff = false
            )
            console.log('Stable Diffusion generation set to ' + stablediff.toString())
            message.reply({
                content: 'Stable Diffusion generation set to ' + stablediff.toString()
            })

        }else{
            message.reply({
                content: "You don't have the permissions to do that"
            })
        } 
    }else if (command === 'counter'){
        var check = fs.readFileSync('itis.txt','utf8')
        message.reply({
            content: `It is what it is counter: ${check}`
        })
    }
}

function shuffleArray(arr: any[]): any[] {
    for (let i = arr.length - 1; i > 1; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  

function itwit(message: any, reply: boolean){
    var check = fs.readFileSync('itis.txt','utf8')
    var newnumber: number = +check
    newnumber ++
    writeFile(newnumber.toString(), 'itis.txt')
    if(reply){
        message.reply({
            content: `It is what it is counter: ${newnumber}`
        })
    }
    
}

function writeFile(content: string, file: string){
    fs.writeFileSync(file, content)
}


client.on('messageCreate', (message) =>{
    //console.log(message.content)!
    if (!message.content.startsWith(`!p play`)){
        message.content = message.content.toLowerCase()
    }

    if (message.author === client.user || message.content.startsWith('.')) {
        //Do nothing
        return
    }if (message.guildId === '824352276742275093' && working && (message.content.startsWith('<@1075173399342629024>') || message.channelId=='1102335594253795419' || message.channelId=='1123752426218987601')){
        message.reply({
            content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
        })
        return
    }
    

    if(message.content.startsWith('!p')){
        runCommand(message, message.content.replace("!p ", ""))
    }else if (message.content.startsWith('can you generate that again')){
        if (previousPrompt != ''){
            console.log(previousPrompt)
            generateImage(message, previousPrompt, lastReal)
        }else{
            message.reply({
                content: "Sorry, I haven't generated anything since Stan restarted me :("
            })
        }
    }else if (message.content.startsWith('<@1075173399342629024>')) {
        var question = message.content.replace("<@1075173399342629024>", "")
        askGpt(message, question, false)

    }else if (message.mentions.has('1075173399342629024')){
        askGpt(message, message.content, false)
    }else if(message.channelId=='1123752426218987601'){ //TEXT kck
        if(message.content == 'can you show me what you look like?'){
            generateImage(message, "(AI catgirl named Mela:1.1), light grey hair, cat ears, cat tail, blue eyes, B sized breasts, overwhelmingly cute,", false)
        }else if(message.content.startsWith('can you show me you')){
            var prompt = message.content.replace("can you show me you", "(AI catgirl named Mela:1.1), light grey hair, cat ears, cat tail, blue eyes, B sized breasts, overwhelmingly cute, ")
            console.log(prompt)
            generateImage(message, prompt, false)
        }else if(message.content.startsWith('can you generate')){
            var prompt = message.content.replace("can you generate ", "")
            console.log(prompt)
            if(prompt.startsWith('real')){
                var prompt = prompt.replace("real", "")
                console.log(prompt)
                generateImage(message, prompt, true)
            }else{
                console.log(prompt)
                generateImage(message, prompt, false)
            }
        }
        else{
            askGpt(message, message.content, false)
        }
    }else if (message.channelId=='1168159743320264724'){
        askGpt(message, message.content, true)
    }
    else if(message.channelId=='1123703366040690850'){ //TEXT private
        if(message.content == 'can you show me what you look like?'){
            generateImage(message, "(AI catgirl named Mela:1.1), light grey hair, cat ears, cat tail, blue eyes, B sized breasts, overwhelmingly cute,", false)
        }else if(message.content.startsWith('can you show me you')){
            var prompt = message.content.replace("can you show me you", "(AI catgirl named Mela:1.1), light grey hair, cat ears, cat tail, blue eyes, B sized breasts, overwhelmingly cute, ")
            console.log(prompt)
            generateImage(message, prompt, false)
        }else if(message.content.startsWith('can you generate')){
            var prompt = message.content.replace("can you generate ", "")
            console.log(prompt)
            if(prompt.startsWith('real')){
                var prompt = prompt.replace("real", "")
                console.log(prompt)
                generateImage(message, prompt, true)
            }else{
                console.log(prompt)
                generateImage(message, prompt, false)
            }
        }else if(message.content.startsWith('cg')){
            var prompt = message.content.replace("cg", "")
            generateImage(message, prompt, false)
        }else{
            console.log('test')
            askGpt(message, message.content, false)}
    }else if (message.channelId=='1167940050680545371'){
        askGpt(message, message.content, true)
    }else if (message.content.startsWith('it is what it is')){
        itwit(message, true)
    }else if (message.content.startsWith('welp')){
        message.reply({
            content: 'it is what it is'
        })
        itwit(message, false)
    }
})



client.on('ready', () =>{
    resetAI()
    console.log('The bot is ready')
})


var myUrl='http://api.omniinfer.io/v2/txt2img'
var lastReal = false
async function generateImage(message: any, prompt: string, realism: boolean){
    previousPrompt = prompt
    lastReal = realism
    message.channel.sendTyping()
    console.log(prompt)
    if (realism){
        var model = 'majicmixRealistic_v2'
    } else {
        var model = 'meinamix_meinaV6_13129'
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
    }` 
    const response = await fetch(myUrl, {
        method: 'POST',
        body: content,
        headers: {'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
        'Content-Type': 'application/json',
        'X-Omni-Key': `${omniKey}` } 
    })
    const bodyS = await response.json()
    console.log(bodyS)
    const ID = bodyS.data.task_id

    console.log(ID)

    getImage(message, ID)
}

async function getImage(message: any, taskID: string){
    const myURL = 'http://api.omniinfer.io/v2/progress?task_id='+taskID
    setTimeout(async function(){
    try{
        message.channel.sendTyping()
        const responseImage = await fetch(myURL, {
            method: 'GET',
            headers: {'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
            'X-Omni-Key': `${omniKey}` } 
        })
        const bodyImage= await responseImage.json()
        const imageURL = bodyImage.data.imgs[0]
        console.log(imageURL)
    
        message.reply({
            content: imageURL
        })
    }catch{
        try{setTimeout(async  function(){
            message.channel.sendTyping()
            const responseImage = await fetch(myURL, {
                method: 'GET',
                headers: {'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                'X-Omni-Key': `${omniKey}` } 
            })
            const bodyImage= await responseImage.json()
            const imageURL = bodyImage.data.imgs[0]
            console.log(imageURL)
        
            message.reply({
            content: imageURL
            })
        }, 10000)}
        catch{
            try{
                message.channel.sendTyping()
                setTimeout(async  function(){
                const responseImage = await fetch(myURL, {
                    method: 'GET',
                    headers: {'User-Agent': 'Apifox/1.0.0 (https://www.apifox.cn)',
                    'X-Omni-Key': `${omniKey}` } 
                })
                const bodyImage= await responseImage.json()
                const imageURL = bodyImage.data.imgs[0]
                console.log(imageURL)
            
                message.reply({
                content: imageURL
                })
            }, 10000)
            }catch{
                message.reply({
                    content: 'Sorry, that image generation took too long to respond - try a different image'
                })
            } 
        }
    }
    }, 10000)
   
}

export {generateImage, stablediff}

