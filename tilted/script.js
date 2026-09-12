document.addEventListener('DOMContentLoaded', () => {
    const deleteBtn    = document.getElementById('deleteBtn');
    const trashWrapper = document.getElementById('trashWrapper');
    const letters      = document.querySelectorAll('.letter');

    let isAnimating = false;
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /* ---------- Shared AudioContext (reused for all sounds) ---------- */
    let audioCtx = null;
    const getAudioCtx = () => {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            audioCtx = new Ctx();
        }
        // Browsers suspend audio until user gesture — resume if needed
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return audioCtx;
    };

    /* ---------- Drop sound (short "plop" for each letter) ---------- */
    const playDropSound = () => {
        try {
            const ctx = getAudioCtx();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) { /* ignore */ }
    };

    /* ---------- Success chime (plays when button becomes circular) ---------- */
    const playSuccessSound = () => {
        try {
            const ctx = getAudioCtx();
            if (!ctx) return;

            const now = ctx.currentTime;

            /* Two-note chime: C5 → E5 (a bright major third) */
            const notes = [
                { freq: 523.25, start: 0.00, dur: 0.25, vol: 0.18 }, // C5
                { freq: 659.25, start: 0.14, dur: 0.55, vol: 0.22 }  // E5
            ];

            notes.forEach(({ freq, start, dur, vol }) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                // Use a triangle wave for a softer, warmer tone
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + start);

                // ADSR-ish envelope
                gain.gain.setValueAtTime(0.0001, now + start);
                gain.gain.exponentialRampToValueAtTime(vol, now + start + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + start);
                osc.stop(now + start + dur + 0.05);
            });

            /* ---------- Subtle shimmer layer (high bell-like overtone) ---------- */
            const shimmer = ctx.createOscillator();
            const shimmerGain = ctx.createGain();
            shimmer.type = 'sine';
            shimmer.frequency.setValueAtTime(1318.51, now + 0.18); // E6
            shimmerGain.gain.setValueAtTime(0.0001, now + 0.18);
            shimmerGain.gain.exponentialRampToValueAtTime(0.08, now + 0.22);
            shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
            shimmer.connect(shimmerGain);
            shimmerGain.connect(ctx.destination);
            shimmer.start(now + 0.18);
            shimmer.stop(now + 0.90);
        } catch (e) { /* ignore */ }
    };

    /* ---------- Main click sequence ---------- */
    deleteBtn.addEventListener('click', async () => {
        if (isAnimating) return;
        isAnimating = true;

        // Kick off the AudioContext on user gesture so it's ready
        getAudioCtx();

        /* PHASE 1: Tilt + open lid */
        trashWrapper.classList.add('tilted');
        await wait(400);

        trashWrapper.classList.add('lid-open');
        await wait(150);

        /* PHASE 2: Letters fly into the trash */
        for (let i = 0; i < letters.length; i++) {
            letters[i].classList.add('flying');
            trashWrapper.classList.add('impact-shake');
            playDropSound();
            setTimeout(() => trashWrapper.classList.remove('impact-shake'), 150);
            await wait(120);
        }

        /* PHASE 3: Close lid */
        await wait(300);
        trashWrapper.classList.remove('lid-open');
        await wait(300);
        trashWrapper.classList.remove('tilted');

        /* PHASE 4: Morph to circle  ← 🎵 SUCCESS SOUND HERE */
        await wait(200);
        deleteBtn.classList.add('is-circle');
        playSuccessSound();   // <-- fires exactly as the morph begins

        /* PHASE 5: Pulse + rotating rings */
        await wait(400);
        deleteBtn.classList.add('is-pulsing');
        deleteBtn.classList.add('ring-active');
        await wait(2800);

        /* PHASE 6: Ring leaves, pulse stops */
        deleteBtn.classList.remove('ring-active');
        await wait(350);
        deleteBtn.classList.remove('is-pulsing');
        await wait(300);

        /* PHASE 7: Return to pill shape */
        deleteBtn.classList.remove('is-circle');

        /* PHASE 8: Reset letters */
        await wait(600);
        letters.forEach(letter => letter.classList.remove('flying'));

        isAnimating = false;
    });
});