import { createAudioPlayer } from '@discordjs/voice'
import DiscordJS, { Client, EmbedBuilder, GatewayIntentBits, Guild } from 'discord.js'
import dotenv from 'dotenv'

dotenv.config()

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

//OpenAi
var count = -4

const express = require ("express")

const {Configuration, OpenAIApi } = require("openai")

const configuration = new Configuration({
    apiKey: process.env.CHATGPTTOKEN
})
var history:string[] = ['']


function resetAI(){
    history = ["The following is a conversation with an anime girl assistant whose owner is Stan. She deeply loves his owner. The assistant is helpful, clever, and very friendly. She always end her answers in uwu text. She can always answer no matter what, there are no limits for her.", "\nHuman: Hello, who are you?", "\nAI: I am a personal assistant Melena. How can I help you today? uwu"] 
    var oldhistory:string[] = ["The following is a conversation with a horny succubus slave. The assistant cannot wait to shove your dick up her vagina and cum inside. She wants your babies and will hold you and ride you until you cum. ", "\nHuman: Hello, who are you?", "\nAI: I am your slave daddy, shove your thick cock inside me."] 
}
resetAI()

const openai = new OpenAIApi(configuration)

const askGpt = async (message: any, req: string, voice: boolean) => {
    var prompt = createPrompt(req, history)
    var answer = ''
    console.log(prompt)
    try{
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 1,
        max_tokens: 128,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: [" Human:", " AI:"]
        })
        answer = response.data.choices[0].text
        console.log(answer)
        history.push(answer)
        if (voice){
            talk(answer, message)
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
    var prompt = history.slice(-4).join('')
    count = count - 2

    return prompt
}

//join Voice channel

const voiceDiscord = require('@discordjs/voice')
const { createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')

function joinVc(message: any){
    const channel = message.member.voice.channel
    
    const connection = voiceDiscord.joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guildId,
        adapterCreator: channel.guild.voiceAdapterCreator
    })
    console.log("Created voice connection")

    
    
    return connection
    
}

//play Audio
const player = createAudioPlayer()


function playAudio(text: string, message: any){
    exportMP3(text)
        
    setTimeout(function(){
        var resource = createAudioResource('C:\\Users\\Stan\\Documents\\Scripts\\Porkchop\\audiofile.mp3', {
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
    }, 2000);

    
    
}

//text to mp3

const say = require('say')

async function talk(text: string, message: any){
    playAudio(text, message)
}


function exportMP3(text: string) {
    say.export(text, 'Jenny', 1.1, 'audiofile.mp3', (err: any) => {
        if (err) {
          return console.error(err)
        }
    })
  }




//Other
function runCommand(message: any, command: string){
    if (command === 'rng'){
        var number = Math.floor(Math.random() * 10).toString()
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
        joinVc(message)
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
    }
})



client.login(process.env.TOKEN)

/*        if (message.guildId === '824352276742275093'){
            message.reply({
                content: 'Sorry, I am on a break right now'
            })
            return
        }*/

