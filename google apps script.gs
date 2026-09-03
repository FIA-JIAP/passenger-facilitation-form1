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
 *  FINDING THE EXISTING PROJECT
 *
 *  The form sends its entries to this deployment:
 *    AKfycbyLUWCyd-5fzHuShdonzF4bOUxLSUUIVasdXQ8edNmkdQe00SwgxWazFQa2oZPpxCivZw
 *
 *  Either route below will reach the project that owns it.
 *
 *  a.  Open the Google Sheet that receives the entries, then choose
 *      Extensions  >  Apps Script. This is the usual case.
 *
 *      A project created on its own at script.google.com is attached to no
 *      sheet at all. SPREADSHEET_ID must then be filled in, otherwise the
 *      script has nothing to write to.
 *
 *  b.  Or go to  script.google.com/home  and look under My Projects.
 *      Every project of yours is listed there, whether attached to a sheet
 *      or standing on its own.
 *
 *  To confirm you have opened the right one, choose Deploy > Manage
 *  deployments and check that the Web app address ends in the same
 *  AKfycb... string given above.
 *
 * ----------------------------------------------------------------------------
 *  COLLECTING INTO A FRESH SPREADSHEET
 *
 *  Where the entries are to be gathered in a new spreadsheet, leaving the
 *  older records undisturbed, follow this order. The deployment address stays
 *  as it is, so index.html needs no alteration.
 *
 *  1.  Open the existing project by either route given above and paste this
 *      file in, as at Installation below.
 *  2.  Choose createCollectionSheet in the function list and press Run.
 *      Grant the permissions it asks for. It makes a new spreadsheet at the
 *      top level of your Drive, lays out the headings, and prints the
 *      identifier in the Execution log panel below the editor.
 *  3.  Copy that identifier into SPREADSHEET_ID at the top of this file and
 *      save.
 *  4.  Run checkSetup and read the outcome. It should name the new
 *      spreadsheet and report that every heading is already present.
 *  5.  Deploy a new version of the same deployment, as at step 6 below.
 *
 *  Should you prefer to make the spreadsheet yourself, create it in Drive,
 *  put its identifier into SPREADSHEET_ID, and run prepareSheet instead of
 *  createCollectionSheet.
 *
 * ----------------------------------------------------------------------------
 *  INSTALLATION
 *
 *  1.  Open the project as described above.
 *  2.  Keep a copy of whatever is presently in the editor, in case you wish
 *      to go back to it.
 *  3.  Remove the existing contents of the editor and paste this file in.
 *  4.  Set SHEET_NAME to the exact name of the tab that holds the data, and
 *      SPREADSHEET_ID only if the project is not attached to a sheet.
 *  5.  Choose checkSetup in the function list and press Run. Grant the
 *      permissions it asks for. Read the outcome in the Execution log
 *      panel below the editor and put right anything it reports before
 *      going further. It writes nothing.
 *  6.  Deploy  >  Manage deployments  >  edit the existing deployment (pencil
 *      icon)  >  Version: New version  >  Deploy.
 *      Retain the same deployment so that the /exec address already written
 *      into index.html continues to work.
 *      Execute as: Me.        Who has access: Anyone.
 *  7.  Submit one test entry from the form and confirm that a fresh row
 *      appears carrying a code and a tick.
 *
 *  This script may be installed before the new form is put online. Entries
 *  arriving from the present form carry no code, and are recorded as before
 *  with the two new columns left empty.
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

/**
 * Leave this empty when the script is attached to the sheet, that is when it
 * was opened through Extensions > Apps Script from within the sheet itself.
 *
 * Fill it in only when the script stands on its own, separate from any sheet.
 * The value is the long identifier in the middle of the sheet's own address:
 *   https://docs.google.com/spreadsheets/d/THIS_PART_HERE/edit
 *
 * If you are unsure which of the two you have, leave it empty, run
 * checkSetup() from the editor, and it will tell you.
 */
var SPREADSHEET_ID = '';

/** Time zone used for the Timestamp column. */
var TIME_ZONE = 'Asia/Karachi';

/**
 * Columns held as plain text, so that Google Sheets records exactly what was
 * submitted. Without this a telephone number beginning with a zero loses it,
 * a time such as 17:45 is turned into a time value, and a date is rewritten
 * in whatever format the sheet happens to prefer.
 */
var TEXT_COLUMNS = [
  'Timestamp', 'Request Code', 'Phone', 'Reference Contact', 'PRO Contact',
  'Flight Number', 'Flight Date', 'Flight Time'
];

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

function getSpreadsheet() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'No sheet is attached to this script. Either open the script from ' +
      'within the sheet through Extensions > Apps Script, or put the ' +
      "sheet's identifier into SPREADSHEET_ID at the top of this file.");
  }
  return ss;
}

function getSheet() {
  var ss = getSpreadsheet();
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

/* ==========================================================================
 *  SETTING UP
 * ========================================================================== */

/**
 * Creates a brand new spreadsheet for collecting the entries, lays out its
 * headings and reports its identifier. Run this once from the editor, then
 * copy the identifier it prints into SPREADSHEET_ID at the top of this file.
 *
 * The new file is placed at the top level of your Google Drive under the name
 * given below. Nothing already recorded elsewhere is touched.
 */
function createCollectionSheet() {
  var ss = SpreadsheetApp.create('Passenger Facilitation Requests');
  var sheet = ss.getSheets()[0];
  sheet.setName(SHEET_NAME);
  layOutSheet(sheet);

  var out = [
    'A new spreadsheet has been created at the top level of your Drive.',
    '',
    'Name       : ' + ss.getName(),
    'Address    : ' + ss.getUrl(),
    'Identifier : ' + ss.getId(),
    '',
    'Now copy the identifier above into SPREADSHEET_ID at the top of this',
    'file, save, and run checkSetup to confirm.'
  ].join('\n');
  Logger.log(out);
  return out;
}

/**
 * Lays out the headings and formatting on a spreadsheet you have created
 * yourself. Point SPREADSHEET_ID at it first, then run this once.
 */
function prepareSheet() {
  var sheet = getSheet();
  if (sheet.getLastRow() > 1) {
    var warning = 'This tab already holds ' + (sheet.getLastRow() - 1) +
      ' row(s) of entries. Nothing has been changed. Use an empty tab.';
    Logger.log(warning);
    return warning;
  }
  layOutSheet(sheet);
  var out = 'Headings laid out on "' + sheet.getName() + '". Run checkSetup to confirm.';
  Logger.log(out);
  return out;
}

/** Writes the heading row and settles the formatting of a fresh tab. */
function layOutSheet(sheet) {
  ensureColumnCapacity(sheet, COLUMN_ORDER.length);
  sheet.getRange(1, 1, 1, COLUMN_ORDER.length).setValues([COLUMN_ORDER]);
  formatHeaderRow(sheet, COLUMN_ORDER.length);

  var rows = sheet.getMaxRows();
  for (var i = 0; i < TEXT_COLUMNS.length; i++) {
    var col = COLUMN_ORDER.indexOf(TEXT_COLUMNS[i]) + 1;
    if (col > 0) sheet.getRange(1, col, rows, 1).setNumberFormat('@');
  }

  var widths = {
    'Timestamp': 165, 'Request Code': 155, 'Code Verified': 95,
    'Email': 200, 'Department/Company': 200, 'Reference Person': 200,
    'Accompanying Details': 320, 'Comments': 320
  };
  for (var j = 0; j < COLUMN_ORDER.length; j++) {
    var w = widths[COLUMN_ORDER[j]] || 130;
    sheet.setColumnWidth(j + 1, w);
  }

  var verified = COLUMN_ORDER.indexOf('Code Verified') + 1;
  if (verified > 0) {
    sheet.getRange(1, verified, rows, 1).setHorizontalAlignment('center');
  }
}


/**
 * Run this from the editor, by choosing checkSetup in the function list and
 * pressing Run, before deploying anything. It writes nothing. It reports which
 * sheet the script can reach, which tab it will write to, and whether the two
 * new columns are in place. Read the outcome in the Execution log panel below the editor.
 */
function checkSetup() {
  var lines = [];
  try {
    var ss = getSpreadsheet();
    lines.push('Spreadsheet : ' + ss.getName());
    lines.push('Address     : ' + ss.getUrl());
    lines.push('Attached    : ' + (SPREADSHEET_ID ? 'no, reached by SPREADSHEET_ID'
                                                  : 'yes, this script belongs to the sheet'));

    var names = [];
    var tabs = ss.getSheets();
    for (var t = 0; t < tabs.length; t++) names.push(tabs[t].getName());
    lines.push('Tabs present: ' + names.join(', '));

    var sheet = getSheet();
    lines.push('Writing to  : ' + sheet.getName() +
               (sheet.getName() === SHEET_NAME ? '' : '   (SHEET_NAME says "' + SHEET_NAME + '", which was not found)'));
    lines.push('Rows in use : ' + sheet.getLastRow());

    var lastCol = sheet.getLastColumn();
    var headers = [];
    if (lastCol > 0) {
      var raw = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      for (var i = 0; i < raw.length; i++) headers.push(String(raw[i]).trim());
    }
    lines.push('Headings    : ' + (headers.length ? headers.join(' | ') : 'none, they will be written on the first entry'));

    var missing = [];
    for (var j = 0; j < COLUMN_ORDER.length; j++) {
      if (headers.length && headers.indexOf(COLUMN_ORDER[j]) === -1) missing.push(COLUMN_ORDER[j]);
    }
    lines.push('To be added : ' + (missing.length ? missing.join(' | ') : 'nothing, every heading is already present'));
    lines.push('Check char  : a specimen code verifies as ' + PFRVERIFY('PFR-260903-JPAH-B') + ' (a tick is expected)');
    lines.push('');
    lines.push('Setup looks sound. Deploy > Manage deployments > New version.');
  } catch (err) {
    lines.push('PROBLEM: ' + err.message);
  }
  var out = lines.join('\n');
  Logger.log(out);
  return out;
}


function reply(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
