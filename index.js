const express = require('express');
const {conversation} = require('@assistant/conversation');
const userData = require('./cf-api-req');

//Set port
const port = process.env.PORT || 3000;

//Initialise google action conversation
const assistant = conversation();

//Filter the username
let filter = str => {
    let final_str = '';
    for(let i=0;i<str.length;i++)    {
        if(str[i] !== ' ')
            final_str += str[i];
    }
    return final_str;
}

//Updates user's username in user storage
assistant.handle('update_username', async conv => {
    let userName = filter(conv.session.params.userName);
    await userData(userName).then(data => {
        if(data.server_err == true) {
            conv.session.params.addUserStatus = "server_error";
        }
        else if(data.res_err == true)   {
            conv.session.params.addUserStatus = "res_error";
        }
        else    {
            conv.session.params.addUserStatus = "success";
            conv.user.params.userName = userName;
        }
        })
});

//Remove user's username from user storage
assistant.handle('rm_username', async conv => {
    conv.user.params.userName = '!';
});

//Fetches the information
assistant.handle('user_info', async conv => {
    let userName = conv.user.params.userName;
    await userData(userName).then(data => {
        let speech = '';
        if(data.server_err == true)
            speech = 'Sorry there was an error connecting to server.';
        else if(data.res_err == true)
            speech = 'Sorry there was an error collecting information.';
        else if(data.rating == null)
            speech = 'Sorry you have not participated in any contest till now.';
        else
            speech = userName + ', your rating is ' + data.rating + ' and your rank is ' + data.rank + '.';
        conv.add(speech);
    })
});

//Server
const expressApp = express().use(express.json());
expressApp.post('/fulfillment', assistant);
expressApp.listen(port);