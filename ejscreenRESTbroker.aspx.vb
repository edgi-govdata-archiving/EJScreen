Imports System.Net
Imports System.IO
Imports System.Xml
Imports System.Xml.Xsl
Imports System.Text
Imports Newtonsoft.Json

Partial Class ejscreenRESTbroker
    Inherits System.Web.UI.Page

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        'check for invalid chars in URL, send error as JSON and exit

        'Dim regexString As String = System.Configuration.ConfigurationManager.AppSettings("regexString")
        'Dim RegexObj As System.Text.RegularExpressions.Regex = New System.Text.RegularExpressions.Regex(regexString, System.Text.RegularExpressions.RegexOptions.IgnorePatternWhitespace)
        Dim z As Integer
        Dim st As String
        Dim pcounter As Integer = Context.Request.Params.Count
		
		'start new invalid url code - 10/31/23
			Dim regexString As String = System.Configuration.ConfigurationManager.AppSettings("regexString")
            Dim RegexObj As System.Text.RegularExpressions.Regex = New System.Text.RegularExpressions.Regex(regexString, System.Text.RegularExpressions.RegexOptions.IgnorePatternWhitespace)
			Dim method_get As Boolean = (Request.ServerVariables("Request_Method").ToUpper = "GET")			
			Dim currentContext As HttpContext = HttpContext.Current			
			Try
                    If method_get Then
                        Dim requestUrlCurrent As Uri = currentContext.Request.Url
                        Dim requestUrlString As String = requestUrlCurrent.ToString()
                        If RegexObj.IsMatch(requestUrlString) Then
                            Context.Response.Write("Invalid characters in URL!")
                            Context.Response.Flush()
                            Response.End()

                        Else
                            ValidateForInvalidCharacters(requestUrlString)
                        End If
                    Else
                        Dim postParams As NameValueCollection = currentContext.Request.Form
                        Dim queryStringBuilder As New StringBuilder()
                        For Each key As String In postParams.AllKeys
                            Dim value As String = postParams(key)
                            If queryStringBuilder.Length > 0 Then
                                queryStringBuilder.Append("&")
                            End If

                            queryStringBuilder.AppendFormat("{0}={1}", key, value)
                        Next
                        If RegexObj.IsMatch(queryStringBuilder.ToString()) Then
                            Context.Response.Write("Invalid characters in URL!")
                            Context.Response.Flush()
                            Response.End()

                        Else
                            ValidateForInvalidCharacters(queryStringBuilder.ToString())
                        End If
                        ' ValidateForInvalidCharacters(queryStringBuilder.ToString())
                    End If
            Catch ex As HttpRequestValidationException
                    Response.Write("Invalid URL Detected: " & ex.ToString())
					Response.Write(vbNewLine)
                    Response.End()
            End Try		
			'end new invalid url code

		'old method
        ' Dim method_get As Boolean = (Request.ServerVariables("Request_Method").ToUpper = "GET")
        ' If method_get Then
            ' pcounter = Context.Request.QueryString.Count
        ' Else
            ' pcounter = Context.Request.Form.Count
        ' End If
        ' For z = 0 To pcounter - 1
            ' If method_get Then
                ' st = Context.Request.QueryString(z)
            ' Else
                ' st = Context.Request.Form(z)
            ' End If

            ' If RegexObj.IsMatch(st) Then
                ' Dim jsonStr As String = ""
                ' Dim errorObj As New Newtonsoft.Json.Linq.JObject
                ' errorObj.Add("error", "Invalid characters in URL")
                ' jsonStr = JsonConvert.SerializeObject(errorObj, Newtonsoft.Json.Formatting.Indented)
                ' Response.Clear()
                ' Response.ContentType = "application/json; charset=utf-8"
                ' Response.Write(jsonStr)
                ' Response.End()
            ' End If
        ' Next



        Try




            Dim scriptname As String = Request.ServerVariables("SCRIPT_NAME")
            Dim googleid As String = System.Configuration.ConfigurationManager.AppSettings("googleAnalyticID")
            Dim baseParams As String = "v=1&tid=" & googleid & "&cid=1750562792.1452199610&t=pageview&dt=EJScreen Report API&dl=" & scriptname

            Dim requesturl As String = "https://www.google-analytics.com/collect"


            Dim webreq As HttpWebRequest = CType(WebRequest.Create(requesturl), HttpWebRequest)
            webreq.ContentType = "application/x-www-form-urlencoded"
            webreq.Method = "POST"
            Dim PostData() As Byte = System.Text.Encoding.ASCII.GetBytes(baseParams)
            webreq.ContentLength = PostData.Length


            Dim tempStream As Stream = webreq.GetRequestStream()

            'write the data to be posted to the Request Stream
            tempStream.Write(PostData, 0, PostData.Length)

            tempStream.Close()

            Dim webres As WebResponse = webreq.GetResponse()
            Dim sr As New StreamReader(webres.GetResponseStream)
            'convert the stream to a string
            Dim s As String = sr.ReadToEnd
            s = s.Trim

            sr.Close()
            callREST()

        Catch ex As Exception
            'Response.Write("ERROR" & ex.Message)
        End Try
    End Sub
    Private Sub callREST()
        'obj from main EJ call
        Dim mainEJJsonObj As New Newtonsoft.Json.Linq.JObject
        'main object to build and send back as JSON string
        Dim dataJsonObj As New Newtonsoft.Json.Linq.JObject

        Dim jsonStr As String = String.Empty
        Try
            Dim baseParams As String = Request.ServerVariables("QUERY_STRING")
            Dim mainejurl As String = System.Configuration.ConfigurationManager.AppSettings("ejendpointMAIN")

            'process MAIN service call

            Dim sMain As String
            sMain = getbrokerresponse(mainejurl, baseParams)

            mainEJJsonObj = JsonConvert.DeserializeObject(sMain)

            'remove needed properties

            Dim fieldDelete() As String = {
            "RAW_D_DEMOGIDX5",
            "RAW_D_LIFEEXP",
            "S_D_LIFEEXP",
            "S_D_DEMOGIDX5ST",
            "S_D_LIFEEXP_PER",
            "S_D_DEMOGIDX5ST_PER",
            "N_D_LIFEEXP",
            "N_D_DEMOGIDX5",
            "N_D_LIFEEXP_PER",
            "N_D_DEMOGIDX5_PER",
            "N_P5_DIESEL",
            "N_P5_CANCER",
            "N_P5_RESP",
            "N_P5_TRAFFIC",
            "N_P5_NPDES",
            "N_P5_NPL",
            "N_P5_RMP",
            "N_P5_TSDF",
            "N_P5_O3",
            "N_P5_PM25",
            "N_P5_UST",
            "N_P5_LEAD",
            "N_P5_RSEI_AIR",
            "S_P5_O3",
            "S_P5_PM25",
            "S_P5_TSDF",
            "S_P5_LEAD",
            "S_P5_DIESEL",
            "S_P5_CANCER",
            "S_P5_RESP",
            "S_P5_TRAFFIC",
            "S_P5_NPDES",
            "S_P5_NPL",
            "S_P5_RMP",
            "S_P5_UST",
            "S_P5_RSEI_AIR",
            "NUM_WATERDIS",
             "NUM_AIRPOLL",
             "NUM_BROWNFIELD",
             "NUM_TRI",
             "NUM_SCHOOL",
             "NUM_HOSPITAL",
             "NUM_CHURCH",
             "YESNO_TRIBAL",
             "YESNO_CEJSTDIS",
             "YESNO_IRADIS",
             "YESNO_AIRNONATT",
             "YESNO_IMPWATERS",
             "YESNO_HOUSEBURDEN",
             "YESNO_TRANSDIS",
             "YESNO_FOODDESERT",
             "centroidX",
             "centroidY",
             "stateName",
             "stateAbbr"						
            }

            'sample remove if needed
            'joMain.Property("RAW_D_INCOME").Remove()
            For Each item As String In fieldDelete
                'mainEJJsonObj.Property(item).Remove()
				If mainEJJsonObj.Property(item) IsNot Nothing Then
                    mainEJJsonObj.Property(item).Remove()
                End If												  														 					  
            Next

            Dim rDict As Dictionary(Of String, String)
            Dim remapJSON As String = "{'RAW_D_PEOPCOLOR':'RAW_D_MINOR','RAW_D_DEMOGIDX2':'RAW_D_INDEX','S_D_PEOPCOLOR':'S_D_MINOR','S_D_DEMOGIDX2':'S_D_INDEX','S_D_PEOPCOLOR_PER':'S_D_MINOR_PER','S_D_DEMOGIDX2_PER':'S_D_INDEX_PER','S_P2_LEAD':'S_P_LEAD','S_P2_DIESEL':'S_P_DIESEL','S_P2_CANCER':'S_P_CANCER','S_P2_RESP':'S_P_RESP','S_P2_TRAFFIC':'S_P_TRAFFIC','S_P2_NPDES':'S_P_NPDES','S_P2_NPL':'S_P_NPL','S_P2_RMP':'S_P_RMP','S_P2_TSDF':'S_P_TSDF','S_P2_O3':'S_P_O3','S_P2_PM25':'S_P_PM25','S_P2_UST':'S_P_UST','S_P2_RSEI_AIR':'S_P_RSEI_AIR','N_D_PEOPCOLOR':'N_D_MINOR','N_D_DEMOGIDX2':'N_D_INDEX','N_D_PEOPCOLOR_PER':'N_D_MINOR_PER','N_D_DEMOGIDX2_PER':'N_D_INDEX_PER','N_P2_LEAD':'N_P_LEAD','N_P2_DIESEL':'N_P_DIESEL','N_P2_CANCER':'N_P_CANCER','N_P2_RESP':'N_P_RESP','N_P2_TRAFFIC':'N_P_TRAFFIC','N_P2_NPDES':'N_P_NPDES','N_P2_NPL':'N_P_NPL','N_P2_RMP':'N_P_RMP','N_P2_TSDF':'N_P_TSDF','N_P2_O3':'N_P_O3','N_P2_PM25':'N_P_PM25','N_P2_UST':'N_P_UST','N_P2_RSEI_AIR':'N_P_RSEI_AIR'}"
            rDict = Newtonsoft.Json.JsonConvert.DeserializeObject(Of Dictionary(Of String, String))(remapJSON)


            'build new obj, use remap name if exists
            For Each prop As Newtonsoft.Json.Linq.JProperty In mainEJJsonObj.Properties
                Dim newKey As String = prop.Name
                If rDict.ContainsKey(prop.Name) Then
                    newKey = rDict.Item(prop.Name)
                End If

                dataJsonObj.Add(newKey, prop.Value)
            Next


            'if pjson, indent for pretty-print, if json, send raw minified json. Anything else send back raw json
            If Request.QueryString.Get("f").ToLower = "pjson" Then
                jsonStr = JsonConvert.SerializeObject(dataJsonObj, Newtonsoft.Json.Formatting.Indented)
            ElseIf Request.QueryString.Get("f").ToLower = "json" Then
                jsonStr = JsonConvert.SerializeObject(dataJsonObj)
            Else
                jsonStr = JsonConvert.SerializeObject(dataJsonObj)
            End If


            Response.Clear()
            Response.ContentType = "application/json; charset=utf-8"

            Response.Write(jsonStr)


        Catch ex As Exception
            'Response.Write("ERROR" & ex.Message)
            Dim errorObj As New Newtonsoft.Json.Linq.JObject
            errorObj.Add("error", ex.Message)
            jsonStr = JsonConvert.SerializeObject(errorObj, Newtonsoft.Json.Formatting.Indented)
            Response.Clear()
            Response.ContentType = "application/json; charset=utf-8"

            Response.Write(jsonStr)

        End Try

        Response.End()





    End Sub

    Public Function getbrokerresponse(ByVal requesturl As String,ByVal baseParams As String ) As String
        Dim responsestr As String = ""
        Try
             Dim webreq As HttpWebRequest = CType(WebRequest.Create(requesturl), HttpWebRequest)
            webreq.ContentType = "application/x-www-form-urlencoded"
            webreq.Method = "POST"
            Dim PostData() As Byte = System.Text.Encoding.ASCII.GetBytes(baseParams)
            webreq.ContentLength = PostData.Length
            Dim tempStream As Stream = webreq.GetRequestStream()
            'write the data to be posted to the Request Stream
            tempStream.Write(PostData, 0, PostData.Length)
            tempStream.Close()
            Dim webres As WebResponse = webreq.GetResponse()
            Dim sr As New StreamReader(webres.GetResponseStream)
            'convert the stream to a string
            responsestr = sr.ReadToEnd
            responsestr = responsestr.Trim

        Catch ex As Exception

           ' responsestr
        End Try

        Return responsestr
    End Function
	
	'start new validation methods 10/31/23
	Private Sub ValidateForInvalidCharacters(requestUrlString As String)
        GetDecodedUrl(requestUrlString)
	End Sub    

    Sub GetDecodedUrl(ByVal url As String)
        Dim regexString As String = System.Configuration.ConfigurationManager.AppSettings("regexString")
        Dim RegexObj As System.Text.RegularExpressions.Regex = New System.Text.RegularExpressions.Regex(regexString, System.Text.RegularExpressions.RegexOptions.IgnorePatternWhitespace)

        Dim firstDecodedUrl As String = HttpUtility.UrlDecode(url)
        Dim secondDecodedUrl As String = HttpUtility.UrlDecode(firstDecodedUrl)
        'Return secondDecodedUrl = firstDecodedUrl ' Returns True if the URL was not encoded, False otherwise
        If firstDecodedUrl = secondDecodedUrl Then
            If RegexObj.IsMatch(url) Then
                Context.Response.Write("Invalid characters in URL!")					
                Context.Response.Flush()
                Response.End()
            End If
        Else
            Context.Response.Write("Invalid URL!")			
            Context.Response.Flush()
            Response.End()
        End If
    End Sub
	'end new validation methods

End Class
