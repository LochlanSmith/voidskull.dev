const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let centerX = 0;
let centerY = 0;
let zoomScale = 5;

// Bermagui, NSW Geographic Coordinates
const BERMAGUI_LAT = -36.42;
const BERMAGUI_LON = 150.07;

// --- ZOOM LOCK ENGINE (DESKTOP CONTROLS) ---
window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
    }
}, { passive: false });

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '=' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
    }
});

function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    centerX = width * 0.5;
    centerY = height * 0.5;
    
    // Zoom factor to fit the hemisphere comfortably on screen
    zoomScale = Math.min(width, height) * 0.014; 
}
window.addEventListener("resize", resize);

// Asset Loading
const star3 = new Image();
const star5 = new Image();
const star9 = new Image();
star3.src = "assets/3x3star.png";
star5.src = "assets/5x5star.png";
star9.src = "assets/9x9star.png";

// Interactive Tracking Arrays
let interactiveObjects = [];
let hoveredObject = null;

// Real Star Catalog (Brightest Stars + Essential Structural Connectors)
const starCatalog = [
    // --- THE ELITE 96 BRIGHTEST STARS (Strictly Ordered by Magnitude) ---
    { name: "Sirius", ra: 6.75, dec: -16.71, mag: -1.46, img: star9, type: "star" },
    { name: "Canopus", ra: 6.40, dec: -52.70, mag: -0.74, img: star9, type: "star" },
    { name: "Alpha Centauri", ra: 14.66, dec: -60.83, mag: -0.27, img: star9, type: "star" },
    { name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, img: star9, type: "star" },
    { name: "Vega", ra: 18.62, dec: 38.78, mag: 0.03, img: star9, type: "star" },
    { name: "Capella", ra: 5.27, dec: 46.00, mag: 0.08, img: star9, type: "star" },
    { name: "Rigel", ra: 5.25, dec: -8.20, mag: 0.13, img: star9, type: "star" },
    { name: "Procyon", ra: 7.66, dec: 5.21, mag: 0.34, img: star9, type: "star" },
    { name: "Achernar", ra: 1.63, dec: -57.24, mag: 0.50, img: star9, type: "star" },
    { name: "Betelgeuse", ra: 5.92, dec: 7.41, mag: 0.58, img: star9, type: "star" },
    { name: "Hadar", ra: 14.06, dec: -60.37, mag: 0.61, img: star9, type: "star" },
    { name: "Altair", ra: 19.84, dec: 8.87, mag: 0.76, img: star9, type: "star" },
    { name: "Acrux", ra: 12.44, dec: -63.10, mag: 0.77, img: star9, type: "star" },
    { name: "Aldebaran", ra: 4.60, dec: 16.50, mag: 0.85, img: star9, type: "star" },
    { name: "Spica", ra: 13.42, dec: -11.16, mag: 0.98, img: star9, type: "star" },
    { name: "Antares", ra: 16.49, dec: -26.43, mag: 1.05, img: star9, type: "star" },
    { name: "Pollux", ra: 7.75, dec: 28.02, mag: 1.14, img: star5, type: "star" },
    { name: "Fomalhaut", ra: 22.96, dec: -29.62, mag: 1.16, img: star5, type: "star" },
    { name: "Mimosa", ra: 12.79, dec: -59.68, mag: 1.25, img: star5, type: "star" },
    { name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25, img: star5, type: "star" },
    { name: "Regulus", ra: 10.14, dec: 11.96, mag: 1.35, img: star5, type: "star" },
    { name: "Adhara", ra: 6.98, dec: -28.97, mag: 1.50, img: star5, type: "star" },
    { name: "Castor", ra: 7.58, dec: 31.88, mag: 1.58, img: star5, type: "star" },
    { name: "Gacrux", ra: 12.52, dec: -57.11, mag: 1.59, img: star5, type: "star" },
    { name: "Shaula", ra: 17.56, dec: -37.10, mag: 1.62, img: star5, type: "star" },
    { name: "Bellatrix", ra: 5.42, dec: 6.35, mag: 1.64, img: star5, type: "star" },
    { name: "Elnath", ra: 5.43, dec: 28.60, mag: 2.05, img: star5, type: "star" },
    { name: "Miaplacidus", ra: 9.22, dec: -69.72, mag: 1.67, img: star5, type: "star" },
    { name: "Alnilam", ra: 5.60, dec: -1.20, mag: 1.69, img: star5, type: "star" },
    { name: "Alnair", ra: 22.14, dec: -46.96, mag: 1.73, img: star5, type: "star" },
    { name: "Alnitak", ra: 5.68, dec: -1.94, mag: 1.74, img: star5, type: "star" },
    { name: "Alioth", ra: 12.90, dec: 55.96, mag: 1.76, img: star5, type: "star" },
    { name: "Mirfak", ra: 3.40, dec: 49.86, mag: 1.79, img: star5, type: "star" },
    { name: "Kaus Australis", ra: 18.40, dec: -34.38, mag: 1.79, img: star5, type: "star" },
    { name: "Dubhe", ra: 11.06, dec: 61.75, mag: 1.81, img: star5, type: "star" },
    { name: "Wezen", ra: 7.14, dec: -26.32, mag: 1.83, img: star5, type: "star" },
    { name: "Alkaid", ra: 13.79, dec: 49.31, mag: 1.85, img: star5, type: "star" },
    { name: "Sargas", ra: 17.62, dec: -43.00, mag: 1.86, img: star5, type: "star" },
    { name: "Avior", ra: 8.37, dec: -59.51, mag: 1.86, img: star5, type: "star" },
    { name: "Alhena", ra: 6.63, dec: 16.54, mag: 1.93, img: star5, type: "star" },
    { name: "Peacock", ra: 20.43, dec: -56.74, mag: 1.94, img: star5, type: "star" },
    { name: "Mirzam", ra: 6.38, dec: -17.95, mag: 1.98, img: star5, type: "star" },
    { name: "Hamal", ra: 2.12, dec: 23.46, mag: 2.01, img: star5, type: "star" },
    { name: "Diphda", ra: 0.72, dec: -17.99, mag: 2.04, img: star5, type: "star" },
    { name: "Nunki", ra: 18.92, dec: -26.29, mag: 2.05, img: star5, type: "star" },
    { name: "Menkent", ra: 14.11, dec: -36.37, mag: 2.06, img: star5, type: "star" },
    { name: "Saiph", ra: 5.79, dec: -9.67, mag: 2.07, img: star5, type: "star" },
    { name: "Alpheratz", ra: 0.14, dec: 29.09, mag: 2.07, img: star5, type: "star" },
    { name: "Mirach", ra: 1.16, dec: 35.62, mag: 2.07, img: star5, type: "star" },
    { name: "Rasalhague", ra: 17.58, dec: 12.56, mag: 2.08, img: star5, type: "star" },
    { name: "Almach", ra: 2.07, dec: 42.33, mag: 2.10, img: star5, type: "star" },
    { name: "Algol", ra: 3.14, dec: 40.96, mag: 2.12, img: star5, type: "star" },
    { name: "Denebola", ra: 11.82, dec: 14.57, mag: 2.14, img: star5, type: "star" },
    { name: "Muhlifain", ra: 12.18, dec: -48.96, mag: 2.20, img: star5, type: "star" },
    { name: "Centauri Gamma", ra: 12.69, dec: -48.95, mag: 2.20, img: star5, type: "star" },
    { name: "Aspidiske", ra: 9.28, dec: -59.27, mag: 2.21, img: star5, type: "star" },
    { name: "Alphecca", ra: 15.58, dec: 26.71, mag: 2.22, img: star5, type: "star" },
    { name: "Mizar", ra: 13.40, dec: 54.92, mag: 2.23, img: star5, type: "star" },
    { name: "Eltanin", ra: 17.94, dec: 51.49, mag: 2.24, img: star5, type: "star" },
    { name: "Shedar", ra: 0.68, dec: 56.54, mag: 2.24, img: star5, type: "star" },
    { name: "Mintaka", ra: 5.53, dec: -0.30, mag: 2.25, img: star5, type: "star" },
    { name: "Caph", ra: 0.02, dec: 59.15, mag: 2.28, img: star3, type: "star" },
    { name: "Dschubba", ra: 16.01, dec: -22.62, mag: 2.29, img: star3, type: "star" },
    { name: "Enif", ra: 21.74, dec: 9.88, mag: 2.38, img: star3, type: "star" },
    { name: "Ankaa", ra: 0.43, dec: -42.30, mag: 2.39, img: star3, type: "star" },
    { name: "Larawag", ra: 17.20, dec: -43.24, mag: 2.39, img: star3, type: "star" },
    { name: "Sabik", ra: 17.17, dec: -15.73, mag: 2.43, img: star3, type: "star" },
    { name: "Scheat", ra: 23.06, dec: 28.08, mag: 2.44, img: star3, type: "star" },
    { name: "Aludra", ra: 7.40, dec: -29.30, mag: 2.45, img: star3, type: "star" },
    { name: "Gienah", ra: 20.77, dec: 33.97, mag: 2.48, img: star3, type: "star" },
    { name: "Markab", ra: 23.08, dec: 15.20, mag: 2.49, img: star3, type: "star" },
    { name: "Menkar", ra: 3.04, dec: 4.09, mag: 2.54, img: star3, type: "star" },
    { name: "Graffias", ra: 16.09, dec: -19.80, mag: 2.56, img: star3, type: "star" },
    { name: "Arneb", ra: 5.54, dec: -17.82, mag: 2.58, img: star3, type: "star" },
    { name: "Centauri Delta", ra: 12.14, dec: -50.71, mag: 2.58, img: star3, type: "star" },
    { name: "Zubeneschamali", ra: 15.28, dec: -9.38, mag: 2.61, img: star3, type: "star" },
    { name: "Sheratan", ra: 1.91, dec: 20.81, mag: 2.64, img: star3, type: "star" },
    { name: "Phact", ra: 5.66, dec: -34.07, mag: 2.65, img: star3, type: "star" },
    { name: "Ruchbah", ra: 1.43, dec: 60.24, mag: 2.66, img: star3, type: "star" },
    { name: "Lesath", ra: 17.51, dec: -37.30, mag: 2.70, img: star3, type: "star" },
    { name: "Kaus Media", ra: 18.35, dec: -29.83, mag: 2.72, img: star3, type: "star" },
    { name: "Tarazed", ra: 19.77, dec: 10.61, mag: 2.72, img: star3, type: "star" },
    { name: "Zubenelgenubi", ra: 14.85, dec: -16.04, mag: 2.75, img: star3, type: "star" },
    { name: "Delta Crucis", ra: 12.25, dec: -58.75, mag: 2.79, img: star3, type: "star" },
    { name: "Nihal", ra: 5.60, dec: -20.84, mag: 2.81, img: star3, type: "star" },
    { name: "Kaus Borealis", ra: 18.46, dec: -25.42, mag: 2.82, img: star3, type: "star" },
    { name: "Gomeisa", ra: 7.45, dec: 8.29, mag: 2.89, img: star3, type: "star" },
    { name: "Alniyat", ra: 16.84, dec: -28.22, mag: 2.89, img: star3, type: "star" },
    { name: "Sadalsuud", ra: 21.52, dec: -5.57, mag: 2.90, img: star3, type: "star" },
    { name: "Algorab", ra: 12.57, dec: -16.52, mag: 2.94, img: star3, type: "star" },
    { name: "Sadalmelik", ra: 22.09, dec: -0.32, mag: 2.95, img: star3, type: "star" },
    { name: "Skat", ra: 22.88, dec: -15.82, mag: 3.27, img: star3, type: "star" },
    { name: "Segin", ra: 1.90, dec: 63.67, mag: 3.35, img: star3, type: "star" },
    { name: "Epsilon Crucis", ra: 12.35, dec: -60.40, mag: 3.59, img: star3, type: "star" },
    { name: "Alshain", ra: 19.92, dec: 6.42, mag: 3.71, img: star3, type: "star" },
    { name: "Alrescha", ra: 2.03, dec: 2.76, mag: 3.82, img: star3, type: "star" },
    { name: "Mesarthim", ra: 1.89, dec: 19.30, mag: 3.88, img: star3, type: "star" },

    // --- STRUCTURAL FIXES ---
    { name: "Algieba", ra: 10.33, dec: 19.84, mag: 2.01, img: star3, type: "star" },
    { name: "Zosma", ra: 11.24, dec: 20.52, mag: 2.56, img: star3, type: "star" },
    { name: "Chertan", ra: 11.24, dec: 15.43, mag: 3.33, img: star3, type: "star" },
    { name: "Algenib", ra: 0.22, dec: 15.18, mag: 2.83, img: star3, type: "star" },
    { name: "Navi", ra: 0.94, dec: 60.72, mag: 2.47, img: star3, type: "star" },
    { name: "Wei", ra: 16.84, dec: -42.30, mag: 2.29, img: star3, type: "star" },
    { name: "Acrab", ra: 16.09, dec: -19.80, mag: 2.56, img: star3, type: "star" },
    { name: "Kraz", ra: 12.57, dec: -23.38, mag: 2.65, img: star3, type: "star" },
    { name: "Minkar", ra: 12.25, dec: -16.31, mag: 3.02, img: star3, type: "star" },
    { name: "Alchiba", ra: 12.13, dec: -24.73, mag: 4.02, img: star3, type: "star" },
    { name: "Grumium", ra: 17.50, dec: 52.30, mag: 3.73, img: star3, type: "star" },
    { name: "Rastaban", ra: 17.50, dec: 52.30, mag: 2.73, img: star3, type: "star" },
    { name: "Eta Carinae", ra: 10.75, dec: -59.68, mag: 4.30, img: star3, type: "star" },
    { name: "Kappa Velorum", ra: 9.37, dec: -55.01, mag: 2.47, img: star3, type: "star" }
];

const ambientStars = [];

// Kept intact solely to map metadata connections for the hover UI labels
const constellationMap = {
    Orion: { stars: ["Betelgeuse", "Bellatrix", "Rigel", "Saiph", "Mintaka", "Alnilam", "Alnitak"] },
    Crux: { stars: ["Acrux", "Mimosa", "Gacrux", "Delta Crucis", "Epsilon Crucis"] },
    Scorpius: { stars: ["Antares", "Graffias", "Dschubba", "Shaula", "Lesath", "Larawag", "Sargas", "Wei", "Acrab"] },
    Centaurus: { stars: ["Alpha Centauri", "Hadar", "Menkent", "Muhlifain", "Centauri Gamma", "Centauri Delta"] },
    Sagittarius: { stars: ["Kaus Australis", "Kaus Media", "Kaus Borealis", "Nunki"] },
    CanisMajor: { stars: ["Sirius", "Mirzam", "Wezen", "Aludra", "Adhara"] },
    Carina: {  stars: ["Canopus", "Avior", "Aspidiske", "Miaplacidus"] },
    Gemini: {  stars: ["Castor", "Pollux", "Alhena"] },
    UrsaMajor: {  stars: ["Dubhe", "Alioth", "Mizar", "Alkaid"] },
    Leo: {  stars: ["Regulus", "Denebola", "Algieba", "Zosma", "Chertan"] },
    Pegasus: {  stars: ["Markab", "Scheat", "Alpheratz", "Algenib"] },
    Cassiopeia: {  stars: ["Shedar", "Caph", "Ruchbah", "Segin", "Navi"] }
};

const starToConstellation = {};
for (const [name, data] of Object.entries(constellationMap)) {
    for (const star of data.stars) {
        starToConstellation[star] = name;
    }
}

function calculateBermaguiLST() {
    const now = new Date();
    const time = now.getTime();
    const julianDate = (time / 86400000) + 2440587.5;
    const D = julianDate - 2451545.0;

    let gmst = 18.697374558 + 24.06570982441908 * D;
    gmst = gmst % 24;
    if (gmst < 0) gmst += 24;

    let lst = gmst + (BERMAGUI_LON / 15);
    lst = lst % 24;
    if (lst < 0) lst += 24;

    return lst;
}

function getPlanetPositions() {
    const now = new Date();
    const daysSinceJ2000 = ((now.getTime() / 86400000) + 2440587.5) - 2451545.0;

    return [
        { name: "Venus", ra: ((18.1 + (daysSinceJ2000 * 0.015)) % 24), dec: -5.2, type: "planet", color: "#E3BB87" },
        { name: "Mars", ra: ((4.5 + (daysSinceJ2000 * 0.014)) % 24), dec: -12.4, type: "planet", color: "#E77D65" },
        { name: "Jupiter", ra: ((10.2 + (daysSinceJ2000 * 0.002)) % 24), dec: -21.1, type: "planet", color: "#D4A373" },
        { name: "Saturn", ra: ((22.8 + (daysSinceJ2000 * 0.0009)) % 24), dec: -15.8, type: "planet", color: "#F4E2BB" }
    ];
}

function generateAmbientStars() {
    ambientStars.length = 0;
    for (let i = 0; i < 3000; i++) {
        ambientStars.push({
            ra: Math.random() * 24,
            dec: -90 + Math.random() * 180,
            phase: Math.random() * Math.PI * 2,
            size: 1 + Math.random() * 1.5,
            baseAlpha: 0.25 + Math.random() * 0.35,
            sprite: false
        });
    }
    for (let i = 0; i < 250; i++) {
        ambientStars.push({
            ra: Math.random() * 24,
            dec: -90 + Math.random() * 180,
            phase: Math.random() * Math.PI * 2,
            size: 2 + Math.random() * 2,
            baseAlpha: 0.45 + Math.random() * 0.35,
            sprite: true
        });
    }
}

function astToXY(ra, dec, currentLST) {
    let deltaRA = ra - currentLST;
    if (deltaRA > 12) deltaRA -= 24;
    if (deltaRA < -12) deltaRA += 24;

    const x = centerX + (deltaRA / 12) * (width * 0.5);
    const y = centerY - (dec / 90) * (height * 0.4);

    return { x, y };
}

function drawSprite(img, x, y, alpha, scale = 1) {
    if (!img.complete) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const sw = img.width * scale;
    const sh = img.height * scale;
    ctx.drawImage(img, x - sw / 2, y - sh / 2, sw, sh);
    ctx.restore();
}

function render(time) {
    ctx.clearRect(0, 0, width, height);
    
    const nextInteractiveObjects = []; 
    const currentLST = calculateBermaguiLST();

    // 1. AMBIENT BACKGROUND FIELD
    for (const star of ambientStars) {
        const pos = astToXY(star.ra, star.dec, currentLST);
        const alpha = star.baseAlpha * (0.6 + Math.sin(time * 0.0012 + star.phase) * 0.4);

        if (star.sprite === true) { 
            drawSprite(star3, pos.x, pos.y, alpha, 0.6);
        } else {
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(Math.round(pos.x), Math.round(pos.y), 1, 1);
            ctx.restore();
        }
    }

    // [REMOVED drawConstellations(currentLST) FROM THE RENDERING LAYER]

    // 2. RENDER MAIN CATALOG STARS
    for (const star of starCatalog) {
        const pos = astToXY(star.ra, star.dec, currentLST);
        nextInteractiveObjects.push({ ...star, x: pos.x, y: pos.y });

        const twinkle = 0.8 + Math.sin(time * 0.002 + star.ra) * 0.2;
        let scale = 1;
        if (star.img === star9) scale = 1 + Math.sin(time * 0.001) * 0.12;

        drawSprite(star.img, pos.x, pos.y, twinkle, scale);
    }

    // 3. RENDER DYNAMIC PLANETS
    const planets = getPlanetPositions();
    for (const planet of planets) {
        const pos = astToXY(planet.ra, planet.dec, currentLST);
        nextInteractiveObjects.push({ ...planet, x: pos.x, y: pos.y });

        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = 1.0;
        ctx.fill();
        ctx.restore();
    }

    interactiveObjects = nextInteractiveObjects;

    // 4. DRAW ACTIVE HOVER HUD OVERLAYS (Extended Label Kept Intact)
    if (hoveredObject) {
        const liveHovered = interactiveObjects.find(o => o.name === hoveredObject.name);
        if (liveHovered) {
            ctx.save();
            ctx.font = "12px sans-serif";
            ctx.fillStyle = liveHovered.type === "planet" ? "#ffd700" : "#4dabf7";
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            
            ctx.beginPath();
            ctx.arc(liveHovered.x, liveHovered.y, 12, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillText(liveHovered.name.toUpperCase(), liveHovered.x + 16, liveHovered.y + 4);
            ctx.font = "11px sans-serif";
            ctx.fillStyle = "#868e96";
            ctx.fillText(
                `Type: ${liveHovered.type.charAt(0).toUpperCase() + liveHovered.type.slice(1)}`,
                liveHovered.x + 16,
                liveHovered.y + 18
            );

            const constellation = starToConstellation[liveHovered.name];
            if (constellation) {
                ctx.fillText(
                    `Constellation: ${constellation}`,
                    liveHovered.x + 16,
                    liveHovered.y + 32
                );
            }
            ctx.restore();
        }
    }

    requestAnimationFrame(render);
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener("mousemove", (e) => {
    const mouse = getMousePos(e);
    let found = null;
    for (const obj of interactiveObjects) {
        const dx = mouse.x - obj.x;
        const dy = mouse.y - obj.y;
        if (Math.sqrt(dx * dx + dy * dy) < 14) {
            found = obj;
            break;
        }
    }
    hoveredObject = found;
    canvas.style.cursor = found ? "pointer" : "default";
});

Promise.all([
    star3.decode().catch(() => {}),
    star5.decode().catch(() => {}),
    star9.decode().catch(() => {})
]).then(() => {
    resize();
    generateAmbientStars();
    requestAnimationFrame(render);
});