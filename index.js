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
    console.log(clientSocket)
    clients.get(clientSocket).emit('receiveMessage', data)
}

function sendTypingStatus(clientSocket){
    clientSocket.get(clientSocket).emit('typing', 'typing...');
}

sio.on("connection", function(socket){
    
    
    socket.on('setUserId', async (msg)=> {

        if(msg !=""){
            clients.set(msg, socket) 
        }
        
        
    })
    // When a client sends a message
    socket.on('sendMessage', async (data)=> {
        let clientSocket= data.receipientId
        if (clients.has(clientSocket)) {
            //save chat 

            console.log(data)
            sendMessageToReceiver(clientSocket,data);
        }else{
            
            clients.set(data.recipientId,socket);
        }

    });

    socket.on('typing', (receipientId)=>{
        let clientSocket=receipientId;
        if (clients.has(clientSocket)){
            
            sendTypingStatus(receipientId);
        }else{
            clients.set(receipientId,socket);
            sendTypingStatus(receipientId);
        }
    })
});

server.listen(process.env.PORT)
console.log(`Server running on",${process.env.PORT}`)