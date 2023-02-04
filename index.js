import dotenv from 'dotenv'
dotenv.config();

import express from 'express';
import fs from 'fs'
import { ChatGPTAPIBrowser } from 'chatgpt'
import {getTopicsFromSQL} from './runChatGPT.js'
import { getDatafromSQLToGenerateImage } from './generateImages.js';

const app = express();
app.use(express.static('public'));

import http from 'http';
const server = http.createServer(app);

import { Server } from "socket.io";
import { getDatafromSQLToCompressImage } from './compressImages.js';
import { getDataForBuildHTML } from './buildActualHTML.js';
import { deployToFirebase } from './deployToFirebase.js';
import { getDataForFirebaseDB } from './syncDBToFirebase.js';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { buildTopicList } from './generateTopics.js';

const io = new Server(server);

global.socketIo = io;

const firebaseConfig = {
    apiKey: process.env['apiKey'],
    authDomain: process.env['authDomain'],
    projectId: process.env['projectId'],
    storageBucket: process.env['storageBucket'],
    messagingSenderId: process.env['messagingSenderId'],
    appId: process.env['appId']
};
  
global.f_app = initializeApp(firebaseConfig);

global.db = getFirestore(f_app);

global.api = new ChatGPTAPIBrowser({
    email: process.env['email'],
    password: process.env['password']+'#',
    isGoogleLogin: true,
})

try{
    await api.initSession()
}catch(e){
    
}

app.get('/', (req, res) => {
    if (fs.existsSync('./public/index.html')) {
        res.sendFile('./public/index.html');
    }
    else {
        res.status(404).send('404 Not Found');
    }
});

app.get('/buildTopic', async(req, res)=>{
    
    let topic = req.query.topic;
    let subtopic = req.query.subtopic;

    if(topic.length>0 && subtopic.length>0){
        let tags = [
            [subtopic, topic]
        ]
        await buildTopicList(tags);
    }


    socketIo.emit('--ENABLE-BTN--', 'TRUE');

    res.send('DONE')

})


io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('trigger', async(msg) => {
        console.log('message: ' + msg);

        if(msg=='1'){
            await getTopicsFromSQL();
        }
        if(msg=='--IMAGE'){
            await getDatafromSQLToGenerateImage();
        }
        if(msg=='--COMPRESS'){
            await getDatafromSQLToCompressImage();
        }
        if(msg=='--BUILDHTML'){
            await getDataForBuildHTML();
        }
        if(msg=='--FIREBASEDEPLOY'){
            await deployToFirebase();
        }
        if(msg=='--FIREBASEDBSYNC'){
            await getDataForFirebaseDB();
        }
    });
    
});

server.listen(3000, () => {
  console.log('Server started on port 3000');
});