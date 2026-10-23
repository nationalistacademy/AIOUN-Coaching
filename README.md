<div align="center">

# 🤖 AssignmentWaly AI Agent

### AI-Powered Content Generator for AIOU Solved Assignments

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-View_Tool-1e6f3f?style=for-the-badge)](https://faiezhafeez.github.io/Assignmentwaly-Tools/generator.html)
[![DeepSeek](https://img.shields.io/badge/Powered_by-DeepSeek_API-7c3aed?style=for-the-badge)](https://platform.deepseek.com)
[![Cloudflare](https://img.shields.io/badge/Proxy-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com)
[![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-181717?style=for-the-badge&logo=github)](https://pages.github.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Made in Pakistan](https://img.shields.io/badge/Made_in-Pakistan_🇵🇰-green?style=for-the-badge)](#)

**Turn any topic into a fully formatted, SEO-optimized, AdSense-ready blog post for [AssignmentWaly](https://assignmentwaly.blogspot.com) in under 60 seconds.**

[Features](#-features) · [Quick Start](#-quick-start-5-minutes) · [Architecture](#-architecture) · [Usage](#-usage) · [Troubleshooting](#-troubleshooting) · [FAQ](#-faq)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start (5 Minutes)](#-quick-start-5-minutes)
  - [Step 1: Get DeepSeek API Key](#step-1-get-deepseek-api-key)
  - [Step 2: Deploy Cloudflare Worker](#step-2-deploy-cloudflare-worker)
  - [Step 3: Deploy to GitHub Pages](#step-3-deploy-to-github-pages)
  - [Step 4: Configure & Use](#step-4-configure--use)
- [Usage](#-usage)
  - [Mode A — Generate From Topic](#mode-a--generate-from-topic)
  - [Mode B — Format Existing Content](#mode-b--format-existing-content)
- [Output Format](#-output-format)
- [Configuration Reference](#-configuration-reference)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Cost & Limits](#-cost--limits)
- [Security Best Practices](#-security-best-practices)
- [Optional: Batch Generation with GitHub Actions](#-optional-batch-generation-with-github-actions)
- [FAQ](#-faq)
- [Contributing](#-contributing)
- [License](#-license)
- [Credits & Support](#-credits--support)

---

## 🎯 Overview

**AssignmentWaly AI Agent** is a free, open-source tool that generates complete blog posts for the [AssignmentWaly](https://assignmentwaly.blogspot.com) education blog. It uses **DeepSeek's AI** to convert a simple topic (or any existing content) into a production-ready HTML post with:

- ✅ **Full SEO optimization** (meta tags, Open Graph, Twitter Cards, canonical URLs)
- ✅ **GEO optimization** (FAQPage schema for AI Overviews & ChatGPT search)
- ✅ **AdSense compliance** (substantial content, proper structure, no prohibited elements)
- ✅ **JSON-LD structured data** (Article, Organization, Breadcrumb, FAQPage)
- ✅ **Blogger-ready HTML** with inline CSS (matches existing post style)
- ✅ **Automatic course tables, deadlines, FAQs, internal links, WhatsApp CTAs**

**Who is this for?**

- 📝 Education bloggers managing AIOU-related content
- 🎓 Tutors uploading solved assignments regularly
- 🏫 Any site needing bulk SEO-optimized content generation
- 💼 Freelancers building content tools for education niche

---

## ✨ Features

### 🤖 AI-Powered Generation
| Feature | Description |
|---|---|
| **Two Input Modes** | Generate from scratch (topic) or reformat existing content |
| **Smart Extraction** | AI automatically finds courses, deadlines, FAQs from raw text |
| **Bilingual Support** | Roman Urdu for callouts, English for SEO — matches AssignmentWaly style |
| **Context-Aware** | Understands AIOU programs (AD LIS, MLIS, B.Ed, BA/B.Com, MA, etc.) |
| **JSON Output** | Guaranteed valid JSON via `response_format: json_object` |

### 🔍 SEO Optimized
- Primary + secondary keyword placement
- 155-char meta description
- Auto-generated URL slug
- Canonical URL tag
- Open Graph tags (Facebook/LinkedIn preview)
- Twitter Card tags
- `robots` meta with `max-image-preview:large`
- BreadcrumbList schema
- Article schema with dates

### 🚀 GEO Optimized (AI Search)
- **FAQPage schema** — appears in Google AI Overviews, ChatGPT, Perplexity
- **Article schema** with `datePublished` & `dateModified`
- **Entity-rich** content (university, program, session clearly stated)
- **Structured tables** — AI engines love tabular data
- **Direct Q&A format** for FAQ sections

### 💰 AdSense Friendly
- Substantial unique content (500+ words auto-generated)
- Clear navigation (header links → footer)
- No auto-refresh, no misleading CTAs
- Privacy-friendly (no tracking in output HTML)
- Warning boxes to encourage original work (anti-plagiarism notice)

### 🎨 Ready-to-Use Output
- Inline CSS matching existing AssignmentWaly posts
- Responsive tables (mobile-friendly)
- Built-in search filter for courses
- WhatsApp CTA button
- "Back to Homepage" button
- Social media teaser

### 🔐 Secure by Design
- API key never exposed in browser
- Cloudflare Worker proxy handles all API calls
- Optional `AUTH_TOKEN` prevents unauthorized use
- No database, no cookies, no user tracking
- localStorage only stores Worker URL + Auth Token locally

---

## 🏗️ Architecture
