document.addEventListener("DOMContentLoaded", () => {
    // Core HTML Element Mappings
    const audio = document.getElementById("native-audio-engine");
    const playToggleBtn = document.getElementById("btn-play-toggle");
    const prevBtn = document.getElementById("btn-prev");
    const nextBtn = document.getElementById("btn-next");
    const trackTitleDisplay = document.getElementById("track-title");
    const trackArtistDisplay = document.getElementById("track-artist");
    const vinylIcon = document.getElementById("player-vinyl");
    const playlistTracks = document.querySelectorAll(".playlist-track");
    
    // Canvas Node Reference for Real Frequency Rendering
    const canvas = document.getElementById("visualizer-canvas");
    const canvasCtx = canvas ? canvas.getContext("2d") : null;

    // Audio Engine State Variables
    let currentTrackIndex = 0;
    let audioCtx = null;
    let analyser = null;
    let dataArray = null;
    let bufferLength = 0;
    let animationId = null;

    /**
     * Updates playlist UI rows and loads the active mp3 track source
     * @param {number} index - Index of target track in DOM nodes
     */
    function loadTrack(index) {
        if (!playlistTracks.length) return;
        
        // Remove active state classes across all playlist rows
        playlistTracks.forEach(t => t.classList.remove("active-track-row"));
        
        const targetRow = playlistTracks[index];
        targetRow.classList.add("active-track-row");

        // Hydrate audio engine and meta UI fields
        audio.src = targetRow.getAttribute("data-src");
        trackTitleDisplay.textContent = targetRow.getAttribute("data-title");
        trackArtistDisplay.textContent = targetRow.getAttribute("data-artist");
        
        currentTrackIndex = index;
    }

    /**
     * Initializes the Web Audio API WebGraph on the first intentional play gesture.
     * Prevents cross-domain media element security disruptions.
     */
    function initVisualizerEngine() {
        if (audioCtx || !canvasCtx) return; // Node structure already instantiated or missing target canvas

        // Instantiating modern audio context mapping
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        
        // Connect the HTML5 media engine directly into the routing node system
        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);

        // Configure Fast Fourier Transform size (Lower settings yield distinct, chunkier brutalist bars)
        analyser.fftSize = 64; 
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        // Kick off the drawing refresh matrix loop
        renderFrequencyBars();
    }

    /**
     * Frame-by-frame rendering engine for updating frequency visuals on the canvas
     */
    function renderFrequencyBars() {
        animationId = requestAnimationFrame(renderFrequencyBars);
        analyser.getByteFrequencyData(dataArray);

        // Dynamically recalculate internal resolution to perfectly mirror CSS sizing boundaries
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        // Wipe the canvas clear with solid black base color fill
        canvasCtx.fillStyle = "#000000";
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

        // Layout calculation rules for drawing chunky bars
        const barWidth = (canvas.width / bufferLength) * 1.4;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 1.8;

            // Paint brutalist neon matrix-green bars matching card identity systems
            canvasCtx.fillStyle = "#00ff66";
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

            x += barWidth;
        }
    }

    /**
     * Toggles playback states while unlocking underlying context restrictions
     */
    function togglePlayback() {
        // Safe check for browser gesture suspension locks
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        } else {
            initVisualizerEngine();
        }

        if (audio.paused) {
            audio.play()
                .then(() => {
                    playToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
                    if (vinylIcon) vinylIcon.classList.add("vinyl-spinning");
                })
                .catch(err => console.warn("Media streaming exception caught: ", err));
        } else {
            audio.pause();
            playToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i> PLAY';
            if (vinylIcon) vinylIcon.classList.remove("vinyl-spinning");
        }
    }

    // --- Core Interaction Listeners ---
    if (playToggleBtn) {
        playToggleBtn.addEventListener("click", togglePlayback);
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            let target = currentTrackIndex - 1;
            if (target < 0) target = playlistTracks.length - 1;
            loadTrack(target);
            audio.play().then(() => {
                playToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
                if (vinylIcon) vinylIcon.classList.add("vinyl-spinning");
            });
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            let target = currentTrackIndex + 1;
            if (target >= playlistTracks.length) target = 0;
            loadTrack(target);
            audio.play().then(() => {
                playToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
                if (vinylIcon) vinylIcon.classList.add("vinyl-spinning");
            });
        });
    }

    // Bind individual row entry clicking to instantly pivot target track indices
    playlistTracks.forEach((trackLine, idx) => {
        trackLine.addEventListener("click", () => {
            if (!audioCtx) initVisualizerEngine();
            loadTrack(idx);
            audio.play().then(() => {
                playToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
                if (vinylIcon) vinylIcon.classList.add("vinyl-spinning");
            });
        });
    });

    // Auto routing hook: jump cleanly to next item in order upon index boundary termination
    if (audio) {
        audio.addEventListener("ended", () => {
            let target = currentTrackIndex + 1;
            if (target >= playlistTracks.length) target = 0;
            loadTrack(target);
            audio.play();
        });
    }

    // Hydrate layout configuration immediately with target song 01 on initialization boot
    loadTrack(0);
});
