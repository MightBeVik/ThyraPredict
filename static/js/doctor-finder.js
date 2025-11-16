// Doctor Finder - Canadian Endocrinologist Search

let map;
let service;
let markers = [];

function validateCanadianPostalCode(postal) {
    // Canadian postal code format: A1A 1A1
    const regex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
    return regex.test(postal.trim());
}

function searchEndocrinologists() {
    const postalCode = document.getElementById('postalCodeInput').value.trim();

    if (!postalCode) {
        alert('Please enter a postal code');
        return;
    }

    if (!validateCanadianPostalCode(postalCode)) {
        alert('Please enter a valid Canadian postal code (e.g., M5V 3A8)');
        return;
    }

    // Show loading state
    const mapContainer = document.getElementById('map');
    mapContainer.innerHTML = '<div style="padding: 2rem; text-align: center;"><p>🔍 Searching for endocrinologists near ' + postalCode + '...</p></div>';
    mapContainer.classList.add('active');

    // Convert postal code to coordinates using Google Geocoding API
    geocodePostalCode(postalCode);
}

function geocodePostalCode(postalCode) {
    // Create a geocoder instance
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ 
        address: postalCode + ', Canada',
        componentRestrictions: { country: 'ca' }
    }, function(results, status) {
        if (status === 'OK' && results.length > 0) {
            const location = results[0].geometry.location;
            const formattedAddress = results[0].formatted_address;
            
            findNearbyEndocrinologists(location, formattedAddress);
        } else {
            handleGeocodingError(status);
        }
    });
}

function findNearbyEndocrinologists(location, address) {
    // Initialize map
    const mapContainer = document.getElementById('map');
    map = new google.maps.Map(mapContainer, {
        zoom: 13,
        center: location,
        mapTypeControl: true,
        fullscreenControl: true
    });

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    // Create Places Service
    service = new google.maps.places.PlacesService(map);

    // Search for endocrinologists/endocrinology clinics
    const searchQueries = [
        'endocrinologist',
        'endocrinology clinic',
        'thyroid specialist',
        'diabetes and endocrinology'
    ];

    const allResults = [];
    let completedSearches = 0;

    searchQueries.forEach(query => {
        service.nearbySearch({
            location: location,
            radius: 5000, // 5km radius
            type: 'doctor',
            keyword: query
        }, (results, status) => {
            completedSearches++;

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                allResults.push(...results);
            }

            // When all searches are complete
            if (completedSearches === searchQueries.length) {
                displayResults(allResults, location, address);
            }
        });
    });
}

function displayResults(results, location, address) {
    // Remove duplicates by place_id
    const uniqueResults = [];
    const seenIds = new Set();

    results.forEach(place => {
        if (!seenIds.has(place.place_id)) {
            seenIds.add(place.place_id);
            uniqueResults.push(place);
        }
    });

    // Sort by rating (highest first)
    uniqueResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Take top 10 results
    const topResults = uniqueResults.slice(0, 10);

    if (topResults.length === 0) {
        document.getElementById('resultsContainer').style.display = 'block';
        document.getElementById('providersList').innerHTML = 
            '<p style="text-align: center; color: #7f8c8d; padding: 2rem;">No endocrinologists found in this area. Please try a nearby postal code or contact your local hospital for referrals.</p>';
        return;
    }

    // Display results
    const providersList = document.getElementById('providersList');
    providersList.innerHTML = '';
    document.getElementById('resultsContainer').style.display = 'block';
    document.getElementById('resultsTitle').textContent = `Found ${topResults.length} Endocrinologists near ${address}`;

    topResults.forEach((place, index) => {
        // Add marker to map
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            label: (index + 1).toString()
        });
        markers.push(marker);

        // Get more details
        service.getDetails({ placeId: place.place_id }, (details, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                const providerCard = createProviderCard(details, index + 1);
                providersList.appendChild(providerCard);
            }
        });
    });

    // Center map on search location
    map.setCenter(location);
}

function createProviderCard(place, index) {
    const card = document.createElement('div');
    card.className = 'provider-card';

    const name = document.createElement('div');
    name.className = 'provider-name';
    name.textContent = `${index}. ${place.name}`;

    const address = document.createElement('div');
    address.className = 'provider-address';
    address.textContent = place.formatted_address || 'Address not available';

    const phone = document.createElement('div');
    phone.className = 'provider-phone';
    phone.textContent = place.formatted_phone_number || place.international_phone_number || 'Phone not available';
    phone.style.cursor = 'pointer';
    if (place.formatted_phone_number || place.international_phone_number) {
        phone.style.color = 'var(--primary-color)';
    }

    const rating = document.createElement('div');
    rating.className = 'provider-rating';
    if (place.rating) {
        rating.textContent = `${place.rating.toFixed(1)} stars (${place.user_ratings_total || 0} reviews)`;
    } else {
        rating.textContent = 'No ratings yet';
        rating.style.opacity = '0.7';
    }

    const websiteBtn = document.createElement('a');
    websiteBtn.className = 'provider-website';
    if (place.website) {
        websiteBtn.href = place.website;
        websiteBtn.target = '_blank';
        websiteBtn.textContent = '🌐 Visit Website';
    } else if (place.url) {
        websiteBtn.href = place.url;
        websiteBtn.target = '_blank';
        websiteBtn.textContent = '🔗 View on Google Maps';
    } else {
        websiteBtn.style.display = 'none';
    }

    card.appendChild(name);
    card.appendChild(address);
    card.appendChild(phone);
    card.appendChild(rating);
    card.appendChild(websiteBtn);

    return card;
}

function handleGeocodingError(status) {
    const mapContainer = document.getElementById('map');
    mapContainer.classList.add('active');
    mapContainer.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #e74c3c;">
            <h3>❌ Could not find location</h3>
            <p>Please check your postal code and try again.</p>
            <p style="font-size: 0.9rem; margin-top: 1rem;">Error: ${status}</p>
        </div>
    `;
}
