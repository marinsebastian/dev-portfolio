# 07_HEADER_AND_AI_BUTTON_SPEC.md — Header Branding, Auto-Scroll Fix & AI Gradient Button Spec

**Target Candidate:** Sebastian Marin — Systems Engineer & Full-Stack Developer  
**Target Organization:** Geolabs Cloud (`https://geolabs.cloud/developer/`)  
**Design Philosophy:** Irrefutable Header Branding, Icon-Focused Hover-Expanding Nav, Zero Auto-Scroll on Load, and Gemini-Style Gradient Button Splash.

---

## 1. Executive Summary of Improvements

| Component / Feature | Previous Implementation | Upgraded Implementation |
| :--- | :--- | :--- |
| **Page Mount Anchor** | `autoFocus` in `InteractiveCVSection.tsx` & `.focus()` in `GeolocationConsent.client.tsx` caused browser to auto-scroll down to CV / consent card on mount. | **100% Fixed:** Removed `autoFocus` and mount-time focus triggers. Page anchors cleanly at `#overview` top on mobile and desktop. |
| **Candidate Name & Branding** | Name repeated in both Header and Hero. | **Header De-duplication:**<br>- Header displays **Sebastian Marin** (`font-extrabold text-[#ffffff] text-base sm:text-lg`) with subtitle badge (`Ingeniero de Sistemas \| Full-Stack`).<br>- Hero headline focuses on title: *"Desarrollador Full-Stack & Sistemas Espaciales"*. |
| **Desktop Navigation Links** | Static text label buttons. | **Icon-Focused Hover-Expanding Nav:**<br>- Displays crisp icons by default (`Cpu`, `MapPin`, `Code`, `Terminal`, `FileText`, `Mail`).<br>- Smoothly expands text labels on hover (`group hover:space-x-2 transition-all duration-300`). |
| **"Resumen Profesional" Card** | Medium font sizing. | **Executive Text Sizing:** Enlarged card title (`text-sm sm:text-base font-extrabold tracking-wider`) and badge items (`text-xs sm:text-sm font-bold`) for high executive impact. |
| **AI Copilot Button** | Simple border outline. | **Google/Gemini Rotating Gradient Stroke & Color Splash:**<br>- Animated conic-gradient rotating stroke (`#14b8a6`, `#06b6d4`, `#6366f1`, `#a855f7`).<br>- On hover (desktop), splashes vibrant ambient color glow (`opacity: 0.85`, `blur: 18px`).<br>- On mobile, actively pulses glow (`copilot-pulse`) to compel tap interaction without relying on hover. |

---

## 2. Technical Code Changes

1. **`components/sections/InteractiveCVSection.tsx`:** Removed `autoFocus` attribute from close button.
2. **`components/geo/GeolocationConsent.client.tsx`:** Removed `primaryRef.current?.focus()` on mount.
3. **`components/layout/Header.tsx`:** Added prominent name branding with `Ingeniero de Sistemas | Full-Stack` badge and hover-expanding icon navbar.
4. **`components/sections/HeroSection.tsx`:** Updated headline to remove candidate name redundancy and increased `RESUMEN PROFESIONAL` card typography.
5. **`app/globals.css`:** Enhanced `.copilot-gradient-border` with multi-color conic gradient, pulsing animation, and hover splash glow.

---

## 3. Verification

- **`npx tsc --noEmit`:** Passed cleanly (`0 errors`).
- **`npm run build`:** Production static prerendering succeeded across 10/10 routes in 5.0s.
- **`npx playwright test`:** **39/39 Playwright tests passed (100% green)**.
