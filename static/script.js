document.addEventListener('DOMContentLoaded', () => {
    const deleteBtn = document.getElementById('deleteBtn');
    const trashWrapper = document.getElementById('trashWrapper');
    const letters = document.querySelectorAll('.letter');
    
    // Prevent multiple clicks while animation is running
    let isAnimating = false;

    // Audio context for sound effects (Optional, adds to the "feel" of the video)
    // We'll generate a simple "pop" sound programmatically to avoid external assets.
    const playDropSound = () => {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.log("Audio context blocked or not supported.");
        }
    };

    deleteBtn.addEventListener('click', async () => {
        if (isAnimating) return;
        isAnimating = true;

        // 1. Open the lid
        trashWrapper.classList.add('lid-open');

        // 2. Wait a tiny bit for the lid to open before letters start flying
        await new Promise(resolve => setTimeout(resolve, 150));

        // 3. Animate letters flying into the trash
        for (let i = 0; i < letters.length; i++) {
            // Add flying class to current letter
            letters[i].classList.add('flying');

            // Trigger the impact shake on the trash can
            trashWrapper.classList.add('impact-shake');
            
            // Play the drop sound
            playDropSound();

            // Remove the shake class after it finishes so it can be re-triggered
            setTimeout(() => {
                trashWrapper.classList.remove('impact-shake');
            }, 150);

            // Wait before processing the next letter
            await new Promise(resolve => setTimeout(resolve, 120));
        }

        // 4. Wait a moment, then close the lid
        await new Promise(resolve => setTimeout(resolve, 300));
        trashWrapper.classList.remove('lid-open');

        // 5. Reset everything after the lid closes
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Reset letters to their original state
        letters.forEach(letter => {
            letter.classList.remove('flying');
        });
        
        isAnimating = false;
    });
});