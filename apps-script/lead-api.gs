/**
 * Google Apps Script - Lead collection endpoint
 *
 * Sheet tab expected: "leads"
 * Columns are auto-created on first write if missing.
 *
 * Script Properties:
 * - TELEGRAM_BOT_TOKEN
 * - TELEGRAM_CHAT_ID
 * - RATE_LIMIT_PER_HOUR (optional, default 5)
 * - DUPLICATE_WINDOW_SECONDS (optional, default 600)
 */
var ALLOWED_LOCALES = { fr: true, de: true };
var MAX_NAME_LENGTH = 120;
var MAX_PHONE_LENGTH = 40;
var MAX_EMAIL_LENGTH = 180;
var MAX_MESSAGE_LENGTH = 2000;
var MAX_SOURCE_PAGE_LENGTH = 220;
var MAX_PRODUCT_SLUG_LENGTH = 120;

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, errorCode: "missing_payload" });
    }

    var rawBody = parseJsonBody(e.postData.contents);
    if (!rawBody) {
      return jsonResponse({ ok: false, errorCode: "invalid_json" });
    }

    if (String(rawBody.honeypot || "").trim() !== "") {
      return jsonResponse({ ok: false, errorCode: "spam_detected" });
    }

    var body = normalizePayload(rawBody);
    var validationError = validatePayload(body);
    if (validationError) {
      return jsonResponse({ ok: false, errorCode: validationError });
    }

    var antiSpamError = applyAntiSpamGuards(body);
    if (antiSpamError) {
      return jsonResponse({ ok: false, errorCode: antiSpamError });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("leads") || ss.insertSheet("leads");

    ensureHeader(sheet, [
      "timestamp",
      "leadId",
      "locale",
      "sourcePage",
      "productSlug",
      "name",
      "phone",
      "email",
      "message",
      "consent",
    ]);

    var leadId = Utilities.getUuid();
    var timestamp = new Date().toISOString();

    sheet.appendRow([
      timestamp,
      leadId,
      body.locale,
      body.sourcePage,
      body.productSlug,
      body.name,
      body.phone,
      body.email,
      body.message,
      body.consent,
    ]);

    // Telegram should never block lead capture (Sheets is the source of truth).
    try {
      sendTelegramNotification({
        leadId: leadId,
        locale: body.locale,
        sourcePage: body.sourcePage,
        productSlug: body.productSlug,
        name: body.name,
        phone: body.phone,
        email: body.email,
        message: body.message,
      });
    } catch (telegramError) {
      Logger.log(telegramError);
    }

    return jsonResponse({ ok: true, leadId: leadId, timestamp: timestamp });
  } catch (error) {
    Logger.log(error);
    return jsonResponse({ ok: false, errorCode: "server_error" });
  }
}

function parseJsonBody(raw) {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
}

function normalizePayload(body) {
  var sourcePage = sanitizeText(body.sourcePage, MAX_SOURCE_PAGE_LENGTH);
  if (sourcePage && sourcePage.charAt(0) !== "/") {
    sourcePage = "";
  }

  return {
    locale: sanitizeText(body.locale, 8).toLowerCase(),
    sourcePage: sourcePage,
    productSlug: sanitizeText(body.productSlug, MAX_PRODUCT_SLUG_LENGTH).toLowerCase(),
    name: sanitizeText(body.name, MAX_NAME_LENGTH),
    phone: sanitizeText(body.phone, MAX_PHONE_LENGTH),
    email: sanitizeText(body.email, MAX_EMAIL_LENGTH).toLowerCase(),
    message: sanitizeText(body.message, MAX_MESSAGE_LENGTH),
    consent: body.consent === true || String(body.consent).toLowerCase() === "true",
  };
}

function sanitizeText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function validatePayload(body) {
  if (!ALLOWED_LOCALES[body.locale]) {
    return "invalid_locale";
  }

  if (!body.name || body.name.length < 2) {
    return "invalid_name";
  }

  if (!isValidEmail(body.email)) {
    return "invalid_email";
  }

  if (!body.message || body.message.length < 10) {
    return "invalid_message";
  }

  if (!body.consent) {
    return "consent_required";
  }

  if (body.phone && !/^[0-9+().\-\/\s]{4,40}$/.test(body.phone)) {
    return "invalid_phone";
  }

  if (body.productSlug && !/^[a-z0-9-]+$/.test(body.productSlug)) {
    return "invalid_product_slug";
  }

  return "";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function applyAntiSpamGuards(body) {
  var cache = CacheService.getScriptCache();
  var props = PropertiesService.getScriptProperties();

  var rateLimitPerHour = Number(props.getProperty("RATE_LIMIT_PER_HOUR") || "5");
  if (!rateLimitPerHour || rateLimitPerHour < 1) {
    rateLimitPerHour = 5;
  }

  var duplicateWindowSeconds = Number(
    props.getProperty("DUPLICATE_WINDOW_SECONDS") || "600",
  );
  if (!duplicateWindowSeconds || duplicateWindowSeconds < 60) {
    duplicateWindowSeconds = 600;
  }

  var emailKey = "lead:rate:" + hashString(body.email);
  var submissions = Number(cache.get(emailKey) || "0");
  if (submissions >= rateLimitPerHour) {
    return "rate_limited";
  }
  cache.put(emailKey, String(submissions + 1), 3600);

  var duplicateSignature = [
    body.locale,
    body.email,
    body.phone,
    body.message.toLowerCase(),
    body.sourcePage,
    body.productSlug,
  ].join("|");
  var duplicateKey = "lead:dup:" + hashString(duplicateSignature);
  if (cache.get(duplicateKey)) {
    return "duplicate_submission";
  }
  cache.put(duplicateKey, "1", duplicateWindowSeconds);

  return "";
}

function hashString(value) {
  var bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    value,
    Utilities.Charset.UTF_8,
  );
  var hex = bytes
    .map(function (byte) {
      var normalized = byte < 0 ? byte + 256 : byte;
      var chunk = normalized.toString(16);
      return chunk.length === 1 ? "0" + chunk : chunk;
    })
    .join("");
  return hex.slice(0, 48);
}

function ensureHeader(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    return;
  }

  var current = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var needsRewrite = headers.some(function (value, index) {
    return current[index] !== value;
  });

  if (needsRewrite) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function sendTelegramNotification(payload) {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty("TELEGRAM_BOT_TOKEN");
  var chatId = props.getProperty("TELEGRAM_CHAT_ID");

  if (!token || !chatId) {
    return;
  }

  var lines = [
    "New MPDESIGN lead",
    "ID: " + payload.leadId,
    "Locale: " + payload.locale,
    "Source: " + payload.sourcePage,
    "Product: " + payload.productSlug,
    "Name: " + payload.name,
    "Phone: " + payload.phone,
    "Email: " + payload.email,
    "Message: " + payload.message,
  ];

  // Telegram text limit is 4096 characters.
  var text = lines.join("\n");
  if (text.length > 3900) {
    text = text.slice(0, 3900) + "\n...";
  }

  var url = "https://api.telegram.org/bot" + token + "/sendMessage";
  var params = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
    muteHttpExceptions: true,
  };

  try {
    UrlFetchApp.fetch(url, params);
  } catch (error) {
    Logger.log(error);
  }
}

function jsonResponse(payload) {
  var output = ContentService.createTextOutput(JSON.stringify(payload));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
