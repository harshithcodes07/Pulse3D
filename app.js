/**
 * PULSE3D &bull; Kinetic Fitness Activity Tracker
 * Three.js 3D Visualizer & Interactive Activity Tracking Engine
 */

// ==========================================================================
// 1. DATA MODEL & LOCAL STORAGE PERSISTENCE
// ==========================================================================

const DEFAULT_GOALS = {
  calories: 600,   // kcal
  steps: 10000,    // steps
  duration: 45     // minutes
};

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Realistic sample seed data for the week
const INITIAL_WEEK_DATA = [
  {
    dayIndex: 0,
    dayName: 'Monday',
    activities: [
      { id: 'act-1', type: 'running', name: 'Morning Trail Run', icon: '🏃', duration: 35, steps: 5200, calories: 410, intensity: 1.0 },
      { id: 'act-2', type: 'walking', name: 'Evening Walk', icon: '🚶', duration: 25, steps: 2900, calories: 125, intensity: 1.0 }
    ]
  },
  {
    dayIndex: 1,
    dayName: 'Tuesday',
    activities: [
      { id: 'act-3', type: 'cycling', name: 'Spin Cycle Workout', icon: '🚴', duration: 45, steps: 0, calories: 430, intensity: 1.1 },
      { id: 'act-4', type: 'strength', name: 'Core & Upper Body', icon: '🏋️', duration: 30, steps: 1100, calories: 180, intensity: 1.0 }
    ]
  },
  {
    dayIndex: 2,
    dayName: 'Wednesday',
    activities: [
      { id: 'act-5', type: 'hiit', name: 'HIIT Tabata Burner', icon: '⚡', duration: 30, steps: 3400, calories: 375, intensity: 1.2 },
      { id: 'act-6', type: 'walking', name: 'Lunch Stroll', icon: '🚶', duration: 20, steps: 2400, calories: 95, intensity: 0.9 }
    ]
  },
  {
    dayIndex: 3,
    dayName: 'Thursday',
    activities: [
      { id: 'act-7', type: 'swimming', name: 'Freestyle Laps', icon: '🏊', duration: 40, steps: 0, calories: 390, intensity: 1.0 },
      { id: 'act-8', type: 'yoga', name: 'Recovery Stretch', icon: '🧘', duration: 25, steps: 400, calories: 85, intensity: 0.8 }
    ]
  },
  {
    dayIndex: 4,
    dayName: 'Friday',
    activities: [
      { id: 'act-9', type: 'running', name: 'Tempo Road Run', icon: '🏃', duration: 45, steps: 6800, calories: 530, intensity: 1.1 },
      { id: 'act-10', type: 'walking', name: 'Commute Walking', icon: '🚶', duration: 30, steps: 3600, calories: 140, intensity: 1.0 }
    ]
  },
  {
    dayIndex: 5,
    dayName: 'Saturday',
    activities: [
      { id: 'act-11', type: 'sports', name: 'Weekend Soccer Match', icon: '⚽', duration: 60, steps: 8100, calories: 620, intensity: 1.25 },
      { id: 'act-12', type: 'cycling', name: 'Cruiser Ride to Cafe', icon: '🚴', duration: 35, steps: 0, calories: 240, intensity: 0.9 }
    ]
  },
  {
    dayIndex: 6,
    dayName: 'Sunday',
    activities: [
      { id: 'act-13', type: 'walking', name: 'Nature Trail Hike', icon: '🚶', duration: 55, steps: 6900, calories: 280, intensity: 1.0 },
      { id: 'act-14', type: 'yoga', name: 'Vinyasa Flow', icon: '🧘', duration: 35, steps: 500, calories: 120, intensity: 0.85 }
    ]
  }
];

class FitnessDataStore {
  constructor() {
    this.storageKey = 'pulse3d_fitness_store_v1';
    this.data = this.load();
    this.goals = DEFAULT_GOALS;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('LocalStorage load error, using initial data:', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_WEEK_DATA));
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  getDay(index) {
    return this.data.find(d => d.dayIndex === index) || { dayIndex: index, dayName: DAY_NAMES[index], activities: [] };
  }

  getDayTotals(index) {
    const day = this.getDay(index);
    let calories = 0;
    let steps = 0;
    let duration = 0;

    day.activities.forEach(act => {
      calories += act.calories || 0;
      steps += act.steps || 0;
      duration += act.duration || 0;
    });

    const calPct = Math.min(calories / this.goals.calories, 2.0);
    const stepPct = Math.min(steps / this.goals.steps, 2.0);
    const timePct = Math.min(duration / this.goals.duration, 2.0);
    const avgScore = Math.round(((calPct + stepPct + timePct) / 3) * 100);

    return { calories, steps, duration, calPct, stepPct, timePct, avgScore };
  }

  getWeeklyTotals() {
    let calories = 0;
    let steps = 0;
    let duration = 0;

    for (let i = 0; i < 7; i++) {
      const t = this.getDayTotals(i);
      calories += t.calories;
      steps += t.steps;
      duration += t.duration;
    }

    // Weekly momentum trend calculation compared to 7x daily goal target
    const targetCalories = this.goals.calories * 7;
    const momentumDelta = Math.round(((calories - targetCalories) / targetCalories) * 100);

    return { calories, steps, duration, momentumDelta };
  }

  addActivity(dayIndex, activity) {
    const day = this.getDay(dayIndex);
    if (!day.activities) day.activities = [];
    day.activities.unshift(activity);
    this.save();
  }

  removeActivity(dayIndex, activityId) {
    const day = this.getDay(dayIndex);
    if (day && day.activities) {
      day.activities = day.activities.filter(a => a.id !== activityId);
      this.save();
    }
  }

  clearDay(dayIndex) {
    const day = this.getDay(dayIndex);
    if (day) {
      day.activities = [];
      this.save();
    }
  }

  resetAll() {
    this.data = JSON.parse(JSON.stringify(INITIAL_WEEK_DATA));
    this.save();
  }
}

const store = new FitnessDataStore();

// ==========================================================================
// 2. SYNTHESIZED WEB AUDIO API FEEDBACK
// ==========================================================================

class AudioSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playBlip(freq = 600, duration = 0.06) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playWhoosh() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playChime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.09, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.45);
      });
    } catch (e) {}
  }
}

const audio = new AudioSynth();

// ==========================================================================
// 3. THREE.JS 3D SCENE ARCHITECTURE
// ==========================================================================

class Pulse3DApp {
  constructor() {
    this.container = document.getElementById('webgl-container');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1000, -1000);

    // Visual elements
    this.stations = []; // 7 day stations
    this.particleSystem = null;
    this.trendSplineMesh = null;
    this.trendSplinePoints = [];
    this.trendPulseParticles = null;

    // View state
    this.selectedDayIndex = null;
    this.hoveredDayIndex = null;
    this.viewMode = 'rings'; // 'rings', 'pillars', 'spline'

    // Camera animation targets
    this.cameraPosTarget = new THREE.Vector3(0, 18, 32);
    this.cameraLookTarget = new THREE.Vector3(0, 0, 0);
    this.defaultCamPos = new THREE.Vector3(0, 18, 32);
    this.defaultLook = new THREE.Vector3(0, 0, 0);

    this.clock = new THREE.Clock();

    this.initThree();
    this.buildLightingAndEnvironment();
    this.buildStations();
    this.buildTrendSpline();
    this.buildParticleField();
    this.setupEvents();
    this.animate();
  }

  initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x07090e, 0.015);

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.copy(this.defaultCamPos);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Don't flip under floor
    this.controls.minDistance = 8;
    this.controls.maxDistance = 65;
    this.controls.target.copy(this.defaultLook);
  }

  buildLightingAndEnvironment() {
    // Ambient light with midnight blue tint
    const ambientLight = new THREE.AmbientLight(0x1a243b, 1.2);
    this.scene.add(ambientLight);

    // Directional rim lights
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(20, 40, 25);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00e5ff, 1.5);
    dirLight2.position.set(-25, 20, -10);
    this.scene.add(dirLight2);

    const dirLight3 = new THREE.DirectionalLight(0xff3366, 1.2);
    dirLight3.position.set(25, 10, -20);
    this.scene.add(dirLight3);

    // Glowing base podium grid
    const gridHelper = new THREE.GridHelper(50, 40, 0x00e5ff, 0x141f36);
    gridHelper.position.y = -0.05;
    this.scene.add(gridHelper);

    // Holographic ground disk
    const diskGeo = new THREE.CircleGeometry(24, 64);
    const diskMat = new THREE.MeshBasicMaterial({
      color: 0x0d1527,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const disk = new THREE.Mesh(diskGeo, diskMat);
    disk.rotation.x = -Math.PI / 2;
    disk.position.y = -0.08;
    this.scene.add(disk);

    // Glowing concentric rings on ground
    [8, 14, 20].forEach(r => {
      const ringGeo = new THREE.RingGeometry(r - 0.05, r + 0.05, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide
      });
      const gRing = new THREE.Mesh(ringGeo, ringMat);
      gRing.rotation.x = -Math.PI / 2;
      gRing.position.y = -0.04;
      this.scene.add(gRing);
    });
  }

  /**
   * Builds 7 interactive day stations arranged along a sleek curved arc/layout
   */
  buildStations() {
    this.stations = [];
    const radius = 17;
    // Semicircular arc across 180 degrees centered towards camera
    const startAngle = Math.PI * 0.95;
    const endAngle = Math.PI * 0.05;

    for (let i = 0; i < 7; i++) {
      const t = i / 6;
      const angle = startAngle + (endAngle - startAngle) * t;
      const x = Math.cos(angle) * radius;
      const z = -Math.sin(angle) * (radius * 0.85) + 3;

      const stationGroup = new THREE.Group();
      stationGroup.position.set(x, 0, z);
      stationGroup.userData = { dayIndex: i, basePos: new THREE.Vector3(x, 0, z) };

      // 1. Pedestal Base Disc
      const baseGeo = new THREE.CylinderGeometry(2.1, 2.3, 0.4, 32);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x111624,
        metalness: 0.8,
        roughness: 0.25,
        emissive: 0x09101d,
        emissiveIntensity: 0.5
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.2;
      stationGroup.add(baseMesh);

      // Glowing rim on pedestal
      const rimGeo = new THREE.TorusGeometry(2.15, 0.05, 16, 64);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 0.4;
      stationGroup.add(rimMesh);

      // 2. Three 3D Concentric Kinetic Rings (Apple Fitness Style)
      // Red: Calories (outer, radius 1.7)
      // Cyan: Steps (middle, radius 1.25)
      // Lime: Active Minutes (inner, radius 0.8)
      const ringGroup = new THREE.Group();
      ringGroup.position.y = 0.6;
      stationGroup.add(ringGroup);

      // Background dim tracks
      const calTrack = this.createTrackRing(1.7, 0.12, 0x33101c);
      const stepTrack = this.createTrackRing(1.25, 0.12, 0x0a2a38);
      const timeTrack = this.createTrackRing(0.8, 0.12, 0x0a3320);
      ringGroup.add(calTrack, stepTrack, timeTrack);

      // Active progress arc rings
      const calActive = this.createActiveRingMesh(1.7, 0.13, 0xff3366);
      const stepActive = this.createActiveRingMesh(1.25, 0.13, 0x00e5ff);
      const timeActive = this.createActiveRingMesh(0.8, 0.13, 0x00ff88);
      ringGroup.add(calActive, stepActive, timeActive);

      // 3. Weekly Pillar Tower (Alternative visual representation)
      const pillarGroup = new THREE.Group();
      pillarGroup.position.y = 0.4;
      stationGroup.add(pillarGroup);

      const pCal = this.createPillar(-0.7, 0xff3366);
      const pStep = this.createPillar(0, 0x00e5ff);
      const pTime = this.createPillar(0.7, 0x00ff88);
      pillarGroup.add(pCal, pStep, pTime);
      pillarGroup.visible = false; // toggled via mode

      // 4. Floating Holographic Day Label
      const labelSprite = this.createDayLabelSprite(DAY_SHORT[i]);
      labelSprite.position.set(0, 3.8, 0);
      stationGroup.add(labelSprite);

      // 5. Hitbox Mesh for accurate Raycasting
      const hitGeo = new THREE.CylinderGeometry(2.4, 2.4, 5.0, 16);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false, wireframe: true });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.y = 2.5;
      hitMesh.userData = { isStationHitbox: true, dayIndex: i };
      stationGroup.add(hitMesh);

      this.scene.add(stationGroup);

      this.stations.push({
        group: stationGroup,
        rimMesh,
        ringGroup,
        pillarGroup,
        calActive,
        stepActive,
        timeActive,
        pCal,
        pStep,
        pTime,
        labelSprite,
        hitMesh,
        dayIndex: i,
        currentProgress: { cal: 0, step: 0, time: 0 },
        targetProgress: { cal: 0, step: 0, time: 0 }
      });
    }

    this.updateStationVisuals(true);
  }

  createTrackRing(radius, tubeRadius, color) {
    const geo = new THREE.TorusGeometry(radius, tubeRadius, 16, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.5,
      metalness: 0.2,
      transparent: true,
      opacity: 0.35
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = Math.PI / 2;
    return mesh;
  }

  createActiveRingMesh(radius, tubeRadius, colorHex) {
    // Dynamic curve-based tube geometry for variable arc length
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.8,
      roughness: 0.15,
      metalness: 0.3
    });

    const group = new THREE.Group();
    group.userData = { radius, tubeRadius, colorHex, mat, currentArc: 0.01 };

    // Placeholder mesh, updated dynamically in updateStationVisuals()
    return group;
  }

  createPillar(xOffset, colorHex) {
    const geo = new THREE.BoxGeometry(0.35, 1.0, 0.35);
    const mat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.5
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(xOffset, 0.5, 0);
    mesh.scale.set(1, 0.1, 1);
    return mesh;
  }

  createDayLabelSprite(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Draw stylish cyber badge
    ctx.fillStyle = 'rgba(12, 17, 30, 0.85)';
    ctx.roundRect ? ctx.roundRect(16, 20, 224, 88, 20) : ctx.rect(16, 20, 224, 88);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "JetBrains Mono", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 1.2, 1);
    return sprite;
  }

  /**
   * Refreshes ring geometries and pillar heights according to current data
   */
  updateStationVisuals(forceImmediate = false) {
    this.stations.forEach(st => {
      const totals = store.getDayTotals(st.dayIndex);

      st.targetProgress.cal = Math.min(totals.calPct, 2.0);
      st.targetProgress.step = Math.min(totals.stepPct, 2.0);
      st.targetProgress.time = Math.min(totals.timePct, 2.0);

      if (forceImmediate) {
        st.currentProgress.cal = st.targetProgress.cal;
        st.currentProgress.step = st.targetProgress.step;
        st.currentProgress.time = st.targetProgress.time;
      }

      this.rebuildRingGeometry(st.calActive, st.currentProgress.cal);
      this.rebuildRingGeometry(st.stepActive, st.currentProgress.step);
      this.rebuildRingGeometry(st.timeActive, st.currentProgress.time);

      // Scale pillars
      const pCalScale = Math.max(0.1, st.currentProgress.cal * 3.5);
      const pStepScale = Math.max(0.1, st.currentProgress.step * 3.5);
      const pTimeScale = Math.max(0.1, st.currentProgress.time * 3.5);

      st.pCal.scale.y = pCalScale;
      st.pCal.position.y = pCalScale / 2;

      st.pStep.scale.y = pStepScale;
      st.pStep.position.y = pStepScale / 2;

      st.pTime.scale.y = pTimeScale;
      st.pTime.position.y = pTimeScale / 2;
    });

    this.updateTrendSpline();
    this.renderHUD();
  }

  rebuildRingGeometry(ringGroup, progressRatio) {
    // Clear previous mesh
    while (ringGroup.children.length > 0) {
      const child = ringGroup.children[0];
      if (child.geometry) child.geometry.dispose();
      ringGroup.remove(child);
    }

    const radius = ringGroup.userData.radius;
    const tubeRadius = ringGroup.userData.tubeRadius;
    const mat = ringGroup.userData.mat;

    const maxArc = Math.PI * 2 * Math.min(progressRatio, 1.5);
    if (maxArc <= 0.05) return;

    // Build curved arc
    const arcGeo = new THREE.TorusGeometry(radius, tubeRadius, 24, 64, maxArc);
    const mesh = new THREE.Mesh(arcGeo, mat);
    mesh.rotation.x = Math.PI / 2;
    mesh.rotation.z = Math.PI / 2; // Start from top
    ringGroup.add(mesh);

    // End cap sphere for sleek modern finish
    const endAngle = Math.PI / 2 + maxArc;
    const endX = Math.cos(endAngle) * radius;
    const endY = Math.sin(endAngle) * radius;

    const capGeo = new THREE.SphereGeometry(tubeRadius * 1.05, 16, 16);
    const capMesh = new THREE.Mesh(capGeo, mat);
    capMesh.position.set(endX, 0, -endY);
    ringGroup.add(capMesh);
  }

  /**
   * 3D Kinetic Trend Flow Spline connecting the 7 days
   */
  buildTrendSpline() {
    this.trendSplinePoints = [];
    this.stations.forEach(st => {
      const p = st.group.position.clone();
      p.y = 2.0; // elevated line
      this.trendSplinePoints.push(p);
    });

    const curve = new THREE.CatmullRomCurve3(this.trendSplinePoints);
    const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.12, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });

    this.trendSplineMesh = new THREE.Mesh(tubeGeo, tubeMat);
    this.scene.add(this.trendSplineMesh);

    // Dynamic glowing energy node spheres at each station
    this.trendNodes = [];
    this.trendSplinePoints.forEach((pt, idx) => {
      const nodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: 0xffd166,
        emissive: 0xffd166,
        emissiveIntensity: 1.2
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pt);
      this.scene.add(nodeMesh);
      this.trendNodes.push(nodeMesh);
    });
  }

  updateTrendSpline() {
    if (!this.trendSplineMesh) return;

    this.stations.forEach((st, idx) => {
      const totals = store.getDayTotals(st.dayIndex);
      // Elevation based on aggregate score
      const elev = 1.2 + (totals.avgScore / 100) * 3.5;
      this.trendSplinePoints[idx].x = st.group.position.x;
      this.trendSplinePoints[idx].y = elev;
      this.trendSplinePoints[idx].z = st.group.position.z;

      if (this.trendNodes[idx]) {
        this.trendNodes[idx].position.copy(this.trendSplinePoints[idx]);
        // Highlight peak performance day
        if (totals.avgScore >= 100) {
          this.trendNodes[idx].scale.set(1.4, 1.4, 1.4);
        } else {
          this.trendNodes[idx].scale.set(1.0, 1.0, 1.0);
        }
      }
    });

    const curve = new THREE.CatmullRomCurve3(this.trendSplinePoints);
    this.trendSplineMesh.geometry.dispose();
    this.trendSplineMesh.geometry = new THREE.TubeGeometry(curve, 64, 0.12, 12, false);
  }

  /**
   * Ambient glowing particle field floating upwards
   */
  buildParticleField() {
    const particleCount = 650;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x00e5ff);
    const c2 = new THREE.Color(0xff3366);
    const c3 = new THREE.Color(0x00ff88);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;

      const choice = Math.random();
      const col = choice < 0.33 ? c1 : choice < 0.66 ? c2 : c3;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  // ========================================================================
  // 4. INTERACTION, RAYCASTING & CAMERA FOCUS
  // ========================================================================

  setupEvents() {
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('click', (e) => this.onClick(e));
    window.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  onMouseMove(e) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.updateRaycasting(e.clientX, e.clientY);
  }

  onTouchStart(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      this.mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
      this.updateRaycasting(touch.clientX, touch.clientY);
    }
  }

  updateRaycasting(screenX, screenY) {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitboxes = this.stations.map(s => s.hitMesh);
    const intersects = this.raycaster.intersectObjects(hitboxes);

    const tooltip = document.getElementById('float-tooltip');

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const dayIdx = hit.userData.dayIndex;

      if (this.hoveredDayIndex !== dayIdx) {
        this.hoveredDayIndex = dayIdx;
        audio.playBlip(750, 0.04);
      }

      // Position tooltip near cursor
      tooltip.style.left = `${screenX}px`;
      tooltip.style.top = `${screenY}px`;
      tooltip.classList.remove('hidden');

      const totals = store.getDayTotals(dayIdx);
      document.getElementById('tip-day-label').textContent = DAY_NAMES[dayIdx].toUpperCase();
      document.getElementById('tip-goal-badge').textContent = `${totals.avgScore}% SCORE`;
      document.getElementById('tip-cal').textContent = totals.calories.toLocaleString();
      document.getElementById('tip-step').textContent = totals.steps.toLocaleString();
      document.getElementById('tip-time').textContent = totals.duration;

      document.body.style.cursor = 'pointer';
    } else {
      if (this.hoveredDayIndex !== null) {
        this.hoveredDayIndex = null;
      }
      tooltip.classList.add('hidden');
      document.body.style.cursor = 'default';
    }
  }

  onClick(e) {
    // Only process if clicked canvas directly and not on UI panels
    if (e.target.closest('.top-nav, .view-mode-bar, .bottom-scrubber, .detail-drawer, .modal-backdrop')) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hitboxes = this.stations.map(s => s.hitMesh);
    const intersects = this.raycaster.intersectObjects(hitboxes);

    if (intersects.length > 0) {
      const dayIdx = intersects[0].object.userData.dayIndex;
      this.selectDay(dayIdx);
    } else {
      // Clicked empty background
      if (this.selectedDayIndex !== null) {
        this.deselectDay();
      }
    }
  }

  selectDay(dayIdx) {
    this.selectedDayIndex = dayIdx;
    audio.playWhoosh();

    const st = this.stations[dayIdx];
    const targetPos = st.group.position.clone();

    // Focus camera closely angled towards station
    this.cameraPosTarget.set(targetPos.x + 2, targetPos.y + 4.5, targetPos.z + 7.5);
    this.cameraLookTarget.set(targetPos.x, targetPos.y + 1.8, targetPos.z);

    // Open detail drawer
    this.openDetailDrawer(dayIdx);
    this.updateScrubberActivePill(dayIdx);
  }

  deselectDay() {
    this.selectedDayIndex = null;
    audio.playWhoosh();

    this.cameraPosTarget.copy(this.defaultCamPos);
    this.cameraLookTarget.copy(this.defaultLook);

    this.closeDetailDrawer();
    this.updateScrubberActivePill(null);
  }

  setViewMode(mode) {
    this.viewMode = mode;
    audio.playBlip(520, 0.08);

    this.stations.forEach(st => {
      if (mode === 'rings') {
        st.ringGroup.visible = true;
        st.pillarGroup.visible = false;
        this.trendSplineMesh.visible = false;
        this.trendNodes.forEach(n => n.visible = false);
      } else if (mode === 'pillars') {
        st.ringGroup.visible = false;
        st.pillarGroup.visible = true;
        this.trendSplineMesh.visible = false;
        this.trendNodes.forEach(n => n.visible = false);
      } else if (mode === 'spline') {
        st.ringGroup.visible = true;
        st.pillarGroup.visible = false;
        this.trendSplineMesh.visible = true;
        this.trendNodes.forEach(n => n.visible = true);
      }
    });

    // Update active button state
    document.querySelectorAll('.mode-btn').forEach(btn => {
      if (btn.dataset.mode === mode) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  // ========================================================================
  // 5. ANIMATION TICK & RENDER
  // ========================================================================

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Smoothly interpolate camera position & target
    this.camera.position.lerp(this.cameraPosTarget, 0.06);
    this.controls.target.lerp(this.cameraLookTarget, 0.06);
    this.controls.update();

    // 2. Animate stations (hover glow, spring animations on rings)
    this.stations.forEach((st, idx) => {
      const isHovered = this.hoveredDayIndex === idx;
      const isSelected = this.selectedDayIndex === idx;

      // Elevation bounce when hovered
      const targetElev = isSelected ? 0.6 : isHovered ? 0.35 : 0;
      st.group.position.y += (targetElev - st.group.position.y) * 0.12;

      // Glow intensity on pedestal rim
      st.rimMesh.material.opacity = isSelected ? 1.0 : isHovered ? 0.85 : 0.45;

      // Smooth progress lerp for rings
      let needsRebuild = false;
      ['cal', 'step', 'time'].forEach(k => {
        const diff = st.targetProgress[k] - st.currentProgress[k];
        if (Math.abs(diff) > 0.005) {
          st.currentProgress[k] += diff * 0.1;
          needsRebuild = true;
        }
      });

      if (needsRebuild) {
        this.rebuildRingGeometry(st.calActive, st.currentProgress[k = 'cal']);
        this.rebuildRingGeometry(st.stepActive, st.currentProgress[k = 'step']);
        this.rebuildRingGeometry(st.timeActive, st.currentProgress[k = 'time']);
      }

      // Gentle floating animation for label sprites
      st.labelSprite.position.y = 3.8 + Math.sin(elapsedTime * 2 + idx) * 0.12;
    });

    // 3. Animate particle field floating upwards
    if (this.particleSystem) {
      const positions = this.particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += delta * 0.8;
        if (positions[i + 1] > 25) {
          positions[i + 1] = 0;
        }
      }
      this.particleSystem.geometry.attributes.position.needsUpdate = true;
      this.particleSystem.rotation.y = elapsedTime * 0.02;
    }

    // 4. Animate glowing spline trend waves
    if (this.trendSplineMesh && this.trendSplineMesh.visible) {
      this.trendSplineMesh.material.emissiveIntensity = 0.8 + Math.sin(elapsedTime * 3) * 0.25;
    }

    this.renderer.render(this.scene, this.camera);
  }

  // ========================================================================
  // 6. UI & DRAWER INTEGRATION
  // ========================================================================

  renderHUD() {
    const weekly = store.getWeeklyTotals();

    // Top Macro HUD
    const elCal = document.getElementById('hud-total-cal');
    const elStep = document.getElementById('hud-total-steps');
    const elTime = document.getElementById('hud-total-time');

    if (elCal) elCal.textContent = weekly.calories.toLocaleString();
    if (elStep) elStep.textContent = weekly.steps.toLocaleString();
    if (elTime) elTime.textContent = weekly.duration.toLocaleString();

    // Momentum pill
    const trendPct = document.getElementById('hud-trend-pct');
    const trendArrow = document.getElementById('trend-arrow');
    if (trendPct && trendArrow) {
      if (weekly.momentumDelta >= 0) {
        trendArrow.textContent = '▲';
        trendPct.textContent = `+${weekly.momentumDelta}%`;
      } else {
        trendArrow.textContent = '▼';
        trendPct.textContent = `${weekly.momentumDelta}%`;
      }
    }

    // Render scrubber pills
    this.renderScrubber();
  }

  renderScrubber() {
    const container = document.getElementById('scrubber-days-list');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 7; i++) {
      const totals = store.getDayTotals(i);
      const pill = document.createElement('div');
      pill.className = `scrubber-day-pill ${this.selectedDayIndex === i ? 'active' : ''}`;
      pill.dataset.dayIndex = i;

      pill.innerHTML = `
        <span class="day-tag">${DAY_SHORT[i]}</span>
        <canvas class="mini-rings-canvas" width="48" height="48"></canvas>
      `;

      pill.addEventListener('click', () => {
        this.selectDay(i);
      });

      container.appendChild(pill);

      // Draw mini 2D rings on canvas
      const canvas = pill.querySelector('.mini-rings-canvas');
      this.drawMiniRings(canvas, totals);
    }
  }

  drawMiniRings(canvas, totals) {
    const ctx = canvas.getContext('2d');
    const center = 24;

    ctx.clearRect(0, 0, 48, 48);

    const rings = [
      { r: 18, pct: totals.calPct, color: '#ff3366', track: '#2b101c' },
      { r: 12, pct: totals.stepPct, color: '#00e5ff', track: '#0b2333' },
      { r: 6, pct: totals.timePct, color: '#00ff88', track: '#0d2b1f' }
    ];

    rings.forEach(ring => {
      // Track
      ctx.beginPath();
      ctx.arc(center, center, ring.r, 0, Math.PI * 2);
      ctx.strokeStyle = ring.track;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Active
      if (ring.pct > 0) {
        ctx.beginPath();
        const start = -Math.PI / 2;
        const end = start + Math.PI * 2 * Math.min(ring.pct, 1.5);
        ctx.arc(center, center, ring.r, start, end);
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });
  }

  updateScrubberActivePill(dayIdx) {
    document.querySelectorAll('.scrubber-day-pill').forEach(pill => {
      if (parseInt(pill.dataset.dayIndex, 10) === dayIdx) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  openDetailDrawer(dayIdx) {
    const drawer = document.getElementById('day-detail-drawer');
    const totals = store.getDayTotals(dayIdx);
    const day = store.getDay(dayIdx);

    document.getElementById('drawer-day-title').textContent = DAY_NAMES[dayIdx].toUpperCase();
    document.getElementById('drawer-score-pct').textContent = totals.avgScore;

    // Progress stats
    document.getElementById('drawer-val-cal').textContent = `${totals.calories.toLocaleString()} / ${store.goals.calories} kcal`;
    document.getElementById('drawer-bar-cal').style.width = `${Math.min(totals.calPct * 100, 100)}%`;

    document.getElementById('drawer-val-step').textContent = `${totals.steps.toLocaleString()} / ${store.goals.steps.toLocaleString()}`;
    document.getElementById('drawer-bar-step').style.width = `${Math.min(totals.stepPct * 100, 100)}%`;

    document.getElementById('drawer-val-time').textContent = `${totals.duration} / ${store.goals.duration} min`;
    document.getElementById('drawer-bar-time').style.width = `${Math.min(totals.timePct * 100, 100)}%`;

    // Render activity cards
    const listEl = document.getElementById('drawer-activity-items');
    listEl.innerHTML = '';

    if (!day.activities || day.activities.length === 0) {
      listEl.innerHTML = `<div class="empty-activity-notice">No activities recorded for ${DAY_NAMES[dayIdx]} yet.<br/>Tap + ADD to log a workout.</div>`;
    } else {
      day.activities.forEach(act => {
        const item = document.createElement('div');
        item.className = 'activity-item-card';
        item.innerHTML = `
          <div class="item-left">
            <div class="item-icon-bubble">${act.icon || '⚡'}</div>
            <div class="item-details">
              <span class="item-name">${act.name}</span>
              <span class="item-time-sub">${act.duration}m &bull; ${act.steps ? act.steps.toLocaleString() + ' steps' : 'cardio'}</span>
            </div>
          </div>
          <div class="item-right">
            <span class="item-cal-tag">+${act.calories} kcal</span>
            <button class="item-delete-btn" title="Delete Activity">&times;</button>
          </div>
        `;

        item.querySelector('.item-delete-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          store.removeActivity(dayIdx, act.id);
          this.updateStationVisuals();
          this.openDetailDrawer(dayIdx);
          audio.playBlip(380, 0.08);
        });

        listEl.appendChild(item);
      });
    }

    drawer.classList.add('open');
  }

  closeDetailDrawer() {
    const drawer = document.getElementById('day-detail-drawer');
    drawer.classList.remove('open');
  }
}

// Instantiate global app
let app = null;
window.addEventListener('DOMContentLoaded', () => {
  app = new Pulse3DApp();
  setupUIHandlers();
});

// ==========================================================================
// 7. MODAL, LOGGING & CALORIE ESTIMATION ENGINE
// ==========================================================================

let activeDayForModal = 0;
let selectedDiscipline = {
  type: 'running',
  met: 9.8,
  stepsPerMin: 160,
  icon: '🏃',
  name: 'Running'
};
let intensityFactor = 1.0;
const USER_WEIGHT_KG = 70; // Baseline bodyweight

function setupUIHandlers() {
  // Mode switcher buttons
  document.querySelectorAll('.mode-btn[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      app.setViewMode(btn.dataset.mode);
    });
  });

  // Reset camera button
  document.getElementById('btn-reset-cam').addEventListener('click', () => {
    app.deselectDay();
  });

  // Close drawer button
  document.getElementById('btn-close-drawer').addEventListener('click', () => {
    app.deselectDay();
  });

  // Clear day button
  document.getElementById('btn-clear-day').addEventListener('click', () => {
    if (app.selectedDayIndex !== null) {
      store.clearDay(app.selectedDayIndex);
      app.updateStationVisuals();
      app.openDetailDrawer(app.selectedDayIndex);
      audio.playBlip(320, 0.12);
    }
  });

  // Sound toggle button
  const soundBtn = document.getElementById('btn-sound-toggle');
  const soundOn = document.getElementById('sound-icon-on');
  const soundOff = document.getElementById('sound-icon-off');

  soundBtn.addEventListener('click', () => {
    audio.enabled = !audio.enabled;
    if (audio.enabled) {
      soundOn.classList.remove('hidden');
      soundOff.classList.add('hidden');
      audio.playBlip(880, 0.08);
    } else {
      soundOn.classList.add('hidden');
      soundOff.classList.remove('hidden');
    }
  });

  // Theme cycler
  const themeBtn = document.getElementById('btn-theme');
  const themes = ['theme-default', 'theme-cyber', 'theme-sunset'];
  let currentThemeIdx = 0;

  themeBtn.addEventListener('click', () => {
    document.body.classList.remove(themes[currentThemeIdx]);
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    if (themes[currentThemeIdx] !== 'theme-default') {
      document.body.classList.add(themes[currentThemeIdx]);
    }
    audio.playBlip(700, 0.06);
  });

  // Modal open/close
  const logModal = document.getElementById('log-modal');
  const openLogBtn = document.getElementById('btn-open-log');
  const closeLogBtn = document.getElementById('btn-modal-close');
  const cancelLogBtn = document.getElementById('btn-cancel-modal');
  const quickAddToDay = document.getElementById('btn-quick-add-to-day');

  function openModal(defaultDay = 0) {
    activeDayForModal = defaultDay;
    highlightDayPickerPill(activeDayForModal);
    recomputeEstimatedCalories();
    logModal.classList.remove('hidden');
    audio.playWhoosh();
  }

  function closeModal() {
    logModal.classList.add('hidden');
  }

  openLogBtn.addEventListener('click', () => {
    openModal(app.selectedDayIndex !== null ? app.selectedDayIndex : 0);
  });

  quickAddToDay.addEventListener('click', () => {
    if (app.selectedDayIndex !== null) {
      openModal(app.selectedDayIndex);
    }
  });

  closeLogBtn.addEventListener('click', closeModal);
  cancelLogBtn.addEventListener('click', closeModal);

  // Modal Day Picker Pills
  document.querySelectorAll('#modal-day-picker .day-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      activeDayForModal = parseInt(pill.dataset.day, 10);
      highlightDayPickerPill(activeDayForModal);
      audio.playBlip(650, 0.04);
    });
  });

  function highlightDayPickerPill(idx) {
    document.querySelectorAll('#modal-day-picker .day-pill').forEach(p => {
      if (parseInt(p.dataset.day, 10) === idx) p.classList.add('active');
      else p.classList.remove('active');
    });
  }

  // Discipline buttons
  document.querySelectorAll('.disc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.disc-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      selectedDiscipline = {
        type: btn.dataset.type,
        met: parseFloat(btn.dataset.met),
        stepsPerMin: parseInt(btn.dataset.stepsPerMin, 10),
        icon: btn.querySelector('.disc-icon').textContent,
        name: btn.querySelector('.disc-label').textContent
      };

      // Auto update steps slider suggested for this discipline & duration
      const durationVal = parseInt(document.getElementById('input-duration').value, 10);
      const suggestedSteps = selectedDiscipline.stepsPerMin * durationVal;
      document.getElementById('input-steps').value = suggestedSteps;
      document.getElementById('display-steps').innerHTML = `${suggestedSteps.toLocaleString()} <span class="dim">steps</span>`;

      recomputeEstimatedCalories();
      audio.playBlip(720, 0.04);
    });
  });

  // Duration Slider
  const durSlider = document.getElementById('input-duration');
  durSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    document.getElementById('display-duration').innerHTML = `${val} <span class="dim">min</span>`;

    // Recalculate suggested steps
    const suggestedSteps = selectedDiscipline.stepsPerMin * val;
    document.getElementById('input-steps').value = suggestedSteps;
    document.getElementById('display-steps').innerHTML = `${suggestedSteps.toLocaleString()} <span class="dim">steps</span>`;

    recomputeEstimatedCalories();
  });

  // Steps Slider
  const stepSlider = document.getElementById('input-steps');
  stepSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    document.getElementById('display-steps').innerHTML = `${val.toLocaleString()} <span class="dim">steps</span>`;
  });

  // Intensity buttons
  document.querySelectorAll('.intensity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      intensityFactor = parseFloat(btn.dataset.factor);
      recomputeEstimatedCalories();
      audio.playBlip(680, 0.04);
    });
  });

  // Save Activity Form Submission
  document.getElementById('activity-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const duration = parseInt(document.getElementById('input-duration').value, 10);
    const steps = parseInt(document.getElementById('input-steps').value, 10);
    const calories = recomputeEstimatedCalories();

    const newActivity = {
      id: 'act-' + Date.now(),
      type: selectedDiscipline.type,
      name: `${selectedDiscipline.name} Session`,
      icon: selectedDiscipline.icon,
      duration: duration,
      steps: steps,
      calories: calories,
      intensity: intensityFactor
    };

    store.addActivity(activeDayForModal, newActivity);

    // Audio & Confetti celebration
    audio.playChime();
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#00e5ff', '#ff3366', '#00ff88', '#ffd166']
      });
    }

    closeModal();
    app.updateStationVisuals();

    // Focus on that day
    app.selectDay(activeDayForModal);
  });
}

function setDuration(val) {
  document.getElementById('input-duration').value = val;
  document.getElementById('display-duration').innerHTML = `${val} <span class="dim">min</span>`;
  const suggestedSteps = selectedDiscipline.stepsPerMin * val;
  document.getElementById('input-steps').value = suggestedSteps;
  document.getElementById('display-steps').innerHTML = `${suggestedSteps.toLocaleString()} <span class="dim">steps</span>`;
  recomputeEstimatedCalories();
  audio.playBlip(600, 0.04);
}

function setSteps(addVal) {
  const current = parseInt(document.getElementById('input-steps').value, 10);
  const next = Math.min(current + addVal, 25000);
  document.getElementById('input-steps').value = next;
  document.getElementById('display-steps').innerHTML = `${next.toLocaleString()} <span class="dim">steps</span>`;
  audio.playBlip(640, 0.04);
}

/**
 * Real-time Calorie Estimation Formula:
 * Calories = Duration(hrs) * MET * Weight(kg) * IntensityFactor
 */
function recomputeEstimatedCalories() {
  const durationMin = parseInt(document.getElementById('input-duration').value, 10);
  const hours = durationMin / 60;
  const met = selectedDiscipline.met;

  const estimatedCalories = Math.round(hours * met * USER_WEIGHT_KG * intensityFactor);

  const numEl = document.getElementById('display-est-cal');
  const formulaEl = document.getElementById('est-formula-text');

  if (numEl) numEl.textContent = estimatedCalories;
  if (formulaEl) {
    formulaEl.textContent = `MET ${met} &bull; ${intensityFactor}x Multiplier &bull; ${USER_WEIGHT_KG}kg Baseline`;
  }

  return estimatedCalories;
}
