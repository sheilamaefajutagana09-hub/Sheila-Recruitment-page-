// Recruitment inquiry form -> styled email notifications (+ optional Google Sheet log)
const CFG = {
  OWNER_EMAIL: 'sheilamaefajutagana09@gmail.com',
  SHEET_ID: '',          // leave blank: run setupSheet() once and it creates the Google Sheet for you
  FOLDER_ID: '13LOsOWV_Xh-t8mIVcuDWXTu9pQV9loxD', // Google Drive folder with the pictures
  PHONE_DISPLAY: '0991 885 9370',
  // Optional: paste a Drive file ID here if a picture is not found by name (the long code in the file's share link)
  EMAIL_FILE_IDS: { banner: '', avatar: '' },
  // Welcome-email banner, loaded straight from this Google Drive file (must be shared as "Anyone with the link")
  BANNER_URL: 'https://lh3.googleusercontent.com/d/19KV8I8yYvDiUAglDyVM4Or5IG67PjsoT=w1160',
  // Signature photo (round, before Sheila's name), loaded straight from this Google Drive file (share as "Anyone with the link")
  AVATAR_URL: 'https://lh3.googleusercontent.com/d/1x1DG6H0hc-W9bE-v9W0f0BXamESQsZ7r=w200',
  // Team photo in the welcome email. Either paste a Drive image link here (shared as "Anyone with the link"),
  // or leave it blank and upload team-photo.jpg to the Drive folder.
  TEAM_PHOTO_URL: 'https://lh3.googleusercontent.com/d/1_avdLBu5UULifhMCplpmKjCNkrVBkgPv=w1032',
  TEAM_PHOTO_FILE: 'team-photo.jpg',
  SIGN_TITLE: 'Financially Savvy Realtor',          // 2nd line of the email signature
  SIGN_COMPANY: 'InnerSparc Realty Corporation',    // 3rd line of the email signature (edit if needed)
  PHONE_TEL: '+639918859370',
  FACEBOOK: 'https://www.facebook.com/profile.php?id=61577472729033',
  YOUTUBE: 'https://www.youtube.com/@SheilaMaeFajutagana',
  JOIN_URL: 'https://innersparcagentportal.vercel.app/?fbclid=IwY2xjawUqzb1leHRuA2FlbQIxMABwZG9mBWJyaWQRMTFPWlB2S2dZbXZ4eGY5Nk9zcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeB98Y43aBkPfbdxz72frRBS5uJDy80XoWM5c5s0IkzTO_WaB3A88B1xV-XQ8_aem__ZCJw3YJNvp469eYSDGrdg'
};
// File names inside the Drive folder. Rename your files to match, or edit these names.
const IMAGES = {
  banner: 'email-banner.jpg',   // wide banner shown at the top of the client email
  avatar: 'sheila-avatar.jpg',  // small square photo used in the email signature
  logo: 'logo-email.png',
  photo: 'sheila-photo.jpg',
  briefing: 'team-briefing.jpg',
  sitevisit: 'site-visit.jpg',
  meeting: 'team-meeting.jpg',
  pain1: 'pain-1.jpg', pain2: 'pain-2.jpg', pain3: 'pain-3.jpg', pain4: 'pain-4.jpg',
  pain5: 'pain-5.jpg', pain6: 'pain-6.jpg', pain7: 'pain-7.jpg', pain8: 'pain-8.jpg',
  why1: 'why-1.jpg', why2: 'why-2.jpg', why3: 'why-3.jpg', why4: 'why-4.jpg'
};
const C = { navy: '#0f2236', gold: '#c8963e', cream: '#f6f1e7', ink: '#1c2a3a', mute: '#5d6b7a' };

// Serves the landing page (HTML file named "Index" in this project)
function doGet() {
  const t = HtmlService.createTemplateFromFile('Index');
  t.img = getImageUrls();
  return t.evaluate()
    .setTitle('Join Our Team | Sheila Mae Fajutagana')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Makes file names easy to match: "Pain 1 (1).JPG" and "pain-1.png" both become "pain-1"
function norm_(n) {
  return String(n).toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/\s*\(\d+\)$/, '').replace(/[\s_]+/g, '-');
}

// Reads the Drive folder (and any folders inside it) and returns {normalizedName: file}
function folderFiles_() {
  const map = {};
  (function walk(folder, depth) {
    const it = folder.getFiles();
    while (it.hasNext()) {
      const f = it.next();
      const k = norm_(f.getName());
      if (!map[k]) map[k] = f;
    }
    if (depth < 3) {
      const sub = folder.getFolders();
      while (sub.hasNext()) walk(sub.next(), depth + 1);
    }
  })(DriveApp.getFolderById(CFG.FOLDER_ID), 0);
  return map;
}

// Finds each picture in the Drive folder by file name and returns a direct image link
function getImageUrls() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('imgs_v8');
  if (hit) return JSON.parse(hit);
  const urls = {};
  let missing = false;
  let files = {};
  try { files = folderFiles_(); } catch (e) { console.error('Folder read failed: ' + e); }
  Object.keys(IMAGES).forEach(function (k) {
    const f = files[norm_(IMAGES[k])];
    urls[k] = f ? 'https://lh3.googleusercontent.com/d/' + f.getId() + '=w1200' : '';
    if (!urls[k]) missing = true;
  });
  cache.put('imgs_v8', JSON.stringify(urls), missing ? 300 : 21600);
  return urls;
}

// Run this to clear the cache and see which pictures the script can find (check the Execution log)
function testImages() {
  CacheService.getScriptCache().remove('imgs_v8');
  const urls = getImageUrls();
  Object.keys(urls).forEach(function (k) {
    Logger.log((urls[k] ? 'FOUND   ' : 'MISSING ') + k + '  ->  ' + IMAGES[k]);
  });
}

// Run this to see the file names inside your Drive folder (check the Execution log)
function listFolderFiles() {
  const root = DriveApp.getFolderById(CFG.FOLDER_ID);
  Logger.log('Folder: ' + root.getName());
  (function walk(folder, path, depth) {
    const it = folder.getFiles();
    while (it.hasNext()) { const f = it.next(); Logger.log(path + f.getName() + '  |  ' + f.getId()); }
    if (depth < 3) {
      const sub = folder.getFolders();
      while (sub.hasNext()) { const s = sub.next(); walk(s, path + s.getName() + '/', depth + 1); }
    }
  })(root, '', 0);
}

// Run this once from the editor to authorize permissions and send a test email
function testRun() {
  const sample = { name: 'Test Client', email: CFG.OWNER_EMAIL, phone: '0917 000 0000',
    location: 'Cavite', occupation: 'Employed', experience: 'No experience yet', availability: 'Part-time', date: '', why: 'Test inquiry' };
  Logger.log(JSON.stringify(submitForm(sample)));
}

/* ---------- Google Sheet for applicants ---------- */
const SHEET_TAB = 'Applicants';
const STATUSES = ['New', 'Called', 'Interested', 'Registered', 'Not a fit'];
const SHEET_HEADERS = ['Date received', 'Name', 'Mobile', 'Email', 'Based in', 'Current work', 'Experience',
  'Availability', 'Why they want to join', 'Preferred call date', 'Status', 'Notes'];

function sheetId_() {
  return CFG.SHEET_ID || PropertiesService.getScriptProperties().getProperty('SHEET_ID') || '';
}

// RUN THIS ONCE from the editor: creates the Google Sheet (in your Drive) and links it to the landing page.
// After that, every new applicant is added as a new row automatically. The link is emailed to you and shown in the Execution log.
function setupSheet() {
  const props = PropertiesService.getScriptProperties();
  const old = sheetId_();
  if (old) {
    try {
      const url = SpreadsheetApp.openById(old).getUrl();
      Logger.log('Sheet is already set up: ' + url);
      return url;
    } catch (e) { Logger.log('Old sheet not found, creating a new one. ' + e); }
  }

  const ss = SpreadsheetApp.create('Financially Savvy Realtor | Applicants');
  const sh = ss.getSheets()[0].setName(SHEET_TAB);
  const n = SHEET_HEADERS.length;
  if (sh.getMaxColumns() > n) sh.deleteColumns(n + 1, sh.getMaxColumns() - n);
  const rows = sh.getMaxRows() - 1;

  // header row
  sh.getRange(1, 1, 1, n).setValues([SHEET_HEADERS]).setFontColor('#ffffff').setFontWeight('bold').setVerticalAlignment('middle');
  sh.setRowHeight(1, 38);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);
  [150, 170, 120, 220, 170, 160, 150, 120, 320, 130, 120, 260].forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });

  // body formatting
  sh.getRange(2, 1, rows, n).setVerticalAlignment('top');
  sh.getRange(2, 9, rows, 1).setWrap(true);
  sh.getRange(2, 12, rows, 1).setWrap(true);
  sh.getRange(2, 1, rows, 1).setNumberFormat('mmm d, yyyy h:mm AM/PM');
  sh.getRange(2, 3, rows, 1).setNumberFormat('@');   // keeps the leading 0 in mobile numbers
  sh.getRange(2, 10, rows, 1).setNumberFormat('@');
  sh.getRange(1, 1, rows + 1, n)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor('#0f2236').setFirstRowColor('#ffffff').setSecondRowColor('#f6f1e7');

  // Status dropdown + colors
  const status = sh.getRange(2, 11, rows, 1);
  status.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).setAllowInvalid(false).build());
  const colors = { 'New': ['#fff3dc', '#8a5d12'], 'Called': ['#e6eef7', '#16324f'], 'Interested': ['#e3f1e4', '#2c6a39'],
    'Registered': ['#c8963e', '#1a1206'], 'Not a fit': ['#eeeeee', '#666666'] };
  sh.setConditionalFormatRules(STATUSES.map(function (st) {
    return SpreadsheetApp.newConditionalFormatRule().whenTextEqualTo(st)
      .setBackground(colors[st][0]).setFontColor(colors[st][1]).setBold(true).setRanges([status]).build();
  }));

  // Summary tab (counts update by themselves)
  const sm = ss.insertSheet('Summary');
  const lines = [['Applicant summary', ''], ['', ''],
    ['Total applicants', '=COUNTA(Applicants!B2:B)'],
    ['Received in the last 7 days', '=COUNTIF(Applicants!A2:A,">="&(TODAY()-7))']];
  const heads = [];
  [['Status', 'K', STATUSES],
   ['Based in', 'E', ['Bulacan', 'Cavite', 'Other province in the Philippines', 'Overseas (OFW)']],
   ['Current work', 'F', ['Employed', 'Business owner', 'OFW / Seafarer', 'Fresh graduate', 'Full-time parent / homemaker', 'Other']],
   ['Experience', 'G', ['No experience yet', 'Less than 1 year', '1 to 3 years', 'More than 3 years']],
   ['Availability', 'H', ['Part-time', 'Full-time', 'Not sure yet']]
  ].forEach(function (g) {
    lines.push(['', '']);
    lines.push([g[0], 'Applicants']);
    heads.push(lines.length);
    g[2].forEach(function (label) {
      lines.push([label, '=COUNTIF(Applicants!' + g[1] + '2:' + g[1] + ',"' + label + '")']);
    });
  });
  sm.getRange(1, 1, lines.length, 2).setValues(lines);
  sm.getRange(1, 1).setFontSize(16).setFontWeight('bold').setFontColor('#0f2236');
  heads.forEach(function (r) { sm.getRange(r, 1, 1, 2).setBackground('#0f2236').setFontColor('#ffffff').setFontWeight('bold'); });
  sm.getRange(3, 2, lines.length - 2, 1).setHorizontalAlignment('right');
  sm.setColumnWidth(1, 280);
  sm.setColumnWidth(2, 100);
  sm.setHiddenGridlines(true);
  ss.setActiveSheet(sh);

  props.setProperty('SHEET_ID', ss.getId());
  const url = ss.getUrl();
  try {
    MailApp.sendEmail(CFG.OWNER_EMAIL, 'Your applicants Google Sheet is ready',
      'Every new applicant from your landing page is now added to this sheet automatically:\n\n' + url);
  } catch (e) { console.error('Sheet link email failed: ' + e); }
  Logger.log('Sheet created: ' + url);
  return url;
}

function doPost(e) {
  try { return out(submitForm(JSON.parse(e.postData.contents))); }
  catch (err) { console.error('Bad request: ' + err); return out({ ok: false, error: String(err) }); }
}

// Called by the landing page form (google.script.run)
function submitForm(d) {
  const name = clean(d.name), email = clean(d.email);
  const errors = [];

  // 1) Notify Sheila
  try {
    MailApp.sendEmail({
      to: CFG.OWNER_EMAIL,
      replyTo: email,
      subject: 'New applicant: ' + name + ' (' + clean(d.location) + ')',
      body: 'New recruitment inquiry from ' + name + '. Mobile: ' + clean(d.phone) + ', Email: ' + email + ', Based in: ' + clean(d.location) + ', Availability: ' + clean(d.availability) + '. Call within 24 hours.',
      htmlBody: ownerHtml(d)
    });
  } catch (err) { errors.push('owner email: ' + err); console.error('Owner email failed: ' + err); }

  // 2) Auto-reply to the client
  try {
    if (email && email !== '-') {
      const imgs = inlineImages();
      MailApp.sendEmail({
        to: email,
        replyTo: CFG.OWNER_EMAIL,
        name: 'Sheila Mae Fajutagana',
        subject: 'Hi ' + firstName(name) + ', I got your application!',
        body: 'Hi ' + firstName(name) + ', Sheila here. Thank you for applying! I received your application and I will call you within 24 hours, para magkakilala tayo. You can reply to this email or call me at ' + CFG.PHONE_DISPLAY + '. - Sheila',
        htmlBody: clientHtml(name, imgs),
        inlineImages: imgs
      });
    }
  } catch (err) { errors.push('client email: ' + err); console.error('Client email failed: ' + err); }

  // 3) Log to the Google Sheet (created once by setupSheet)
  try {
    const sid = sheetId_();
    if (sid) {
      const ss = SpreadsheetApp.openById(sid);
      const sh = ss.getSheetByName(SHEET_TAB) || ss.getSheets()[0];
      const cell = function (v) { const t = clean(v); return t === '-' ? '' : t; };
      sh.appendRow([new Date(), cell(d.name), cell(d.phone), cell(d.email), cell(d.location), cell(d.occupation),
        cell(d.experience), cell(d.availability), cell(d.why), cell(d.date), 'New', '']);
    }
  } catch (err) { errors.push('sheet: ' + err); console.error('Sheet log failed: ' + err); }

  return { ok: errors.length === 0, errors: errors };
}

/* ---------- Email to the client ---------- */
function clientHtml(name, imgs) {
  const fn = esc(firstName(name));
  const teamSrc = CFG.TEAM_PHOTO_URL || (imgs.team ? 'cid:team' : '');
  const teamPhoto = teamSrc
    ? '<img src="' + teamSrc + '" alt="Our team having dinner together" width="516" style="display:block;width:100%;max-width:516px;height:auto;border:0;border-radius:14px">' +
      '<div style="font:italic 13px/1.5 Georgia,serif;color:' + C.mute + ';margin:8px 0 26px">Some of the amazing people you could be working with.</div>'
    : '';
  const bannerSrc = CFG.BANNER_URL || (imgs.banner ? 'cid:banner' : '');
  const logo = imgs.logo ? '<img src="cid:logo" alt="Financially Savvy Realtor" height="60" style="display:block;margin:0 auto 12px;height:60px;width:auto;border:0">' : '';
  const avatarSrc = CFG.AVATAR_URL || (imgs.avatar ? 'cid:avatar' : '');
  const avatar = avatarSrc ? '<td width="82" valign="middle" style="padding-right:14px"><img src="' + avatarSrc + '" alt="Sheila Mae Fajutagana" width="64" height="64" style="display:block;width:64px;height:64px;border-radius:50%;object-fit:cover;border:2px solid ' + C.gold + '"></td>' : '';

  // One paragraph of the personal letter
  const p = function (t) {
    return '<p style="margin:0 0 26px;font:16px/1.7 Arial,Helvetica,sans-serif;color:' + C.ink + '">' + t + '</p>';
  };

  return '' +
  '<style>@keyframes glowPulse{0%,100%{box-shadow:0 0 0 3px rgba(200,150,62,.30),0 6px 20px rgba(200,150,62,.55)}50%{box-shadow:0 0 0 14px rgba(200,150,62,.08),0 8px 34px rgba(200,150,62,.95)}}.glow{animation:glowPulse 1.8s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.glow{animation:none}}</style>' +
  '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">I got your application. I will call you within 24 hours.</div>' +
  '<div style="background:#e9e2d3;padding:24px 10px;font-family:Arial,Helvetica,sans-serif">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:' + C.cream + ';border-radius:20px;overflow:hidden">' +

    // gold accent line
    '<tr><td height="5" bgcolor="' + C.gold + '" style="font-size:0;line-height:0">&nbsp;</td></tr>' +

    // header (banner image, falls back to the old text header if the banner is missing in Drive)
    (bannerSrc
      ? '<tr><td style="padding:0;font-size:0;line-height:0;background:' + C.navy + '"><img src="' + bannerSrc + '" alt="Financially Savvy Realtor - Sheila Mae Fajutagana" width="580" style="display:block;width:100%;height:auto;border:0"></td></tr>' +
        '<tr><td height="3" bgcolor="' + C.gold + '" style="font-size:0;line-height:0">&nbsp;</td></tr>'
      : '<tr><td align="center" bgcolor="' + C.navy + '" style="background:' + C.navy + ';padding:30px 20px 26px">' + logo +
        '<div style="color:' + C.gold + ';font-size:12px;font-weight:bold;letter-spacing:3px">FINANCIALLY SAVVY REALTOR</div>' +
        '<div style="color:#9fb0c2;font-size:11px;letter-spacing:1.5px;margin-top:6px">SMART MOVES &bull; SECURE FUTURES</div></td></tr>') +

    // personal letter (before the button)
    '<tr><td style="padding:34px 32px 0">' +
      p('Hi ' + fn + ', Sheila here.') +
      p("I just saw your application come in, and I had to write you right away.") +
      p("Kasi honestly? Ang dami mong pwedeng ginawa today, but you chose to take a step toward something new.") +
      p("That says a lot about you.") +
      p("Most people think about changing their situation for years.") +
      p("Very few actually do something about it.") +
      p("You just did.") +
      p("So first of all, congratulations. I mean it.") +
      p("Now let me answer the question that's probably on your mind.") +
      p("\"Kaya ko ba 'to kahit wala akong experience?\"") +
      p("Yes, you can.") +
      p("Almost everyone on our team started from zero.") +
      p("Hindi sila magaling agad. Natuto lang sila, step by step.") +
      p("And you'll have people beside you the whole way.") +
      p("Here's what happens next.") +
      p("Within 24 hours, I'll personally call you.") +
      p("No sales pitch. Just a real conversation.") +
      p("We'll talk about where you are now, where you want to be, and if this is the right fit for you.") +
      p("If you're already feeling ready and don't want to wait...") +
      p("Pwede mo nang simulan ang agent registration sa link below.") +
      p("Just read the instructions first and make sure you understand the requirements before submitting.") +
    '</td></tr>' +

    // button
    '<tr><td align="center" style="padding:8px 28px 16px">' + glowBtn('START YOUR REAL ESTATE JOURNEY', CFG.JOIN_URL) + '</td></tr>' +

    // personal letter (after the button)
    '<tr><td style="padding:26px 32px 0">' +
      p("Not ready yet? That's okay too.") +
      p("Maybe you still have questions. Normal lang yan.") +
      p("Just hit reply to this email, and I'll answer you myself.") +
      p('What matters most to me is that you feel informed and comfortable with your decision, ' + fn + '.') +
      p("And if you decide this isn't for you, no hard feelings at all.") +
      p("I'd rather work with people who truly want to be here.") +
      p("But if there's even a small voice saying \"what if?\"...") +
      p("Listen to it.") +
      p("Some of the best decisions start with a simple \"what if.\"") +
      p("Sa team namin, hindi ka maiiwan mag-isa.") +
      teamPhoto +
      p("We'll learn together, grow together, and celebrate every win together.") +
      p("Excited na akong makilala ka!") +
      p('Talk to you soon, ' + fn + '!') +
      p("Warmly,") +
    '</td></tr>' +

    // signature (avatar + name + title + company)
    '<tr><td style="padding:0 32px 32px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>' +
      '<table role="presentation" cellpadding="0" cellspacing="0"><tr>' + avatar +
        '<td valign="middle">' +
          '<div style="font:bold 17px Georgia,serif;color:' + C.navy + '">Sheila Mae Fajutagana</div>' +
          '<div style="font:13px Arial,Helvetica,sans-serif;color:' + C.ink + ';margin-top:3px">' + esc(CFG.SIGN_TITLE) + '</div>' +
          '<div style="font:12px Arial,Helvetica,sans-serif;color:#7a8aa0;margin-top:2px">' + esc(CFG.SIGN_COMPANY) + '</div>' +
        '</td></tr></table>' +
    '</td></tr></table></td></tr>' +

    // footer
    '<tr><td align="center" bgcolor="' + C.navy + '" style="background:' + C.navy + ';padding:20px;font-size:11px;line-height:1.7;color:#9fb0c2">' +
      'You received this email because you applied to join The Financially Savvy Realtor team.<br>' +
      '&copy; ' + new Date().getFullYear() + ' Sheila Mae Fajutagana &mdash; Smart Moves &bull; Secure Futures</td></tr>' +
  '</table></div>';
}

// Gold call-to-action button with a glow. Gmail shows the static glow; Apple Mail, iOS Mail and some others also pulse it.
function glowBtn(label, href) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>' +
    '<td class="glow" bgcolor="' + C.gold + '" style="border-radius:999px;box-shadow:0 0 0 5px rgba(200,150,62,.28),0 8px 26px rgba(200,150,62,.75)">' +
    '<a href="' + href + '" style="display:inline-block;padding:16px 32px;font-size:15px;font-weight:bold;letter-spacing:.5px;color:#1a1206;text-decoration:none;border-radius:999px">' + label + ' &rarr;</a></td></tr></table>';
}

/* ---------- Email to Sheila ---------- */
function ownerHtml(d) {
  const name = clean(d.name), email = clean(d.email), phone = clean(d.phone);
  const val = function (v) {
    const t = clean(v);
    return t === '-' ? '<span style="color:#9aa6b2">Not provided</span>' : esc(t);
  };
  const when = Utilities.formatDate(new Date(), 'Asia/Manila', 'MMM d, yyyy, h:mm a');
  const telHref = 'tel:' + phone.replace(/[^\d+]/g, '');

  const pill = function (text, bg, color) {
    return '<span style="display:inline-block;background:' + bg + ';color:' + color + ';font:bold 11px Arial,sans-serif;letter-spacing:.5px;padding:6px 12px;border-radius:999px;margin:0 4px 6px 0">' + esc(text) + '</span>';
  };
  const row = function (label, html) {
    return '<tr><td width="125" valign="top" style="padding:12px 0;border-bottom:1px solid #eee5d3;font:bold 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:' + C.gold + '">' + label + '</td>' +
      '<td valign="top" style="padding:12px 0;border-bottom:1px solid #eee5d3;font-size:14px;line-height:1.5;color:' + C.ink + '">' + html + '</td></tr>';
  };

  const why = clean(d.why) === '-' ? '' :
    '<tr><td style="padding:4px 24px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-left:4px solid ' + C.gold + ';border-radius:10px"><tr><td style="padding:16px 18px">' +
    '<div style="font:bold 11px Arial,sans-serif;letter-spacing:1px;text-transform:uppercase;color:' + C.gold + ';margin-bottom:6px">Why they want to join</div>' +
    '<div style="font:italic 15px/1.6 Georgia,serif;color:' + C.ink + '">&ldquo;' + esc(clean(d.why)) + '&rdquo;</div></td></tr></table></td></tr>';

  return '' +
  '<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">' + esc(name) + ' &bull; ' + esc(clean(d.location)) + ' &bull; ' + esc(clean(d.availability)) + '</div>' +
  '<div style="background:#e9e2d3;padding:24px 10px;font-family:Arial,Helvetica,sans-serif">' +
  '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;margin:0 auto;background:' + C.cream + ';border-radius:20px;overflow:hidden">' +

    '<tr><td height="5" bgcolor="' + C.gold + '" style="font-size:0;line-height:0">&nbsp;</td></tr>' +

    // header
    '<tr><td bgcolor="' + C.navy + '" style="background:' + C.navy + ';padding:26px 26px 22px">' +
      '<div style="color:' + C.gold + ';font-size:12px;font-weight:bold;letter-spacing:3px">&#9889; NEW RECRUITMENT INQUIRY</div>' +
      '<div style="color:#ffffff;font:bold 28px/1.2 Georgia,serif;margin:10px 0 6px">' + esc(name) + '</div>' +
      '<div style="color:#9fb0c2;font-size:12px">Received ' + when + ' (PH time)</div></td></tr>' +

    // quick tags
    '<tr><td style="padding:20px 24px 4px">' +
      pill(clean(d.location), '#fff3dc', '#8a5d12') + pill(clean(d.occupation), '#e6eef7', '#16324f') + pill(clean(d.availability), '#e3f1e4', '#2c6a39') +
    '</td></tr>' +

    // reminder
    '<tr><td style="padding:6px 24px 6px"><div style="background:#fff3dc;border-radius:10px;padding:10px 14px;font-size:13px;color:#6b4a0f">&#9200; The applicant was told you will call within <b>24 hours</b>.</div></td></tr>' +

    // details
    '<tr><td style="padding:10px 24px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' +
      row('Mobile', '<a href="' + telHref + '" style="color:' + C.navy + ';font-weight:bold;text-decoration:none">' + val(d.phone) + '</a>') +
      row('Email', '<a href="mailto:' + encodeURI(email) + '" style="color:' + C.navy + ';text-decoration:none">' + val(d.email) + '</a>') +
      row('Based in', val(d.location)) +
      row('Current work', val(d.occupation)) +
      row('Experience', val(d.experience)) +
      row('Availability', val(d.availability)) +
      row('Call date', val(d.date)) +
    '</table></td></tr>' +

    why +

    // actions
    '<tr><td align="center" style="padding:22px 24px 8px">' +
      btn('Call ' + esc(firstName(name)), telHref, C.gold, '#1a1206') + '<div style="height:10px"></div>' +
      btn('Reply by email', 'mailto:' + encodeURI(email), C.navy, '#ffffff') +
    '</td></tr>' +

    // footer
    '<tr><td align="center" bgcolor="' + C.navy + '" style="background:' + C.navy + ';padding:18px;font-size:11px;line-height:1.7;color:#9fb0c2;margin-top:20px">' +
      'Sent automatically by your landing page form.<br>The Financially Savvy Realtor &bull; Smart Moves &bull; Secure Futures</td></tr>' +
  '</table></div>';
}

/* ---------- helpers ---------- */
function btn(label, href, bg, color) {
  return '<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td bgcolor="' + bg + '" style="border-radius:999px">' +
    '<a href="' + href + '" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:bold;color:' + color + ';text-decoration:none;border-radius:999px">' + label + '</a></td></tr></table>';
}
// Finds an email picture in the Drive folder: exact name first, then any file whose name contains the keyword ("banner", "avatar")
function pick_(files, key) {
  const exact = files[norm_(IMAGES[key])];
  if (exact) return exact;
  const stem = norm_(IMAGES[key]).replace(/^email-|^sheila-/, '');
  const hit = Object.keys(files).filter(function (n) { return n.indexOf(stem) !== -1; })[0];
  return hit ? files[hit] : null;
}
function inlineImages() {
  const o = {};
  let files = {};
  try { files = folderFiles_(); } catch (e) { console.error('Folder read failed: ' + e); }
  ['logo'].concat(CFG.AVATAR_URL ? [] : ['avatar'], CFG.BANNER_URL ? [] : ['banner']).forEach(function (k) {
    try {
      const id = (CFG.EMAIL_FILE_IDS || {})[k];
      const f = id ? DriveApp.getFileById(id) : pick_(files, k);
      if (f) o[k] = f.getBlob();
      else console.error('Email image not found: ' + k + ' (looking for ' + IMAGES[k] + ')');
    } catch (e) { console.error('Email image failed (' + k + '): ' + e); }
  });
  try {
    if (!CFG.TEAM_PHOTO_URL) {
      const t = files[norm_(CFG.TEAM_PHOTO_FILE)];
      if (t) o.team = t.getBlob();
    }
  } catch (e) { console.error('Team photo failed: ' + e); }
  return o;
}
// Run this: shows which email pictures are found and lists every file name in the Drive folder (check the Execution log)
function testEmailImages() {
  const imgs = inlineImages();
  ['logo', 'banner', 'avatar'].forEach(function (k) {
    Logger.log(imgs[k]
      ? 'FOUND   ' + k + '  (' + imgs[k].getContentType() + ', ' + Math.round(imgs[k].getBytes().length / 1024) + ' KB)'
      : 'MISSING ' + k + '  -> looking for ' + IMAGES[k]);
  });
  Logger.log('--- Files in the folder ---');
  listFolderFiles();
}
function firstName(n) { return (n || 'there').toString().trim().split(/\s+/)[0]; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function clean(v) { return (v || '-').toString().slice(0, 1000); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
