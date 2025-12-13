/**
 * Ayur-Chrono Core Engine
 * Handles Astronomy and Ayurvedic Period Math
 */

const MathPI = Math.PI;
const rad = MathPI / 180;
const deg = 180 / MathPI;

const getJulianDate = (date) => (date.valueOf() / 86400000) - 0.5 + 2440588;

/**
 * Calculates Solar events for a given location and date
 */
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

const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);
