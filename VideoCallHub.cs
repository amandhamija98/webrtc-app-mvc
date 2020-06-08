using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;
using webrtc_app.Models;

namespace webrtc_app
{
	public class VideoCallHub : Hub
	{
		
		public async Task NewUser(string UserName){
            UserInfo NewUserInfo = new UserInfo(){UserName = UserName, ConnectionId  = Context.ConnectionId , OnCall = false};
            await Clients.Others.newUserJoined(NewUserInfo);
			
        }

		public async Task GreetNewUser(string NewUserConnectionId, string ExistingUserName, bool ExistingUserOnCall){
            UserInfo ExistingUserInfo = new UserInfo(){UserName = ExistingUserName, ConnectionId  = Context.ConnectionId , OnCall = ExistingUserOnCall};
            await Clients.Client(NewUserConnectionId).existingUserGreeting(ExistingUserInfo);
        }


		public async Task SendVideoOffer(RTCMessage message){
            try {
                message.Sender = Context.ConnectionId;
                await Clients.Client(message.Target).receiveVideoOffer(message);
            } catch(Exception ex)
            {

                Console.WriteLine(ex.Message);
            }
            
        }

        public async Task SendVideoAnswer(RTCMessage message){
            message.Sender = Context.ConnectionId;
            await Clients.Client(message.Target).receiveVideoAnswer(message);
        }

        public async Task SendNewIceCandidate(RTCMessage message){
            message.Sender = Context.ConnectionId;
            await Clients.Client(message.Target).receiveNewIceCandidate(message);
            
        }
	}
}