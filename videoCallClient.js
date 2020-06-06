
console.log(UserName);
var videoCall = $.connection.videoCallHub;

videoCall.client.helloClient = function (message) {
    console.log(message);
};

$.connection.hub.start().done(function () {
 
    $('#sendMessage').click(function () {
        videoCall.server.hello($('#message').val());
        $('#message').val('').focus();
    });
});
