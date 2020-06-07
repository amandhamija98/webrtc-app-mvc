var currentUserName = UserName;
var activeUsers = [];
var onCall = false;
var mediaConstraints = {
    audio: true, 
    video: true 
  };
var myPeerConnection = null;
var targetConnectionId;

var videoCallProxy = $.connection.videoCallHub;
//$.connection.hub.logging = true
$.connection.hub.error(reportError);

$.connection.hub.start().done(function () {
    console.log("SignalR connection begun");
    videoCallProxy.server.newUser(currentUserName)
    .done(()=> console.log("Other users have been informed of new user"))
    .fail(reportError);
})
.fail(reportError);

videoCallProxy.client.newUserJoined = function (newUserInfo) {
    activeUsers.push(newUserInfo);
    var newUserCard = makeNewUserCard(newUserInfo["UserName"],newUserInfo["ConnectionId"]);
    console.log(newUserInfo);
    document.getElementById("activeUsersList").appendChild(newUserCard);
    videoCallProxy.server.
    greetNewUser(newUserInfo["ConnectionId"],currentUserName,onCall).
    fail(reportError);
};

videoCallProxy.client.existingUserGreeting = function (existingUserInfo) {
    activeUsers.push(existingUserInfo);
    var existingUserCard = makeNewUserCard(existingUserInfo["UserName"], existingUserInfo["ConnectionId"]);
    document.getElementById("activeUsersList").appendChild(existingUserCard);
}


/****Utility Functions******/

function makeNewUserCard(name,id){
    var card = document.createElement("div");
    card.id = id;
    card.addEventListener("click",userCardOnClickListener);
    card.classList.add("list-group-item");
    card.classList.add("active-user-card");
    var cardBody = document.createElement("h4");
    cardBody.innerText = name;
    card.appendChild(cardBody);
    return card;
};

function userCardOnClickListener(){
    if(myPeerConnection){
        alert("You are already on a call");
        return ;
    }

    targetConnectionId = this.id; //connectionId of clicked user

    // if( !!activeUsers.find(user=> user.connectionId === targetConnectionId)){
    //     alert("This user is already on another call");
    //     return;
    // }
    
    //to-do: upadate on call value for all peers

    //createPeerConnection();

    navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(function(localStream) {
      document.getElementById("vid-small").srcObject = localStream;
      localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
    })
    .catch(handleGetUserMediaError);
}

function reportError(err){
    console.error(err.toString());
}

/****Utility Functions******/