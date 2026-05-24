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
  { id:"S-001", bu:"SCGC", name:"Thai Polyethylene Co., Ltd.", short:"Thai Polyethylene", type:"Site", lat:12.699947, lng:101.134789, status:"green", radius_km:20, headcount:304, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-002", bu:"SCGC", name:"Thai Polypropylene Co., Ltd.", short:"Thai Polypropylene", type:"Site", lat:12.705651, lng:101.136249, status:"green", radius_km:26, headcount:918, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-003", bu:"SCGC", name:"Rayong Olefins Co., Ltd.", short:"Rayong Olefins", type:"Site", lat:12.721805, lng:101.152084, status:"green", radius_km:26, headcount:646, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-004", bu:"SCGC", name:"Map Ta Phut Tank Terminal Co., Ltd.", short:"Map Ta Phut Tank Terminal", type:"Terminal", lat:12.66088, lng:101.154917, status:"green", radius_km:20, headcount:208, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-005", bu:"SCGC", name:"Rayong Pipeline Co., Ltd. (**)", short:"Rayong Pipeline", type:"Pipeline", lat:12.749191, lng:101.106491, status:"green", radius_km:25, headcount:1477, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-006", bu:"SCGC", name:"Thai Plastic and Chemicals Public Company Limited", short:"Thai Plastic and Chemicals", type:"Site", lat:13.644016, lng:100.538364, status:"green", radius_km:24, headcount:1668, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-007", bu:"SCGC", name:"Rayong Engineering & Plant Service Co., Ltd. (**)", short:"Rayong Engineering & Plant Ser…", type:"Plant", lat:12.748605, lng:101.107864, status:"green", radius_km:22, headcount:1410, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-008", bu:"SCGC", name:"Flowlab & Service Co., Ltd.", short:"Flowlab & Service", type:"Site", lat:12.726396, lng:101.145848, status:"green", radius_km:22, headcount:170, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-009", bu:"SCGC", name:"Protech Outsourcing Co., Ltd.", short:"Protech Outsourcing", type:"Site", lat:12.715175, lng:101.160603, status:"green", radius_km:21, headcount:1505, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-010", bu:"SCGC", name:"RIL 1996 Co., Ltd. (**)", short:"RIL 1996", type:"Site", lat:12.75492, lng:101.164057, status:"green", radius_km:21, headcount:1137, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-011", bu:"SCGC", name:"Map Ta Phut Olefins", short:"Map Ta Phut Olefins", type:"Site", lat:12.69163, lng:101.14603, status:"green", radius_km:26, headcount:1806, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-012", bu:"SCGC", name:"Thai MFC Co., Ltd.", short:"Thai MFC", type:"Site", lat:12.68684, lng:101.133019, status:"green", radius_km:26, headcount:326, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-013", bu:"SCGC", name:"Grand Siam Composites Co., Ltd.", short:"Grand Siam Composites", type:"Site", lat:12.681396, lng:101.281626, status:"green", radius_km:26, headcount:774, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-014", bu:"SCGC", name:"Thai MMA Co., Ltd. (พี.ซี.แอนด์ เค.โอ.เอนจีเนียริ่ง สาขาระยอง)", short:"Thai MMA", type:"Site", lat:12.726322, lng:101.145802, status:"green", radius_km:21, headcount:1729, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-015", bu:"SCGC", name:"Siam Synthetic Latex ", short:"Siam Synthetic Latex", type:"Site", lat:12.698231, lng:101.151093, status:"green", radius_km:27, headcount:919, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-016", bu:"SCGC", name:"Siam Polystyrene Co., Ltd.", short:"Siam Polystyrene", type:"Site", lat:12.730339, lng:101.139088, status:"green", radius_km:20, headcount:496, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-017", bu:"SCGC", name:"The Nawaplastic Industries (Saraburi) Co., Ltd.", short:"The Nawaplastic Industries", type:"Site", lat:14.374036, lng:100.836685, status:"red", radius_km:8, headcount:682, incidents:[{ id:"INC-2000017", sev:"P2", title:"Operational anomaly under investigation", started:"today" }], advisories:2, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-018", bu:"SCGC", name:"Total Plant Service Co., Ltd. (Thai Plastic and Chemical Public Company Limited)", short:"Total Plant Service", type:"Plant", lat:13.644016, lng:100.538364, status:"green", radius_km:24, headcount:1428, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-019", bu:"SCGC", name:"Total Plant Service Co., Ltd. (Rayong)", short:"Total Plant Service", type:"Plant", lat:12.70421, lng:101.142068, status:"green", radius_km:27, headcount:1599, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-020", bu:"SCGC", name:"Thainam Plastic Public Company Limited", short:"Thainam Plastic", type:"Site", lat:13.706793, lng:100.311391, status:"green", radius_km:22, headcount:1466, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-021", bu:"CBM", name:"โรงงานคอนกรีตซีแพค (บ.ปูนซีเมนต์ไทย จำกัด (มหาชน))", short:"โรงงานคอนกรีตซีแพค )", type:"Factory", lat:18.66846, lng:99.05068, status:"green", radius_km:20, headcount:1296, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-022", bu:"CBM", name:"CPAC ภาคตะวันตก", short:"CPAC ภาคตะวันตก", type:"Concrete", lat:13.798199, lng:100.037878, status:"green", radius_km:27, headcount:799, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-023", bu:"CBM", name:"CPAC ภาคตะวันออก", short:"CPAC ภาคตะวันออก", type:"Concrete", lat:13.346447, lng:101.033489, status:"green", radius_km:26, headcount:1334, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-024", bu:"CBM", name:"The Concrete Products and Aggregate Co., Ltd. (CPAC) ภาคอีสาน", short:"The Concrete Products and Aggr…", type:"Concrete", lat:14.980394, lng:102.07501, status:"green", radius_km:23, headcount:355, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-025", bu:"CBM", name:"The Concrete Products and Aggregate Co., Ltd. (CPAC) ภาคใต้", short:"The Concrete Products and Aggr…", type:"Concrete", lat:7.045847, lng:100.502597, status:"green", radius_km:21, headcount:769, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-026", bu:"CBM", name:"CBM-BCM Office", short:"CBM-BCM Office", type:"Office", lat:13.805325, lng:100.537843, status:"green", radius_km:27, headcount:1727, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-027", bu:"CBM", name:"C-Home", short:"C-Home", type:"Site", lat:13.801038, lng:100.537482, status:"green", radius_km:21, headcount:945, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-028", bu:"CBM", name:"นอริตาเก้ (NSP)", short:"นอริตาเก้", type:"Site", lat:14.33665, lng:100.854515, status:"green", radius_km:24, headcount:252, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-029", bu:"CBM", name:"Sosuco and Group", short:"Sosuco and Group", type:"Site", lat:13.800392, lng:100.575194, status:"green", radius_km:20, headcount:560, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-030", bu:"CBM", name:"Sosuco Ceramics", short:"Sosuco Ceramics", type:"Site", lat:14.35694, lng:100.814041, status:"green", radius_km:23, headcount:443, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-031", bu:"CBM", name:"Sekisui Industry", short:"Sekisui Industry", type:"Site", lat:14.333967, lng:100.866321, status:"green", radius_km:27, headcount:327, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-032", bu:"CBM", name:"TCC Marketing", short:"TCC Marketing", type:"Site", lat:13.895056, lng:100.588417, status:"green", radius_km:22, headcount:474, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-033", bu:"CBM", name:"TCC Industry", short:"TCC Industry", type:"Site", lat:14.412567, lng:100.910614, status:"green", radius_km:22, headcount:1634, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-034", bu:"CBM", name:"SFCC ท่าหลวง", short:"SFCC ท่าหลวง", type:"Site", lat:14.529532, lng:100.948747, status:"green", radius_km:26, headcount:470, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-035", bu:"CBM", name:"SFCC หนองแค", short:"SFCC หนองแค", type:"Site", lat:14.388058, lng:100.903868, status:"red", radius_km:6, headcount:1680, incidents:[{ id:"INC-2000035", sev:"P2", title:"Operational anomaly under investigation", started:"today" }], advisories:2, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-036", bu:"CBM", name:"SFCC สระบุรี", short:"SFCC สระบุรี", type:"Site", lat:14.563297, lng:100.938733, status:"green", radius_km:22, headcount:730, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-037", bu:"CBM", name:"SFCC ทุ่งสง", short:"SFCC ทุ่งสง", type:"Site", lat:8.09247, lng:99.659874, status:"green", radius_km:22, headcount:1458, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-038", bu:"CBM", name:"FCL ลำปาง", short:"FCL ลำปาง", type:"Site", lat:18.190306, lng:99.41729, status:"green", radius_km:21, headcount:201, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-039", bu:"CBM", name:"CRTC SB1", short:"CRTC SB1", type:"Site", lat:14.356862, lng:100.872154, status:"green", radius_km:20, headcount:104, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-040", bu:"CBM", name:"CRTC SB2", short:"CRTC SB2", type:"Site", lat:14.375355, lng:100.832578, status:"green", radius_km:21, headcount:105, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-041", bu:"CBM", name:"CRTC นครปฐม", short:"CRTC นครปฐม", type:"Site", lat:13.771839, lng:100.229649, status:"green", radius_km:26, headcount:1750, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-042", bu:"CBM", name:"CRTC ลำพูน", short:"CRTC ลำพูน", type:"Site", lat:18.591464, lng:99.041851, status:"red", radius_km:8, headcount:1582, incidents:[{ id:"INC-2000042", sev:"P2", title:"Operational anomaly under investigation", started:"today" }], advisories:2, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-043", bu:"CBM", name:"CRTC ชลบุรี", short:"CRTC ชลบุรี", type:"Site", lat:13.283037, lng:101.226629, status:"green", radius_km:25, headcount:1437, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-044", bu:"CBM", name:"CRTC ทุ่งสง", short:"CRTC ทุ่งสง", type:"Site", lat:8.099494, lng:99.681833, status:"green", radius_km:27, headcount:767, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-045", bu:"CBM", name:"CRTC ขอนแก่น", short:"CRTC ขอนแก่น", type:"Site", lat:16.206462, lng:102.759966, status:"green", radius_km:25, headcount:1773, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-046", bu:"CBM", name:"CRTC นครราชสีมา", short:"CRTC นครราชสีมา", type:"Site", lat:14.78861, lng:101.92967, status:"yellow", radius_km:13, headcount:1489, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-047", bu:"CBM", name:"TCT-Excella", short:"TCT-Excella", type:"Site", lat:14.336574, lng:100.854586, status:"green", radius_km:24, headcount:1820, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-048", bu:"CBM", name:"SFG", short:"SFG", type:"Site", lat:14.360658, lng:100.814109, status:"yellow", radius_km:16, headcount:1084, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-049", bu:"CBM", name:"QCON บางปะอิน", short:"QCON บางปะอิน", type:"Site", lat:14.194721, lng:100.587723, status:"green", radius_km:25, headcount:1645, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-050", bu:"CBM", name:"QCON หนองแค", short:"QCON หนองแค", type:"Site", lat:14.388786, lng:100.921134, status:"green", radius_km:22, headcount:546, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-051", bu:"CBM", name:"QCE ปลวกแดง", short:"QCE ปลวกแดง", type:"Site", lat:12.999038, lng:101.105286, status:"yellow", radius_km:15, headcount:595, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-052", bu:"CBM", name:"Landscape ลาดกระบัง", short:"Landscape ลาดกระบัง", type:"Landscape", lat:13.751349, lng:100.746364, status:"green", radius_km:24, headcount:612, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-053", bu:"CBM", name:"Landscape ศรีราชา", short:"Landscape ศรีราชา", type:"Landscape", lat:13.157124, lng:100.950155, status:"yellow", radius_km:16, headcount:692, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-054", bu:"CBM", name:"Landscape ขอนแก่น", short:"Landscape ขอนแก่น", type:"Landscape", lat:16.261811, lng:102.777611, status:"green", radius_km:22, headcount:946, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-055", bu:"CBM", name:"Landscape ลำพูน", short:"Landscape ลำพูน", type:"Landscape", lat:18.527407, lng:99.112104, status:"green", radius_km:23, headcount:707, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-056", bu:"CBM", name:"Landscape ทุ่งสง", short:"Landscape ทุ่งสง", type:"Landscape", lat:8.115755, lng:99.670334, status:"green", radius_km:22, headcount:1474, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-057", bu:"CBM", name:"Landscape บางซื่อ", short:"Landscape บางซื่อ", type:"Landscape", lat:13.802911, lng:100.538535, status:"yellow", radius_km:15, headcount:987, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-058", bu:"CBM", name:"Landscape Fence", short:"Landscape Fence", type:"Landscape", lat:14.380438, lng:100.842079, status:"yellow", radius_km:16, headcount:484, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-059", bu:"CBM", name:"Landscape Block หนองแค", short:"Landscape Block หนองแค", type:"Landscape", lat:14.40542, lng:100.936203, status:"green", radius_km:23, headcount:1579, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-060", bu:"CBM", name:"SBR บางซื่อ", short:"SBR บางซื่อ", type:"Site", lat:13.804794, lng:100.536371, status:"yellow", radius_km:15, headcount:195, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-061", bu:"CBM", name:"SBR สระบุรี", short:"SBR สระบุรี", type:"Site", lat:14.603264, lng:100.895371, status:"yellow", radius_km:14, headcount:986, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-062", bu:"CBM", name:"กระเบื้อง TIP", short:"กระเบื้อง TIP", type:"Site", lat:13.724033, lng:100.540805, status:"green", radius_km:27, headcount:1599, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-063", bu:"CBM", name:"SGI", short:"SGI", type:"Site", lat:14.359547, lng:100.823096, status:"green", radius_km:25, headcount:1117, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-064", bu:"CBM", name:"TGCI Office", short:"TGCI Office", type:"Office", lat:13.800887, lng:100.574917, status:"green", radius_km:23, headcount:1003, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-065", bu:"CBM", name:"TGCI", short:"TGCI", type:"Site", lat:14.388813, lng:100.896718, status:"green", radius_km:21, headcount:705, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-066", bu:"CBM", name:"Sekisui Sales", short:"Sekisui Sales", type:"Site", lat:13.80271, lng:100.537423, status:"green", radius_km:23, headcount:1643, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-067", bu:"CBM", name:"SSF นวนคร", short:"SSF นวนคร", type:"Site", lat:14.065162, lng:100.610098, status:"yellow", radius_km:12, headcount:1592, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-068", bu:"CBM", name:"SSW", short:"SSW", type:"Site", lat:13.922862, lng:100.601739, status:"green", radius_km:27, headcount:1503, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-069", bu:"CBM", name:"SSI", short:"SSI", type:"Site", lat:14.402219, lng:100.909675, status:"yellow", radius_km:13, headcount:1489, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-070", bu:"CBM", name:"SNK", short:"SNK", type:"Site", lat:14.386344, lng:100.833913, status:"green", radius_km:20, headcount:1336, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-071", bu:"CBM", name:"โรงปูนท่าหลวง STL", short:"โรงปูนท่าหลวง STL", type:"Cement", lat:14.576863, lng:100.766129, status:"green", radius_km:21, headcount:1361, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-072", bu:"CBM", name:"โรงปูนเขาวง SKW", short:"โรงปูนเขาวง SKW", type:"Cement", lat:14.678833, lng:100.85115, status:"green", radius_km:22, headcount:1074, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-073", bu:"CBM", name:"โรงปูนลำปาง SLP", short:"โรงปูนลำปาง SLP", type:"Cement", lat:18.64224, lng:99.540059, status:"green", radius_km:24, headcount:820, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-074", bu:"CBM", name:"โรงปูนทุ่งสง STS", short:"โรงปูนทุ่งสง STS", type:"Cement", lat:8.101804, lng:99.677237, status:"green", radius_km:24, headcount:1452, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-075", bu:"CBM", name:"โรงปูนขาว SWCC", short:"โรงปูนขาว SWCC", type:"Cement", lat:14.678216, lng:100.851113, status:"green", radius_km:22, headcount:978, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-076", bu:"CBM", name:"SRIC", short:"SRIC", type:"Site", lat:14.572039, lng:100.761453, status:"green", radius_km:21, headcount:1465, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-077", bu:"CBM", name:"โรงปูนแก่งคอย SKK", short:"โรงปูนแก่งคอย SKK", type:"Cement", lat:14.647029, lng:101.034621, status:"green", radius_km:20, headcount:1232, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-078", bu:"CBM", name:"CPAC เขาวง", short:"CPAC เขาวง", type:"Concrete", lat:14.681143, lng:100.85615, status:"green", radius_km:27, headcount:167, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-079", bu:"CBM", name:"SMC KW", short:"SMC KW", type:"Site", lat:14.683011, lng:100.854299, status:"yellow", radius_km:15, headcount:891, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-080", bu:"CBM", name:"SMC TS", short:"SMC TS", type:"Site", lat:8.11043, lng:99.672234, status:"green", radius_km:26, headcount:1166, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-081", bu:"CBM", name:"CPAC บางซ่อน", short:"CPAC บางซ่อน", type:"Concrete", lat:13.818751, lng:100.514885, status:"green", radius_km:27, headcount:1015, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-082", bu:"CBM", name:"EPS", short:"EPS", type:"Site", lat:14.566057, lng:100.766335, status:"green", radius_km:20, headcount:552, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-083", bu:"CBM", name:"SRI", short:"SRI", type:"Site", lat:14.61647, lng:101.043126, status:"green", radius_km:22, headcount:1458, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-084", bu:"CBM", name:"SCIEco", short:"SCIEco", type:"Site", lat:14.640489, lng:101.029953, status:"green", radius_km:20, headcount:552, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-085", bu:"CBM", name:"โรงผลิตถุงกระดาษ", short:"โรงผลิตถุงกระดาษ", type:"Site", lat:14.640289, lng:101.028664, status:"green", radius_km:22, headcount:1514, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-086", bu:"CBM", name:"SMC KK", short:"SMC KK", type:"Site", lat:14.640061, lng:101.027613, status:"green", radius_km:27, headcount:879, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-087", bu:"CBM", name:"SCG Trading", short:"SCG Trading", type:"Site", lat:13.805195, lng:100.537882, status:"green", radius_km:20, headcount:120, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-088", bu:"CBM", name:"SCGL ESC", short:"SCGL ESC", type:"Site", lat:13.083042, lng:100.892374, status:"red", radius_km:8, headcount:82, incidents:[{ id:"INC-2000088", sev:"P2", title:"Operational anomaly under investigation", started:"today" }], advisories:2, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-089", bu:"CBM", name:"ท่าเรือจัมโบ้", short:"ท่าเรือจัมโบ้", type:"Port", lat:14.403298, lng:100.58709, status:"green", radius_km:23, headcount:1731, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-090", bu:"CBM", name:"SCGL Jumbo Jetty", short:"SCGL Jumbo Jetty", type:"Port", lat:14.403331, lng:100.587113, status:"yellow", radius_km:14, headcount:890, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-091", bu:"CBM", name:"ท่าเรือวัดบันได", short:"ท่าเรือวัดบันได", type:"Port", lat:14.452427, lng:100.598578, status:"green", radius_km:22, headcount:570, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-092", bu:"CBM", name:"ท่าเรือแหลมฉบัง", short:"ท่าเรือแหลมฉบัง", type:"Port", lat:13.065621, lng:100.899185, status:"green", radius_km:27, headcount:767, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-093", bu:"CBM", name:"ท่าเรือคลองเตย", short:"ท่าเรือคลองเตย", type:"Port", lat:13.705263, lng:100.571446, status:"red", radius_km:6, headcount:880, incidents:[{ id:"INC-2000093", sev:"P2", title:"Operational anomaly under investigation", started:"today" }], advisories:2, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-094", bu:"CBM", name:"ท่าเรือพระประแดง", short:"ท่าเรือพระประแดง", type:"Port", lat:13.664862, lng:100.549175, status:"green", radius_km:25, headcount:405, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-095", bu:"CBM", name:"ท่าเรือบางประกง", short:"ท่าเรือบางประกง", type:"Port", lat:13.694796, lng:100.549468, status:"green", radius_km:21, headcount:873, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-096", bu:"CBM", name:"เขื่อน พระราม6", short:"เขื่อน พระราม6", type:"Dam", lat:14.558658, lng:100.761333, status:"green", radius_km:26, headcount:1102, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-097", bu:"CBM", name:"เขื่อนป่าสักชลสิทธิ์", short:"เขื่อนป่าสักชลสิทธิ์", type:"Dam", lat:14.861389, lng:101.066111, status:"green", radius_km:22, headcount:442, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-098", bu:"CBM", name:"SCGL บางซื่อ", short:"SCGL บางซื่อ", type:"Site", lat:13.80534, lng:100.537617, status:"green", radius_km:25, headcount:1317, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-099", bu:"SCGP", name:"SCG Paper PLC (Head Office)", short:"SCG Paper PLC", type:"Office", lat:13.828746, lng:100.535202, status:"green", radius_km:27, headcount:999, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-100", bu:"SCGP", name:"Siam Kraft Industry Co., Ltd. (Head Office)", short:"Siam Kraft Industry", type:"Office", lat:13.828746, lng:100.535202, status:"green", radius_km:21, headcount:1561, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-101", bu:"SCGP", name:"Thai Paper Co., Ltd. (Head Office)", short:"Thai Paper", type:"Office", lat:13.828746, lng:100.535202, status:"green", radius_km:25, headcount:157, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-102", bu:"SCGP", name:"Thai Containers Group Co., Ltd. (Head Office)", short:"Thai Containers Group", type:"Office", lat:13.828746, lng:100.535202, status:"green", radius_km:22, headcount:1802, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-103", bu:"SCGP", name:"SCG Paper Public Company Limited (Factory)", short:"SCG Paper", type:"Factory", lat:13.873413, lng:99.847183, status:"red", radius_km:6, headcount:980, incidents:[{ id:"INC-2000103", sev:"P2", title:"Operational anomaly under investigation", started:"today" }], advisories:2, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-104", bu:"SCGP", name:"Thai Paper Co., Ltd. (Factory)", short:"Thai Paper", type:"Factory", lat:13.845241, lng:99.867846, status:"green", radius_km:27, headcount:1063, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-105", bu:"SCGP", name:"Siam Kraft Industry Co., Ltd. (Factory1 : Banpong)", short:"Siam Kraft Industry", type:"Factory", lat:13.816901, lng:99.886592, status:"green", radius_km:25, headcount:1437, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-106", bu:"SCGP", name:"Siam Kraft Industry Co., Ltd. (Factory2 : Wangsala)", short:"Siam Kraft Industry", type:"Factory", lat:13.948691, lng:99.710278, status:"green", radius_km:21, headcount:353, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-107", bu:"SCGP", name:"Siam Cellulose Co., Ltd. (Factory)", short:"Siam Cellulose", type:"Factory", lat:13.97303, lng:99.636555, status:"green", radius_km:21, headcount:337, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-108", bu:"SCGP", name:"The Siam Forestry Co., Ltd. (Factory)", short:"The Siam Forestry", type:"Factory", lat:14.257293, lng:99.748839, status:"green", radius_km:22, headcount:1778, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-109", bu:"SCGP", name:"Thai Cane Paper Public Company Limited (Head Office)", short:"Thai Cane Paper", type:"Office", lat:13.722501, lng:100.499625, status:"green", radius_km:20, headcount:424, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-110", bu:"SCGP", name:"Thai Cane Paper Public Company Limited (Factory1: Tha Muang)", short:"Thai Cane Paper", type:"Factory", lat:13.947708, lng:99.671402, status:"green", radius_km:22, headcount:1658, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-111", bu:"SCGP", name:"Thai Cane Paper Public Company Limited (Factory2: Kabinburi)", short:"Thai Cane Paper", type:"Factory", lat:13.933068, lng:101.835365, status:"green", radius_km:27, headcount:1671, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-112", bu:"SCGP", name:"Thai Union Paper Bublic Co., Ltd.", short:"Thai Union Paper Bublic", type:"Paper", lat:13.656663, lng:100.565071, status:"green", radius_km:20, headcount:1848, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-113", bu:"SCGP", name:"Phoenix Pulp & Paper Puplic Company Limited (Factory)", short:"Phoenix Pulp & Paper Puplic", type:"Factory", lat:16.786135, lng:102.793579, status:"yellow", radius_km:17, headcount:189, incidents:[], advisories:1, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-114", bu:"SCGP", name:"Thai Containers Group Co., Ltd. (Nvanakorn Plant)", short:"Thai Containers Group", type:"Plant", lat:14.184179, lng:100.592537, status:"green", radius_km:27, headcount:799, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-115", bu:"SCGP", name:"Thai Containers Group Co., Ltd. (สมุทรปราการ Plant)", short:"Thai Containers Group", type:"Plant", lat:13.543396, lng:100.663334, status:"red", radius_km:8, headcount:782, incidents:[{ id:"INC-2000115", sev:"P2", title:"Operational anomaly under investigation", started:"today" }], advisories:2, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-116", bu:"SCGP", name:"Thai Containers Group Co., Ltd. (Ratchaburi Plant)", short:"Thai Containers Group", type:"Plant", lat:13.717356, lng:99.901464, status:"green", radius_km:20, headcount:1000, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-117", bu:"SCGP", name:"Thai Containers สงขลา (1994) Co., Ltd.", short:"Thai Containers สงขลา", type:"Container", lat:7.093057, lng:100.282516, status:"green", radius_km:26, headcount:1742, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-118", bu:"SCGP", name:"Thai Containers Group Co., Ltd. (ชลบุรี Factory)", short:"Thai Containers Group", type:"Factory", lat:13.178111, lng:100.944099, status:"green", radius_km:27, headcount:871, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-119", bu:"SCGP", name:"Thai Containers Group Co., Ltd. (ปราจีนบุรี Factory)", short:"Thai Containers Group", type:"Factory", lat:13.943397, lng:101.591949, status:"green", radius_km:20, headcount:1320, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-120", bu:"SCGP", name:"Thai Containers Group Co., Ltd. (ปทุมธานี Factory)", short:"Thai Containers Group", type:"Factory", lat:13.958224, lng:100.502501, status:"green", radius_km:27, headcount:1007, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-121", bu:"SCGP", name:"Thai Containers Saraburi Co., Ltd.", short:"Thai Containers Saraburi", type:"Container", lat:14.587571, lng:101.004181, status:"green", radius_km:21, headcount:1177, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-122", bu:"SCGP", name:"Thai Containers ขอนแก่น Co., Ltd.", short:"Thai Containers ขอนแก่น", type:"Container", lat:16.206927, lng:102.750835, status:"green", radius_km:25, headcount:869, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-123", bu:"SCGP", name:"Thai Containers Rayong Co., Ltd.", short:"Thai Containers Rayong", type:"Container", lat:13.013924, lng:101.12812, status:"green", radius_km:20, headcount:144, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-124", bu:"SCGP", name:"Thai British Security Printing Public Company Limited (Factory1:Poochao)", short:"Thai British Security Printing", type:"Factory", lat:13.641501, lng:100.577945, status:"green", radius_km:25, headcount:453, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" },
  { id:"S-125", bu:"SCGP", name:"Thai British Security Printing Public Company Limited (Factory2; Bangpoo)", short:"Thai British Security Printing", type:"Factory", lat:13.575246, lng:100.669785, status:"green", radius_km:22, headcount:1554, incidents:[], advisories:0, contact:"Site BCM lead", phone:"+66 80 000 0000" }
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
