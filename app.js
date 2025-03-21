const API_KEY = '8e3f84fc'; 
const API_URL = 'https://www.omdbapi.com/';

let searchInput;
let moviesContainer;
let loadingIndicator;
let errorMessage;

function initApp() {
    const app = document.getElementById('app');
    
    const container = document.createElement('div');
    container.className = 'container';
    
    const header = document.createElement('header');
    header.className = 'header';
    
    const title = document.createElement('h1');
    title.textContent = 'Кінопошук';
    
    const subtitle = document.createElement('p');
    subtitle.textContent = 'Пошук фільмів та серіалів з усього світу';
    
    header.appendChild(title);
    header.appendChild(subtitle);
    
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Введіть назву фільму для пошуку...';
    searchInput.setAttribute('autocomplete', 'off');
    
    searchContainer.appendChild(searchInput);
    
    moviesContainer = document.createElement('div');
    moviesContainer.className = 'movies-container';
    
    loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.textContent = 'Завантаження...';
    loadingIndicator.style.display = 'none';
    
    errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none';
    
    container.appendChild(header);
    container.appendChild(searchContainer);
    container.appendChild(errorMessage);
    container.appendChild(loadingIndicator);
    container.appendChild(moviesContainer);
    
    const apiNotice = document.createElement('div');
    apiNotice.className = 'api-notice';
    apiNotice.innerHTML = 'Цей сайт використовує <a href="https://www.omdbapi.com/" target="_blank">OMDb API</a> для пошуку фільмів.';
    container.appendChild(apiNotice);
    
    app.appendChild(container);
    
    setupLiveSearch();
    
    showInitialMessage();
}

function setupLiveSearch() {
    let debounceTimer;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        
        clearTimeout(debounceTimer);
        
        hideError();
        
        if (query === '') {
            showInitialMessage();
            return;
        }
        
        debounceTimer = setTimeout(() => {
            loadingIndicator.style.display = 'block';
            searchMovies(query);
        }, 500); // 500мс затримка перед запитом
    });
}

async function searchMovies(query) {
    try {
        const url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        loadingIndicator.style.display = 'none';
        
        if (data.Response === 'True') {
            displayMovies(data.Search);
        } else {
            showError(data.Error || 'Не вдалося знайти фільми за вашим запитом.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        loadingIndicator.style.display = 'none';
        showError('Помилка при отриманні даних. Перевірте підключення до інтернету.');
    }
}

// Функція для відображення фільмів
function displayMovies(movies) {
    moviesContainer.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        
        let posterElement;
        if (movie.Poster !== 'N/A') {
            posterElement = document.createElement('img');
            posterElement.src = movie.Poster;
            posterElement.alt = `${movie.Title} постер`;
            posterElement.className = 'movie-poster';
            
            posterElement.onerror = function() {
                this.onerror = null;
                this.remove();
                const placeholderDiv = document.createElement('div');
                placeholderDiv.className = 'poster-placeholder';
                placeholderDiv.textContent = 'Зображення недоступне';
                movieCard.insertBefore(placeholderDiv, movieCard.firstChild);
            };
        } else {
            posterElement = document.createElement('div');
            posterElement.className = 'poster-placeholder';
            posterElement.textContent = 'Зображення недоступне';
        }
        
        const movieInfo = document.createElement('div');
        movieInfo.className = 'movie-info';
        
        const title = document.createElement('h3');
        title.className = 'movie-title';
        title.textContent = movie.Title;
        
        const year = document.createElement('p');
        year.className = 'movie-year';
        year.textContent = `Рік: ${movie.Year}`;
        
        const type = document.createElement('p');
        type.className = 'movie-type';
        type.textContent = `Тип: ${translateType(movie.Type)}`;
        
        movieInfo.appendChild(title);
        movieInfo.appendChild(year);
        movieInfo.appendChild(type);
        
        movieCard.appendChild(posterElement);
        movieCard.appendChild(movieInfo);
        
        moviesContainer.appendChild(movieCard);
    });
}

function translateType(type) {
    const types = {
        'movie': 'Фільм',
        'series': 'Серіал',
        'episode': 'Епізод',
        'game': 'Гра'
    };
    
    return types[type.toLowerCase()] || type;
}

function showInitialMessage() {
    moviesContainer.innerHTML = '';
    
    const initialMessage = document.createElement('div');
    initialMessage.className = 'no-results';
    initialMessage.textContent = 'Введіть назву фільму або серіалу у пошукове поле вище для початку пошуку.';
    
    moviesContainer.appendChild(initialMessage);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    moviesContainer.innerHTML = '';
}

function hideError() {
    errorMessage.style.display = 'none';
}

document.addEventListener('DOMContentLoaded', initApp); 
