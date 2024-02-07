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
        //schronize
        let res = await fetch(`${BACKEND_API}get_msg&signer=` + data.id + '&dao_id=' + data.dao + '&index=' + data.index)
        if(res.ok) {
            res = JSON.parse(await res.text())
            callback({status:true, data:res})
            //then register
            USERS[data.id] = socket;
            socket.data = {id:data.id, dao:data.dao}
        }
        else {callback({status:false})}
    })
    //to send message to another user
    socket.on('msg', async (data, callback) => {
        //save to db first
        if(data.msg && data.receiver) {
            if(USERS[socket.data.id]) {
                if(USERS[socket.data.id].id === socket.id) {
                    let res = await fetch(`${BACKEND_API}send_msg&msg=` + encodeURIComponent(data.msg) + '&receiver=' + data.receiver + '&sender=' + socket.data.id + '&dao_id=' + socket.data.dao)
                    if(res.ok) {
                        /* Send to client */
                        res = await res.text()
                        if(res != 0) {
                            const dte = (new Date(Date())).getTime()
                            callback({status:true, id:res, date:dte})
                            //send to receiver
                            if(USERS[data.receiver]) {
                                if(USERS[data.receiver].data.dao == socket.data.dao) {
                                    USERS[data.receiver].emit('msg', {msg:data.msg, date:(new Date(Date())).getTime(), sender:socket.data.id, id:res})
                                }
                            }
                        }else {callback({status:false})}
                    }else{callback({status:false})}
                }    
                else{callback({status:'logout'})}
            }
            else{callback({status:'logout'})}
        }
        else {
            callback({status:false})
        }
    })
    //to send message to another user
    socket.on('broadcast', async (data, callback) => {
        //first check if its an admin
        if(data.msg) {
            if(USERS[socket.data.id].id === socket.id) {
                //verify admin
                let res = await fetch(`${BACKEND_API}isadmin&signer=` + socket.data.id + '&dao_id=' + socket.data.dao)
                if(res.ok) {
                    res = await res.text()
                    if(res != 0){
                        res = await fetch(`${BACKEND_API}send_msg&msg=` + encodeURIComponent(data.msg) + '&receiver=all&sender=' + socket.data.id + '&dao_id=' + socket.data.dao)
                        if(res.ok) {
                            /* Send to all */
                            res = await res.text()
                            if(res != 0) {
                                const dte = (new Date(Date())).getTime()
                                callback({status:true, id:res, date:dte})
                                //send to receiver
                                socket.broadcast.emit('msg', {msg:data.msg, date:dte, sender:socket.data.id, dao: socket.data.dao, id:res})
                            }else {callback({status:false})}
                            
                        }    
                        else{callback({status:false})}
                    }
                    else{callback({status:false})}
                }
                else{callback({status:false})}
            }
            else{callback({status:'logout'})}
        }
        //save to db first
        /* Send to all client */
    })
    //to read a message
    socket.on('read', async (data, callback) => {
        if(socket.data.id) {
            let res = await fetch(`${BACKEND_API}read_msg&reader=` + socket.data.id + '&sender=' + data.sender + '&id=' + data.msgId + '&dao_id=' + socket.data.dao)
            if(res.ok) {
                callback({status:true})
                if(USERS[data.sender]) {
                    if(USERS[data.sender].data.dao == socket.data.dao) {
                        USERS[data.sender].emit('read', {id:data.msgId, reader:socket.data.id})
                    }
                }
            }
            else {callback({status:false})}
        }
        else {callback({status:'logout'})}
    })
    //disconnected
    socket.on('disconnect', (reason) => {
        //remove from list of servers
        if(socket.data.id){
          USERS[socket.data.id] = null
        }
    })
}
