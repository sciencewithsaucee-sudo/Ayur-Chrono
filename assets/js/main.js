/**
 * Ayur-Chrono UI Controller
 */

let calculatedData = {};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dateInput').valueAsDate = new Date();
    
    // Event Listeners
    document.getElementById('calcBtn').addEventListener('click', calculateTimes);
    document.getElementById('locateBtn').addEventListener('click', getLocation);
    document.getElementById('downloadBtn').addEventListener('click', generatePDF);
    document.getElementById('copyCitationBtn').addEventListener('click', copyCitation);
    document.getElementById('brahmaAlarmBtn').addEventListener('click', () => setAlarm('brahma'));
});

function getLocation() {
    const status = document.getElementById('location-status');
    const loader = document.getElementById('loader');
    if (!navigator.geolocation) { status.textContent = "Geolocation not supported."; return; }
    
    loader.classList.remove('hidden');
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            document.getElementById('lat').value = pos.coords.latitude.toFixed(4);
            document.getElementById('lng').value = pos.coords.longitude.toFixed(4);
            loader.classList.add('hidden');
            calculateTimes();
        },
        () => {
            status.textContent = "Permission denied. Enter manually.";
            loader.classList.add('hidden');
        }
    );
}

function calculateTimes() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const dateVal = document.getElementById('dateInput').value;

    if (isNaN(lat) || isNaN(lng) || !dateVal) { alert("Invalid input."); return; }

    const today = new Date(dateVal);
    const tom = new Date(today); tom.setDate(today.getDate() + 1);

    const timesToday = getSunTimes(today, lat, lng);
    const timesTom = getSunTimes(tom, lat, lng);

    if (!timesToday) return;

    const dayMins = (timesToday.sunset - timesToday.sunrise) / 60000;
    const nightMins = (timesTom.sunrise - timesToday.sunset) / 60000;
    const muhurtaN = nightMins / 15;
    const muhurtaD = dayMins / 15;

    calculatedData = {
        date: today.toDateString(),
        brahma: { start: addMinutes(timesTom.sunrise, -2 * muhurtaN), end: addMinutes(timesTom.sunrise, -muhurtaN) },
        abhijit: { start: addMinutes(timesToday.noon, -muhurtaD/2), end: addMinutes(timesToday.noon, muhurtaD/2) },
        sunrise: formatTime(timesToday.sunrise),
        sunset: formatTime(timesToday.sunset),
        noon: formatTime(timesToday.noon),
        dayLength: `${Math.floor(dayMins/60)}h ${Math.round(dayMins%60)}m`,
        nightLength: `${Math.floor(nightMins/60)}h ${Math.round(nightMins%60)}m`
    };

    updateUI(timesToday, timesTom, dayMins, nightMins);
}

function updateUI(tToday, tTom, dMins, nMins) {
    document.getElementById('brahmaTime').innerText = `${formatTime(calculatedData.brahma.start)} - ${formatTime(calculatedData.brahma.end)}`;
    document.getElementById('abhijitTime').innerText = `${formatTime(calculatedData.abhijit.start)} - ${formatTime(calculatedData.abhijit.end)}`;
    document.getElementById('sunriseVal').innerText = calculatedData.sunrise;
    document.getElementById('noonVal').innerText = calculatedData.noon;
    document.getElementById('sunsetVal').innerText = calculatedData.sunset;
    document.getElementById('dayLength').innerText = calculatedData.dayLength;
    document.getElementById('nightLength').innerText = calculatedData.nightLength;
    document.getElementById('displayDate').innerText = calculatedData.date;

    const dP = dMins / 3; const nP = nMins / 3;
    const schedule = [
        { name: 'Morning (Purvahna)', range: `${formatTime(tToday.sunrise)} - ${formatTime(addMinutes(tToday.sunrise, dP))}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Exercise, Study' },
        { name: 'Mid-Day (Madhyahna)', range: `${formatTime(addMinutes(tToday.sunrise, dP))} - ${formatTime(addMinutes(tToday.sunrise, 2*dP))}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Main Meal (Lunch)' },
        { name: 'Afternoon (Aparahna)', range: `${formatTime(addMinutes(tToday.sunrise, 2*dP))} - ${formatTime(tToday.sunset)}`, dosha: 'Vata', color: 'dot-vata', act: 'Creative Work' },
        { name: 'Evening (Pradosha)', range: `${formatTime(tToday.sunset)} - ${formatTime(addMinutes(tToday.sunset, nP))}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Dinner, Relax' },
        { name: 'Midnight (Nishitha)', range: `${formatTime(addMinutes(tToday.sunset, nP))} - ${formatTime(addMinutes(tToday.sunset, 2*nP))}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Deep Sleep' },
        { name: 'Late Night (Usha)', range: `${formatTime(addMinutes(tToday.sunset, 2*nP))} - ${formatTime(tTom.sunrise)}`, dosha: 'Vata', color: 'dot-vata', act: 'Waking Up' }
    ];
    
    calculatedData.schedule = schedule;
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = schedule.map(i => `<tr><td>${i.name}</td><td><b>${i.range}</b></td><td><span class="dot ${i.color}"></span>${i.dosha}</td><td>${i.act}</td></tr>`).join('');
    
    document.getElementById('results-area').classList.remove('hidden');
}

function setAlarm(type) {
    if (!Notification) return;
    Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
            const diff = calculatedData.brahma.start - new Date();
            if (diff < 0) return alert("Time passed.");
            document.getElementById('brahmaAlarmBtn').classList.add('alarm-active');
            setTimeout(() => {
                new Notification("Ayur-Chrono", { body: "Brahma Muhurta Started!" });
                document.getElementById('brahmaAlarmBtn').classList.remove('alarm-active');
            }, diff);
        }
    });
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Ayur-Chrono Schedule", 14, 20);
    doc.autoTable({
        startY: 30,
        head: [['Period', 'Time', 'Dosha', 'Activity']],
        body: calculatedData.schedule.map(i => [i.name, i.range, i.dosha, i.act])
    });
    doc.save("Schedule.pdf");
}

function copyCitation() {
    navigator.clipboard.writeText(document.getElementById('citation-text').innerText);
    alert("Copied!");
}
