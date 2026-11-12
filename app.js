"use strict";

// Everything stays on this device. No accounts, analytics, or remote data services.
const STORAGE_KEY = "tabinichi-hokkaido-2026-v1";
const DAY_MS = 86400000;
const DEFAULT_DATES = dateRange("2026-12-28", "2027-01-05");
const CATEGORIES = {
  sight: { name: "景點", color: "#f2ce70" },
  food: { name: "餐飲", color: "#ee9c92" },
  stay: { name: "住宿", color: "#9bc9dc" },
  transport: { name: "交通", color: "#accf98" },
};
const DEFAULT_GROUPS = ["衣服", "證件", "電子", "藥品", "其他"];
const DEFAULT_THEMES = [
  "抵達札幌，先安頓",
  "札幌市區慢慢行",
  "小樽運河與雪景",
  "除夕，提早吃、好好休息",
  "元日初詣，北海道神宮",
  "甜點、商場與夜景",
  "定山溪溫泉，雪見泡湯",
  "回札幌，買手信",
  "從容回程",
];
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const yen = (value) => `¥${Math.round(value).toLocaleString("zh-TW")}`;
const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const minutes = (value) =>
  Number(value.split(":")[0]) * 60 + Number(value.split(":")[1]);
const clockTime = (value) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const shortDate = (date) => date.slice(5).replace("-", "/");
const weekday = (date) =>
  ["週日", "週一", "週二", "週三", "週四", "週五", "週六"][
    new Date(`${date}T12:00:00`).getDay()
  ];
const newId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function validISODate(value) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    value < "0001-01-01"
  )
    return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return (
    Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value
  );
}
function dateRange(start, end) {
  if (!validISODate(start) || !validISODate(end))
    throw new Error("請填寫有效的出發日和回程日。");
  const count =
    (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) /
      DAY_MS +
    1;
  if (count < 1) throw new Error("回程日不能早過出發日。");
  if (count > 30) throw new Error("每趟旅程請設定為 1 至 30 日。");
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.parse(`${start}T00:00:00Z`) + i * DAY_MS)
      .toISOString()
      .slice(0, 10),
  );
}
function defaultTrip() {
  return {
    title: "旅日手帳",
    destination: "北海道",
    eyebrow: "日本・北海道",
    stamp: "過年去北海道",
    startDate: DEFAULT_DATES[0],
    endDate: DEFAULT_DATES.at(-1),
    exchangeRate: 0.052,
    themes: Object.fromEntries(
      DEFAULT_DATES.map((date, i) => [date, DEFAULT_THEMES[i]]),
    ),
  };
}
const tripDates = () => dateRange(state.trip.startDate, state.trip.endDate);

const SVG = (body, viewBox = "0 0 100 70", extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
const STATION = SVG(
  '<path d="M15 27 50 13 85 27v30H15Z" fill="#b68665"/><path d="m15 27 35-14 35 14Z" fill="#6a5548"/><path d="M31 34h10v10H31zm17 0h10v10H48zm17 0h10v10H65z" fill="#f7e3b0" stroke="#fff8e8"/><path d="M4 53h30c7 0 16 9 19 16H4Z" fill="#fffdf5"/><path d="M10 58h22c5 0 9 4 12 6H10Z" fill="#9bc9dc" stroke="none"/><rect x="56" y="49" width="38" height="23" rx="5" fill="#b7d999"/><path d="M63 55h9m7 0h8M63 64h24M8 73h86"/><circle cx="64" cy="73" r="2" fill="#393530"/><circle cx="85" cy="73" r="2" fill="#393530"/>',
  "0 6 100 73",
);
const SCENERY = SVG(
  '<path d="M3 56c14-12 34-12 52-4" stroke="#a7bf88" stroke-width="4"/><path d="M13 38h23v17H13Z" fill="#fbf3d7"/><path d="m8 38 17-12 17 12Z" fill="#98c8d6"/><path d="m12 28 13-10 13 10Z" fill="#98c8d6"/><path d="M21 46h7v9" fill="#e7c769"/><path d="m6 39 20-4 18 4M10 28l15-4 16 4"/><circle cx="69" cy="20" r="9" fill="#f3cf6f"/><path d="M45 43h34c9 0 18 6 21 12H45Z" fill="#fffdf8"/><path d="M47 51h45" stroke="#e8908b" stroke-width="4"/><path d="M51 45h8m5 0h7m5 0h6M46 59h48"/><path d="m110 46 6-10h11l9 10h9v10h-40V46Z" fill="#ed9d92"/><path d="M117 44h11l-5-6h-3Z" fill="#abd0d8"/><circle cx="114" cy="56" r="4" fill="#514e49"/><circle cx="136" cy="56" r="4" fill="#514e49"/><path d="m153 59 12-29 12 29Z" fill="#b8d79b"/><circle cx="165" cy="28" r="15" fill="#fff9e9"/><path d="M165 13v30m-15-15h30m-25-11 21 22m-22 0 22-22"/><circle cx="165" cy="28" r="3" fill="#e9c668"/><rect x="161" y="9" width="8" height="6" rx="2" fill="#f1cc68"/><rect x="145" y="25" width="7" height="6" rx="2" fill="#9bc9dc"/><rect x="178" y="25" width="7" height="6" rx="2" fill="#ee9c92"/><path d="M152 60h26"/>',
  "0 5 190 60",
);
const WALK = SVG(
  '<circle cx="15" cy="5" r="3" fill="currentColor" stroke="none"/><path d="m14 11-5 7m5-7 5 7 5 2m-10-7-2 12-6 9m6-9 8 9M9 18l-5 2" stroke-width="3.2"/>',
  "0 0 28 36",
);
const TRAIN = SVG(
  '<rect x="5" y="2" width="20" height="27" rx="5" fill="currentColor" stroke="none"/><rect x="9" y="7" width="12" height="10" rx="2" fill="#fffdf7" stroke="none"/><circle cx="10" cy="23" r="1.5" fill="#fffdf7" stroke="none"/><circle cx="20" cy="23" r="1.5" fill="#fffdf7" stroke="none"/><path d="m9 29-3 5m15-5 3 5M8 32h14"/>',
  "0 0 30 36",
);
const LOCK = SVG(
  '<rect x="4" y="10" width="16" height="13" rx="3" fill="#f2e6bd"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
  "0 0 24 26",
);

function seedState() {
  const items = [];
  const add = (
    day,
    category,
    title,
    start,
    end,
    cost = 0,
    notes = "",
    extra = {},
  ) =>
    items.push({
      id: `sample-${items.length + 1}`,
      date: DEFAULT_DATES[day - 1],
      category,
      title,
      start,
      end,
      cost,
      notes:
        `${notes} 全家（2 成人＋1 小童）示範預算／請以官方最新資訊為準。時間係可改安排，唔係已訂票。`.trim(),
      costLabel: "全家",
      locked: false,
      ...extra,
    });
  // Editable example for 2 adults and 1 child; no bookings are implied.
  add(
    1,
    "transport",
    "下午抵達新千歲機場（時段可改）",
    "13:00",
    "14:30",
    0,
    "請按實際航班修改。預留入境、取行李及雪天緩衝；機票未估價，請自行補上。",
  );
  add(
    1,
    "transport",
    "JR 快速 Airport・新千歲 → 札幌",
    "14:45",
    "15:45",
    3080,
    "列車約 37–40 分鐘；步行 10＋火車 40＋步行 10 分鐘，另留候車緩衝。全家普通車廂單程估算，指定席另計；請以 JR 北海道官方為準。",
    {
      routeFrom: "新千歲機場",
      routeTo: "札幌站附近飯店",
      breakdown: { walk1: 10, train: 40, walk2: 10 },
    },
  );
  add(
    1,
    "stay",
    "札幌站附近飯店・入住",
    "16:00",
    "16:45",
    24000,
    "一晚全家房費示範，並非酒店報價或已訂房；未含早餐。先放行李、加夠保暖衣物。",
  );
  add(
    1,
    "sight",
    "大通公園散步睇雪",
    "17:00",
    "17:30",
    0,
    "白色燈樹節大通會場已於 2026/12/25 結束，今日只散步適應天氣。2027 年札幌雪祭要到 2 月先開始；怕冷可直接去地下街。",
  );
  add(
    1,
    "food",
    "狸小路附近晚餐・拉麵或湯咖哩",
    "18:00",
    "19:00",
    4500,
    "實際營業請現場確認，唔使趕；食完慢慢返飯店。",
  );

  add(2, "food", "飯店早餐", "08:30", "09:15", 3000, "早餐另計；食飽先出門。");
  add(
    2,
    "sight",
    "札幌市時計台・趁休館前參觀",
    "10:00",
    "10:45",
    700,
    "預計 1/1–1/3 休館，所以安排今日；請確認當日開放。北海道開拓之村等不少公共博物館 12/29–1/3 休息，今次不排呢類館。",
  );
  add(
    2,
    "sight",
    "大通公園與札幌電視塔",
    "11:15",
    "12:15",
    2500,
    "門票為全家示範估算；請確認電視塔當日開放。公園只短暫散步，唔係燈樹節或雪祭活動。",
  );
  add(
    2,
    "food",
    "暖暖湯咖哩午餐",
    "12:45",
    "13:45",
    4200,
    "留時間排隊；太多人就轉附近連鎖店。",
  );
  add(
    2,
    "sight",
    "狸小路、地下街慢慢逛",
    "14:30",
    "16:00",
    0,
    "下雪都方便行，預留咖啡休息；購物按需要另加支出。",
  );
  add(
    2,
    "food",
    "札幌市區晚餐",
    "17:30",
    "18:30",
    4500,
    "揀近飯店嘅店，營業請現場確認。",
  );
  add(
    2,
    "stay",
    "回札幌飯店・暖身休息",
    "19:00",
    "20:00",
    24000,
    "一晚全家房費示範，非報價；早餐另計。",
  );

  add(
    3,
    "food",
    "早餐・準備小樽散步",
    "08:00",
    "08:45",
    3000,
    "帶暖包，雪天放慢腳步。",
  );
  add(
    3,
    "transport",
    "JR 札幌 → 小樽",
    "09:15",
    "10:15",
    2000,
    "火車約 30–40 分鐘；全家單程示範車費，請以 JR 官方為準。前後步行各 10 分鐘，雪天候車另留緩衝。",
    {
      routeFrom: "札幌站",
      routeTo: "小樽站",
      breakdown: { walk1: 10, train: 40, walk2: 10 },
    },
  );
  add(
    3,
    "sight",
    "小樽運河、堺町通雪景",
    "10:30",
    "11:45",
    0,
    "路面可能結冰，著防滑鞋。只揀一小段行，太冷就入室內。",
  );
  add(
    3,
    "food",
    "小樽海鮮／壽司午餐",
    "12:00",
    "13:00",
    6500,
    "12/30 多數店仍開，較適合食壽司；過年好多壽司店會休息，今日亦請確認營業，唔預設有位。",
  );
  add(
    3,
    "sight",
    "音樂盒、玻璃小店隨意逛",
    "13:30",
    "14:45",
    0,
    "留咖啡暖身時間，實際開放請再確認。水族館較遠，今次示範唔去。",
  );
  add(
    3,
    "transport",
    "JR 小樽 → 札幌",
    "15:15",
    "16:15",
    2000,
    "火車約 30–40 分鐘；全家單程示範車費，請以 JR 官方為準。雪天可能延誤，提早返札幌。",
    {
      routeFrom: "小樽站",
      routeTo: "札幌站",
      breakdown: { walk1: 10, train: 40, walk2: 10 },
    },
  );
  add(3, "food", "札幌晚餐", "17:30", "18:30", 4500, "近飯店食，唔再趕景點。");
  add(
    3,
    "stay",
    "札幌飯店・休息",
    "19:00",
    "20:00",
    24000,
    "一晚全家房費示範，非報價。旭山動物園 12/30–1/1 休園；今次唔去旭川，減少長途移動。",
  );

  add(
    4,
    "food",
    "飯店早餐",
    "08:30",
    "09:15",
    3000,
    "除夕慢慢開始，今日提早食晚餐。",
  );
  add(
    4,
    "sight",
    "札幌站周邊商場・買元日補給",
    "10:30",
    "12:00",
    3000,
    "先查大型商場或連鎖店開放；除夕下午好多細店提早休息。預先買元日早餐、零食、暖包；此金額只計補給，手信另計。",
  );
  add(
    4,
    "food",
    "簡單午餐・酒店或連鎖店",
    "12:15",
    "13:00",
    3500,
    "12/31–1/3 家庭經營餐廳同細店常休息；酒店餐廳、連鎖店、便利店較可靠，仍請確認。",
  );
  add(
    4,
    "food",
    "提早食年夜飯・酒店或連鎖店",
    "16:30",
    "17:45",
    6500,
    "揀毋須預約嘅普通餐廳，先問營業。北海道有除夕食「年取り膳」習慣，亦可揀年越し蕎麥麵；唔預設有特別套餐。",
  );
  add(
    4,
    "stay",
    "早啲返飯店・準備初詣",
    "18:15",
    "20:00",
    28000,
    "除夕一晚全家房費示範，並非報價；準備手套同防滑鞋，今晚好好休息。",
  );

  add(
    5,
    "food",
    "飯店或預先買好嘅早餐",
    "08:30",
    "09:15",
    0,
    "預先買嘅便利店早餐已計入除夕補給，避免重複入帳；如改食飯店早餐請補差額。元日好多餐廳休息。",
  );
  add(
    5,
    "transport",
    "地鐵東西線・圓山公園站 → 神宮",
    "09:45",
    "10:45",
    750,
    "由札幌站一帶可先步行約 20 分鐘到大通站，再搭東西線；候車、乘車約 15 分鐘，圓山公園站再步行約 15 分鐘。全家單程示範地鐵費；新年一日券適用日期及票價請確認。人潮雪路另留緩衝。",
    {
      routeFrom: "札幌站附近飯店／大通站",
      routeTo: "圓山公園站／北海道神宮",
    },
  );
  add(
    5,
    "sight",
    "北海道神宮・元日初詣",
    "10:45",
    "12:00",
    1500,
    "札幌主要初詣地；人多、好冷，參道可能結冰，著防滑鞋，排隊可隨時縮短。元日開放初詣，參考為零時至傍晚；開放時間以神社官方為準。元日有交通管制，唔建議開車。金額係全家自由參拜添香油／御守預算，唔係入場票。",
  );
  add(
    5,
    "food",
    "酒店或連鎖餐廳午餐",
    "12:30",
    "13:30",
    4500,
    "元日家庭式餐廳（家庭經營小店）多休息；連鎖店亦可能調整營業，出發前確認，必要時便利店補給。",
  );
  add(
    5,
    "transport",
    "慢慢搭地鐵返飯店",
    "13:45",
    "14:45",
    750,
    "沿原路返札幌站一帶；全家單程示範車費。預留雪路、候車同人潮時間。",
  );
  add(
    5,
    "stay",
    "下午返飯店暖身・自由休息",
    "15:00",
    "17:00",
    0,
    "唔再塞景點，整理相片、飲暖水；今晚住宿費記在夜間卡。",
  );
  add(
    5,
    "food",
    "簡單晚餐・近飯店食",
    "17:30",
    "18:30",
    4500,
    "酒店餐廳／連鎖店先確認營業，便利店作後備。",
  );
  add(
    5,
    "stay",
    "札幌飯店・元日好好瞓",
    "19:00",
    "20:00",
    28000,
    "元日一晚全家房費示範，非報價；早餐另計。",
  );

  add(
    6,
    "food",
    "飯店早餐",
    "08:30",
    "09:15",
    3000,
    "慢慢食，今日景點可按體力刪減。",
  );
  add(
    6,
    "sight",
    "白色戀人公園・甜點與室內參觀",
    "10:15",
    "11:45",
    2500,
    "請確認年末年始開放，入場費係全家示範。由市中心預留約 45–60 分鐘交通；天候不佳可改近飯店室內活動。",
  );
  add(
    6,
    "food",
    "暖暖午餐",
    "12:00",
    "13:00",
    4200,
    "先確認營業；食完預留約 45–60 分鐘返市中心。",
  );
  add(
    6,
    "sight",
    "商場自由行・手信／福袋（可選）",
    "14:00",
    "15:00",
    0,
    "1/2 起較多店恢復，亦係福袋購物日子；唔保證個別店開門，購物另計。時計台 1/1–1/3 仍休館，今日唔安排入館。想休息可直接返飯店。",
  );
  add(
    6,
    "transport",
    "預留時間往藻岩山山麓",
    "15:15",
    "16:15",
    1500,
    "市電／地鐵加接駁或步行，路線及接駁請再確認；全家來回市內交通預算一次計入，雪天可取消夜景。",
  );
  add(
    6,
    "sight",
    "傍晚藻岩山夜景（天氣許可）",
    "16:30",
    "17:45",
    9000,
    "纜車 12/31、1/1 休業，1/2 先考慮。初日的出特別運行由 2026 年起取消。請確認當日運行及最後上山時間；全家往返纜車連接駁登山車票示範，非報價。強風或大雪改室內休息。",
  );
  add(
    6,
    "food",
    "回市區食晚餐",
    "19:00",
    "20:00",
    4500,
    "夜景後預留約一小時返市區，唔趕車；市內來回費用已在交通卡計入。",
  );
  add(
    6,
    "stay",
    "札幌飯店・收拾溫泉小行李",
    "20:30",
    "21:15",
    26000,
    "一晚全家房費示範，非報價；定山溪一晚只帶輕便用品，大行李寄存需先問飯店。",
  );

  add(
    7,
    "food",
    "早餐、退房準備",
    "08:30",
    "09:30",
    3000,
    "食完整理行李，確認定山溪旅館用餐及入住時間。",
  );
  add(
    7,
    "transport",
    "札幌站 → 定山溪・巴士與雪天緩衝",
    "10:30",
    "13:00",
    4250,
    "兩個示範選擇：預約制「河童號」約 60 分鐘，單程每成人約 ¥1,700，網上預約或較平；不預約路線巴士約 80 分鐘，單程每成人約 ¥1,000。此卡全家以河童號估算，兩者擇一。時段唔係班次；請以じょうてつ／觀光協會官方為準，雪天預留延誤。",
    {
      routeFrom: "札幌站",
      routeTo: "定山溪溫泉",
    },
  );
  add(
    7,
    "food",
    "定山溪簡單午餐",
    "13:00",
    "14:00",
    3500,
    "新年細店可能休息，先問旅館附近營業，或出發前買便當。",
  );
  add(
    7,
    "stay",
    "定山溪溫泉旅館・入住",
    "15:00",
    "15:30",
    65000,
    "全家一晚含晚餐、翌日早餐嘅示範房費，並非旅館報價或已訂房。新年晚餐多由旅館提供，準時到達好重要；請自行確認入住、用餐及泡湯規則。",
  );
  add(
    7,
    "sight",
    "溫泉街、二見吊橋短散步",
    "15:30",
    "16:00",
    0,
    "雪路小心，近黃昏只短走；吊橋及步道如結冰或封閉就折返。新・雪燈路要到 2027/1/20 先開始，今次看不到活動。",
  );
  add(
    7,
    "food",
    "旅館晚餐・慢慢享用",
    "18:00",
    "19:00",
    0,
    "已包含在示範房費，唔重複計；實際用餐時間依旅館安排。",
  );
  add(
    7,
    "stay",
    "雪見泡湯・好好休息",
    "19:30",
    "21:00",
    0,
    "住宿費已記在入住卡；按旅館浴場時間慢慢泡，唔好勉強長時間浸湯。",
  );

  add(
    8,
    "food",
    "旅館早餐、再享受一次溫泉",
    "08:00",
    "10:00",
    0,
    "早餐已含房費；確認浴場開放及退房時間，慢慢收拾。",
  );
  add(
    8,
    "transport",
    "定山溪 → 札幌・預留雪天延誤",
    "10:30",
    "13:00",
    4250,
    "河童號需預約，約 60 分鐘、每成人單程示範約 ¥1,700；或不預約路線巴士約 80 分鐘、約 ¥1,000。全家以河童號估算；網上預約或較平，班次及票價請向じょうてつ／觀光協會官方確認。此時段含候車與雪天緩衝，並非班次。",
    {
      routeFrom: "定山溪溫泉",
      routeTo: "札幌站",
    },
  );
  add(
    8,
    "food",
    "返札幌食午餐",
    "13:15",
    "14:15",
    4200,
    "交通延誤就順延午餐，今日唔趕。",
  );
  add(
    8,
    "sight",
    "札幌市時計台・補看（可選）",
    "14:45",
    "15:15",
    0,
    "1/1–1/3 休館後，今日預計再開放；請確認。如 12/29 已參觀可跳過。此卡只作外觀散步，不另計門票；要入館請自行補票價。",
  );
  add(
    8,
    "sight",
    "狸小路／札幌站・最後手信",
    "15:45",
    "17:00",
    5000,
    "全家手信示範預算；留位放行李，唔使買得太趕。",
  );
  add(
    8,
    "food",
    "最後一晚札幌晚餐",
    "17:30",
    "18:30",
    5000,
    "揀近飯店餐廳，先確認營業。",
  );
  add(
    8,
    "stay",
    "札幌飯店・最後一晚",
    "19:00",
    "20:00",
    24000,
    "一晚全家房費示範，非報價；核對實際航班及翌日 JR 運行，早啲收拾。",
  );

  add(
    9,
    "food",
    "飯店早餐、從容退房",
    "08:00",
    "09:30",
    3000,
    "唔排早上景點，預留惡劣天氣／交通延誤緩衝；請按實際航班修改全日安排。",
  );
  add(
    9,
    "transport",
    "JR 快速 Airport・札幌 → 新千歲",
    "10:00",
    "11:00",
    3080,
    "火車約 40 分鐘，加前後步行各 10 分鐘。全家普通車廂單程示範車費，請以 JR 官方為準。另預留機場報到與雪天緩衝，請按實際航班修改。",
    {
      routeFrom: "札幌飯店／札幌站",
      routeTo: "新千歲機場",
      breakdown: { walk1: 10, train: 40, walk2: 10 },
    },
  );
  add(
    9,
    "sight",
    "機場自由時間・最後手信與午餐",
    "11:15",
    "12:30",
    3500,
    "此金額只作全家午餐示範，手信按需要另加。時間跟航班、航空公司報到要求及當日路況；延誤時直接跳過購物。",
  );
  add(
    9,
    "transport",
    "新千歲出發回程（時段可改）",
    "14:30",
    "16:00",
    0,
    "請按實際航班修改；只係可改嘅回程時段，並非起飛時間或航程。機票未計入總額，請補實際費用。",
  );

  const packing = {
    衣服: [
      "羽絨或厚外套",
      "保暖內層",
      "手套",
      "頸巾",
      "暖帽",
      "防水防滑雪靴",
      "厚襪（可多對）",
    ],
    證件: [
      "護照",
      "機票／登機證",
      "酒店確認",
      "旅遊保險",
      "信用卡／少量日圓現金",
    ],
    電子: ["手機", "充電線", "流動電源", "日本適用插頭（A 型）", "手提充電器"],
    藥品: ["常備藥", "感冒藥", "潤唇膏", "潤膚", "眼藥水", "暖包（多備）"],
    其他: [
      "太陽眼鏡（雪地反光）",
      "摺疊袋",
      "少量即食／能量棒",
      "行李雨套",
      "便攜暖水或保溫瓶（選）",
    ],
  };

  return {
    version: 2,
    trip: defaultTrip(),
    groups: [...DEFAULT_GROUPS],
    items,
    expenses: [
      {
        id: "extra-1",
        date: DEFAULT_DATES[0],
        category: "other",
        title: "全家上網 eSIM",
        cost: 1600,
        notes:
          "全家示範預算／請以官方最新資訊為準。獨立支出，未列於行程；請按實際人數及方案改。",
      },
    ],
    packing: DEFAULT_GROUPS.flatMap((group) =>
      packing[group].map((title, index) => ({
        id: `pack-${group}-${index}`,
        group,
        title,
        checked: false,
      })),
    ),
    selectedDay: DEFAULT_DATES[0],
    tab: "plan",
    view: "week",
    collapsed: false,
    globalLock: false,
  };
}

// v1 backups predate trip settings: retain their original Nagoya dates and themes.
function legacyTrip() {
  const dates = dateRange("2026-12-03", "2026-12-10");
  const themes = [
    "初次見面，名古屋",
    "城郭、綠意與榮町散步",
    "犬山城下町慢慢走",
    "金城埠頭，鐵道與海風",
    "神宮參拜與老街午茶",
    "汽車故事與暖暖咖啡",
    "大須挖寶，帶一點回憶回家",
    "帶著滿滿回憶，回家囉",
  ];
  return {
    title: "旅日手帳",
    destination: "名古屋",
    eyebrow: "日本・名古屋",
    stamp: "冬日小旅行",
    startDate: dates[0],
    endDate: dates.at(-1),
    exchangeRate: 0.052,
    themes: Object.fromEntries(dates.map((date, i) => [date, themes[i]])),
  };
}
// One validator serves local saves and imports. Backup format remains version 2.
function normalizeState(s) {
  const fail = () => {
    throw new Error(
      "檔案內容不完整或格式不正確，請選擇由手帳匯出的 JSON 備份。",
    );
  };
  if (!s || ![1, 2].includes(s.version)) return fail();
  const trip = s.version === 1 ? legacyTrip() : s.trip;
  if (
    !trip ||
    !["title", "destination", "eyebrow", "stamp"].every(
      (k) =>
        typeof trip[k] === "string" && trip[k].trim() && trip[k].length <= 100,
    )
  )
    return fail();
  const dates = dateRange(trip.startDate, trip.endDate);
  if (
    !Number.isFinite(trip.exchangeRate) ||
    trip.exchangeRate <= 0 ||
    trip.exchangeRate > 1000
  )
    return fail();
  if (
    !trip.themes ||
    typeof trip.themes !== "object" ||
    Array.isArray(trip.themes) ||
    !dates.every(
      (d) =>
        typeof trip.themes[d] === "string" &&
        trip.themes[d].trim() &&
        trip.themes[d].length <= 100,
    )
  )
    return fail();
  const groups = s.version === 1 ? [...DEFAULT_GROUPS] : s.groups;
  if (
    !Array.isArray(groups) ||
    !groups.length ||
    groups.length > 30 ||
    !groups.every((g) => typeof g === "string" && g.trim() && g.length <= 60) ||
    new Set(groups).size !== groups.length
  )
    return fail();
  const validDate = (d) => dates.includes(d);
  const validCost = (n) => Number.isFinite(n) && n >= 0 && n <= 999999999;
  const validTime = (t) =>
    typeof t === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
  const validBase = (i) =>
    i &&
    typeof i.id === "string" &&
    i.id &&
    typeof i.title === "string" &&
    i.title.trim() &&
    validDate(i.date) &&
    validCost(i.cost) &&
    ["notes", "costLabel", "routeFrom", "routeTo"].every(
      (k) => i[k] === undefined || typeof i[k] === "string",
    );
  const unique = (list) => new Set(list.map((i) => i.id)).size === list.length;
  if (
    !Array.isArray(s.items) ||
    !s.items.every(
      (i) =>
        validBase(i) &&
        Object.hasOwn(CATEGORIES, i.category) &&
        validTime(i.start) &&
        validTime(i.end) &&
        minutes(i.end) > minutes(i.start) &&
        (!i.breakdown ||
          ["walk1", "train", "walk2"].every(
            (k) =>
              Number.isFinite(i.breakdown[k]) &&
              i.breakdown[k] >= 0 &&
              i.breakdown[k] <= 1440,
          )),
    ) ||
    !Array.isArray(s.expenses) ||
    !s.expenses.every(
      (i) =>
        validBase(i) &&
        (Object.hasOwn(CATEGORIES, i.category) || i.category === "other"),
    ) ||
    !Array.isArray(s.packing) ||
    !s.packing.every(
      (i) =>
        i &&
        typeof i.id === "string" &&
        i.id &&
        typeof i.title === "string" &&
        i.title.trim() &&
        groups.includes(i.group),
    ) ||
    ![s.items, s.expenses, s.packing].every(unique)
  )
    return fail();
  return {
    version: 2,
    trip: {
      ...trip,
      themes: Object.fromEntries(dates.map((d) => [d, trip.themes[d]])),
    },
    groups: [...groups],
    items: s.items,
    expenses: s.expenses,
    packing: s.packing,
    selectedDay: validDate(s.selectedDay) ? s.selectedDay : dates[0],
    tab: ["plan", "expenses", "packing"].includes(s.tab) ? s.tab : "plan",
    view: s.view === "day" ? "day" : "week",
    collapsed: Boolean(s.collapsed),
    globalLock: Boolean(s.globalLock),
  };
}
let loadWarning = "";
let needsMigration = false;
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const saved = JSON.parse(raw);
    const migrated = normalizeState(saved);
    needsMigration = saved.version === 1;
    return migrated;
  } catch {
    loadWarning = "暫時讀不到儲存資料，先顯示示範手帳；原存檔未被覆蓋。";
    return seedState();
  }
}
let state = loadState();
let editor = null;
let previewId = null;
let toastTimer;
let tapTimer;
let lastTap = { id: null, time: 0 };
function toast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("visible");
  toastTimer = setTimeout(() => $("#toast").classList.remove("visible"), 3200);
}
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    toast("瀏覽器無法儲存資料，這次變更僅保留至關閉頁面。");
    return false;
  }
}
function changed(message) {
  const saved = persist();
  render();
  if (saved && message) toast(message);
}
const isProtected = (item) => Boolean(state.globalLock && item.locked);

let manifestTemplate;
let manifestObjectURL;
let manifestName = "";
function updateManifest(trip) {
  const name = `${trip.title} · ${trip.stamp}`;
  if (name === manifestName) return;
  manifestName = name;
  manifestTemplate ??= fetch("./manifest.webmanifest").then((response) => {
    if (!response.ok) throw new Error("manifest unavailable");
    return response.json();
  });
  manifestTemplate
    .then((template) => {
      if (name !== manifestName) return;
      if (name === template.name && trip.title === template.short_name) {
        $('link[rel="manifest"]').href = "./manifest.webmanifest";
        if (manifestObjectURL) URL.revokeObjectURL(manifestObjectURL);
        manifestObjectURL = undefined;
        return;
      }
      const manifest = {
        ...template,
        name,
        short_name: trip.title,
        id: new URL(template.id, document.baseURI).href,
        start_url: new URL(template.start_url, document.baseURI).href,
        scope: new URL(template.scope, document.baseURI).href,
        icons: template.icons.map((icon) => ({
          ...icon,
          src: new URL(icon.src, document.baseURI).href,
        })),
      };
      const previousURL = manifestObjectURL;
      manifestObjectURL = URL.createObjectURL(
        new Blob([JSON.stringify(manifest)], {
          type: "application/manifest+json",
        }),
      );
      $('link[rel="manifest"]').href = manifestObjectURL;
      if (previousURL) URL.revokeObjectURL(previousURL);
    })
    .catch(() => {
      // Direct file access may block fetch; the relative static manifest stays usable.
    });
}

function render() {
  const trip = state.trip;
  document.title = `${trip.title} · ${trip.stamp}`;
  updateManifest(trip);
  $("#brand-title").textContent = trip.title;
  $("#brand-eyebrow").textContent = trip.eyebrow;
  $("#stamp-label").textContent = trip.stamp;
  $("#stamp-dates").textContent =
    `${shortDate(trip.startDate).replace("/", ".")} — ${shortDate(trip.endDate).replace("/", ".")}`;
  $("#trip-summary").textContent =
    `${trip.destination} ${tripDates().length} 天行程・所有內容都可以編輯`;
  for (const input of [$("#selected-date"), $("#editor-form").elements.date]) {
    input.min = trip.startDate;
    input.max = trip.endDate;
  }
  $$(".main-tabs button").forEach((button) => {
    if (button.dataset.tab === state.tab)
      button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  ["plan", "expenses", "packing"].forEach(
    (tab) => ($(`#${tab}-panel`).hidden = tab !== state.tab),
  );
  renderPlan();
  renderExpenses();
  renderPacking();
}
function renderPlan() {
  const dates = tripDates();
  $(".calendar-title p").textContent =
    `${Number(state.selectedDay.slice(0, 4))} 年 ${Number(state.selectedDay.slice(5, 7))} 月`;
  $("#week-strip").style.setProperty("--days", dates.length);
  const single = state.view === "day";
  $("#plan-panel").classList.toggle("single-day", single);
  $("#week-section").hidden = single || state.collapsed;
  $("#day-navigation").hidden = !(single || state.collapsed);
  $("#collapse-week").textContent = single || state.collapsed ? "↓" : "↑";
  $("#collapse-week").setAttribute(
    "aria-label",
    single ? "展開週行事曆" : state.collapsed ? "展開日期列" : "收起日期列",
  );
  $("#collapse-week").setAttribute(
    "aria-expanded",
    String(!single && !state.collapsed),
  );
  $$("[data-view]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.view === state.view)),
  );
  $("#week-strip").innerHTML = tripDates()
    .map(
      (d) =>
        `<button type="button" class="day-button" data-date="${d}" aria-pressed="${d === state.selectedDay}" aria-label="${Number(d.slice(5, 7))}月${Number(d.slice(-2))}日 ${weekday(d)}"><span class="weekday">${weekday(d)}</span><span class="date-number">${Number(d.slice(-2))}</span></button>`,
    )
    .join("");
  const stripScroll = $(".week-scroll");
  stripScroll.scrollLeft = Math.max(
    0,
    dates.indexOf(state.selectedDay) *
      ($("#week-strip").scrollWidth / dates.length) -
      stripScroll.clientWidth / 2,
  );
  const day = tripDates().indexOf(state.selectedDay);
  $("#day-title").textContent =
    `第 ${day + 1} 天 · ${shortDate(state.selectedDay)}`;
  $("#day-subtitle").textContent = state.trip.themes[state.selectedDay];
  $("#day-illustration").style.filter =
    day === 3 ? "none" : `hue-rotate(${(day - 3) * 11}deg)`;
  $("#selected-date").value = state.selectedDay;
  $("#previous-day").disabled = day === 0;
  $("#next-day").disabled = day === tripDates().length - 1;
  const items = state.items
    .filter((i) => i.date === state.selectedDay)
    .sort(
      (a, b) => minutes(a.start) - minutes(b.start) || a.id.localeCompare(b.id),
    );
  $("#activity-list").innerHTML = items.length
    ? items.map((i) => activityMarkup(i)).join("")
    : '<div class="empty-state">這天還有好多可能 ✳<br>留一段新的旅行回憶吧。<br><button type="button" class="small-button" data-add-empty>＋ 新增行程</button></div>';
  $("#scroll-hint").hidden = single || !items.length;
  $("#global-lock").checked = state.globalLock;
  renderRail(items);
}
function breakdownMarkup(item) {
  if (!item.breakdown) return "";
  const b = item.breakdown;
  const steps = [
    { icon: WALK, value: b.walk1, name: "步行" },
    { icon: TRAIN, value: b.train, name: "火車" },
    { icon: WALK, value: b.walk2, name: "步行" },
  ].filter((s) => s.value > 0);
  if (!steps.length) return "";
  return `<span class="transport-breakdown" aria-label="${steps.map((s) => `${s.name} ${s.value}`).join(" → ")} 分鐘">${steps.map((s, index) => `${index ? '<span class="arrow" aria-hidden="true">→</span>' : ""}<span class="transport-step" aria-hidden="true">${s.icon}<span>${s.value}</span></span>`).join("")}<small aria-hidden="true">分鐘</small></span>`;
}
function activityMarkup(item, preview = false) {
  const category = CATEGORIES[item.category];
  const duration = minutes(item.end) - minutes(item.start);
  const price =
    item.cost > 0
      ? ` · ${item.costLabel ? `${escapeHTML(item.costLabel)} ` : ""}${yen(item.cost)}`
      : "";
  const element = preview ? "article" : "button";
  return `<${element} ${preview ? "" : 'type="button"'} class="activity-card" style="--category:${category.color}" ${preview ? "" : `data-item="${escapeHTML(item.id)}" aria-label="${escapeHTML(item.title)}，${item.start}至${item.end}，單擊預覽、雙擊編輯"`}>
    ${preview ? `<p class="activity-date">${Number(item.date.slice(5, 7))} 月 ${Number(item.date.slice(-2))} 日 · ${weekday(item.date)}${item.locked ? " · 已確認" : ""}</p>` : ""}
    <span class="category-tag">${category.name}</span>${item.locked ? `<span class="item-lock" title="已確認${state.globalLock ? "・時間鎖定中" : ""}" aria-label="已確認">${LOCK}</span>` : ""}
    <span class="activity-name">${escapeHTML(item.title)}</span><span class="activity-time">${item.start}–${item.end} · ${duration}分鐘${price}</span>
    ${item.routeFrom || item.routeTo ? `<span class="activity-route">${escapeHTML(item.routeFrom || "出發地")} → ${escapeHTML(item.routeTo || "目的地")}</span>` : ""}
    ${item.notes ? `<span class="activity-note">${escapeHTML(item.notes)}</span>` : ""}
    ${item.category === "transport" ? breakdownMarkup(item) : ""}
  </${element}>`;
}
function renderRail(items) {
  const start = Math.min(510, ...items.map((i) => minutes(i.start)));
  const end = Math.max(1120, ...items.map((i) => minutes(i.end)));
  const position = (t) => ((t - start) / (end - start)) * 100;
  const ticks = [start];
  for (let t = Math.ceil((start + 1) / 60) * 60; t < end; t += 60)
    ticks.push(t);
  ticks.push(end);
  const segments = items
    .map((i, index) => {
      const overlaps = items
        .slice(0, index)
        .some(
          (other) =>
            minutes(other.start) < minutes(i.end) &&
            minutes(other.end) > minutes(i.start),
        );
      return `<span class="rail-segment${overlaps ? " overlap" : ""}" style="top:${position(minutes(i.start))}%;height:${((minutes(i.end) - minutes(i.start)) / (end - start)) * 100}%;background:${CATEGORIES[i.category].color}" title="${escapeHTML(i.title)} ${i.start}–${i.end}"></span>`;
    })
    .join("");
  let minor = "";
  for (let t = Math.ceil(start / 30) * 30; t < end; t += 30) {
    if (!ticks.includes(t))
      minor += `<span class="rail-minor" style="top:${position(t)}%"></span>`;
  }
  $("#time-rail").innerHTML =
    minor +
    ticks
      .map(
        (t) =>
          `<div class="rail-tick" style="top:${position(t)}%"><span>${clockTime(t)}</span></div>`,
      )
      .join("") +
    segments +
    '<span class="rail-start"></span>';
}
function expenseEntries() {
  return [
    ...state.items
      .filter((i) => i.cost > 0)
      .map((i) => ({ ...i, source: "linked-expense" })),
    ...state.expenses.map((i) => ({ ...i, source: "expense" })),
  ].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.start || "").localeCompare(b.start || ""),
  );
}
function renderExpenses() {
  const entries = expenseEntries();
  const total = entries.reduce((sum, i) => sum + i.cost, 0);
  $("#grand-total").textContent = yen(total);
  $("#hkd-total").textContent =
    `約 HK$${Math.round(total * state.trip.exchangeRate).toLocaleString("zh-TW")}`;
  $("#exchange-note").textContent =
    `估算匯率 ¥1 ≈ HK$${state.trip.exchangeRate} · 可在旅程設定修改`;
  const cats = { ...CATEGORIES, other: { name: "其他", color: "#d9c2d9" } };
  const sums = Object.entries(cats).map(([key, cat]) => ({
    key,
    ...cat,
    total: entries
      .filter((i) => i.category === key)
      .reduce((sum, i) => sum + i.cost, 0),
  }));
  $("#expense-chart").innerHTML = sums
    .filter((c) => c.total > 0)
    .map(
      (c) =>
        `<span style="width:${(c.total / total) * 100}%;background:${c.color}" title="${c.name} ${yen(c.total)}"></span>`,
    )
    .join("");
  $("#expense-categories").innerHTML = sums
    .map(
      (c) =>
        `<div class="expense-category"><i class="dot" style="background:${c.color}"></i><span>${c.name}</span><strong>${yen(c.total)}</strong></div>`,
    )
    .join("");
  $("#expense-list").innerHTML = entries.length
    ? entries
        .map(
          (i) =>
            `<button type="button" class="expense-item" data-expense="${escapeHTML(i.id)}" data-source="${i.source}" aria-label="編輯${escapeHTML(i.title)}的費用"><i class="dot" style="background:${cats[i.category].color}"></i><span class="expense-info"><strong>${escapeHTML(i.title)}</strong><small>${shortDate(i.date)} · ${cats[i.category].name} · ${i.source === "expense" ? "獨立支出" : "來自行程"}</small></span><span class="amount">${yen(i.cost)}</span><span class="edit-arrow" aria-hidden="true">›</span></button>`,
        )
        .join("")
    : '<p class="empty-state">還沒有支出，記下旅途的第一筆吧。</p>';
}
function renderPacking() {
  const selectedGroup = $("#packing-group").value;
  $("#packing-group").innerHTML = state.groups
    .map((g) => `<option>${escapeHTML(g)}</option>`)
    .join("");
  if (state.groups.includes(selectedGroup))
    $("#packing-group").value = selectedGroup;
  const done = state.packing.filter((i) => i.checked).length;
  $("#packing-count").textContent = `${done} / ${state.packing.length} 已收拾`;
  $("#packing-message").textContent =
    state.packing.length && done === state.packing.length
      ? "準備完成！帶著好心情出發吧 ♡"
      : "一樣一樣來，出發就更安心。";
  $("#packing-progress").max = state.packing.length || 1;
  $("#packing-progress").value = done;
  const marks = ["❋", "▤", "ϟ", "✚", "✿"];
  $("#packing-groups").innerHTML = state.groups
    .map((group, index) => {
      const items = state.packing.filter((i) => i.group === group);
      return `<section class="packing-group"><h3><b aria-hidden="true">${marks[index % marks.length]}</b>${escapeHTML(group)}<span>${items.filter((i) => i.checked).length}/${items.length}</span></h3>${items.map((i) => `<div class="packing-row"><label class="packing-check"><input type="checkbox" data-packing="${escapeHTML(i.id)}" ${i.checked ? "checked" : ""}><span>${escapeHTML(i.title)}</span></label><button type="button" class="packing-edit" data-edit-packing="${escapeHTML(i.id)}" aria-label="編輯${escapeHTML(i.title)}">編輯</button><button type="button" class="packing-remove" data-remove-packing="${escapeHTML(i.id)}" aria-label="刪除${escapeHTML(i.title)}">×</button></div>`).join("") || '<p class="help-text">還沒有用品，可從上方新增。</p>'}</section>`;
    })
    .join("");
}

function selectDay(date) {
  if (!tripDates().includes(date)) return;
  clearTimeout(tapTimer);
  state.selectedDay = date;
  persist();
  renderPlan();
  $("#activity-list").scrollTop = 0;
}
function previewItem(id) {
  const item = state.items.find((i) => i.id === id);
  if (!item) return;
  previewId = id;
  $("#preview-content").innerHTML = activityMarkup(item, true);
  $("#preview-dialog").showModal();
}
function configureCategoryOptions(standalone) {
  $("#editor-form").elements.category.innerHTML =
    Object.entries(CATEGORIES)
      .map(
        ([key, c]) =>
          `<option value="${key}">${c.name}${key === "transport" ? "／航班" : ""}</option>`,
      )
      .join("") + (standalone ? '<option value="other">其他</option>' : "");
}
function openEditor(kind = "activity", id = null) {
  clearTimeout(tapTimer);
  const item = id
    ? (kind === "expense" ? state.expenses : state.items).find(
        (i) => i.id === id,
      )
    : null;
  if (id && !item) return;
  editor = { kind, id };
  const isActivity = kind === "activity";
  const form = $("#editor-form");
  form.reset();
  configureCategoryOptions(kind === "expense");
  $$(".itinerary-field").forEach((el) => (el.hidden = !isActivity));
  form.elements.start.required = isActivity;
  form.elements.end.required = isActivity;
  const defaults = {
    date: state.selectedDay,
    category: isActivity ? "sight" : "food",
    title: "",
    start: "09:00",
    end: "10:00",
    cost: 0,
    costLabel: "",
    notes: "",
    routeFrom: "",
    routeTo: "",
  };
  Object.entries({ ...defaults, ...item }).forEach(([key, value]) => {
    if (form.elements[key] && key !== "locked")
      form.elements[key].value = value ?? "";
  });
  form.elements.locked.checked = Boolean(item?.locked);
  ["walk1", "train", "walk2"].forEach(
    (key) => (form.elements[key].value = item?.breakdown?.[key] ?? ""),
  );
  const protectedItem = Boolean(
    item && kind !== "expense" && isProtected(item),
  );
  ["date", "start", "end"].forEach(
    (key) => (form.elements[key].disabled = protectedItem),
  );
  $("#editor-lock-note").hidden = !protectedItem;
  $("#delete-item").hidden = !id;
  $("#delete-item").disabled = protectedItem && isActivity;
  $("#delete-item").textContent =
    kind === "linked-expense" ? "移除費用" : "刪除";
  $("#editor-title").textContent = isActivity
    ? id
      ? "編輯這段旅程"
      : "新增一段旅程"
    : id
      ? "編輯旅行費用"
      : "記下一筆花費";
  $("#form-error").textContent = "";
  updateTransportFields();
  $("#editor-dialog").showModal();
}
function updateTransportFields() {
  $(".transport-fields").hidden = !(
    editor?.kind === "activity" &&
    $("#editor-form").elements.category.value === "transport"
  );
}
async function confirmAction(title, message, accept = "確認") {
  $("#confirm-title").textContent = title;
  $("#confirm-message").textContent = message;
  $("#confirm-accept").textContent = accept;
  const dialog = $("#confirm-dialog");
  dialog.returnValue = "";
  dialog.showModal();
  return new Promise((resolve) =>
    dialog.addEventListener(
      "close",
      () => resolve(dialog.returnValue === "yes"),
      { once: true },
    ),
  );
}
function saveEditor(event) {
  event.preventDefault();
  if (!editor) return;
  const form = event.currentTarget;
  const value = (name) => form.elements[name].value.trim();
  const isActivity = editor.kind === "activity";
  const collection = editor.kind === "expense" ? state.expenses : state.items;
  const existing = collection.find((i) => i.id === editor.id);
  const cost = Number(value("cost"));
  const error = (message) => {
    $("#form-error").textContent = message;
  };
  if (!value("title")) return error("幫這段回憶取個名字吧。");
  if (!tripDates().includes(value("date")))
    return error(
      `請選擇 ${state.trip.startDate} 至 ${state.trip.endDate} 的旅行日期。`,
    );
  if (
    !Number.isFinite(cost) ||
    cost < 0 ||
    !Number.isInteger(cost) ||
    cost > 999999999
  )
    return error("請輸入有效的日圓金額（0 至 999,999,999）。");
  if (
    isActivity &&
    (!value("start") ||
      !value("end") ||
      minutes(value("end")) <= minutes(value("start")))
  )
    return error("結束時間需晚於開始時間。跨日行程請分成兩天記錄。");
  if (
    existing &&
    editor.kind !== "expense" &&
    isProtected(existing) &&
    (value("date") !== existing.date ||
      (isActivity &&
        (value("start") !== existing.start || value("end") !== existing.end)))
  )
    return error("此行程的時間已鎖定，請先解除確認或關閉全域時間鎖定。");
  const item = {
    ...existing,
    id: existing?.id || newId(),
    date: value("date"),
    category: value("category"),
    title: value("title"),
    cost,
    notes: value("notes"),
  };
  if (isActivity) {
    Object.assign(item, {
      start: value("start"),
      end: value("end"),
      costLabel: value("costLabel"),
      routeFrom: value("routeFrom"),
      routeTo: value("routeTo"),
      locked: form.elements.locked.checked,
    });
    if (
      item.category === "transport" &&
      ["walk1", "train", "walk2"].some((key) => value(key) !== "")
    )
      item.breakdown = Object.fromEntries(
        ["walk1", "train", "walk2"].map((key) => [
          key,
          Number(value(key)) || 0,
        ]),
      );
    else delete item.breakdown;
  }
  if (existing) collection[collection.indexOf(existing)] = item;
  else collection.push(item);
  if (isActivity) state.selectedDay = item.date;
  $("#editor-dialog").close();
  editor = null;
  changed("已收進旅行手帳 ♡");
}
async function deleteEditorItem() {
  if (!editor?.id) return;
  const current = { ...editor };
  const collection = current.kind === "expense" ? state.expenses : state.items;
  const item = collection.find((i) => i.id === current.id);
  if (!item) return;
  if (current.kind === "activity" && isProtected(item)) {
    toast("此行程已確認，請先解除時間鎖定。");
    return;
  }
  const linked = current.kind === "linked-expense";
  if (
    !(await confirmAction(
      linked ? "移除這筆費用？" : "刪除這筆記錄？",
      `「${item.title}」${linked ? "的金額將歸零，行程內容會保留。" : "刪除後無法復原。"}`,
      linked ? "移除費用" : "確認刪除",
    ))
  )
    return;
  if (linked) item.cost = 0;
  else collection.splice(collection.indexOf(item), 1);
  $("#editor-dialog").close();
  editor = null;
  changed(linked ? "費用已移除，行程仍在。" : "已刪除這筆記錄");
}

let settingsDraft = null;
function settingsError(message) {
  $("#settings-error").textContent = message;
  if (message) $("#settings-error").scrollIntoView({ block: "nearest" });
}
function openSettings() {
  clearTimeout(tapTimer);
  settingsDraft = JSON.parse(JSON.stringify(state));
  const form = $("#settings-form");
  form.reset();
  const trip = settingsDraft.trip;
  for (const key of [
    "destination",
    "eyebrow",
    "stamp",
    "startDate",
    "endDate",
    "exchangeRate",
  ])
    form.elements[key].value = trip[key];
  form.elements.tripTitle.value = trip.title;
  settingsError("");
  $("#backup-error").textContent = "";
  $("#backup-status").textContent = "";
  $("#settings-themes").replaceChildren();
  renderSettingsDates();
  renderSettingsGroups();
  $("#settings-dialog").showModal();
  $("#settings-dialog").scrollTop = 0;
}
function rememberThemes() {
  $$("[data-theme-date]").forEach((input) => {
    settingsDraft.trip.themes[input.dataset.themeDate] = input.value;
  });
}
function renderSettingsDates() {
  const form = $("#settings-form");
  rememberThemes();
  try {
    const dates = dateRange(
      form.elements.startDate.value,
      form.elements.endDate.value,
    );
    $("#settings-day-count").textContent = `共 ${dates.length} 日`;
    $("#settings-themes").innerHTML = dates
      .map((date, index) => {
        const theme = settingsDraft.trip.themes[date] ?? `第 ${index + 1} 天`;
        return `<label>第 ${index + 1} 天 · ${shortDate(date)}<input data-theme-date="${date}" value="${escapeHTML(theme)}" maxlength="100" required /></label>`;
      })
      .join("");
  } catch (error) {
    $("#settings-day-count").textContent = error.message;
  }
}
function syncSettingsGroups() {
  const inputs = $$("[data-group-name]");
  const names = inputs.map((input) => input.value.trim());
  if (
    names.some((g) => !g || g.length > 60) ||
    new Set(names).size !== names.length
  ) {
    settingsError("分類名稱請填 1–60 個字，每個分類要有唔同名稱。");
    return false;
  }
  const mapping = new Map(settingsDraft.groups.map((g, i) => [g, names[i]]));
  settingsDraft.packing.forEach((item) => {
    item.group = mapping.get(item.group);
  });
  settingsDraft.groups = names;
  return true;
}
function renderSettingsGroups() {
  $("#settings-groups").innerHTML = settingsDraft.groups
    .map((group, index, groups) => {
      const count = settingsDraft.packing.filter(
        (i) => i.group === group,
      ).length;
      return `<div class="settings-group-row">
      <label>分類 ${index + 1} · ${count} 件用品<input data-group-name="${index}" value="${escapeHTML(group)}" maxlength="60" required /></label>
      <label>刪除時，用品搬去<select data-group-target="${index}" ${groups.length === 1 ? "disabled" : ""}>${groups.map((g, i) => (i === index ? "" : `<option value="${i}">${escapeHTML(g)}</option>`)).join("")}</select></label>
      <button type="button" class="delete-button" data-delete-group="${index}" ${groups.length === 1 ? "disabled" : ""}>刪除此分類</button>
    </div>`;
    })
    .join("");
}
async function saveSettings(event) {
  event.preventDefault();
  settingsError("");
  const form = event.currentTarget;
  const value = (key) => form.elements[key].value.trim();
  rememberThemes();
  try {
    if (
      !["tripTitle", "destination", "eyebrow", "stamp"].every(
        (k) => value(k) && value(k).length <= 100,
      )
    )
      throw new Error(
        "手帳標題、目的地、小標同印章文案都要填寫，最多 100 個字。",
      );
    const dates = dateRange(value("startDate"), value("endDate"));
    const rate = Number(value("exchangeRate"));
    if (
      !value("exchangeRate") ||
      !Number.isFinite(rate) ||
      rate <= 0 ||
      rate > 1000
    )
      throw new Error("匯率請填大過 0、不超過 1000 的數字，例如 0.052。");
    const themes = Object.fromEntries(
      dates.map((d, i) => [
        d,
        (settingsDraft.trip.themes[d] ?? `第 ${i + 1} 天`).trim(),
      ]),
    );
    if (Object.values(themes).some((t) => !t || t.length > 100))
      throw new Error("每日標題請填 1–100 個字。");
    if (!syncSettingsGroups()) return;
    const removedItems = state.items.filter((i) => !dates.includes(i.date));
    const removedExpenses = state.expenses.filter(
      (i) => !dates.includes(i.date),
    );
    if (removedItems.length || removedExpenses.length) {
      const removedDates = [
        ...new Set([...removedItems, ...removedExpenses].map((i) => i.date)),
      ].sort();
      const accepted = await confirmAction(
        "呢幾日嘅資料要一併刪除？",
        `新日期範圍：${value("startDate")} 至 ${value("endDate")}。\n移出範圍：${removedDates.join("、")}\n會刪除 ${removedItems.length} 筆行程（包括其費用）及 ${removedExpenses.length} 筆獨立支出，已確認或鎖定嘅行程亦包括在內。刪除後無法復原，建議先匯出備份。\n撳「取消」可保留現有資料，設定唔會套用。`,
        "一併刪除並儲存",
      );
      if (!accepted) return;
    }
    const next = normalizeState({
      ...state,
      trip: {
        title: value("tripTitle"),
        destination: value("destination"),
        eyebrow: value("eyebrow"),
        stamp: value("stamp"),
        startDate: dates[0],
        endDate: dates.at(-1),
        exchangeRate: rate,
        themes,
      },
      groups: settingsDraft.groups,
      packing: settingsDraft.packing,
      items: state.items.filter((i) => dates.includes(i.date)),
      expenses: state.expenses.filter((i) => dates.includes(i.date)),
    });
    state = next;
    $("#settings-dialog").close();
    changed("旅程設定已儲存 ♡");
  } catch (error) {
    settingsError(error.message);
  }
}
function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `旅行手帳備份-${state.trip.startDate}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  $("#backup-status").textContent = "備份已準備好，請保留下載嘅 JSON 檔案。";
}
async function importBackup(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;
  $("#backup-error").textContent = "";
  try {
    if (file.size > 10 * 1024 * 1024)
      throw new Error("備份檔案太大，請選擇 10 MB 以內的手帳 JSON。");
    const next = normalizeState(JSON.parse(await file.text()));
    if (
      !(await confirmAction(
        "用備份取代目前手帳？",
        `備份：${next.trip.title}・${next.trip.destination}\n${next.trip.startDate} 至 ${next.trip.endDate}\n${next.items.length} 筆行程、${next.expenses.length} 筆獨立支出、${next.packing.length} 件用品。\n目前全部資料及未儲存設定都會被取代，無法復原。建議先匯出目前手帳。`,
        "取代並匯入",
      ))
    )
      return;
    clearTimeout(tapTimer);
    state = next;
    $("#settings-dialog").close();
    changed("備份已匯入，旅程帶過嚟了 ♡");
  } catch (error) {
    $("#backup-error").textContent =
      error instanceof SyntaxError
        ? "呢份檔案唔係有效的 JSON，請選擇手帳匯出的備份。原有資料已保留。"
        : `${error.message} 原有資料已保留。`;
    $("#backup-error").scrollIntoView({ block: "nearest" });
  }
}
$("#open-settings").addEventListener("click", openSettings);
$("#settings-form").addEventListener("submit", saveSettings);
for (const key of ["startDate", "endDate"])
  $("#settings-form").elements[key].addEventListener(
    "change",
    renderSettingsDates,
  );
$("#settings-groups").addEventListener("input", (event) => {
  if (!event.target.matches("[data-group-name]")) return;
  const index = event.target.dataset.groupName;
  $$("[data-group-target] option")
    .filter((option) => option.value === index)
    .forEach((option) => {
      option.textContent = event.target.value;
    });
});
$("#add-group").addEventListener("click", () => {
  if (!syncSettingsGroups()) return;
  const name = $("#new-group-name").value.trim();
  if (!name || name.length > 60 || settingsDraft.groups.includes(name))
    return settingsError("請填寫一個唔重複的新分類名稱（1–60 個字）。");
  if (settingsDraft.groups.length >= 30)
    return settingsError("最多可有 30 個用品分類。");
  settingsDraft.groups.push(name);
  $("#new-group-name").value = "";
  settingsError("");
  renderSettingsGroups();
});
$("#settings-groups").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-group]");
  if (!button || !syncSettingsGroups()) return;
  const index = Number(button.dataset.deleteGroup);
  const group = settingsDraft.groups[index];
  const target =
    settingsDraft.groups[Number($(`[data-group-target="${index}"]`).value)];
  if (!target || target === group || settingsDraft.groups.length <= 1) return;
  const count = settingsDraft.packing.filter((i) => i.group === group).length;
  if (
    !(await confirmAction(
      "刪除呢個分類？",
      `刪除「${group}」，${count} 件用品會全部搬去「${target}」，勾選狀態亦會保留。撳「儲存設定」後先會套用。`,
      "搬移用品並刪除分類",
    ))
  )
    return;
  settingsDraft.packing.forEach((i) => {
    if (i.group === group) i.group = target;
  });
  settingsDraft.groups.splice(index, 1);
  settingsError("");
  renderSettingsGroups();
});
$("#export-backup").addEventListener("click", exportBackup);
$("#import-backup").addEventListener("click", () => $("#backup-file").click());
$("#backup-file").addEventListener("change", importBackup);

// Event delegation keeps dynamically added cards and checklist rows interactive.
$(".main-tabs").addEventListener("click", (event) => {
  const b = event.target.closest("[data-tab]");
  if (!b) return;
  clearTimeout(tapTimer);
  state.tab = b.dataset.tab;
  persist();
  render();
});
$$("[data-view]").forEach((b) =>
  b.addEventListener("click", () => {
    state.view = b.dataset.view;
    if (state.view === "week") state.collapsed = false;
    persist();
    renderPlan();
  }),
);
$("#collapse-week").addEventListener("click", () => {
  if (state.view === "day") {
    state.view = "week";
    state.collapsed = false;
  } else state.collapsed = !state.collapsed;
  persist();
  renderPlan();
});
$("#week-strip").addEventListener("click", (e) => {
  const b = e.target.closest("[data-date]");
  if (b) selectDay(b.dataset.date);
});
$("#selected-date").addEventListener("change", (e) =>
  selectDay(e.target.value),
);
$("#previous-day").addEventListener("click", () =>
  selectDay(tripDates()[tripDates().indexOf(state.selectedDay) - 1]),
);
$("#next-day").addEventListener("click", () =>
  selectDay(tripDates()[tripDates().indexOf(state.selectedDay) + 1]),
);
$("#add-activity").addEventListener("click", () => openEditor());
$("#activity-list").addEventListener("click", (e) => {
  if (e.target.closest("[data-add-empty]")) {
    openEditor();
    return;
  }
  const b = e.target.closest("[data-item]");
  if (!b) return;
  const id = b.dataset.item;
  const now = Date.now();
  if (e.detail === 0) {
    previewItem(id);
    return;
  }
  if (lastTap.id === id && now - lastTap.time < 340) {
    clearTimeout(tapTimer);
    lastTap = { id: null, time: 0 };
    openEditor("activity", id);
  } else {
    clearTimeout(tapTimer);
    lastTap = { id, time: now };
    tapTimer = setTimeout(() => {
      lastTap = { id: null, time: 0 };
      previewItem(id);
    }, 340);
  }
});
$("#activity-list").addEventListener("dblclick", (e) => e.preventDefault());
$("#activity-list").addEventListener(
  "scroll",
  () => {
    clearTimeout(tapTimer);
    lastTap = { id: null, time: 0 };
  },
  { passive: true },
);
$("#global-lock").addEventListener("change", (e) => {
  state.globalLock = e.target.checked;
  changed(
    state.globalLock ? "已保護確認行程的日期與時間" : "已解除全域時間鎖定",
  );
});
$$("[data-close]").forEach((b) =>
  b.addEventListener("click", () =>
    document.getElementById(b.dataset.close).close(),
  ),
);
$$("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }),
);
$("#preview-edit").addEventListener("click", () => {
  $("#preview-dialog").close();
  openEditor("activity", previewId);
});
$("#editor-form").addEventListener("submit", saveEditor);
$("#editor-form").elements.category.addEventListener(
  "change",
  updateTransportFields,
);
$("#delete-item").addEventListener("click", deleteEditorItem);
$("#confirm-cancel").addEventListener("click", () =>
  $("#confirm-dialog").close("no"),
);
$("#confirm-accept").addEventListener("click", () =>
  $("#confirm-dialog").close("yes"),
);
$("#add-expense").addEventListener("click", () => openEditor("expense"));
$("#expense-list").addEventListener("click", (e) => {
  const b = e.target.closest("[data-expense]");
  if (b) openEditor(b.dataset.source, b.dataset.expense);
});
$("#packing-add-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = $("#packing-new").value.trim();
  if (!title) return;
  state.packing.push({
    id: newId(),
    title,
    group: $("#packing-group").value,
    checked: false,
  });
  $("#packing-new").value = "";
  changed("又準備好一點了！");
  $("#packing-new").focus();
});
$("#packing-groups").addEventListener("change", (e) => {
  const id = e.target.dataset.packing;
  if (!id) return;
  const item = state.packing.find((i) => i.id === id);
  if (item) {
    item.checked = e.target.checked;
    persist();
    renderPacking();
    $(`[data-packing="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
  }
});
let packingEditorId = null;
$("#packing-groups").addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-packing]");
  const item = state.packing.find((i) => i.id === button?.dataset.editPacking);
  if (!item) return;
  packingEditorId = item.id;
  const form = $("#packing-editor-form");
  form.elements.title.value = item.title;
  form.elements.group.innerHTML = state.groups
    .map((g) => `<option>${escapeHTML(g)}</option>`)
    .join("");
  form.elements.group.value = item.group;
  $("#packing-editor-error").textContent = "";
  $("#packing-editor-dialog").showModal();
});
$("#packing-editor-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const title = form.elements.title.value.trim();
  const item = state.packing.find((i) => i.id === packingEditorId);
  if (
    !title ||
    title.length > 60 ||
    !state.groups.includes(form.elements.group.value)
  ) {
    $("#packing-editor-error").textContent =
      "請填寫用品名稱（1–60 個字），並選擇分類。";
    return;
  }
  if (!item) return;
  item.title = title;
  item.group = form.elements.group.value;
  $("#packing-editor-dialog").close();
  changed("用品已儲存");
});
$("#packing-groups").addEventListener("click", async (e) => {
  const b = e.target.closest("[data-remove-packing]");
  if (!b) return;
  const item = state.packing.find((i) => i.id === b.dataset.removePacking);
  if (!item) return;
  if (
    await confirmAction(
      "不需要帶這個了？",
      `從清單移除「${item.title}」。`,
      "移除用品",
    )
  ) {
    state.packing = state.packing.filter((i) => i.id !== item.id);
    changed("已從行李清單移除");
  }
});
async function resetData() {
  if (
    await confirmAction(
      "重新翻開示範手帳？",
      "目前全部行程、費用、行李及旅程設定都會被北海道過年示範資料取代，無法復原。建議先匯出備份。",
      "還原示範資料",
    )
  ) {
    clearTimeout(tapTimer);
    state = seedState();
    $("#settings-dialog").close();
    changed("北海道過年示範行程已還原");
  }
}
$("#reset-data").addEventListener("click", resetData);
$("#settings-reset").addEventListener("click", resetData);
// Keep another open tab in sync without overwriting its unsaved editor.
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY && !$("dialog[open]")) {
    state = loadState();
    render();
  }
});
$("#station-scene").innerHTML = STATION;
$("#day-illustration").innerHTML = SCENERY;
render();
if (needsMigration) persist();
if (loadWarning) toast(loadWarning);
