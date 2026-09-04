/**
 * ============================================================================
 *  PASSENGER FACILITATION REQUEST FORM  —  GOOGLE SHEET RECEIVER
 *  Federal Investigation Agency
 *  Immigration & Anti-Human Smuggling Wing, Jinnah International Airport,
 *  Karachi.
 *
 *  Companion script for index.html, form version 1.4.
 * ============================================================================
 *
 *  WHAT VERSION 1.3 CHANGES
 *
 *  1.  The script now answers the form.
 *
 *      Until now the form spoke and this script listened. Nothing came back,
 *      so the applicant's browser had no way of knowing whether the entry had
 *      in fact been recorded. The script now returns its answer to the form,
 *      which waits for it before allowing the WhatsApp message to be composed.
 *
 *  2.  The register carries a serial number, and the code carries the same
 *      number.
 *
 *      Every entry is allotted a serial the moment it is recorded. The code
 *      issued for that entry contains the serial in the middle:
 *
 *              PFR-260904-0147-8T2
 *                     |     |    |
 *                     |     |    check group
 *                     |     serial number 147 in the register
 *                     date on which the entry was recorded
 *
 *      A message quoting code PFR-260904-0147-8T2 is therefore a message
 *      about serial 147, and the officer has only to look at serial 147 to
 *      see what was actually submitted.
 *
 *  3.  The code is issued here and no longer by the form.
 *
 *      In version 1.2 the code was worked out inside index.html, which anyone
 *      may read, so a code could be manufactured without the form ever being
 *      used. The code is now composed by this script alone, from a secret held
 *      in this project and written nowhere else. A code that this script did
 *      not issue is a code that does not appear in the register.
 *
 *  4.  Repeat submissions are turned away.
 *
 *      An entry bearing the same passenger, telephone number and flight as one
 *      already recorded within the last twelve hours is not entered a second
 *      time. The form is told that the request already stands and is given the
 *      earlier code, so the applicant may send that message instead of raising
 *      a fresh request.
 *
 *  5.  The address of the sender is recorded where the browser can supply it,
 *      and a limit is placed on the number of entries accepted from one
 *      address in an hour.
 *
 *  Entries arriving from an older copy of the form continue to be recorded.
 *  They carry no serial and their codes are checked against the older rule.
 *
 * ----------------------------------------------------------------------------
 *  HOW A WHATSAPP MESSAGE IS NOW VERIFIED
 *
 *  A message reaches the officer quoting a code. Three questions settle it.
 *
 *    Is the code in the register?
 *        Search the Request Code column. A code that is not there was never
 *        issued, and the message did not come from the form.
 *
 *    Does the serial in the code lead to the same particulars?
 *        The middle group of the code is the serial. Read that row. If the
 *        message says something the row does not, the message has been edited
 *        since it was submitted.
 *
 *    Does the check group hold?
 *        Enter  =PFRVERIFY("PFR-260904-0147-8T2")  in any spare cell. A tick
 *        means this script issued the code. A cross means it did not.
 *
 *  Where NOTIFY_EMAIL is filled in, the officer also receives a notice at the
 *  moment of recording, composed by this script on your own Google account.
 *  No applicant can bring such a notice into being and none can alter one
 *  after it has arrived.
 *
 *  It should be understood that this establishes that a request passed through
 *  the form. It cannot establish that the particulars given were truthful,
 *  which no arrangement of this kind can.
 *
 * ----------------------------------------------------------------------------
 *  THE SECRET
 *
 *  On first use the script makes a secret of its own and keeps it in this
 *  project under the name PFR_SALT. It is never sent to the browser and never
 *  appears in the register. The check group of every code is derived from it.
 *
 *  Should that property ever be deleted, a fresh secret is made and codes
 *  issued earlier will no longer verify. The codes themselves remain in the
 *  register and the register remains the record, but PFRVERIFY will report a
 *  cross against them. Do not delete it.
 *
 *  Project Settings, in the left hand panel of the editor, is where the script
 *  properties may be seen.
 *
 * ----------------------------------------------------------------------------
 *  FINDING THE EXISTING PROJECT
 *
 *  The form sends its entries to this deployment:
 *    AKfycbyCnSw9AP-ZJSXUYHiTLrYuVWEk8QOV2nm40TL5zJpMjbBKuDrvuiPg1s0yMxKcz4Ua
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
 *  INSTALLATION
 *
 *  1.  Open the project as described above.
 *  2.  Keep a copy of whatever is presently in the editor, in case you wish
 *      to go back to it.
 *  3.  Remove the existing contents of the editor and paste this file in.
 *  4.  Set SHEET_NAME to the exact name of the tab that holds the data, and
 *      SPREADSHEET_ID only if the project is not attached to a sheet.
 *      Put the officer's address into NOTIFY_EMAIL.
 *  5.  Choose checkSetup in the function list and press Run. Grant the
 *      permissions it asks for. Read the outcome in the Execution log panel
 *      below the editor and put right anything it reports before going on.
 *      It writes nothing to the register.
 *  6.  Put the script into service.
 *
 *      Already deployed, which is the case for the project the form presently
 *      reaches:
 *        Deploy  >  Manage deployments  >  the pencil icon  >
 *        Version: New version  >  Deploy.
 *        Edit the existing deployment rather than making another, so that the
 *        address already written into index.html goes on working.
 *
 *      Never deployed, as with a project newly made at script.google.com:
 *        Deploy  >  New deployment  >  the gear icon  >  Web app.
 *        Execute as: Me.      Who has access: Anyone.
 *        This yields a fresh address ending in /exec, which must then be
 *        written into GOOGLE_SCRIPT_URL in index.html.
 *
 *      Take care to choose Anyone and not "Anyone with Google account". The
 *      form submits without signing in, so the stricter setting would turn
 *      every submission away.
 *
 *  7.  IMPORTANT. This version must be deployed before the new index.html is
 *      put online, and not after. The new form waits for an answer from the
 *      script, and only this version answers.
 *
 *  8.  Submit one test entry from the form and confirm that a fresh row
 *      appears carrying a serial, a code and a tick, and that the code shown
 *      on the screen is the same code as in the row.
 *
 * ----------------------------------------------------------------------------
 *  COLLECTING INTO A FRESH SPREADSHEET
 *
 *  Where the entries are to be gathered in a new spreadsheet, leaving the
 *  older records undisturbed, follow this order. The deployment address stays
 *  as it is, so index.html needs no alteration.
 *
 *  1.  Open the existing project and paste this file in, as above.
 *  2.  Choose createCollectionSheet in the function list and press Run. It
 *      makes a new spreadsheet at the top level of your Drive, lays out the
 *      headings, and prints the identifier in the Execution log panel.
 *  3.  Copy that identifier into SPREADSHEET_ID at the top of this file and
 *      save.
 *  4.  Run resetSerialCounter so that the new register begins at serial 1.
 *  5.  Run checkSetup and read the outcome.
 *  6.  Put it into service, as at step 6 above.
 *
 * ----------------------------------------------------------------------------
 *  A NOTE ON AN EXISTING SHEET
 *
 *  Nothing already recorded is disturbed. On each submission the script reads
 *  the header row, adds any of the headings listed in COLUMN_ORDER that are
 *  not already present, and writes each value beneath its own heading. The
 *  three headings new to this version, Serial, IP Address and Submission ID,
 *  are added at the end of the existing headings rather than in the position
 *  shown below, which is the position used only when a fresh tab is laid out.
 *
 *  The first serial allotted on an existing sheet continues from the number of
 *  rows already present, so that serial and row remain in step.
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

/** Time zone used for the Timestamp column and for the date part of a code. */
var TIME_ZONE = 'Asia/Karachi';

/**
 * Address to be notified the moment an entry is recorded. Ordinarily the
 * officer who receives the WhatsApp messages. Several addresses may be given,
 * separated by commas. Leave it empty to send no notices at all.
 */
var NOTIFY_EMAIL = '';

/** Name the notice is shown as coming from. */
var NOTIFY_SENDER_NAME = 'Passenger Facilitation Request Form';

/**
 * A request bearing the same passenger, telephone number and flight as one
 * already recorded within this many hours is treated as the same request and
 * is not entered again. Set it to 0 to accept every submission.
 */
var DUPLICATE_WINDOW_HOURS = 12;

/**
 * Greatest number of entries accepted in one hour from a single address.
 * Set it to 0 to place no limit.
 *
 * The address is supplied by the browser and may therefore be withheld or
 * altered by a determined person. It is a restraint on repeated submission
 * and not a means of identification. The particulars check above is the one
 * that cannot be evaded from the browser.
 */
var IP_LIMIT_PER_HOUR = 5;

/**
 * Number of rows at the foot of the register examined when looking for a
 * repeat. Raising it slows every submission a little; lowering it allows a
 * repeat to slip through on a very busy day.
 */
var ROWS_EXAMINED = 600;

/**
 * Columns held as plain text, so that Google Sheets records exactly what was
 * submitted. Without this a telephone number beginning with a zero loses it,
 * a time such as 17:45 is turned into a time value, and a date is rewritten
 * in whatever format the sheet happens to prefer.
 */
var TEXT_COLUMNS = [
  'Timestamp', 'Request Code', 'Phone', 'Reference Contact', 'PRO Contact',
  'Flight Number', 'Flight Date', 'Flight Time', 'IP Address', 'Submission ID'
];

/** Column headings, in the order in which a fresh tab is laid out. */
var COLUMN_ORDER = [
  'Serial',
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
  'Type',
  'Reference Person',
  'Reference Contact',
  'PRO Name',
  'PRO Contact',
  'PRO Designation',
  'PRO Department',
  'Accompanying Count',
  'Accompanying Details',
  'Comments',
  'IP Address',
  'Submission ID'
];

/** Names of the script properties this file keeps. */
var PROP_SALT   = 'PFR_SALT';
var PROP_SERIAL = 'PFR_LAST_SERIAL';
var PROP_SHEET  = 'PFR_SPREADSHEET_ID';


/* ==========================================================================
 *  REQUEST CODE
 *
 *  Shape issued by this version:   PFR-26I1-05-0002-K7M
 *
 *      26     the year
 *      I      the month as a letter, A for January through to L for December
 *      1      the week of that month, the first seven days being week 1
 *      05     the day of the month
 *      0002   the serial number of the entry in the register
 *      K7M    check group, derived from everything before it together with
 *             the secret held in this project
 *
 *  So PFR-26I1-05-0002-K7M reads as the second entry in the register, made on
 *  5 September 2026, in the first week of that month.
 *
 *  This lets a message be judged at a glance. A message that reaches you today
 *  should carry today's date inside its code. One that does not was either
 *  submitted earlier and edited since, or never submitted at all. The check
 *  group settles it either way, since only this script can compose one.
 *
 *  Two earlier shapes are still recognised, so that rows already recorded go
 *  on verifying:
 *      version 1.3                 PFR-260904-0147-8T2
 *      version 1.2                 PFR-250903-K7M4-N
 * ========================================================================== */

/** Alphabet of the check group. 0, 1, I, L, O and U are left out so that a
 *  code read off a message cannot be misread. */
var CODE_CHARS = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

/** The month as a letter, A for January through to L for December. */
var MONTH_LETTERS = 'ABCDEFGHIJKL';

/** Codes issued by this version. */
var CODE_PATTERN =
  /^PFR-(\d{2}[A-L][1-5])-(\d{2})-(\d{4,})-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{3})$/;

/** Codes issued by version 1.3. */
var V13_PATTERN =
  /^PFR-(\d{6})-(\d{4,})-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{3})$/;

/** Codes issued by version 1.2. */
var LEGACY_PATTERN =
  /^PFR-(\d{6})-([23456789ABCDEFGHJKMNPQRSTVWXYZ]{4})-([23456789ABCDEFGHJKMNPQRSTVWXYZ])$/;

/** Position weights used by version 1.2. Retained only so that codes issued
 *  by that version continue to verify. */
var LEGACY_WEIGHTS = [1, 17, 13, 11, 7, 23, 19, 17, 1, 29];

/**
 * The secret from which every check group is derived. It is made on first use
 * and kept in this project alone. See THE SECRET in the notes above.
 */
function getSalt() {
  var props = PropertiesService.getScriptProperties();
  var salt = props.getProperty(PROP_SALT);
  if (!salt) {
    salt = Utilities.getUuid() + '.' + Utilities.getUuid();
    props.setProperty(PROP_SALT, salt);
  }
  return salt;
}

/** Serial padded to four figures, and left longer once it outgrows four. */
function padSerial(n) {
  var s = String(n);
  while (s.length < 4) s = '0' + s;
  return s;
}

/**
 * The three character check group. Twenty seven thousand groups are possible,
 * so a code invented by hand is all but certain to fail PFRVERIFY.
 */
function codeCheckGroup(datePart, serialPart) {
  var raw = Utilities.computeHmacSha256Signature(datePart + ':' + serialPart, getSalt());
  var out = '';
  for (var i = 0; i < 3; i++) {
    var hi = (raw[2 * i] + 256) % 256;
    var lo = (raw[2 * i + 1] + 256) % 256;
    out += CODE_CHARS.charAt((hi * 256 + lo) % CODE_CHARS.length);
  }
  return out;
}

/**
 * The parts of a code for a given moment and serial. The week is taken as the
 * first seven days of the month, then the next seven, and so on, so that it
 * may be worked out from the day alone without reference to any calendar.
 */
function codeParts(when, serial) {
  var day = parseInt(Utilities.formatDate(when, TIME_ZONE, 'dd'), 10);
  var month = parseInt(Utilities.formatDate(when, TIME_ZONE, 'MM'), 10);
  return {
    head   : Utilities.formatDate(when, TIME_ZONE, 'yy') +
             MONTH_LETTERS.charAt(month - 1) +
             Math.ceil(day / 7),
    day    : Utilities.formatDate(when, TIME_ZONE, 'dd'),
    serial : padSerial(serial)
  };
}

/** Composes the code for a given moment and serial. */
function mintCode(when, serial) {
  var p = codeParts(when, serial);
  return 'PFR-' + p.head + '-' + p.day + '-' + p.serial + '-' +
         codeCheckGroup(p.head + p.day, p.serial);
}

/** The check character used by version 1.2, kept for older rows alone. */
function legacyCheckChar(datePart, randomPart) {
  var sum = 0, i;
  for (i = 0; i < datePart.length; i++) {
    sum += (datePart.charCodeAt(i) - 48) * LEGACY_WEIGHTS[i];
  }
  for (i = 0; i < randomPart.length; i++) {
    sum += CODE_CHARS.indexOf(randomPart.charAt(i)) * LEGACY_WEIGHTS[datePart.length + i];
  }
  return CODE_CHARS.charAt(sum % CODE_CHARS.length);
}

/** True when the code is well formed and its check group or check character
 *  agrees. Codes of any of the three versions are accepted. */
function isCodeValid(code) {
  var text = String(code == null ? '' : code).trim().toUpperCase();

  var m = CODE_PATTERN.exec(text);
  if (m) return codeCheckGroup(m[1] + m[2], m[3]) === m[4];

  var older = V13_PATTERN.exec(text);
  if (older) return codeCheckGroup(older[1], older[2]) === older[3];

  var legacy = LEGACY_PATTERN.exec(text);
  if (legacy) return legacyCheckChar(legacy[1], legacy[2]) === legacy[3];

  return false;
}

/** The serial named by a code, or an empty string where the code carries none. */
function serialFromCode(code) {
  var text = String(code == null ? '' : code).trim().toUpperCase();

  var m = CODE_PATTERN.exec(text);
  if (m) return String(parseInt(m[3], 10));

  var older = V13_PATTERN.exec(text);
  if (older) return String(parseInt(older[2], 10));

  return '';
}

/** The date a code names, written out, or an empty string where it names none. */
function dateFromCode(code) {
  var text = String(code == null ? '' : code).trim().toUpperCase();
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  var m = CODE_PATTERN.exec(text);
  if (m) {
    var head = m[1];
    return m[2] + ' ' + months[MONTH_LETTERS.indexOf(head.charAt(2))] +
           ' 20' + head.substring(0, 2) + ', week ' + head.charAt(3);
  }

  var older = V13_PATTERN.exec(text);
  if (older) {
    return older[1].substring(4, 6) + ' ' +
           months[parseInt(older[1].substring(2, 4), 10) - 1] +
           ' 20' + older[1].substring(0, 2);
  }

  return '';
}

/**
 * Custom sheet function, for checking a code taken off a WhatsApp message.
 * Enter  =PFRVERIFY("PFR-260904-0147-8T2")  in any spare cell.
 */
function PFRVERIFY(code) {
  return isCodeValid(code) ? '✔' : '✘';
}

/**
 * Custom sheet function returning the serial named by a code, so that the row
 * may be found at once. Enter  =PFRSERIAL("PFR-260904-0147-8T2").
 */
function PFRSERIAL(code) {
  return serialFromCode(code) || '';
}

/**
 * Custom sheet function returning the date a code names, written out, so that
 * a message may be checked against the day it arrived without decoding
 * anything by hand. Enter  =PFRDATE("PFR-26I1-05-0002-K7M").
 */
function PFRDATE(code) {
  return dateFromCode(code) || '';
}


/* ==========================================================================
 *  WEB APP ENTRY POINTS
 *
 *  The form reaches this script in one of three ways, in this order of
 *  preference:
 *
 *    a.  a script element carrying a callback name, which is how the form
 *        reads the answer without the browser's cross origin rules standing
 *        in the way;
 *    b.  a POST carrying the values as plain text, used where the values are
 *        too long for a query string;
 *    c.  navigator.sendBeacon, which records the entry but reads no answer.
 *        This is used only where the first two have failed.
 *
 *  All three are served by one routine.
 * ========================================================================== */

function doGet(e)  { return handleSubmission(e); }
function doPost(e) { return handleSubmission(e); }

function handleSubmission(e) {
  var params   = readParams(e);
  var callback = jsonpCallback(params);

  // The web app address opened in a browser carries no values. Report the
  // service instead of recording an empty row.
  if (!params.firstName && !params.submissionId) {
    return reply({
      ok: true,
      service: 'Passenger Facilitation Request receiver',
      version: '1.4'
    }, callback);
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return reply({
      ok: false,
      error: 'The register was busy. Please submit again in a moment.'
    }, callback);
  }

  try {
    var sheet   = getSheet();
    var headers = ensureHeaders(sheet);
    var recent  = recentRows(sheet, headers, ROWS_EXAMINED);
    var now     = new Date();

    // The same submission arriving twice, which happens when the form retries
    // after a slow answer. The earlier entry is returned rather than a new one
    // being made, so a retry can never double the register.
    var submissionId = String(params.submissionId || '').trim();
    if (submissionId) {
      var already = findBySubmissionId(recent, submissionId);
      if (already) return reply(existingEntryReply(already, 'same-submission'), callback);
    }

    var values = buildValues(params);

    // A fresh request bearing particulars already recorded within the window.
    var repeat = findRecentDuplicate(recent, values, now);
    if (repeat) return reply(existingEntryReply(repeat, 'same-details'), callback);

    // Too many entries from one address within the hour.
    var address = values['IP Address'];
    if (address && IP_LIMIT_PER_HOUR > 0 &&
        countFromAddress(recent, address, now) >= IP_LIMIT_PER_HOUR) {
      return reply({
        ok: false,
        throttled: true,
        error: 'Several requests have already been received from this ' +
               'connection within the hour. Please try again later, or ' +
               'telephone the facilitation desk.'
      }, callback);
    }

    // Serial, code and the row itself.
    var serial = nextSerial(sheet, headers);
    var code   = mintCode(now, serial);

    values['Serial']        = serial;
    values['Request Code']  = code;
    values['Code Verified'] = isCodeValid(code) ? '✔' : '✘';

    var row = [];
    for (var i = 0; i < headers.length; i++) {
      row.push(Object.prototype.hasOwnProperty.call(values, headers[i]) ? values[headers[i]] : '');
    }
    sheet.appendRow(row);

    // The notice goes out only for an entry actually recorded. A failure to
    // send is never allowed to fail the submission itself.
    var notified = false;
    try {
      notified = sendNotice(values, sheet);
    } catch (mailErr) {
      Logger.log('Notice not sent: ' + mailErr);
    }

    return reply({
      ok: true,
      recorded: true,
      serial: serial,
      code: code,
      verified: values['Code Verified'],
      recordedAt: values['Timestamp'],
      notified: notified
    }, callback);

  } catch (err) {
    return reply({ ok: false, error: String(err && err.message ? err.message : err) }, callback);
  } finally {
    try { lock.releaseLock(); } catch (ignored) {}
  }
}

/** Values sent in the query string, and those sent as a plain text body. */
function readParams(e) {
  var params = {}, key;
  if (e && e.parameter) {
    for (key in e.parameter) {
      if (Object.prototype.hasOwnProperty.call(e.parameter, key)) params[key] = e.parameter[key];
    }
  }
  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      if (body && typeof body === 'object') {
        for (key in body) {
          if (Object.prototype.hasOwnProperty.call(body, key)) params[key] = body[key];
        }
      }
    } catch (ignored) {}
  }
  return params;
}

/**
 * The callback name the form asks the answer to be wrapped in. Only plain
 * names are accepted, so that nothing of the caller's choosing can be written
 * into the reply.
 */
function jsonpCallback(params) {
  var name = String(params.callback || '').trim();
  return /^[A-Za-z0-9_$]{1,64}$/.test(name) ? name : '';
}

/** The answer, wrapped in the callback where one was asked for. */
function reply(payload, callback) {
  var json = JSON.stringify(payload);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

/** The answer returned when an entry already stands for this request. */
function existingEntryReply(rowValues, reason) {
  return {
    ok: true,
    duplicate: true,
    reason: reason,
    serial: rowValues['Serial'] === '' || rowValues['Serial'] === undefined
              ? '' : rowValues['Serial'],
    code: String(rowValues['Request Code'] || ''),
    recordedAt: String(rowValues['Timestamp'] || ''),
    error: 'This request has already been recorded.'
  };
}


/* ==========================================================================
 *  SERIAL NUMBERS
 * ========================================================================== */

/**
 * Allots the next serial. The last number issued is kept in this project, so
 * that a serial is never reused even where rows have since been deleted from
 * the register. Where the number has not yet been kept, it is taken from the
 * register itself, so that an existing sheet carries on from where it stood.
 *
 * This is called under the script lock and is therefore safe against two
 * submissions arriving at the same instant.
 */
function nextSerial(sheet, headers) {
  var props = PropertiesService.getScriptProperties();
  var last  = parseInt(props.getProperty(PROP_SERIAL), 10);
  if (!(last > 0)) last = highestSerialOnRecord(sheet, headers);
  var next = last + 1;
  props.setProperty(PROP_SERIAL, String(next));
  return next;
}

/** The greatest serial in the register, or the number of rows where the
 *  register predates this version and carries no serials. */
function highestSerialOnRecord(sheet, headers) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  var entries = lastRow - 1;
  var col = headers.indexOf('Serial') + 1;
  if (col < 1) return entries;

  var values = sheet.getRange(2, col, entries, 1).getValues();
  var highest = 0;
  for (var i = 0; i < values.length; i++) {
    var n = parseInt(values[i][0], 10);
    if (n > highest) highest = n;
  }
  return highest > entries ? highest : entries;
}


/* ==========================================================================
 *  SHEET HANDLING
 * ========================================================================== */

/**
 * The identifier of the register, and where it came from.
 *
 * Whatever is put into SPREADSHEET_ID is also written into this project's own
 * settings the first time it is used. Should a later version of this file ever
 * be pasted in with that setting left blank, the remembered identifier is used
 * and the script is not cut off from the register. To move the register
 * elsewhere, put the new identifier into SPREADSHEET_ID and run checkSetup
 * once; the remembered one is replaced.
 */
function registerId() {
  var props = PropertiesService.getScriptProperties();
  if (SPREADSHEET_ID) {
    if (props.getProperty(PROP_SHEET) !== SPREADSHEET_ID) {
      props.setProperty(PROP_SHEET, SPREADSHEET_ID);
    }
    return SPREADSHEET_ID;
  }
  return props.getProperty(PROP_SHEET) || '';
}

function getSpreadsheet() {
  var id = registerId();
  if (id) return SpreadsheetApp.openById(id);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) {
    throw new Error(
      'No sheet is attached to this script and none is remembered. Either ' +
      'open the script from within the sheet through Extensions > Apps ' +
      "Script, or put the sheet's identifier into SPREADSHEET_ID at the top " +
      'of this file and run checkSetup once.');
  }
  return ss;
}

/**
 * Clears the remembered identifier. Run this only when the script is to go
 * back to writing to a sheet it is attached to. Nothing recorded is touched.
 */
function forgetRegister() {
  PropertiesService.getScriptProperties().deleteProperty(PROP_SHEET);
  var out = 'The remembered register identifier has been cleared.';
  Logger.log(out);
  return out;
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
 * The last few rows of the register, each returned as an object keyed by
 * heading. Reading them once in a single call keeps a submission quick, and
 * every check below works from this one reading.
 */
function recentRows(sheet, headers, limit) {
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var entries = lastRow - 1;
  var count   = entries < limit ? entries : limit;
  var start   = lastRow - count + 1;
  var values  = sheet.getRange(start, 1, count, headers.length).getValues();

  var rows = [];
  for (var i = 0; i < values.length; i++) {
    var record = {};
    for (var h = 0; h < headers.length; h++) record[headers[h]] = values[i][h];
    rows.push(record);
  }
  return rows;
}


/* ==========================================================================
 *  REPEAT SUBMISSIONS
 * ========================================================================== */

/** The row bearing this submission identifier, if the register holds one. */
function findBySubmissionId(rows, submissionId) {
  var wanted = String(submissionId).trim().toUpperCase();
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i]['Submission ID'] || '').trim().toUpperCase() === wanted) return rows[i];
  }
  return null;
}

/**
 * The most recent row bearing the same passenger, telephone number and flight
 * as the submission in hand, where that row was recorded within the window.
 */
function findRecentDuplicate(rows, values, now) {
  if (!(DUPLICATE_WINDOW_HOURS > 0)) return null;

  var wanted = identitySignature(values);
  if (wanted.replace(/\|/g, '') === '') return null;

  var window = DUPLICATE_WINDOW_HOURS * 3600000;
  for (var i = rows.length - 1; i >= 0; i--) {
    if (identitySignature(rows[i]) !== wanted) continue;
    var when = parseStamp(rows[i]['Timestamp']);
    if (!when) continue;
    if (now.getTime() - when.getTime() <= window) return rows[i];
  }
  return null;
}

/** How many entries were accepted from this address within the last hour. */
function countFromAddress(rows, address, now) {
  var wanted = String(address).trim();
  if (!wanted) return 0;

  var count = 0;
  for (var i = rows.length - 1; i >= 0; i--) {
    if (String(rows[i]['IP Address'] || '').trim() !== wanted) continue;
    var when = parseStamp(rows[i]['Timestamp']);
    if (!when) continue;
    if (now.getTime() - when.getTime() <= 3600000) count++;
  }
  return count;
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

/** Reads back a Timestamp written by this script. Anything that cannot be
 *  read is left out of the window checks rather than guessed at. */
function parseStamp(v) {
  if (v instanceof Date) return v;
  var s = String(v === undefined || v === null ? '' : v).trim();
  if (!s) return null;
  try {
    var d = Utilities.parseDate(s, TIME_ZONE, 'dd-MMM-yyyy HH:mm:ss');
    return (d && !isNaN(d.getTime())) ? d : null;
  } catch (err) {
    return null;
  }
}


/* ==========================================================================
 *  NOTICE OF A RECORDED ENTRY
 * ========================================================================== */

/**
 * Sends the officer the particulars exactly as they were recorded. Returns
 * true when a notice went out, false when no address is set.
 */
function sendNotice(values, sheet) {
  if (!NOTIFY_EMAIL) return false;

  var code = values['Request Code'] || '(no code)';
  var name = ((values['First Name'] || '') + ' ' + (values['Last Name'] || '')).trim() || '(no name)';
  var subject = 'Sr. ' + (values['Serial'] || '?') + '  |  ' + code + '  |  ' + name + '  |  ' +
                (values['Flight Number'] || '') + ', ' + (values['Flight Date'] || '') +
                ' (' + (values['Arrival/Departure'] || '') + ')';

  var preamble = [
    'This notice was composed by the request form itself at the moment the',
    'entry below was recorded. It is the record of what was submitted.',
    '',
    'A WhatsApp message bearing the same code should say the same thing.',
    'Where it says something different, it has been edited after submission.',
    'Where no notice bearing the code exists, the form was never used at all.'
  ];

  var plain = preamble.slice();
  plain.push('');
  plain.push('----------------------------------------------------------');
  plain.push('');
  for (var i = 0; i < COLUMN_ORDER.length; i++) {
    var heading = COLUMN_ORDER[i];
    if (heading === 'Code Verified' || heading === 'Submission ID') continue;
    var v = values[heading];
    if (isBlankForNotice(heading, v)) continue;
    plain.push(pad(heading, 22) + ' : ' + v);
  }
  plain.push('');
  plain.push('----------------------------------------------------------');
  plain.push('');
  plain.push('Sheet: ' + sheet.getParent().getUrl());

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: plain.join('\n'),
    htmlBody: noticeHtml(values, preamble, sheet),
    name: NOTIFY_SENDER_NAME
  });
  return true;
}

/**
 * True when a heading should be left out of the notice, so that it mirrors
 * the WhatsApp message and the two may be compared line for line.
 */
function isBlankForNotice(heading, v) {
  if (v === undefined || v === null || String(v).trim() === '') return true;
  if (heading === 'Accompanying Count' && String(v).trim() === '0') return true;
  return false;
}

/** Right pads a heading so that the plain text notice lines up. */
function pad(text, width) {
  var s = String(text);
  while (s.length < width) s += ' ';
  return s;
}

function escapeHtml(s) {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/\n/g, '<br>');
}

function noticeHtml(values, preamble, sheet) {
  var h = [];
  h.push('<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1a2332;max-width:620px">');
  h.push('<p style="margin:0 0 14px;color:#4a5a6e;line-height:1.6">' +
         escapeHtml(preamble.join('\n')) + '</p>');
  h.push('<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">');
  for (var i = 0; i < COLUMN_ORDER.length; i++) {
    var heading = COLUMN_ORDER[i];
    if (heading === 'Code Verified' || heading === 'Submission ID') continue;
    var v = values[heading];
    if (isBlankForNotice(heading, v)) continue;
    var emphasis = (heading === 'Request Code' || heading === 'Serial') ? 'font-weight:bold;' : '';
    h.push('<tr>' +
      '<td style="padding:6px 12px 6px 0;border-bottom:1px solid #e8ecf1;color:#6b7c8f;white-space:nowrap;vertical-align:top">' +
        escapeHtml(heading) + '</td>' +
      '<td style="padding:6px 0;border-bottom:1px solid #e8ecf1;' + emphasis + '">' +
        escapeHtml(v) + '</td></tr>');
  }
  h.push('</table>');
  h.push('<p style="margin:16px 0 0"><a href="' + escapeHtml(sheet.getParent().getUrl()) +
         '" style="color:#145a3e">Open the register</a></p>');
  h.push('</div>');
  return h.join('');
}


/* ==========================================================================
 *  VALUES
 * ========================================================================== */

function buildValues(params) {
  function get(name) {
    var v = params[name];
    return (v === undefined || v === null) ? '' : String(v).trim();
  }

  return {
    'Timestamp'            : Utilities.formatDate(new Date(), TIME_ZONE, 'dd-MMM-yyyy HH:mm:ss'),
    'Serial'               : '',
    'Request Code'         : '',
    'Code Verified'        : '',
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
    'Type'                 : get('requestType'),
    'Reference Person'     : get('referencePerson'),
    'Reference Contact'    : get('referenceContact'),
    'PRO Name'             : get('proName'),
    'PRO Contact'          : get('proContact'),
    'PRO Designation'      : get('proDesignation'),
    'PRO Department'       : get('proDepartment'),
    'Accompanying Count'   : get('accompanyingCount'),
    'Accompanying Details' : get('accompanyingDetails'),
    'Comments'             : get('comments'),
    'IP Address'           : get('clientIp'),
    'Submission ID'        : get('submissionId')
  };
}


/* ==========================================================================
 *  SETTING UP AND CHECKING
 * ========================================================================== */

/**
 * Creates a brand new spreadsheet for collecting the entries, lays out its
 * headings and reports its identifier. Run this once from the editor, then
 * copy the identifier it prints into SPREADSHEET_ID at the top of this file.
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
    'file, save, run resetSerialCounter so that the register begins at one,',
    'and then run checkSetup to confirm.'
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
    'Serial': 70, 'Timestamp': 165, 'Request Code': 175, 'Code Verified': 95,
    'Email': 200, 'Department/Company': 200, 'Reference Person': 200,
    'Accompanying Details': 320, 'Comments': 320,
    'IP Address': 130, 'Submission ID': 160
  };
  for (var j = 0; j < COLUMN_ORDER.length; j++) {
    sheet.setColumnWidth(j + 1, widths[COLUMN_ORDER[j]] || 130);
  }

  var centred = ['Serial', 'Code Verified'];
  for (var c = 0; c < centred.length; c++) {
    var col = COLUMN_ORDER.indexOf(centred[c]) + 1;
    if (col > 0) sheet.getRange(1, col, rows, 1).setHorizontalAlignment('center');
  }
}

/**
 * Sets the serial counter back so that the next entry recorded takes serial
 * one. Run this only on a register that is to begin afresh. It changes nothing
 * already recorded.
 */
function resetSerialCounter() {
  PropertiesService.getScriptProperties().deleteProperty(PROP_SERIAL);
  var sheet = getSheet();
  var headers = ensureHeaders(sheet);
  var out = 'The serial counter has been cleared. The next entry will take serial ' +
            (highestSerialOnRecord(sheet, headers) + 1) + '.';
  Logger.log(out);
  return out;
}

/**
 * Sends one specimen notice to NOTIFY_EMAIL so that you may see what the
 * officer will receive. Nothing is written to the register.
 */
function sendTestNotice() {
  if (!NOTIFY_EMAIL) {
    var none = 'NOTIFY_EMAIL is empty. Put the officer\'s address in it, save, and run this again.';
    Logger.log(none);
    return none;
  }
  var specimen = buildValues({
    firstName: 'SPECIMEN', lastName: 'ENTRY', paxAge: '41',
    email: 'specimen@example.com', phone: '+92 300 0000000',
    paxDesignation: 'Assistant Director', paxDepartment: 'FIA, JIAP, Karachi',
    flightNumber: 'PK-308', airlineName: 'PIA',
    flightDate: '15 Oct 2026', flightTime: '17:45', travel: 'Departure',
    requestType: 'Official/Government',
    referencePerson: 'Self', referenceContact: '+92 21 00000000',
    accompanyingCount: '0',
    comments: 'This is a specimen notice. No entry has been recorded.'
  });
  specimen['Serial'] = 147;
  specimen['Request Code'] = mintCode(new Date(), 147);
  specimen['Code Verified'] = '✔';

  sendNotice(specimen, getSheet());
  var out = 'A specimen notice has been sent to ' + NOTIFY_EMAIL +
            '. Nothing was written to the register.';
  Logger.log(out);
  return out;
}

/**
 * Run this from the editor, by choosing checkSetup in the function list and
 * pressing Run, before deploying anything. It writes nothing to the register.
 * Read the outcome in the Execution log panel below the editor.
 */
function checkSetup() {
  var lines = [];
  try {
    var ss = getSpreadsheet();
    lines.push('Spreadsheet : ' + ss.getName());
    lines.push('Address     : ' + ss.getUrl());
    lines.push('Attached    : ' + (SPREADSHEET_ID
      ? 'no, reached by SPREADSHEET_ID, now also remembered in this project'
      : (PropertiesService.getScriptProperties().getProperty(PROP_SHEET)
          ? 'no, reached by the identifier remembered in this project'
          : 'yes, this script belongs to the sheet')));

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

    var props = PropertiesService.getScriptProperties();
    var madeEarlier = !!props.getProperty(PROP_SALT);

    var kept = parseInt(props.getProperty(PROP_SERIAL), 10);
    var nextUp = (kept > 0) ? kept + 1
                            : highestSerialOnRecord(sheet, headers.length ? headers : COLUMN_ORDER) + 1;

    // Composing the specimen is what brings the secret into being on a fresh
    // project, so it is composed before the secret is reported on.
    var specimen = mintCode(new Date(), nextUp);

    lines.push('Secret      : ' + (madeEarlier ? 'in place, made earlier'
                                               : 'made just now, and kept in this project'));
    lines.push('Next serial : ' + nextUp);
    lines.push('Specimen    : ' + specimen + '  verifies as ' + PFRVERIFY(specimen) +
               ' (a tick is expected)');
    lines.push('  reads as  : ' + PFRDATE(specimen) + ', serial ' + PFRSERIAL(specimen));

    var v13 = 'PFR-260904-0147-' + codeCheckGroup('260904', '0147');
    lines.push('Version 1.3 : ' + v13 + ' verifies as ' + PFRVERIFY(v13) +
               ' (a tick is expected, those codes are still recognised)');
    var v12 = 'PFR-250903-K7M4-' + legacyCheckChar('250903', 'K7M4');
    lines.push('Version 1.2 : ' + v12 + ' verifies as ' + PFRVERIFY(v12) +
               ' (a tick is expected, those codes are still recognised)');

    lines.push('Repeats     : the same passenger, telephone number and flight are refused ' +
               (DUPLICATE_WINDOW_HOURS > 0 ? 'within ' + DUPLICATE_WINDOW_HOURS + ' hours'
                                           : 'never, DUPLICATE_WINDOW_HOURS is 0'));
    lines.push('Per address : ' + (IP_LIMIT_PER_HOUR > 0
                 ? IP_LIMIT_PER_HOUR + ' entries an hour at most'
                 : 'no limit, IP_LIMIT_PER_HOUR is 0'));
    lines.push('Notices to  : ' + (NOTIFY_EMAIL ||
      'nobody, NOTIFY_EMAIL is empty, so no notice of a recorded entry will be sent'));
    if (NOTIFY_EMAIL) {
      lines.push('Quota left  : ' + MailApp.getRemainingDailyQuota() + ' notices today');
    }
    lines.push('');
    lines.push('Setup looks sound. Now put it into service:');
    lines.push('  already deployed : Deploy > Manage deployments > pencil >');
    lines.push('                     Version New version, which keeps the same address.');
    lines.push('  first time       : Deploy > New deployment > Web app,');
    lines.push('                     Execute as Me, Who has access Anyone.');
    lines.push('');
    lines.push('Deploy this version before the new index.html is put online.');
    lines.push('The new form waits for an answer, and only this version answers.');
  } catch (err) {
    lines.push('PROBLEM: ' + err.message);
  }
  var out = lines.join('\n');
  Logger.log(out);
  return out;
}
