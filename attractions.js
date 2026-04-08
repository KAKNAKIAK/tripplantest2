// --- Predefined Emojis (same as main app) ---
const travelEmojis = [
    { value: "", display: "아이콘 없음" }, { value: "💆🏻", display: "💆🏻 마사지" }, { value: "✈️", display: "✈️ 항공" }, { value: "🏨", display: "🏨 숙소" },{ value: "🏌️", display: "🏌️ 골프" },  { value: "🍽️", display: "🍽️ 식사" }, { value: "🏛️", display: "🏛️ 관광(실내)" }, { value: "🏞️", display: "🏞️ 관광(야외)" }, { value: "🚶", display: "🚶 이동(도보)" }, { value: "🚌", display: "🚌 이동(버스)" }, { value: "🚆", display: "🚆 이동(기차)" }, { value: "🚢", display: "🚢 이동(배)" }, { value: "🚕", display: "🚕 이동(택시)" }, { value: "🛍️", display: "🛍️ 쇼핑" }, { value: "📷", display: "📷 사진촬영" }, { value: "🗺️", display: "🗺️ 계획/지도" }, { value: "📌", display: "📌 중요장소" }, { value: "☕", display: "☕ 카페/휴식" }, { value: "🎭", display: "🎭 공연/문화" }, { value: "💼", display: "💼 업무" }, { value: "ℹ️", display: "ℹ️ 정보" }
];

// --- Firebase Init ---
const firebaseConfig = {
    apiKey: "AIzaSyAGULxdnWWnSc5eMCsqHeKGK9tmyHsxlv0",
    authDomain: "trip-planner-app-cc72c.firebaseapp.com",
    projectId: "trip-planner-app-cc72c",
    storageBucket: "trip-planner-app-cc72c.appspot.com",
    messagingSenderId: "1063594141232",
    appId: "1:1063594141232:web:1dbba9b9722b20ff602ff5",
    measurementId: "G-2G3Z6WMLF6"
};

if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
} else {
    console.error("Firebase SDK가 로드되지 않았습니다.");
}
const db = typeof firebase !== 'undefined' ? firebase.firestore() : null;

let allAttractions = [];
let deleteTargetId = null;
let deleteTargetTitle = '';
let viewMode = localStorage.getItem('attractionViewMode') || 'card'; // 'card' or 'list'

// --- DOM ---
const searchInput = document.getElementById('searchInput');
const attractionGrid = document.getElementById('attractionGrid');
const emptyState = document.getElementById('emptyState');
const emptyTitle = document.getElementById('emptyTitle');
const emptyDesc = document.getElementById('emptyDesc');
const loadingState = document.getElementById('loadingState');
const addNewBtn = document.getElementById('addNewBtn');
const totalCount = document.getElementById('totalCount');

const editModal = document.getElementById('editModal');
const modalTitle = document.getElementById('modalTitle');
const editForm = document.getElementById('editForm');
const editId = document.getElementById('editId');
const editIcon = document.getElementById('editIcon');
const editTitle = document.getElementById('editTitle');
const editDescription = document.getElementById('editDescription');
const editImageUrl = document.getElementById('editImageUrl');
const editCost = document.getElementById('editCost');
const editNotes = document.getElementById('editNotes');
const cancelBtn = document.getElementById('cancelBtn');
const imagePreview = document.getElementById('imagePreview');
const imagePreviewImg = document.getElementById('imagePreviewImg');

const deleteModal = document.getElementById('deleteModal');
const deleteMessage = document.getElementById('deleteMessage');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

const toast = document.getElementById('toast');

// --- Utility ---
function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.background = isError ? '#dc2626' : '#1f2937';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function populateIconSelect() {
    editIcon.innerHTML = '';
    travelEmojis.forEach(emoji => {
        const opt = document.createElement('option');
        opt.value = emoji.value;
        opt.textContent = emoji.display;
        editIcon.appendChild(opt);
    });
}

// --- Data Loading ---
async function loadAttractions() {
    if (!db) { showToast("Firestore가 초기화되지 않았습니다.", true); return; }
    loadingState.classList.remove('hidden');
    attractionGrid.classList.add('hidden');
    emptyState.classList.add('hidden');

    try {
        const snapshot = await db.collection("attractions").orderBy("title").get();
        allAttractions = [];
        snapshot.forEach(doc => {
            allAttractions.push({ id: doc.id, ...doc.data() });
        });
        loadingState.classList.add('hidden');
        renderAttractions();
    } catch (error) {
        console.error("Error loading attractions:", error);
        showToast("관광지 목록을 불러올 수 없습니다.", true);
        loadingState.classList.add('hidden');
    }
}

// --- Rendering ---
function renderAttractions() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filtered = allAttractions.filter(a => {
        const titleMatch = a.title && a.title.toLowerCase().includes(searchTerm);
        const descMatch = a.description && a.description.toLowerCase().includes(searchTerm);
        return titleMatch || descMatch;
    });

    totalCount.textContent = `총 ${allAttractions.length}건`;

    if (filtered.length === 0) {
        attractionGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        if (searchTerm && allAttractions.length > 0) {
            emptyTitle.textContent = `"${searchInput.value}" 검색 결과 없음`;
            emptyDesc.textContent = '다른 키워드로 검색해보세요.';
        } else {
            emptyTitle.textContent = '등록된 관광지가 없습니다';
            emptyDesc.textContent = '새 관광지를 등록해보세요!';
        }
        return;
    }

    emptyState.classList.add('hidden');
    attractionGrid.classList.remove('hidden');
    attractionGrid.innerHTML = '';

    // Apply layout class based on viewMode
    if (viewMode === 'list') {
        attractionGrid.className = 'list-view-container';
    } else {
        attractionGrid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';
    }

    filtered.forEach((attr, index) => {
        if (viewMode === 'list') {
            renderListItem(attr, index);
        } else {
            renderCardItem(attr, index);
        }
    });
}

function renderCardItem(attr, index) {
    const card = document.createElement('div');
    card.className = 'attraction-card p-4 animate-in';
    card.style.animationDelay = `${index * 0.04}s`;

    let imageHTML = '';
    if (attr.imageUrl) {
        imageHTML = `<img src="${attr.imageUrl}" alt="${attr.title}" class="card-image" onerror="this.style.display='none'">`;
    }

    let costHTML = '';
    if (attr.cost) {
        costHTML = `<div class="tag mt-2">💰 ${attr.cost}</div>`;
    }

    let notesHTML = '';
    if (attr.notes) {
        notesHTML = `<p class="text-xs text-gray-400 mt-1">📝 ${attr.notes}</p>`;
    }

    card.innerHTML = `
        <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2 min-w-0 flex-grow">
                <span class="text-2xl flex-shrink-0">${attr.icon || '📍'}</span>
                <h3 class="font-semibold text-sm truncate">${attr.title}</h3>
            </div>
            <div class="flex gap-1 flex-shrink-0 ml-2">
                <button class="btn-edit" onclick="openEditModal('${attr.id}')" title="수정">✏️</button>
                <button class="btn-danger" onclick="openDeleteModal('${attr.id}', '${attr.title.replace(/'/g, "\\'")}')" title="삭제">🗑️</button>
            </div>
        </div>
        ${attr.description ? `<p class="text-xs text-gray-500 leading-relaxed">${attr.description}</p>` : ''}
        ${imageHTML}
        ${costHTML}
        ${notesHTML}
    `;
    attractionGrid.appendChild(card);
}

function renderListItem(attr, index) {
    const item = document.createElement('div');
    item.className = 'attraction-list-item animate-in';
    item.style.animationDelay = `${index * 0.03}s`;

    const escapedTitle = attr.title.replace(/'/g, "\\'");

    let metaChips = '';
    if (attr.cost) metaChips += `<span class="tag">💰 ${attr.cost}</span>`;

    item.innerHTML = `
        <span class="text-2xl flex-shrink-0">${attr.icon || '📍'}</span>
        <div class="flex-grow min-w-0">
            <div class="font-semibold text-sm">${attr.title}</div>
            ${attr.description ? `<p class="text-xs text-gray-500 truncate mt-0.5">${attr.description}</p>` : ''}
            ${metaChips ? `<div class="flex gap-1.5 mt-1 flex-wrap">${metaChips}</div>` : ''}
        </div>
        <div class="flex gap-1 flex-shrink-0">
            <button class="btn-edit" onclick="openEditModal('${attr.id}')" title="수정">✏️</button>
            <button class="btn-danger" onclick="openDeleteModal('${attr.id}', '${escapedTitle}')" title="삭제">🗑️</button>
        </div>
    `;
    attractionGrid.appendChild(item);
}

// --- Modal: Edit/Add ---
function openEditModal(id = null) {
    populateIconSelect();
    editForm.reset();
    imagePreview.classList.add('hidden');

    if (id) {
        const attr = allAttractions.find(a => a.id === id);
        if (!attr) { showToast("해당 관광지를 찾을 수 없습니다.", true); return; }
        modalTitle.textContent = '관광지 정보 수정';
        editId.value = attr.id;
        editIcon.value = attr.icon || '';
        editTitle.value = attr.title || '';
        editDescription.value = attr.description || '';
        editImageUrl.value = attr.imageUrl || '';
        editCost.value = attr.cost || '';
        editNotes.value = attr.notes || '';
        if (attr.imageUrl) {
            imagePreviewImg.src = attr.imageUrl;
            imagePreview.classList.remove('hidden');
        }
    } else {
        modalTitle.textContent = '새 관광지 등록';
        editId.value = '';
    }

    editModal.classList.add('active');
}

function closeEditModal() {
    editModal.classList.remove('active');
}

// --- Modal: Delete ---
function openDeleteModal(id, title) {
    deleteTargetId = id;
    deleteTargetTitle = title;
    deleteMessage.innerHTML = `<strong>"${title}"</strong> 관광지 정보를 영구적으로 삭제합니다.<br>이 작업은 되돌릴 수 없습니다.`;
    deleteModal.classList.add('active');
}

function closeDeleteModal() {
    deleteModal.classList.remove('active');
    deleteTargetId = null;
    deleteTargetTitle = '';
}

// --- Save ---
async function handleSave(e) {
    e.preventDefault();
    if (!db) return;

    const title = editTitle.value.trim();
    if (!title) { showToast("관광지명을 입력해주세요.", true); return; }

    const docId = editId.value;
    const data = {
        title,
        icon: editIcon.value || '',
        description: editDescription.value.trim(),
        imageUrl: editImageUrl.value.trim(),
        cost: editCost.value.trim(),
        notes: editNotes.value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const querySnapshot = await db.collection("attractions").where("title", "==", title).get();
        let isExactDuplicate = false;

        if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => {
                // 수정 시 자기 자신이면 제외
                if (docId && doc.id === docId) return;
                
                const existing = doc.data();
                if ((existing.icon || '') === data.icon &&
                    (existing.description || '') === data.description &&
                    (existing.imageUrl || '') === data.imageUrl &&
                    (existing.cost || '') === data.cost &&
                    (existing.notes || '') === data.notes) {
                    isExactDuplicate = true;
                }
            });
        }

        if (isExactDuplicate) {
            if (!confirm(`관광지 "${title}"와 모든 내용이 동일한 데이터가 이미 존재합니다.\n그래도 저장하시겠습니까?`)) {
                return;
            }
        }
        if (docId) {
            await db.collection("attractions").doc(docId).set(data, { merge: true });
            const idx = allAttractions.findIndex(a => a.id === docId);
            if (idx > -1) allAttractions[idx] = { id: docId, ...data };
            showToast(`"${title}" 정보가 업데이트되었습니다.`);
        } else {
            const ref = await db.collection("attractions").add(data);
            allAttractions.push({ id: ref.id, ...data });
            allAttractions.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            showToast(`"${title}" 관광지가 등록되었습니다.`);
        }
        closeEditModal();
        renderAttractions();
    } catch (error) {
        console.error("Error saving:", error);
        showToast("저장 중 오류가 발생했습니다.", true);
    }
}

// --- Delete ---
async function handleDelete() {
    if (!db || !deleteTargetId) return;

    try {
        await db.collection("attractions").doc(deleteTargetId).delete();
        showToast(`"${deleteTargetTitle}" 관광지가 삭제되었습니다.`);
        allAttractions = allAttractions.filter(a => a.id !== deleteTargetId);
        closeDeleteModal();
        renderAttractions();
    } catch (error) {
        console.error("Error deleting:", error);
        showToast("삭제 중 오류가 발생했습니다.", true);
    }
}

// --- Image Preview ---
function handleImageUrlChange() {
    const url = editImageUrl.value.trim();
    if (url) {
        imagePreviewImg.src = url;
        imagePreviewImg.onerror = () => imagePreview.classList.add('hidden');
        imagePreviewImg.onload = () => imagePreview.classList.remove('hidden');
    } else {
        imagePreview.classList.add('hidden');
    }
}

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
    // Set initial toggle button state
    updateViewToggleButtons();
    loadAttractions();
});

const viewCardBtn = document.getElementById('viewCardBtn');
const viewListBtn = document.getElementById('viewListBtn');

function updateViewToggleButtons() {
    if (viewMode === 'card') {
        viewCardBtn.classList.add('active');
        viewListBtn.classList.remove('active');
    } else {
        viewListBtn.classList.add('active');
        viewCardBtn.classList.remove('active');
    }
}

function setViewMode(mode) {
    viewMode = mode;
    localStorage.setItem('attractionViewMode', mode);
    updateViewToggleButtons();
    renderAttractions();
}

viewCardBtn.addEventListener('click', () => setViewMode('card'));
viewListBtn.addEventListener('click', () => setViewMode('list'));

searchInput.addEventListener('input', renderAttractions);
addNewBtn.addEventListener('click', () => openEditModal(null));
editForm.addEventListener('submit', handleSave);
cancelBtn.addEventListener('click', closeEditModal);
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', handleDelete);
editImageUrl.addEventListener('change', handleImageUrlChange);
editImageUrl.addEventListener('blur', handleImageUrlChange);

// Close modals on backdrop click
editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEditModal(); });
deleteModal.addEventListener('click', (e) => { if (e.target === deleteModal) closeDeleteModal(); });

// ESC key to close modals
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (deleteModal.classList.contains('active')) closeDeleteModal();
        else if (editModal.classList.contains('active')) closeEditModal();
    }
});

