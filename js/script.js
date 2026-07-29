// Find the date picker inputs, gallery area, and modal elements on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const getImagesButton = document.querySelector('button');
const modal = document.getElementById('modal');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const closeModalButton = document.querySelector('.modal-close');

// Replace this placeholder with your real NASA API key later
const apiKey = 'RtoV9ryQ0QHa6vjQsXQOEjaaxVlJzeqFEYsqNp4H';
const apiUrl = 'https://api.nasa.gov/planetary/apod';

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// When the button is clicked, fetch APOD images for the chosen range
getImagesButton.addEventListener('click', () => {
  const startDate = startInput.value;
  const endDate = endInput.value;

  if (!startDate || !endDate) {
    gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>Please choose a valid date range.</p></div>';
    return;
  }

  gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🚀</div><p>Loading space images...</p></div>';

  const dates = getDateRange(startDate, endDate);
  const fetchRequests = dates.map((date) => {
    return fetch(`${apiUrl}?api_key=${apiKey}&date=${date}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Unable to fetch image data');
        }
        return response.json();
      })
      .then((data) => {
        if (data.media_type === 'image' || data.media_type === 'video') {
          return data;
        }
        return null;
      });
  });

  Promise.all(fetchRequests)
    .then((results) => {
      const images = results.filter((image) => image !== null);
      renderGallery(images);
    })
    .catch(() => {
      gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">⚠️</div><p>Sorry, we could not load the images right now.</p></div>';
    });
});

// Create an array of every date in the selected range
function getDateRange(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let currentDate = new Date(start);

  while (currentDate <= end) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

// Format a date like 2024-07-29 into July 29, 2024
function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Display the fetched media in cards with title and date
function renderGallery(images) {
  if (images.length === 0) {
    gallery.innerHTML = '<div class="placeholder"><div class="placeholder-icon">🔭</div><p>No images found for this date range.</p></div>';
    return;
  }

  gallery.innerHTML = '';

  images.forEach((image) => {
    const card = document.createElement('article');
    card.className = 'gallery-item';
    const formattedDate = formatDisplayDate(image.date);
    const mediaContent = createMediaPreview(image);

    card.innerHTML = `
      ${mediaContent}
      <h3>${image.title}</h3>
      <p>${formattedDate}</p>
    `;

    card.addEventListener('click', () => {
      showDetails(image);
    });

    gallery.appendChild(card);
  });
}

function createMediaPreview(image) {
  if (image.media_type === 'video') {
    const workingVideoUrl = getWorkingVideoUrl(image.url);

    if (isYouTubeUrl(image.url)) {
      return `
        <div class="media-preview">
          <a href="${workingVideoUrl}" target="_blank" rel="noopener noreferrer">Watch video</a>
        </div>
      `;
    }

    return `
      <div class="media-preview">
        <video controls src="${image.url}" class="media-element"></video>
      </div>
    `;
  }

  return `<img src="${image.url}" alt="${image.title}" />`;
}

function getWorkingVideoUrl(videoUrl) {
  if (!videoUrl) {
    return '';
  }

  if (videoUrl.includes('youtube.com/watch?v=')) {
    return videoUrl;
  }

  if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : videoUrl;
  }

  if (videoUrl.includes('/embed/')) {
    const videoId = videoUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/)?.[1];
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : videoUrl;
  }

  return videoUrl;
}

function isYouTubeUrl(videoUrl) {
  return videoUrl.includes('youtube') || videoUrl.includes('youtu.be');
}

function getVideoEmbedHtml(videoUrl) {
  const videoIdMatch = videoUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  const shortVideoIdMatch = videoUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const embedVideoIdMatch = videoUrl.match(/\/embed\/([a-zA-Z0-9_-]+)/);

  let videoId = '';

  if (videoIdMatch) {
    videoId = videoIdMatch[1];
  } else if (shortVideoIdMatch) {
    videoId = shortVideoIdMatch[1];
  } else if (embedVideoIdMatch) {
    videoId = embedVideoIdMatch[1];
  }

  if (videoId) {
    return `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0" title="NASA video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }

  return `<video controls src="${videoUrl}" class="media-element"></video>`;
}

// Show a modal with the selected media's full details
function showDetails(image) {
  const formattedDate = formatDisplayDate(image.date);

  if (image.media_type === 'video') {
    if (isYouTubeUrl(image.url)) {
      modalMedia.innerHTML = getVideoEmbedHtml(image.url);
    } else {
      modalMedia.innerHTML = `<video controls src="${image.url}" class="media-element"></video>`;
    }
  } else {
    modalMedia.innerHTML = `<img src="${image.url}" alt="${image.title}" class="modal-image" />`;
  }

  modalTitle.textContent = image.title;
  modalDate.innerHTML = `<strong>Date:</strong> ${formattedDate}`;
  modalExplanation.textContent = image.explanation;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

closeModalButton.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
});

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
});
