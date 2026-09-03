/**
 * ============================================================================
 *  PASSENGER FACILITATION REQUEST FORM  —  GOOGLE SHEET RECEIVER
 *  Federal Investigation Agency
 *  Immigration & Anti-Human Smuggling Wing, Jinnah International Airport,
 *  Karachi.
 *
 *  Companion script for index.html, form version 1.2.
 * ============================================================================
 *
 *  WHAT IS NEW IN THIS VERSION
 *
 *  Two columns have been introduced at the front of the sheet:
 *
 *    "Request Code"    the unique code that the form generated for that
 *                      submission. The same code is printed at the head of
 *                      the WhatsApp message, which allows the receiving
 *                      officer to match a message against this record.
 *
 *    "Code Verified"   filled in automatically by this script. Every code
 *                      carries a check character. The script recomputes that
 *                      character on arrival and enters a tick when it agrees
 *                      and a cross when it does not. A code that has been
 *                      typed by hand or altered in transit will therefore
 *                      not tick.
 *
 *  A code that reaches the officer on WhatsApp but is absent from this sheet
 *  did not come from the form at all, and should be treated accordingly.
 *
 * ----------------------------------------------------------------------------
 *  INSTALLATION
 *
 *  1.  Open the Google Sheet that receives the form entries.
 *  2.  Extensions  >  Apps Script.
 *  3.  Remove the existing contents of the editor and paste this file in.
 *  4.  Set SHEET_NAME below to the exact name of the tab that holds the data.
 *  5.  Deploy  >  Manage deployments  >  edit the existing deployment (pencil
 *      icon)  >  Version: New version  >  Deploy.
 *      Retain the same deployment so that the /exec address already written
 *      into index.html continues to work.
 *      Execute as: Me.        Who has access: Anyone.
 *  6.  Submit one test entry from the form and confirm that a fresh row
 *      appears carrying a code and a tick.
 *
 * ----------------------------------------------------------------------------
 *  A NOTE ON AN EXISTING SHEET
 *
 *  Nothing already recorded is disturbed. On each submission the script reads
 *  the header row, adds any of the headings listed in COLUMN_ORDER that are
 *  not already present, and writes each value beneath its own heading.
 *
 *  If the sheet already carries headings worded differently from the list
 *  below, those older columns will simply stop receiving values and new ones
 *  will be added alongside. Where that is not desired, either rename the
 *  existing headings to match COLUMN_ORDER exactly, or point SHEET_NAME at a
 *  fresh tab and let the script lay out the headings itself.
 * ============================================================================
 */


/* ==========================================================================
 *  SETTINGS
 * ========================================================================== */

/** Exact name of the tab that stores the entries. */
var SHEET_NAME = 'Sheet1';

/** Time zone used for the Timestamp column. */
var TIME_ZONE = 'Asia/Karachi';

/** Column headings, in the order in which they are laid out. */
var COLUMN_ORDER = [
  'Timestamp',
  'Request Code',
  'Code Verified',
  'First Name',
  'Last Name',
  'Age',
  'Email',
  'Phone',
  'Designation',
  'Department/Company',
  'Flight Number',
  'Airline',
  'Flight Date',
  'Flight Time',
  'Arrival/Departure',
  'Category',
  'Type',
  'Reference Person',
  'Reference Contact',
  'PRO Name',
  'PRO Contact',
  'PRO Designation',
  'PRO Department',
  'Accompanying Count',
  'Accompanying Details',
  'Comments'
];


/* ==========================================================================
 *  REQUEST CODE
 *
 *  CODE_CHARS, CODE_WEIGHTS and codeCheckChar() are reproduced character for
 *  character from index.html. Should either copy be altered, codes issued by
 *  the form will cease to verify here. Amend both together or neither.
 * ========================================================================== */

/** Alphabet of the random part and of the check character. 0, 1, I, L, O and
 *  U are left out so that a code read off a message cannot be misread. */
var CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

/** Position weights. Every one of them is prime to 30, the size of the
 *  alphabet, so that any single wrong character upsets the check character. */
var CODE_WEIGHTS = [1, 17, 13, 11, 7, 23, 19, 17, 1, 29];

/** Pattern of a well formed code, for example PFR-250903-K7M4-9. */
var CODE_PATTERN =
  /^PFR-(\d{6})-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})-([23456789ABCDEFGHJKMNPQRSTVWXYZ])$/;

/**
 * Recomputes the check character from the date part ("250903") and the random
 * part ("K7M4") of a code.
 */
function codeCheckChar(datePart, randomPart) {
  var sum = 0, i;
  for (i = 0; i < datePart.length; i++) {
    sum += (datePart.charCodeAt(i) - 48) * CODE_WEIGHTS[i];
  }
  for (i = 0; i < randomPart.length; i++) {
    sum += CODE_CHARS.indexOf(randomPart.charAt(i)) * CODE_WEIGHTS[datePart.length + i];
  }
  return CODE_CHARS.charAt(sum % CODE_CHARS.length);
}

/** True when the code is well formed and its check character agrees. */
function isCodeValid(code) {
  var m = CODE_PATTERN.exec(String(code == null ? '' : code).trim().toUpperCase());
  if (!m) return false;
  return codeCheckChar(m[1], m[2]) === m[3];
}

/**
 * Custom sheet function, for checking a code taken off a WhatsApp message.
 * Enter  =PFRVERIFY("PFR-250903-K7M4-9")  in any cell.
 */
function PFRVERIFY(code) {
  return isCodeValid(code) ? '✔' : '✘';
}


/* ==========================================================================
 *  WEB APP ENTRY POINTS
 *
 *  The form reaches this script by navigator.sendBeacon (a POST), by fetch
 *  or, on older browsers, by an image request (both GET). All three carry
 *  their values in the query string, so both handlers share one routine.
 * ========================================================================== */

function doGet(e)  { return handleSubmission(e); }
function doPost(e) { return handleSubmission(e); }

function handleSubmission(e) {
  var params = (e && e.parameter) ? e.parameter : {};

  // The web app address opened in a browser carries no values. Report the
  // service instead of recording an empty row.
  if (!params.requestCode && !params.firstName) {
    return reply({
      ok: true,
      service: 'Passenger Facilitation Request receiver',
      version: '1.2'
    });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return reply({ ok: false, error: 'The sheet was busy. Please submit again.' });
  }

  try {
    var sheet   = getSheet();
    var headers = ensureHeaders(sheet);
    var values  = buildValues(params);
    var code    = values['Request Code'];

    // Guard against one and the same submission arriving twice. A record is
    // set aside only when an existing row carries both the same code and the
    // same passenger and flight, so that two separate requests which happen
    // to draw the same code on one day are still both entered.
    if (isRepeatOfExistingRow(sheet, headers, values)) {
      return reply({ ok: true, duplicate: true, code: code });
    }

    var row = [];
    for (var i = 0; i < headers.length; i++) {
      row.push(Object.prototype.hasOwnProperty.call(values, headers[i]) ? values[headers[i]] : '');
    }
    sheet.appendRow(row);

    return reply({ ok: true, code: code, verified: values['Code Verified'] });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}


/* ==========================================================================
 *  SHEET HANDLING
 * ========================================================================== */

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

/**
 * Returns the header row, having first added any heading from COLUMN_ORDER
 * that the sheet does not yet carry. Existing headings are left where they
 * are, so earlier records remain readable.
 */
function ensureHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  var headers = [];

  if (lastCol > 0) {
    var raw = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    for (var i = 0; i < raw.length; i++) headers.push(String(raw[i]).trim());
    while (headers.length && headers[headers.length - 1] === '') headers.pop();
  }

  if (headers.length === 0) {
    headers = COLUMN_ORDER.slice();
    ensureColumnCapacity(sheet, headers.length);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    formatHeaderRow(sheet, headers.length);
    return headers;
  }

  var missing = [];
  for (var j = 0; j < COLUMN_ORDER.length; j++) {
    if (headers.indexOf(COLUMN_ORDER[j]) === -1) missing.push(COLUMN_ORDER[j]);
  }
  if (missing.length) {
    ensureColumnCapacity(sheet, headers.length + missing.length);
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
    formatHeaderRow(sheet, headers.length);
  }
  return headers;
}

/**
 * A sheet is created with a fixed number of columns, twenty six by default.
 * Writing beyond that number raises an out of bounds error, so the grid is
 * widened first whenever the headings call for more room.
 */
function ensureColumnCapacity(sheet, required) {
  var available = sheet.getMaxColumns();
  if (available < required) sheet.insertColumnsAfter(available, required - available);
}

function formatHeaderRow(sheet, columnCount) {
  var range = sheet.getRange(1, 1, 1, columnCount);
  range.setFontWeight('bold');
  range.setBackground('#0d3b2e');
  range.setFontColor('#ffffff');
  if (sheet.getFrozenRows() < 1) sheet.setFrozenRows(1);
}

/**
 * True when the sheet already holds this very submission, that is a row
 * bearing the same code and the same passenger and flight. Where the code
 * matches but the particulars differ, the two are separate requests and this
 * returns false so that both are entered.
 */
function isRepeatOfExistingRow(sheet, headers, values) {
  var code = values['Request Code'];
  if (!code) return false;

  var codeCol = headers.indexOf('Request Code') + 1;
  if (codeCol < 1) return false;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  var recorded = sheet.getRange(2, codeCol, lastRow - 1, 1).getValues();
  var wanted = identitySignature(values);

  for (var i = 0; i < recorded.length; i++) {
    if (String(recorded[i][0]).trim().toUpperCase() !== code) continue;

    var row = sheet.getRange(i + 2, 1, 1, headers.length).getValues()[0];
    var existing = {};
    for (var h = 0; h < headers.length; h++) existing[headers[h]] = row[h];
    if (identitySignature(existing) === wanted) return true;
  }
  return false;
}

/** Particulars by which one submission is told apart from another. */
function identitySignature(values) {
  var fields = ['First Name', 'Last Name', 'Phone', 'Flight Number', 'Flight Date', 'Flight Time'];
  var parts = [];
  for (var i = 0; i < fields.length; i++) {
    var v = values[fields[i]];
    parts.push(String(v === undefined || v === null ? '' : v).trim().toUpperCase());
  }
  return parts.join('|');
}


/* ==========================================================================
 *  VALUES
 * ========================================================================== */

function buildValues(params) {
  function get(name) {
    var v = params[name];
    return (v === undefined || v === null) ? '' : String(v).trim();
  }

  var code = get('requestCode').toUpperCase();

  return {
    'Timestamp'            : Utilities.formatDate(new Date(), TIME_ZONE, 'dd-MMM-yyyy HH:mm:ss'),
    'Request Code'         : code,
    'Code Verified'        : code ? (isCodeValid(code) ? '✔' : '✘') : '',
    'First Name'           : get('firstName'),
    'Last Name'            : get('lastName'),
    'Age'                  : get('paxAge'),
    'Email'                : get('email'),
    'Phone'                : get('phone'),
    'Designation'          : get('paxDesignation'),
    'Department/Company'   : get('paxDepartment'),
    'Flight Number'        : get('flightNumber'),
    'Airline'              : get('airlineName'),
    'Flight Date'          : get('flightDate'),
    'Flight Time'          : get('flightTime'),
    'Arrival/Departure'    : get('travel'),
    'Category'             : get('category'),
    'Type'                 : get('requestType'),
    'Reference Person'     : get('referencePerson'),
    'Reference Contact'    : get('referenceContact'),
    'PRO Name'             : get('proName'),
    'PRO Contact'          : get('proContact'),
    'PRO Designation'      : get('proDesignation'),
    'PRO Department'       : get('proDepartment'),
    'Accompanying Count'   : get('accompanyingCount'),
    'Accompanying Details' : get('accompanyingDetails'),
    'Comments'             : get('comments')
  };
}

function reply(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
