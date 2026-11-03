// Core of /api/trending (loaded at runtime by api/trending.js).
// Trending news for the BCM Portal: war / armed conflict, cyber threats and disasters.
// Pulls public RSS feeds (Google News search, The Hacker News, BleepingComputer),
// the CISA Known Exploited Vulnerabilities catalog, then dedupes, tags region and
// topic, scores, and counts trending terms. Cached at the edge for 5 minutes.

const GN = (q, lang = "en") =>
  lang === "th"
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=th&gl=TH&ceid=TH:th`
    : `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;

const FEEDS = {
  conflict: [
    { id: "gn-world", url: GN('(war OR "armed conflict" OR airstrike OR "missile strike" OR "border clash" OR insurgency OR ceasefire) when:1d') },
    { id: "gn-sea", url: GN('(Thailand OR Cambodia OR Myanmar OR Vietnam OR Indonesia OR Philippines OR Malaysia OR Laos OR "South China Sea") (clash OR conflict OR military OR fighting OR troops OR unrest) when:3d') },
    { id: "gn-th", lang: "th", url: GN('(ปะทะ OR สงคราม OR ความขัดแย้ง OR ชายแดน OR ทหาร OR หยุดยิง) when:2d', "th") },
    { id: "gov-th-def", lang: "th", official: "กระทรวงกลาโหม / กองทัพ", home: "https://www.mod.go.th", url: GN('(กระทรวงกลาโหม OR กองทัพบก OR กองทัพภาค OR ศบ.ทก.) (ชายแดน OR ปะทะ OR สู้รบ OR ความมั่นคง) when:5d', "th") },
    { id: "gov-th-mfa", lang: "th", official: "กระทรวงการต่างประเทศ", home: "https://www.mfa.go.th", url: GN('("กระทรวงการต่างประเทศ" OR "กต.") (เมียนมา OR กัมพูชา OR สู้รบ OR อพยพ OR ความขัดแย้ง OR คนไทย) when:7d', "th") },
    { id: "un-asean", official: "UN / ASEAN", home: "https://asean.org", url: GN('(ASEAN OR "United Nations" OR UNHCR) (Myanmar OR Cambodia OR "South China Sea") (conflict OR fighting OR airstrike OR ceasefire) when:7d') },
  ],
  // Cyber Threat sources follow data/cyber_threat_reference_sources.csv (BCM team reference list).
  cyber: [
    { id: "thaicert", ref: 1, lang: "th", official: "ThaiCERT", src: "ThaiCERT", url: "https://www.thaicert.or.th/cyber-alert-th/feed/", alt: GN('ThaiCERT when:30d', "th") },
    { id: "cisa-adv", ref: 2, official: "CISA Cybersecurity Advisories", src: "CISA", url: "https://www.cisa.gov/cybersecurity-advisories/all.xml" },
    { id: "cisa-ics", ref: 3, official: "CISA ICS Advisories", src: "CISA ICS", url: "https://www.cisa.gov/cybersecurity-advisories/ics-advisories.xml" },
    { id: "csa-sg", ref: 4, official: "CSA Singapore / SingCERT", url: GN('("Cyber Security Agency of Singapore" OR SingCERT OR "CSA Singapore") when:30d') },
    { id: "ms-ti", ref: 9, official: "Microsoft Threat Intelligence", src: "Microsoft Threat Intelligence", url: "https://www.microsoft.com/en-us/security/blog/topic/threat-intelligence/feed/" },
    { id: "gti", ref: 10, official: "Google Threat Intelligence / Mandiant", src: "Google Threat Intelligence", url: "https://cloudblog.withgoogle.com/topics/threat-intelligence/rss/", alt: GN('("Google Threat Intelligence" OR Mandiant) when:14d') },
    { id: "enisa", ref: 11, official: "ENISA Threat Landscape", url: GN('ENISA (threat OR cyber) when:30d') },
    { id: "bleeping", ref: 13, official: "BleepingComputer", src: "BleepingComputer", url: "https://www.bleepingcomputer.com/feed/" },
    { id: "therecord", ref: 14, official: "The Record", src: "The Record", url: "https://therecord.media/feed" },
  ],
  disaster: [
    { id: "gn-dis-sea", url: GN('(flood OR typhoon OR earthquake OR landslide OR "tropical storm" OR haze OR wildfire) (Thailand OR Vietnam OR Indonesia OR Philippines OR Malaysia OR Myanmar OR Cambodia OR Laos) when:2d') },
    { id: "gn-dis-th", lang: "th", url: GN('(น้ำท่วม OR พายุ OR แผ่นดินไหว OR ดินถล่ม OR ฝนตกหนัก OR PM2.5 OR ไฟป่า) when:2d', "th") },
    { id: "gov-ddpm", lang: "th", official: "ปภ. กรมป้องกันและบรรเทาสาธารณภัย", home: "https://www.disaster.go.th", url: GN('(ปภ. OR "กรมป้องกันและบรรเทาสาธารณภัย") (น้ำท่วม OR พายุ OR ภัย OR เตือน OR อพยพ) when:5d', "th") },
    { id: "gov-tmd", lang: "th", official: "กรมอุตุนิยมวิทยา", home: "https://www.tmd.go.th", url: GN('("กรมอุตุนิยมวิทยา" OR "กรมอุตุฯ") (ประกาศ OR เตือน OR พายุ OR ฝน) when:3d', "th") },
    { id: "gov-onwr", lang: "th", official: "สทนช. / กรมชลประทาน", home: "https://www.onwr.go.th", url: GN('(สทนช. OR กรมชลประทาน OR "การบริหารจัดการน้ำ") (น้ำท่วม OR ระดับน้ำ OR เขื่อน OR เตือน) when:5d', "th") },
    { id: "gov-aha", official: "AHA Centre (ASEAN)", home: "https://ahacentre.org", url: GN('("AHA Centre" OR "ASEAN Coordinating Centre for Humanitarian Assistance") when:14d') },
  ],
};
FEEDS.breaking = [
  { id: "bbc-world", src: "BBC News", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { id: "bbc-asia", src: "BBC News", url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml" },
  { id: "aljazeera", src: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { id: "cna", src: "CNA", url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml&category=6511" },
  { id: "reuters", url: GN("site:reuters.com when:12h") },
  { id: "ap", url: GN("site:apnews.com when:12h") },
  { id: "bkkpost", src: "Bangkok Post", url: "https://www.bangkokpost.com/rss/data/topstories.xml" },
  { id: "thaipbs", lang: "th", url: GN("site:thaipbs.or.th when:12h", "th") },
  { id: "thairath", lang: "th", url: GN("site:thairath.co.th when:12h", "th") },
  { id: "matichon", lang: "th", src: "มติชน", url: "https://www.matichon.co.th/feed" },
  { id: "prachachat", lang: "th", src: "ประชาชาติธุรกิจ", url: "https://www.prachachat.net/feed" },
  { id: "khaosod", lang: "th", src: "ข่าวสด", url: "https://www.khaosod.co.th/feed" },
];
const MAX_AGE_H = { conflict: 192, cyber: 192, disaster: 192, breaking: 12 };

// Cyber Threat reference list (data/cyber_threat_reference_sources.csv)
const CYBER_REF = [
  [1, "official", "ThaiCERT", "ThaiCERT / สกมช.", "https://www.thaicert.or.th/cyber-alert-th/", "ประกาศเตือนช่องโหว่และภัยคุกคาม พร้อมแนวทางรับมือภาษาไทย", "อ้างอิงประกาศเตือนภัยและสื่อสารภายในองค์กรไทย", "ไทย", "ตรวจสอบวันที่ปรับปรุงและผลิตภัณฑ์ที่ได้รับผลกระทบในประกาศแต่ละฉบับ"],
  [2, "official", "CISA Cybersecurity Advisories", "CISA สหรัฐอเมริกา", "https://www.cisa.gov/news-events/cybersecurity-advisories", "รายละเอียดภัยคุกคาม เทคนิคการโจมตี ตัวบ่งชี้การบุกรุก และแนวทางป้องกัน", "ประเมินภัยคุกคามและจัดทำคำแนะนำให้ทีม IT/SOC", "อังกฤษ", "ตรวจสอบความเกี่ยวข้องกับระบบองค์กรและข้อมูลจากผู้ผลิตประกอบ"],
  [3, "official", "CISA ICS Advisories", "CISA สหรัฐอเมริกา", "https://www.cisa.gov/news-events/ics-advisories", "ช่องโหว่และมาตรการลดความเสี่ยงของระบบควบคุมอุตสาหกรรม", "ติดตามความเสี่ยง OT และระบบโรงงาน", "อังกฤษ", "ตรวจสอบรุ่นอุปกรณ์และวางแผนแก้ไขร่วมกับทีม OT และผู้ผลิต"],
  [4, "official", "CSA Singapore / SingCERT", "Cyber Security Agency of Singapore", "https://www.csa.gov.sg/alerts-and-advisories/", "ประกาศเตือนภัย ช่องโหว่ คำแนะนำป้องกัน และ Security Bulletin", "ใช้เป็นแหล่งประกอบสำหรับองค์กรที่ดำเนินงานในอาเซียน", "อังกฤษ", "ประเมินความเกี่ยวข้องกับสินทรัพย์และบริบทขององค์กร"],
  [5, "database", "CISA Known Exploited Vulnerabilities (KEV)", "CISA สหรัฐอเมริกา", "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "รายการช่องโหว่ที่มีหลักฐานว่าถูกใช้โจมตีจริง", "จัดลำดับเร่งด่วนในการแก้ไขช่องโหว่ที่ตรงกับสินทรัพย์องค์กร", "อังกฤษ", "การไม่มีชื่อใน KEV ไม่ได้ยืนยันว่าช่องโหว่นั้นไม่ถูกใช้โจมตี"],
  [6, "database", "National Vulnerability Database (NVD)", "NIST สหรัฐอเมริกา", "https://nvd.nist.gov/", "รายละเอียด CVE ผลิตภัณฑ์ที่ได้รับผลกระทบ และคะแนนความรุนแรง CVSS", "ตรวจสอบข้อมูลทางเทคนิคและประกอบรายงานช่องโหว่", "อังกฤษ", "CVSS วัดความรุนแรงของช่องโหว่ ไม่ใช่ความเสี่ยงเฉพาะองค์กร"],
  [7, "database", "Exploit Prediction Scoring System (EPSS)", "FIRST EPSS Special Interest Group", "https://www.first.org/epss/", "ประเมินโอกาสพบการใช้ช่องโหว่โจมตีในช่วง 30 วันข้างหน้า", "ใช้ร่วมกับ KEV และข้อมูลสินทรัพย์เพื่อจัดลำดับแก้ไข", "อังกฤษ", "เป็นการคาดการณ์ระดับช่องโหว่ ไม่ใช่โอกาสที่องค์กรจะถูกโจมตีโดยตรง"],
  [8, "database", "MITRE ATT&CK", "MITRE", "https://attack.mitre.org/", "ฐานความรู้พฤติกรรมและเทคนิคผู้โจมตี ครอบคลุม Enterprise และ ICS", "ออกแบบสถานการณ์ซ้อม Cyber Incident และประเมินความครอบคลุมการตรวจจับ", "อังกฤษ", "เป็นฐานความรู้เทคนิคการโจมตี ไม่ใช่ฟีดข่าวหรือคำเตือนแบบเรียลไทม์"],
  [9, "research", "Microsoft Threat Intelligence", "Microsoft", "https://www.microsoft.com/en-us/security/blog/topic/threat-intelligence/", "งานวิเคราะห์กลุ่มผู้โจมตี Phishing Ransomware และภัยต่อบัญชีผู้ใช้และ Cloud", "อ้างอิงรูปแบบการโจมตีและแนวทางตรวจจับ โดยเฉพาะสภาพแวดล้อม Microsoft", "อังกฤษ", "ขอบเขตข้อค้นพบขึ้นอยู่กับข้อมูลและการสืบสวนของผู้เผยแพร่"],
  [10, "research", "Google Threat Intelligence / Mandiant", "Google Threat Intelligence Group / Mandiant", "https://cloud.google.com/blog/topics/threat-intelligence", "งานวิจัยภัยคุกคามและบทเรียนจากการสืบสวนเหตุการณ์", "วิเคราะห์ภัยเชิงลึกและเตรียม Incident Response", "อังกฤษ", "แยกข้อค้นพบจากเหตุการณ์เฉพาะออกจากข้อสรุปที่ใช้กับทุกองค์กร"],
  [11, "research", "ENISA Threat Landscape", "European Union Agency for Cybersecurity (ENISA)", "https://www.enisa.europa.eu/topics/cyber-threats/threat-landscape", "ภาพรวมภัยคุกคาม แนวโน้ม และภาคธุรกิจที่ได้รับผลกระทบ", "จัดทำภาพรวมความเสี่ยงและรายงานผู้บริหาร", "อังกฤษ", "ระบุปีรายงานและช่วงข้อมูล โดยคำนึงถึงบริบทของสหภาพยุโรป"],
  [12, "research", "Verizon Data Breach Investigations Report (DBIR)", "Verizon", "https://www.verizon.com/business/business/resources/reports/dbir/", "การวิเคราะห์เหตุละเมิดข้อมูล รูปแบบการโจมตี และข้อมูลตามอุตสาหกรรม", "สนับสนุนแผนลงทุนด้านความปลอดภัย การสร้างความตระหนัก และสถานการณ์ซ้อม", "อังกฤษ", "ระบุปีรายงาน ช่วงเก็บข้อมูล และขอบเขตกลุ่มตัวอย่างเมื่ออ้างตัวเลข"],
  [13, "news", "BleepingComputer", "BleepingComputer", "https://www.bleepingcomputer.com/", "ข่าว Ransomware Malware ช่องโหว่ และเหตุข้อมูลรั่วไหล", "ติดตามข่าวรายวันและค้นหากรณีศึกษา", "อังกฤษ", "ตรวจสอบข้อสรุปทางเทคนิคกับประกาศผู้ผลิต หน่วยงานทางการ หรืองานวิจัยต้นทาง"],
  [14, "news", "The Record", "The Record from Recorded Future News", "https://therecord.media/", "ข่าวอาชญากรรมไซเบอร์ กลุ่มผู้โจมตี และผลกระทบระดับองค์กรและประเทศ", "จัดทำข่าวสรุปผู้บริหารและติดตามผลกระทบทางธุรกิจ", "อังกฤษ", "แยกข้อกล่าวอ้างของผู้โจมตีออกจากข้อเท็จจริงที่ยืนยันแล้ว และตรวจสอบแหล่งต้นทาง"],
];

const KEV_URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json";

const SEA = [
  ["Thailand", /thailand|thai\b|bangkok|ไทย|กรุงเทพ/i], ["Cambodia", /cambodia|khmer|phnom penh|กัมพูชา|เขมร/i],
  ["Myanmar", /myanmar|burma|yangon|naypyidaw|เมียนมา|พม่า/i], ["Vietnam", /vietnam|viet nam|hanoi|ho chi minh|เวียดนาม/i],
  ["Laos", /\blaos\b|lao pdr|vientiane|ลาว/i], ["Indonesia", /indonesia|jakarta|java|sumatra|อินโดนีเซีย/i],
  ["Philippines", /philippine|manila|luzon|mindanao|ฟิลิปปินส์/i], ["Malaysia", /malaysia|kuala lumpur|มาเลเซีย/i],
  ["Singapore", /singapore|สิงคโปร์/i], ["South China Sea", /south china sea|ทะเลจีนใต้/i],
];
const WORLD = [
  ["Ukraine", /ukrain|kyiv|ยูเครน/i], ["Russia", /russia|kremlin|moscow|รัสเซีย/i], ["Israel", /israel|อิสราเอล/i], ["Gaza", /gaza|กาซา/i],
  ["Iran", /\biran|tehran|อิหร่าน/i], ["Lebanon", /lebanon|hezbollah|เลบานอน/i], ["Yemen", /yemen|houthi|เยเมน/i], ["Syria", /syria|ซีเรีย/i],
  ["Sudan", /sudan|ซูดาน/i], ["China", /\bchina\b|beijing|chinese|จีน/i], ["Taiwan", /taiwan|ไต้หวัน/i], ["India", /\bindia\b|อินเดีย/i],
  ["Pakistan", /pakistan|ปากีสถาน/i], ["Korea", /korea|เกาหลี/i], ["USA", /\bu\.?s\.?\b|united states|america|washington|สหรัฐ/i], ["Europe", /europe|\beu\b|nato|ยุโรป/i],
];
const TOPICS = {
  conflict: [
    ["Airstrike / Missile", /air ?strike|missile|drone strike|shelling|bomb|โจมตีทางอากาศ|ขีปนาวุธ|ระเบิด|โดรน/i],
    ["Border clash", /border|ชายแดน|clash|ปะทะ/i], ["Ceasefire / Talks", /ceasefire|truce|peace talk|negotiat|หยุดยิง|เจรจา/i],
    ["Casualties", /killed|dead|deaths|casualt|wounded|เสียชีวิต|บาดเจ็บ/i], ["Protest / Unrest", /protest|unrest|riot|ประท้วง|ชุมนุม/i],
    ["Sanctions / Trade", /sanction|tariff|embargo|คว่ำบาตร|ภาษีนำเข้า/i], ["Coup / Junta", /coup|junta|รัฐประหาร|รัฐบาลทหาร/i],
    ["Shipping / Supply chain", /shipping|strait|port|supply chain|red sea|เดินเรือ|ช่องแคบ|ห่วงโซ่อุปทาน/i],
  ],
  cyber: [
    ["Ransomware", /ransomware|แรนซัมแวร์|เรียกค่าไถ่/i], ["Data breach", /breach|leak|exposed|stolen data|ข้อมูลรั่ว|ข้อมูลหลุด|รั่วไหล/i],
    ["Zero-day / Exploit", /zero-?day|0-day|exploit|cve-\d|vulnerab|patch|ช่องโหว่/i], ["Phishing / Scam", /phish|scam|fraud|ฟิชชิ่ง|หลอกลวง|มิจฉาชีพ|แก๊งคอล/i],
    ["DDoS", /ddos/i], ["APT / State actor", /\bapt\d*|state-sponsored|nation-state|espionage|lazarus|volt typhoon|salt typhoon|จารกรรม/i],
    ["Malware", /malware|trojan|botnet|backdoor|infostealer|มัลแวร์/i], ["OT / ICS", /\bscada|\bics\b|\bot\b security|industrial control|operational technology/i],
    ["Supply chain attack", /supply[- ]chain attack|npm|pypi|github action/i], ["AI-driven", /\bai\b|llm|deepfake|ดีปเฟค/i],
  ],
  disaster: [
    ["Flood", /flood|น้ำท่วม|อุทกภัย/i], ["Storm / Typhoon", /typhoon|storm|cyclone|พายุ|ไต้ฝุ่น/i], ["Earthquake", /earthquake|quake|แผ่นดินไหว/i],
    ["Landslide", /landslide|ดินถล่ม|โคลน/i], ["Heavy rain", /heavy rain|rainfall|ฝนตกหนัก|ฝนหนัก|ฝนถล่ม|ลูกเห็บ|ลมกระโชก/i], ["Haze / PM2.5", /haze|pm ?2\.5|smog|หมอกควัน|ฝุ่น/i],
    ["Wildfire", /wildfire|forest fire|ไฟป่า/i], ["Volcano", /volcano|eruption|ภูเขาไฟ/i],
  ],
};
TOPICS.breaking = [
  ["Conflict / Security", /war\b|military|troops|airstrike|missile|clash|shooting|gunfire|attack|bomb|explosion|blast|terror|สงคราม|ทหาร|ปะทะ|ยิง|ระเบิด|ก่อการร้าย|ความมั่นคง/i],
  ["Disaster / Weather", /flood|storm|typhoon|cyclone|earthquake|quake|tsunami|landslide|wildfire|heavy rain|haze|volcano|น้ำท่วม|พายุ|แผ่นดินไหว|สึนามิ|ดินถล่ม|ไฟป่า|ฝนตกหนัก|ฝนหนัก|ฝุ่น|ภูเขาไฟ/i],
  ["Cyber", /cyber|hack|ransomware|data breach|ไซเบอร์|แฮก|ข้อมูลรั่ว/i],
  ["Fire / Industrial accident", /fire\b|blaze|chemical|leak|factory|plant explosion|industrial accident|ไฟไหม้|เพลิงไหม้|สารเคมี|โรงงาน|รั่วไหล/i],
  ["Unrest / Strike", /protest|riot|unrest|strike\b|curfew|coup|ประท้วง|ชุมนุม|จลาจล|นัดหยุดงาน|เคอร์ฟิว|รัฐประหาร/i],
  ["Outage / Transport", /outage|blackout|power cut|airport|flight|port closure|derail|crash|ไฟดับ|สนามบิน|เที่ยวบิน|ท่าเรือ|รถไฟ|ตกราง|อุบัติเหตุ/i],
];
const HIGH = {
  breaking: /breaking|urgent|live:|killed|dead|evacuat|emergency|explosion|ด่วน|ล่าสุด|เสียชีวิต|อพยพ|ฉุกเฉิน|ระเบิด/i,
  conflict: /killed|dead|airstrike|air strike|missile|invasion|offensive|war\b|clash|martial law|เสียชีวิต|ปะทะ|สงคราม|ขีปนาวุธ/i,
  cyber: /ransomware|zero-?day|actively exploited|critical|breach|outage|nation-state|แรนซัมแวร์|ข้อมูลรั่ว|ช่องโหว่ร้ายแรง/i,
  disaster: /killed|dead|evacuat|emergency|warning|alert|warns|เสียชีวิต|อพยพ|เตือน|ฉุกเฉิน|ประกาศฉบับ/i,
};

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) => String(s || "")
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e] ?? m));
const strip = (s) => decode(decode(s)).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}(?:\\s[^>]*)?>([\\s\\S]*?)</${t}>`, "i")); return m ? m[1] : ""; };

async function getText(url) {
  const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; SCG-BCM-Portal/1.0)", accept: "application/rss+xml,application/xml,text/xml,application/json;q=0.9,*/*;q=0.8" }, signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.text();
}

function parseRSS(xml, feed) {
  return (xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []).map((it) => {
    let title = strip(tag(it, "title")).replace(/^news\s*[-:]\s*/i, "");
    let source = strip(tag(it, "source")) || feed.src || "";
    if (source && title.endsWith(" - " + source)) title = title.slice(0, -(source.length + 3));
    else if (!feed.src) { const k = title.lastIndexOf(" - "); if (k > 20) { source = source || title.slice(k + 3); title = title.slice(0, k); } }
    const link = strip(tag(it, "link")) || strip(tag(it, "guid"));
    const d = new Date(strip(tag(it, "pubDate")) || strip(tag(it, "dc:date")));
    let desc = strip(tag(it, "description"));
    if (!feed.src) desc = ""; // Google News descriptions only repeat the headline
    return { title, link, source, date: isNaN(d) ? null : d.toISOString(), summary: desc.slice(0, 400), lang: feed.lang || "en", feed: feed.id, official: feed.official || null };
  }).filter((x) => x.title && x.link);
}

const norm = (t) => t.toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim().slice(0, 70);

function enrich(items, kind, now) {
  const seen = new Map(), out = [];
  items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  for (const x of items) {
    const k = norm(x.title); if (!k) continue;
    if (seen.has(k)) { const kept = seen.get(k); if (kept && x.official && !kept.official) kept.official = x.official; continue; }
    seen.set(k, null);
    if (x.date && now - new Date(x.date) > (MAX_AGE_H[kind] || 192) * 36e5) continue;
    const text = x.title + " " + x.summary;
    const region = SEA.filter(([, re]) => re.test(text)).map(([n]) => n);
    const places = [...region, ...WORLD.filter(([, re]) => re.test(text)).map(([n]) => n)];
    const topics = TOPICS[kind].filter(([, re]) => re.test(text)).map(([n]) => n);
    if (kind === "breaking" ? !topics.length : kind !== "cyber" && !topics.length && !(x.official ? region.length : places.length)) continue;
    const ageH = x.date ? (now - new Date(x.date)) / 36e5 : 48;
    const high = HIGH[kind].test(text);
    const social = /facebook|tiktok|youtube|x\.com|twitter|instagram/i.test(x.source);
    const score = (social ? -2 : 0) + (x.official ? 1.5 : 0) + (high ? 3 : 0) + (region.length ? 3 : 0) + (region.includes("Thailand") ? 2 : 0) + topics.length * 0.5 + Math.max(0, 3 - ageH / 8);
    const item = { ...x, id: kind[0] + "-" + hash(k), places, topics, sea: region.length > 0, level: high ? (region.length ? "high" : "elevated") : region.length ? "elevated" : "info", score: +score.toFixed(2) };
    out.push(item); seen.set(k, item);
  }
  return out;
}
// Group near-duplicate stories (same event reported by many outlets) so one story = one card.
const STOP = new Set("news says said after with from that this over amid into their about more have been will what when could latest update report reports warns warning amid also than were while where which hits across amid could new first major latest after before against says".split(" "));
const GENERIC = new Set("data breach attack attacks cyber cyberattack ransomware hackers hacker hacked security vulnerability vulnerabilities exploit exploited flaw flaws critical patch threat actors malware lawsuit investigation class action exposes exposed customer customers military border clash clashes killed troops fighting flood floods storm typhoon earthquake heavy rain warns".split(" "));
const toks = (t) => new Set((t.toLowerCase().match(/[a-z0-9][a-z0-9-]{3,}/g) || []).filter((w) => !STOP.has(w)));
const grams = (t) => { const s = t.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""), g = new Set(); for (let i = 0; i < s.length - 2; i++) g.add(s.slice(i, i + 3)); return g; };
function similar(a, b) {
  let n = 0, ng = 0; for (const w of a.tk) if (b.tk.has(w)) { n++; if (!GENERIC.has(w)) ng++; }
  const jac = n / ((a.tk.size + b.tk.size - n) || 1);
  if ((ng >= 2 && jac >= 0.25) || ng >= 4) return true;
  if (a.lang === "th" || b.lang === "th") { let i = 0; for (const g of a.gr) if (b.gr.has(g)) i++; return i / (a.gr.size + b.gr.size - i || 1) >= 0.3; }
  return false;
}
function cluster(items) {
  const heads = [];
  for (const x of items) {
    x.tk = toks(x.title); x.gr = grams(x.title);
    const h = heads.find((h) => similar(h, x));
    if (h) { h.related.push({ title: x.title, link: x.link, source: x.source, date: x.date, official: x.official }); if (x.official && !h.official) h.official = x.official; h.size++; h.places = [...new Set([...h.places, ...x.places])]; h.topics = [...new Set([...h.topics, ...x.topics])]; if (x.date && (!h.date || x.date < h.date)) h.first = x.date; }
    else heads.push(Object.assign(x, { related: [], size: 1 }));
  }
  heads.forEach((h) => { delete h.tk; delete h.gr; h.related = h.related.slice(0, 6); h.score = +(h.score + Math.min(h.size - 1, 6) * 0.6).toFixed(2); });
  return heads;
}
function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }

function trends(items, kind, now) {
  const cnt = new Map();
  const add = (n, x) => { const c = cnt.get(n) || { term: n, count: 0, recent: 0, sea: 0 }; c.count++; if (x.date && now - new Date(x.date) < 6 * 36e5) c.recent++; if (x.sea) c.sea++; cnt.set(n, c); };
  items.forEach((x) => { x.topics.forEach((t) => add(t, x)); x.places.forEach((p) => add(p, x)); });
  const list = [...cnt.values()].map((c) => ({ ...c, kind: TOPICS[kind].some(([n]) => n === c.term) ? "topic" : "place" }));
  list.sort((a, b) => b.count + b.recent * 0.5 - (a.count + a.recent * 0.5));
  const hist = Array(24).fill(0);
  items.forEach((x) => { if (!x.date) return; const h = Math.floor((now - new Date(x.date)) / 36e5); if (h >= 0 && h < 24) hist[23 - h]++; });
  return { terms: list.slice(0, 10), hist };
}

async function stream(kind, now, errors) {
  const res = await Promise.allSettled(FEEDS[kind].map((f) => getText(f.url).catch((e) => { if (f.alt) return getText(f.alt); throw e; }).then((x) => parseRSS(x, f))));
  const all = [];
  res.forEach((r, i) => r.status === "fulfilled" ? all.push(...r.value) : errors.push(`${FEEDS[kind][i].id}: ${r.reason && r.reason.message}`));
  const flat = enrich(all, kind, now).sort((a, b) => b.score - a.score);
  const sources = [...new Set(flat.map((x) => x.source).filter(Boolean))].length;
  const tr = trends(flat, kind, now);
  const items = cluster(flat).sort((a, b) => b.score - a.score);
  const out = { count: flat.length, stories: items.length, sources, ...tr, outlets: outlets(flat, kind), items: items.slice(0, kind === "breaking" ? 60 : 50) };
  if (kind === "cyber") out.registry = registry(all, flat, res);
  if (kind === "breaking") out.items.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return out;
}

// Source directory for one topic: official agencies (always listed, even with no story today) then media outlets by volume.
function outlets(flat, kind) {
  const m = new Map();
  const add = (key, o) => { if (!m.has(key)) m.set(key, { ...o, count: 0, latest: null, ids: [] }); return m.get(key); };
  FEEDS[kind].filter((f) => f.official).forEach((f) => add("o:" + f.official, { name: f.official, official: true, home: f.home || null }));
  for (const x of flat) {
    const hit = [add("s:" + (x.source || "?").toLowerCase(), { name: x.source || "?", official: false, home: null })];
    if (x.official && m.has("o:" + x.official)) hit.push(m.get("o:" + x.official));
    for (const e of hit) {
      e.count++;
      if (!e.latest || String(x.date) > String(e.latest.date)) e.latest = { title: x.title, link: x.link, date: x.date, source: x.source };
    }
  }
  const list = [...m.values()].map(({ ids, ...o }) => o);
  const off = list.filter((o) => o.official), med = list.filter((o) => !o.official && o.name !== "?" && !/facebook|tiktok|youtube|instagram|twitter|^x$/i.test(o.name)).sort((a, b) => b.count - a.count || String(b.latest && b.latest.date).localeCompare(String(a.latest && a.latest.date)));
  return [...off, ...med.slice(0, 14)];
}

// Every source in the Cyber Threat reference list, with how many stories it had in the window and its latest item.
function registry(all, flat, res) {
  return CYBER_REF.map(([no, cat, name, publisher, url, info, use, lang, caveat]) => {
    const fi = FEEDS.cyber.findIndex((f) => f.ref === no), f = FEEDS.cyber[fi];
    const raw = f ? all.filter((x) => x.feed === f.id).sort((a, b) => String(b.date).localeCompare(String(a.date))) : [];
    const count = raw.filter((x) => x.date && Date.now() - new Date(x.date) < MAX_AGE_H.cyber * 36e5).length;
    const l = raw[0];
    return { no, cat, name, publisher, url, info, use, lang, caveat, feed: !!f, ok: f ? res[fi].status === "fulfilled" : null, count,
      latest: l ? { title: l.title, link: l.link, date: l.date } : null };
  });
}

async function kev(errors) {
  try {
    const j = JSON.parse(await getText(KEV_URL));
    return (j.vulnerabilities || []).sort((a, b) => String(b.dateAdded).localeCompare(String(a.dateAdded))).slice(0, 10)
      .map((v) => ({ cve: v.cveID, vendor: v.vendorProject, product: v.product, name: v.vulnerabilityName, added: v.dateAdded, due: v.dueDate, ransomware: v.knownRansomwareCampaignUse === "Known", action: v.requiredAction, url: `https://nvd.nist.gov/vuln/detail/${v.cveID}` }));
  } catch (e) { errors.push(`cisa-kev: ${e.message}`); return []; }
}
async function epss(list, errors) {
  if (!list.length) return list;
  try {
    const j = JSON.parse(await getText("https://api.first.org/data/v1/epss?cve=" + list.map((v) => v.cve).join(",")));
    const m = new Map((j.data || []).map((d) => [d.cve, d]));
    list.forEach((v) => { const d = m.get(v.cve); if (d) { v.epss = +d.epss; v.epss_pct = +d.percentile; } });
  } catch (e) { errors.push(`epss: ${e.message}`); }
  return list;
}

export default async function handler(req, res) {
  const now = Date.now(), errors = [];
  const [conflict, cyber, disaster, breaking, kevList] = await Promise.all([stream("conflict", now, errors), stream("cyber", now, errors), stream("disaster", now, errors), stream("breaking", now, errors), kev(errors).then((l) => epss(l, errors))]);
  cyber.kev = kevList;
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=900");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({ updated: new Date(now).toISOString(), refresh_seconds: 300, conflict, cyber, disaster, breaking, errors });
}
