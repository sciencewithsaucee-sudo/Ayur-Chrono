/**
 * Ayur-Chrono UI & Controller
 * Handles user interactions, DOM updates, and browser APIs
 */

let calculatedData = {};

document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    document.getElementById('dateInput').valueAsDate = new Date();
    
    // Event Listeners for Buttons
    document.getElementById('detectLocBtn').addEventListener('click', getLocation);
    document.getElementById('calcBtn').addEventListener('click', calculateTimes);
    document.getElementById('downloadBtn').addEventListener('click', generatePDF);
    document.getElementById('brahmaAlarmBtn').addEventListener('click', () => setAlarm('brahma'));
    document.getElementById('copyCiteBtn').addEventListener('click', copyCitation);
});

/**
 * Geolocation logic with detailed error reporting
 */
function getLocation() {
    const status = document.getElementById('location-status');
    const loader = document.getElementById('loader');
    
    if (!navigator.geolocation) { 
        status.textContent = "Error: Geolocation is not supported by this browser."; 
        return; 
    }
    
    loader.classList.remove('hidden');
    status.textContent = "Locating... Please allow access if prompted.";

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            document.getElementById('lat').value = pos.coords.latitude.toFixed(4);
            document.getElementById('lng').value = pos.coords.longitude.toFixed(4);
            status.textContent = "Location detected successfully.";
            loader.classList.add('hidden');
            calculateTimes(); // Auto-calculate once location is found
        },
        (error) => {
            loader.classList.add('hidden');
            // Specific error handling to help you debug on your Lenovo/Chrome
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    status.textContent = "Permission Denied. Click the lock icon in the URL bar to allow location.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    status.textContent = "Location Unavailable. Check your Windows 'Location Services' settings.";
                    break;
                case error.TIMEOUT:
                    status.textContent = "Location request timed out. Please try again or enter manually.";
                    break;
                default:
                    status.textContent = "An unknown error occurred while detecting location.";
                    break;
            }
        },
        { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 0 
        }
    );
}

/**
 * Orchestrates the calculation of all Ayurvedic timings
 */
function calculateTimes() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const dateVal = document.getElementById('dateInput').value;

    if (isNaN(lat) || isNaN(lng) || !dateVal) { 
        alert("Please provide a valid Latitude, Longitude, and Date."); 
        return; 
    }

    const today = new Date(dateVal);
    const tomorrow = new Date(today); 
    tomorrow.setDate(today.getDate() + 1);

    // Call Solar Engine from app.js
    const timesToday = SunCalcLite.getSunTimes(today, lat, lng);
    const timesTom = SunCalcLite.getSunTimes(tomorrow, lat, lng);

    if (!timesToday || !timesTom) {
        alert("Could not calculate solar data for this location/date.");
        return;
    }

    // Calculating durations in minutes
    const dayMins = (timesToday.sunset - timesToday.sunrise) / 60000;
    const nightMins = (timesTom.sunrise - timesToday.sunset) / 60000;
    
    // Muhurta logic (1 Muhurta = 1/15th of day/night duration)
    const oneNightMuhurta = nightMins / 15;
    const oneDayMuhurta = dayMins / 15;

    // Brahma Muhurta starts 2 muhurtas before sunrise
    const brahmaStart = SunCalcLite.addMinutes(timesTom.sunrise, -(2 * oneNightMuhurta));
    const brahmaEnd = SunCalcLite.addMinutes(timesTom.sunrise, -(1 * oneNightMuhurta));
    
    // Abhijit Muhurta is the muhurta centered on solar noon
    const abhijitStart = SunCalcLite.addMinutes(timesToday.noon, -(oneDayMuhurta / 2));
    const abhijitEnd = SunCalcLite.addMinutes(timesToday.noon, (oneDayMuhurta / 2));

    // Consolidate data for UI and PDF
    calculatedData = {
        date: today.toDateString(),
        brahma: { 
            start: brahmaStart, 
            str: `${SunCalcLite.formatTime(brahmaStart)} - ${SunCalcLite.formatTime(brahmaEnd)}` 
        },
        abhijit: { 
            str: `${SunCalcLite.formatTime(abhijitStart)} - ${SunCalcLite.formatTime(abhijitEnd)}` 
        },
        sunrise: SunCalcLite.formatTime(timesToday.sunrise),
        sunset: SunCalcLite.formatTime(timesToday.sunset),
        noon: SunCalcLite.formatTime(timesToday.noon),
        schedule: [
            { name: 'Morning (Purvahna)', range: `${SunCalcLite.formatTime(timesToday.sunrise)} - ${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunrise, dayMins/3))}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Exercise, Study' },
            { name: 'Mid-Day (Madhyahna)', range: `${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunrise, dayMins/3))} - ${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunrise, 2*dayMins/3))}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Main Meal (Lunch)' },
            { name: 'Afternoon (Aparahna)', range: `${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunrise, 2*dayMins/3))} - ${SunCalcLite.formatTime(timesToday.sunset)}`, dosha: 'Vata', color: 'dot-vata', act: 'Creative Work' },
            { name: 'Evening (Pradosha)', range: `${SunCalcLite.formatTime(timesToday.sunset)} - ${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunset, nightMins/3))}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Dinner, Relax' },
            { name: 'Midnight (Nishitha)', range: `${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunset, nightMins/3))} - ${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunset, 2*nightMins/3))}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Metabolism/Sleep' },
            { name: 'Late Night (Usha)', range: `${SunCalcLite.formatTime(SunCalcLite.addMinutes(timesToday.sunset, 2*nightMins/3))} - ${SunCalcLite.formatTime(timesTom.sunrise)}`, dosha: 'Vata', color: 'dot-vata', act: 'Wake Up' }
        ]
    };

    updateUI(dayMins, nightMins);
}

/**
 * Updates the HTML elements with calculated results
 */
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
    tbody.innerHTML = calculatedData.schedule.map(item => `
        <tr>
            <td>${item.name}</td>
            <td style="font-weight:600;">${item.range}</td>
            <td><span class="dot ${item.color}"></span>${item.dosha}</td>
            <td>${item.act}</td>
        </tr>
    `).join('');

    document.getElementById('results-area').classList.remove('hidden');
    document.getElementById('results-area').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Generates and downloads the PDF report
 */
function generatePDF() {
    if (!calculatedData.date) {
        alert("Please calculate timings first.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0);
    doc.text("Ayur-Chrono Daily Schedule", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date: ${calculatedData.date} | Sunrise: ${calculatedData.sunrise}`, 14, 28);
    
    doc.autoTable({
        startY: 35,
        head: [['Period', 'Time Range', 'Dosha', 'Recommended Activity']],
        body: calculatedData.schedule.map(i => [i.name, i.range, i.dosha, i.act]),
        headStyles: { fillColor: [0, 100, 0] }
    });
    
    doc.save(`Ayurvedic_Schedule_${calculatedData.date.replace(/\s/g, '_')}.pdf`);
}

/**
 * Browser-based notification for Brahma Muhurta
 */
function setAlarm() {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications.");
        return;
    }

    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            const now = new Date();
            const diff = calculatedData.brahma.start - now;

            if (diff > 0) {
                document.getElementById('brahmaAlarmBtn').classList.add('alarm-active');
                alert(`Alarm set for ${SunCalcLite.formatTime(calculatedData.brahma.start)}! Keep this tab open.`);
                
                setTimeout(() => {
                    new Notification("Ayur-Chrono", {
                        body: "Brahma Muhurta has started. Ideal time for meditation.",
                        icon: "https://cdn-icons-png.flaticon.com/512/1206/1206413.png"
                    });
                    document.getElementById('brahmaAlarmBtn').classList.remove('alarm-active');
                }, diff);
            } else {
                alert("Brahma Muhurta has already passed for today.");
            }
        }
    });
}

/**
 * Copy citation text to clipboard
 */
function copyCitation() {
    const text = document.getElementById('citation-text').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Citation copied to clipboard!");
    });
}
