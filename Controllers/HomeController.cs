using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace webrtc_app.Controllers
{
	public class HomeController : Controller
	{
		private string UserId;
		public ActionResult Index()
		{	
			return View();
		}

		[HttpPost]
		public ActionResult About(string id)
		{
			ViewBag.UserName = Request["UserName"];
			UserId = id;
			return View();
		}

		public ActionResult Contact()
		{
			ViewBag.Message = "Your contact page.";

			return View();
		}
	}
}