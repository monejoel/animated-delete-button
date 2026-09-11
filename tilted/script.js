document.addEventListener('DOMContentLoaded', () => {
    const deleteBtn = document.getElementById('deleteBtn');
    const trashWrapper = document.getElementById('trashWrapper');
    const letters = document.querySelectorAll('.letter');
    
    let isAnimating = false;

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
            // Ignore audio errors
        }
    };

    deleteBtn.addEventListener('click', async () => {
        if (isAnimating) return;
        isAnimating = true;

        // 1. Tilt the trash can to the right
        trashWrapper.classList.add('tilted');

        // 2. Wait for the tilt transition to finish (400ms matches CSS)
        await new Promise(resolve => setTimeout(resolve, 400));

        // 3. Open the lid
        trashWrapper.classList.add('lid-open');
        await new Promise(resolve => setTimeout(resolve, 150));

        // 4. Animate letters flying into the trash
        for (let i = 0; i < letters.length; i++) {
            letters[i].classList.add('flying');

            // Trigger impact shake (which now accounts for the tilted state)
            trashWrapper.classList.add('impact-shake');
            playDropSound();

            setTimeout(() => {
                trashWrapper.classList.remove('impact-shake');
            }, 150);

            await new Promise(resolve => setTimeout(resolve, 120));
        }

        // 5. Close the lid
        await new Promise(resolve => setTimeout(resolve, 300));
        trashWrapper.classList.remove('lid-open');

        // 6. Wait, then un-tilt the trash can
        await new Promise(resolve => setTimeout(resolve, 300));
        trashWrapper.classList.remove('tilted');

        // 7. Reset letters
        await new Promise(resolve => setTimeout(resolve, 400));
        letters.forEach(letter => {
            letter.classList.remove('flying');
        });
        
        isAnimating = false;
    });
});