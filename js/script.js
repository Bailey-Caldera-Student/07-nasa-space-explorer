// Find the date picker inputs, gallery area, and modal elements on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');
const gallery = document.getElementById('gallery');
const getImagesButton = document.querySelector('button');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
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
        if (data.media_type === 'image') {
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

// Display the fetched images in cards with title and date
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

    card.innerHTML = `
      <img src="${image.url}" alt="${image.title}" />
      <h3>${image.title}</h3>
      <p>${formattedDate}</p>
    `;

    card.addEventListener('click', () => {
      showDetails(image);
    });

    gallery.appendChild(card);
  });
}

// Show a modal with the selected image's full details
function showDetails(image) {
  const formattedDate = formatDisplayDate(image.date);

  modalImage.src = image.url;
  modalImage.alt = image.title;
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
