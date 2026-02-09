// slider
// slider.css is required
document.addEventListener('DOMContentLoaded', () => {
    // Element selection
    const sliderContainer = document.querySelector('.hld__sliders');
    const slides = document.querySelectorAll('.hld__slider');
    const dotsContainer = document.getElementById('dots-container');

    // Safety check
    // If elements are missing in the HTML, stop execution to prevent errors.
    if (!sliderContainer || !dotsContainer || slides.length === 0) {
        return; 
    }

    // State variables
    let currentIndex = 0;
    const slideSpeed = 10000; // 10 seconds
    let slideInterval;

    // Create dynamic dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        
        // Create the inner span programmatically
        const span = document.createElement('span');
        dot.appendChild(span);
        
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    // Select the newly created dots
    const dots = document.querySelectorAll('.dot');

    // Main update function
    function updateSlider() {
        // Move the slider container
        sliderContainer.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update dot states and progress bars
        dots.forEach((dot, index) => {
            const progress = dot.querySelector('span');
            
            if (index === currentIndex) {
                dot.classList.add('active');
                
                // Reset styles to ensure a clean start
                progress.style.transition = 'none';
                progress.style.width = '0%';
                
                void progress.offsetWidth; 

                // Start animation
                progress.style.transition = `width ${slideSpeed}ms linear`;
                progress.style.width = '100%';
            } else {
                dot.classList.remove('active');
                // Reset inactive dots
                progress.style.transition = 'none';
                progress.style.width = '0%';
            }
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
    }

    function goToSlide(index) {
        if (currentIndex === index) return;
        currentIndex = index;
        updateSlider();
        // Reset the timer so the user has time to view the chosen slide
        startAutoPlay();
    }

    function startAutoPlay() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, slideSpeed);
    }

    // Initialize
    updateSlider();
    startAutoPlay();
});