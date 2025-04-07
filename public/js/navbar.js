document.querySelector('#destroy-session')
.addEventListener('click', async () => {
    fetch('/api/v1/logout', {
        method: 'post'
    })
    .then(function(res) {
        return res.json();
    })
    .then(function(res) {
        window.location.href = res.loginroute;
    })
    .catch(function(err) {
        console.log(err);
    });
});