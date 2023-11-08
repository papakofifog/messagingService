require('dotenv').config();
const Server = require('socket.io');
const cors= require('cors');
const express= require('express');
const app = express();
let http=require('http');
const server = http.createServer(app);

const clients = new Map();

app.use(cors({origin:'http://localhost:5173'}));

const sio = Server(server, {
    cors: {
        origin: "http://localhost:5173"
  }
});


function sendMessageToReceiver(clientSocket,data){
    //console.log(clientSocket)
    clients.get(clientSocket).emit('receiveMessage', data)
}

function sendTypingStatus(clientSocket, data){
    clients.get(clientSocket).emit('typingStatus', data);
}

function sendMessageEditedNotification(clientSocket, data){
    clients.get(clientSocket).emit('messageEdited', data);
}

function sendMessageDeletedNotification(clientSocket, data){
    console.log(data)
    clients.get(clientSocket).emit('messageDeleted', data);
}

sio.on("connection", function(socket){
    socket.on('setUserId', async (msg)=> {
        console.log(msg)
        if(msg !=""){
            clients.set(msg, socket) 
        }
    })
    // When a client sends a message
    socket.on('sendMessage', async (data)=> {
        //console.log(data)
        let clientSocket= data.recipientId
        if (clients.has(clientSocket)) {
            //save chat 
            //console.log(data)
            sendMessageToReceiver(clientSocket,data);
        }else{
            
            clients.set(data.recipientId,socket);
        }

    });

    socket.on('messageHasBeenEdited', (data)=>{
        let clientSocket= data.recipient;
        if (clients.has(clientSocket)){
            sendMessageEditedNotification(clientSocket, data);
        }
    })

    socket.on("messageHasBeenDeleted", (data)=>{
        let clientSocket= data.recipient;
        if (clients.has(clientSocket)){
            sendMessageDeletedNotification(clientSocket, data);
        }
    })

    

    socket.on('isTyping', (data)=>{
        let clientSocket= data.recipient;
        if (clients.has(clientSocket)){
            sendTypingStatus(clientSocket, data);
        }
    })

});

server.listen(process.env.PORT)
console.log(`Server running on",${process.env.PORT}`)