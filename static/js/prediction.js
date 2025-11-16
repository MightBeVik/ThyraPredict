// Prediction form handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('predictionForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const age = document.getElementById('age').value;
            const tsh = document.getElementById('tsh').value;
            const t3 = document.getElementById('t3').value;
            const t4 = document.getElementById('t4').value;
            const antibodies = document.getElementById('antibodies').value;
            
            // Show loading spinner
            if (loadingSpinner) {
                form.style.display = 'none';
                loadingSpinner.style.display = 'block';
            }
            
            try {
                // Send data to backend
                const response = await fetch('/api/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        age: parseFloat(age),
                        tsh: parseFloat(tsh),
                        t3: parseFloat(t3),
                        t4: parseFloat(t4),
                        thyroid_antibodies: parseFloat(antibodies)
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Store results in session storage and redirect
                    sessionStorage.setItem('predictionResults', JSON.stringify(data));
                    // Redirect to results page
                    window.location.href = '/results';
                } else {
                    alert('Error: ' + data.error);
                    if (loadingSpinner) {
                        form.style.display = 'block';
                        loadingSpinner.style.display = 'none';
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
                if (loadingSpinner) {
                    form.style.display = 'block';
                    loadingSpinner.style.display = 'none';
                }
            }
        });
    }
});
