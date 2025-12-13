# ☀️ Ayur-Chrono: Ayurvedic Regimen Calculator

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXX)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JOSS Submission](https://img.shields.io/badge/JOSS-in%20preparation-blue.svg)](https://joss.theoj.org/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/sciencewithsaucee-sudo/ayur-chrono/issues)

**A Geo-Specific, Astronomically Accurate Tool for Ayurvedic Chronobiology**

**Ayur-Chrono** is a citable, open-source piece of **research software** designed to bring astronomical precision to the practice of *Dinacharya* (Daily Regimen).

Unlike standard charts that assume a 6:00 AM sunrise, this tool uses the **browser's Geolocation API** and **Solar Declination algorithms** to calculate exact *Muhurtas* (time units) based on the user's specific latitude, longitude, and current solar position. It allows practitioners to determine the precise **Brahma Muhurta**, **Abhijit Muhurta**, and **Dosha Kalas** anywhere on Earth.

---

## 🌟 Key Features

-   **Geo-Specific Precision:** Calculates timings based on exact Latitude/Longitude coordinates (Auto-detect or Manual).
-   **Astronomical Accuracy:** Uses local Solar Noon (transit), Sunrise, and Sunset to determine varying Day/Night lengths.
-   **Dynamic Muhurta Logic:** Adjusts the duration of *Brahma Muhurta* and *Abhijit Muhurta* dynamically (not fixed 48 minutes) based on the season and location.
-   **Interactive Schedule:** Generates a full day/night table showing the dominant *Dosha* (Vata, Pitta, Kapha) for every time slot.
-   **Browser Notifications:** Set "smart alarms" for Brahma Muhurta directly in the browser.
-   **PDF Export:** Generate and download a printable, medically accurate schedule for patient distribution.
-   **Privacy Focused:** Runs 100% client-side. No location data is sent to any server.

---

## 🚀 How to Use

This is a standalone web application. You can either use the live tool or run it locally.

🔗 **Live Tool:** [**https://sciencewithsaucee-sudo.github.io/ayur-chrono/**](https://sciencewithsaucee-sudo.github.io/ayur-chrono/)

### **Local Use**

1.  Download or clone this repository.
2.  Open the `index.html` file in any modern web browser (Chrome, Firefox, Edge, Safari).
3.  Allow "Location Access" if you wish to use Auto-Detect, or enter coordinates manually.

> 💡 **Note:** This tool works completely offline after the initial load. It uses client-side JavaScript for all astronomical calculations.

---

## 🧪 JOSS - Manual Test Plan for Reviewers

As per JOSS requirements for web applications, here is a manual test plan to verify all core functionality.

**Prerequisite:** Open the `index.html` file in a web browser.

### **Test 1: Location Detection**
-   **Action:** Click the "Auto-Detect Location" button.
-   **Expected:** The browser should ask for permission. Upon "Allow", the Latitude and Longitude fields should fill automatically.

### **Test 2: Calculation**
-   **Action:** Ensure a date is selected and coordinates are filled. Click "Calculate Timings".
-   **Expected:** The "Key Timings" cards (Brahma/Abhijit) and the "Dinacharya Table" below should populate with data.

### **Test 3: PDF Generation**
-   **Action:** Click the "Download Schedule" button in the hero section.
-   **Expected:** A PDF file named `Ayurvedic_Schedule.pdf` should download containing the calculated data formatted for print.

### **Test 4: Notification System**
-   **Action:** Click the "Bell" icon inside the Brahma Muhurta card.
-   **Expected:** The browser should request Notification permission. Once granted, an alert confirms the alarm is set.

### **Test 5: Dynamic Table Logic**
-   **Action:** Change the date to a different season (e.g., Winter vs. Summer).
-   **Expected:** The "Day Length" and "Night Length" values should change, and the start/end times in the table should shift accordingly.

---

## 📖 How to Cite

If you use this software in your research or clinical practice, please cite it.

**Plain Text Citation:**

> Varshney, S. (2025). *Ayur-Chrono: Geo-Specific Ayurvedic Regimen Calculator (v1.0.0)* [Software]. Zenodo.
> [https://doi.org/10.5281/zenodo.XXXXXX](https://doi.org/10.5281/zenodo.XXXXXX)

---

## 📚 Related Projects

This software is part of the **Amidha Ayurveda Open Research Ecosystem**.

-   **[Ayurvedic Herb Explorer](https://github.com/sciencewithsaucee-sudo/ayurvedic-herb-explorer)** *(Software)* — *Data-Driven Research Platform for Dravyaguna*
    **DOI:** [10.5281/zenodo.17553999](https://doi.org/10.5281/zenodo.17553999)

-   **[Herb Database](https://github.com/sciencewithsaucee-sudo/herb-database)** *(Data)* — *Amidha Ayurveda Open Herb Database*
    **DOI:** [10.5281/zenodo.17475352](https://doi.org/10.5281/zenodo.17475352)

-   **[Siddhanta Kosha](https://github.com/sciencewithsaucee-sudo/siddhanta-kosha)** *(Data)* — *A Curated JSON Dataset of 162 Core Ayurvedic Principles*
    **DOI:** [10.5281/zenodo.17481343](https://doi.org/10.5281/zenodo.17481343)

-   **[ShlokaAI](https://github.com/sciencewithsaucee-sudo/ShlokaAI)** *(Software)* — *🕉️ ShlokaAI: The Smart Sanskrit Analysis Platform*
    **DOI:** [10.5281/zenodo.17506829](https://doi.org/10.5281/zenodo.17506829)

---

## 🤝 Contributing & Support

This is a community-driven project — **contributions are welcome!**

-   🐞 **Found a bug?** [Open an issue here.](https://github.com/sciencewithsaucee-sudo/ayur-chrono/issues)
-   💡 **Have an idea?** [Open a feature request](https://github.com/sciencewithsaucee-sudo/ayur-chrono/issues)
-   🔧 **Want to contribute?** Please read the [Contributing Guidelines](https://github.com/sciencewithsaucee-sudo/ayur-chrono/blob/main/CONTRIBUTING.md).

---

## 👨‍💻 About the Author

**Developed by:** *Sparsh Varshney*
Founder, **Amidha Ayurveda – Digital Ayurveda Research Initiative**

-   🌐 **Website:** [amidhaayurveda.com/p/about.html](https://amidhaayurveda.com/p/about.html)
-   🆔 **ORCID:** [https://orcid.org/0009-0004-7835-0673](https://orcid.org/0009-0004-7835-0673)
-   💼 **LinkedIn:** [linkedin.com/in/sparshvarshney](https://linkedin.com/in/sparshvarshney)

---

## 📄 License

This project is licensed under a **dual-license system:**

-   **Software Code:** All `.js`, `.html`, `.css` files are licensed under the [MIT License](https://opensource.org/licenses/MIT).
-   **Documentation & Content:** Licensed under the [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

---

*This repository is part of the Amidha Ayurveda Open Research Ecosystem — promoting open-source, reproducible, and data-driven Ayurveda research.*
