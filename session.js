var baseUrl = "https://YOUR_OKTA_DOMAIN.com";

var loginbtn = document.getElementById("loginbtn").addEventListener("click", login);

var username = document.getElementById("username");
var password = document.getElementById("password");

function loggedIn(user) // will be triggered once the 'sid' cookie is set.
{
    var sessionDiv = document.getElementById("sessions_me");
    var userHolder = document.getElementById("user");
    userHolder.innerText = user;
    sessionDiv.classList.toggle("hide");
};

async function getJSONData(url)
{
    var res = await fetch(url, {
        method:"GET",
        mode: "cors",
        credentials: "include"
    });
    var rez = await res.json();
    return rez;
}

async function postJSONData(url, data)
{
    var res = await fetch(url, {
        method:"POST",
        mode:"cors",
        body:JSON.stringify(data),
        headers: {"Content-Type":"application/json"}
    });
    var rez = await res.json();
    return rez;
}


async function postFormData(url, data){
    var res = await fetch(url, {
        method: "POST",
        mode: "cors",
        body: data,
        headers: {"Content-Type": "application/x-www-form-urlencoded"}
    });
    var rez = await res.json();
    return rez;
}

async function login()
{
    var authnUrl = `${baseUrl}/api/v1/authn`;
    var authnData = {
        username: username.value,
        password: password.value
    }
    var authnRes = await postJSONData(authnUrl, authnData);
    var sessionToken = authnRes.sessionToken;

    var params = {
        token: sessionToken,
        redirectUrl: "https://google.com"
    }
    var sessionsData = Object.keys(params).map(function(key){
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
      }).join('&');
    
    var sessionsUrl = `${baseUrl}/login/sessionCookieRedirect`;

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.open("POST", sessionsUrl)
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onerror = async function() { // This supposed and desired to fail with a CORS error. Session checking will be done only after the CORS failure.
        var sessionsUrl = `${baseUrl}/api/v1/sessions/me`;
        var user = await getJSONData(sessionsUrl)
        user = user._links.user.name
        loggedIn(user);
    }
    xhr.send(sessionsData);
}
