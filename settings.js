var settings = {}

settings.locales = {
  "Denmark": "da-DK",
  "Finland (Finnish)": "fi-FI",
  "Finland (Swedish)": "sv-FI",
  "France": "fr-FR",
  "Germany": "de-DE",
  "Norway (Bokmål)": "nb-NO",
  "Norway (Nynorsk)": "nn-NO",
  "Sweden": "sv-SE",
  "United Kingdom": "en-GB",
  "United States": "en-US",
}

settings.defaults = {
  software: {
    allowed: ["Excel for Windows", "Excel for Mac", "Google Sheets", "LibreOffice/OpenOffice", "NeoOffice"],
    default: "Excel for Windows",
  },
  language: {
    allowed: ["Danish", "English", "Finnish", "French", "German", "Norwegian", "Portuguese", "Spanish", "Swedish"],
    default: "English"
  },
  locale: {
    allowed: [],  // Uses settings.locale keys, above
    default: "United Kingdom"
  },
  os: {
    allowed: ["Windows", "MacOS", "Linux"],
    default: "Windows"
  }
}
settings.defaults.locale.allowed = Object.keys(settings.locales)

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
  "Analyzing: Pivot tables": "pivot-tables",
  "Combining data": "lookup-functions",
  "Splitting columns": "splitting-columns",
  "Find the winner": "find-the-winner",
}

settings.defaultSpreadsheetHeight = 15
// Number of rows

module.exports = settings
