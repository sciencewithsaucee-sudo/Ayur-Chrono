/**
 * Ayur-Chrono UI Controller
 * Manages event listeners and updates the DOM
 */

let calculatedData = {}; // Global store for results

document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    const dateInput = document.getElementById('dateInput');
    if (dateInput) dateInput.valueAsDate = new Date();
    
    // Attach Event Listeners
    document.getElementById('calcBtn')?.addEventListener('click', calculateTimes);
    document.getElementById('locateBtn')?.addEventListener('click', getLocation);
    document.getElementById('downloadBtn')?.addEventListener('click', generatePDF);
    document.getElementById('copyCitationBtn')?.addEventListener('click', copyCitation);
    document.getElementById('brahmaAlarmBtn')?.addEventListener('click', () => setAlarm('brahma'));
});

/**
 * Handles browser geolocation
 */
function getLocation() {
    const status = document.getElementById('location-status');
    const loader = document.getElementById('loader');
    
    if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser.";
        return;
    }
    
    loader?.classList.remove('hidden');
    status.textContent = "Locating...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            document.getElementById('lat').value = position.coords.latitude.toFixed(4);
            document.getElementById('lng').value = position.coords.longitude.toFixed(4);
            status.textContent = "Location detected successfully.";
            loader?.classList.add('hidden');
            calculateTimes(); // Auto-calculate once location is found
        },
        () => {
            status.textContent = "Unable to retrieve location. Please enter manually.";
            loader?.classList.add('hidden');
        }
    );
}

/**
 * Core UI Update function
 */
function calculateTimes() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const dateVal = document.getElementById('dateInput').value;

    if (isNaN(lat) || isNaN(lng) || !dateVal) {
        alert("Please provide a valid Location and Date.");
        return;
    }

    const today = new Date(dateVal);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Get astronomical data from app.js
    const timesToday = getSunTimes(today, lat, lng);
    const timesTom = getSunTimes(tomorrow, lat, lng);

    if (!timesToday || !timesTom) {
        alert("Could not calculate solar timings for this location.");
        return;
    }

    // Process durations and muhurtas
    const dayMins = (timesToday.sunset - timesToday.sunrise) / 60000;
    const nightMins = (timesTom.sunrise - timesToday.sunset) / 60000;
    const muhurtaN = nightMins / 15;
    const muhurtaD = dayMins / 15;

    // Store calculated data
    calculatedData = {
        date: today.toDateString(),
        brahma: { 
            start: addMinutes(timesTom.sunrise, -2 * muhurtaN), 
            end: addMinutes(timesTom.sunrise, -muhurtaN) 
        },
        abhijit: { 
            start: addMinutes(timesToday.noon, -muhurtaD/2), 
            end: addMinutes(timesToday.noon, muhurtaD/2) 
        },
        sunrise: formatTime(timesToday.sunrise),
        noon: formatTime(timesToday.noon),
        sunset: formatTime(timesToday.sunset),
        dayLength: `${Math.floor(dayMins/60)}h ${Math.round(dayMins%60)}m`,
        nightLength: `${Math.floor(nightMins/60)}h ${Math.round(nightMins%60)}m`
    };

    // Update the UI
    updateResultsUI(timesToday, timesTom, dayMins, nightMins);
}

function updateResultsUI(tToday, tTom, dMins, nMins) {
    // Update Hero Cards
    document.getElementById('displayDate').innerText = calculatedData.date;
    document.getElementById('brahmaTime').innerText = `${formatTime(calculatedData.brahma.start)} - ${formatTime(calculatedData.brahma.end)}`;
    document.getElementById('abhijitTime').innerText = `${formatTime(calculatedData.abhijit.start)} - ${formatTime(calculatedData.abhijit.end)}`;
    
    // Update Info Strip
    document.getElementById('sunriseVal').innerText = calculatedData.sunrise;
    document.getElementById('noonVal').innerText = calculatedData.noon;
    document.getElementById('sunsetVal').innerText = calculatedData.sunset;
    document.getElementById('dayLength').innerText = calculatedData.dayLength;
    document.getElementById('nightLength').innerText = calculatedData.nightLength;

    // Populate Table
    const dP = dMins / 3; 
    const nP = nMins / 3;
    const schedule = [
        { name: 'Morning (Purvahna)', range: `${formatTime(tToday.sunrise)} - ${formatTime(addMinutes(tToday.sunrise, dP))}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Exercise, Study' },
        { name: 'Mid-Day (Madhyahna)', range: `${formatTime(addMinutes(tToday.sunrise, dP))} - ${formatTime(addMinutes(tToday.sunrise, 2*dP))}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Lunch (Main Meal)' },
        { name: 'Afternoon (Aparahna)', range: `${formatTime(addMinutes(tToday.sunrise, 2*dP))} - ${formatTime(tToday.sunset)}`, dosha: 'Vata', color: 'dot-vata', act: 'Creative Work' },
        { name: 'Evening (Pradosha)', range: `${formatTime(tToday.sunset)} - ${formatTime(addMinutes(tToday.sunset, nP))}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Dinner, Relax' },
        { name: 'Midnight (Nishitha)', range: `${formatTime(addMinutes(tToday.sunset, nP))} - ${formatTime(addMinutes(tToday.sunset, 2*nP))}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Deep Sleep' },
        { name: 'Late Night (Usha)', range: `${formatTime(addMinutes(tToday.sunset, 2*nP))} - ${formatTime(tTom.sunrise)}`, dosha: 'Vata', color: 'dot-vata', act: 'Waking Up' }
    ];
    
    calculatedData.schedule = schedule;
    const tbody = document.getElementById('scheduleBody');
    if (tbody) {
        tbody.innerHTML = schedule.map(i => `
            <tr>
                <td>${i.name}</td>
                <td style="font-weight:600;">${i.range}</td>
                <td><span class="dot ${i.color}"></span>${i.dosha}</td>
                <td>${i.act}</td>
            </tr>
        `).join('');
    }

    // Reveal results and scroll
    const resultsArea = document.getElementById('results-area');
    resultsArea?.classList.remove('hidden');
    resultsArea?.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Browser Notification Logic
 */
function setAlarm(type) {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            const now = new Date();
            const targetTime = calculatedData.brahma.start;
            const diff = targetTime - now;

            if (diff < 0) {
                alert("This time has already passed for today.");
                return;
            }

            const btn = document.getElementById('brahmaAlarmBtn');
            btn?.classList.add('alarm-active');
            alert(`Notification set for ${formatTime(targetTime)}! Keep this tab open.`);

            setTimeout(() => {
                new Notification("Ayur-Chrono", {
                    body: "Brahma Muhurta has started. Ideal time for meditation.",
                    icon: "https://cdn-icons-png.flaticon.com/512/1206/1206413.png"
                });
                btn?.classList.remove('alarm-active');
            }, diff);
        }
    });
}

function copyCitation() {
    const text = document.getElementById('citation-text').innerText;
    navigator.clipboard.writeText(text).then(() => alert("Citation copied!"));
}
