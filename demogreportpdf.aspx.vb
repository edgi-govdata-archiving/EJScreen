Imports System.Net
Imports System.IO

Imports iTextSharp.text
Imports iTextSharp.text.pdf
Imports System.Xml
Imports System.Collections
Imports System.Text
Imports System.Collections.Generic



Partial Class demogreportpdf
    Inherits System.Web.UI.Page



    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        If Not IsPostBack Then
		Try
		
		
		
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

            Dim coordstr As String = Request.Params.Get("coords")
            Dim feattype As String = Request.Params.Get("feattype")
            Dim dist As String = Request.Params.Get("radius")
            Dim bunitcode As String = Request.Params.Get("unitcode")
            Dim bunit As String = Request.Params.Get("unit")
            Dim ptitle As String = Request.Params.Get("ptitle")

            Dim reporttype As String = Request.Params.Get("report")
			Dim landstr As String = "ALAND"
            Dim waterstr As String = "AWATER"					  											 
            If dist Is Nothing Then
                dist = "0"
            End If
            If bunit Is Nothing Then
                bunit = "mile"
            End If
            If bunitcode Is Nothing Then
                bunitcode = "9035"
            End If
            If ptitle Is Nothing Then
                ptitle = ""
            End If


            If reporttype Is Nothing Then
                reporttype = "acs2022"
            End If
            Dim requesturl As String = System.Configuration.ConfigurationManager.AppSettings("demogacs2022url")
            dim cityrequrl as string = System.Configuration.ConfigurationManager.AppSettings("demogacs2020cityurl")
            Dim pdftemplate As String = "~/pdftemplate/epaCensusACS.pdf"
            Dim acsyear As String = "2018 - 2022"
            Select Case reporttype.ToLower
                Case "census2010sf1"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demog2010sf1url")
                    pdftemplate = "~/pdftemplate/epaCensus2010SF1.pdf"
                    acsyear = ""
					landstr = "AREALAND"
					waterstr = "AREAWATR"
                Case "census2000sf3"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demog2000sf3url")
                    pdftemplate = "~/pdftemplate/epaCensus2000SF3.pdf"
                    acsyear = ""
                Case "acs2012"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2012url")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2008 - 2012"
                Case "acs2014"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2014url")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2010 - 2014"
                Case "acs2015"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2015url")
                    cityrequrl = System.Configuration.ConfigurationManager.AppSettings("demogacs2015cityurl")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2011 - 2015"
                Case "acs2016"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2016url")
                    cityrequrl = System.Configuration.ConfigurationManager.AppSettings("demogacs2016cityurl")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2012 - 2017"
                Case "acs2017"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2017url")
                    cityrequrl = System.Configuration.ConfigurationManager.AppSettings("demogacs2017cityurl")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2013 - 2017"
                Case "acs2018"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2018url")
                    cityrequrl = System.Configuration.ConfigurationManager.AppSettings("demogacs2018cityurl")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2014 - 2018"
                Case "acs2019"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2019url")
                    cityrequrl = System.Configuration.ConfigurationManager.AppSettings("demogacs2019cityurl")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2015 - 2019"
				Case "acs2020"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2020url")
                    cityrequrl = System.Configuration.ConfigurationManager.AppSettings("demogacs2020cityurl")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2016 - 2020"
                Case "acs2021"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2021url")
                    ' = System.Configuration.ConfigurationManager.AppSettings("demogacs2020cityurl")
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2017 - 2021"
				Case "acs2022"
                    requesturl = System.Configuration.ConfigurationManager.AppSettings("demogacs2022url")                   
                    pdftemplate = "~/pdftemplate/epaCensusACS.pdf"
                    acsyear = "2018 - 2022"
                    landstr = "ALAND"
					waterstr = "AWATER"						

            End Select

            Dim geomstr As String = ""
            Dim fips As String = ""
            Dim typestr As String = ""
            feattype = feattype.ToLower
            Select Case feattype
                Case "point"
                    Dim x As String = coordstr.Split(",")(0)
                    Dim y As String = coordstr.Split(",")(1)
                    geomstr = "{""x"": " & x & ", ""y"": " & y & ", ""spatialReference"": { ""wkid"": 4326} }"
                    typestr = "point center at " & y & ", " & x
                Case "polygon"
                    typestr = "polygonal location"
                    Dim coordsarray As String() = coordstr.Split(",")

                    geomstr = "{""rings"" : [["
                    For i As Integer = 0 To coordsarray.Length / 2 - 1
                        If i > 0 Then
                            geomstr = geomstr & ","
                        End If
                        geomstr = geomstr & "[" & FormatNumber(CDbl(coordsarray(2 * i)), 6) & "," & FormatNumber(CDbl(coordsarray(2 * i + 1)), 6) & "]"
                    Next
                    geomstr = geomstr & "]], ""spatialReference"": { ""wkid"": 4326} }"
                Case "polyline"
                    typestr = "linear location"
                    Dim coordsarray As String() = coordstr.Split(",")

                    geomstr = "{""paths"" : [["
                    For i As Integer = 0 To coordsarray.Length / 2 - 1
                        If i > 0 Then
                            geomstr = geomstr & ","
                        End If
                        geomstr = geomstr & "[" & FormatNumber(CDbl(coordsarray(2 * i)), 6) & "," & FormatNumber(CDbl(coordsarray(2 * i + 1)), 6) & "]"
                    Next
                    geomstr = geomstr & "]], ""spatialReference"": { ""wkid"": 4326} }"
                Case "bg"
                    fips = coordstr
                    typestr = "Blockgroup"
                Case "blockgroup"
                    fips = coordstr
                    typestr = "Blockgroup"
                Case "city"
                    'requesturl = cityrequrl
                    fips = coordstr
                    typestr = "City"
                Case "tract"
                    fips = coordstr
                    typestr = "Tract"
                Case "county"
                    fips = coordstr
                    typestr = ""
                Case Else
                    fips = coordstr
                    typestr = feattype
            End Select
            Dim locationstr As String = ""
            If feattype = "point" Or feattype = "polygon" Or feattype = "polyline" Then
                locationstr = "User-specified " & typestr
            ElseIf feattype = "bg" Then
                locationstr = typestr & " " & fips
            ElseIf feattype = "county" Then
                Dim namestr As String = Request.Params.Get("namestr")
                if namestr is Nothing then
                    namestr = coordstr
                end if
                locationstr = namestr
            Else
                Dim namestr As String = Request.Params.Get("namestr")
                if namestr is Nothing then
                    namestr = coordstr
                end if
                locationstr = typestr & ": " & namestr
            End If


            Dim studyareastr As String = ""

            If ptitle.Length > 0 Then
                studyareastr = studyareastr & ptitle
            End If

            'Response.Write(geomstr)
            Dim params4post As String = "geometry=" & geomstr & "&distance=" & dist & "&unit=" & bunitcode & "&areaid=" & fips & "&areatype=" & feattype & "&f=xml"
            'if feattype = "city" then
                'params4post = "citycode=" & fips & "&f=xml"
            'end if
            'Response.Write(requesturl)
            'Response.Write(params4post)
            
            
                Dim webreq As HttpWebRequest = CType(WebRequest.Create(requesturl), HttpWebRequest)
                webreq.ContentType = "application/x-www-form-urlencoded"
                webreq.Method = "POST"
                Dim PostData() As Byte = System.Text.Encoding.ASCII.GetBytes(params4post)
                webreq.ContentLength = PostData.Length

                Dim tempStream As Stream = webreq.GetRequestStream()

                'write the data to be posted to the Request Stream
                tempStream.Write(PostData, 0, PostData.Length)
                tempStream.Close()
                Dim webres As WebResponse = webreq.GetResponse()
                Dim sr As New StreamReader(webres.GetResponseStream)

                'convert the stream to a string
                Dim s As String = sr.ReadToEnd.Trim
                sr.Close()
                'Response.Write(s)

                Dim doc As New System.Xml.XmlDocument
                doc.LoadXml(s)
                Dim pairobj As New Dictionary(Of String, String)

                If doc.GetElementsByTagName("Stat").Count = 0 And doc.GetElementsByTagName("message").Count > 0 Then
                    Dim errormessage As String = doc.GetElementsByTagName("message").Item(0).InnerText
                    Response.Write("<h3>" & errormessage & "</h3>")
                    Exit Sub
                End If
                    For a As Integer = 0 To doc.GetElementsByTagName("Stat").Count - 1
                        Dim aNode As XmlElement = doc.GetElementsByTagName("Stat").Item(a)
                        Dim aname As String = aNode.Attributes("name").Value
                        Dim avalue As String = aNode.Attributes("value").Value
                        'Response.Write(aname & ": " & avalue & "<br />")
                        'if aname = "AREAWATER" then
                        '    aname = "AREAWATR"
                        'end if
                        'if aname = "PCT_AREAWATER" then
                        '    aname = "PCT_AREAWATR"
                        'end if
                        pairobj.Add(aname, avalue)
                    Next
                    Dim datasheet As String = Server.MapPath(pdftemplate)
                    Response.Clear()
                    
                    Response.ContentType = "application/pdf"
                    Response.AddHeader("Content-Disposition", "inline;filename=" & reporttype & "_report.pdf")
                    

                    Dim reader As New PdfReader(datasheet)

                    Using ms As New MemoryStream()
                        Using stamper As New PdfStamper(reader, ms)
                            Dim form As AcroFields = stamper.AcroFields
                            Dim selector As FontSelector = New FontSelector
                            Dim f1 As Font = FontFactory.GetFont(FontFactory.TIMES_ROMAN, 12, BaseColor.RED)
                            Dim ringstr As String = dist & "-" & bunit & " radius"
                            if acsyear.Length > 0 then
                                form.SetField("ACS_YEAR", acsyear)
                                form.SetField("ACS_YEAR_SM", acsyear)
                            end if
                            form.SetField("LOCATION", locationstr)
                            form.SetField("RING", ringstr)
                            form.SetField("STUDY_AREA", studyareastr)
                            form.SetField("REPORT_DATE", Now.ToString("MMMM dd, yyyy"))

                            Dim areastr As String = ""
                            'Dim landarea As String = pairobj("ALAND")
                            'Dim waterarea As String = pairobj("AWATER")
                             Dim landarea As String = pairobj(landstr)
                             Dim waterarea As String = pairobj(waterstr)									 															   
                            Dim landvalue As Double = CDbl(landarea)
                            Dim watervalue As Double = CDbl(waterarea)
                            Dim totalarea As Double = landvalue + watervalue
                            totalarea = FormatNumber(totalarea, 2)
                            areastr = totalarea & " sq. miles"
                            'form.SetField("AREA_SIZE", areastr)
                            Dim pair As KeyValuePair(Of String, String)
                            For Each pair In pairobj


                                Dim fld As String = pair.Key
                                Dim fldvalue As String = pair.Value.ToString
                                'Response.Write(fld & ": " & fldvalue & "<br />")
								form.SetField(fld, fldvalue)
                                If fld.Substring(0, 4) = "PCT_" Or fld.Substring(0, 2) = "P_" Then
                                    If IsNumeric(fldvalue) Then
									'Note 5/31/23 - SOE has already multiplied by 100, now just add % sign only
                                        'form.SetField(fld, FormatPercent(fldvalue, 0))
										form.SetField(fld, fldvalue & "%")
										
                                    Else
                                        form.SetField(fld, fldvalue)
                                    End If
                                Else								
                                     If IsNumeric(fldvalue) Then
                                         'If (fld = "ALAND" Or fld = "AWATER") Then
									     If (fld = landstr Or fld = waterstr) Then
                                            form.SetField(fld, FormatNumber(fldvalue, 2))									   
                                             form.SetField(fld, FormatNumber(fldvalue, 2))
                                         Else
                                             form.SetField(fld, FormatNumber(fldvalue, 0))
                                         End If

                                     Else
                                         form.SetField(fld, fldvalue)
                                     End If
									
                                End If

                            Next

                            stamper.FormFlattening = True
                            stamper.Close()
                        End Using

                        Response.BinaryWrite(ms.ToArray())
                        
                    End Using
                    Response.Flush()
                    response.Close()
                    reader.Close()
                    Response.End()
		Catch ex As Exception
                Response.Write("<br>error occurred: " & ex.Message)
        End Try
        End If
    End Sub
	
	
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


