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
		public void Hello(string message)
		{
			Clients.All.helloClient(message);
		}

		public async Task NewUser(string UserName){
            UserInfo NewUserInfo = new UserInfo(){UserName = UserName, ConnectionId  = Context.ConnectionId , OnCall = false};
            await Clients.Others.newUserJoined(NewUserInfo);
			
        }

		public async Task GreetNewUser(string NewUserConnectionId, string ExistingUserName, bool ExistingUserOnCall){
            UserInfo ExistingUserInfo = new UserInfo(){UserName = ExistingUserName, ConnectionId  = Context.ConnectionId , OnCall = ExistingUserOnCall};
            await Clients.Client(NewUserConnectionId).existingUserGreeting(ExistingUserInfo);
        }
	}
}