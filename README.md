# PULSE3D &bull; Kinetic Fitness Activity Tracker

A futuristic, low-text, highly visual 3D fitness tracking web application built with **Three.js**, **Web Audio API**, and **HTML5/CSS3 glassmorphism**.

---

## 🌟 Key Features

1. **Daily Activity & Dynamic Calorie Estimation**:
   - Record daily **steps**, **exercise duration** (minutes), and **calories burned**.
   - Scientific **MET (Metabolic Equivalent of Task)** calorie estimator based on activity discipline (Running, Cycling, Walking, Swimming, HIIT, Strength, Yoga, Sports) and intensity multipliers (Light, Normal, Intense, Max Beast).
   - Dynamic step suggestions calibrated to workout discipline and duration.

2. **Kinetic 3D Visualizations with Three.js**:
   - **3D Activity Rings**: Concentric glowing Apple Fitness–style rings for every day of the week (Coral for Calories, Cyan for Steps, Spring Green for Active Minutes).
   - **3D Weekly Towers**: Extruded glowing neon bars comparing daily workout volumes.
   - **3D Kinetic Trend Flow**: Animated glowing Bezier spline connecting all 7 days with energy pulses and golden performance nodes.
   - **Ambient Particle Field**: Floating bioluminescent particles reacting to movement.

3. **Weekly Progress & Activity Trends**:
   - Real-time weekly macro summary at the top HUD showing total calories, steps, and active minutes.
   - **Weekly Momentum Indicator**: Automatic percentage trajectory comparison (+/-%) vs target baseline.
   - Interactive day scrubber at the bottom with mini 2D ring canvases.
   - Raycast hover inspection: Floating 3D holographic tooltips over each day station.
   - Click to focus: Smooth 3D camera zoom and transition into any selected day, opening the detailed session drawer.

4. **Interactive Controls & Audio**:
   - Full 3D camera orbit: Left-drag to rotate, right-drag to pan, scroll to zoom.
   - Synthesized Web Audio feedback (futuristic blips, whooshes, and celebratory chimes).
   - Celebration particle confetti on goal commitment.
   - Color theme cycler (Default Cyber, Neon Purple/Magenta, Sunset Orange).
   - LocalStorage auto-persistence: all logged workouts stay saved across sessions.

---

## 🚀 How to Run

Simply open `index.html` in any modern web browser (Google Chrome, Safari, Firefox, Edge):

```bash
open "/Users/vineethanikethanmk/Documents/Fitness Tracker/index.html"
```
Or double-click `index.html` in your macOS Finder.
