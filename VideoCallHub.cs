using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace webrtc_app
{
	public class VideoCallHub : Hub
	{
		public void Hello()
		{
			Clients.All.hello();
		}
	}
}