/* =========================================================
   VELORIARIDE — PREMIUM EDITION
   main.js
   ---------------------------------------------------------
   Sections:
   1. PRICING DATA & WHATSAPP NUMBER — edit your real values here
   2. LANGUAGE SWITCHER
   3. MOBILE NAV TOGGLE
   4. BOOKING CALENDAR
   5. BOOKING FORM (price calculation)
   6. CONTACT FORM
   7. FAQ ACCORDION
   8. GALLERY LIGHTBOX
   9. WHATSAPP WIDGET
   ========================================================= */

/* =========================================================
   1. PRICING DATA & CONTACT DETAILS
   ---------------------------------------------------------
   Edit these values — every page that shows a price or the
   WhatsApp number reads from here.
   ========================================================= */
const PRICING = {
  mt07:     { day: 55,  week: 339,  month: 1155, deposit: 300, key: "bike_mt07_name" },
  mt09:     { day: 75,  week: 462,  month: 1575, deposit: 500, key: "bike_mt09_name" },
  tracer7:  { day: 65,  week: 401,  month: 1365, deposit: 400, key: "bike_tracer7_name" },
  tracer9:  { day: 89,  week: 549,  month: 1869, deposit: 600, key: "bike_tracer9_name" },
};

/* WhatsApp business number, international format, no spaces or symbols.
   Example shown is a PLACEHOLDER — replace with your real number. */
const WHATSAPP_NUMBER = "34911459813";

/* Momoven listing URL — replace with your real listing once published. */
const MOMOVEN_URL = "https://www.momoven.com";

/* =========================================================
   2. LANGUAGE SWITCHER
   ========================================================= */
const LANGS = ["fr", "es", "en"];
const STORAGE_KEY = "cds_lang";

function getCurrentLang(){
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LANGS.includes(stored)) return stored;
  const nav = (navigator.language || "fr").slice(0,2);
  return LANGS.includes(nav) ? nav : "fr";
}

function applyTranslations(lang){
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang] !== undefined){
      el.textContent = entry[lang];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang] !== undefined){
      el.setAttribute("placeholder", entry[lang]);
    }
  });

  const titleEl = document.querySelector("title[data-i18n]");
  if (titleEl){
    const key = titleEl.getAttribute("data-i18n");
    if (TRANSLATIONS[key]) document.title = TRANSLATIONS[key][lang];
  }

  document.querySelectorAll(".lang-switch button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  if (typeof renderCalendar === "function" && document.getElementById("calendarGrid")){
    renderCalendar();
    updateBookingSummary();
  }

  if (typeof updateWhatsAppLink === "function") updateWhatsAppLink();
}

function setLang(lang){
  if (!LANGS.includes(lang)) return;
  localStorage.setItem(STORAGE_KEY, lang);
  applyTranslations(lang);
}

function initLangSwitcher(){
  document.querySelectorAll(".lang-switch button").forEach(btn => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });
  applyTranslations(getCurrentLang());
}

/* =========================================================
   3. MOBILE NAV TOGGLE
   ========================================================= */
function initMobileNav(){
  const burger = document.querySelector(".burger");
  const links = document.querySelector(".nav-links");
  if (!burger || !links) return;
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

/* =========================================================
   4. BOOKING CALENDAR
   ========================================================= */
let calendarViewDate = new Date();
calendarViewDate.setDate(1);
let selectedRange = { start: null, end: null };

function pad(n){ return n.toString().padStart(2,"0"); }
function toISO(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
function isSameDay(a,b){ return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function isBetween(d, a, b){ return a && b && d > a && d < b; }

function renderCalendar(){
  const grid = document.getElementById("calendarGrid");
  const headEl = document.getElementById("calendarMonthLabel");
  if (!grid || !headEl) return;

  const lang = getCurrentLang();
  const strings = CALENDAR_STRINGS[lang] || CALENDAR_STRINGS.fr;

  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  headEl.textContent = `${strings.months[month]} ${year}`;

  grid.innerHTML = "";

  strings.days.forEach(d => {
    const el = document.createElement("div");
    el.className = "dow";
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstOfMonth = new Date(year, month, 1);
  let startOffset = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  for (let i = 0; i < startOffset; i++){
    const el = document.createElement("div");
    el.className = "calendar-day empty";
    grid.appendChild(el);
  }

  for (let day = 1; day <= daysInMonth; day++){
    const date = new Date(year, month, day);
    const el = document.createElement("div");
    el.className = "calendar-day";
    el.textContent = day;
    el.setAttribute("role","button");
    el.setAttribute("tabindex","0");

    if (date < today){
      el.classList.add("past");
    } else {
      if (isSameDay(date, selectedRange.start) || isSameDay(date, selectedRange.end)){
        el.classList.add("selected");
      } else if (isBetween(date, selectedRange.start, selectedRange.end)){
        el.classList.add("in-range");
      }
      const activate = () => onCalendarDayClick(date);
      el.addEventListener("click", activate);
      el.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " "){ e.preventDefault(); activate(); }
      });
    }
    grid.appendChild(el);
  }
}

function onCalendarDayClick(date){
  if (!selectedRange.start || (selectedRange.start && selectedRange.end)){
    selectedRange = { start: date, end: null };
  } else {
    if (date < selectedRange.start){
      selectedRange = { start: date, end: selectedRange.start };
    } else if (isSameDay(date, selectedRange.start)){
      selectedRange = { start: date, end: null };
    } else {
      selectedRange.end = date;
    }
  }
  syncDateInputs();
  renderCalendar();
  updateBookingSummary();
}

function syncDateInputs(){
  const pickup = document.getElementById("pickupDate");
  const ret = document.getElementById("returnDate");
  if (pickup) pickup.value = selectedRange.start ? toISO(selectedRange.start) : "";
  if (ret) ret.value = selectedRange.end ? toISO(selectedRange.end) : "";

  const pickupLabel = document.getElementById("pickupLabel");
  const returnLabel = document.getElementById("returnLabel");
  if (pickupLabel) pickupLabel.textContent = selectedRange.start ? formatDateHuman(selectedRange.start) : "—";
  if (returnLabel) returnLabel.textContent = selectedRange.end ? formatDateHuman(selectedRange.end) : "—";
}

function formatDateHuman(date){
  const lang = getCurrentLang();
  const strings = CALENDAR_STRINGS[lang] || CALENDAR_STRINGS.fr;
  return `${date.getDate()} ${strings.months[date.getMonth()]} ${date.getFullYear()}`;
}

function initCalendarNav(){
  const prev = document.getElementById("calPrev");
  const next = document.getElementById("calNext");
  if (prev) prev.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() - 1);
    renderCalendar();
  });
  if (next) next.addEventListener("click", () => {
    calendarViewDate.setMonth(calendarViewDate.getMonth() + 1);
    renderCalendar();
  });
}

/* =========================================================
   5. BOOKING FORM
   ========================================================= */
function getNumberOfDays(){
  if (!selectedRange.start || !selectedRange.end) return 0;
  const ms = selectedRange.end - selectedRange.start;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function calculateTotal(modelKey, days){
  const model = PRICING[modelKey];
  if (!model || days <= 0) return { total: 0, rate: model ? model.day : 0 };

  if (days >= 30){
    const months = Math.floor(days / 30);
    const remainderDays = days % 30;
    return { total: months * model.month + remainderDays * model.day, rate: model.day };
  }
  if (days >= 7){
    const weeks = Math.floor(days / 7);
    const remainderDays = days % 7;
    return { total: weeks * model.week + remainderDays * model.day, rate: model.day };
  }
  return { total: days * model.day, rate: model.day };
}

function updateBookingSummary(){
  const modelSelect = document.getElementById("bookingModel");
  const daysOut = document.getElementById("summaryDays");
  const rateOut = document.getElementById("summaryRate");
  const totalOut = document.getElementById("summaryTotal");
  if (!modelSelect || !daysOut || !rateOut || !totalOut) return;

  const days = getNumberOfDays();
  const { total, rate } = calculateTotal(modelSelect.value, days);

  daysOut.textContent = days > 0 ? days : "—";
  rateOut.textContent = `${rate} €`;
  totalOut.textContent = total > 0 ? `${total} €` : "—";
}

function initBookingForm(){
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const modelSelect = document.getElementById("bookingModel");
  if (modelSelect){
    modelSelect.addEventListener("change", updateBookingSummary);

    // Pre-select model if arriving from a "Book this bike" link (?model=mt09)
    const params = new URLSearchParams(window.location.search);
    const requestedModel = params.get("model");
    if (requestedModel && PRICING[requestedModel]){
      modelSelect.value = requestedModel;
    }
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const success = document.getElementById("bookingSuccess");
    const warning = document.getElementById("bookingWarning");

    if (!selectedRange.start || !selectedRange.end){
      if (warning){
        warning.textContent = TRANSLATIONS.form_select_dates_first[getCurrentLang()];
        warning.classList.add("show");
      }
      return;
    }
    if (warning) warning.classList.remove("show");

    /* ---------------------------------------------------
       WHERE TO SEND THE BOOKING DATA
       This demo just shows a success message. To actually
       receive bookings, replace this block with either:
       (a) fetch() to your own backend / serverless function
       (b) a form service like Formspree/Getform (set the
           form's "action" attribute and remove preventDefault)
       --------------------------------------------------- */
    if (success) success.classList.add("show");
    form.reset();
    selectedRange = { start: null, end: null };
    syncDateInputs();
    renderCalendar();
    updateBookingSummary();
  });

  updateBookingSummary();
}

/* =========================================================
   6. CONTACT FORM (demo submit)
   ========================================================= */
function initContactForm(){
  const form = document.getElementById("contactForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const success = document.getElementById("contactSuccess");
    if (success) success.classList.add("show");
    form.reset();
  });
}

/* =========================================================
   7. FAQ ACCORDION
   ========================================================= */
function initFaqAccordion(){
  document.querySelectorAll(".faq-item").forEach(item => {
    const question = item.querySelector(".faq-question");
    if (!question) return;
    question.addEventListener("click", () => {
      const wasOpen = item.classList.contains("open");
      // close all others (single-open accordion)
      document.querySelectorAll(".faq-item.open").forEach(other => {
        if (other !== item) other.classList.remove("open");
      });
      item.classList.toggle("open", !wasOpen);
    });
  });
}

/* =========================================================
   8. GALLERY LIGHTBOX
   ========================================================= */
function initGalleryLightbox(){
  const items = Array.from(document.querySelectorAll(".gallery-item"));
  const lightbox = document.getElementById("lightbox");
  if (!items.length || !lightbox) return;

  const imgEl = document.getElementById("lightboxImg");
  const closeBtn = document.getElementById("lightboxClose");
  const prevBtn = document.getElementById("lightboxPrev");
  const nextBtn = document.getElementById("lightboxNext");
  let currentIndex = 0;

  function openAt(index){
    currentIndex = (index + items.length) % items.length;
    const bg = items[currentIndex].style.getPropertyValue("--gal-img");
    const url = bg.replace(/^url\((['"]?)(.*)\1\)$/, "$2");
    imgEl.src = url;
    imgEl.alt = items[currentIndex].getAttribute("data-caption") || "";
    lightbox.classList.add("open");
  }
  function close(){ lightbox.classList.remove("open"); }

  items.forEach((item, index) => {
    item.addEventListener("click", () => openAt(index));
  });
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (prevBtn) prevBtn.addEventListener("click", () => openAt(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => openAt(currentIndex + 1));
  lightbox.addEventListener("click", e => { if (e.target === lightbox) close(); });
  document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") openAt(currentIndex - 1);
    if (e.key === "ArrowRight") openAt(currentIndex + 1);
  });
}

/* =========================================================
   9. WHATSAPP WIDGET
   ========================================================= */
function updateWhatsAppLink(){
  const link = document.getElementById("whatsappLink");
  if (!link) return;
  const lang = getCurrentLang();
  const text = encodeURIComponent(TRANSLATIONS.wa_default_text[lang]);
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

function initWhatsAppWidget(){
  const bubble = document.getElementById("whatsappBubble");
  const panel = document.getElementById("whatsappPanel");
  if (!bubble || !panel) return;
  bubble.addEventListener("click", () => {
    panel.classList.toggle("open");
  });
  updateWhatsAppLink();
}

/* =========================================================
   MOMOVEN LINK
   ========================================================= */
function initMomovenLinks(){
  document.querySelectorAll(".momoven-link").forEach(link => {
    link.href = MOMOVEN_URL;
  });
}

/* =========================================================
   INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  initLangSwitcher();
  initMobileNav();
  initCalendarNav();
  renderCalendar();
  initBookingForm();
  initContactForm();
  syncDateInputs();
  initFaqAccordion();
  initGalleryLightbox();
  initWhatsAppWidget();
  initMomovenLinks();
});
