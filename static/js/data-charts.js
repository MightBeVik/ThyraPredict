// Data Visualization Script

document.addEventListener('DOMContentLoaded', function() {
    // Get data from page or use sample data
    const stats = window.stats || {};
    
    // Calculate gender distribution (0 = Female, 1 = Male in dataset)
    let genderData = {
        'F': 0,
        'M': 0
    };
    
    if (stats.gender_distribution) {
        genderData = stats.gender_distribution;
    }
    
    const femaleCount = genderData['F'] || 0;
    const maleCount = genderData['M'] || 0;
    const totalGender = femaleCount + maleCount;
    const femalePercent = totalGender > 0 ? ((femaleCount / totalGender) * 100).toFixed(1) : 0;
    const malePercent = totalGender > 0 ? ((maleCount / totalGender) * 100).toFixed(1) : 0;
    
    // Update gender stats display
    document.getElementById('femaleCount').textContent = femaleCount.toLocaleString();
    document.getElementById('femalePercent').textContent = femalePercent;
    document.getElementById('malePercent').textContent = malePercent;
    
    // Gender distribution stats
    const genderStatsHTML = `
        <p><strong>Female:</strong> ${femaleCount.toLocaleString()} (${femalePercent}%)</p>
        <p><strong>Male:</strong> ${maleCount.toLocaleString()} (${malePercent}%)</p>
    `;
    const genderStatsElement = document.getElementById('genderStats');
    if (genderStatsElement) {
        genderStatsElement.innerHTML = genderStatsHTML;
    }
    
    // Age Distribution Chart
    if (document.getElementById('ageChart')) {
        const ageCtx = document.getElementById('ageChart').getContext('2d');
        
        // Use age distribution from backend if available
        let ageData = stats.age_distribution || {};
        
        // Expected age bins
        const ageBins = ['18-25', '26-35', '36-45', '46-55', '56-65', '66-75', '76-85', '86-95', '96-100'];
        const ageValues = ageBins.map(bin => {
            const value = ageData[bin];
            return typeof value === 'number' ? value : (parseInt(value) || 0);
        });
        
        // Log for debugging
        console.log('Age distribution data:', ageData);
        console.log('Age bins:', ageBins);
        console.log('Age values:', ageValues);
        
        new Chart(ageCtx, {
            type: 'bar',
            data: {
                labels: ageBins,
                datasets: [{
                    label: 'Number of Patients',
                    data: ageValues,
                    backgroundColor: [
                        '#1abc9c',
                        '#16a085',
                        '#138d75',
                        '#0e6251',
                        '#117a65',
                        '#0d5345',
                        '#0a3d2a',
                        '#073420',
                        '#051f17'
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
        
        // Diagnosis code mappings from backend
        const diagnosisCodeMap = {
            'A': 'Hyperthyroid', 'B': 'T3 Toxic', 'C': 'Toxic Goitre', 'D': 'Secondary Toxic',
            'E': 'Hypothyroid', 'F': 'Primary Hypothyroid', 'G': 'Compensated Hypothyroid', 'H': 'Secondary Hypothyroid',
            'I': 'Increased Binding Protein', 'J': 'Decreased Binding Protein',
            'K': 'Concurrent Illness',
            'L': 'Replacement Therapy', 'M': 'Underreplaced', 'N': 'Overreplaced',
            'O': 'Antithyroid Drugs', 'P': 'I131 Treatment', 'Q': 'Surgery',
            'R': 'Discordant Results', 'S': 'Elevated TBG', 'T': 'Elevated Thyroid Hormones',
            '-': 'Healthy'
        };
        
        // Use diagnosis categories from backend
        let diagnosisData = stats.diagnosis_categories || {};
        
        // If we have raw target distribution but not categories, parse it
        if (Object.keys(diagnosisData).length === 0 && stats.target_distribution) {
            const targetData = stats.target_distribution;
            
            for (let target in targetData) {
                if (targetData[target] > 0) {
                    // Remove pipe character and get first code
                    const cleanTarget = String(target).replace('|', '');
                    const primaryCode = cleanTarget[0] || '-';
                    
                    let category;
                    if (primaryCode === '-') {
                        category = 'Healthy';
                    } else if (['A', 'B', 'C', 'D'].includes(primaryCode)) {
                        category = 'Hyperthyroid';
                    } else if (['E', 'F', 'G', 'H'].includes(primaryCode)) {
                        category = 'Hypothyroid';
                    } else {
                        category = diagnosisCodeMap[primaryCode] || primaryCode;
                    }
                    
                    if (!diagnosisData[category]) {
                        diagnosisData[category] = 0;
                    }
                    diagnosisData[category] += targetData[target];
                }
            }
        }
        
        // Prepare chart data
        const diagnosisLabels = Object.keys(diagnosisData).sort();
        const diagnosisValues = diagnosisLabels.map(label => diagnosisData[label]);
        const totalDiagnosis = diagnosisValues.reduce((a, b) => a + b, 0);
        const diagnosisPercents = diagnosisValues.map(val => 
            totalDiagnosis > 0 ? ((val / totalDiagnosis) * 100).toFixed(1) : 0
        );
        
        // Define colors for different diagnosis categories
        const colorMap = {
            'Healthy': '#27ae60',
            'Hyperthyroid': '#e74c3c',
            'Hypothyroid': '#f39c12',
            'T3 Toxic': '#c0392b',
            'Toxic Goitre': '#e67e22',
            'Secondary Toxic': '#d35400',
            'Primary Hypothyroid': '#d68910',
            'Compensated Hypothyroid': '#f1c40f',
            'Secondary Hypothyroid': '#f39c12',
            'Increased Binding Protein': '#3498db',
            'Decreased Binding Protein': '#9b59b6',
            'Concurrent Illness': '#e67e22',
            'Replacement Therapy': '#16a085',
            'Underreplaced': '#c0392b',
            'Overreplaced': '#d35400',
            'Antithyroid Drugs': '#2c3e50',
            'I131 Treatment': '#34495e',
            'Surgery': '#7f8c8d',
            'Discordant Results': '#95a5a6',
            'Elevated TBG': '#bdc3c7',
            'Elevated Thyroid Hormones': '#ecf0f1'
        };
        
        const backgroundColor = diagnosisLabels.map(label => colorMap[label] || '#95a5a6');
        const borderColor = backgroundColor.map(color => color);
        
        // Update target stats
        let targetStatsHTML = '';
        diagnosisLabels.forEach((label, index) => {
            targetStatsHTML += `<p><strong>${label}:</strong> ${diagnosisValues[index].toLocaleString()} (${diagnosisPercents[index]}%)</p>`;
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
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
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
