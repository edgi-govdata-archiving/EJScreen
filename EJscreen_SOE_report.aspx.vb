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

Partial Class EJscreen_SOE_report
    Inherits System.Web.UI.Page

    Public coordstr As String = ""
    Public feattype As String = ""
    Public dist As String = "0"
    Public bunit As String = "miles"
    Public ptitle As String = ""
    Public pdesc As String = ""
    Public namestr As String = ""
    Public areaid As String = ""
    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        If Not IsPostBack Then
            Try

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
                        'If RegexObj.IsMatch(queryStringBuilder.ToString()) Then
                        Dim isValid As Boolean = IsValidURL(queryStringBuilder.ToString())
                        If Not isValid Then
                            Context.Response.Write("Invalid characters in URL!")
                            Context.Response.Flush()
                            Response.End()

                        Else
                            ValidateForInvalidCharacters(queryStringBuilder.ToString(), isValid)
                        End If

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
                ' Context.Response.Write("Invalid characters in URL!")
                ' Context.Response.Flush()
                ' Response.End()
                ' End If
                ' Next
                coordstr = Request.Params.Get("geometry")
                If (coordstr.Length > 1) Then
                    coordstr = Server.UrlDecode(coordstr)
                End If
                ' Dim coordreg As String = "^(-?\d(\.\d+|),?\s?)+$"

                'Dim regLat As RegularExpressions.Regex = New RegularExpressions.Regex(coordreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)


                ' If regLat.IsMatch(coordstr) Then
                ' Else
                ' Response.Write("alert('Invalid coordinates input!')")
                ' Response.End()
                ' End If
                feattype = Request.Params.Get("areatype")
                If (feattype.Length > 1) Then
                    If feattype Is Nothing Then
                        feattype = ""
                    End If
                    Dim typereg As String = "^(blockgroup|tract|city|county)$"
                    Dim regtype As RegularExpressions.Regex = New RegularExpressions.Regex(typereg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)
                    If regtype.IsMatch(feattype) Then
                        feattype = feattype.toLower
                    Else
                        Response.Write("alert('Invalid areatype input!')")
                        Response.End()
                    End If
                End If

                areaid = Request.Params.Get("areaid")
                If areaid.Length > 1 Then
                    Dim areaidreg As String = "^\d{5,12}$"
                    Dim regareaid As RegularExpressions.Regex = New RegularExpressions.Regex(areaidreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)
                    If regareaid.IsMatch(areaid) Then

                    Else
                        Response.Write("alert('Invalid areaid input!')")
                        Response.End()
                    End If
                    namestr = Request.Params.Get("namestr")
                    If namestr Is Nothing Then
                        namestr = areaid
                    End If
                End If

                Dim distreg As String = "^\d*(\.\d+|)$"
                Dim regdist As RegularExpressions.Regex = New RegularExpressions.Regex(distreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)
                dist = Request.Params.Get("distance")
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
                If namestr Is Nothing Then
                    namestr = coordstr
                End If

            Catch ex As Exception
                Context.Response.Write("<br>error occurred: " & ex.Message)
                Context.Response.Flush()
                Response.End()
            End Try

        End If
    End Sub

    Public Function locationStrExistsOld(ByVal url As String, ByVal locationList As String()) As Boolean

        ' Iterate over the locations and check if any of them is part of the URL
        For Each location As String In locationList
            If url.Contains(location) Then
                ' If the URL contains any of the locations, return True to indicate that validation should be skipped
                Return True
            End If
        Next

        ' If none of the locations are part of the URL, return False to indicate that validation should proceed
        Return False
    End Function

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
        urlString = urlString.Replace("+", " ")
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
        'url = url.Replace("+", " ")
        For Each location As String In locationList
            If url.Contains(location) Then
                Return True
            End If
        Next
        Return False
    End Function


    Public Function IsValidURLOld(urlString As String) As Boolean
        Dim isValid As Boolean = True
        Dim pattern As String = "[*$|<|>|(|)]"
        Dim locations As String() = New String() {
        "(Webster Springs)",
        "(Payapai)",
        "(Nieves)",
        "(balance)",
        "(Alvin)",
        "(Berkeley Springs)",
        "(Hensel)",
        "(Thurman)",
        "(Marpo Valley)",
        "(Paso Robles)",
        "(Biscoe)",
        "(Brinkhaven)",
        "(Kaan)",
        "(Chudan)",
        "(Croton)",
        "(Boelus)",
        "(Marlin)",
        "(Minachage)",
        "(Behrend)",
        "(New Raymer)",
        "(Stout)",
        "(Ventura)",
        "(Oleai)",
        "(Tinian Municipality)",
        "(Union)",
        "(Uniontown)",
        "(Farallon de Pajaros)",
        "(Big Park)",
        "(Coalton)",
        "(Farallon de Pajaros)",
        "(Big Park)",
        "(Coalton)"
    }
        Dim locationExists As Boolean = locationStrExists(urlString, locations) 'Check if the url has any of the strings 

        If locationExists Then
            Dim urlParts As List(Of String) = urlString.Split(locations, StringSplitOptions.None).ToList()
            For Each part As String In urlParts
                If Regex.IsMatch(part, pattern) Then

                    isValid = False
                    Exit For
                End If
            Next

        Else
            Dim ignoreList As String() = {"Prince George's County", "Queen Anne's County", "St. Mary's County", "O'Brien County"}
            'Skipping the validation when url has certain strings enclosed in paranthesis
            ' Dim ignoreValidation As Boolean = ShouldSkipValidation(urlString)
            urlString = urlString.Replace("+", " ")
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
                    'Return False
                    isValid = False
                    Exit While
                End If

                idx = urlString.IndexOf("'", idx + 1)
            End While

            ' Check if the URL matches the regex pattern
            If Regex.IsMatch(urlString, pattern) Then
                ' Return False
                isValid = False
            End If
            ' If all checks are passed, return True 

            'Return True
        End If
        Return isValid
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
        ' Dim regexString As String = System.Configuration.ConfigurationManager.AppSettings("regexString")
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

