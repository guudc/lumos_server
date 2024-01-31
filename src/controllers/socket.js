/*
    Handles the socket
    controllers
*/

const { BACKEND_API } = require("../../data");

var USERS = []

//client functions here
exports.connect = async (socket, io) => {
    //to register user
    socket.on('register', async (data, callback) => {  
        USERS[data.id] = socket;
        socket.data = {id:data.id, dao:data.dao}
        callback()
    })
    //to send message to another user
    socket.on('msg', async (data, callback) => {
        //save to db first
        if(data.msg && data.receiver) {
            let res = await fetch(`${BACKEND_API}send_msg&msg=` + encodeURIComponent(data.msg) + '&receiver=' + data.receiver + '&sender=' + socket.data.id + '&dao_id=' + socket.data.dao)
            if(res.ok) {
                /* Send to client */
                res = await res.text()
                if(res == 1) {
                    //send to receiver
                    if(USERS[data.receiver]) {
                        if(USERS[data.receiver].data.dao == socket.data.dao) {
                            USERS[data.receiver].emit('msg', {msg:data.msg, date:(new Date(Date())).getTime(), sender:socket.data.id})
                        }
                    }
                    callback({stauts:true})
                }else {callback({stauts:false})}
                
            }    
            else{callback({stauts:false})}
        }
    })
    //to send message to another user
    socket.on('broadcast', async (data, callback) => {
        //first check if its an admin
        if(data.msg) {
            //verify admin
            let res = await fetch(`${BACKEND_API}isadmin&signer=` + socket.data.id + '&dao_id=' + socket.data.dao)
            if(res.ok) {
                res = await res.text()
                if(res == 1){
                    res = await fetch(`${BACKEND_API}send_msg&msg=` + encodeURIComponent(data.msg) + '&receiver=all&sender=' + socket.data.id + '&dao_id=' + socket.data.dao)
                    if(res.ok) {
                        /* Send to all */
                        res = await res.text()
                        if(res == 1) {
                            //send to receiver
                            socket.broadcast.emit('broadcast', {msg:data.msg, date:(new Date(Date())).getTime(), sender:socket.data.id, dao: socket.data.dao})
                            callback({stauts:true})
                        }else {callback({stauts:false})}
                        
                    }    
                    else{callback({stauts:false})}
                }
                else{callback({stauts:false})}
            }
            else{callback({stauts:false})}
        }
        //save to db first
        /* Send to all client */
    })
    //disconnected
    socket.on('disconnect', (reason) => {
        //remove from list of servers
        if(socket.data.id){
          USERS[socket.data.id] = null
        }
    })
}