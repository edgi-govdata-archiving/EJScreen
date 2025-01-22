Imports System.Net
Imports System.IO

Imports System.Web.Services

Imports System.Drawing.Imaging
Imports Svg
Imports iTextSharp.text
Imports iTextSharp.text.pdf
Imports System.Xml
Imports System.Collections
Imports System.Text
Imports System.Math

Partial Class EJscreen_SOE
    Inherits System.Web.UI.Page

    Public coordstr As String = ""
    Public feattype As String = ""
    Public dist As String = "0"
    Public bunit As String = "miles"
    Public ptitle As String = ""
    Public pdesc As String = ""
    Public namestr As String = ""
    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
	
        If Not IsPostBack Then
		Try
            
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
                        ' If RegexObj.IsMatch(requestUrlString) Then
                        If Not isValid Then
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
                        Dim isValid As Boolean = IsValidURL(queryStringBuilder.ToString())
                        If Not isValid Then
                            Context.Response.Write("Invalid characters in URL!")
                            Context.Response.Flush()
                            Response.End()

                        Else
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
                    ' Context.Response.Write("Invalid characters in URL!")
                    ' Context.Response.Flush()
                    ' Response.End()
                ' End If
            ' Next
            coordstr = Request.Params.Get("coords")
            Dim coordreg As String = "^(-?\d(\.\d+|),?\s?)+$"

            Dim regLat As RegularExpressions.Regex = New RegularExpressions.Regex(coordreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)


            If regLat.IsMatch(coordstr) Then
            Else
                Response.Write("alert('Invalid coordinates input!')")
                Response.End()
            End If
            feattype = Request.Params.Get("feattype")
            If feattype Is Nothing Then
                feattype = "point"
            End If
            Dim typereg As String = "^(line|polygon|point|polyline|poly|bg|blockgroup|tract|city|county)$"
            Dim regtype As RegularExpressions.Regex = New RegularExpressions.Regex(typereg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)
            If regtype.IsMatch(feattype) Then
            Else
                Response.Write("alert('Invalid feattype input!')")
                Response.End()
            End If

            Dim distreg As String = "^\d*(\.\d+|)$"
            Dim regdist As RegularExpressions.Regex = New RegularExpressions.Regex(distreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)
            dist = Request.Params.Get("radius")
            If dist Is Nothing Then
                dist = "0"
            End If
            If regdist.IsMatch(dist) Then

            Else
                Response.Write("alert('Invalid radius input!')")
                Response.End()
            End If


            bunit = Request.Params.Get("unit")


            ptitle = Request.Params.Get("ptitle")
            namestr = Request.Params.Get("namestr")
            if namestr is Nothing then
                namestr = coordstr
            end if
			
		Catch ex As Exception               
				Context.Response.Write("<br>error occurred: " & ex.Message)
                Context.Response.Flush()
                Response.End()
        End Try

        End If

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

    Private Function LocationStrExists(url As String, locationList As String()) As Boolean
        For Each location As String In locationList
            If url.Contains(location) Then
                Return True
            End If
        Next
        Return False
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
    Public Function CheckURL(ByVal HostAddress As String) As Boolean
        Dim rtCheckURL As Boolean = False
        Try
            Dim req As WebRequest = WebRequest.Create(HostAddress)
            req.Credentials = CredentialCache.DefaultCredentials
            Dim wResponse As WebResponse = req.GetResponse()
            Dim mtype As String = wResponse.ContentType
            If mtype.IndexOf("image") > -1 Then
                rtCheckURL = True
            End If
            wResponse.Close()

        Catch ex As Exception

            rtCheckURL = False

        End Try

        Return rtCheckURL
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

