<div align="center">

# 🎓 AssignmentWaly AI Studio

### The Ultimate All-in-One AI Toolkit for AIOU Students

[![Live Demo](https://img.shields.io/badge/🚀_Live_Studio-Visit_Now-6366f1?style=for-the-badge)](https://nationalistacademy.github.io/Assignmentwaly-Tools/)
[![DeepSeek](https://img.shields.io/badge/Powered_by-DeepSeek_API-7c3aed?style=for-the-badge)](https://platform.deepseek.com)
[![Cloudflare](https://img.shields.io/badge/Security-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-181717?style=for-the-badge&logo=github)](https://pages.github.com)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)](LICENSE)
[![Made in Pakistan](https://img.shields.io/badge/Made_in-Pakistan_🇵🇰-success?style=for-the-badge)](#)

**Write, Humanize, Draw, and Download AIOU Assignments — All in One Place.**

</div>

---

## 🌟 Overview

**AssignmentWaly AI Studio** is a comprehensive, serverless web application designed to automate the entire AIOU assignment creation process. Powered by **DeepSeek AI** and secured via **Cloudflare Workers**, it provides students and freelancers with a suite of 6 powerful tools to generate high-quality, plagiarism-free academic content.

Whether you need to write an assignment from scratch, bypass Turnitin, generate complex diagrams, or bulk-download Word files for multiple students, this Studio does it all.

---

## 🛠️ The 6 Powerful Tools

### 1. 🧠 AI Assignment Writer
*   **What it does:** Generates complete, A-Grade assignments in **APA format** based on your questions.
*   **Key Feature:** Uses smart prompting to ensure the content is original, academic, and tailored to AIOU standards.

### 2. 🛡️ AI Humanizer (Plagiarism Bypass)
*   **What it does:** Takes AI-generated text and rewrites it to sound 100% human.
*   **Key Feature:** Removes typical AI patterns and structures, allowing students to **bypass AI detectors** like Turnitin, GPTZero, and Copyleaks.

### 3. 🎯 Guess Paper Extractor
*   **What it does:** Analyzes past papers (PDF upload) and identifies the most repeated questions.
*   **Key Feature:** Categorizes questions into High Priority, Medium Priority, and Subjective types to help students study smartly.

### 4. 🎨 AI Diagram Generator
*   **What it does:** Auto-generates flowcharts, mind maps, and graphs based on a simple text prompt.
*   **Key Feature:** Uses `Mermaid.js` to render diagrams that can be downloaded as high-resolution PNG images for assignments.

### 5. 🖼️ Front Page / Cover Generator
*   **What it does:** Creates an official AIOU assignment cover page.
*   **Key Feature:** Live A4-size preview with perfect formatting. Students can directly "Print to PDF" without messing with MS Word tables.

### 6. 📥 Bulk Assignment Downloader
*   **What it does:** Generates multiple MS Word (`.docx`) files at once and packs them into a single `.zip` folder.
*   **Key Feature:** Perfect for freelancers and teachers managing assignments for multiple students at the same time.

---

## 🏗️ Architecture & Security

This project is built with a **Zero-Backend** architecture, ensuring high speed and zero hosting costs.

```text
┌──────────────────────────┐
│  User's Browser          │
│  ┌────────────────────┐  │
│  │  GitHub Pages      │  │  ← Hosts the UI (HTML/JS/CSS)
│  │  (The AI Studio)   │  │
│  └────────────────────┘  │
└────────────┬─────────────┘
             │ Fetch API Request (CORS)
             ▼
┌──────────────────────────┐
│  Cloudflare Worker       │  ← Hides API Key & Handles Auth
│  ┌────────────────────┐  │
│  │  Proxy Server      │  │
│  └────────────────────┘  │
└────────────┬─────────────┘
             │ HTTPS POST (Bearer Token)
             ▼
┌──────────────────────────┐
│  DeepSeek API            │  ← Generates the Content
│  (deepseek-chat model)   │
└──────────────────────────┘
