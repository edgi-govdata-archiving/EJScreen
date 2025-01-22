<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.IO;
using System.Web;

public class Handler : IHttpHandler {
    
    /*
     * The purpose of this file is to echo form data back to a client app.
     * The echo includes a header type of csv. And it is intended to trigger
     * a Save-as dialog box on the client.
     * 
     * HINT: if you get an error trying to use this file, check your extension
     * mappings in IIS.  
     * 
    */
    
    public void ProcessRequest (HttpContext context) 
    {
        //Set an input condition. It provides a basic level of security, and you can
        //use this to set up multiple types of responses based on an input parameter.
        String check = context.Request.QueryString["check"];
        if (check == "true")
        {
            string title = context.Request.Form["title"];
            String formData = context.Request.Form["hiddenInput"];
            context.Response.ContentType = "text/csv";
            context.Response.ContentEncoding = System.Text.Encoding.UTF8;
            context.Response.AddHeader("content-disposition", "attachment; filename=ejscreen.csv");
            context.Response.Write(title);
            context.Response.Write(formData);
        }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}