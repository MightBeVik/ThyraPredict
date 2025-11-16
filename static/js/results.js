// Results page handler
document.addEventListener('DOMContentLoaded', function() {
    // Retrieve results from session storage
    const resultsJSON = sessionStorage.getItem('predictionResults');
    
    if (!resultsJSON) {
        // No results found, redirect to prediction form
        window.location.href = '/predict';
        return;
    }
    
    const results = JSON.parse(resultsJSON);
    displayResults(results);
});

function displayResults(results) {
    const resultsContent = document.getElementById('resultsContent');
    const recommendationsSection = document.getElementById('recommendationsSection');
    
    if (!resultsContent || !results.success) {
        resultsContent.innerHTML = '<p>Error loading results. Please try again.</p>';
        return;
    }
    
    const hyper = results.hyperthyroidism;
    const hypo = results.hypothyroidism;
    
    // Create risk cards HTML
    const riskCardsHTML = `
        <div class="risk-card ${getRiskColorClass(hyper.risk_level)}">
            <div class="risk-header">
                <h3>Hyperthyroidism Risk</h3>
                <span class="risk-badge">${hyper.risk_level}</span>
            </div>
            <div class="risk-score">
                <div class="score-value">${(hyper.risk_score * 100).toFixed(0)}%</div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${hyper.risk_score * 100}%; background: ${getRiskColor(hyper.risk_level)};"></div>
                </div>
            </div>
            <p class="risk-message">${hyper.message}</p>
        </div>

        <div class="risk-card ${getRiskColorClass(hypo.risk_level)}">
            <div class="risk-header">
                <h3>Hypothyroidism Risk</h3>
                <span class="risk-badge">${hypo.risk_level}</span>
            </div>
            <div class="risk-score">
                <div class="score-value">${(hypo.risk_score * 100).toFixed(0)}%</div>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${hypo.risk_score * 100}%; background: ${getRiskColor(hypo.risk_level)};"></div>
                </div>
            </div>
            <p class="risk-message">${hypo.message}</p>
        </div>
    `;
    
    resultsContent.innerHTML = riskCardsHTML;
    
    // Fill recommendations
    fillRecommendations(hyper, hypo);
    recommendationsSection.style.display = 'block';
    
    // Clear session storage after displaying
    // sessionStorage.removeItem('predictionResults');
}

function getRiskColor(level) {
    switch(level) {
        case 'LOW':
            return '#27ae60';
        case 'MEDIUM':
            return '#f39c12';
        case 'HIGH':
            return '#e74c3c';
        default:
            return '#3498db';
    }
}

function getRiskColorClass(level) {
    switch(level) {
        case 'LOW':
            return 'risk-low';
        case 'MEDIUM':
            return 'risk-medium';
        case 'HIGH':
            return 'risk-high';
        default:
            return '';
    }
}

function fillRecommendations(hyper, hypo) {
    // Supplement recommendations
    const supplementAdvice = document.getElementById('supplementAdvice');
    const supplementHTML = `
        <ul>
            <li><strong>Selenium:</strong> 200 mcg daily - Supports thyroid hormone production and may reduce inflammation</li>
            <li><strong>Vitamin D:</strong> 2000-4000 IU daily - Essential for thyroid function and immune health</li>
            <li><strong>Omega-3 Fatty Acids:</strong> 1000-2000 mg daily - Reduces inflammation and supports overall thyroid health</li>
            <li><strong>Zinc:</strong> 15-30 mg daily - Important for thyroid hormone conversion</li>
        </ul>
        <p class="small-text">Always consult with your healthcare provider before starting new supplements.</p>
    `;
    supplementAdvice.innerHTML = supplementHTML;
    
    // Dietary recommendations
    const dietaryAdvice = document.getElementById('dietaryAdvice');
    let dietaryHTML = '<div class="diet-section">';
    
    if (hyper.risk_level === 'HIGH' || hypo.risk_level === 'HIGH') {
        dietaryHTML += `
            <h4>Foods to Include</h4>
            <ul>
                <li>Seafood rich in iodine (salmon, tuna, seaweed)</li>
                <li>Brazil nuts for selenium content</li>
                <li>Leafy greens and colorful vegetables</li>
                <li>Lean proteins (chicken, turkey)</li>
                <li>Whole grains and legumes</li>
            </ul>
            
            <h4>Foods to Limit</h4>
            <ul>
                <li>Excessive soy products</li>
                <li>Processed foods high in sodium</li>
                <li>Refined sugars and carbohydrates</li>
                <li>Excessive caffeine</li>
            </ul>
        `;
    } else {
        dietaryHTML += `
            <ul>
                <li>Maintain a balanced diet with adequate protein</li>
                <li>Include iodine-rich foods in moderation</li>
                <li>Eat plenty of vegetables and fruits</li>
                <li>Stay hydrated with adequate water intake</li>
            </ul>
        `;
    }
    
    dietaryHTML += '</div>';
    dietaryAdvice.innerHTML = dietaryHTML;
    
    // Healthcare provider recommendations
    const providerAdvice = document.getElementById('providerAdvice');
    let providerHTML = '';
    
    if (hyper.risk_level === 'HIGH' || hypo.risk_level === 'HIGH') {
        providerHTML = `
            <p><strong>We strongly recommend consulting with an endocrinologist for comprehensive evaluation and treatment options.</strong></p>
            <ul>
                <li>Schedule an appointment with an endocrinologist as soon as possible</li>
                <li>Request comprehensive thyroid function tests (TSH, Free T3, Free T4, Thyroid Antibodies)</li>
                <li>Discuss your risk assessment results with your doctor</li>
                <li>Develop a personalized treatment plan if needed</li>
            </ul>
        `;
    } else {
        providerHTML = `
            <p>Consider scheduling a check-up with your primary care physician to discuss these results.</p>
            <ul>
                <li>Share this assessment with your healthcare provider</li>
                <li>Schedule routine thyroid screening as recommended by your doctor</li>
                <li>Maintain healthy lifestyle habits (exercise, stress management, adequate sleep)</li>
                <li>Re-assess thyroid health annually or as advised by your physician</li>
            </ul>
        `;
    }
    
    providerAdvice.innerHTML = providerHTML;
    
    // Show doctors section
    const doctorsSection = document.getElementById('doctorsSection');
    if (doctorsSection) {
        doctorsSection.style.display = 'block';
        // Initialize doctor finder
        initializeDoctorFinder();
    }
}

function initializeDoctorFinder() {
    const searchBtn = document.getElementById('searchBtn');
    const postalCodeInput = document.getElementById('postalCodeInput');
    
    if (searchBtn && postalCodeInput) {
        searchBtn.addEventListener('click', function() {
            const postalCode = postalCodeInput.value.trim().toUpperCase();
            if (validateCanadianPostalCode(postalCode)) {
                searchEndocrinologists(postalCode);
            } else {
                alert('Please enter a valid Canadian postal code (e.g., M5V 3A8)');
            }
        });
        
        postalCodeInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
}
