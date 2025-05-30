// --- Predefined Emojis ---
const travelEmojis = [
    { value: "", display: "아이콘 없음" }, { value: "✈️", display: "✈️ 항공" }, { value: "🏨", display: "🏨 숙소" }, { value: "🍽️", display: "🍽️ 식사" }, { value: "🏛️", display: "🏛️ 관광(실내)" }, { value: "🏞️", display: "🏞️ 관광(야외)" }, { value: "🚶", display: "🚶 이동(도보)" }, { value: "🚌", display: "🚌 이동(버스)" }, { value: "🚆", display: "🚆 이동(기차)" }, { value: "🚢", display: "🚢 이동(배)" }, { value: "🚕", display: "🚕 이동(택시)" }, { value: "🛍️", display: "🛍️ 쇼핑" }, { value: "📷", display: "📷 사진촬영" }, { value: "🗺️", display: "🗺️ 계획/지도" }, { value: "📌", display: "📌 중요장소" }, { value: "☕", display: "☕ 카페/휴식" }, { value: "🎭", display: "🎭 공연/문화" }, { value: "💼", display: "💼 업무" }, { value: "ℹ️", display: "ℹ️ 정보" }
];

// --- Data ---
let tripData = {
    title: "여행 일정표",
    editingTitle: false,
    days: [
        { date: dateToYyyyMmDd(new Date()), activities: [], isCollapsed: false, editingDate: false }
    ]
};

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
const copyInlineHtmlButton = document.getElementById('copyInlineHtmlButton');
const inlinePreviewButton = document.getElementById('inlinePreviewButton');
const loadHtmlInput = document.getElementById('loadHtmlInput');
const loadHtmlButtonTrigger = document.getElementById('loadHtmlButtonTrigger');
const loadExcelInput = document.getElementById('loadExcelInput');
const loadExcelButtonTrigger = document.getElementById('loadExcelButtonTrigger');
const loadDayAtIndexHtmlInput = document.getElementById('loadDayAtIndexHtmlInput');
const toast = document.getElementById('toast');
const confirmDeleteDayModal = document.getElementById('confirmDeleteDayModal');
const confirmDeleteDayMessage = document.getElementById('confirmDeleteDayMessage');
const cancelDeleteDayButton = document.getElementById('cancelDeleteDayButton');
const confirmDeleteDayActionButton = document.getElementById('confirmDeleteDayActionButton');
let dayIndexToDelete = -1;
let insertDayAtIndex = -1;

// --- Utility Functions ---
function generateId() { return 'id_' + Math.random().toString(36).substr(2, 9); }
function formatDate(dateString, dayNumber) { const date = new Date(dateString + "T00:00:00"); const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }; return `DAY ${dayNumber}: ${date.toLocaleDateString('ko-KR', options)}`; }

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

function populateIconDropdown() { activityIconSelect.innerHTML = ''; travelEmojis.forEach(emoji => { const option = document.createElement('option'); option.value = emoji.value; option.textContent = emoji.display; activityIconSelect.appendChild(option); });}
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
    toast.textContent = message;
    if (isError) {
        toast.style.backgroundColor = 'red';
    } else {
        toast.style.backgroundColor = ''; // Reset to default or specific non-error color
    }
    toast.classList.remove('opacity-0');
    setTimeout(() => {
        toast.classList.add('opacity-0');
        if (isError) toast.style.backgroundColor = ''; // Reset after fading out
    }, 3000);
}


// --- Icon SVGs ---
const editIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>`;
const saveIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
const cancelIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>`;
const duplicateIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>`;
const deleteIconSVG = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;
const saveDayIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13H7v8"></polyline><polyline points="7 3 7 8H3"></polyline></svg>`;
const loadDayAtIndexIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l.001-.001 8.49-8.48"></path><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>`;


// --- Rendering Functions for Main App ---
function renderHeaderTitle() {
    headerTitleSection.innerHTML = '';
    if (tripData.editingTitle) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'header-title-input';
        input.value = tripData.title;
        input.id = 'tripTitleInput';

        const saveButton = document.createElement('button');
        saveButton.className = 'icon-button save-trip-title-button';
        saveButton.title = '제목 저장';
        saveButton.innerHTML = saveIconSVG;
        saveButton.addEventListener('click', handleSaveTripTitle);

        const cancelButton = document.createElement('button');
        cancelButton.className = 'icon-button cancel-trip-title-edit-button';
        cancelButton.title = '취소';
        cancelButton.innerHTML = cancelIconSVG;
        cancelButton.addEventListener('click', handleCancelTripTitleEdit);

        headerTitleSection.appendChild(input);
        headerTitleSection.appendChild(saveButton);
        headerTitleSection.appendChild(cancelButton);
        input.focus();
        input.select();

    } else {
        const titleH1 = document.createElement('h1');
        titleH1.className = 'text-2xl font-bold';
        titleH1.textContent = tripData.title;
        titleH1.id = 'tripTitleDisplay';

        const editButton = document.createElement('button');
        editButton.className = 'icon-button edit-trip-title-button';
        editButton.title = '여행 제목 수정';
        editButton.innerHTML = editIconSVG;
        editButton.addEventListener('click', handleEditTripTitle);

        headerTitleSection.appendChild(titleH1);
        headerTitleSection.appendChild(editButton);
    }
}

function renderTrip() {
    renderHeaderTitle();
    document.body.setAttribute('data-trip-title', tripData.title);
    const creationDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '-').replace('.', '');
    document.body.setAttribute('data-creation-date', creationDate);

    daysContainer.innerHTML = '';
    tripData.days.forEach((day, dayIndex) => {
        const daySection = document.createElement('div');
        daySection.className = 'day-section bg-white shadow-sm rounded-md';
        daySection.dataset.dayId = `day-${dayIndex}`;

        const expandedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
        const collapsedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
        const deleteDayIcon = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>`;

        let dateDisplayHTML;
        if (day.editingDate) {
            dateDisplayHTML = `
                <input type="text" class="date-edit-input-text" value="${day.date}" data-day-index="${dayIndex}" placeholder="YYYY-MM-DD 또는 YYMMDD">
                <button class="save-date-button icon-button" data-day-index="${dayIndex}" title="날짜 저장">${saveIconSVG}</button>
                <button class="cancel-date-edit-button icon-button" data-day-index="${dayIndex}" title="취소">${cancelIconSVG}</button>
            `;
        } else {
            dateDisplayHTML = `
                <h2 class="day-header-title" data-day-index="${dayIndex}">${formatDate(day.date, dayIndex + 1)}</h2>
                <button class="edit-date-button icon-button" data-day-index="${dayIndex}" title="날짜 수정">${editIconSVG}</button>
            `;
        }

        daySection.innerHTML = `
            <div class="day-header-container">
                <div class="day-header-main">
                    ${dateDisplayHTML}
                </div>
                <div class="day-header-controls">
                    <button class="save-day-button icon-button" data-day-index="${dayIndex}" title="이 날짜 HTML로 저장">${saveDayIconSVG}</button>
                    <button class="load-day-at-index-button icon-button" data-day-index="${dayIndex}" title="이 날짜에 덮어쓰기">${loadDayAtIndexIconSVG}</button>
                    <button class="delete-day-button icon-button" data-day-index="${dayIndex}" title="이 날짜 전체 삭제">${deleteDayIcon}</button>
                    <button class="day-toggle-button p-1 rounded hover:bg-gray-200" data-day-index="${dayIndex}">
                        ${day.isCollapsed ? collapsedIcon : expandedIcon}
                    </button>
                </div>
            </div>
            <div class="day-content-wrapper ${day.isCollapsed ? 'hidden' : ''}">
                <div class="activities-list pt-3" data-day-index="${dayIndex}"></div>
                <button class="add-activity-button mt-2 mb-4 ml-2 action-button bg-teal-500 text-white hover:bg-teal-600" data-day-index="${dayIndex}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    이 날짜에 새 일정 추가
                </button>
            </div>
        `;
        daysContainer.appendChild(daySection);

        const activitiesList = daySection.querySelector('.activities-list');
        renderActivities(activitiesList, day.activities, dayIndex);

        if (day.editingDate) {
            daySection.querySelector('.save-date-button').addEventListener('click', handleSaveDate);
            daySection.querySelector('.cancel-date-edit-button').addEventListener('click', handleCancelDateEdit);
        } else {
            daySection.querySelector('.edit-date-button').addEventListener('click', handleEditDate);
        }
         daySection.querySelector('.day-header-container').addEventListener('click', (e) => {
            if (!e.target.closest('input') && !e.target.closest('button')) {
                handleToggleDayCollapse(e);
            }
        });

        daySection.querySelector('.save-day-button').addEventListener('click', (e) => {
            const dayIdx = parseInt(e.currentTarget.dataset.dayIndex);
            handleSaveDayAsHtml(dayIdx);
        });
        daySection.querySelector('.load-day-at-index-button').addEventListener('click', (e) => {
            insertDayAtIndex = parseInt(e.currentTarget.dataset.dayIndex) ;
            loadDayAtIndexHtmlInput.click();
        });
        daySection.querySelector('.delete-day-button').addEventListener('click', (e) => {
            const dayIdx = parseInt(e.currentTarget.dataset.dayIndex);
            showConfirmDeleteDayModal(dayIdx);
        });
        daySection.querySelector('.day-toggle-button').addEventListener('click', handleToggleDayCollapse);
        daySection.querySelector('.add-activity-button').addEventListener('click', handleOpenActivityModalForNew);

        new Sortable(activitiesList, {
            group: 'shared-activities',
            animation: 150,
            ghostClass: 'sortable-ghost',
            dragClass: 'sortable-drag',
            handle: '.activity-card',
            onEnd: function (evt) {
                const fromDayIndex = parseInt(evt.from.dataset.dayIndex);
                const toDayIndex = parseInt(evt.to.dataset.dayIndex);
                const oldActivityIndex = evt.oldDraggableIndex;
                const newActivityIndex = evt.newDraggableIndex;

                if (oldActivityIndex !== undefined && newActivityIndex !== undefined) {
                    const movedActivity = tripData.days[fromDayIndex].activities.splice(oldActivityIndex, 1)[0];
                    tripData.days[toDayIndex].activities.splice(newActivityIndex, 0, movedActivity);
                    renderTrip();
                }
            }
        });
    });

    if (daysContainer.children.length > 0 && !daysContainer.sortableInstance) {
         daysContainer.sortableInstance = new Sortable(daysContainer, {
            animation: 200,
            ghostClass: 'day-section-ghost',
            handle: '.day-header-container',
            onEnd: function(evt) {
                const oldIndex = evt.oldDraggableIndex;
                const newIndex = evt.newDraggableIndex;

                if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
                    const movedDay = tripData.days.splice(oldIndex, 1)[0];
                    tripData.days.splice(newIndex, 0, movedDay);
                    recalculateAllDates();
                    renderTrip();
                }
            }
        });
    } else if (daysContainer.children.length === 0 && daysContainer.sortableInstance) {
        daysContainer.sortableInstance.destroy();
        daysContainer.sortableInstance = null;
    }
}

function renderActivities(activitiesListElement, activities, dayIndex) {
    activitiesListElement.innerHTML = '';
    activities.forEach((activity) => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.setAttribute('data-activity-id', activity.id);
        let imageHTML = '';
        if (activity.imageUrl) { imageHTML = `<img src="${activity.imageUrl}" alt="${activity.title || '활동 이미지'}" class="card-image" onerror="this.style.display='none';">`; }
        card.innerHTML = `
            <div class="card-time-icon-area">
                ${activity.icon ? `<div class="card-icon">${activity.icon}</div>` : '<div class="card-icon" style="height: 28.8px;"></div>'}
                <div class="card-time">${formatTimeToHHMM(activity.time)}</div>
            </div>
            <div class="card-details-area">
                <div class="card-title">${activity.title}</div>
                ${activity.description ? `<div class="card-description">${activity.description}</div>` : ''}
                ${imageHTML}
                ${activity.locationLink ? `<div class="card-location">📍 <a href="${activity.locationLink}" target="_blank" rel="noopener noreferrer">위치 보기</a></div>` : ''}
                ${activity.cost ? `<div class="card-cost">💰 ${activity.cost}</div>` : ''}
                ${activity.notes ? `<div class="card-notes">📝 ${activity.notes}</div>` : ''}
            </div>
            <div class="card-actions-direct">
                <button class="icon-button card-action-icon-button edit-activity-button" data-day-index="${dayIndex}" data-activity-id="${activity.id}" title="수정">${editIconSVG}</button>
                <button class="icon-button card-action-icon-button duplicate-activity-button" data-day-index="${dayIndex}" data-activity-id="${activity.id}" title="복제">${duplicateIconSVG}</button>
                <button class="icon-button card-action-icon-button delete-activity-button" data-day-index="${dayIndex}" data-activity-id="${activity.id}" title="삭제">${deleteIconSVG}</button>
            </div>`;
        activitiesListElement.appendChild(card);
    });
    activitiesListElement.querySelectorAll('.edit-activity-button').forEach(button => { button.addEventListener('click', handleOpenActivityModalForEdit); });
    activitiesListElement.querySelectorAll('.delete-activity-button').forEach(button => { button.addEventListener('click', handleDeleteActivity); });
    activitiesListElement.querySelectorAll('.duplicate-activity-button').forEach(button => { button.addEventListener('click', handleDuplicateActivity); });
}

// --- Trip Title Editing Handlers ---
function handleEditTripTitle() { tripData.editingTitle = true; renderHeaderTitle(); }
function handleSaveTripTitle() { const titleInput = document.getElementById('tripTitleInput'); if (titleInput && titleInput.value.trim() !== "") { tripData.title = titleInput.value.trim(); } tripData.editingTitle = false; renderHeaderTitle(); document.body.setAttribute('data-trip-title', tripData.title); }
function handleCancelTripTitleEdit() { tripData.editingTitle = false; renderHeaderTitle(); }

// --- Date Editing and Recalculation ---
function isValidDateString(dateString) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
    const parts = dateString.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (year < 1000 || year > 3000 || month === 0 || month > 12) return false;
    const monthLength = [31, (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (day === 0 || day > monthLength[month - 1]) return false;
    return true;
}

function parseAndValidateDateInput(inputValue) {
    let dateStr = inputValue.trim();
    if (/^\d{8}$/.test(dateStr)) {
        dateStr = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    }
    if (isValidDateString(dateStr)) {
        return dateStr;
    }
    return null;
}


function recalculateAllDates() {
    if (tripData.days.length > 0) {
        let currentDate = new Date(tripData.days[0].date + "T00:00:00");
        tripData.days[0].date = dateToYyyyMmDd(currentDate);
        for (let i = 1; i < tripData.days.length; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            tripData.days[i].date = dateToYyyyMmDd(currentDate);
        }
    }
}

function handleEditDate(event) { const dayIndex = parseInt(event.currentTarget.dataset.dayIndex); tripData.days.forEach((day, index) => { day.editingDate = (index === dayIndex); }); renderTrip(); }

function handleSaveDate(event) {
    const dayIndex = parseInt(event.currentTarget.dataset.dayIndex);
    const dateInput = document.querySelector(`.date-edit-input-text[data-day-index="${dayIndex}"]`);
    if (dateInput && dateInput.value) {
        const validatedDate = parseAndValidateDateInput(dateInput.value);
        if (validatedDate) {
            tripData.days[dayIndex].date = validatedDate;
            tripData.days[dayIndex].editingDate = false;
            recalculateAllDates();
            renderTrip();
        } else {
            showToastMessage("잘못된 날짜 형식입니다. YYYY-MM-DD 또는 YYYYMMDD 형식으로 유효한 날짜를 입력해주세요.\n(예: 2025-07-25 또는 20250725)", true);
        }
    } else {
        tripData.days[dayIndex].editingDate = false;
        renderTrip();
    }
}

function handleCancelDateEdit(event) { const dayIndex = parseInt(event.currentTarget.dataset.dayIndex); tripData.days[dayIndex].editingDate = false; renderTrip(); }

function handleToggleDayCollapse(event) {
    const dayHeaderContainer = event.target.closest('.day-header-container');
    if (!dayHeaderContainer) return;
    const dayIndexElement = dayHeaderContainer.querySelector('[data-day-index]');
    if (!dayIndexElement) return;
    const dayIndex = parseInt(dayIndexElement.dataset.dayIndex);
    const day = tripData.days[dayIndex];
    if (day.editingDate) return;

    const dayContentWrapper = dayHeaderContainer.nextElementSibling;
    const toggleButtonElement = dayHeaderContainer.querySelector('.day-toggle-button');
    const expandedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
    const collapsedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;

    day.isCollapsed = !day.isCollapsed;
    if (dayContentWrapper) dayContentWrapper.classList.toggle('hidden', day.isCollapsed);
    if (toggleButtonElement) { toggleButtonElement.innerHTML = day.isCollapsed ? collapsedIcon : expandedIcon; }
}


// --- Activity Modal Logic ---
function handleOpenActivityModalForNew(event) { const dayIdx = event.currentTarget.dataset.dayIndex; modalTitle.textContent = '새 일정 추가'; activityForm.reset(); populateIconDropdown(); activityIconSelect.value = travelEmojis[0].value; activityTimeInput.value = ''; activityIdInput.value = ''; dayIndexInput.value = dayIdx; activityModal.classList.remove('hidden'); }
function handleOpenActivityModalForEdit(event) { const button = event.currentTarget; const dayIdx = button.dataset.dayIndex; const activityIdToEdit = button.dataset.activityId; const activity = tripData.days[dayIdx].activities.find(act => act.id === activityIdToEdit); if (activity) { modalTitle.textContent = '일정 수정'; activityForm.reset(); populateIconDropdown(); activityIdInput.value = activity.id; dayIndexInput.value = dayIdx; activityTimeInput.value = activity.time || ""; activityIconSelect.value = activity.icon || ""; document.getElementById('activityTitle').value = activity.title || ""; document.getElementById('activityDescription').value = activity.description || ""; document.getElementById('activityLocation').value = activity.locationLink || ""; document.getElementById('activityImageUrl').value = activity.imageUrl || ""; document.getElementById('activityCost').value = activity.cost || ""; document.getElementById('activityNotes').value = activity.notes || ""; activityModal.classList.remove('hidden'); } }

activityTimeInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 4) { value = value.substring(0, 4); }
    e.target.value = value;
});

activityForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dayIdx = parseInt(dayIndexInput.value);
    const currentActivityId = activityIdInput.value;
    let timeValue = activityTimeInput.value.trim();
    if (timeValue.length > 0 && (timeValue.length !== 4 || !/^\d{4}$/.test(timeValue))) { showToastMessage("시간은 HHMM 형식의 4자리 숫자로 입력하거나 비워두세요. (예: 0930 또는 1700)", true); return; }
    if (timeValue.length === 4) { const hours = parseInt(timeValue.substring(0, 2), 10); const minutes = parseInt(timeValue.substring(2, 4), 10); if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) { showToastMessage("유효하지 않은 시간입니다. HH는 00-23, MM은 00-59 사이로 입력해주세요.", true); return; } }
    const activityData = { id: currentActivityId || generateId(), time: timeValue, icon: activityIconSelect.value, title: document.getElementById('activityTitle').value, description: document.getElementById('activityDescription').value, locationLink: document.getElementById('activityLocation').value, imageUrl: document.getElementById('activityImageUrl').value, cost: document.getElementById('activityCost').value, notes: document.getElementById('activityNotes').value, };
    if (currentActivityId) { const activityIndex = tripData.days[dayIdx].activities.findIndex(act => act.id === currentActivityId); if (activityIndex > -1) { tripData.days[dayIdx].activities[activityIndex] = activityData; } } else { tripData.days[dayIdx].activities.push(activityData); }
    activityModal.classList.add('hidden');
    renderTrip();
});
document.getElementById('cancelActivityButton').addEventListener('click', () => { activityModal.classList.add('hidden'); });

// --- Day Management ---
addDayButton.addEventListener('click', () => {
    let newDate;
    if (tripData.days.length > 0) {
        const lastDate = new Date(tripData.days[tripData.days.length - 1].date + "T00:00:00");
        newDate = new Date(lastDate);
        newDate.setDate(lastDate.getDate() + 1);
    } else {
        newDate = new Date();
    }
    const newDay = { date: dateToYyyyMmDd(newDate), activities: [], isCollapsed: false, editingDate: false };
    tripData.days.push(newDay);
    recalculateAllDates();
    renderTrip();
});

function showConfirmDeleteDayModal(dayIdx) { dayIndexToDelete = dayIdx; const dayNumber = dayIdx + 1; const dateString = new Date(tripData.days[dayIdx].date + "T00:00:00").toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }); confirmDeleteDayMessage.textContent = `DAY ${dayNumber} (${dateString})의 모든 일정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`; confirmDeleteDayModal.classList.remove('hidden'); }
function hideConfirmDeleteDayModal() { confirmDeleteDayModal.classList.add('hidden'); dayIndexToDelete = -1; }
confirmDeleteDayActionButton.addEventListener('click', () => { if (dayIndexToDelete > -1 && dayIndexToDelete < tripData.days.length) { tripData.days.splice(dayIndexToDelete, 1); recalculateAllDates(); renderTrip(); } hideConfirmDeleteDayModal(); });
cancelDeleteDayButton.addEventListener('click', hideConfirmDeleteDayModal);
function handleDeleteActivity(event) { const button = event.currentTarget; const dayIdx = button.dataset.dayIndex; const activityIdToDelete = button.dataset.activityId; tripData.days[dayIdx].activities = tripData.days[dayIdx].activities.filter(act => act.id !== activityIdToDelete); renderTrip(); }
function handleDuplicateActivity(event) { const button = event.currentTarget; const dayIdx = parseInt(button.dataset.dayIndex); const activityIdToDuplicate = button.dataset.activityId; const activityToDuplicate = tripData.days[dayIdx].activities.find(act => act.id === activityIdToDuplicate); if (activityToDuplicate) { const newActivity = { ...activityToDuplicate, id: generateId(), title: `${activityToDuplicate.title} (복사본)` }; const originalIndex = tripData.days[dayIdx].activities.findIndex(act => act.id === activityIdToDuplicate); tripData.days[dayIdx].activities.splice(originalIndex + 1, 0, newActivity); renderTrip(); } }

// --- Function to generate Read-Only HTML View String for a single day ---
function generateReadOnlyDayView(dayData, dayNumber) {
    let activitiesHTML = '';
    dayData.activities.forEach(activity => {
        let imageHTML = '';
        if (activity.imageUrl) { imageHTML = `<img src="${activity.imageUrl}" alt="${activity.title || '활동 이미지'}" class="card-image" onerror="this.style.display='none';">`; }
        activitiesHTML += `
            <div class="readonly-activity-card">
                <div class="card-time-icon-area">
                     ${activity.icon ? `<div class="card-icon">${activity.icon}</div>` : '<div class="card-icon" style="height: 28.8px;"></div>'}
                    <div class="card-time">${formatTimeToHHMM(activity.time)}</div>
                </div>
                <div class="card-details-area">
                    <div class="card-title">${activity.title}</div>
                    ${activity.description ? `<div class="card-description">${activity.description}</div>` : ''}
                    ${imageHTML}
                    ${activity.locationLink ? `<div class="card-location">📍 <a href="${activity.locationLink}" target="_blank" rel="noopener noreferrer">위치 보기</a></div>` : ''}
                    ${activity.cost ? `<div class="card-cost">💰 ${activity.cost}</div>` : ''}
                    ${activity.notes ? `<div class="card-notes">📝 ${activity.notes}</div>` : ''}
                </div>
            </div>`;
    });
    const dayHeaderId = `day-header-readonly-single-${dayNumber}`;
    return `
        <div class="day-section bg-white shadow-sm rounded-md">
            <div class="day-header-container" id="${dayHeaderId}">
                <div class="day-header-main">
                    <h2 class="day-header-title">${formatDate(dayData.date, dayNumber)}</h2>
                </div>
            </div>
            <div class="day-content-wrapper">
                <div class="activities-list pt-3">
                    ${activitiesHTML}
                </div>
            </div>
        </div>
    `;
}

// --- Function to generate Read-Only HTML View String for the entire trip ---
function generateReadOnlyHTMLView(data) {
    let daysHTML = '';
    data.days.forEach((day, dayIndex) => {
        let activitiesHTML = '';
        day.activities.forEach(activity => {
            let imageHTML = '';
            if (activity.imageUrl) { imageHTML = `<img src="${activity.imageUrl}" alt="${activity.title || '활동 이미지'}" class="card-image" onerror="this.style.display='none';">`; }
            activitiesHTML += `
                <div class="readonly-activity-card">
                    <div class="card-time-icon-area">
                        ${activity.icon ? `<div class="card-icon">${activity.icon}</div>` : '<div class="card-icon" style="height: 28.8px;"></div>'}
                        <div class="card-time">${formatTimeToHHMM(activity.time)}</div>
                    </div>
                    <div class="card-details-area">
                        <div class="card-title">${activity.title}</div>
                        ${activity.description ? `<div class="card-description">${activity.description}</div>` : ''}
                        ${imageHTML}
                        ${activity.locationLink ? `<div class="card-location">📍 <a href="${activity.locationLink}" target="_blank" rel="noopener noreferrer">위치 보기</a></div>` : ''}
                        ${activity.cost ? `<div class="card-cost">💰 ${activity.cost}</div>` : ''}
                        ${activity.notes ? `<div class="card-notes">📝 ${activity.notes}</div>` : ''}
                    </div>
                </div>`;
        });
         const expandedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
        const collapsedIcon = `<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`;
        const isDayCollapsedInSavedView = true;
        const dayHeaderId = `day-header-readonly-trip-${dayIndex}`;


        daysHTML += `
            <div class="day-section bg-white shadow-sm rounded-md">
                <div class="day-header-container" id="${dayHeaderId}" onclick="toggleDayView(this)">
                    <div class="day-header-main">
                        <h2 class="day-header-title">${formatDate(day.date, dayIndex + 1)}</h2>
                    </div>
                    <div class="day-header-controls">
                        <span class="day-toggle-button-static p-1 rounded">
                             ${isDayCollapsedInSavedView ? collapsedIcon : expandedIcon}
                        </span>
                    </div>
                </div>
                <div class="day-content-wrapper ${isDayCollapsedInSavedView ? 'hidden' : ''}">
                    <div class="activities-list pt-3">
                        ${activitiesHTML}
                    </div>
                     <div class="text-right p-2 mt-2">
                        <button type="button" class="readonly-collapse-button" onclick="document.getElementById('${dayHeaderId}').click(); event.stopPropagation();">
                            일차 접기
                        </button>
                    </div>
                </div>
            </div>`;
    });
    return `
        <header class="readonly-view-header">
            <h1>${data.title}</h1>
        </header>
        <main class="readonly-main-content saved-html-view">
            <div id="daysContainerReadOnly">
                ${daysHTML}
            </div>
        </main>`;
}

// --- HTML Save/Load ---
saveHtmlButton.addEventListener('click', () => {
    const tripDataToSave = JSON.parse(JSON.stringify(tripData));
    tripDataToSave.days.forEach(day => day.isCollapsed = true);
    tripDataToSave.editingTitle = false;

    const tripDataString = JSON.stringify(tripData);
    const safeTripDataString = tripDataString.replace(/<\/script>/g, '<\\/script>');
    const readOnlyViewHTML = generateReadOnlyHTMLView(tripDataToSave);

    let styles = "";
    const styleLink = document.querySelector('link[href="style.css"]');
    if (styleLink && styleLink.sheet) {
        try {
            Array.from(styleLink.sheet.cssRules).forEach(rule => {
                styles += rule.cssText + '\n';
            });
        } catch (e) {
            console.warn("Could not access linked stylesheet rules for saving HTML. Styles might be incomplete.", e);
            styles = "/* CSS rules could not be fully embedded. Please ensure style.css is accessible. */";
        }
    } else {
        styles = "/* Styles from style.css were not loaded. */";
    }

    const tailwindCDN = '<script src="https://cdn.tailwindcss.com"><\/script>';
    const googleFontLink = '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">';
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>여행 일정: ${tripData.title}</title>
            ${tailwindCDN}
            ${googleFontLink}
            <style>
                body { font-family: 'Noto Sans KR', sans-serif; background-color: #F8F9FA; }
                ${styles}
                .day-header-container[onclick] { cursor: pointer; }
                .day-header-container[onclick]:hover { background-color: #f0f0f0; }
            </style>
        </head>
        <body class="text-gray-800">
            ${readOnlyViewHTML}
            <script type="application/json" id="embeddedTripData">
                ${safeTripDataString}
            <\/script>
            <script>
                function toggleDayView(headerElement) {
                    const contentWrapper = headerElement.nextElementSibling;
                    const toggleButtonSpan = headerElement.querySelector('.day-toggle-button-static');
                    if (contentWrapper && toggleButtonSpan) {
                        const isHidden = contentWrapper.classList.toggle('hidden');
                        const expandedIconHTML = '<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>';
                        const collapsedIconHTML = '<svg class="toggle-icon w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';
                        toggleButtonSpan.innerHTML = isHidden ? collapsedIconHTML : expandedIconHTML;
                    }
                }
            <\/script>
        </body>
        </html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const fileName = `여행일정_${tripData.title.replace(/[^a-z0-9가-힣]/gi, '_')}_${dateToYyyyMmDd(new Date())}.html`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    showToastMessage('읽기 전용 HTML 파일로 저장되었습니다.');
});

loadHtmlButtonTrigger.addEventListener('click', () => { loadHtmlInput.click(); });
loadHtmlInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const htmlString = e.target.result;
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, "text/html");
                const embeddedDataElement = doc.getElementById('embeddedTripData');
                if (embeddedDataElement && embeddedDataElement.textContent) {
                    const loadedData = JSON.parse(embeddedDataElement.textContent);
                    if (loadedData && loadedData.title && Array.isArray(loadedData.days)) {
                        tripData = loadedData;
                        if (typeof tripData.editingTitle === 'undefined') {
                            tripData.editingTitle = false;
                        }
                        tripData.days.forEach(day => {
                            if (typeof day.editingDate === 'undefined') day.editingDate = false;
                            if (typeof day.isCollapsed === 'undefined') day.isCollapsed = false;
                        });
                        renderTrip();
                        showToastMessage('HTML 파일에서 일정을 불러왔습니다.');
                    } else { throw new Error('유효하지 않은 데이터 형식입니다.'); }
                } else { throw new Error('HTML 파일에서 여행 일정 데이터를 찾을 수 없습니다. 이 파일은 편집용으로 불러올 수 없습니다.'); }
            } catch (err) { console.error("HTML 불러오기 오류:", err); showToastMessage(`오류: ${err.message}`, true);
            } finally { loadHtmlInput.value = null; }
        };
        reader.onerror = () => { showToastMessage('파일을 읽는 중 오류가 발생했습니다.', true); loadHtmlInput.value = null; };
        reader.readAsText(file);
    }
});

// --- Individual Day Save/Load ---
function handleSaveDayAsHtml(dayIndex) {
    if (dayIndex < 0 || dayIndex >= tripData.days.length) return;
    const dayDataToSave = JSON.parse(JSON.stringify(tripData.days[dayIndex]));

    const dayDataString = JSON.stringify(dayDataToSave);
    const safeDayDataString = dayDataString.replace(/<\/script>/g, '<\\/script>');

    const dayNumberForView = dayIndex + 1;
    const readOnlyDayViewHTML = generateReadOnlyDayView(dayDataToSave, dayNumberForView);

    let styles = "";
    const styleLink = document.querySelector('link[href="style.css"]');
    if (styleLink && styleLink.sheet) {
        try {
            Array.from(styleLink.sheet.cssRules).forEach(rule => {
                styles += rule.cssText + '\n';
            });
        } catch (e) {
            console.warn("Could not access linked stylesheet rules for saving day HTML.", e);
            styles = "/* CSS rules from style.css could not be embedded. */";
        }
    } else {
        styles = "/* Styles from style.css were not loaded. */";
    }

    const tailwindCDN = '<script src="https://cdn.tailwindcss.com"><\/script>';
    const googleFontLink = '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">';

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="ko">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>DAY ${dayNumberForView} 일정 (${dayDataToSave.date})</title>
            ${tailwindCDN}
            ${googleFontLink}
            <style>
                body { font-family: 'Noto Sans KR', sans-serif; background-color: #F8F9FA; }
                ${styles}
                .readonly-view-header h1 { font-size: 1.25rem; }
                .saved-html-view .day-content-wrapper { display: block !important; }
                .saved-html-view .day-header-controls .day-toggle-button-static { display: none !important; }
            </style>
        </head>
        <body class="text-gray-800">
            <header class="readonly-view-header">
                 <h1>DAY ${dayNumberForView} : ${new Date(dayDataToSave.date + "T00:00:00").toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</h1>
            </header>
            <main class="readonly-main-content saved-html-view">
                ${readOnlyDayViewHTML}
            </main>
            <script type="application/json" id="embeddedTripDayData">
                ${safeDayDataString}
            <\/script>
        </body>
        </html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const fileName = `DAY${dayIndex + 1}_${dayDataToSave.date}_일정.html`;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    showToastMessage(`DAY ${dayIndex + 1} 일정이 HTML 파일로 저장되었습니다.`);
}

loadDayAtIndexHtmlInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && insertDayAtIndex !== -1) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const htmlString = e.target.result;
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, "text/html");
                const embeddedDataElement = doc.getElementById('embeddedTripDayData');

                if (embeddedDataElement && embeddedDataElement.textContent) {
                    const loadedDayData = JSON.parse(embeddedDataElement.textContent);
                    if (loadedDayData && loadedDayData.date && Array.isArray(loadedDayData.activities)) {
                        tripData.days[insertDayAtIndex].activities = loadedDayData.activities.map(act => ({...act, id: generateId()}));
                        tripData.days[insertDayAtIndex].date = loadedDayData.date;
                        tripData.days[insertDayAtIndex].isCollapsed = false;
                        tripData.days[insertDayAtIndex].editingDate = false;

                        recalculateAllDates();
                        renderTrip();
                        showToastMessage(`DAY ${insertDayAtIndex + 1} 일정을 불러온 내용으로 덮어썼습니다.`);
                    } else {
                        throw new Error('유효하지 않은 날짜 데이터 형식입니다.');
                    }
                } else {
                    throw new Error('HTML 파일에서 날짜 데이터를 찾을 수 없습니다.');
                }
            } catch (err) {
                console.error("날짜 HTML 덮어쓰기 오류:", err);
                showToastMessage(`오류: ${err.message}`, true);
            } finally {
                loadDayAtIndexHtmlInput.value = null;
                insertDayAtIndex = -1;
            }
        };
        reader.onerror = () => {
            showToastMessage('파일을 읽는 중 오류가 발생했습니다.', true);
            loadDayAtIndexHtmlInput.value = null;
            insertDayAtIndex = -1;
        };
        reader.readAsText(file);
    } else {
         insertDayAtIndex = -1;
    }
});

// --- Excel Load Logic ---
loadExcelButtonTrigger.addEventListener('click', () => {
    loadExcelInput.click();
});

loadExcelInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, {type: 'array', cellDates: true, dateNF:'yyyy-mm-dd'});
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1, raw: false, defval: ""});

                if (jsonData.length < 2) {
                    throw new Error("엑셀 파일에 데이터가 없거나 헤더만 존재합니다.");
                }

                const newDaysData = [];
                let currentDayObject = null;
                let errors = [];

                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    const excelRowNumber = i + 1;

                    const rawDate = row[0] ? String(row[0]).trim() : "";
                    const time = row[1] ? String(row[1]).trim().padStart(4, '0') : "";
                    const title = row[2] ? String(row[2]).trim() : "";
                    const description = row[3] ? String(row[3]).trim() : "";
                    const icon = row[4] ? String(row[4]).trim() : "";
                    const locationLink = row[5] ? String(row[5]).trim() : "";
                    const imageUrl = row[6] ? String(row[6]).trim() : "";
                    const cost = row[7] ? String(row[7]).trim() : "";
                    const notes = row[8] ? String(row[8]).trim() : "";

                    let formattedDate = "";
                    if (!rawDate) {
                        errors.push(`${excelRowNumber}행: 날짜(A열)가 비어있습니다. 이 행을 건너<0xEB뛰니다>.`);
                        continue;
                    }
                    let parsedDate = null;
                    if (typeof rawDate === 'number') {
                        parsedDate = XLSX.SSF.parse_date_code(rawDate);
                        if (parsedDate) {
                             formattedDate = `${parsedDate.y}-${String(parsedDate.m).padStart(2,'0')}-${String(parsedDate.d).padStart(2,'0')}`;
                        }
                    } else if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
                        parsedDate = new Date(rawDate + "T00:00:00");
                        if (!isNaN(parsedDate.getTime()) && isValidDateString(rawDate)) {
                            formattedDate = rawDate;
                        }
                    }

                    if (!formattedDate) {
                        errors.push(`${excelRowNumber}행: 날짜(A열) 형식이 올바르지 않습니다 (YYYY-MM-DD 필요). 값: "${row[0]}". 이 행을 건너<0xEB뛰니다>.`);
                        continue;
                    }

                    if (!title) {
                        errors.push(`${excelRowNumber}행: 활동/장소명(C열)이 비어있습니다. 이 행을 건너<0xEB뛰니다>.`);
                        continue;
                    }

                    if (time && (!/^\d{4}$/.test(time) || parseInt(time.substring(0,2)) > 23 || parseInt(time.substring(2,4)) > 59 )) {
                        errors.push(`${excelRowNumber}행: 시간(B열)은 HHMM 형식이거나 비워야 합니다. 값: "${row[1]}". 시간 정보 없이 진행합니다.`);
                    }

                    if (!currentDayObject || currentDayObject.date !== formattedDate) {
                        currentDayObject = {
                            date: formattedDate,
                            activities: [],
                            isCollapsed: false,
                            editingDate: false
                        };
                        newDaysData.push(currentDayObject);
                    }

                    currentDayObject.activities.push({
                        id: generateId(),
                        time: time,
                        icon: icon,
                        title: title,
                        description: description,
                        locationLink: locationLink,
                        imageUrl: imageUrl,
                        cost: cost,
                        notes: notes
                    });
                }

                if (errors.length > 0) {
                    showToastMessage("엑셀 데이터 불러오기 중 일부 오류가 발생했습니다. 자세한 내용은 콘솔을 확인하세요.", true);
                    console.warn("엑셀 불러오기 오류:\n" + errors.join("\n"));
                }

                if (newDaysData.length > 0) {
                    tripData.days = newDaysData;
                    renderTrip();
                    showToastMessage('엑셀에서 일정을 성공적으로 불러왔습니다.');
                } else if (errors.length > 0 && newDaysData.length === 0) {
                     showToastMessage('엑셀에서 유효한 데이터를 불러오지 못했습니다. 오류를 확인해주세요.', true);
                } else {
                     showToastMessage('엑셀 파일에 처리할 데이터가 없습니다.', true);
                }

            } catch (err) {
                console.error("엑셀 불러오기 오류:", err);
                showToastMessage(`엑셀 파일 처리 중 오류: ${err.message}`, true);
            } finally {
                loadExcelInput.value = null;
            }
        };
        reader.onerror = () => { showToastMessage('파일을 읽는 중 오류가 발생했습니다.', true); loadExcelInput.value = null; };
        reader.readAsArrayBuffer(file);
    }
});


// --- 인라인 스타일 HTML 생성 및 표시 ---
function handleInlinePreview() {
    const inlineHtml = generateInlineStyledHTML(tripData);
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
        previewWindow.document.write(inlineHtml);
        previewWindow.document.close();
    } else {
        showToastMessage("팝업이 차단되었을 수 있습니다. 인라인 미리보기 창을 열 수 없습니다.", true);
    }
}

function formatDateForInlineView(dateString, dayNumber) {
    const date = new Date(dateString + "T00:00:00");
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return `DAY ${dayNumber}: ${date.toLocaleDateString('ko-KR', options)}`;
}

async function handleCopyInlineHtml() {
    const inlineHtml = generateInlineStyledHTML(tripData);
    try {
        await navigator.clipboard.writeText(inlineHtml);
        showToastMessage('인라인 코드가 클립보드에 복사되었습니다.');
    } catch (err) {
        console.error('클립보드 복사 실패:', err);
        showToastMessage('클립보드 복사에 실패했습니다. 콘솔을 확인해주세요.', true);
    }
}

function generateInlineStyledHTML(data) {
    let daysHTML = '';
    data.days.forEach((day, dayIndex) => {
        let activitiesHTML = '';
        day.activities.forEach(activity => {
            const formattedTime = formatTimeToHHMM(activity.time);

            let imageDetailHTML = '';
            if (activity.imageUrl) {
                imageDetailHTML = `
                <details style="margin-top: 8px;">
                    <summary style="font-size: 12px; color: #007bff; text-decoration: none; cursor: pointer; display: inline-block;">🖼️ 사진보기</summary>
                    <img src="${activity.imageUrl}" alt="${activity.title || '활동 이미지'}" style="max-width: 300px; height: auto; object-fit: cover; border-radius: 4px; margin-top: 8px; display: block;" onerror="this.style.display='none';">
                </details>`;
            }

            let locationHTML = '';
            if (activity.locationLink) {
                locationHTML = `<div class="card-location" style="font-size: 12px; margin-top: 4px;">📍 <a href="${activity.locationLink}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: none;">위치 보기</a></div>`;
            }

            let costHTML = '';
            if (activity.cost) {
                costHTML = `<div class="card-cost" style="font-size: 12px; margin-top: 4px;">💰 ${activity.cost}</div>`;
            }

            let notesHTML = '';
            if (activity.notes) {
                const notesText = activity.notes.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                notesHTML = `<div class="card-notes" style="font-size: 12px; margin-top: 4px;">📝 ${notesText}</div>`;
            }
            
            let descriptionHTML = '';
            if(activity.description){
                 descriptionHTML = `<div class="card-description" style="font-size: 12px;">${activity.description}</div>`;
            }

            activitiesHTML += `
                <div class="readonly-activity-card" style="background-color: white; border-radius: 8px; border: 1px solid #E0E0E0; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); display: flex;">
                    <div class="card-time-icon-area" style="width: 100px; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-start;">
                        <div class="card-icon" style="font-size: 20px; margin-bottom: 4px;">${activity.icon || ''}</div>
                        <div class="card-time" style="font-size: 12px; font-weight: bold; min-height: 18px;">${formattedTime}</div>
                    </div>
                    <div class="card-details-area" style="flex-grow: 1; display: flex; flex-direction: column; gap: 4px;">
                        <div class="card-title" style="font-size: 14px; font-weight: bold;">${activity.title}</div>
                        ${descriptionHTML}
                        ${imageDetailHTML}
                        ${locationHTML}
                        ${costHTML}
                        ${notesHTML}
                    </div>
                </div>`;
        });

        daysHTML += `
            <div class="day-section" style="margin-bottom: 16px; border-radius: 0.375rem; background-color: #ffffff; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);">
                <details open>
                    <summary style="display: flex; align-items: center; padding: 12px 8px; border-bottom: 1px solid #EEE; background-color: #fdfdfd; border-radius: 6px 6px 0 0; cursor: pointer;">
                        <div class="day-header-main" style="display: flex; align-items: center; gap: 8px; flex-grow: 1;">
                            <h2 class="day-header-title" style="font-size: 16px; font-weight: 600;">${formatDateForInlineView(day.date, dayIndex + 1)}</h2>
                        </div>
                    </summary>
                    <div class="day-content-wrapper" style="padding: 0 8px 8px 8px;">
                        <div class="activities-list" style="padding-top: 0.75rem;">
                            ${activitiesHTML}
                        </div>
                    </div>
                </details>
            </div>`;
    });

    return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
    </head>
    <body>
        <header style="background-color: white; border-bottom: 1px solid #E0E0E0; padding: 1rem; text-align: center;">
            <h1 style="font-size: 1.25rem; font-weight: bold;">${data.title}</h1>
        </header>
        <main style="max-width: 48rem; margin-left: auto; margin-right: auto; padding: 1rem; font-family: 'Noto Sans KR', sans-serif;">
            <div id="daysContainerReadOnly">
                ${daysHTML}
            </div>
        </main>
    </body>
    </html>
    `;
}

// --- Initial Setup ---
populateIconDropdown();
if (saveHtmlButton) { // Ensure button exists before adding listener
    saveHtmlButton.addEventListener('click', saveHtmlButton.onclick); // This seems like an error from previous code, should be handleSaveHtml or similar.
                                                                   // The original code was `saveHtmlButton.addEventListener('click', () => { ... });`
                                                                   // For now, I'll keep it as it was in the provided full script if it had a specific handler named `saveHtmlButton.onclick`.
                                                                   // Rechecking, the saveHtmlButton had a direct event listener function.
}
if (copyInlineHtmlButton) {
    copyInlineHtmlButton.addEventListener('click', handleCopyInlineHtml);
}
if (inlinePreviewButton) {
    inlinePreviewButton.addEventListener('click', handleInlinePreview);
}
renderTrip();
