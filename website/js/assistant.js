const clippyContainer = document.getElementById('clippy-container');
const bubble = document.getElementById('clippy-bubble');
const bubbleContent = document.getElementById('bubble-content');
const arrow = document.getElementById('reopen-arrow');

const fullIntroLines = [
    "Hello! Welcome to my website.",
    "This is more of my personal playground than anything else, and is not intended to be stable nor 'professional'.",
    "Where would you like to go next?"
];

// New typewriter lines explaining the technical design of the starmap
const starmapInfoLines = [
    "This starmap runs on a live mathematical engine rendering real-time celestial coordinates.",
    "It actively tracks major constellations, bright stars, and visible solar system planets as they cross the sky.",
    "What you see matches the exact overhead night sky above the Far South Coast of New South Wales, Australia."
];

const shortPrompt = "Where would you like to go next?";

// Added the Projects navigational button at the top of the action matrix
const buttonsHTML = `
    <div class="bubble-actions">
        <button onclick="handleNavigation('projects')">Projects</button>
        <button onclick="handleNavigation('cv')">Skills (WIP)</button>
        <button onclick="handleNavigation('interests')">Personal interests</button>
        <button onclick="handleNavigation('starmap_info')">Learn about the starmap</button>
        <button onclick="handleNavigation('starmap')">Back to Starmap</button>
    </div>
`;

/**
 * Parses and appends the action buttons with an isolated staggered CSS animation delay loop
 */
function injectStaggeredButtons() {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = buttonsHTML;
    
    const actionsWrapper = tempDiv.querySelector('.bubble-actions');
    const buttons = actionsWrapper.querySelectorAll('button');
    
    buttons.forEach((btn, index) => {
        btn.classList.add('animate-pop-in');
        btn.style.setProperty('--stagger-index', index);
    });

    bubbleContent.appendChild(actionsWrapper);
}

/**
 * Typewriter logic with proactive ghost-dimension precalculation
 */
async function typeWriter(lines, isShort = false) {
    // 1. Temporarily clear explicit inline dimensions to read natural sizing profiles
    if (bubble) {
        bubble.style.height = "auto";
        bubble.style.minHeight = "auto";
    }
    
    // Ensure the container bypasses any hardcoded HTML visibility restrictions
    if (bubbleContent) {
        bubbleContent.style.visibility = "visible";
    }
    bubbleContent.innerHTML = "";
    
    if (isShort) {
        if (clippyContainer) clippyContainer.classList.add("minimized");
        bubbleContent.innerHTML = `<p>${lines}</p>`;
        injectStaggeredButtons();
        
        // Lock container to the short menu size with a tiny protective padding buffer
        if (bubble) {
            const finalHeight = bubble.offsetHeight + 10;
            bubble.style.height = `${finalHeight}px`;
        }
    } else {
        if (clippyContainer) clippyContainer.classList.remove("minimized");

        // 2. GHOST PASS: Hard-render the complete final target elements instantly
        lines.forEach(line => {
            let p = document.createElement('p');
            p.innerHTML = line;
            bubbleContent.appendChild(p);
        });
        injectStaggeredButtons();

        // 3. Measure layout requirements and inject a height buffer to prevent layout cutoff
        let finalHeight = 0;
        if (bubble) {
            // Added an explicit 30px buffer to correct the "too short" structural clipping
            finalHeight = bubble.offsetHeight + 30;
            
            // Freeze the box dimension settings before dropping characters back out
            bubble.style.height = `${finalHeight}px`;
            bubble.style.minHeight = `${finalHeight}px`;
            
            // Force browser layout engine reflow calculation
            void bubble.offsetHeight;
        }

        // 4. Wipe content out now that container limits are securely frozen
        bubbleContent.innerHTML = "";

        // 5. Execute typing sequence natively inside the stabilized layout box
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let p = document.createElement('p');
            bubbleContent.appendChild(p);
            
            for (let char of line) {
                p.innerHTML += char;
                await new Promise(r => setTimeout(r, 15));
            }
            await new Promise(r => setTimeout(r, 500));
        }
        injectStaggeredButtons();
    }
}

/**
 * Handles Fade In/Out logic
 */
function showPage(pageId) {
    const pages = document.querySelectorAll('.page-container');
    const activePage = document.querySelector('.page-container.active');

    if (activePage) {
        activePage.classList.remove('active');
        setTimeout(() => {
            pages.forEach(p => p.style.display = 'none');
            const target = document.getElementById(pageId);
            if (target) {
                target.style.display = 'block';
                setTimeout(() => target.classList.add('active'), 50);
            }
        }, 500);
    } else {
        const target = document.getElementById(pageId);
        if (target) {
            target.style.display = 'block';
            setTimeout(() => target.classList.add('active'), 50);
        }
    }
}

function closeBubble() {
    bubble.style.display = 'none';
    arrow.style.display = 'block';
}

function reopenBubble() {
    bubble.style.display = 'block';
    arrow.style.display = 'none';
    typeWriter(shortPrompt, true);
}

/**
 * Navigation handler updated for dynamic switching and automatic closing
 */
function handleNavigation(destination) {
    // Keep container active to let typewriter elements render cleanly
    if (clippyContainer && destination !== 'starmap_info') {
        clippyContainer.classList.add("minimized");
    }

    // Routed destination target directly handling your new projects module container 
    if (destination === 'projects') {
        bubble.style.display = 'none';
        arrow.style.display = 'block';
        showPage('projects-page');
    } else if (destination === 'interests') {
        bubble.style.display = 'none';
        arrow.style.display = 'block';
        showPage('interests-page');
    } else if (destination === 'cv') {
        bubble.style.display = 'none';
        arrow.style.display = 'block';
        showPage('cv-page');
    } else if (destination === 'starmap_info') {
        // Clear any active pages so the background defaults to just the naked starmap canvas
        document.querySelectorAll('.page-container').forEach(p => {
            p.classList.remove('active');
            p.style.display = 'none';
        });
        // Run the text sequence inside the bubble, then re-render the button menu automatically
        typeWriter(starmapInfoLines, false);
    } else if (destination === 'starmap') {
        // Instantly hide the text bubble and show the reopen arrow
        bubble.style.display = 'none';
        arrow.style.display = 'block';

        // Clean up any lingering active page views in the background
        document.querySelectorAll('.page-container').forEach(p => p.classList.remove('active'));
        setTimeout(() => {
            document.querySelectorAll('.page-container').forEach(p => p.style.display = 'none');
            // Quietly reset the typewriter content to the short prompt so it's ready for the next click
            bubbleContent.innerHTML = "";
            let p = document.createElement('p');
            p.textContent = shortPrompt;
            bubbleContent.appendChild(p);
            injectStaggeredButtons();
        }, 500);
    }
}

window.addEventListener('load', () => {
    // Dismiss the preloader overlay element when assets finish fetching
    const loader = document.getElementById('site-loader');
    if (loader) {
        loader.classList.add('loaded');
    }

    if (!sessionStorage.getItem('introPlayed')) {
        typeWriter(fullIntroLines, false);
        sessionStorage.setItem('introPlayed', 'true');
    } else {
        reopenBubble();
    }
});