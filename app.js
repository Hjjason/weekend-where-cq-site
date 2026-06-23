const districts = [
  "全城",
  "两江新区",
  "万州",
  "黔江",
  "涪陵",
  "渝中",
  "大渡口",
  "沙坪坝",
  "九龙坡",
  "南岸",
  "北碚",
  "巴南",
  "长寿",
  "江津",
  "合川",
  "永川",
  "南川",
  "綦江",
  "大足",
  "璧山",
  "铜梁",
  "潼南",
  "荣昌",
  "开州",
  "梁平",
  "武隆",
  "城口",
  "丰都",
  "垫江",
  "忠县",
  "云阳",
  "奉节",
  "巫山",
  "巫溪",
  "石柱",
  "秀山",
  "酉阳",
  "彭水"
];
const types = ["全部", "公园", "露营", "徒步", "网红点", "室内"];
const primaryDistricts = ["全城", "渝中", "大渡口", "沙坪坝", "九龙坡", "两江新区", "南岸", "北碚", "巴南"];
const districtInitials = {
  全城: "Q",
  两江新区: "L",
  万州: "W",
  黔江: "Q",
  涪陵: "F",
  渝中: "Y",
  大渡口: "D",
  沙坪坝: "S",
  九龙坡: "J",
  南岸: "N",
  北碚: "B",
  巴南: "B",
  长寿: "C",
  江津: "J",
  合川: "H",
  永川: "Y",
  南川: "N",
  綦江: "Q",
  大足: "D",
  璧山: "B",
  铜梁: "T",
  潼南: "T",
  荣昌: "R",
  开州: "K",
  梁平: "L",
  武隆: "W",
  城口: "C",
  丰都: "F",
  垫江: "D",
  忠县: "Z",
  云阳: "Y",
  奉节: "F",
  巫山: "W",
  巫溪: "W",
  石柱: "S",
  秀山: "X",
  酉阳: "Y",
  彭水: "P"
};

const demoPhotoSets = {
  park: [
    "./assets/zhaomushan.jpg",
    "./assets/guangyang-island.jpg",
    "./assets/tieshanping.jpg",
    "./assets/zhaomushan.jpg",
    "./assets/guangyang-island.jpg",
    "./assets/tieshanping.jpg"
  ],
  camp: [
    "./assets/jinyun-camp.jpg",
    "./assets/tieshanping.jpg",
    "./assets/zhaomushan.jpg",
    "./assets/jinyun-camp.jpg",
    "./assets/guangyang-island.jpg"
  ],
  hike: [
    "./assets/tieshanping.jpg",
    "./assets/zhaomushan.jpg",
    "./assets/jinyun-camp.jpg",
    "./assets/tieshanping.jpg"
  ],
  indoor: [
    "./assets/kids-indoor.jpg",
    "./assets/guangyang-island.jpg",
    "./assets/kids-indoor.jpg",
    "./assets/zhaomushan.jpg"
  ],
  viral: [
    "./assets/guangyang-island.jpg",
    "./assets/zhaomushan.jpg",
    "./assets/kids-indoor.jpg",
    "./assets/tieshanping.jpg",
    "./assets/guangyang-island.jpg"
  ]
};

const WEATHER_CODE_MAP = {
  0: { icon: "☀", text: "晴" },
  1: { icon: "🌤", text: "晴间多云" },
  2: { icon: "⛅", text: "多云" },
  3: { icon: "☁", text: "阴" },
  45: { icon: "🌫", text: "雾" },
  48: { icon: "🌫", text: "雾" },
  51: { icon: "🌦", text: "小雨" },
  53: { icon: "🌦", text: "小雨" },
  55: { icon: "🌧", text: "中雨" },
  61: { icon: "🌦", text: "小雨" },
  63: { icon: "🌧", text: "中雨" },
  65: { icon: "🌧", text: "大雨" },
  80: { icon: "🌦", text: "阵雨" },
  81: { icon: "🌧", text: "阵雨" },
  82: { icon: "⛈", text: "强阵雨" },
  95: { icon: "⛈", text: "雷雨" }
};

const defaultCityWeather = makeFallbackWeather("重庆", "阴", 24, 21, 26);

let weatherRuntime = { generatedAt: "", city: defaultCityWeather, places: {} };

function weatherIcon(code, fallbackText = "多云") {
  return WEATHER_CODE_MAP[Number(code)] || { icon: "⛅", text: fallbackText };
}

function makeFallbackWeather(name, text = "阴", current = 24, low = 21, high = 26) {
  const startHour = new Date().getHours();
  const icon = text.includes("雨") ? "🌧" : text.includes("晴") ? "☀" : text.includes("阴") ? "☁" : "⛅";
  const hourly = Array.from({ length: 24 }, (_, index) => {
    const hour = (startHour + index) % 24;
    const temp = Math.round(current + Math.sin(index / 24 * Math.PI * 2) * 2);
    return { time: index === 0 ? "现在" : `${String(hour).padStart(2, "0")}:00`, icon, text, temp: `${temp}°C` };
  });
  const daily = Array.from({ length: 7 }, (_, index) => {
    const d = new Date();
    d.setDate(d.getDate() + index);
    const labels = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return { label: index === 0 ? "今天" : labels[d.getDay()], icon, text, low: low + (index % 2), high: high + (index % 3) - 1 };
  });
  return { name, text, icon, temp: `${current}°C`, high, low, hourly, daily, source: "fallback" };
}

function runtimeWeatherFor(place) {
  return weatherRuntime.places?.[place.id] || makeFallbackWeather(place.name, "阴", 24, 21, 26);
}

function weatherTextFromRuntime(summary) {
  return `${summary.text}，${summary.temp}`;
}

function weatherSourceText(summary = weatherRuntime.city) {
  const source = summary.sourceLabel || weatherRuntime.sourceLabel || (summary.source === "open-meteo" ? "Open-Meteo" : "天气数据");
  const updated = summary.updatedAtLocal || weatherRuntime.generatedAtLocal || weatherRuntime.generatedAt;
  if (!updated) return source;
  const date = new Date(updated);
  if (Number.isNaN(date.getTime())) return source;
  const time = date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai"
  });
  return `${source} · ${time}更新`;
}

function cityWeatherHint(summary = weatherRuntime.city) {
  if (/雨|雷/.test(summary.text)) return "适合室内";
  if (/晴|多云|阴/.test(summary.text)) return "适合出行";
  return "灵活安排";
}

let places = [];

let activeDistrict = "全城";
let activeType = "全部";
let showingFavorites = false;
let activeIndex = 0;
let navTargetPlace = null;
let photoScale = 1;
let photoOffset = { x: 0, y: 0 };
let photoDrag = null;
let photoPointerState = new Map();
let photoPinch = null;
let photoGestureMode = "idle";
let photoSwipeLock = false;
let activePhotoPhotos = [];
let activePhotoIndex = 0;
const favorites = new Set(JSON.parse(localStorage.getItem("weekend-favorites") || "[]"));

const districtFilters = document.querySelector("#districtFilters");
const districtPanel = document.querySelector("#districtPanel");
const districtToggle = document.querySelector("#districtToggle");
const typeFilters = document.querySelector("#typeFilters");
const track = document.querySelector("#recommendTrack");
const dots = document.querySelector("#dots");
const favCount = document.querySelector("#favCount");
const openFavoritesButton = document.querySelector("#openFavorites");
const toast = document.querySelector("#toast");
const sheet = document.querySelector("#detailSheet");
const sheetTitle = document.querySelector("#sheetTitle");
const sheetType = document.querySelector("#sheetType");
const photoStrip = document.querySelector("#photoStrip");
const detailReason = document.querySelector("#detailReason");
const infoList = document.querySelector("#infoList");
const searchSheet = document.querySelector("#searchSheet");
const placeSearchInput = document.querySelector("#placeSearchInput");
const searchResults = document.querySelector("#searchResults");
const navSheet = document.querySelector("#navSheet");
const navOptions = document.querySelector("#navOptions");
const weatherSheet = document.querySelector("#weatherSheet");
const weatherKicker = document.querySelector("#weatherKicker");
const weatherTitle = document.querySelector("#weatherTitle");
const hourlyWeather = document.querySelector("#hourlyWeather");
const photoViewer = document.querySelector("#photoViewer");
const photoViewerImage = document.querySelector("#photoViewerImage");
const photoStage = document.querySelector("#photoStage");
const prevPhotoButton = document.querySelector("#prevPhoto");
const nextPhotoButton = document.querySelector("#nextPhoto");
const placeStats = document.querySelector("#placeStats");
let tapTimer = null;
let lastTap = { id: null, time: 0 };
let districtPanelOpen = false;
let searchScrollY = 0;

function phoneList(place) {
  return Array.isArray(place.phone) ? place.phone : [place.phone].filter(Boolean);
}

function phoneLinks(place) {
  const phones = phoneList(place).filter((phone) => phone && !String(phone).includes("暂无"));
  if (!phones.length) return "暂无公开电话";
  return phones.map((phone) => `<a href="tel:${phone}">${phone}</a>`).join(" / ");
}

function formatTodayWeather(summary = weatherRuntime.city) {
  const now = new Date();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return `${now.getMonth() + 1}月${now.getDate()}日 · ${weekdays[now.getDay()]} ${weatherTextFromRuntime(summary)}`;
}

function weatherFit(place, summary) {
  if (place.type === "室内") return summary.text.includes("雨") ? 24 : 12;
  if (place.type === "露营" && /雨|雷|大雨/.test(summary.text)) return -28;
  if (place.type === "徒步" && /雨|雷|大雨/.test(summary.text)) return -18;
  if (/晴|多云|阴/.test(summary.text)) return 18;
  return 4;
}

function dailySeed(id = "") {
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}-${id}`;
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return hash % 17;
}

function crowdScore(place) {
  const hour = new Date().getHours();
  const weekend = [0, 6].includes(new Date().getDay());
  const base = place.crowd === "中等" ? 18 : place.crowd === "中高" ? 10 : place.crowd === "偏高" ? 6 : 12;
  const peakPenalty = weekend && hour >= 10 && hour <= 17 ? 6 : 0;
  return Math.max(2, base - peakPenalty);
}

function normalizePlace(place) {
  const runtime = runtimeWeatherFor(place);
  const weatherText = weatherTextFromRuntime(runtime);
  const photos = Array.isArray(place.photos) && place.photos.length ? place.photos : [place.image].filter(Boolean);
  return {
    ...place,
    photos: photos.slice(0, 10),
    phone: Array.isArray(place.phone) ? place.phone : [place.phone].filter(Boolean),
    weatherText,
    weather: weatherText,
    weatherSummary: runtime,
    hourlyWeather: runtime.hourly || defaultCityWeather.hourly,
    dailyWeather: runtime.daily || defaultCityWeather.daily,
    coords: place.coords || { lat: 29.563, lng: 106.5516 },
    tags: place.tags || [],
    reasonKeywords: place.reasonKeywords || [],
    details: place.details || {}
  };
}

async function loadWeatherRuntime() {
  if (location.protocol !== "file:") {
    try {
      const response = await fetch("./data/weather.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`weather.json ${response.status}`);
      weatherRuntime = await response.json();
      return;
    } catch (error) {
      console.warn("Failed to load data/weather.json, using fallback weather.", error);
    }
  }
  weatherRuntime = window.WEEKEND_WEATHER || { generatedAt: "", city: defaultCityWeather, places: {} };
}

async function loadPlaces() {
  if (location.protocol !== "file:") {
    try {
      const response = await fetch("./data/places.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`places.json ${response.status}`);
      const data = await response.json();
      return data.map(normalizePlace);
    } catch (error) {
      console.warn("Failed to load data/places.json, using bundled fallback.", error);
    }
  }
  return (window.WEEKEND_PLACES || []).map(normalizePlace);
}

async function boot() {
  await loadWeatherRuntime();
  document.querySelector("#todayWeather").textContent = formatTodayWeather();
  document.querySelector("#openCityWeather strong").textContent = cityWeatherHint();
  places = await loadPlaces();
  rerender();
}

function isPrimaryDistrict(place) {
  return primaryDistricts.includes(place.district);
}

function recommendationScore(place) {
  const summary = place.weatherSummary || runtimeWeatherFor(place);
  const heat = Number(place.heat || 0);
  const typeScore = activeType === "全部" ? 8 : place.type === activeType ? 30 : 0;
  const districtScore = activeDistrict === "全城" ? (isPrimaryDistrict(place) ? 18 : 6) : place.district === activeDistrict ? 24 : 0;
  const weatherScore = weatherFit(place, summary);
  const dayVariance = dailySeed(place.id);
  return heat + crowdScore(place) + typeScore + districtScore + weatherScore + dayVariance;
}

function filteredPlaces() {
  const byDistrict = activeDistrict === "全城";
  const list = places.filter((place) => {
    const matchesDistrict = byDistrict || place.district === activeDistrict;
    const matchesType = activeType === "全部" || place.type === activeType;
    const matchesFavorite = !showingFavorites || favorites.has(place.id);
    return matchesDistrict && matchesType && matchesFavorite;
  });

  return list.sort((a, b) => recommendationScore(b) - recommendationScore(a));
}

function renderFilters() {
  const visibleDistricts = primaryDistricts.includes(activeDistrict)
    ? primaryDistricts
    : [activeDistrict, ...primaryDistricts];

  districtFilters.innerHTML = visibleDistricts
    .map((item) => `<button class="chip ${item === activeDistrict ? "active" : ""} ${item === "两江新区" ? "two-line" : ""}" data-district="${item}">${districtChipLabel(item)}</button>`)
    .join("");

  typeFilters.innerHTML = types
    .map((item) => `<button class="chip ${item === activeType ? "active" : ""}" data-type="${item}">${item}</button>`)
    .join("");

  renderDistrictPanel();
}

function districtChipLabel(item) {
  if (item !== "两江新区") return item;
  return "<span>两江</span><span>新区</span>";
}

function renderDistrictPanel() {
  const grouped = districts.filter((item) => item !== "全城").reduce((acc, item) => {
    const initial = districtInitials[item];
    if (!initial) return acc;
    acc[initial] = acc[initial] || [];
    acc[initial].push(item);
    return acc;
  }, {});

  districtPanel.innerHTML = Object.keys(grouped)
    .sort((a, b) => a.localeCompare(b))
    .map((initial) => `
      <section class="district-group">
        <h3>${initial}</h3>
        <div>
          ${grouped[initial].map((item) => `<button class="mini-chip ${item === activeDistrict ? "active" : ""}" data-district="${item}">${item}</button>`).join("")}
        </div>
      </section>
    `)
    .join("");

  districtPanel.classList.toggle("is-open", districtPanelOpen);
  districtPanel.setAttribute("aria-hidden", String(!districtPanelOpen));
  districtToggle.classList.toggle("active", districtPanelOpen);
  districtToggle.setAttribute("aria-expanded", String(districtPanelOpen));
}

function renderCards() {
  const list = filteredPlaces();
  activeIndex = Math.min(activeIndex, Math.max(list.length - 1, 0));

  if (!list.length) {
    const title = showingFavorites ? "暂无收藏" : "暂无推荐";
    const copy = showingFavorites
      ? "双击喜欢的推荐卡片，它会出现在这里。"
      : `${activeDistrict} · ${activeType} 热门地点库待接入，后续将聚合官方、授权商家、用户投稿和平台公开热度。`;
    track.innerHTML = `<article class="place-card empty"><div class="card-copy"><h2>${title}</h2><p>${copy}</p></div></article>`;
    dots.innerHTML = "";
    return;
  }

  track.innerHTML = list
    .map((place) => `
      <article class="place-card ${favorites.has(place.id) ? "is-favorite" : ""} ${place.image ? "" : "no-photo"}" data-id="${place.id}" tabindex="0">
        ${place.image ? `<img src="${place.image}" alt="${place.name}" loading="lazy" />` : `<div class="photo-pending"><span>暂无授权照片</span></div>`}
        <button class="favorite-toggle" type="button" data-favorite-id="${place.id}" aria-label="${favorites.has(place.id) ? "取消收藏" : "收藏"} ${place.name}" aria-pressed="${favorites.has(place.id)}">
          <span>♡</span>
          <strong>♥ 已收藏</strong>
        </button>
        <div class="card-copy">
          <h2>${place.name}</h2>
          <p>${place.subtitle}</p>
          <div class="card-stats">
            <span>${place.weatherText}</span>
            <span>热度 ${place.heat}</span>
          </div>
          <div class="tag-row">${place.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
          <div class="reason-keywords">${place.reasonKeywords.slice(0, 3).map((tag) => `<span>${tag}</span>`).join("")}</div>
          <div class="card-actions">
            <button class="card-detail-btn" type="button" data-detail-id="${place.id}">查看详情</button>
          </div>
        </div>
      </article>
    `)
    .join("");

  dots.innerHTML = list
    .map((_, index) => `<button class="${index === activeIndex ? "active" : ""}" data-dot="${index}" aria-label="第 ${index + 1} 个推荐"></button>`)
    .join("");

}

function updatePlaceStats() {
  if (!placeStats) return;
  const today = shanghaiDateString(0);
  const addedToday = places.filter((place) => place.addedAt === today).length;
  placeStats.textContent = `今日新增 ${addedToday} 个地点，共计 ${places.length} 个地点。`;
}

function updateDots() {
  [...dots.querySelectorAll("button")].forEach((dot, index) => {
    dot.classList.toggle("active", index === activeIndex);
  });
}

function saveFavorites() {
  localStorage.setItem("weekend-favorites", JSON.stringify([...favorites]));
  favCount.textContent = favorites.size;
  openFavoritesButton.classList.toggle("is-active", showingFavorites);
  openFavoritesButton.setAttribute("aria-pressed", String(showingFavorites));
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1300);
}

function toggleFavorite(id) {
  if (!id) return;
  if (favorites.has(id)) {
    favorites.delete(id);
    showToast("已取消收藏");
  } else {
    favorites.add(id);
    showToast("已收藏");
  }
  saveFavorites();
  rerender();
}

function currentPlace() {
  return filteredPlaces()[activeIndex] || null;
}

function openDetail(place) {
  if (!place) return;
  sheetTitle.textContent = place.name;
  sheetType.textContent = `${place.type} · ${place.district}`;
  photoStrip.innerHTML = place.photos.length
    ? place.photos.slice(0, 10)
        .map((src, index) => `
          <button class="photo-thumb" type="button" data-photo-index="${index}" data-photo-src="${src}" data-photo-alt="${place.name} 照片 ${index + 1}">
            <img src="${src}" alt="${place.name} 照片" loading="lazy" />
          </button>
        `)
        .join("")
    : `<div class="photo-missing">暂无已核验授权照片</div>`;
  detailReason.innerHTML = `
    <h3>今日推荐理由</h3>
    <p>${place.reason}</p>
    <div class="detail-metrics">
      <span><small>人流</small><strong>${place.crowd}</strong></span>
      <button class="metric-tile" type="button" data-weather-place="${place.id}"><small>天气</small><strong>${place.weather}</strong></button>
      <span><small>热度</small><strong>${place.heat}</strong></span>
      <span><small>区域</small><strong>${place.district}</strong></span>
    </div>
  `;
  infoList.innerHTML = renderInfoList(place);
  sheet.classList.add("is-open");
  sheet.setAttribute("aria-hidden", "false");
}

function closeDetail() {
  sheet.classList.remove("is-open");
  sheet.setAttribute("aria-hidden", "true");
}

function applyPhotoTransform() {
  photoViewerImage.style.transform = `translate(${photoOffset.x}px, ${photoOffset.y}px) scale(${photoScale})`;
}

function resetPhotoZoom() {
  photoScale = 1;
  photoOffset = { x: 0, y: 0 };
  applyPhotoTransform();
}

function setPhotoScale(nextScale) {
  photoScale = Math.round(Math.min(4, Math.max(1, nextScale)) * 100) / 100;
  if (photoScale === 1) photoOffset = { x: 0, y: 0 };
  applyPhotoTransform();
}

function showPhotoAt(index) {
  if (!activePhotoPhotos.length) return;
  activePhotoIndex = (index + activePhotoPhotos.length) % activePhotoPhotos.length;
  const item = activePhotoPhotos[activePhotoIndex];
  photoViewerImage.alt = item.alt || "地点照片";
  photoViewerImage.classList.add("is-loading");
  photoViewerImage.onload = () => {
    photoViewerImage.classList.remove("is-loading");
  };
  photoViewerImage.onerror = () => {
    photoViewerImage.classList.remove("is-loading");
    photoViewerImage.removeAttribute("src");
    photoViewerImage.alt = "照片暂时无法加载";
  };
  photoViewerImage.src = item.src;
  resetPhotoZoom();
  const multi = activePhotoPhotos.length > 1;
  prevPhotoButton.hidden = !multi;
  nextPhotoButton.hidden = !multi;
  preloadAdjacentPhotos();
}

function openPhotoViewer(photos, index = 0) {
  activePhotoPhotos = photos;
  if (!activePhotoPhotos.length) return;
  showPhotoAt(index);
  photoViewer.classList.add("is-open");
  photoViewer.setAttribute("aria-hidden", "false");
}

function closePhotoViewer() {
  photoViewer.classList.remove("is-open");
  photoViewer.setAttribute("aria-hidden", "true");
  photoDrag = null;
  photoPinch = null;
  photoGestureMode = "idle";
  photoSwipeLock = false;
  photoPointerState.clear();
  activePhotoPhotos = [];
}

function preloadAdjacentPhotos() {
  if (activePhotoPhotos.length < 2) return;
  [activePhotoIndex - 1, activePhotoIndex + 1].forEach((index) => {
    const item = activePhotoPhotos[(index + activePhotoPhotos.length) % activePhotoPhotos.length];
    if (!item?.src) return;
    const image = new Image();
    image.src = item.src;
  });
}

function photoPointerDistance() {
  const points = [...photoPointerState.values()];
  if (points.length < 2) return 0;
  return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
}

function beginPhotoPointer(event) {
  photoPointerState.set(event.pointerId, { x: event.clientX, y: event.clientY });
  photoStage.setPointerCapture(event.pointerId);
  if (photoPointerState.size >= 2) {
    photoPinch = { distance: photoPointerDistance(), scale: photoScale };
    photoGestureMode = "pinch";
    photoSwipeLock = true;
    photoDrag = null;
    return;
  }
  photoGestureMode = photoScale > 1 ? "pan" : "pending";
  photoDrag = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    originX: photoOffset.x,
    originY: photoOffset.y,
    moved: false
  };
}

function movePhotoPointer(event) {
  if (!photoPointerState.has(event.pointerId)) return;
  photoPointerState.set(event.pointerId, { x: event.clientX, y: event.clientY });
  if (photoPinch && photoPointerState.size >= 2) {
    const distance = photoPointerDistance();
    if (photoPinch.distance > 0) setPhotoScale(photoPinch.scale * (distance / photoPinch.distance));
    return;
  }
  if (!photoDrag || photoDrag.pointerId !== event.pointerId) return;
  const dx = event.clientX - photoDrag.startX;
  const dy = event.clientY - photoDrag.startY;
  photoDrag.moved = Math.abs(dx) > 18 || Math.abs(dy) > 18;
  if (photoScale > 1) {
    photoGestureMode = "pan";
    photoOffset = {
      x: photoDrag.originX + dx,
      y: photoDrag.originY + dy
    };
    applyPhotoTransform();
  } else if (photoDrag.moved && Math.abs(dx) > Math.abs(dy) * 1.2) {
    photoGestureMode = "swipe";
  }
}

function endPhotoPointer(event) {
  const drag = photoDrag;
  photoPointerState.delete(event.pointerId);
  if (photoPointerState.size < 2) photoPinch = null;
  if (drag && drag.pointerId === event.pointerId && photoScale === 1 && drag.moved && photoGestureMode === "swipe" && !photoSwipeLock) {
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      showPhotoAt(activePhotoIndex + (dx < 0 ? 1 : -1));
    }
  }
  photoDrag = null;
  if (!photoPointerState.size) {
    photoGestureMode = "idle";
    photoSwipeLock = false;
  }
}

function renderInfoList(place) {
  const rows = [
    ["电话", phoneLinks(place)],
    ["地址", `<button class="address-link" type="button" data-address-nav="${place.id}">${place.details.地址}</button>`],
    ...Object.entries(place.details).filter(([key]) => key !== "地址")
  ];
  return rows
    .map(([key, value]) => `<div class="info-item"><dt>${key}</dt><dd>${value}</dd></div>`)
    .join("");
}

function updateSearchViewport() {
  if (!searchSheet.classList.contains("is-open")) return;
  const viewport = window.visualViewport;
  const height = viewport ? viewport.height : window.innerHeight;
  const top = viewport ? viewport.offsetTop : 0;
  const keyboardInset = Math.max(0, window.innerHeight - height - top);
  document.documentElement.style.setProperty("--search-keyboard-inset", `${Math.round(keyboardInset)}px`);
}

function openSearch() {
  searchScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  searchSheet.classList.add("is-open");
  searchSheet.setAttribute("aria-hidden", "false");
  document.body.classList.add("search-active");
  document.body.style.top = `-${searchScrollY}px`;
  placeSearchInput.value = "";
  document.querySelector(".search-card")?.scrollTo({ top: 0, behavior: "auto" });
  searchResults.scrollTop = 0;
  updateSearchViewport();
  renderSearchResults();
  window.setTimeout(() => {
    try {
      placeSearchInput.focus({ preventScroll: true });
    } catch {
      placeSearchInput.focus();
    }
    updateSearchViewport();
  }, 120);
}

function closeSearch() {
  searchSheet.classList.remove("is-open");
  searchSheet.setAttribute("aria-hidden", "true");
  document.body.classList.remove("search-active");
  document.body.style.top = "";
  document.documentElement.style.removeProperty("--search-keyboard-inset");
  window.scrollTo(0, searchScrollY);
}

function mapUrls(place) {
  const name = encodeURIComponent(place.name);
  const address = encodeURIComponent(place.details.地址 || place.name);
  const lat = place.coords.lat;
  const lng = place.coords.lng;
  return [
    {
      name: "高德地图",
      appUrl: `iosamap://path?sourceApplication=weekend-demo&dlat=${lat}&dlon=${lng}&dname=${name}&dev=0&t=0`,
      androidUrl: `androidamap://route/plan/?sourceApplication=weekend-demo&dlat=${lat}&dlon=${lng}&dname=${name}&dev=0&t=0`,
      fallback: isIOS() ? "itms-apps://itunes.apple.com/cn/app/gao-de-di-tu/id461703208?mt=8" : "market://details?id=com.autonavi.minimap"
    },
    {
      name: "百度地图",
      appUrl: `baidumap://map/direction?destination=latlng:${lat},${lng}|name:${name}&mode=driving&coord_type=gcj02&src=weekend-demo`,
      androidUrl: `baidumap://map/direction?destination=latlng:${lat},${lng}|name:${name}&mode=driving&coord_type=gcj02&src=weekend-demo`,
      fallback: isIOS() ? "itms-apps://itunes.apple.com/cn/app/bai-du-di-tu/id452186370?mt=8" : "market://details?id=com.baidu.BaiduMap"
    },
    {
      name: "苹果地图",
      appUrl: `https://maps.apple.com/?daddr=${address}&dirflg=d`,
      androidUrl: `https://maps.apple.com/?daddr=${address}&dirflg=d`,
      fallback: "https://maps.apple.com/"
    }
  ];
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function appUrlFor(option) {
  return /Android/i.test(navigator.userAgent) ? option.androidUrl : option.appUrl;
}

function openMapOption(option) {
  const openedAt = Date.now();
  let fallbackTimer = null;
  const cancelFallback = () => {
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  };
  window.addEventListener("pagehide", cancelFallback, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) cancelFallback();
  }, { once: true });
  fallbackTimer = window.setTimeout(() => {
    if (!document.hidden && Date.now() - openedAt >= 1400) {
      showToast(`未检测到${option.name}，正在打开下载页`);
      window.location.href = option.fallback;
    }
  }, 1500);
  window.location.href = appUrlFor(option);
}

function openNavSheet(place) {
  if (!place) return;
  navTargetPlace = place;
  navOptions.innerHTML = mapUrls(place)
    .map((option, index) => `
      <button class="nav-option" type="button" data-map-index="${index}">
        <strong>${option.name}</strong>
      </button>
    `)
    .join("");
  navSheet.classList.add("is-open");
  navSheet.setAttribute("aria-hidden", "false");
}

function closeNavSheet() {
  navTargetPlace = null;
  navSheet.classList.remove("is-open");
  navSheet.setAttribute("aria-hidden", "true");
}

function tempNumber(value) {
  const match = String(value || "").match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

function weatherSummary(hourly) {
  const temps = hourly.map((item) => tempNumber(item.temp)).filter((value) => Number.isFinite(value));
  const current = hourly[0] || { text: "晴", temp: "26°C", icon: "☀" };
  const currentTemp = tempNumber(current.temp);
  return {
    current,
    temp: currentTemp === null ? current.temp : `${currentTemp}°`,
    high: temps.length ? Math.max(...temps) : 28,
    low: temps.length ? Math.min(...temps) : 21
  };
}

function shanghaiDateString(offset = 0) {
  const shanghaiNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  shanghaiNow.setDate(shanghaiNow.getDate() + offset);
  const year = shanghaiNow.getFullYear();
  const month = String(shanghaiNow.getMonth() + 1).padStart(2, "0");
  const day = String(shanghaiNow.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function forecastLabel(dateString, fallbackLabel) {
  if (!dateString) return fallbackLabel;
  if (dateString === shanghaiDateString(0)) return "今天";
  const weekday = new Date(`${dateString}T00:00:00+08:00`).getDay();
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][weekday];
}

function normalizeForecastDays(days) {
  const today = shanghaiDateString(0);
  return (days || [])
    .filter((day) => !day.date || day.date >= today)
    .map((day) => ({
      ...day,
      label: forecastLabel(day.date, day.label)
    }));
}

function forecastDays(summary) {
  const icons = [summary.current.icon, "⛅", "☀", "☁", "🌦", "⛅", "☀", "☁"];
  return Array.from({ length: 7 }, (_, index) => {
    const date = shanghaiDateString(index);
    const low = Math.max(18, summary.low + (index % 3) - 1);
    const high = Math.max(low + 3, summary.high + ((index + 1) % 4) - 2);
    return { date, label: forecastLabel(date), icon: icons[index], low, high };
  });
}

function openWeatherSheet(title, kicker, hourly, daily = null, sourceSummary = weatherRuntime.city) {
  const summary = weatherSummary(hourly);
  const forecast = normalizeForecastDays(daily).length ? normalizeForecastDays(daily) : forecastDays(summary);
  weatherKicker.textContent = kicker;
  weatherTitle.textContent = title;
  hourlyWeather.innerHTML = `
    <section class="weather-hero">
      <p>${title.replace("天气", "")}</p>
      <strong>${summary.temp}</strong>
      <span>${summary.current.text}</span>
      <b>H:${summary.high}° L:${summary.low}°</b>
    </section>
    <section class="weather-aqi">
      <h3>32 - Excellent</h3>
      <div class="aqi-bar"><span></span></div>
      <p>当前空气质量适合户外活动，午后注意补水和防晒。</p>
    </section>
    <section class="weather-notice">
      ${summary.current.text.includes("阴") ? "傍晚云量增加，建议带一件薄外套。" : "午后户外体感较热，树荫和临水区域更舒适。"}
    </section>
    <p class="weather-source">${weatherSourceText(sourceSummary)}</p>
    <section class="hourly-panel" aria-label="当天每小时天气，可左右滑动">
      <div class="hour-strip">
        ${hourly
          .map((item, index) => `
            <div class="hour-card">
              <span>${index === 0 ? "现在" : item.time.replace(":00", "")}</span>
              <strong>${item.icon}</strong>
              <em>${item.text}</em>
              <b>${item.temp}</b>
            </div>
          `)
          .join("")}
      </div>
    </section>
    <section class="forecast-card" aria-label="未来几天天气">
      <h3>未来几天预报</h3>
      <div class="forecast-list">
        ${forecast
          .map((day, index) => `
            <div class="forecast-row">
              <p>${day.label}</p>
              <span>${day.icon}</span>
              <strong>${day.low}°</strong>
              <div class="forecast-line"><i style="width:${42 + index * 4}%; margin-left:${18 + (index % 4) * 7}%"></i></div>
              <strong>${day.high}°</strong>
            </div>
          `)
          .join("")}
      </div>
    </section>
  `;
  weatherSheet.classList.add("is-open");
  weatherSheet.setAttribute("aria-hidden", "false");
}

function closeWeatherSheet() {
  weatherSheet.classList.remove("is-open");
  weatherSheet.setAttribute("aria-hidden", "true");
}

function renderSearchResults() {
  const keyword = placeSearchInput.value.trim().toLowerCase();
  const resultList = places.filter((place) => {
    if (!keyword) return true;
    return [place.name, place.district, place.type, place.subtitle, ...place.tags]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  });

  searchResults.innerHTML = resultList.length
    ? resultList
        .map((place) => `
          <button class="search-result" data-place-id="${place.id}">
            ${place.image ? `<img src="${place.image}" alt="" loading="lazy" />` : `<span class="search-no-photo">待补</span>`}
            <span>
              <strong>${place.name}</strong>
              <small>${place.district} · ${place.type} · ${place.tags.slice(0, 2).join(" / ")}</small>
            </span>
          </button>
        `)
        .join("")
    : `<p class="empty-search">暂未找到这个地点。后续接入全区县热门地点库后会覆盖更多结果。</p>`;
}

function rerender() {
  renderFilters();
  renderCards();
  updatePlaceStats();
  saveFavorites();
}

districtFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-district]");
  if (!button) return;
  activeDistrict = button.dataset.district;
  showingFavorites = false;
  activeIndex = 0;
  rerender();
});

districtPanel.addEventListener("click", (event) => {
  const button = event.target.closest("[data-district]");
  if (!button) return;
  activeDistrict = button.dataset.district;
  showingFavorites = false;
  districtPanelOpen = false;
  activeIndex = 0;
  rerender();
});

districtToggle.addEventListener("click", () => {
  districtPanelOpen = !districtPanelOpen;
  renderFilters();
});

typeFilters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-type]");
  if (!button) return;
  activeType = button.dataset.type;
  showingFavorites = false;
  activeIndex = 0;
  rerender();
});

track.addEventListener("pointerup", (event) => {
  const card = event.target.closest("[data-id]");
  if (!card) return;
  if (event.target.closest("a[href^='tel:']")) return;
  const now = Date.now();
  const id = card.dataset.id;
  const list = filteredPlaces();
  activeIndex = list.findIndex((place) => place.id === id);
  updateDots();

  const favoriteButton = event.target.closest("[data-favorite-id]");
  if (favoriteButton) {
    window.clearTimeout(tapTimer);
    toggleFavorite(favoriteButton.dataset.favoriteId);
    lastTap = { id: null, time: 0 };
    return;
  }

  if (event.target.closest("[data-detail-id]")) {
    window.clearTimeout(tapTimer);
    openDetail(list[activeIndex]);
    lastTap = { id: null, time: 0 };
    return;
  }

  if (lastTap.id === id && now - lastTap.time < 320) {
    window.clearTimeout(tapTimer);
    toggleFavorite(id);
    lastTap = { id: null, time: 0 };
    return;
  }

  lastTap = { id, time: now };
  window.clearTimeout(tapTimer);
  tapTimer = window.setTimeout(() => openDetail(list[activeIndex]), 260);
});

track.addEventListener("scroll", () => {
  const cards = [...track.querySelectorAll(".place-card")];
  if (!cards.length) return;
  const center = track.scrollLeft + track.clientWidth / 2;
  const nearest = cards
    .map((card, index) => ({
      index,
      distance: Math.abs(card.offsetLeft + card.offsetWidth / 2 - center)
    }))
    .sort((a, b) => a.distance - b.distance)[0];
  if (nearest && nearest.index !== activeIndex) {
    activeIndex = nearest.index;
    updateDots();
  }
}, { passive: true });

dots.addEventListener("click", (event) => {
  const button = event.target.closest("[data-dot]");
  if (!button) return;
  activeIndex = Number(button.dataset.dot);
  const card = track.querySelectorAll(".place-card")[activeIndex];
  card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  renderCards();
});

openFavoritesButton.addEventListener("click", () => {
  showingFavorites = !showingFavorites;
  activeIndex = 0;
  rerender();
  showToast(showingFavorites ? "已显示收藏夹" : "已回到推荐");
});
document.querySelector("#closeSheet").addEventListener("click", closeDetail);
document.querySelector("#closeBackdrop").addEventListener("click", closeDetail);
document.querySelector("#openSearch").addEventListener("click", openSearch);
document.querySelector("#closeSearch").addEventListener("click", closeSearch);
document.querySelector("#closeSearchBackdrop").addEventListener("click", closeSearch);
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", updateSearchViewport, { passive: true });
  window.visualViewport.addEventListener("scroll", updateSearchViewport, { passive: true });
}
document.querySelector("#closeNav").addEventListener("click", closeNavSheet);
document.querySelector("#closeNavBackdrop").addEventListener("click", closeNavSheet);
document.querySelector("#closeWeather").addEventListener("click", closeWeatherSheet);
document.querySelector("#closeWeatherBackdrop").addEventListener("click", closeWeatherSheet);
document.querySelector("#closePhotoViewer").addEventListener("click", closePhotoViewer);
document.querySelector("#closePhotoBackdrop").addEventListener("click", closePhotoViewer);
prevPhotoButton.addEventListener("click", () => showPhotoAt(activePhotoIndex - 1));
nextPhotoButton.addEventListener("click", () => showPhotoAt(activePhotoIndex + 1));
document.querySelector("#openCityWeather").addEventListener("click", (event) => {
  if (event.target.closest("#openSearch")) return;
  openWeatherSheet("重庆整体天气", "", weatherRuntime.city.hourly || defaultCityWeather.hourly, weatherRuntime.city.daily || defaultCityWeather.daily, weatherRuntime.city || defaultCityWeather);
});
placeSearchInput.addEventListener("input", renderSearchResults);
photoStrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-photo-src]");
  if (!button) return;
  const photos = [...photoStrip.querySelectorAll("[data-photo-src]")].map((item) => ({
    src: item.dataset.photoSrc,
    alt: item.dataset.photoAlt
  }));
  openPhotoViewer(photos, Number(button.dataset.photoIndex || 0));
});
photoStage.addEventListener("pointerdown", beginPhotoPointer);
photoStage.addEventListener("pointermove", movePhotoPointer);
photoStage.addEventListener("pointerup", endPhotoPointer);
photoStage.addEventListener("pointercancel", endPhotoPointer);
photoStage.addEventListener("dblclick", () => setPhotoScale(photoScale > 1 ? 1 : 2));
detailReason.addEventListener("click", (event) => {
  const button = event.target.closest("[data-weather-place]");
  if (!button) return;
  const place = places.find((candidate) => candidate.id === button.dataset.weatherPlace);
  if (place) openWeatherSheet(`${place.name}天气`, "", place.hourlyWeather || defaultCityWeather.hourly, place.dailyWeather || defaultCityWeather.daily, place.weatherSummary || defaultCityWeather);
});
infoList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-address-nav]");
  if (!button) return;
  const place = places.find((candidate) => candidate.id === button.dataset.addressNav);
  if (place) openNavSheet(place);
});
navOptions.addEventListener("click", (event) => {
  const button = event.target.closest("[data-map-index]");
  if (!button || !navTargetPlace) return;
  const option = mapUrls(navTargetPlace)[Number(button.dataset.mapIndex)];
  if (option) openMapOption(option);
});
searchResults.addEventListener("click", (event) => {
  const item = event.target.closest("[data-place-id]");
  if (!item) return;
  const place = places.find((candidate) => candidate.id === item.dataset.placeId);
  if (!place) return;
  closeSearch();
  activeDistrict = place.district;
  activeType = place.type;
  showingFavorites = false;
  districtPanelOpen = false;
  activeIndex = 0;
  rerender();
  openDetail(place);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePhotoViewer();
    closeDetail();
    closeSearch();
    closeNavSheet();
    closeWeatherSheet();
  }
});

boot();
