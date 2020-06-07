using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace webrtc_app.Models
{
    public class RTCMessage
    {
        public string Sender { get; set; }
        public string Target { get; set; }
        public dynamic Sdp { get; set; }
    }
}