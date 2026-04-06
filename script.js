let currentSelectedDate = new Date();
const weekPicker = document.getElementById('weekPicker');
const plannerGrid = document.getElementById('planner-grid');

function init() {
    const now = new Date();
    const year = now.getFullYear();
    const week = getWeekNumber(now);
    weekPicker.value = `${year}-W${week.toString().padStart(2, '0')}`;
    renderWeek();
}

function renderWeek() {
    plannerGrid.innerHTML = '';
    const startOfWeek = getMonday(currentSelectedDate);
    const weekKey = weekPicker.value;

    // Load Master Goals
    document.getElementById('masterWeeklyGoals').value = localStorage.getItem(`master-${weekKey}`) || "";

    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        const dateKey = dayDate.toISOString().split('T')[0];

        // Ensure we load an object, not a string
        const stored = localStorage.getItem(`data-${dateKey}`);
        const dayData = stored ? JSON.parse(stored) : { 
            goals: [{text:"", done:false}, {text:"", done:false}, {text:"", done:false}], 
            achievements: "" 
        };

        const card = document.createElement('div');
        card.className = 'day-card';
        
        const goalsHTML = dayData.goals.map((g, idx) => `
            <div class="goal-item">
                <input type="checkbox" ${g.done ? 'checked' : ''} onchange="updateGoal('${dateKey}', ${idx}, 'done', this.checked)">
                <input type="text" value="${g.text || ''}" oninput="updateGoal('${dateKey}', ${idx}, 'text', this.value)">
            </div>
        `).join('');

        card.innerHTML = `
            <h3>${dayDate.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
            <div class="goals-section">${goalsHTML}</div>
            <textarea placeholder="Achievements..." oninput="updateAchieve('${dateKey}', this.value)">${dayData.achievements}</textarea>
        `;
        plannerGrid.appendChild(card);
    }
}

function updateGoal(dateKey, idx, field, val) {
    let data = JSON.parse(localStorage.getItem(`data-${dateKey}`)) || { goals: [{},{},{}], achievements: "" };
    data.goals[idx][field] = val;
    localStorage.setItem(`data-${dateKey}`, JSON.stringify(data));
}

function updateAchieve(dateKey, val) {
    let data = JSON.parse(localStorage.getItem(`data-${dateKey}`)) || { goals: [{},{},{}], achievements: "" };
    data.achievements = val;
    localStorage.setItem(`data-${dateKey}`, JSON.stringify(data));
}

function saveMasterGoals() {
    localStorage.setItem(`master-${weekPicker.value}`, document.getElementById('masterWeeklyGoals').value);
}

function changeWeek(dir) {
    currentSelectedDate.setDate(currentSelectedDate.getDate() + (dir * 7));
    const week = getWeekNumber(currentSelectedDate);
    weekPicker.value = `${currentSelectedDate.getFullYear()}-W${week.toString().padStart(2, '0')}`;
    renderWeek();
}

function loadSelectedWeek() {
    const [y, w] = weekPicker.value.split('-W');
    currentSelectedDate = new Date(y, 0, 1 + (w - 1) * 7);
    renderWeek();
}

// Helper Functions
function getMonday(d) {
    d = new Date(d);
    const day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}

function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

init();