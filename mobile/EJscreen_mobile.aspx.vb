Imports System.Net
Imports System.IO

Imports System.Web.Services

Imports System.Drawing.Imaging
Imports System.Xml
Imports System.Collections
Imports System.Text
Imports System.Math

Partial Class EJscreen_mobile
    Inherits System.Web.UI.Page

    Public coordstr As String = ""
    Public feattype As String = ""
    Public dist As String = "0"
    Public bunit As String = "miles"
    Public areaid As String = ""
    Public namestr As String = ""
    public basemap as String = ""
    public ptitle as String = ""


    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load

        If Not IsPostBack Then
            Try
                Dim regexString As String = System.Configuration.ConfigurationManager.AppSettings("regexString")
                Dim RegexObj As System.Text.RegularExpressions.Regex = New System.Text.RegularExpressions.Regex(regexString, System.Text.RegularExpressions.RegexOptions.IgnorePatternWhitespace)

                Dim pcounter As Integer = Context.Request.Params.Count
                Dim currentContext As HttpContext = HttpContext.Current
                Dim method_get As Boolean = (Request.ServerVariables("Request_Method").ToUpper = "GET")
                Try
                    If method_get Then
                        Dim requestUrl As Uri = currentContext.Request.Url
                        Dim requestUrlString As String = requestUrl.ToString()
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
                    Response.End()
                End Try
                coordstr = Request.Params.Get("geometry")
                If (coordstr.Length > 1) Then
                    coordstr = Server.UrlDecode(coordstr)
                    'Dim coordreg As String = "^\{\}$"

                    'Dim regLat As RegularExpressions.Regex = New RegularExpressions.Regex(coordreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)


                    'If regLat.IsMatch(coordstr) Then
                    'Else
                    '    Response.Write("alert('Invalid geometry input!')")
                    '    Response.End()
                    'End If
                End If

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
                dist = Request.Params.Get("distance")
                If (dist.Length > 0) Then
                    Dim distreg As String = "^\d*(\.\d+|)\s?$"
                    Dim regdist As RegularExpressions.Regex = New RegularExpressions.Regex(distreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)

                    If dist Is Nothing Then
                        dist = "0"
                    End If
                    If regdist.IsMatch(dist) Then

                    Else
                        Response.Write("alert('Invalid distance input!')")
                        Response.End()
                    End If
                End If

                bunit = Request.Params.Get("unit")
                If bunit.Length > 1 Then
                    Dim unitreg As String = "^(9001|9002|9035|9036|9037)$"
                    Dim regunit As RegularExpressions.Regex = New RegularExpressions.Regex(unitreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)
                    If regunit.IsMatch(bunit) Then

                    Else
                        Response.Write("alert('Invalid unit input!')")
                        Response.End()
                    End If

                End If
                basemap = Request.Params.Get("basemap")
                If basemap Is Nothing Then
                    basemap = "streets"

                Else
                    Dim bmapreg As String = "^(streets|satellite|hybrid|topo|gray|dark-gray|oceans|national-geographic|terrain|osm)$"
                    Dim regbmap As RegularExpressions.Regex = New RegularExpressions.Regex(bmapreg, RegularExpressions.RegexOptions.IgnorePatternWhitespace)
                    If regbmap.IsMatch(basemap) Then

                    Else
                        basemap = "streets"
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
                ptitle = Request.Params.Get("ptitle")


            Catch ex As Exception
                Context.Response.Write("error occurred: " & ex.Message)
                Context.Response.Flush()
                Response.End()
            End Try

        End If



    End Sub

    Private Sub ValidateForInvalidCharacters(requestUrlString As String)
        GetDecodedUrl(requestUrlString)
        'Dim decoded As Boolean = IsDecoded(requestUrlString)
        'Context.Response.Write("Decoded URL: " & decodedUrl)
        'If decoded Then
        '    If RegexObj.IsMatch(requestUrlString) Then
        '        Context.Response.Write("Invalid characters in URL!")
        '        Context.Response.Flush()
        '        Response.End()
        '    End If
        'Else
        '    Context.Response.Write("Invalid URL!")
        '    Context.Response.Flush()
        '    Response.End()
        'End If



    End Sub

    Public Function IsDecoded(ByVal url As String) As Boolean
        Dim decodedUrl As String = HttpUtility.UrlDecode(url)
        Return decodedUrl = url ' Returns True if the URL was not encoded, False otherwise
    End Function

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
    'Private Sub ValidateForInvalidCharacters(requestUrlString As String)
    '    Dim regexString As String = System.Configuration.ConfigurationManager.AppSettings("regexString")
    '    Dim RegexObj As System.Text.RegularExpressions.Regex = New System.Text.RegularExpressions.Regex(regexString, System.Text.RegularExpressions.RegexOptions.IgnorePatternWhitespace)
    '    Dim decodedUrl As String = DecodeMultiple(requestUrlString)
    '    'Context.Response.Write("Decoded URL: " & decodedUrl)
    '    If RegexObj.IsMatch(decodedUrl) Then
    '        Context.Response.Write("Invalid characters in URL!")
    '        Context.Response.Flush()
    '        Response.End()
    '    End If


    'End Sub

    'Public Function DecodeMultiple(ByVal url As String) As String
    '    While True
    '        Dim decodedUrl As String = HttpUtility.UrlDecode(url)
    '        If decodedUrl = url Then
    '            Exit While
    '        Else
    '            url = decodedUrl
    '        End If
    '    End While
    '    Return url
    'End Function


End Class

