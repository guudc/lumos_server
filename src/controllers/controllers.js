const { exec } = require('child_process');



//to wrap tokens user
exports.wrap = (req, res) => {
    //create new wallet address
    try{    
        req = req.body;
        if(req.code && req.issuer){  
            // Replace 'your-shell-command' with the actual shell command you want to execute.
            const cmd = 'soroban lab token wrap --network testnet --asset "' + req.code + ':' + req.issuer + '"'
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    let msg;
                    if(error.message.indexOf('already exists')) {
                        msg = 'exists'
                    }
                    else {msg = 'something went wrong'}
                    res.send(JSON.stringify({status:error, msg:msg}))
                }else if (stderr) {
                    res.send(JSON.stringify({status:error, msg:'something went wrong'}))
                }
                else {
                    res.send(JSON.stringify({status:true, id:stdout}))
                }
            });
        }
        else{res.send(JSON.stringify({status:error, msg:'fields missing'}))}
    }
    catch(e){console.log(e);res.send(JSON.stringify({status:error, msg:'something went wrong'}))}    
}  