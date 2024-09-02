const express= require('express');
const app = express();
const indexRouter = require('./routes/index')
const path = require('path')
const http = require('http')
const socketIO = require('socket.io');

const server = http.createServer(app)
const io = socketIO(server)

app.set('view engine', 'ejs');

let waitingUsers = []
let rooms = {}


io.on('connection', (socket) => {
    socket.on('joinroom', ()=>{
        if(waitingUsers.length > 0){
            let partner = waitingUsers.shift()
            const roomname= `${socket.id}-${partner.id}`
            socket.join(roomname)
            partner.join(roomname)

            io.to(roomname).emit('joined', roomname)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
        } else {
            waitingUsers.push(socket)
        }
    })
    socket.on("signalingMessage", (data)=>{
        socket.broadcast.to(data.room).emit('signalingMessage', data)
    } )
    socket.on('message',(data) =>{
        
        socket.broadcast.to(data.room).emit('message', data)
        
    })

    socket.on('startVideoCall',({room})=>{
        socket.broadcast.to(room).emit('incomingCall')
    })
    socket.on('acceptCall',({room})=>{
        socket.broadcast.to(room).emit('callAccepted')
    })
    socket.on('rejectCall',({room})=>{
        socket.broadcast.to(room).emit('callRejected')
    })

    socket.on('disconnect', () => {
        let index = waitingUsers.findIndex(user=>user.id === socket.id)
        waitingUsers.splice(index, 1)
    });
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))


app.use("/", indexRouter)

app.use((req, res, next) => {})

server.listen(3000, () => {
    console.log('io is running on port http://localhost:3000');
})