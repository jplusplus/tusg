var settings = {}

settings.defaults = {
  software: {
    allowed: ["Excel for Windows", "Excel for Mac", "Google Sheets", "LibreOffice/OpenOffice", "NeoOffice"],
    default: "Excel for Windows",
  },
  language: {
    allowed: ["English", "Swedish", "Finnish"],
    default: "English"
  },
  locale: {
    allowed: ["sv-SE", "en-US", "en-GB"],
    default: "en-US"
  },
  os: {
    allowed: ["Windows", "MacOS", "Linux"],
    default: "Windows"
  }
}

settings.versions = {
  "Excel for Windows": ["Excel 2016", "Excel 2013", "Excel 2010", "Excel 2007"], 
  "Excel for Mac": ["Excel 2016", "Excel 2015", "Excel 2011", "Excel 2008"],
  "LibreOffice/OpenOffice": ["5.0.0", "4.4.0", "4.3.0", "4.2.0", "4.1.0", "3.6.0"],
  "Google Sheets": [],
  "NeoOffice": ["NeoOffice 2015", "NeoOffice 2014", "NeoOffice 2013", "NeoOffice 3.4"]
}

settings.forcedOS = {
  "Excel for Windows": "Windows",
  "Excel for Mac": "MacOS",
  "NeoOffice": "MacOS",  
}

settings.chapters = {
  "What software should I use?": "chosing-software",
  "Guiding principles": "best-practices",
  "Cleaning up your sheet": "cleaning-up",
  "Combining data": "lookup-functions",
}

module.exports = settings