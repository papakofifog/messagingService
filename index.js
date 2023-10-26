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

function sendTypingStatus(clientSocket, status){
    clientSocket.get(clientSocket).emit('typingStatus', false);
}

sio.on("connection", function(socket){
    socket.on('setUserId', async (msg)=> {
        if(msg !=""){
            clients.set(msg, socket) 
        }
    })
    // When a client sends a message
    socket.on('sendMessage', async (data)=> {
        let clientSocket= data.recipientId
        if (clients.has(clientSocket)) {
            //save chat 
            console.log(data)
            sendMessageToReceiver(clientSocket,data);
        }else{
            
            clients.set(data.recipientId,socket);
        }

    });

    socket.on('onTyping', (activeUserId)=>{
        console.log("hello")
        if (clients.has(activeUserId)){
            sendTypingStatus(activeUserId, true);
        }
    })

    socket.on ('stopedTyping', (activeUserId)=>{
        if (clients.has(activeUserId)){
            sendTypingStatus(activeUserId, false);
        }
    })
});

server.listen(process.env.PORT)
console.log(`Server running on",${process.env.PORT}`)