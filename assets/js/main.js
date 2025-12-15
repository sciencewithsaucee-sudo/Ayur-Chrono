/**
 * Ayur-Chrono UI & Controller
 */

let calculatedData = {};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('dateInput').valueAsDate = new Date();
    
    // Event Listeners
    document.getElementById('detectLocBtn').addEventListener('click', getLocation);
    document.getElementById('calcBtn').addEventListener('click', calculateTimes);
    document.getElementById('downloadBtn').addEventListener('click', generatePDF);
    document.getElementById('brahmaAlarmBtn').addEventListener('click', () => setAlarm('brahma'));
    document.getElementById('copyCiteBtn').addEventListener('click', copyCitation);
});

function getLocation() {
    const status = document.getElementById('location-status');
    const loader = document.getElementById('loader');
    if (!navigator.geolocation) { status.textContent = "Not supported."; return; }
    
    loader.classList.remove('hidden');
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            document.getElementById('lat').value = pos.coords.latitude.toFixed(4);
            document.getElementById('lng').value = pos.coords.longitude.toFixed(4);
            status.textContent = "Location detected.";
            loader.classList.add('hidden');
            calculateTimes();
        },
        () => {
            status.textContent = "Manual entry required.";
            loader.classList.add('hidden');
        }
    );
}

function calculateTimes() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const dateVal = document.getElementById('dateInput').value;

    if (isNaN(lat) || isNaN(lng) || !dateVal) { alert("Check Inputs"); return; }

    const today = new Date(dateVal);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const timesToday = SunCalcLite.getSunTimes(today, lat, lng);
    const timesTom = SunCalcLite.getSunTimes(tomorrow, lat, lng);

    if (!timesToday) return;

    const dayMins = (timesToday.sunset - timesToday.sunrise) / 60000;
    const nightMins = (timesTom.sunrise - timesToday.sunset) / 60000;
    const oneNightMuhurta = nightMins / 15;
    const oneDayMuhurta = dayMins / 15;

    const brahmaStart = SunCalcLite.addMinutes(timesTom.sunrise, -(2 * oneNightMuhurta));
    const brahmaEnd = SunCalcLite.addMinutes(timesTom.sunrise, -(1 * oneNightMuhurta));
    const abhijitStart = SunCalcLite.addMinutes(timesToday.noon, -(oneDayMuhurta / 2));
    const abhijitEnd = SunCalcLite.addMinutes(timesToday.noon, (oneDayMuhurta / 2));

    calculatedData = {
        date: today.toDateString(),
        brahma: { start: brahmaStart, str: `${SunCalcLite.formatTime(brahmaStart)} - ${SunCalcLite.formatTime(brahmaEnd)}` },
        abhijit: { str: `${SunCalcLite.formatTime(abhijitStart)} - ${SunCalcLite.formatTime(abhijitEnd)}` },
        sunrise: SunCalcLite.formatTime(timesToday.sunrise),
        sunset: SunCalcLite.formatTime(timesToday.sunset),
        noon: SunCalcLite.formatTime(timesToday.noon),
        schedule: [
            { name: 'Morning', range: `${SunCalcLite.formatTime(timesToday.sunrise)} - ${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunrise, dayMins/3))}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Exercise' },
            { name: 'Mid-Day', range: `${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunrise, dayMins/3))} - ${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunrise, 2*dayMins/3))}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Lunch' },
            { name: 'Afternoon', range: `${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunrise, 2*dayMins/3))} - ${SunCalcLite.formatTime(timesToday.sunset)}`, dosha: 'Vata', color: 'dot-vata', act: 'Work' },
            { name: 'Evening', range: `${SunCalcLite.formatTime(timesToday.sunset)} - ${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunset, nightMins/3))}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Relax' },
            { name: 'Midnight', range: `${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunset, nightMins/3))} - ${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunset, 2*nightMins/3))}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Deep Sleep' },
            { name: 'Late Night', range: `${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunset, 2*nightMins/3))} - ${SunCalcLite.formatTime(timesTom.sunrise)}`, dosha: 'Vata', color: 'dot-vata', act: 'Dreaming' }
        ]
    };

    updateUI(dayMins, nightMins);
}

function updateUI(dM, nM) {
    document.getElementById('displayDate').innerText = calculatedData.date;
    document.getElementById('brahmaTime').innerText = calculatedData.brahma.str;
    document.getElementById('abhijitTime').innerText = calculatedData.abhijit.str;
    document.getElementById('sunriseVal').innerText = calculatedData.sunrise;
    document.getElementById('noonVal').innerText = calculatedData.noon;
    document.getElementById('sunsetVal').innerText = calculatedData.sunset;
    document.getElementById('dayLength').innerText = `${Math.floor(dM/60)}h ${Math.round(dM%60)}m`;
    document.getElementById('nightLength').innerText = `${Math.floor(nM/60)}h ${Math.round(nM%60)}m`;

    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = calculatedData.schedule.map(i => `
        <tr><td>${i.name}</td><td><b>${i.range}</b></td><td><span class="dot ${i.color}"></span>${i.dosha}</td><td>${i.act}</td></tr>
    `).join('');

    document.getElementById('results-area').classList.remove('hidden');
}

function generatePDF() {
    if (!calculatedData.date) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Ayur-Chrono Schedule", 14, 20);
    doc.autoTable({
        startY: 30,
        head: [['Period', 'Time', 'Dosha', 'Activity']],
        body: calculatedData.schedule.map(i => [i.name, i.range, i.dosha, i.act])
    });
    doc.save("Ayurvedic_Schedule.pdf");
}

function setAlarm() {
    if (!Notification) return;
    Notification.requestPermission().then(perm => {
        if (perm === "granted") {
            const diff = calculatedData.brahma.start - new Date();
            if (diff > 0) {
                document.getElementById('brahmaAlarmBtn').classList.add('alarm-active');
                setTimeout(() => {
                    new Notification("Brahma Muhurta", { body: "It is now Brahma Muhurta." });
                }, diff);
            }
        }
    });
}

function copyCitation() {
    navigator.clipboard.writeText(document.getElementById('citation-text').innerText);
    alert("Copied!");
}
