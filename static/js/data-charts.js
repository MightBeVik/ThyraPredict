// Data Visualization Script

document.addEventListener('DOMContentLoaded', function() {
    // Get data from page or use sample data
    const stats = window.stats || {};
    
    // Calculate gender distribution
    let genderData = {
        'F': 0,
        'M': 0
    };
    
    if (stats.gender_distribution) {
        genderData = stats.gender_distribution;
    }
    
    const totalGender = (genderData['F'] || 0) + (genderData['M'] || 0);
    const femalePercent = totalGender > 0 ? ((genderData['F'] || 0) / totalGender * 100).toFixed(1) : 0;
    const malePercent = totalGender > 0 ? ((genderData['M'] || 0) / totalGender * 100).toFixed(1) : 0;
    
    // Update gender stats display
    document.getElementById('femaleCount').textContent = genderData['F'] || '—';
    document.getElementById('femalePercent').textContent = femalePercent;
    document.getElementById('malePercent').textContent = malePercent;
    
    // Gender distribution stats
    const genderStatsHTML = `
        <p><strong>Female:</strong> ${genderData['F'] || 0} (${femalePercent}%)</p>
        <p><strong>Male:</strong> ${genderData['M'] || 0} (${malePercent}%)</p>
    `;
    const genderStatsElement = document.getElementById('genderStats');
    if (genderStatsElement) {
        genderStatsElement.innerHTML = genderStatsHTML;
    }
    
    // Age Distribution Chart
    if (document.getElementById('ageChart')) {
        const ageCtx = document.getElementById('ageChart').getContext('2d');
        new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: ['18-25', '26-35', '36-45', '46-55', '56-65', '66-75', '76+'],
                datasets: [{
                    label: 'Number of Patients',
                    data: [180, 420, 680, 1200, 2100, 2400, 1600],
                    backgroundColor: [
                        '#1abc9c',
                        '#16a085',
                        '#138d75',
                        '#0e6251',
                        '#117a65',
                        '#0d5345',
                        '#0a3d2a'
                    ],
                    borderColor: '#0a3d2a',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            font: { size: 12, weight: 'bold' }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { font: { size: 11 } },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: { font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // Gender Distribution Chart (Doughnut)
    if (document.getElementById('genderChart')) {
        const genderCtx = document.getElementById('genderChart').getContext('2d');
        new Chart(genderCtx, {
            type: 'doughnut',
            data: {
                labels: ['Female', 'Male'],
                datasets: [{
                    data: [
                        genderData['F'] || 7200,
                        genderData['M'] || 2700
                    ],
                    backgroundColor: [
                        '#1abc9c',
                        '#3498db'
                    ],
                    borderColor: '#fff',
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12, weight: 'bold' },
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    // TSH Distribution Chart
    if (document.getElementById('tshChart')) {
        const tshCtx = document.getElementById('tshChart').getContext('2d');
        new Chart(tshCtx, {
            type: 'line',
            data: {
                labels: ['<0.4', '0.4-1', '1-2', '2-4', '4-8', '8-15', '>15'],
                datasets: [{
                    label: 'TSH Level Distribution (mIU/L)',
                    data: [380, 1200, 2100, 3400, 1900, 850, 250],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#e74c3c',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { font: { size: 12, weight: 'bold' } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { font: { size: 11 } },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        ticks: { font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
    
    // Target/Diagnosis Distribution Chart
    if (document.getElementById('targetChart')) {
        const targetCtx = document.getElementById('targetChart').getContext('2d');
        const targetData = stats.target_distribution || {
            'negative': 4200,
            'hyperthyroid': 2847,
            'hypothyroid': 3156,
            'other': 0
        };
        
        // Calculate percentages
        const totalTarget = Object.values(targetData).reduce((a, b) => a + b, 0);
        const diagnosisLabels = [];
        const diagnosisValues = [];
        const diagnosisPercents = [];
        
        const diagnosisMap = {
            'negative': 'Healthy',
            'hypothyroid': 'Hypothyroid',
            'hyperthyroid': 'Hyperthyroid',
            '-': 'Undetermined',
            'other': 'Other'
        };
        
        for (let key in targetData) {
            if (targetData[key] > 0) {
                diagnosisLabels.push(diagnosisMap[key] || key);
                diagnosisValues.push(targetData[key]);
                diagnosisPercents.push(((targetData[key] / totalTarget) * 100).toFixed(1));
            }
        }
        
        // Update target stats
        let targetStatsHTML = '';
        diagnosisLabels.forEach((label, index) => {
            targetStatsHTML += `<p><strong>${label}:</strong> ${diagnosisValues[index]} (${diagnosisPercents[index]}%)</p>`;
        });
        const targetStatsElement = document.getElementById('targetStats');
        if (targetStatsElement) {
            targetStatsElement.innerHTML = targetStatsHTML;
        }
        
        new Chart(targetCtx, {
            type: 'bar',
            data: {
                labels: diagnosisLabels,
                datasets: [{
                    label: 'Number of Cases',
                    data: diagnosisValues,
                    backgroundColor: [
                        '#27ae60',  // Healthy - Green
                        '#f39c12',  // Hypothyroid - Orange
                        '#e74c3c',  // Hyperthyroid - Red
                        '#95a5a6'   // Other - Gray
                    ],
                    borderColor: [
                        '#229954',
                        '#d68910',
                        '#c0392b',
                        '#7f8c8d'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: true,
                        labels: { font: { size: 12, weight: 'bold' } }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: { font: { size: 11 } },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    y: {
                        ticks: { font: { size: 11 } },
                        grid: { display: false }
                    }
                }
            }
        });
    }
});
