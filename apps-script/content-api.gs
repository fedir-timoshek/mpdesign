/**
 * Google Apps Script - Read-only content endpoint
 *
 * Spreadsheet tabs expected:
 * - products
 * - categories
 * - site
 *
 * Deploy as Web App with "Anyone" read access.
 */
function doGet(e) {
  try {
    var locale = (e && e.parameter && e.parameter.locale) || "fr";
    var type = (e && e.parameter && e.parameter.type) || "all";

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    var payload = {
      updatedAt: new Date().toISOString(),
      locale: locale,
      categories: readSheet(ss, "categories"),
      products: readSheet(ss, "products"),
      site: readSheet(ss, "site"),
    };

    if (type !== "all") {
      payload = {
        updatedAt: payload.updatedAt,
      };
      payload[type] = readSheet(ss, type);
    }

    return jsonResponse(payload);
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error) }, 500);
  }
}

function readSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return [];
  }

  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) {
    return [];
  }

  var headers = values[0];
  var rows = values.slice(1);

  return rows
    .filter(function (row) {
      return row.join("").trim() !== "";
    })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (header, index) {
        obj[String(header)] = row[index];
      });
      return obj;
    });
}

function jsonResponse(payload, status) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
