# Walkthrough

This document walks through what seem to be the key directories and files in the EJScreen code (at least in as much as we've been able to work on it so far).

This is a work in progress! Please contribute as you learn more.

## /
- `index.html`
 - creates text in the top banner
 - creates the text for the modal that appears upon first load
 - creates the "tab-panes" that appear in the table of contents (layers, tools, reports, etc.)
- `comparemapper.html`
 - creates the overall layout for the side by side mapping tool

## /javascript
- `config_ejtoc_identify.js`
 - configures default fields for the EJ indicators/indexes
 - `ejIdentifyJSON` object used in `MapEJIndexMod.js` to make popups
 - specifies the services/links that each field (button in the TOC) should call to retrieve data (e.g. `ejscreenservice`, itself defined in `config.js`)
- `config.js`
 - many default configurations for the app
 - essentially consists of a variety of objects that define the layers you can add to the map (e.g. Colonias, Health Disparities, etc.)
- `defaults.js`
 - these are other defaults that get used in HTML portions of code, such as the title that appears in the top banner
- `layout_new.js`
 - handles a lot of what happens on the map: creates the basic layout and manages events

## /mapdijit
- `CompareMaps.js`
 - retrieves information needed to enable selection of map data
- `IDinfoWindow.js`
- `IDinfoWindowEJ.js`
 - these two ^^ seem to handle popups, including creating the "Generate Report" buttons (that we've hidden for now since report generation doesn't work)
- `MapEJIndexMod.js`
 - responsible for calling and creating the map feature layers
- `TOC.js`
 - although called "TOC" I think this is actually responsible for handling the legend

## /mapdijit/templates
- `CompareMaps.html`
 - Template for the side by side mapper. Can toggle off "demographics" and "thresholds" here as options for side by side mapping because these don't work right now.
- `EJinfoWindow.html`
- `IDinfoWindow.html`
- `IDinfoWindowEJ.html`
 - Templates for the popups
