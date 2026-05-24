// data.jsx — seed data for the BCM Portal
// Realistic-looking but entirely fictional names, units, locations.

// Business units (acronyms supplied by the customer)
const BUSINESS_UNITS = [
  "SCGC",   // Chemicals
  "SCGP",   // Packaging
  "CBM",    // Cement & Building Materials
  "SCGD",   // Distribution
  "Corporate / Shared",
];

const BU_META = {
  SCGC:  { name: "Chemicals",                color: "#1d4ed8", soft: "#e6edff", abbr: "SCGC" },
  SCGP:  { name: "Packaging",                color: "#0d9488", soft: "#d6f3ee", abbr: "SCGP" },
  CBM:   { name: "Cement & Building",         color: "#a85a00", soft: "#fce8c8", abbr: "CBM"  },
  SCGD:  { name: "Distribution",             color: "#7c3aed", soft: "#efe9ff", abbr: "SCGD" },
  "Corporate / Shared": { name: "Corporate", color: "#475569", soft: "#e5e8ee", abbr: "Corporate" },
};

const BCM_ROLES = ["CMC", "BMT", "LMT"];

const APP_KEYS = [
  { key: "IM",    name: "Intelligence Map" },
  { key: "IMAP",  name: "Incident Management" },
  { key: "EWS",   name: "Early Warning" },
  { key: "PORTAL",name: "Portal" },
];

const SEED_USERS = [
  { id:"U-1001", first:"Anchalee",  last:"Suriyawong",   bu:"Corporate / Shared",  mobile:"+66 81 234 5678", email:"anchalee.s@bcm.example",     role:"CMC", apps:["IM","IMAP","EWS","PORTAL"], lat:13.7563, lng:100.5018, status:"on-call" },
  { id:"U-1002", first:"Krit",      last:"Phongphan",    bu:"SCGC",                mobile:"+66 89 112 4488", email:"krit.p@bcm.example",         role:"BMT", apps:["IMAP","EWS","PORTAL"],      lat:12.7235, lng:101.1410, status:"active" },
  { id:"U-1003", first:"Suchada",   last:"Wattanachai",  bu:"SCGP",                mobile:"+66 84 556 2210", email:"suchada.w@bcm.example",      role:"LMT", apps:["IMAP","PORTAL"],            lat:13.1735, lng:100.9270, status:"active" },
  { id:"U-1004", first:"Niran",     last:"Chaiyaporn",   bu:"SCGC",                mobile:"+66 86 998 1144", email:"niran.c@bcm.example",        role:"BMT", apps:["IM","IMAP","PORTAL"],       lat:12.7180, lng:101.1530, status:"active" },
  { id:"U-1005", first:"Pim",       last:"Rojanasak",    bu:"SCGD",                mobile:"+66 81 770 3322", email:"pim.r@bcm.example",          role:"LMT", apps:["PORTAL"],                    lat:13.7460, lng:100.5340, status:"away" },
  { id:"U-1006", first:"David",     last:"Hartwell",     bu:"CBM",                 mobile:"+66 82 411 5566", email:"david.h@bcm.example",        role:"CMC", apps:["IM","EWS","PORTAL"],         lat:14.5290, lng:100.9100, status:"active" },
  { id:"U-1007", first:"Mayuree",   last:"Intaphan",     bu:"Corporate / Shared",  mobile:"+66 88 220 9012", email:"mayuree.i@bcm.example",      role:"BMT", apps:["IM","IMAP","EWS","PORTAL"], lat:13.7244, lng:100.5283, status:"active" },
  { id:"U-1008", first:"Suresh",    last:"Iyer",         bu:"SCGP",                mobile:"+66 89 003 6645", email:"suresh.i@bcm.example",       role:"LMT", apps:["IMAP","PORTAL"],            lat:14.3650, lng:100.5780, status:"active" },
  { id:"U-1009", first:"Arada",     last:"Boonprasert",  bu:"Corporate / Shared",  mobile:"+66 81 668 9920", email:"arada.b@bcm.example",        role:"BMT", apps:["IMAP","EWS","PORTAL"],      lat:13.7650, lng:100.5380, status:"active" },
  { id:"U-1010", first:"Phongsak",  last:"Tantithanon",  bu:"CBM",                 mobile:"+66 87 553 1188", email:"phongsak.t@bcm.example",     role:"LMT", apps:["EWS","PORTAL"],              lat:14.5320, lng:100.9210, status:"on-call" },
  { id:"U-1011", first:"Lalita",    last:"Charoenchai",  bu:"Corporate / Shared",  mobile:"+66 81 444 7710", email:"lalita.c@bcm.example",       role:"CMC", apps:["IM","IMAP","EWS","PORTAL"], lat:13.7568, lng:100.5022, status:"active" },
  { id:"U-1012", first:"Wirat",     last:"Sutthichai",   bu:"SCGD",                mobile:"+66 81 990 3344", email:"wirat.s@bcm.example",        role:"BMT", apps:["IMAP","PORTAL"],            lat:13.1810, lng:100.9305, status:"away" },
];

// Operational sites — these are what the Operations Map drills into.
// status: green (Normal) | yellow (Monitoring) | red (Critical)
// radius_km drives the impact-zone ring color band:
//   > 20km  → green  (safe perimeter / cold zone)
//   10–20km → yellow (monitoring / warm zone)
//    1–10km → red    (critical / hot zone)
const SEED_SITES = [
  { id:"S-RYG", bu:"SCGC", name:"Rayong Chemicals Complex",         short:"Rayong Complex",  type:"Plant",     lat:12.7240, lng:101.1450, status:"red",    radius_km:  8, headcount: 1840, incidents:[{ id:"INC-2041", sev:"P2", title:"Cooling tower pressure anomaly · Unit 3", started:"08:14" }], advisories: 2, contact:"Krit Phongphan", phone:"+66 89 112 4488" },
  { id:"S-LCB", bu:"SCGC", name:"Laem Chabang Specialty",           short:"Laem Chabang",    type:"Plant",     lat:13.0850, lng:100.8830, status:"green",  radius_km: 22, headcount: 620,  incidents:[], advisories: 0, contact:"Niran Chaiyaporn", phone:"+66 86 998 1144" },
  { id:"S-WSL", bu:"SCGP", name:"Wangsala Packaging Mill",          short:"Wangsala Mill",   type:"Mill",      lat:13.1750, lng:100.9290, status:"yellow", radius_km: 14, headcount: 410,  incidents:[], advisories: 1, contact:"Suchada Wattanachai", phone:"+66 84 556 2210" },
  { id:"S-AYU", bu:"SCGP", name:"Ayutthaya Containerboard",         short:"Ayutthaya",       type:"Mill",      lat:14.3650, lng:100.5780, status:"green",  radius_km: 21, headcount: 280,  incidents:[], advisories: 0, contact:"Suresh Iyer", phone:"+66 89 003 6645" },
  { id:"S-SAR", bu:"CBM",  name:"Saraburi Cement Works",            short:"Saraburi",        type:"Cement",    lat:14.5290, lng:100.9100, status:"yellow", radius_km: 18, headcount: 1120, incidents:[{ id:"INC-2039", sev:"P3", title:"Quarry conveyor downtime", started:"yest. 22:10" }], advisories: 1, contact:"David Hartwell", phone:"+66 82 411 5566" },
  { id:"S-LBR", bu:"CBM",  name:"Lampang Building Materials",       short:"Lampang BM",      type:"Quarry",    lat:18.2880, lng:99.4920,  status:"green",  radius_km: 23, headcount: 360,  incidents:[], advisories: 0, contact:"Phongsak T.", phone:"+66 87 553 1188" },
  { id:"S-BKK", bu:"SCGD", name:"Bangkok Distribution Hub",         short:"BKK Hub",         type:"DC",        lat:13.7460, lng:100.5340, status:"green",  radius_km: 24, headcount: 240,  incidents:[], advisories: 0, contact:"Pim Rojanasak", phone:"+66 81 770 3322" },
  { id:"S-HYI", bu:"SCGD", name:"Hat Yai Regional DC",              short:"Hat Yai DC",      type:"DC",        lat:7.0086,  lng:100.4747, status:"green",  radius_km: 22, headcount: 180,  incidents:[], advisories: 0, contact:"Wirat S.",        phone:"+66 81 990 3344" },
  { id:"S-HQ",  bu:"Corporate / Shared", name:"Corporate Headquarters", short:"Corporate HQ",  type:"Office",    lat:13.7568, lng:100.5022, status:"green",  radius_km: 25, headcount: 950,  incidents:[], advisories: 0, contact:"Lalita C.",       phone:"+66 81 444 7710" },
];

const STATUS_META = {
  green:  { label:"Normal",     color:"#117a4b", soft:"#def3e6", ring:"rgba(17,122,75,.22)" },
  yellow: { label:"Monitoring", color:"#a85a00", soft:"#fce8c8", ring:"rgba(168,90,0,.22)" },
  red:    { label:"Critical",   color:"#b3261e", soft:"#fbe1de", ring:"rgba(179,38,30,.28)" },
};

// Radius bands — visualization rules for the impact-zone circle on the map.
const RADIUS_BANDS = [
  { id:"red",    label:"Critical zone",   min: 1,  max: 10, color:"#b3261e", soft:"rgba(179,38,30,.18)", note:"1–10 km · immediate impact" },
  { id:"yellow", label:"Monitoring zone", min: 10, max: 20, color:"#a85a00", soft:"rgba(168,90,0,.16)",  note:"10–20 km · caution"        },
  { id:"green",  label:"Safe perimeter",  min: 20, max: 999,color:"#117a4b", soft:"rgba(17,122,75,.14)", note:"> 20 km · normal operations" },
];
const bandForRadius = (km) => RADIUS_BANDS.find(b => km > b.min - 0.0001 && km <= b.max) || RADIUS_BANDS[0];

const SEED_DOCUMENTS = [
  // Group-level corporate documents
  {
    kind: "POL", code:"Policy", bu:"Corporate / Shared",
    title:"Business Continuity Policy",
    desc:"Group-wide policy framework defining BCM governance, roles, and review cadence.",
    version:"v4.2", owner:"CMC Office", updated:"2026-03-12", size:"1.4 MB", pages: 18, classification:"Internal",
    revisions:[
      { v:"v4.2", date:"2026-03-12", note:"Annual review · approved by CMC" },
      { v:"v4.1", date:"2025-09-04", note:"Aligned with ISO 22301:2019 clause 5" },
      { v:"v4.0", date:"2024-11-22", note:"Reissued under new governance" },
    ],
  },
  {
    kind: "EMP", code:"EmergencyPlan", bu:"Corporate / Shared",
    title:"Group Emergency Response Plan",
    desc:"Group-level master plan for fire, spill, security and medical incidents — with escalation paths.",
    version:"v7.0", owner:"HSE / CMC", updated:"2026-04-28", size:"6.8 MB", pages: 84, classification:"Restricted",
    revisions:[
      { v:"v7.0", date:"2026-04-28", note:"New muster points · Rayong complex" },
      { v:"v6.4", date:"2026-01-15", note:"Updated contact tree" },
      { v:"v6.3", date:"2025-08-09", note:"Cyber-incident annex added" },
    ],
  },
  {
    kind: "BCP", code:"BCP", bu:"Corporate / Shared",
    title:"Group Business Continuity Plan",
    desc:"Recovery strategies, RTO/RPO targets and resumption procedures for each critical business process.",
    version:"v5.3", owner:"CMC Office", updated:"2026-02-19", size:"3.2 MB", pages: 47, classification:"Confidential",
    revisions:[
      { v:"v5.3", date:"2026-02-19", note:"Updated supplier dependencies" },
      { v:"v5.2", date:"2025-11-30", note:"RTO revised for Trading" },
      { v:"v5.1", date:"2025-06-04", note:"Annual exercise findings closed" },
    ],
  },

  // SCGC — Chemicals
  { kind:"POL", bu:"SCGC", title:"Chemicals HSE Policy",          desc:"Hazardous-materials handling, MOC, and PSM expectations for chemicals sites.", version:"v3.1", owner:"SCGC HSE", updated:"2026-01-20", size:"980 KB", pages:14, classification:"Internal",
    revisions:[ {v:"v3.1",date:"2026-01-20",note:"Updated MOC threshold"},{v:"v3.0",date:"2025-05-11",note:"Aligned with corp policy v4.0"} ] },
  { kind:"EMP", bu:"SCGC", title:"Rayong Complex ERP",            desc:"Site-specific emergency response — fire, vapor cloud, marine spill, evacuation muster.", version:"v6.4", owner:"Rayong Plant", updated:"2026-04-12", size:"12.1 MB", pages:128, classification:"Restricted",
    revisions:[ {v:"v6.4",date:"2026-04-12",note:"New marine spill annex"},{v:"v6.3",date:"2025-12-02",note:"Muster points revised"} ] },
  { kind:"BCP", bu:"SCGC", title:"Chemicals BCP",                 desc:"Resumption strategy for cracker, polymer and specialty units. RTO 24–72h tiered.", version:"v4.1", owner:"SCGC BMT", updated:"2026-03-04", size:"4.6 MB", pages:62, classification:"Confidential",
    revisions:[ {v:"v4.1",date:"2026-03-04",note:"Q1 supply-chain review"},{v:"v4.0",date:"2025-08-10",note:"Cracker RTO revised"} ] },

  // SCGP — Packaging
  { kind:"POL", bu:"SCGP", title:"Packaging Operational Policy",  desc:"Mill operating governance and crisis-escalation policy.", version:"v2.2", owner:"SCGP CMC", updated:"2026-02-08", size:"640 KB", pages:9, classification:"Internal",
    revisions:[ {v:"v2.2",date:"2026-02-08",note:"Annual update"},{v:"v2.1",date:"2025-07-21",note:"Added supplier clause"} ] },
  { kind:"EMP", bu:"SCGP", title:"Wangsala Mill ERP",             desc:"Mill-floor emergency procedures, chemical pulp containment and evacuation.", version:"v5.2", owner:"Wangsala Site", updated:"2026-03-30", size:"5.4 MB", pages:71, classification:"Restricted",
    revisions:[ {v:"v5.2",date:"2026-03-30",note:"Updated chlorine handling"},{v:"v5.1",date:"2025-10-04",note:"Drill outcomes incorporated"} ] },
  { kind:"BCP", bu:"SCGP", title:"Packaging BCP",                 desc:"Recovery for mill and converting operations across Wangsala and Ayutthaya.", version:"v3.5", owner:"SCGP BMT", updated:"2026-01-29", size:"2.8 MB", pages:38, classification:"Confidential",
    revisions:[ {v:"v3.5",date:"2026-01-29",note:"Ayutthaya tier-2 added"},{v:"v3.4",date:"2025-09-14",note:"Routine review"} ] },

  // CBM — Cement & Building Materials
  { kind:"POL", bu:"CBM",  title:"CBM Quarry Safety Policy",       desc:"Quarry blasting, dust and traffic-management policies.", version:"v2.0", owner:"CBM HSE", updated:"2025-11-04", size:"540 KB", pages:8,  classification:"Internal",
    revisions:[ {v:"v2.0",date:"2025-11-04",note:"Reissued"},{v:"v1.9",date:"2024-12-15",note:"Annual update"} ] },
  { kind:"EMP", bu:"CBM",  title:"Saraburi Cement ERP",            desc:"Kiln upset, dust release, conveyor incident response procedures.", version:"v4.7", owner:"Saraburi Site", updated:"2026-04-02", size:"7.2 MB", pages:90, classification:"Restricted",
    revisions:[ {v:"v4.7",date:"2026-04-02",note:"Conveyor lockout updated"},{v:"v4.6",date:"2025-11-22",note:"Routine review"} ] },
  { kind:"BCP", bu:"CBM",  title:"Cement & Building BCP",          desc:"Alternate sourcing & kiln-down recovery for Saraburi and Lampang.", version:"v3.2", owner:"CBM BMT", updated:"2026-02-25", size:"3.1 MB", pages:42, classification:"Confidential",
    revisions:[ {v:"v3.2",date:"2026-02-25",note:"Logistics dependencies"},{v:"v3.1",date:"2025-08-30",note:"Lampang tier-2 added"} ] },

  // SCGD — Distribution
  { kind:"POL", bu:"SCGD", title:"Distribution Operating Policy",  desc:"DC operating standards and incident-escalation policy.", version:"v1.8", owner:"SCGD CMC", updated:"2025-10-19", size:"480 KB", pages:7,  classification:"Internal",
    revisions:[ {v:"v1.8",date:"2025-10-19",note:"Routine update"},{v:"v1.7",date:"2025-04-09",note:"Cyber annex"} ] },
  { kind:"EMP", bu:"SCGD", title:"BKK Hub ERP",                    desc:"Warehouse fire, fork-lift incident, security breach procedures.", version:"v3.9", owner:"BKK Hub", updated:"2026-03-15", size:"3.4 MB", pages:48, classification:"Restricted",
    revisions:[ {v:"v3.9",date:"2026-03-15",note:"Fire panel SOP"},{v:"v3.8",date:"2025-10-01",note:"Drill outcomes"} ] },
  { kind:"BCP", bu:"SCGD", title:"Distribution BCP",               desc:"Re-routing, mutual aid and cold-storage continuity strategies.", version:"v2.7", owner:"SCGD BMT", updated:"2026-01-11", size:"1.9 MB", pages:29, classification:"Confidential",
    revisions:[ {v:"v2.7",date:"2026-01-11",note:"Mutual-aid agreement"},{v:"v2.6",date:"2025-07-28",note:"Hat Yai tier-2 added"} ] },
];

const SEED_APPS = [
  {
    code:"IM", name:"Intelligence Map",
    desc:"Geospatial situational-awareness layer — live threats, asset positions, perimeter events, weather overlays.",
    badge:"IM", accent:"#7c3aed", bg:"#efe9ff",
    status:"operational",
    stats:[ { v:"24/7", l:"Coverage" }, { v:"3.1k", l:"Assets tracked" }, { v:"12", l:"Active feeds" } ],
    url:"#",
  },
  {
    code:"EWS", name:"Early Warning System",
    desc:"Multi-source alerting for natural hazards, civil unrest, supply-chain disruption — with rules-based escalation.",
    badge:"EW", accent:"#a85a00", bg:"#fce8c8",
    status:"operational",
    stats:[ { v:"7", l:"Live advisories" }, { v:"P95", l:"< 90s notify" }, { v:"42", l:"Watch zones" } ],
    url:"#",
  },
  {
    code:"IMAP", name:"Incident Management Platform",
    desc:"Declare, triage and run incidents end-to-end. Workstreams, action logs, comms, sit-reps and after-action.",
    badge:"IM", accent:"#1d4ed8", bg:"#e6edff",
    status:"operational",
    stats:[ { v:"3", l:"Open incidents" }, { v:"118", l:"YTD closed" }, { v:"0", l:"Severity-1" } ],
    url:"#",
  },
  {
    code:"CT", name:"Call Tree",
    desc:"Cascading voice + SMS notification with read-receipts and auto-fallback paths for unreachable contacts.",
    badge:"CT", accent:"#117a4b", bg:"#def3e6",
    status:"operational",
    stats:[ { v:"1,284", l:"Contacts" }, { v:"31", l:"Tree templates" }, { v:"99.4%", l:"Reach (30d)" } ],
    url:"#",
  },
  {
    code:"SOS", name:"International SOS",
    desc:"Traveller tracking, medical & security assistance, country risk briefings, and 24/7 case management.",
    badge:"IS", accent:"#b3261e", bg:"#fbe1de",
    status:"degraded",
    stats:[ { v:"46", l:"Travellers" }, { v:"11", l:"Countries" }, { v:"1", l:"Open case" } ],
    url:"#",
  },
];

const SEED_ACTIVITY = [
  { when:"09:42", who:"K. Phongphan",    msg:"declared incident", target:"Tank-7 isolation drill" , tone:"warn" },
  { when:"09:18", who:"EWS",             msg:"raised advisory",   target:"Tropical depression · Gulf of Thailand", tone:"warn" },
  { when:"08:55", who:"A. Boonprasert",  msg:"uploaded revision", target:"Emergency Response Plan v7.0", tone:"info" },
  { when:"08:31", who:"L. Charoenchai",  msg:"acknowledged",      target:"Call-tree test (Q2)", tone:"ok" },
  { when:"yest.", who:"D. Hartwell",     msg:"added user",        target:"Niran Chaiyaporn (BMT)", tone:"info" },
  { when:"yest.", who:"International SOS",msg:"degraded service", target:"API latency > 4s · advisory", tone:"warn" },
];

const SEED_INCIDENTS = [
  {
    id:"ICS-20260503-7988",
    subject:"Saraburi industrial zone — monsoon flooding",
    title_th:"น้ำท่วม", title_en:"Flooding",
    type:"Natural — Flood",
    risk_type:"Natural",
    severity:"P2", status:"active",
    started:"2026-05-03 06:14",
    location_th:"นิคมอุตสาหกรรม สระบุรี", location_en:"Saraburi industrial zone",
    lat: 14.5290, lng: 100.9100,
    site: "S-SAR",
    bu: "CBM",
    emergency_plan: { id:"ERP-FLOOD-001", name:"ERP · Flood response — Saraburi" },
    incharge_uid: "U-1006",
    op_period: "Op Period 4 · 12:00 → 24:00",
    objectives: [
      "Protect life safety; complete evacuation of low-lying admin block.",
      "Stabilise quarry haul roads & prevent silt runoff into Pa Sak river.",
      "Maintain kiln line 2 operations at reduced rate until 16:00 cut-off.",
      "Coordinate with provincial DDPM and mutual-aid partners.",
    ],
  },
  {
    id:"ICS-20260512-1042",
    subject:"Bangkok hub — warehouse Bay 4 fire",
    title_th:"ไฟไหม้คลังสินค้า", title_en:"Warehouse fire",
    type:"Fire", risk_type:"Man-Made",
    severity:"P3", status:"contained",
    started:"2026-05-12 22:01",
    location_en:"BKK Hub · Bay 4", lat:13.7460, lng:100.5340, site:"S-BKK", bu:"SCGD",
    emergency_plan: { id:"ERP-FIRE-014", name:"ERP · Warehouse fire — Bay-level" },
    incharge_uid: "U-1010",
  },
  {
    id:"ICS-20260514-2207",
    subject:"Group-wide ransomware indicators",
    title_th:"ระบบไอที", title_en:"IT cyber alert",
    type:"Cyber", risk_type:"Man-Made",
    severity:"P3", status:"monitoring",
    started:"2026-05-14 08:30",
    location_en:"All units", lat:13.7568, lng:100.5022, site:"S-HQ", bu:"Corporate / Shared",
    emergency_plan: { id:"ERP-CYB-002", name:"ERP · Cyber incident response" },
    incharge_uid: "U-1011",
  },
  {
    id:"ICS-20260513-3318",
    subject:"Rayong — Unit 3 chemical release",
    title_th:"สารเคมีรั่ว", title_en:"Chemical release",
    type:"HazMat", risk_type:"Man-Made",
    severity:"P2", status:"active",
    started:"2026-05-13 08:14",
    location_en:"Rayong Complex · Unit 3", lat:12.7240, lng:101.1450, site:"S-RYG", bu:"SCGC",
    emergency_plan: { id:"ERP-HAZ-007", name:"ERP · HazMat — chemical release" },
    incharge_uid: "U-1009",
  },
  {
    id:"ICS-20260515-0805",
    subject:"Sriracha — civil disturbance at gate",
    title_th:"การชุมนุม", title_en:"Civil disturbance",
    type:"Security", risk_type:"Man-Made",
    severity:"P4", status:"active",
    started:"2026-05-15 07:42",
    location_en:"Sriracha area", lat:13.1750, lng:100.9290, site:"S-WSL", bu:"SCGP",
    emergency_plan: { id:"ERP-SEC-003", name:"ERP · Civil disturbance & site security" },
    incharge_uid: "U-1007",
  },
  {
    id:"ICS-20260418-0411",
    subject:"Avian flu cluster — Saraburi province",
    title_th:"การระบาดของโรค", title_en:"Pandemic surveillance",
    type:"Health — Avian flu", risk_type:"Pandemic",
    severity:"P3", status:"monitoring",
    started:"2026-04-18 09:00",
    location_en:"Saraburi / Lopburi cluster", lat:14.5290, lng:100.9100, site:"S-SAR", bu:"Corporate / Shared",
    emergency_plan: { id:"ERP-PAN-001", name:"ERP · Pandemic & infectious disease" },
    incharge_uid: "U-1002",
  },
];

// ICS positions — what slots exist in the chart, in display order
const ICS_POSITIONS = [
  { id:"IC",     label:"Incident Commander", tier:"top",      tone:"command",
    units:["Establish overall strategy","Approve Incident Action Plan","Authorise resource requests"] },
  { id:"SO",     label:"Safety Officer",      tier:"command",  tone:"command",
    units:["Monitor on-scene hazards","Halt unsafe operations"] },
  { id:"LO",     label:"Liaison Officer",     tier:"command",  tone:"command",
    units:["Government & mutual-aid coordination","DDPM liaison"] },
  { id:"PIO",    label:"Public Info Officer", tier:"command",  tone:"command",
    units:["External communications","Media holding statements"] },
  { id:"OPS",    label:"Operations",          tier:"section",  tone:"ops",
    units:["Staging Area","Rescue Group","Medical Group"] },
  { id:"PLAN",   label:"Planning",            tier:"section",  tone:"plan",
    units:["Resources Unit","Situation Unit","Demob Unit"] },
  { id:"LOG",    label:"Logistics",           tier:"section",  tone:"log",
    units:["Comms","Medical (Rehab)","Facilities"] },
  { id:"FIN",    label:"Finance & Admin",     tier:"section",  tone:"fin",
    units:["Time Unit","Procurement"] },
];

// Default chart assignments for the active incident (ICS-20260503-7988 · Saraburi flood)
const ICS_ASSIGNMENTS = {
  IC:   { uid:"U-1006", role:"Incident Commander",       phone:"+66 82 411 5566" },
  SO:   { uid:"U-1009", role:"Safety Officer",            phone:"+66 81 668 9920" },
  LO:   { uid:"U-1011", role:"Liaison Officer",           phone:"+66 81 444 7710" },
  PIO:  { uid:"U-1007", role:"Public Information Officer",phone:"+66 88 220 9012" },
  OPS:  { uid:"U-1010", role:"Operations Section Chief",  phone:"+66 87 553 1188" },
  PLAN: { uid:"U-1001", role:"Planning Section Chief",    phone:"+66 81 234 5678" },
  LOG:  { uid:"U-1002", role:"Logistics Section Chief",   phone:"+66 89 112 4488" },
  FIN:  { uid:"U-1004", role:"Finance & Admin Chief",     phone:"+66 86 998 1144" },
};

const ICS_CHECKINS = [
  { id:"R-001", time:"06:18", first:"David",   last:"Hartwell",     role:"IC",   zone:"Command Post",     status:"in",  phone:"+66 82 411 5566" },
  { id:"R-002", time:"06:22", first:"Arada",   last:"Boonprasert",  role:"SO",   zone:"Command Post",     status:"in",  phone:"+66 81 668 9920" },
  { id:"R-003", time:"06:31", first:"Lalita",  last:"Charoenchai",  role:"LO",   zone:"Command Post",     status:"in",  phone:"+66 81 444 7710" },
  { id:"R-004", time:"06:44", first:"Mayuree", last:"Intaphan",     role:"PIO",  zone:"Media Holding",    status:"in",  phone:"+66 88 220 9012" },
  { id:"R-005", time:"07:02", first:"Phongsak",last:"Tantithanon",  role:"OPS",  zone:"Staging Area · A", status:"in",  phone:"+66 87 553 1188" },
  { id:"R-006", time:"07:09", first:"Anchalee",last:"Suriyawong",   role:"PLAN", zone:"Planning Room",    status:"in",  phone:"+66 81 234 5678" },
  { id:"R-007", time:"07:14", first:"Krit",    last:"Phongphan",    role:"LOG",  zone:"Logistics Depot",  status:"in",  phone:"+66 89 112 4488" },
  { id:"R-008", time:"07:18", first:"Niran",   last:"Chaiyaporn",   role:"FIN",  zone:"Command Post",     status:"in",  phone:"+66 86 998 1144" },
  { id:"R-009", time:"07:31", first:"Suchada", last:"Wattanachai",  role:"Rescue Group", zone:"Field — Sector 2", status:"in", phone:"+66 84 556 2210" },
  { id:"R-010", time:"07:38", first:"Suresh",  last:"Iyer",         role:"Medical Group", zone:"Triage Tent",   status:"in", phone:"+66 89 003 6645" },
  { id:"R-011", time:"08:04", first:"Pim",     last:"Rojanasak",    role:"Demob Unit",   zone:"Off-site",        status:"out", phone:"+66 81 770 3322" },
];

const ICS_LOGS = [
  { t:"15:42", who:"OPS",  level:"info", msg:"Rescue Group · Sector 2 cleared; 14 evacuated to muster B." },
  { t:"15:28", who:"PLAN", level:"info", msg:"Updated situation map · river gauge +0.4m in last hour." },
  { t:"15:10", who:"IC",   level:"decision", msg:"Authorised reduced-rate operation of Kiln Line 2 until 16:00." },
  { t:"14:51", who:"SO",   level:"warn", msg:"Two access roads flagged unsafe for heavy vehicles." },
  { t:"14:32", who:"LO",   level:"info", msg:"DDPM provincial liaison joined Command Post (Mr. Suthep)." },
  { t:"14:05", who:"LOG",  level:"info", msg:"Comms · backup satellite link tested OK." },
  { t:"13:48", who:"FIN",  level:"info", msg:"Procurement · 800 sandbags from mutual-aid · ETA 16:30." },
  { t:"13:22", who:"PIO",  level:"info", msg:"Holding statement issued to regional press." },
  { t:"12:00", who:"IC",   level:"decision", msg:"Op Period 4 commenced. Objectives published." },
  { t:"11:14", who:"OPS",  level:"warn", msg:"Quarry haul road C closed due to washout." },
];


window.BCM = {
  BUSINESS_UNITS, BU_META, BCM_ROLES, APP_KEYS,
  SEED_USERS, SEED_DOCUMENTS, SEED_APPS, SEED_ACTIVITY, SEED_SITES, STATUS_META,
  SEED_INCIDENTS, ICS_POSITIONS, ICS_ASSIGNMENTS, ICS_CHECKINS, ICS_LOGS,
  RADIUS_BANDS, bandForRadius,
};
