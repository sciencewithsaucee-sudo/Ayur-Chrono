/**
 * Ayur-Chrono Core Solar Logic
 * Handles Astronomical Calculations
 */

const SunCalcLite = {
    rad: Math.PI / 180,
    deg: 180 / Math.PI,

    getJulianDate(date) {
        return (date.valueOf() / 86400000) - 0.5 + 2440588;
    },

    getSunTimes(date, lat, lng) {
        const J = this.getJulianDate(date);
        const lw = this.rad * -lng;
        const phi = this.rad * lat;
        const n = Math.round(J - 2451545 - 0.0009 - (lw / (2 * Math.PI)));
        const J_star = 2451545 + 0.0009 + (lw / (2 * Math.PI)) + n;
        const M = (357.5291 + 0.98560028 * (J_star - 2451545)) % 360;
        const C = 1.9148 * Math.sin(M * this.rad) + 0.0200 * Math.sin(2 * M * this.rad) + 0.0003 * Math.sin(3 * M * this.rad);
        const lambda = (M + C + 182.9884 + 360) % 360;
        const J_transit = 2451545 + 0.0009 + (lw / (2 * Math.PI)) + n + 0.0053 * Math.sin(M * this.rad) - 0.0069 * Math.sin(2 * lambda * this.rad);
        const delta = Math.asin(Math.sin(lambda * this.rad) * Math.sin(23.44 * this.rad));
        const H0 = -0.833 * this.rad; 
        const cosOmega0 = (Math.sin(H0) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
        
        if (cosOmega0 < -1 || cosOmega0 > 1) return null;

        const J_rise = J_transit - (Math.acos(cosOmega0) * this.deg) / 360;
        const J_set = J_transit + (Math.acos(cosOmega0) * this.deg) / 360;

        return {
            sunrise: new Date((J_rise + 0.5 - 2440588) * 86400000),
            sunset: new Date((J_set + 0.5 - 2440588) * 86400000),
            noon: new Date((J_transit + 0.5 - 2440588) * 86400000)
        };
    },

    addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    },

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};
