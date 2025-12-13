/**
 * Ayur-Chrono Core Logic
 * Author: Sparsh Varshney
 * License: MIT
 */

// --- 1. SunCalc Logic (Simplified for Offline Use) ---
const MathPI = Math.PI;
const rad = MathPI / 180;
const deg = 180 / MathPI;

function getJulianDate(date) { return (date.valueOf() / 86400000) - 0.5 + 2440588; }

function getSunTimes(date, lat, lng) {
    const J = getJulianDate(date);
    const lw = rad * -lng;
    const phi = rad * lat;
    const n = Math.round(J - 2451545 - 0.0009 - (lw / (2 * MathPI)));
    const J_star = 2451545 + 0.0009 + (lw / (2 * MathPI)) + n;
    const M = (357.5291 + 0.98560028 * (J_star - 2451545)) % 360;
    const C = 1.9148 * Math.sin(M * rad) + 0.0200 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    const lambda = (M + C + 182.9884 + 360) % 360;
    const J_transit = 2451545 + 0.0009 + (lw / (2 * MathPI)) + n + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lambda * rad);
    const delta = Math.asin(Math.sin(lambda * rad) * Math.sin(23.44 * rad));
    const H0 = -0.833 * rad; 
    const cosOmega0 = (Math.sin(H0) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
    if (cosOmega0 < -1 || cosOmega0 > 1) return null;
    const J_rise = J_transit - (Math.acos(cosOmega0) * deg) / 360;
    const J_set = J_transit + (Math.acos(cosOmega0) * deg) / 360;
    return {
        sunrise: new Date((J_rise + 0.5 - 2440588) * 86400000),
        sunset: new Date((J_set + 0.5 - 2440588) * 86400000),
        noon: new Date((J_transit + 0.5 - 2440588) * 86400000)
    };
}

// --- 2. State & Globals ---
let calculatedData = {}; // Store calc results for PDF

function init() {
    document.getElementById('dateInput').valueAsDate = new Date();
}

function getLocation() {
    const status = document.getElementById('location-status');
    const loader = document.getElementById('loader');
    if (!navigator.geolocation) { status.textContent = "Geolocation is not supported."; return; }
    loader.classList.remove('hidden');
    status.textContent = "Locating...";
    navigator.geolocation.getCurrentPosition(
        (position) => {
            document.getElementById('lat').value = position.coords.latitude.toFixed(4);
            document.getElementById('lng').value = position.coords.longitude.toFixed(4);
            status.textContent = "Location detected successfully.";
            loader.classList.add('hidden');
            calculateTimes();
        },
        () => {
            status.textContent = "Unable to retrieve your location. Please enter manually.";
            loader.classList.add('hidden');
        }
    );
}

function formatTime(date) { return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function addMinutes(date, minutes) { return new Date(date.getTime() + minutes * 60000); }

function calculateTimes() {
    const lat = parseFloat(document.getElementById('lat').value);
    const lng = parseFloat(document.getElementById('lng').value);
    const dateVal = document.getElementById('dateInput').value;

    if (isNaN(lat) || isNaN(lng) || !dateVal) { alert("Please provide valid Location and Date."); return; }

    const today = new Date(dateVal);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);

    const timesToday = getSunTimes(today, lat, lng);
    const timesTom = getSunTimes(tomorrow, lat, lng);

    if (!timesToday || !timesTom) { alert("Could not calculate sun times."); return; }

    // Durations
    const dayDurationMs = timesToday.sunset - timesToday.sunrise;
    const nightDurationMs = timesTom.sunrise - timesToday.sunset; 
    const dayMins = dayDurationMs / 60000;
    const nightMins = nightDurationMs / 60000;

    const dayPart = dayMins / 3;
    const nightPart = nightMins / 3;
    const oneNightMuhurta = nightMins / 15;

    // Brahma & Abhijit
    const brahmaStart = addMinutes(timesTom.sunrise, -(2 * oneNightMuhurta));
    const brahmaEnd = addMinutes(timesTom.sunrise, -(1 * oneNightMuhurta));
    
    const oneDayMuhurta = dayMins / 15;
    const abhijitStart = addMinutes(timesToday.noon, -(oneDayMuhurta / 2));
    const abhijitEnd = addMinutes(timesToday.noon, (oneDayMuhurta / 2));

    // Store for exports/notifications
    calculatedData = {
        date: today.toDateString(),
        brahma: { start: brahmaStart, end: brahmaEnd, str: `${formatTime(brahmaStart)} - ${formatTime(brahmaEnd)}` },
        abhijit: { str: `${formatTime(abhijitStart)} - ${formatTime(abhijitEnd)}` },
        sunrise: formatTime(timesToday.sunrise),
        noon: formatTime(timesToday.noon),
        sunset: formatTime(timesToday.sunset),
        dayLength: `${Math.floor(dayMins/60)}h ${Math.round(dayMins%60)}m`
    };

    // Update UI
    document.getElementById('displayDate').innerText = calculatedData.date;
    document.getElementById('brahmaTime').innerText = calculatedData.brahma.str;
    document.getElementById('abhijitTime').innerText = calculatedData.abhijit.str;
    
    document.getElementById('sunriseVal').innerText = calculatedData.sunrise;
    document.getElementById('noonVal').innerText = calculatedData.noon;
    document.getElementById('sunsetVal').innerText = calculatedData.sunset;

    document.getElementById('dayLength').innerText = calculatedData.dayLength;
    document.getElementById('nightLength').innerText = `${Math.floor(nightMins/60)}h ${Math.round(nightMins%60)}m`;

    // Table
    const tbody = document.getElementById('scheduleBody');
    tbody.innerHTML = '';

    const d1End = addMinutes(timesToday.sunrise, dayPart);
    const d2End = addMinutes(d1End, dayPart);
    const d3End = timesToday.sunset;
    const n1End = addMinutes(timesToday.sunset, nightPart);
    const n2End = addMinutes(n1End, nightPart);
    const n3End = timesTom.sunrise;

    const schedule = [
        { name: 'Morning (Purvahna)', range: `${formatTime(timesToday.sunrise)} - ${formatTime(d1End)}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Exercise, Study' },
        { name: 'Mid-Day (Madhyahna)', range: `${formatTime(d1End)} - ${formatTime(d2End)}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Main Meal (Lunch)' },
        { name: 'Afternoon (Aparahna)', range: `${formatTime(d2End)} - ${formatTime(d3End)}`, dosha: 'Vata', color: 'dot-vata', act: 'Creative Work, Light' },
        { name: 'Evening (Pradosha)', range: `${formatTime(timesToday.sunset)} - ${formatTime(n1End)}`, dosha: 'Kapha', color: 'dot-kapha', act: 'Dinner, Relax, Sleep' },
        { name: 'Midnight (Nishitha)', range: `${formatTime(n1End)} - ${formatTime(n2End)}`, dosha: 'Pitta', color: 'dot-pitta', act: 'Deep Sleep (Metabolism)' },
        { name: 'Late Night (Usha)', range: `${formatTime(n2End)} - ${formatTime(n3End)}`, dosha: 'Vata', color: 'dot-vata', act: 'Dreaming, Waking Up' }
    ];
    
    calculatedData.schedule = schedule; // Store for PDF

    schedule.forEach(item => {
        const row = `<tr>
            <td>${item.name}</td>
            <td style="font-weight:600;">${item.range}</td>
            <td><span class="dot ${item.color}"></span>${item.dosha}</td>
            <td>${item.act}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    document.getElementById('results-area').classList.remove('hidden');
    document.getElementById('results-area').scrollIntoView({ behavior: 'smooth' });
}

// --- Feature 2: Browser Notification ---
function setAlarm(type) {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notifications");
        return;
    }

    if (Notification.permission === "granted") {
        scheduleNotification(type);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                scheduleNotification(type);
            }
        });
    } else {
        alert("Notifications are blocked. Please enable them in your browser settings.");
    }
}

function scheduleNotification(type) {
    if (!calculatedData.brahma) { alert("Please calculate timings first."); return; }
    
    const btn = document.getElementById('brahmaAlarmBtn');
    const targetTime = calculatedData.brahma.start; // Notification at start time
    const now = new Date();
    const diff = targetTime - now;

    if (diff <= 0) {
        alert("This time has already passed for the selected date.");
        return;
    }

    // Visual feedback
    btn.classList.add('alarm-active');
    alert(`Alarm set! Keep this tab open. You will be notified at ${formatTime(targetTime)}.`);

    setTimeout(() => {
        new Notification("Ayur-Chrono: Brahma Muhurta", {
            body: "It is now Brahma Muhurta. Ideal time for meditation.",
            icon: "https://cdn-icons-png.flaticon.com/512/1206/1206413.png" // Generic sun icon
        });
        btn.classList.remove('alarm-active');
    }, diff);
}

// --- Feature 3: PDF Export ---
function generatePDF() {
    if (!calculatedData.date) { alert("Please calculate timings first."); return; }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0); // #006400
    doc.text("Ayur-Chrono Schedule", 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`Date: ${calculatedData.date}`, 14, 32);
    doc.text(`Sunrise: ${calculatedData.sunrise} | Sunset: ${calculatedData.sunset}`, 14, 38);

    // Key Timings Box
    doc.setDrawColor(0, 100, 0);
    doc.setLineWidth(0.5);
    doc.rect(14, 45, 180, 25);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Brahma Muhurta", 20, 55);
    doc.text("Abhijit Muhurta", 110, 55);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 100, 0);
    doc.text(calculatedData.brahma.str, 20, 65);
    doc.setTextColor(194, 65, 12); // #c2410c
    doc.text(calculatedData.abhijit.str, 110, 65);

    // Table
    const tableData = calculatedData.schedule.map(item => [item.name, item.range, item.dosha, item.act]);
    
    doc.autoTable({
        startY: 80,
        head: [['Period', 'Time Range', 'Dosha', 'Activity']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 100, 0] },
        styles: { fontSize: 11, cellPadding: 4 }
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Generated by Amidha Ayurveda (www.amidhaayurveda.com)", 14, finalY);

    doc.save("Ayurvedic_Schedule.pdf");
}

function copyCitation() {
    const text = document.getElementById('citation-text').innerText;
    navigator.clipboard.writeText(text);
    alert("Citation copied!");
}

// Initialize on load
init();
