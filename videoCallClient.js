var currentUserName = UserName;
var groupID = GroupID;
var activeUsers = [];
var onCall = false;
var mediaConstraints = {
    audio: true, 
    video: true,
    video: {width: {min: 1280}, height: {min: 720}}
  };

var myPeerConnection = null;
var targetConnectionId;

var videoCallProxy = $.connection.videoCallHub;
//$.connection.hub.logging = true
$.connection.hub.error(reportError);
$.connection.hub.disconnected(function () {
    setTimeout(function () {
        $.connection.hub.start();
    }, 5000); // Restart connection after 5 seconds.
});

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

videoCallProxy.client.receiveNewIceCandidate = handleNewICECandidateMsg;

videoCallProxy.client.receiveVideoOffer = handleVideoOfferMsg;

videoCallProxy.client.receiveVideoAnswer = handleVideoAnswerMsg;

$.connection.hub.start().done(function () {
  console.log("SignalR connection begun");
  videoCallProxy.server.newUser(currentUserName,groupID)
  .done(()=> console.log("Other users have been informed of new user"))
  .fail(reportError);
})
.fail(reportError);

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

    createPeerConnection();

    navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(function(localStream) {
      document.getElementById("vid-small").srcObject = localStream;
      localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
    })
    .catch(handleGetUserMediaError);
}

function handleGetUserMediaError(e) {
    switch(e.name) {
      case "NotFoundError":
        alert("Unable to open your call because no camera and/or microphone" +
              "were found.");
        break;
      case "SecurityError":
      case "PermissionDeniedError":
        // Do nothing; this is the same as the user canceling the call.
        break;
      default:
        alert("Error opening your camera and/or microphone: " + e.message);
        break;
    }
  
    closeVideoCall();
}

function reportError(err){
    console.error(err.toString());
}

/****Utility Functions******/


/********* RTC peer connection Functions **********/

function createPeerConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [     
          {
            urls: "stun:stun.stunprotocol.org"
          }
        ]
    });
  
    myPeerConnection.onicecandidate = handleICECandidateEvent;
    myPeerConnection.ontrack = handleTrackEvent;
    myPeerConnection.onnegotiationneeded = handleNegotiationNeededEvent;
    myPeerConnection.onremovetrack = handleRemoveTrackEvent;
    myPeerConnection.oniceconnectionstatechange = handleICEConnectionStateChangeEvent;
    myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
    myPeerConnection.onsignalingstatechange = handleSignalingStateChangeEvent;
  }

  function handleICECandidateEvent(event) {
    if (!!event.candidate) {
        let message = {
            sender: "",
            target: targetConnectionId,
            sdp: event.candidate
        };
        videoCallProxy.server.sendNewIceCandidate(message)
        .fail(reportError);
    }
  }

  function handleNegotiationNeededEvent() {
    myPeerConnection.createOffer()
    .then(function(offer)
     {
      return myPeerConnection.setLocalDescription(offer);
    })
    .then(function() {
    let msg = {
        sender: "",
        target: targetConnectionId,
        sdp: myPeerConnection.localDescription
    };

    videoCallProxy.server.sendVideoOffer(msg)
    .fail(reportError);
    })
    .catch(reportError);
  }

  function handleTrackEvent(event) {
    document.getElementById("received_video").srcObject = event.streams[0];
    //document.getElementById("hangup-button").disabled = false;
  }

function closeVideoCall() {
    var remoteVideo = document.getElementById("received_video");
    var localVideo = document.getElementById("vid-small");
  
    if (myPeerConnection) {
      myPeerConnection.ontrack = null;
      myPeerConnection.onremovetrack = null;
      myPeerConnection.onremovestream = null;
      myPeerConnection.onicecandidate = null;
      myPeerConnection.oniceconnectionstatechange = null;
      myPeerConnection.onsignalingstatechange = null;
      myPeerConnection.onicegatheringstatechange = null;
      myPeerConnection.onnegotiationneeded = null;
  
      if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
      }
  
      if (localVideo.srcObject) {
        localVideo.srcObject.getTracks().forEach(track => track.stop());
      }
  
      myPeerConnection.close();
      myPeerConnection = null;
    }
  
    remoteVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");
    localVideo.removeAttribute("src");
    remoteVideo.removeAttribute("srcObject");
  
    //document.getElementById("hangup-button").disabled = true;
    targetConnectionId = null;
  }

  function handleNewICECandidateMsg(msg) {

    var candidate = new RTCIceCandidate(msg.Sdp);
     myPeerConnection.addIceCandidate(candidate)
     .catch(reportError);
  }

  function handleVideoOfferMsg(msg) {
    var localStream = null;
  
    targetConnectionId = msg.Sender;
    createPeerConnection();
  
    var desc = new RTCSessionDescription(msg.Sdp);
  
    myPeerConnection.setRemoteDescription(desc).then(function () {
      return navigator.mediaDevices.getUserMedia(mediaConstraints);
    })
    .then(function(stream) {
      localStream = stream;
      document.getElementById("vid-small").srcObject = localStream;
  
      localStream.getTracks().forEach(track => myPeerConnection.addTrack(track, localStream));
    })
    .then(function() {
      return myPeerConnection.createAnswer();
    })
    .then(function(answer) {
      return myPeerConnection.setLocalDescription(answer);
    })
    .then(function() {    
        var message = {
            sender: "",
            target: targetConnectionId,
            sdp: myPeerConnection.localDescription
        };
      videoCallProxy.server.sendVideoAnswer(message);
    })
    .catch(handleGetUserMediaError);
  }

  function handleVideoAnswerMsg(msg) {
  
    // Configure the remote description, which is the SDP payload
    // in our "video-answer" message.

    var desc = new RTCSessionDescription(msg.Sdp);
    myPeerConnection.setRemoteDescription(desc).catch(reportError);
  }

  function handleRemoveTrackEvent() {
    var stream = document.getElementById("received_video").srcObject;
    var trackList = stream.getTracks();
   
    if (trackList.length == 0) {
      closeVideoCall();
    }
  }

  function handleICEConnectionStateChangeEvent() {
    switch(myPeerConnection.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        closeVideoCall();
        break;
    }
  }

  function handleICEGatheringStateChangeEvent(event) {
    console.log("In ICE Gathering state change event");
  }

  function handleSignalingStateChangeEvent(event) {
    switch(myPeerConnection.signalingState) {
      case "closed":
        closeVideoCall();
        break;
    }
  };
/********* RTC peer connection Functions **********/