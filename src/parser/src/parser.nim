#import zippy     
import zippy/ziparchives
import os
import std/xmlparser
import std/xmltree
import std/strutils
import std/tables
import nimpy

#let mimetype = "application/prs.ktb+zip"
let baseHtml = """<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0//EN" "http://www.w3.org/TR/REC-html40/strict.dtd">
<html><head><meta name="qrichtext" content="1" /><meta charset="utf-8" /><style type="text/css">
p, li { white-space: pre-wrap; }
hr { height: 1px; border-width: 0; }
li.unchecked::marker { content: "\2610"; }
li.checked::marker { content: "\2612"; }
</style></head><body style=" font-family:'Noto Sans'; font-size:14pt; font-weight:400; font-style:normal;" bgcolor="#ffffff">
<table style="-qt-table-type: root; margin-top:75.5906px; margin-bottom:75.5906px; margin-left:75.5906px; margin-right:75.5906px;">
<tr>
<td style="border: none;">"""
proc parseNode(node: XmlNode): string

proc parseChildren(node: XmlNode): string =
  for child in node:
    result &= parseNode(child)

proc parseNode(node: XmlNode): string =
  case node.kind
  of xnText:
    result &= node.text & "\n"
  of xnElement:
    result &= "<" & node.tag & ">\n"
    result &= node.parseChildren()
    result &= "</" & node.tag & ">\n"
  else: discard

var map = {
          "<office:document-content>": baseHtml,
          "<text:p>": "<p>",
          "</text:p>": "</p>",
          "</office:document-content>": "</body>\n</html>",
          "<text:span>": "<span>",
          "</text:span>": "</span>",
          }.toTable()

proc odtToKtb(path: string): string {.exportpy.} =
  let odt = openZipArchive(path)
  let htmlPath = path.changeFileExt("html")
  let content = odt.extractFile("content.xml")
  let styles = odt.extractFile("styles.xml")
  let xml = parseXml(content)
  var html: string
  let parsedXml = xml.parseNode()
  for line in parsedXml.splitLines():
    if map.hasKey(line):
      html &= map[line] & "\n"
    if not line.startsWith("<"):
      html &= line & "\n"
    echo line
  echo html
  return html
  
echo odtToKtb("/home/abdulrahman/Desktop/document.odt")
#writeFile(htmlPath, html)