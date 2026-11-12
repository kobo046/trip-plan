"use strict";

// Everything stays on this device. No accounts, analytics, or remote data services.
const STORAGE_KEY = "tabinichi-nagoya-v1";
const DATES = Array.from(
  { length: 8 },
  (_, i) => `2026-12-${String(i + 3).padStart(2, "0")}`,
);
const CATEGORIES = {
  sight: { name: "景點", color: "#f2ce70" },
  food: { name: "餐飲", color: "#ee9c92" },
  stay: { name: "住宿", color: "#9bc9dc" },
  transport: { name: "交通", color: "#accf98" },
};
const GROUPS = ["衣服", "證件", "電子", "藥品", "其他"];
const THEMES = [
  "初次見面，名古屋",
  "城郭、綠意與榮町散步",
  "犬山城下町慢慢走",
  "金城埠頭，鐵道與海風",
  "神宮參拜與老街午茶",
  "汽車故事與暖暖咖啡",
  "大須挖寶，帶一點回憶回家",
  "帶著滿滿回憶，回家囉",
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
      date: DATES[day - 1],
      category,
      title,
      start,
      end,
      cost,
      notes,
      locked: false,
      ...extra,
    });
  add(
    1,
    "transport",
    "飛往中部國際機場",
    "09:30",
    "13:15",
    18400,
    "示範航班時間，請依實際機票調整。",
    { costLabel: "全家" },
  );
  add(1, "food", "機場的第一碗烏龍麵", "13:30", "14:15", 2100);
  add(
    1,
    "transport",
    "名鐵往名古屋站",
    "14:30",
    "15:20",
    2940,
    "預留入境與購票時間。",
    {
      routeFrom: "中部國際機場",
      routeTo: "名古屋站",
      breakdown: { walk1: 10, train: 37, walk2: 3 },
    },
  );
  add(
    1,
    "stay",
    "名古屋站飯店・入住",
    "15:30",
    "16:30",
    16800,
    "示範房費為家庭每晚預算，並非實際訂房報價。",
    { locked: true },
  );
  add(
    1,
    "sight",
    "名古屋站周邊小散步",
    "16:45",
    "17:45",
    0,
    "看看金鐘，熟悉附近的便利商店。",
  );
  add(1, "food", "味噌豬排，開動！", "18:00", "19:00", 3900);
  add(2, "food", "飯店早餐", "08:30", "09:15", 1800);
  add(
    2,
    "transport",
    "搭地鐵去名古屋城",
    "09:20",
    "10:00",
    720,
    "費用皆為示範家庭預算。",
  );
  add(
    2,
    "sight",
    "名古屋城與金鯱",
    "10:00",
    "12:00",
    1000,
    "沿城牆散步；開放區域以當日現場為準。",
  );
  add(2, "food", "金鯱橫丁午餐", "12:15", "13:15", 3300);
  add(
    2,
    "sight",
    "榮町・久屋大通公園",
    "13:45",
    "15:45",
    0,
    "帶杯熱飲，坐下看人來人往。",
  );
  add(2, "sight", "名古屋電視塔看城市", "16:00", "17:00", 2600);
  add(2, "food", "熱騰騰的味噌煮烏龍", "17:30", "18:30", 3000);
  add(2, "stay", "回飯店，好好休息", "19:00", "20:00", 16800);
  add(3, "food", "早餐與熱咖啡", "08:00", "08:45", 1600);
  add(3, "transport", "名鐵電車到犬山", "09:00", "10:00", 2480, "", {
    routeFrom: "名古屋站",
    routeTo: "犬山站",
    breakdown: { walk1: 10, train: 35, walk2: 15 },
  });
  add(
    3,
    "sight",
    "犬山城，木造天守的風景",
    "10:00",
    "12:00",
    1100,
    "階梯較陡，穿雙好走的鞋子。",
  );
  add(3, "food", "城下町午餐與糰子", "12:00", "13:15", 3200);
  add(3, "sight", "三光稻荷與木曾川散步", "13:30", "15:30", 0);
  add(3, "transport", "慢慢搭車回名古屋", "16:00", "17:00", 2480);
  add(3, "food", "車站地下街晚餐", "17:30", "18:30", 3500);
  add(3, "stay", "飯店夜晚・整理照片", "19:00", "20:00", 16800);
  // The first two entries intentionally preserve the reference's exact copy and timing.
  add(
    4,
    "food",
    "飯店早餐",
    "08:30",
    "09:15",
    1800,
    "09:15-10:00 青波線往金城埠頭，含步行與候車。",
  );
  add(4, "transport", "路程時間", "09:15", "09:57", 720, "", {
    costLabel: "全家",
    routeFrom: "飯店早餐",
    routeTo: "磁浮、鐵道館",
    breakdown: { walk1: 15, train: 24, walk2: 3 },
  });
  add(
    4,
    "sight",
    "磁浮・鐵道館",
    "10:00",
    "13:45",
    2400,
    "示範參觀安排：新幹線展示、歷代列車與鐵道模型。中途留時間吃午餐。",
  );
  add(
    4,
    "food",
    "鐵道便當午餐",
    "12:30",
    "13:30",
    2700,
    "在館內指定飲食區享用，與參觀時段重疊。",
  );
  add(
    4,
    "transport",
    "青波線回名古屋站",
    "13:45",
    "14:20",
    720,
    "回飯店稍作休息，留一點空白給旅程。",
  );
  add(
    4,
    "stay",
    "飯店午休・補充元氣",
    "14:30",
    "16:00",
    16800,
    "真正的住宿休息時段，今晚房費記在這裡。",
  );
  add(4, "sight", "街角小店散步", "16:00", "16:15", 0);
  add(4, "food", "名古屋風味晚餐", "17:00", "18:00", 4200);
  add(4, "sight", "冬日街景，拍張合照", "18:00", "18:10", 0);
  add(
    4,
    "transport",
    "散步回飯店",
    "18:10",
    "18:40",
    0,
    "路上補買隔天的水與小零食。",
    {
      routeFrom: "晚餐餐廳",
      routeTo: "飯店",
      breakdown: { walk1: 30, train: 0, walk2: 0 },
    },
  );
  add(5, "food", "睡飽再吃早餐", "08:30", "09:15", 1700);
  add(5, "transport", "往熱田神宮", "09:30", "10:15", 840);
  add(
    5,
    "sight",
    "熱田神宮・森林參拜",
    "10:15",
    "12:00",
    0,
    "放慢腳步，聽一聽參道上的風。",
  );
  add(
    5,
    "food",
    "鰻魚飯三吃午餐",
    "12:15",
    "13:30",
    9600,
    "示範預算，預留排隊時間。",
  );
  add(5, "sight", "白鳥庭園賞景", "14:00", "15:30", 600);
  add(5, "food", "老街咖啡小歇", "15:45", "16:30", 1800);
  add(5, "transport", "地鐵回車站", "16:45", "17:20", 840);
  add(5, "food", "家庭食堂晚餐", "17:30", "18:30", 3100);
  add(5, "stay", "飯店・洗衣與休息", "19:00", "20:00", 16800);
  add(6, "food", "早安，名古屋", "08:30", "09:15", 1600);
  add(
    6,
    "transport",
    "出發去豐田博物館",
    "09:30",
    "10:45",
    2500,
    "地鐵轉乘 Linimo，實際班次請另行確認。",
  );
  add(
    6,
    "sight",
    "豐田博物館・汽車時光",
    "10:45",
    "12:45",
    2400,
    "示範行程，開館日期與票價請依官方資訊安排。",
  );
  add(6, "food", "博物館午餐", "12:45", "13:45", 3200);
  add(6, "sight", "汽車文化資料館慢慢看", "13:45", "15:00", 0);
  add(6, "transport", "回到市區", "15:15", "16:30", 2500);
  add(6, "food", "暖暖咖啡與小點心", "16:30", "17:15", 1700);
  add(6, "food", "拉麵晚餐", "18:00", "19:00", 2600);
  add(6, "stay", "飯店・自由的夜晚", "19:30", "20:30", 16800);
  add(7, "food", "喫茶店晨間套餐", "08:30", "09:30", 1800);
  add(7, "transport", "搭地鐵到大須", "09:45", "10:15", 720);
  add(7, "sight", "大須觀音與商店街", "10:15", "12:15", 0);
  add(7, "food", "大須街頭小吃午餐", "12:15", "13:15", 3000);
  add(
    7,
    "sight",
    "伴手禮與古著尋寶",
    "13:30",
    "16:00",
    4500,
    "示範購物預算，可依實際購物調整。",
  );
  add(7, "food", "最後一晚，壽司小聚", "17:00", "18:15", 6200);
  add(7, "transport", "回飯店整理行李", "18:30", "19:00", 720);
  add(7, "stay", "把回憶裝進行李箱", "19:00", "20:30", 16800);
  add(8, "food", "出發前的早餐", "08:00", "08:45", 1800);
  add(
    8,
    "stay",
    "飯店退房・檢查行李",
    "09:00",
    "09:30",
    0,
    "護照、充電器和小熊，都帶好了嗎？",
  );
  add(8, "transport", "名鐵往中部國際機場", "09:45", "10:45", 2940, "", {
    routeFrom: "名古屋站",
    routeTo: "中部國際機場",
    breakdown: { walk1: 10, train: 37, walk2: 13 },
  });
  add(8, "food", "機場午餐與最後的點心", "11:00", "12:00", 2800);
  add(
    8,
    "transport",
    "再見日本・回家的航班",
    "13:30",
    "17:00",
    0,
    "示範航班時間；來回機票費用已記在第一天。",
    { locked: true },
  );
  const packing = {
    衣服: [
      "保暖外套",
      "毛衣／發熱衣",
      "日常換洗衣物",
      "內衣褲與襪子",
      "好走的鞋",
      "圍巾與帽子",
    ],
    證件: [
      "護照",
      "機票與訂房資料",
      "住所屆／住宿地址備份",
      "旅遊保險資料",
      "信用卡與日圓現金",
      "入境資料（依個人需要）",
    ],
    電子: [
      "手機與充電線",
      "插頭轉接器",
      "行動電源（隨身攜帶）",
      "相機與記憶卡",
      "上網 eSIM／SIM 資料",
    ],
    藥品: ["個人常用藥", "腸胃藥", "暈車藥", "OK 繃"],
    其他: ["摺疊傘", "環保袋", "保溫水瓶", "牙刷與盥洗用品", "護唇膏與保濕乳"],
  };
  return {
    version: 1,
    items,
    expenses: [
      {
        id: "extra-1",
        date: DATES[0],
        category: "other",
        title: "全家上網 eSIM",
        cost: 1600,
        notes: "示範獨立支出；未列於行程。",
      },
    ],
    packing: GROUPS.flatMap((group) =>
      packing[group].map((title, index) => ({
        id: `pack-${group}-${index}`,
        group,
        title,
        checked: group === "證件" && index < 2,
      })),
    ),
    selectedDay: DATES[3],
    tab: "plan",
    view: "week",
    collapsed: false,
    globalLock: false,
  };
}

// Validate saved input before rendering. A damaged/old save must not break the app.
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const validDate = (d) => DATES.includes(d);
    const validCost = (n) => Number.isFinite(n) && n >= 0 && n <= 999999999;
    const validTime = (t) =>
      typeof t === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);
    const validItem = (i) =>
      i &&
      typeof i.id === "string" &&
      typeof i.title === "string" &&
      validDate(i.date) &&
      CATEGORIES[i.category] &&
      validCost(i.cost) &&
      validTime(i.start) &&
      validTime(i.end) &&
      minutes(i.end) > minutes(i.start) &&
      (!i.breakdown ||
        ["walk1", "train", "walk2"].every(
          (k) =>
            Number.isFinite(i.breakdown[k]) &&
            i.breakdown[k] >= 0 &&
            i.breakdown[k] <= 1440,
        ));
    if (
      !s ||
      s.version !== 1 ||
      !Array.isArray(s.items) ||
      !s.items.every(validItem) ||
      !Array.isArray(s.expenses) ||
      !s.expenses.every(
        (i) =>
          i &&
          typeof i.id === "string" &&
          typeof i.title === "string" &&
          validDate(i.date) &&
          (CATEGORIES[i.category] || i.category === "other") &&
          validCost(i.cost),
      ) ||
      !Array.isArray(s.packing) ||
      !s.packing.every(
        (i) =>
          i &&
          typeof i.id === "string" &&
          typeof i.title === "string" &&
          GROUPS.includes(i.group),
      )
    )
      return seedState();
    return {
      ...s,
      selectedDay: validDate(s.selectedDay) ? s.selectedDay : DATES[3],
      tab: ["plan", "expenses", "packing"].includes(s.tab) ? s.tab : "plan",
      view: s.view === "day" ? "day" : "week",
      collapsed: Boolean(s.collapsed),
      globalLock: Boolean(s.globalLock),
    };
  } catch {
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

function render() {
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
  $("#week-strip").innerHTML = DATES.map(
    (d) =>
      `<button type="button" class="day-button" data-date="${d}" aria-pressed="${d === state.selectedDay}" aria-label="12月${Number(d.slice(-2))}日 ${weekday(d)}"><span class="weekday">${weekday(d)}</span><span class="date-number">${Number(d.slice(-2))}</span></button>`,
  ).join("");
  const day = DATES.indexOf(state.selectedDay);
  $("#day-title").textContent =
    `第 ${day + 1} 天 · ${shortDate(state.selectedDay)}`;
  $("#day-subtitle").textContent = THEMES[day];
  $("#day-illustration").style.filter =
    day === 3 ? "none" : `hue-rotate(${(day - 3) * 11}deg)`;
  $("#selected-date").value = state.selectedDay;
  $("#previous-day").disabled = day === 0;
  $("#next-day").disabled = day === 7;
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
    ${preview ? `<p class="activity-date">12 月 ${Number(item.date.slice(-2))} 日 · ${weekday(item.date)}${item.locked ? " · 已確認" : ""}</p>` : ""}
    <span class="category-tag">${category.name}</span>${item.locked ? `<span class="item-lock" title="已確認${state.globalLock ? "・時間鎖定中" : ""}" aria-label="已確認">${LOCK}</span>` : ""}
    <span class="activity-name">${escapeHTML(item.title)}</span><span class="activity-time">${item.start}–${item.end} · ${duration}分鐘${item.title === "飯店早餐" && item.date === DATES[3] && !preview ? "" : price}</span>
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
    `約 HK$${Math.round(total * 0.052).toLocaleString("zh-TW")}`;
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
  const done = state.packing.filter((i) => i.checked).length;
  $("#packing-count").textContent = `${done} / ${state.packing.length} 已收拾`;
  $("#packing-message").textContent =
    state.packing.length && done === state.packing.length
      ? "準備完成！帶著好心情出發吧 ♡"
      : "一樣一樣來，出發就更安心。";
  $("#packing-progress").max = state.packing.length || 1;
  $("#packing-progress").value = done;
  const marks = ["❋", "▤", "ϟ", "✚", "✿"];
  $("#packing-groups").innerHTML = GROUPS.map((group, index) => {
    const items = state.packing.filter((i) => i.group === group);
    return `<section class="packing-group"><h3><b aria-hidden="true">${marks[index]}</b>${group}<span>${items.filter((i) => i.checked).length}/${items.length}</span></h3>${items.map((i) => `<div class="packing-row"><label class="packing-check"><input type="checkbox" data-packing="${escapeHTML(i.id)}" ${i.checked ? "checked" : ""}><span>${escapeHTML(i.title)}</span></label><button type="button" class="packing-remove" data-remove-packing="${escapeHTML(i.id)}" aria-label="刪除${escapeHTML(i.title)}">×</button></div>`).join("") || '<p class="help-text">還沒有用品，可從上方新增。</p>'}</section>`;
  }).join("");
}

function selectDay(date) {
  if (!DATES.includes(date)) return;
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
  if (!DATES.includes(value("date")))
    return error("請選擇 2026/12/03 至 12/10 的旅行日期。");
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
  selectDay(DATES[DATES.indexOf(state.selectedDay) - 1]),
);
$("#next-day").addEventListener("click", () =>
  selectDay(DATES[DATES.indexOf(state.selectedDay) + 1]),
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
$("#reset-data").addEventListener("click", async () => {
  if (
    await confirmAction(
      "重新翻開示範手帳？",
      "目前的行程、費用與行李清單都會被名古屋示範資料取代，無法復原。",
      "還原示範資料",
    )
  ) {
    clearTimeout(tapTimer);
    state = seedState();
    changed("名古屋示範行程已還原");
  }
});
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
