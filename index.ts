import { createAudioPlayer } from '@discordjs/voice'
import DiscordJS, { Client, EmbedBuilder, GatewayIntentBits, Guild, VoiceChannel } from 'discord.js'
import dotenv from 'dotenv'
import ytdl from 'ytdl-core';
import {resetAI, askGpt} from './gptAI'
import ytpl from 'ytpl'

dotenv.config()

var working=false
var stablediff=false
var previousPrompt = ''
const omniKey = process.env.OMNIKEY
var queue:any[] = []
const player = createAudioPlayer()
var alreadyplaying = false

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

const voiceDiscord = require('@discordjs/voice')
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')


async function startPlay(message: any, link: string){
    console.log(`Added ${link} to the queue`)
    const channel = message.member?.voice.channel;
    if (channel) {
        try{

            if (link.includes('playlist')){
                const playlist = await ytpl(link);
                const songUrls = playlist.items.map((item) => item.url);

                for (const songUrl of songUrls) {
                    const songInfo = await ytdl.getInfo(songUrl);
                    const song = {
                        songNumber: 'null', 
                        title: songInfo.videoDetails.title,
                        url: songInfo.videoDetails.video_url
                      }
                      queue.push(song)
                      if (queue.length === 1) {
                        playSong(channel, message)
                    }
                }
                
            }else{

                const songInfo = await ytdl.getInfo(link)
                
                const song = {
                    songNumber: 'null', 
                    title: songInfo.videoDetails.title,
                    url: songInfo.videoDetails.video_url
                }
                queue.push(song)
            
                if (queue.length === 1) {
                    playSong(channel, message)
                }

                message.reply({
                    content: `Added ${link} to the queue 😃`
                })
            }
        }catch{
                message.reply({
                    content: `That link is invalid, please make sure it is not age restricted or in a private playlist`
                })
            }
            
            
        }else{
            message.channel.send("You need to be in a voice channel to use this command, darling.");
        }
        
 }
        


async function playSong(voiceChannel: any, message: any) {
    const channel = message.member?.voice.channel;


    const connection = voiceDiscord.joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator
    })
        
    const stream = ytdl(queue[0].url, {
        filter: "audioonly",
        quality: 'highestaudio',
        highWaterMark: 1 << 25
    })

    const dispatcher = createAudioResource(stream);

    connection.subscribe(player)

    player.play(dispatcher);


    if (!alreadyplaying){
        player.addListener("stateChange", (oldOne, newOne) => {
            if (newOne.status == "idle") {
                queue.shift();
                if (queue.length > 0) {
                    alreadyplaying = true 
                    playSong(voiceChannel, message);
                } else {
                    try{
                        if(connection){
                            connection.destroy()
                        }
                         
                    }catch(error){
                        console.log(error)
                    }
                }
            }
        })
    }
    ;

        
        
}


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
    }else if (command.startsWith('play')){
            command = command.replace('play ', '')
            if(command.includes('&')){
                command = command.split('&')[0]
            }
            startPlay(message, command)
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
    }else if (command === 'queue'){
        try{
            console.log(queue)
            for (let i = 0; i < queue.length; i++){
                if(i === 0){
                    queue[i].songNumber = `${i+1} Now Playing:     `
                }else if(i === 1){
                    queue[i].songNumber = `${i+1} Next up:     `
                }else{
                    queue[i].songNumber = `${i+1}:    `
                }
            }
            
            console.log(queue)
            const queueEmbed = new EmbedBuilder()
            .setTitle("🎵 Music Queue 🎵")
            .setDescription(queue.map(song => `**${song.songNumber}** ${song.title} - ${song.url}`).join('\n'))
            .setColor('#FF0000')

            message.reply({
                embeds: [queueEmbed]
            })
        }catch(error){
            message.reply({
                content: `The queue seems to be empty. 😔` 
            })
            console.log(error)
        }
        
    }else if (command === 'pause'){
        pauseSong()
        message.reply({
            content: "Song paused darling, embrace the silence. 😈😉"
        })
    }else if (command === 'resume'){
        resumeSong()
        message.reply({
            content: "Song resumed 😊"
        })
    }else if (command === 'skip'){
        skipSong()
        message.reply({
            content: "You don't like that one huh? 🤔 Skipped it for you. 🥰"
        })
    }else if (command.startsWith('goto')){
        try{
            var intiger = parseInt(command.replace('goto ',''))
            goTo(intiger-2)
            message.reply({
                content: `Skipped to number ${intiger}.`
            })
        }catch(error){
            console.log(error)
            message.reply({
                content: `An error occured while skipping.`
            })
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

function goTo(index: number){
    queue = queue.splice(index)
    skipSong()
}

client.on('messageCreate', (message) =>{
    //console.log(message.content)
    
    if (message.author === client.user || message.content.startsWith('.')) {
        //Do nothing
        return
    }if (message.guildId === '824352276742275093' && working && (message.content.startsWith('<@1075173399342629024>') || message.channelId=='1102335594253795419' || message.channelId=='1123752426218987601')){
        message.reply({
            content: 'Sorry, I am currently being worked on - ask Stan when my upgrades will be done if you want an estimate'
        })
    }

    if(message.content.startsWith('!p')){
        runCommand(message, message.content.replace("!p ", ""))
    }else if (message.content.startsWith('Can you generate that again')){
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
        if(message.content == 'Can you show me what you look like?'){
            generateImage(message, "(AI girl named Mela:1.1), light grey hair, blue eyes, overwhelmingly cute", false)
        }else if(message.content.startsWith('Can you show me you')){
            var prompt = message.content.replace("Can you show me you", "(AI girl named Mela:1.1), light grey hair, blue eyes, ")
            console.log(prompt)
            generateImage(message, prompt, false)
        }else if(message.content.startsWith('Can you generate')){
            var prompt = message.content.replace("Can you generate ", "")
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
    }else if(message.channelId=='1123703366040690850'){ //TEXT private
        if(message.content == 'Can you show me what you look like?'){
            generateImage(message, "(AI girl named Mela:1.1), light grey hair, blue eyes, overwhelmingly cute", false)
        }else if(message.content.startsWith('Can you show me you')){
            var prompt = message.content.replace("Can you show me you", "(AI girl named Mela:1.1), light grey hair, blue eyes, ")
            console.log(prompt)
            generateImage(message, prompt, false)
        }else if(message.content.startsWith('Can you generate')){
            var prompt = message.content.replace("Can you generate ", "")
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
        var model = 'sd_xl_base_1.0'
    } else {
        var model = 'darkSushiMixMix_225D_64380'
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

