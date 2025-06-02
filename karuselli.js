
  const track = document.querySelector('.sk-posts-masonry');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  const cardWidth = 360 + 30; // kortin leveys + marginaali
  const cardsVisible = 3;
  const items = document.querySelectorAll('.sk-post-item');
  const totalCards = items.length;

  let currentIndex = 0;

  const updateButtons = () => {
    // Näytä/PIILOTA napit
    prevBtn.style.display = currentIndex === 0 ? 'none' : 'inline-block';
    const maxIndex = Math.floor((totalCards - 1) / cardsVisible);
    nextBtn.style.display = currentIndex >= maxIndex ? 'none' : 'inline-block';
  };

  const moveCarousel = () => {
    track.style.transform = `translateX(-${currentIndex * cardWidth * cardsVisible}px)`;
    updateButtons();
  };

  nextBtn.addEventListener('click', () => {
    const maxIndex = Math.floor((totalCards - 1) / cardsVisible);
    if (currentIndex < maxIndex) {
      currentIndex++;
      moveCarousel();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      moveCarousel();
    }
  });

  // Alussa nappien tila oikein
  updateButtons();

