// --- Predefined Emojis ---
const travelEmojis = [
    { value: "", display: "아이콘 없음" }, { value: "💆🏻", display: "💆🏻 마사지" }, { value: "✈️", display: "✈️ 항공" }, { value: "🏨", display: "🏨 숙소" },{ value: "🏌️", display: "🏌️ 골프" },  { value: "🍽️", display: "🍽️ 식사" }, { value: "🏛️", display: "🏛️ 관광(실내)" }, { value: "🏞️", display: "🏞️ 관광(야외)" }, { value: "🚶", display: "🚶 이동(도보)" }, { value: "🚌", display: "🚌 이동(버스)" }, { value: "🚆", display: "🚆 이동(기차)" }, { value: "🚢", display: "🚢 이동(배)" }, { value: "🚕", display: "🚕 이동(택시)" }, { value: "🛍️", display: "🛍️ 쇼핑" }, { value: "📷", display: "📷 사진촬영" }, { value: "🗺️", display: "🗺️ 계획/지도" }, { value: "📌", display: "📌 중요장소" }, { value: "☕", display: "☕ 카페/휴식" }, { value: "🎭", display: "🎭 공연/문화" }, { value: "💼", display: "💼 업무" }, { value: "ℹ️", display: "ℹ️ 정보" }
];

// ▼▼▼ Firebase 초기화 ▼▼▼
const firebaseConfig = {
  apiKey: "AIzaSyAGULxdnWWnSc5eMCsqHeKGK9tmyHsxlv0", // 실제 API 키로 교체 필요
  authDomain: "trip-planner-app-cc72c.firebaseapp.com",   // 실제 authDomain으로 교체 필요
  projectId: "trip-planner-app-cc72c",                  // 실제 projectId로 교체 필요
  storageBucket: "trip-planner-app-cc72c.appspot.com", // 실제 storageBucket으로 교체 필요
  messagingSenderId: "1063594141232",                   // 실제 messagingSenderId로 교체 필요
  appId: "1:1063594141232:web:1dbba9b9722b20ff602ff5",   // 실제 appId로 교체 필요
  measurementId: "G-2G3Z6WMLF6"                         // 선택 사항, 실제 값으로 교체 필요
};

// Firebase 앱 초기화
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
} else {
    console.error("Firebase SDK가 로드되지 않았습니다. index.html 파일의 스크립트 로드 순서를 확인해주세요.");
}

// Firestore 인스턴스 가져오기
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;
if (!db && typeof firebase !== 'undefined') {
    console.error("Firestore 인스턴스를 초기화할 수 없습니다. Firebase SDK (특히 firestore.js) 로드 상태를 확인해주세요.");
}
// ▲▲▲ Firebase 초기화 끝 ▲▲▲


// --- Data ---
let currentTripId = null;
let tripData = {
    title: "새 여행 일정표",
    editingTitle: false,
    days: [
        { date: dateToYyyyMmDd(new Date()), activities: [], isCollapsed: false, editingDate: false }
    ]
};
let allFetchedTrips = []; // Firestore에서 가져온 원본 목록을 저장할 변수


// --- DOM Elements ---
const headerTitleSection = document.getElementById('headerTitleSection');
const daysContainer = document.getElementById('daysContainer');
const addDayButton = document.getElementById('addDayButton');
const activityModal = document.getElementById('activityModal');
const modalTitle = document.getElementById('modalTitle');
const activityForm = document.getElementById('activityForm');
const activityIdInput = document.getElementById('activityId');
const dayIndexInput = document.getElementById('dayIndex');
const activityTimeInput = document.getElementById('activityTimeInput');
const activityIconSelect = document.getElementById('activityIconSelect');
const saveHtmlButton = document.getElementById('saveHtmlButton');
const saveAsNewToDbButton = document.getElementById('saveAsNewToDbButton');
const copyInlineHtmlButton = document.getElementById('copyInlineHtmlButton');
const inlinePreviewButton = document.getElementById('inlinePreviewButton');
const loadHtmlInput = document.getElementById('loadHtmlInput');
const loadHtmlButtonTrigger = document.getElementById('loadHtmlButtonTrigger');


const toast = document.getElementById('toast');
const confirmDeleteDayModal = document.getElementById('confirmDeleteDayModal');
const confirmDeleteDayMessage = document.getElementById('confirmDeleteDayMessage');
const cancelDeleteDayButton = document.getElementById('cancelDeleteDayButton');
const confirmDeleteDayActionButton = document.getElementById('confirmDeleteDayActionButton');
const loadTripModal = document.getElementById('loadTripModal');
const tripListForLoadUl = document.getElementById('tripListForLoad');
const cancelLoadTripModalButton = document.getElementById('cancelLoadTripModalButton');
const loadingTripListMsg = document.getElementById('loadingTripListMsg');
const tripSearchInput = document.getElementById('tripSearchInput'); // 검색 입력 필드


let dayIndexToDelete = -1;
// --- Utility Functions ---
function generateId() { return 'id_' + Math.random().toString(36).substr(2, 9); }
function formatDate(dateString, dayNumber) { const date = new Date(dateString + "T00:00:00Z"); const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }; return `DAY ${dayNumber}: ${date.toLocaleDateString('ko-KR', options)}`; }

function formatTimeToHHMM(timeStr) {
    if (timeStr && timeStr.length === 4 && /^\d{4}$/.test(timeStr)) {
        const hours = timeStr.substring(0, 2);
        const minutes = timeStr.substring(2, 4);
        if (parseInt(hours, 10) >= 0 && parseInt(hours, 10) <= 23 &&
            parseInt(minutes, 10) >= 0 && parseInt(minutes, 10) <= 59) {
            return `${hours}:${minutes}`;
        }
    }
    return "";
}

function populateIconDropdown() { if(activityIconSelect) {activityIconSelect.innerHTML = ''; travelEmojis.forEach(emoji => { const option = document.createElement('option'); option.value = emoji.value; option.textContent = emoji.display; activityIconSelect.appendChild(option); });} }
function dateToYyyyMmDd(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let dayVal = '' + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (dayVal.length < 2) dayVal = '0' + dayVal;
    return [year, month, dayVal].join('-');
}

function showToastMessage(message, isError = false) {
    if (!toast) return;
    toast.textContent = message;
    if (isError) {
        toast.style.backgroundColor = 'red';
    } else {
        toast.style.backgroundColor = ''; // 기본 회색 배경
    }
    toast.classList.remove('opacity-0');
    setTimeout(() => {
        toast.classList.add('opacity-0');
        if (isError) toast.style.backgroundColor = ''; // 초기화
    }, 3000);
}

// --- Icon SVGs ---
const editIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`;
const saveIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
const cancelIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
const duplicateIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
const deleteIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;


// --- Rendering Functions for Main App ---
function renderHeaderTitle() {
    if (!headerTitleSection) return;
    headerTitleSection.innerHTML = '';
    if (tripData.editingTitle) {
        const input = document.createElement('input'); input.type = 'text'; input.className = 'header-title-input'; input.value = tripData.title; input.id = 'tripTitleInput';
        const saveButton = document.createElement('button'); saveButton.className = 'icon-button save-trip-title-button'; saveButton.title = '제목 저장'; saveButton.innerHTML = saveIconSVG; saveButton.addEventListener('click', handleSaveTripTitle);
        const cancelButton = document.createElement('button'); cancelButton.className = 'icon-button cancel-trip-title-edit-button'; cancelButton.title = '취소'; cancelButton.innerHTML = cancelIconSVG; cancelButton.addEventListener('click', handleCancelTripTitleEdit);
        headerTitleSection.appendChild(input); headerTitleSection.appendChild(saveButton); headerTitleSection.appendChild(cancelButton);
        input.focus(); input.select();
    } else {
        const titleH1 = document.createElement('h1'); titleH1.className = 'text-2xl font-bold'; titleH1.textContent = tripData.title; titleH1.id = 'tripTitleDisplay';
        const editButton = document.createElement('button'); editButton.className = 'icon-button edit-trip-title-button'; editButton.title = '여행 제목 수정'; editButton.innerHTML = editIconSVG; editButton.addEventListener('click', handleEditTripTitle);
        headerTitleSection.appendChild(titleH1); headerTitleSection.appendChild(editButton);
    }
}

function renderTrip() {
    renderHeaderTitle();
    if (!daysContainer) return;
    daysContainer.innerHTML = '';
    if (!tripData.days) tripData.days = [];

    tripData.days.forEach((day, dayIndex) => {
        const daySection = document.createElement('div'); daySection.className = 'day-section bg-white shadow-sm rounded-md'; daySection.dataset.dayId = `day-${dayIndex}`;
        const expandedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
        const collapsedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
        const deleteDayIconLocal = deleteIconSVG;
        let dateDisplayHTML;
        if (day.editingDate) {
            dateDisplayHTML = `<input type="text" class="date-edit-input-text" value="${day.date}" data-day-index="${dayIndex}" placeholder="YYYY-MM-DD 또는 YYMMDD"><button class="save-date-button icon-button" data-day-index="${dayIndex}" title="날짜 저장">${saveIconSVG}</button><button class="cancel-date-edit-button icon-button" data-day-index="${dayIndex}" title="취소">${cancelIconSVG}</button>`;
        } else {
            dateDisplayHTML = `<h2 class="day-header-title" data-day-index="${dayIndex}">${formatDate(day.date, dayIndex + 1)}</h2><button class="edit-date-button icon-button" data-day-index="${dayIndex}" title="날짜 수정">${editIconSVG}</button>`;
        }
        daySection.innerHTML = `<div class="day-header-container"><div class="day-header-main">${dateDisplayHTML}</div><div class="day-header-controls"><button class="duplicate-day-button icon-button" data-day-index="${dayIndex}" title="이 일차 일정을 그대로 복사하여 추가">${duplicateIconSVG}</button><button class="delete-day-button icon-button" data-day-index="${dayIndex}" title="이 날짜 전체 삭제">${deleteDayIconLocal}</button><button class="day-toggle-button p-1 rounded hover:bg-gray-200" data-day-index="${dayIndex}">${day.isCollapsed ? collapsedIcon : expandedIcon}</button></div></div><div class="day-content-wrapper ${day.isCollapsed ? 'hidden' : ''}"><div class="activities-list pt-3" data-day-index="${dayIndex}"></div><button class="add-activity-button mt-2 mb-4 ml-2 action-button bg-teal-500 text-white hover:bg-teal-600" data-day-index="${dayIndex}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>이 날짜에 새 일정 추가</button></div>`;
        daysContainer.appendChild(daySection);
        const activitiesList = daySection.querySelector('.activities-list');
        renderActivities(activitiesList, day.activities || [], dayIndex);
        if (day.editingDate) { daySection.querySelector('.save-date-button').addEventListener('click', handleSaveDate); daySection.querySelector('.cancel-date-edit-button').addEventListener('click', handleCancelDateEdit); } else { daySection.querySelector('.edit-date-button').addEventListener('click', handleEditDate); }
        daySection.querySelector('.day-header-container').addEventListener('click', (e) => { if (!e.target.closest('input') && !e.target.closest('button')) { handleToggleDayCollapse(e); } });
        daySection.querySelector('.duplicate-day-button').addEventListener('click', (e) => { const dayIdx = parseInt(e.currentTarget.dataset.dayIndex); handleDuplicateDay(dayIdx); });
        daySection.querySelector('.delete-day-button').addEventListener('click', (e) => { const dayIdx = parseInt(e.currentTarget.dataset.dayIndex); showConfirmDeleteDayModal(dayIdx); });
        daySection.querySelector('.day-toggle-button').addEventListener('click', handleToggleDayCollapse);
        daySection.querySelector('.add-activity-button').addEventListener('click', handleOpenActivityModalForNew);
        if (typeof Sortable !== 'undefined' && activitiesList) { new Sortable(activitiesList, { group: 'shared-activities', animation: 150, ghostClass: 'sortable-ghost', dragClass: 'sortable-drag', handle: '.activity-card', onEnd: function (evt) { const fromDayIndex = parseInt(evt.from.dataset.dayIndex); const toDayIndex = parseInt(evt.to.dataset.dayIndex); const oldActivityIndex = evt.oldDraggableIndex; const newActivityIndex = evt.newDraggableIndex; if (oldActivityIndex !== undefined && newActivityIndex !== undefined) { const movedActivity = tripData.days[fromDayIndex].activities.splice(oldActivityIndex, 1)[0]; tripData.days[toDayIndex].activities.splice(newActivityIndex, 0, movedActivity); renderTrip(); /* saveTripToFirestore(); */ } } }); } else if (typeof Sortable === 'undefined') { console.warn('SortableJS 라이브러리가 로드되지 않았습니다.'); }
    });
    if (typeof Sortable !== 'undefined' && daysContainer) { if (daysContainer.children.length > 0 && !daysContainer.sortableInstance) { daysContainer.sortableInstance = new Sortable(daysContainer, { animation: 200, ghostClass: 'day-section.sortable-ghost', handle: '.day-header-container', onEnd: function(evt) { const oldIndex = evt.oldDraggableIndex; const newIndex = evt.newDraggableIndex; if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) { const movedDay = tripData.days.splice(oldIndex, 1)[0]; tripData.days.splice(newIndex, 0, movedDay); recalculateAllDates(); renderTrip(); /* saveTripToFirestore(); */ } } }); } else if (daysContainer.children.length === 0 && daysContainer.sortableInstance) { daysContainer.sortableInstance.destroy(); daysContainer.sortableInstance = null; } } else if (typeof Sortable === 'undefined') { console.warn('SortableJS 라이브러리가 로드되지 않았습니다.'); }
}

function renderActivities(activitiesListElement, activities, dayIndex) {
    if (!activitiesListElement) return;
    activitiesListElement.innerHTML = '';
    (activities || []).forEach((activity) => {
        const card = document.createElement('div'); card.className = 'activity-card'; card.setAttribute('data-activity-id', activity.id);
        let imageHTML = ''; if (activity.imageUrl) { imageHTML = `<img src="${activity.imageUrl}" alt="${activity.title || '활동 이미지'}" class="card-image" onerror="this.style.display='none';">`; }
        card.innerHTML = `<div class="card-time-icon-area">${activity.icon ? `<div class="card-icon">${activity.icon}</div>` : '<div class="card-icon" style="height: 28.8px;"></div>'}<div class="card-time">${formatTimeToHHMM(activity.time)}</div></div><div class="card-details-area"><div class="card-title">${activity.title || ''}</div>${activity.description ? `<div class="card-description">${activity.description}</div>` : ''}${imageHTML}${activity.locationLink ? `<div class="card-location">📍 <a href="${activity.locationLink}" target="_blank" rel="noopener noreferrer">${activity.locationLink.length > 30 ? activity.locationLink.substring(0,27) + '...' : activity.locationLink}</a></div>` : ''}${activity.cost ? `<div class="card-cost">💰 ${activity.cost}</div>` : ''}${activity.notes ? `<div class="card-notes">📝 ${activity.notes}</div>` : ''}</div><div class="card-actions-direct"><button class="icon-button card-action-icon-button edit-activity-button" data-day-index="${dayIndex}" data-activity-id="${activity.id}" title="수정">${editIconSVG}</button><button class="icon-button card-action-icon-button duplicate-activity-button" data-day-index="${dayIndex}" data-activity-id="${activity.id}" title="복제">${duplicateIconSVG}</button><button class="icon-button card-action-icon-button delete-activity-button" data-day-index="${dayIndex}" data-activity-id="${activity.id}" title="삭제">${deleteIconSVG}</button></div>`;
        activitiesListElement.appendChild(card);
    });
    activitiesListElement.querySelectorAll('.edit-activity-button').forEach(button => { button.addEventListener('click', handleOpenActivityModalForEdit); });
    activitiesListElement.querySelectorAll('.delete-activity-button').forEach(button => button.addEventListener('click', handleDeleteActivity));
    activitiesListElement.querySelectorAll('.duplicate-activity-button').forEach(button => button.addEventListener('click', handleDuplicateActivity));
}

// --- Trip Title Editing Handlers ---
function handleEditTripTitle() { tripData.editingTitle = true; renderHeaderTitle(); }
function handleSaveTripTitle() { const titleInput = document.getElementById('tripTitleInput'); if (titleInput && titleInput.value.trim() !== "") { tripData.title = titleInput.value.trim(); } else { tripData.title = "제목 없음"; } tripData.editingTitle = false; renderHeaderTitle(); /* saveTripToFirestore(); */ }
function handleCancelTripTitleEdit() { tripData.editingTitle = false; renderHeaderTitle(); }

// --- Date Editing and Recalculation ---
function isValidDateString(dateString) { if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false; const parts = dateString.split("-"); const year = parseInt(parts[0], 10); const month = parseInt(parts[1], 10); const day = parseInt(parts[2], 10); if (year < 1000 || year > 3000 || month === 0 || month > 12) return false; const monthLength = [31, (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; return !(day === 0 || day > monthLength[month - 1]); }
function parseAndValidateDateInput(inputValue) { let dateStr = inputValue.trim(); if (/^\d{8}$/.test(dateStr)) { dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`; } else if (/^\d{6}$/.test(dateStr)) { const currentYearPrefix = new Date().getFullYear().toString().substring(0, 2); dateStr = `${currentYearPrefix}${dateStr.substring(0, 2)}-${dateStr.substring(2, 4)}-${dateStr.substring(4, 6)}`; } else if (/^\d{4}[./]\d{2}[./]\d{2}$/.test(dateStr)) { dateStr = dateStr.replace(/[./]/g, '-'); } return isValidDateString(dateStr) ? dateStr : null; }
function recalculateAllDates() { if (tripData.days && tripData.days.length > 0 && tripData.days[0].date) { let currentDate = new Date(tripData.days[0].date + "T00:00:00Z"); tripData.days[0].date = dateToYyyyMmDd(currentDate); for (let i = 1; i < tripData.days.length; i++) { currentDate.setDate(currentDate.getDate() + 1); tripData.days[i].date = dateToYyyyMmDd(currentDate); } } }
function handleEditDate(event) { const dayIndex = parseInt(event.currentTarget.dataset.dayIndex); tripData.days.forEach((day, index) => { day.editingDate = (index === dayIndex); }); renderTrip(); }
function handleSaveDate(event) { const dayIndex = parseInt(event.currentTarget.dataset.dayIndex); const dateInput = document.querySelector(`.date-edit-input-text[data-day-index="${dayIndex}"]`); if (dateInput && dateInput.value) { const validatedDate = parseAndValidateDateInput(dateInput.value); if (validatedDate) { tripData.days[dayIndex].date = validatedDate; tripData.days[dayIndex].editingDate = false; recalculateAllDates(); renderTrip(); /* saveTripToFirestore(); */ } else { showToastMessage("잘못된 날짜 형식입니다.", true); } } else { tripData.days[dayIndex].editingDate = false; renderTrip(); } }
function handleCancelDateEdit(event) { const dayIndex = parseInt(event.currentTarget.dataset.dayIndex); tripData.days[dayIndex].editingDate = false; renderTrip(); }
function handleToggleDayCollapse(event) { const dayHeaderContainer = event.target.closest('.day-header-container'); if (!dayHeaderContainer) return; const dayIndexElement = dayHeaderContainer.querySelector('[data-day-index]'); if (!dayIndexElement) return; const dayIndex = parseInt(dayIndexElement.dataset.dayIndex); const day = tripData.days[dayIndex]; if (day.editingDate) return; const dayContentWrapper = dayHeaderContainer.nextElementSibling; const toggleButtonElement = dayHeaderContainer.querySelector('.day-toggle-button'); const expandedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`; const collapsedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`; day.isCollapsed = !day.isCollapsed; if (dayContentWrapper) dayContentWrapper.classList.toggle('hidden', day.isCollapsed); if (toggleButtonElement) { toggleButtonElement.innerHTML = day.isCollapsed ? collapsedIcon : expandedIcon; } /* saveTripToFirestore(); */ }

// --- Activity Modal Logic ---
function handleOpenActivityModalForNew(event) { const dayIdx = event.currentTarget.dataset.dayIndex; if(modalTitle) modalTitle.textContent = '새 일정 추가'; if(activityForm) activityForm.reset(); populateIconDropdown(); if(activityIconSelect) activityIconSelect.value = travelEmojis[0].value; if(activityTimeInput) activityTimeInput.value = ''; if(activityIdInput) activityIdInput.value = ''; if(dayIndexInput) dayIndexInput.value = dayIdx; if(activityModal) activityModal.classList.remove('hidden'); }
function populateAndOpenEditActivityModal(dayIdxStr, activityIdToEdit) {
    const dayIdx = parseInt(dayIdxStr, 10); const day = tripData.days[dayIdx];
    if (!day || !day.activities) { console.error(`Day index ${dayIdx} not found or has no activities.`); showToastMessage("일정을 수정하는 중 오류가 발생했습니다.", true); return; }
    const activity = day.activities.find(act => act.id === activityIdToEdit);
    if (activity) {
        if(modalTitle) modalTitle.textContent = '일정 수정'; if(activityForm) activityForm.reset(); populateIconDropdown();
        if(activityIdInput) activityIdInput.value = activity.id; if(dayIndexInput) dayIndexInput.value = dayIdx;
        if(activityTimeInput) activityTimeInput.value = activity.time || ""; if(activityIconSelect) activityIconSelect.value = activity.icon || "";
        const titleEl = document.getElementById('activityTitle'); if(titleEl) titleEl.value = activity.title || "";
        const descEl = document.getElementById('activityDescription'); if(descEl) descEl.value = activity.description || "";
        const locEl = document.getElementById('activityLocation'); if(locEl) locEl.value = activity.locationLink || "";
        const imgEl = document.getElementById('activityImageUrl'); if(imgEl) imgEl.value = activity.imageUrl || "";
        const costEl = document.getElementById('activityCost'); if(costEl) costEl.value = activity.cost || "";
        const notesEl = document.getElementById('activityNotes'); if(notesEl) notesEl.value = activity.notes || "";
        if(activityModal) activityModal.classList.remove('hidden');
    } else { console.error(`Activity id ${activityIdToEdit} not found in day ${dayIdx}.`); showToastMessage("해당 일정을 찾을 수 없습니다.", true); }
}
function handleOpenActivityModalForEdit(event) { const button = event.currentTarget; const dayIdx = button.dataset.dayIndex; const activityIdToEdit = button.dataset.activityId; populateAndOpenEditActivityModal(dayIdx, activityIdToEdit); }
if (activityTimeInput) activityTimeInput.addEventListener('input', function(e) { let value = e.target.value.replace(/[^0-9]/g, ''); if (value.length > 4) { value = value.substring(0, 4); } e.target.value = value; });
if (activityForm) activityForm.addEventListener('submit', (e) => {
    e.preventDefault(); const dayIdx = parseInt(dayIndexInput.value); const currentActivityId = activityIdInput.value;
    let timeValue = activityTimeInput.value.trim();
    if (timeValue.length > 0) { if (timeValue.length !== 4 || !/^\d{4}$/.test(timeValue)) { showToastMessage("시간은 HHMM 형식의 4자리 숫자로 입력하거나 비워두세요.", true); return; } const hours = parseInt(timeValue.substring(0, 2), 10); const minutes = parseInt(timeValue.substring(2, 4), 10); if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) { showToastMessage("유효하지 않은 시간입니다.", true); return; } }
    const activityData = { id: currentActivityId || generateId(), time: timeValue, icon: activityIconSelect.value, title: document.getElementById('activityTitle').value, description: document.getElementById('activityDescription').value, locationLink: document.getElementById('activityLocation').value, imageUrl: document.getElementById('activityImageUrl').value, cost: document.getElementById('activityCost').value, notes: document.getElementById('activityNotes').value };
    if (currentActivityId) { const activityIndex = tripData.days[dayIdx].activities.findIndex(act => act.id === currentActivityId); if (activityIndex > -1) { tripData.days[dayIdx].activities[activityIndex] = activityData; } } else { if(tripData.days[dayIdx]) tripData.days[dayIdx].activities.push(activityData); }
    if(activityModal) activityModal.classList.add('hidden'); renderTrip(); /* saveTripToFirestore(); */
});
const cancelActivityButton = document.getElementById('cancelActivityButton');
if (cancelActivityButton) cancelActivityButton.addEventListener('click', () => { if(activityModal) activityModal.classList.add('hidden'); });

// --- Day Management ---
if (addDayButton) addDayButton.addEventListener('click', () => { let newDate; let newDayIsCollapsed; if (tripData.days && tripData.days.length > 0 && tripData.days[tripData.days.length - 1].date) { const lastDate = new Date(tripData.days[tripData.days.length - 1].date + "T00:00:00Z"); newDate = new Date(lastDate); newDate.setDate(lastDate.getDate() + 1); newDayIsCollapsed = true; } else { newDate = new Date(); newDayIsCollapsed = false; tripData.days = []; } const newDay = { date: dateToYyyyMmDd(newDate), activities: [], isCollapsed: newDayIsCollapsed, editingDate: false }; tripData.days.push(newDay); renderTrip(); /* saveTripToFirestore(); */ });
function showConfirmDeleteDayModal(dayIdx) { dayIndexToDelete = dayIdx; const dayNumber = dayIdx + 1; const dateString = new Date(tripData.days[dayIdx].date + "T00:00:00Z").toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }); if(confirmDeleteDayMessage) confirmDeleteDayMessage.textContent = `DAY ${dayNumber} (${dateString}) 삭제 확인`; if(confirmDeleteDayModal) confirmDeleteDayModal.classList.remove('hidden'); }
function hideConfirmDeleteDayModal() { if(confirmDeleteDayModal) confirmDeleteDayModal.classList.add('hidden'); dayIndexToDelete = -1; }
if (confirmDeleteDayActionButton) confirmDeleteDayActionButton.addEventListener('click', () => { if (dayIndexToDelete > -1 && dayIndexToDelete < tripData.days.length) { tripData.days.splice(dayIndexToDelete, 1); recalculateAllDates(); renderTrip(); /* saveTripToFirestore(); */ } hideConfirmDeleteDayModal(); });
if (cancelDeleteDayButton) cancelDeleteDayButton.addEventListener('click', hideConfirmDeleteDayModal);
function handleDeleteActivity(event) { const button = event.currentTarget; const dayIdx = button.dataset.dayIndex; const activityIdToDelete = button.dataset.activityId; tripData.days[dayIdx].activities = tripData.days[dayIdx].activities.filter(act => act.id !== activityIdToDelete); renderTrip(); /* saveTripToFirestore(); */ }
function handleDuplicateActivity(event) { const button = event.currentTarget; const dayIdx = parseInt(button.dataset.dayIndex); const activityIdToDuplicate = button.dataset.activityId; const activityToDuplicate = tripData.days[dayIdx].activities.find(act => act.id === activityIdToDuplicate); if (activityToDuplicate) { const newActivity = { ...activityToDuplicate, id: generateId(), title: `${activityToDuplicate.title} (복사본)` }; const originalIndex = tripData.days[dayIdx].activities.findIndex(act => act.id === activityIdToDuplicate); tripData.days[dayIdx].activities.splice(originalIndex + 1, 0, newActivity); renderTrip(); /* saveTripToFirestore(); */ } }

// --- Firestore 연동 함수 ---
async function saveTripToFirestore(isSaveAsNew = false) {
    if (!db) { showToastMessage("Firestore가 초기화되지 않았습니다. Firebase SDK를 확인해주세요.", true); return; }

    let currentTitle = tripData.title;
    if (isSaveAsNew) {
        const newTitle = prompt("새로 저장할 여행 일정의 제목을 입력하세요:", tripData.title + " (복사본)");
        if (!newTitle || newTitle.trim() === "") {
            showToastMessage("제목이 입력되지 않아 저장이 취소되었습니다.", true);
            return;
        }
        currentTitle = newTitle.trim();
    } else {
        if (!currentTitle || currentTitle.trim() === "") {
            showToastMessage("여행 제목을 입력해주세요.", true); return;
        }
    }

    const dataToSave = {
        title: currentTitle,
        days: (tripData.days || []).map(day => ({
            date: day.date,
            activities: day.activities || [],
            isCollapsed: typeof day.isCollapsed === 'boolean' ? day.isCollapsed : true,
        }))
    };

    try {
        if (currentTripId && !isSaveAsNew) {
            await db.collection("tripplan").doc(currentTripId).set(dataToSave, { merge: true });
            tripData.title = currentTitle;
            renderHeaderTitle();
            showToastMessage(`'${currentTitle}' 일정이 Firestore에 업데이트되었습니다.`);
        } else {
            const docRef = await db.collection("tripplan").add(dataToSave);
            currentTripId = docRef.id;
            tripData.title = currentTitle;
            renderHeaderTitle();
            showToastMessage(`'${currentTitle}' 일정이 새롭게 Firestore에 저장되었습니다. (ID: ${currentTripId})`);
        }
    } catch (error) {
        console.error("Error saving/updating trip in Firestore: ", error);
        showToastMessage("일정 저장/업데이트 중 오류가 발생했습니다.", true);
    }
}

async function handleSaveTripAsNew() {
    console.log("DB 다른 이름으로 저장 버튼 클릭됨");
    await saveTripToFirestore(true);
}

async function deleteTripFromFirestore(tripIdToDelete, tripTitle) {
    if (!db) { showToastMessage("Firestore가 초기화되지 않았습니다.", true); return; }
    if (!tripIdToDelete) { showToastMessage("삭제할 일정 ID가 없습니다.", true); return; }

    if (!confirm(`"${tripTitle}" 일정을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
        return;
    }

    try {
        await db.collection("tripplan").doc(tripIdToDelete).delete();
        showToastMessage(`"${tripTitle}" 일정이 Firestore에서 삭제되었습니다.`);

        if (currentTripId === tripIdToDelete) {
            currentTripId = null;
            tripData = { title: "새 여행 일정표", editingTitle: false, days: [{ date: dateToYyyyMmDd(new Date()), activities: [], isCollapsed: false, editingDate: false }] };
            renderTrip();
        }
        
        // 모달이 열려있다면 목록 새로고침
        if (loadTripModal && !loadTripModal.classList.contains('hidden')) {
            loadTripListFromFirestore(); // 목록을 다시 로드하여 삭제된 항목을 반영
        }

    } catch (error) {
        console.error("Error deleting trip from Firestore: ", error);
        showToastMessage(`"${tripTitle}" 일정 삭제 중 오류가 발생했습니다.`, true);
    }
}

async function loadTripFromFirestore(tripIdToLoad) {
    if (!db) { showToastMessage("Firestore가 초기화되지 않았습니다. Firebase SDK를 확인해주세요.", true); return; }
    if (!tripIdToLoad) {
        showToastMessage("불러올 일정 문서 ID가 없습니다. 새 일정을 시작합니다.", true);
        tripData = { title: "새 여행 일정표", editingTitle: false, days: [{ date: dateToYyyyMmDd(new Date()), activities: [], isCollapsed: false, editingDate: false }] };
        currentTripId = null; renderTrip(); return;
    }
    try {
        const doc = await db.collection("tripplan").doc(tripIdToLoad).get();
        if (doc.exists) {
            const loadedData = doc.data();
            tripData.title = loadedData.title || "제목 없음";
            tripData.days = (loadedData.days || []).map(day => ({
                date: day.date,
                activities: day.activities || [],
                isCollapsed: typeof day.isCollapsed === 'boolean' ? day.isCollapsed : true,
                editingDate: false
            }));
            tripData.editingTitle = false;
            if (tripData.days.length === 0) { tripData.days.push({ date: dateToYyyyMmDd(new Date()), activities: [], isCollapsed: false, editingDate: false }); }
            if (tripData.days.length > 0 && tripData.days[0]) { tripData.days[0].isCollapsed = false; }
            currentTripId = tripIdToLoad;
            renderTrip();
            showToastMessage(`'${tripData.title}' 일정을 Firestore에서 불러왔습니다.`);
        } else {
            showToastMessage(`ID '${tripIdToLoad}'에 해당하는 일정을 찾을 수 없습니다. 새 일정을 시작합니다.`, true);
            tripData = { title: "새 여행 일정표", editingTitle: false, days: [{ date: dateToYyyyMmDd(new Date()), activities: [], isCollapsed: false, editingDate: false }] };
            currentTripId = null; renderTrip();
        }
    } catch (error) { console.error("Error loading trip from Firestore: ", error); showToastMessage("일정 불러오기 중 오류가 발생했습니다.", true); }
}

function renderFilteredTripList() {
    if (!tripListForLoadUl || !tripSearchInput) return; 

    const searchTerm = tripSearchInput.value.toLowerCase();
    tripListForLoadUl.innerHTML = ''; 

    const filteredTrips = allFetchedTrips.filter(trip =>
        trip.title.toLowerCase().includes(searchTerm)
    );

    if (filteredTrips.length > 0) {
        filteredTrips.forEach(trip => {
            const listItem = document.createElement('li');
            listItem.className = 'flex justify-between items-center p-2 hover:bg-gray-100 rounded group';
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = trip.title;
            titleSpan.dataset.tripId = trip.id;
            titleSpan.className = 'cursor-pointer flex-grow hover:text-blue-600 mr-2 text-sm';
            titleSpan.title = `"${trip.title}" 일정 불러오기`;

            titleSpan.addEventListener('click', () => {
                loadTripFromFirestore(trip.id);
                if (loadTripModal) loadTripModal.classList.add('hidden');
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = `<svg class="w-4 h-4 text-gray-400 group-hover:text-red-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
            deleteButton.className = 'action-button text-xs px-2 py-1 opacity-50 group-hover:opacity-100 hover:bg-red-100 rounded';
            deleteButton.dataset.tripId = trip.id;
            deleteButton.dataset.tripTitle = trip.title;
            deleteButton.title = `"${trip.title}" 일정 삭제`;

            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation(); 
                const tripIdToDelete = event.currentTarget.dataset.tripId;
                const tripTitleToDelete = event.currentTarget.dataset.tripTitle;
                deleteTripFromFirestore(tripIdToDelete, tripTitleToDelete);
            });

            listItem.appendChild(titleSpan);
            listItem.appendChild(deleteButton);
            tripListForLoadUl.appendChild(listItem);
        });
    } else {
        const isLoading = loadingTripListMsg && loadingTripListMsg.style.display !== 'none';
        if (!isLoading) { // 로딩 중이 아닐 때만 메시지 표시
            if (searchTerm && allFetchedTrips.length > 0) { 
                tripListForLoadUl.innerHTML = `<li class="p-2 text-gray-500">"'${tripSearchInput.value}'" 검색 결과가 없습니다.</li>`;
            } else if (allFetchedTrips.length === 0) { 
                 tripListForLoadUl.innerHTML = '<li class="p-2 text-gray-500">저장된 여행 일정이 없습니다.</li>';
            }
        }
    }
}


async function loadTripListFromFirestore() {
    if (!db) { showToastMessage("Firestore가 초기화되지 않았습니다. Firebase SDK를 확인해주세요.", true); return; }
    // tripSearchInput도 필수 요소로 확인
    if (!loadTripModal || !tripListForLoadUl || !cancelLoadTripModalButton || !loadingTripListMsg || !tripSearchInput) {
        console.error("여행 일정 불러오기 모달 관련 DOM 요소를 찾을 수 없습니다.");
        showToastMessage("일정 불러오기 UI가 준비되지 않았습니다.", true);
        return;
    }

    loadingTripListMsg.textContent = "목록을 불러오는 중...";
    loadingTripListMsg.style.display = 'block';
    tripListForLoadUl.innerHTML = ''; // 목록 비우기 (renderFilteredTripList에서도 하지만 여기서도 초기화)
    if (tripSearchInput) tripSearchInput.value = ''; // 모달 열릴 때 검색창 초기화
    
    loadTripModal.classList.remove('hidden');

    allFetchedTrips = []; // 함수 호출 시마다 원본 목록 초기화

    try {
        const querySnapshot = await db.collection("tripplan").orderBy("title").get(); 
        querySnapshot.forEach((doc) => {
            allFetchedTrips.push({ id: doc.id, title: doc.data().title || "제목 없음" });
        });

        loadingTripListMsg.style.display = 'none';
        renderFilteredTripList(); // 데이터 로드 후 필터링된 목록 렌더링 (초기에는 전체 목록)

    } catch (error) {
        console.error("Error loading trip list from Firestore: ", error);
        showToastMessage("일정 목록 불러오기 중 오류가 발생했습니다.", true);
        if(loadingTripListMsg) loadingTripListMsg.textContent = "목록을 불러오는 중 오류가 발생했습니다.";
        allFetchedTrips = []; // 오류 발생 시에도 초기화
        loadingTripListMsg.style.display = 'none'; // 로딩 메시지 숨김
        renderFilteredTripList(); // 빈 목록이라도 렌더링하여 "없음" 메시지 표시
    }
}

// --- 일차 복사 기능 ---
function handleDuplicateDay(dayIndex) {
    if (dayIndex < 0 || !tripData.days || dayIndex >= tripData.days.length) return;
    const dayToDuplicate = tripData.days[dayIndex];
    const newActivities = (dayToDuplicate.activities || []).map(act => ({
        ...act,
        id: generateId()
    }));
    const newDay = {
        date: dayToDuplicate.date, // Will be overridden by recalculateAllDates
        activities: newActivities,
        isCollapsed: false,
        editingDate: false
    };
    tripData.days.splice(dayIndex + 1, 0, newDay);
    recalculateAllDates();
    renderTrip();
    showToastMessage(`DAY ${dayIndex + 1} 일정이 복사되었습니다.`);
}
if (loadHtmlInput) loadHtmlInput.addEventListener('change', (event) => { /* Firestore 사용으로 이 로직은 현재 사용되지 않음 */});



// --- 인라인 스타일 HTML 생성 및 표시 ---
function handleInlinePreview() { const inlineHtml = generateInlineStyledHTML(tripData, { includeStyles: true, makePageTitleEmptyForCopy: false }); const previewWindow = window.open('', '_blank'); if (previewWindow) { previewWindow.document.write(inlineHtml); previewWindow.document.close(); } else { showToastMessage("팝업이 차단되었을 수 있습니다.", true); }}
function formatDateForInlineView(dateString, dayNumber) { const date = new Date(dateString + "T00:00:00Z"); const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }; return `DAY ${dayNumber}: ${date.toLocaleDateString('ko-KR', options)}`; }
async function handleCopyInlineHtml() { const inlineHtml = generateInlineStyledHTML(tripData, { includeStyles: false, makePageTitleEmptyForCopy: true }); try { const blobHtml = new Blob([inlineHtml], { type: 'text/html' }); const blobText = new Blob([inlineHtml], { type: 'text/plain' }); const clipboardItem = new ClipboardItem({ 'text/html': blobHtml, 'text/plain': blobText }); await navigator.clipboard.write([clipboardItem]); showToastMessage('스타일 및 문서 제목이 제외된 인라인 코드가 HTML 형식으로 복사되었습니다.'); } catch (err) { console.error('HTML 형식 클립보드 복사 실패:', err); try { await navigator.clipboard.writeText(inlineHtml); showToastMessage('스타일 및 문서 제목이 제외된 인라인 코드가 일반 텍스트로 복사되었습니다 (HTML 형식 복사 실패).'); } catch (fallbackErr) { console.error('일반 텍스트 클립보드 복사도 실패:', fallbackErr); showToastMessage('클립보드 복사에 최종적으로 실패했습니다.', true); } } }
function generateInlineStyledHTML(data, options = { includeStyles: true, makePageTitleEmptyForCopy: false }) {
    let daysHTML = ''; const dataForInlineView = JSON.parse(JSON.stringify(data)); if (!dataForInlineView.days) dataForInlineView.days = [];
    dataForInlineView.days.forEach((day, dayIndex) => {
        let activitiesHTML = ''; (day.activities || []).forEach(activity => {
            const formattedTime = formatTimeToHHMM(activity.time);
            let imageDetailHTML = ''; if (activity.imageUrl) { imageDetailHTML = `<details open class="image-details" style="margin-top: 8px;"><summary class="custom-marker-image" style="font-size: 12px; color: #007bff; text-decoration: none; cursor: pointer; display: inline-block;">🖼️ 사진 접기</summary><img src="${activity.imageUrl}" alt="${activity.title || '활동 이미지'}" style="max-width: 300px; height: auto; object-fit: cover; border-radius: 4px; margin-top: 8px; display: block;" onerror="this.style.display='none';"></details>`;}
            let locationHTML = ''; if (activity.locationLink) { locationHTML = `<div class="card-location" style="font-size: 12px; margin-top: 4px;">📍 <a href="${activity.locationLink}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">위치 보기</a></div>`;}
            let costHTML = ''; if (activity.cost) { costHTML = `<div class="card-cost" style="font-size: 12px; margin-top: 4px;">💰 ${activity.cost}</div>`;}
            let notesHTML = ''; if (activity.notes) { const notesText = activity.notes.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); notesHTML = `<div class="card-notes" style="font-size: 12px; margin-top: 4px; white-space: pre-wrap;">📝 ${notesText}</div>`;}
            let descriptionHTML = ''; if(activity.description){ const descriptionText = activity.description.replace(/\n/g, '<br>'); descriptionHTML = `<div class="card-description" style="font-size: 12px; white-space: pre-wrap;">${descriptionText}</div>`;}
            activitiesHTML += `<div class="readonly-activity-card" style="background-color: white; border-radius: 8px; border: 1px solid #E0E0E0; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex;"><div class="card-time-icon-area" style="width: 100px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start;"><div class="card-icon" style="font-size: 20px; margin-bottom: 4px;">${activity.icon || ' '}</div><div class="card-time" style="font-size: 12px; font-weight: bold; min-height: 18px;">${formattedTime || ' '}</div></div><div class="card-details-area" style="flex-grow: 1; display: flex; flex-direction: column; gap: 4px;"><div class="card-title" style="font-size: 14px; font-weight: bold;">${activity.title || ''}</div>${descriptionHTML}${imageDetailHTML}${locationHTML}${costHTML}${notesHTML}</div></div>`;
        });
        daysHTML += `<div class="day-section" style="margin-bottom: 16px; border-radius: 0.375rem; background-color: #ffffff; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);"><details ${day.isCollapsed ? '' : 'open'}><summary class="custom-marker" style="display: flex; align-items: center; padding: 12px 8px; border-bottom: 1px solid #EEE; background-color: #fdfdfd; border-radius: 6px 6px 0 0; cursor: pointer;"><div class="day-header-main" style="display: flex; align-items: center; gap: 8px; flex-grow: 1;"><h2 class="day-header-title" style="font-size: 16px; font-weight: 600;">${formatDateForInlineView(day.date, dayIndex + 1)}</h2></div></summary><div class="day-content-wrapper" style="padding: 0 8px 8px 8px;"><div class="activities-list" style="padding-top: 0.75rem;">${activitiesHTML || '<p style="font-size:12px; color: #777; padding: 10px 0;">이 날짜에는 아직 등록된 일정이 없습니다.</p>'}</div></div></details></div>`;
    });
    const definedStyles = `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; margin: 0; background-color: #f8f9fa; color: #212529;} main { max-width: 768px; margin-left: auto; margin-right: auto; padding: 1rem; } header { background-color: white; border-bottom: 1px solid #E0E0E0; padding: 1rem; text-align: center; } header h1 { font-size: 1.25rem; font-weight: bold; margin: 0; } summary { list-style: none; } summary::-webkit-details-marker { display: none; } summary.custom-marker { position: relative; } summary.custom-marker::before { content: '▶'; font-size: 0.8em; margin-right: 8px; display: inline-block; width: 1em; text-align: center; color: #555; transition: transform 0.2s ease-in-out; } details[open] > summary.custom-marker::before { content: '▼'; }`;
    let styleTagHTML = ''; if (options.includeStyles) { styleTagHTML = `<style>${definedStyles}</style>`; }
    const pageDocumentTitle = options.makePageTitleEmptyForCopy ? ' ' : (dataForInlineView.title || "여행 일정");
    return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${pageDocumentTitle}</title>${styleTagHTML}</head><body><header><h1>${(dataForInlineView.title || "여행 일정")}</h1></header><main><div id="daysContainerReadOnly">${daysHTML || '<p style="text-align:center; padding: 20px; color: #777;">여행 일정이 없습니다.</p>'}</div></main></body></html>`;
}

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    if (activityIconSelect) { populateIconDropdown(); } else { console.error("#activityIconSelect 요소를 찾을 수 없습니다."); }
    if (copyInlineHtmlButton) { copyInlineHtmlButton.addEventListener('click', handleCopyInlineHtml); }
    if (inlinePreviewButton) { inlinePreviewButton.addEventListener('click', handleInlinePreview); }
    if (daysContainer) { daysContainer.addEventListener('dblclick', function(event) { const clickedCard = event.target.closest('.activity-card'); if (clickedCard) { const activityId = clickedCard.dataset.activityId; const activitiesListElement = clickedCard.closest('.activities-list'); if (activitiesListElement) { const dayIndex = activitiesListElement.dataset.dayIndex; if (dayIndex !== undefined && activityId !== undefined) { populateAndOpenEditActivityModal(dayIndex, activityId); } } } }); }

    // Firestore 저장/불러오기 버튼 설정
    if (saveHtmlButton) {
        const saveToFirebaseButton = saveHtmlButton;
        let buttonTextContent = '일정 저장';
        let spanElement = saveToFirebaseButton.querySelector('span.hidden.sm\\:inline');
        if (spanElement) { spanElement.textContent = buttonTextContent; } else {
            let textNodeFoundAndReplaced = false;
            saveToFirebaseButton.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().includes('HTML 저장') && !textNodeFoundAndReplaced) {
                    node.textContent = node.textContent.replace('HTML 저장', buttonTextContent); textNodeFoundAndReplaced = true;
                }
            });
             if (!textNodeFoundAndReplaced) {
                const innerSpan = saveToFirebaseButton.querySelector('span');
                if (innerSpan && innerSpan.textContent.trim().includes('HTML 저장')) { innerSpan.textContent = buttonTextContent;
                } else if (saveToFirebaseButton.textContent.includes('HTML 저장')){ saveToFirebaseButton.innerHTML = saveToFirebaseButton.innerHTML.replace(/HTML 저장/g, buttonTextContent);}
            }
        }
        saveToFirebaseButton.title = '일정 저장';
        saveToFirebaseButton.onclick = () => saveTripToFirestore(false);
    }

    if (saveAsNewToDbButton) {
        console.log("DB 다른 이름으로 저장 버튼 이벤트 리스너 설정");
        saveAsNewToDbButton.addEventListener('click', handleSaveTripAsNew);
    } else {
        console.error("#saveAsNewToDbButton 요소를 찾을 수 없습니다.");
    }

    if (loadHtmlButtonTrigger) {
        const loadFromFirebaseButton = loadHtmlButtonTrigger;
        let buttonTextContent = '일정 불러오기';
        let spanElement = loadFromFirebaseButton.querySelector('span.hidden.sm\\:inline');
        if (spanElement) { spanElement.textContent = buttonTextContent; } else { 
            let textNodeFoundAndReplaced = false;
            loadFromFirebaseButton.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().includes('일정 불러오기') && !textNodeFoundAndReplaced) {
                    node.textContent = node.textContent.replace('일정 불러오기', buttonTextContent); textNodeFoundAndReplaced = true;
                }
            });
             if (!textNodeFoundAndReplaced) {
                const innerSpan = loadFromFirebaseButton.querySelector('span');
                if (innerSpan && innerSpan.textContent.trim().includes('일정 불러오기')) { innerSpan.textContent = buttonTextContent;
                } else if (loadFromFirebaseButton.textContent.includes('일정 불러오기')) { loadFromFirebaseButton.innerHTML = loadFromFirebaseButton.innerHTML.replace(/일정 불러오기/g, buttonTextContent); }
            }
        }
        loadFromFirebaseButton.title = '일정 불러오기';
        if (loadHtmlInput) loadHtmlInput.style.display = 'none';
        loadFromFirebaseButton.onclick = loadTripListFromFirestore;
    }

    if (cancelLoadTripModalButton && loadTripModal) {
        cancelLoadTripModalButton.addEventListener('click', () => {
            loadTripModal.classList.add('hidden');
        });
    }

    // 검색 입력 필드에 이벤트 리스너 추가
    if (tripSearchInput) {
        tripSearchInput.addEventListener('input', renderFilteredTripList);
    } else {
        console.error("#tripSearchInput 요소를 찾을 수 없습니다. (DOMContentLoaded)");
    }
    

    
    // 단축키 이벤트 리스너 추가
    document.addEventListener('keydown', function(event) {
        // F2 감지: DB에 저장 (기존 Ctrl+S 대체)
        if (event.key === 'F2') {
            event.preventDefault(); // F2 키의 브라우저 기본 동작이 있다면 방지 (예: 일부 브라우저의 이름 바꾸기 등)
            console.log("F2 감지: DB에 저장 실행");
            
            if (typeof saveTripToFirestore === 'function' && db) {
                saveTripToFirestore(false); // 일반 저장 (isSaveAsNew = false)
            } else {
                console.error("saveTripToFirestore 함수를 호출할 수 없거나 DB가 초기화되지 않았습니다.");
                showToastMessage("DB 저장 기능을 실행할 수 없습니다. 콘솔을 확인해주세요.", true);
            }
        }

        if (event.key === 'F12') {
            event.preventDefault(); 
            console.log("F12 감지: DB 다른 이름으로 저장 실행");
            if (typeof handleSaveTripAsNew === 'function' && db) {
                handleSaveTripAsNew(); 
            } else {
                console.error("handleSaveTripAsNew 함수를 호출할 수 없거나 DB가 초기화되지 않았습니다.");
                showToastMessage("DB 다른 이름으로 저장 기능을 실행할 수 없습니다. 콘솔을 확인해주세요.", true);
            }
        }
    });
    renderTrip();
});
