# Contributing to Ayur-Chrono

First off, thank you for considering contributing to **Ayur-Chrono**! 🎉

This project is part of the **Amidha Ayurveda Open Research Ecosystem**. We welcome contributions from developers, Ayurvedic students, researchers, and astronomers. Whether you are fixing a typo, improving the UI, or refining the solar calculation algorithms, your help is appreciated.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing to ensure a safe and welcoming environment for everyone.

## 🧪 How Can You Contribute?

### 1. Reporting Bugs
If you find a bug (e.g., incorrect calculation, UI glitch, mobile responsiveness issue):
-   **Check existing issues** to see if it has already been reported.
-   **Open a new Issue** using the "Bug Report" template.
-   Include your **Location (City)**, **Date** tested, and browser version.

### 2. Suggesting Features
Have an idea to make the tool better?
-   Open an Issue with the tag **enhancement**.
-   Explain *why* this feature is useful for Ayurvedic practice or research.

### 3. Improving the Code
We welcome Pull Requests (PRs) for:
-   **UI/UX Improvements:** Better mobile responsiveness, accessibility (ARIA) fixes, or print styling.
-   **Algorithm Refinements:** Improving the precision of the solar calculation logic.
-   **Documentation:** Fixing typos or adding clearer explanations of the Ayurvedic concepts.

---

## 🛠️ Development Guide

This project is intentionally designed as a **Single-File Component (SFC)** to ensure it is portable, offline-first, and easy to embed.

### Prerequisites
-   A text editor (VS Code, Sublime Text, etc.).
-   A modern web browser.
-   **No** Node.js, NPM, or build steps are required.

### Local Setup
1.  **Fork** the repository on GitHub.
2.  **Clone** your fork locally:
    ```bash
    git clone [https://github.com/YOUR-USERNAME/ayur-chrono.git](https://github.com/YOUR-USERNAME/ayur-chrono.git)
    ```
3.  **Open** the `index.html` file in your browser to run the app.
4.  Make your changes in your text editor and refresh the browser to test.

---

## ⚠️ Important Guidelines

### 1. Scientific & Shastric Integrity
Since this is a research tool for Ayurvedic medicine:
-   **Do not change calculation logic** (e.g., definition of Brahma Muhurta) without citing a primary Ayurvedic text (Samhita) or a valid astronomical source.
-   If you modify the *Dinacharya* table, please reference the specific *Shloka* or *Adhyaya* in the comments or PR description.

### 2. Keep it "Vanilla"
-   Do **not** introduce build steps (Webpack, Vite) or heavy frameworks (React, Vue) unless absolutely necessary for a major refactor.
-   We want this tool to remain lightweight and usable by non-technical researchers who might just want to download the HTML file.

### 3. CSS Variables
-   Use the CSS variables defined in `:root` (e.g., `--color-primary`, `--radius-md`) to maintain consistency with the design system.

---

## 📥 Submitting a Pull Request (PR)

1.  Create a new branch for your feature:
    ```bash
    git checkout -b feature/amazing-feature
    ```
2.  Commit your changes with clear messages.
3.  **Test your changes:**
    -   Run the **Manual Test Plan** listed in the `README.md`.
    -   Ensure PDF generation still works.
    -   Ensure the tool works offline.
4.  Push to your fork and submit a Pull Request.
5.  Link any relevant Issues in your PR description.

## 📄 License

By contributing, you agree that your contributions will be licensed under the **MIT License** (for code) and **CC-BY 4.0** (for content), as defined in the project's [README](README.md).

---

Thank you for helping us digitize Ayurveda! 🌿

