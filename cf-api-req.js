const axios = require('axios');

module.exports = userInfo = async function(username) {
    let fetchData = {};
    let url = 'https://codeforces.com/api/user.info?handles='+username;
    await axios.get(url)
    .then(response => {
        let data = response.data;
        if('rating' in data.result[0] == false || 'rank' in data.result[0] == false)   {
            fetchData = {rating: null, rank: null, res_err: null, server_error: null};
        }
        else    {
            fetchData = {rating: data.result[0].rating, rank: data.result[0].rank, res_err: null, server_error: null}
        }
    })
    .catch(error => {
        let err_str = "handles: User with handle "+username+" not found";
        if('comment' in error.response.data == true && error.response.data.comment == err_str)
            fetchData = {rating: null, rank: null, res_err: true, server_error: null};
        else
        fetchData = {rating: null, rank: null, res_err: null, server_error: true};
    });
    return fetchData;
}

