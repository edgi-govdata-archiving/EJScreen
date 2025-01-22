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
                Dim isValid As Boolean = IsValidURL(requestUrlString)
                If Not isValid Then
                    'If RegexObj.IsMatch(requestUrlString) Then
                    Context.Response.Write("Invalid characters in URL!")
                    Context.Response.Flush()
                    Response.End()

                Else
                    ValidateForInvalidCharacters(requestUrlString, isValid)
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
                'If RegexObj.IsMatch(queryStringBuilder.ToString()) Then
                If Not IsValidURL(queryStringBuilder.ToString()) Then
                    Context.Response.Write("Invalid characters in URL!")
                    Context.Response.Flush()
                    Response.End()

                Else
                    Dim isValid As Boolean = IsValidURL(queryStringBuilder.ToString())
                    ValidateForInvalidCharacters(queryStringBuilder.ToString(), isValid)
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
    Public Function IsValidURL(urlString As String) As Boolean
        Dim pattern As String = "[*$|<|>|(|)]"
        Dim locations As String() = {
        "(Webster Springs)", "(Payapai)", "(Nieves)", "(balance)", "(Alvin)",
        "(Berkeley Springs)", "(Hensel)", "(Thurman)", "(Marpo Valley)", "(Paso Robles)",
        "(Biscoe)", "(Brinkhaven)", "(Kaan)", "(Chudan)", "(Croton)", "(Boelus)",
        "(Marlin)", "(Minachage)", "(Behrend)", "(New Raymer)", "(Stout)", "(Ventura)",
        "(Oleai)", "(Tinian Municipality)", "(Union)", "(Uniontown)", "(Farallon de Pajaros)",
        "(Big Park)", "(Coalton)", "(Farallon de Pajaros)", "(Big Park)", "(Coalton)"
    }

        Dim locationExists As Boolean = LocationStrExists(urlString, locations)

        If locationExists Then
            Return ValidateUrlParts(urlString, locations, pattern)
        Else
            Return ValidateWithoutLocations(urlString, pattern)
        End If
    End Function

    Private Function ValidateUrlParts(urlString As String, locations As String(), pattern As String) As Boolean
        If Not HandleApostrophes(urlString) Then
            Return False
        End If
        Dim urlParts As List(Of String) = urlString.Split(locations, StringSplitOptions.None).ToList()
        For Each part As String In urlParts
            If Regex.IsMatch(part, pattern) Then
                Return False
            End If
        Next
        Return True
    End Function

    Private Function ValidateWithoutLocations(urlString As String, pattern As String) As Boolean
        If HandleApostrophes(urlString) AndAlso Not Regex.IsMatch(urlString, pattern) Then
            Return True
        Else
            Return False
        End If
    End Function

    Private Function HandleApostrophes(urlString As String) As Boolean
        Dim ignoreList As String() = {
        "Prince George's County", "Queen Anne's County", "St. Mary's County", "O'Brien County"
    }

        urlString = urlString.Replace("+", " ")
        Dim idx As Integer = urlString.IndexOf("'")
        While idx >= 0
            Dim apostropheIsPartOfIgnoreList As Boolean = False

            For Each ignoreStr In ignoreList
                Dim ignoreIndex As Integer = urlString.IndexOf(ignoreStr, StringComparison.OrdinalIgnoreCase)
                If idx >= ignoreIndex AndAlso idx < ignoreIndex + ignoreStr.Length Then
                    apostropheIsPartOfIgnoreList = True
                    Exit For
                End If
            Next

            If Not apostropheIsPartOfIgnoreList Then
                Return False
            End If

            idx = urlString.IndexOf("'", idx + 1)
        End While

        Return True
    End Function

    Private Function LocationStrExists(url As String, locationList As String()) As Boolean
        For Each location As String In locationList
            If url.Contains(location) Then
                Return True
            End If
        Next
        Return False
    End Function

    Public Function IsValidURLOld(urlString As String) As Boolean
        Dim pattern As String = "[*$|<|>|(|)]"
        urlString = urlString.Replace("+", " ")
        Dim ignoreList As String() = {"Prince George's County", "Queen Anne's County", "St. Mary's County", "O'Brien County"}

        ' Check each apostrophe in the URL
        Dim idx As Integer = urlString.IndexOf("'")
        While idx >= 0
            Dim apostropheIsPartOfIgnoreList As Boolean = False

            ' Check if the substring around the apostrophe is part of the ignore list
            For Each ignoreStr In ignoreList
                Dim ignoreIndex As Integer = urlString.IndexOf(ignoreStr, StringComparison.OrdinalIgnoreCase)
                While ignoreIndex >= 0
                    If idx >= ignoreIndex AndAlso idx < ignoreIndex + ignoreStr.Length Then
                        apostropheIsPartOfIgnoreList = True
                        Exit For
                    End If
                    ignoreIndex = urlString.IndexOf(ignoreStr, ignoreIndex + 1, StringComparison.OrdinalIgnoreCase)
                End While

                If apostropheIsPartOfIgnoreList Then
                    Exit For
                End If
            Next

            If Not apostropheIsPartOfIgnoreList Then
                Return False
            End If

            idx = urlString.IndexOf("'", idx + 1)
        End While

        ' Check if the URL matches the regex pattern
        If Regex.IsMatch(urlString, pattern) Then
            Return False
        End If

        ' If all checks are passed, return True
        Return True
    End Function
    Private Sub callREST()
        'main object to build and send back as JSON string
		Dim dataJsonObj As New Newtonsoft.Json.Linq.JObject
		'sub object to add each group to
        Dim allJsonObj As New Newtonsoft.Json.Linq.JObject

        Dim jsonStr As String = String.Empty
        Try             
            Dim baseParams As String = Request.ServerVariables("QUERY_STRING")
            Dim formatJson As String

            Dim demogurl As String = System.Configuration.ConfigurationManager.AppSettings("demogacs2022url")
            Dim mainejurl As String = System.Configuration.ConfigurationManager.AppSettings("ejendpointMAIN")
            Dim extrasurl As String = System.Configuration.ConfigurationManager.AppSettings("ejendpointEXTRA")

            Dim method_post As Boolean = (Request.ServerVariables("Request_Method").ToUpper = "POST")
            If method_post Then
                Dim formData As New StringBuilder()
                For Each key As String In HttpContext.Current.Request.Form.AllKeys
                    formData.AppendFormat("{0}={1}&", key, HttpContext.Current.Request.Form(key))
                Next
                ' If you added data, remove the trailing '&'.
                If formData.Length > 0 Then
                    formData.Remove(formData.Length - 1, 1)
                End If
                baseParams = formData.ToString()
                formatJson = HttpContext.Current.Request.Form("f")
            Else
                formatJson = Request.QueryString.Get("f")
            End If

            'DEMOG           

            Dim sDemog As String 
            sDemog = getbrokerresponse(demogurl,baseParams)

             Dim joDemog As New Newtonsoft.Json.Linq.JObject
            joDemog = JsonConvert.DeserializeObject(sDemog)
            ' Dim joDemogErr As Newtonsoft.Json.Linq.JObject = joDemog.Item("errInfo")
            If joDemog.Item("errInfo") IsNot Nothing AndAlso joDemog.Item("errInfo").Count > 0 Then
                Dim errInfo As Newtonsoft.Json.Linq.JObject = DirectCast(joDemog.Item("errInfo"), Newtonsoft.Json.Linq.JObject)

                ' Extracting messageType and message safely
                Dim messageType As String = If(errInfo("messageType") IsNot Nothing, errInfo("messageType").ToString(), String.Empty)
                Dim message As String = If(errInfo("message") IsNot Nothing, errInfo("message").ToString(), String.Empty)

                ' Initialize the errDetails JObject before using it
                Dim errDetails As New Newtonsoft.Json.Linq.JObject
                errDetails.Add(New Newtonsoft.Json.Linq.JProperty("message", message))
                errDetails.Add(New Newtonsoft.Json.Linq.JProperty("messageType", messageType))


                ' Now, add the errDetails to allJsonObj
                allJsonObj.Add(New Newtonsoft.Json.Linq.JProperty("demographics", errDetails))


            Else
                Dim joDemogstatGroupList As Newtonsoft.Json.Linq.JArray = joDemog.Item("statGroupList")
                Dim joDemogstatListParent As Newtonsoft.Json.Linq.JObject = joDemogstatGroupList.Item(0)
                Dim joDemogstatList As Newtonsoft.Json.Linq.JArray = joDemogstatListParent.Item("statList")


                Dim includeDemogFields() As String = {"P_ENGLISH",
                    "P_SPANISH",
                    "P_FRENCH",
                    "P_RUS_POL_SLAV",
                    "P_OTHER_IE",
                    "P_VIETNAMESE",
                    "P_OTHER_ASIAN",
                    "P_ARABIC",
                    "P_OTHER",
                    "P_NON_ENGLISH",
                    "P_NHWHITE",
                    "P_NHBLACK",
                    "P_NHASIAN",
                    "P_HISP",
                    "P_NHAMERIND",
                    "P_NHHAWPAC",
                    "P_NHOTHER_RACE",
                    "P_NHTWOMORE",
                    "P_AGE_LT5",
                    "P_AGE_LT18",
                    "P_AGE_GT17",
                    "P_AGE_GT64",
                    "P_HLI_SPANISH_LI",
                    "P_HLI_IE_LI",
                    "P_HLI_API_LI",
                    "P_HLI_OTHER_LI",
                    "P_LOWINC",
                    "PCT_MINORITY",
                    "P_EDU_LTHS",
                    "P_LIMITED_ENG_HH",
                    "P_EMP_STAT_UNEMPLOYED",
                    "P_DISABILITY",
                    "P_MALES",
                    "P_FEMALES",
                    "LIFEEXP",
                    "PER_CAP_INC",
                    "HSHOLDS",
                    "P_OWN_OCCUPIED",
                    "inputAreaMiles",
                    "TOTALPOP"
                  }

                Dim joDemogEdit As New Newtonsoft.Json.Linq.JObject
                For Each item As Newtonsoft.Json.Linq.JObject In joDemogstatList
                    If includeDemogFields.Contains(item("name")) Then
                        joDemogEdit.Add(item("name"), item("value"))
                    End If
                Next

                ' Assuming joDemog is already a populated JObject
                For Each item As Newtonsoft.Json.Linq.JProperty In joDemog.Properties()
                    ' Get the name of the property
                    Dim itemname As String = item.Name
                    ' Get the value of the property
                    Dim itemvalue As Newtonsoft.Json.Linq.JToken = item.Value
                    If includeDemogFields.Contains(itemname) Then
                        joDemogEdit.Add(itemname, itemvalue)
                    End If
                Next

                Dim joDemogEditSort As New Newtonsoft.Json.Linq.JObject
                For Each item As String In includeDemogFields
                    ' If joDemogEdit.Item(item) Then
                    joDemogEditSort.Add(item, joDemogEdit.Item(item))
                    ' End If
                Next

                'add demog to all json       
                allJsonObj.Add("demographics", joDemogEditSort)
            End If
            'process MAIN service call

            Dim sMain As String
                sMain = getbrokerresponse(mainejurl, baseParams)

            'remove needed properties

            Dim joMain As New Newtonsoft.Json.Linq.JObject
            joMain = JsonConvert.DeserializeObject(sMain)
           
            'sample remove if needed
            'joMain.Property("RAW_D_INCOME").Remove()
			If joMain.Property("stateAbbr") IsNot Nothing Then
                joMain.Property("stateAbbr").Remove()
            End If

            If joMain.Property("stateName") IsNot Nothing Then
                joMain.Property("stateName").Remove()
            End If										 
			allJsonObj.Add("main", joMain)	  
															 																							
            'call EXTRA

            Dim sExtra As String
                sExtra = getbrokerresponse(extrasurl, baseParams)

            Dim joExtra As New Newtonsoft.Json.Linq.JObject
            joExtra = JsonConvert.DeserializeObject(sExtra)
			If joExtra.Property("stateAbbr") IsNot Nothing Then
                joExtra.Property("stateAbbr").Remove()
            End If

            If joExtra.Property("stateName") IsNot Nothing Then
                joExtra.Property("stateName").Remove()
            End If												   			  
            allJsonObj.Add("extras", joExtra)



            dataJsonObj.Add("data", allJsonObj)

                'if pjson, indent for pretty-print, if json, send raw minified json. Anything else send back raw json
                If formatJson.ToLower = "pjson" Then
                    jsonStr = JsonConvert.SerializeObject(dataJsonObj, Newtonsoft.Json.Formatting.Indented)
                ElseIf formatJson.ToLower = "json" Then
                    jsonStr = JsonConvert.SerializeObject(dataJsonObj)
                Else
                    jsonStr = JsonConvert.SerializeObject(dataJsonObj)
                End If

                'or
                'raw
                'jsonStr = JsonConvert.SerializeObject(allJsonObj)



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
    Private Sub ValidateForInvalidCharacters(requestUrlString As String, isValid As Boolean)
        GetDecodedUrl(requestUrlString, isValid)
    End Sub

    Sub GetDecodedUrl(ByVal url As String, isValid As Boolean)
        'Dim regexString As String = System.Configuration.ConfigurationManager.AppSettings("regexString")
        'Dim RegexObj As System.Text.RegularExpressions.Regex = New System.Text.RegularExpressions.Regex(regexString, System.Text.RegularExpressions.RegexOptions.IgnorePatternWhitespace)

        Dim firstDecodedUrl As String = HttpUtility.UrlDecode(url)
        Dim secondDecodedUrl As String = HttpUtility.UrlDecode(firstDecodedUrl)
        'Return secondDecodedUrl = firstDecodedUrl ' Returns True if the URL was not encoded, False otherwise
        If firstDecodedUrl = secondDecodedUrl Then
            If Not isValid Then
                'If RegexObj.IsMatch(url) Then
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
