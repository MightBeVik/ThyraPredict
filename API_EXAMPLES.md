# API Examples - Soft Ensemble Predictions

## Endpoint: `/api/predict`

### Request Format
All requests should be POST with JSON body containing thyroid panel results.

---

## Example 1: Normal/Healthy Thyroid

### Request
```json
{
  "age": 35,
  "gender": "female",
  "pregnant": "no",
  "tsh": 2.0,
  "t3": 1.8,
  "tt4": 95.0,
  "t4u": 0.95,
  "fti": 100.0,
  "tbg": 26.0
}
```

### Response
```json
{
  "success": true,
  "prediction": "Negative",
  "confidence": 99.41,
  "probabilities": {
    "Negative": 99.41,
    "Hypo": 0.43,
    "Hyper": 0.15
  },
  "model_type": "Soft Ensemble (RF + XGB + GB + SVM + LR)"
}
```

### Interpretation
✅ **All clear!** 
- Normal TSH level (2.0)
- Normal T3 and T4 levels
- Normal hormone uptake
- Thyroid is functioning normally

---

## Example 2: Suspected Hyperthyroidism (Overactive)

### Request
```json
{
  "age": 28,
  "gender": "female",
  "pregnant": "no",
  "tsh": 0.1,
  "t3": 3.5,
  "tt4": 140.0,
  "t4u": 0.98,
  "fti": 145.0,
  "tbg": 26.0
}
```

### Response
```json
{
  "success": true,
  "prediction": "Hyper",
  "confidence": 87.58,
  "probabilities": {
    "Negative": 87.58,
    "Hypo": 0.22,
    "Hyper": 12.20
  },
  "model_type": "Soft Ensemble (RF + XGB + GB + SVM + LR)"
}
```

### Interpretation
⚠️ **Elevated Risk of Hyperthyroidism**
- **Very low TSH** (0.1) - Below normal range
- **High T3 and T4** - Elevated hormone levels
- **High T4U** - Elevated uptake
- **Recommended**: Consult endocrinologist for confirmation

---

## Example 3: Suspected Hypothyroidism (Underactive)

### Request
```json
{
  "age": 55,
  "gender": "female",
  "pregnant": "no",
  "tsh": 8.5,
  "t3": 1.2,
  "tt4": 60.0,
  "t4u": 0.85,
  "fti": 50.0,
  "tbg": 26.0
}
```

### Response
```json
{
  "success": true,
  "prediction": "Hypo",
  "confidence": 79.02,
  "probabilities": {
    "Negative": 18.89,
    "Hypo": 79.02,
    "Hyper": 2.09
  },
  "model_type": "Soft Ensemble (RF + XGB + GB + SVM + LR)"
}
```

### Interpretation
⚠️ **Elevated Risk of Hypothyroidism**
- **Very high TSH** (8.5) - Body trying to compensate
- **Low T3 and T4** - Insufficient hormone production
- **Low T4U** - Reduced hormone uptake
- **Recommended**: Start thyroid hormone replacement therapy

---

## Example 4: Borderline Case (Requires Monitoring)

### Request
```json
{
  "age": 42,
  "gender": "male",
  "pregnant": "no",
  "tsh": 3.8,
  "t3": 1.9,
  "tt4": 105.0,
  "t4u": 0.93,
  "fti": 98.0,
  "tbg": 26.0
}
```

### Response
```json
{
  "success": true,
  "prediction": "Negative",
  "confidence": 75.25,
  "probabilities": {
    "Negative": 75.25,
    "Hypo": 22.10,
    "Hyper": 2.65
  },
  "model_type": "Soft Ensemble (RF + XGB + GB + SVM + LR)"
}
```

### Interpretation
⚠️ **Borderline - Requires Monitoring**
- **TSH at upper normal limit** (3.8) - Slightly elevated
- **All other values normal**
- **Confidence: 75%** - Model is less certain
- **Recommended**: Retest in 6-12 months, monitor symptoms

---

## Example 5: Severe Hypothyroidism

### Request
```json
{
  "age": 60,
  "gender": "female",
  "pregnant": "no",
  "tsh": 18.5,
  "t3": 0.8,
  "tt4": 35.0,
  "t4u": 0.70,
  "fti": 25.0,
  "tbg": 26.0
}
```

### Response
```json
{
  "success": true,
  "prediction": "Hypo",
  "confidence": 97.85,
  "probabilities": {
    "Negative": 1.05,
    "Hypo": 97.85,
    "Hyper": 1.10
  },
  "model_type": "Soft Ensemble (RF + XGB + GB + SVM + LR)"
}
```

### Interpretation
🔴 **Severe Hypothyroidism - Urgent Action Needed**
- **Very high TSH** (18.5) - Severely elevated
- **Very low T3 and T4** - Severely deficient
- **Confidence: 97.85%** - Model is very certain
- **Recommended**: Immediate treatment with levothyroxine, regular monitoring

---

## Reference: Normal Hormone Ranges

| Parameter | Normal Range | Unit |
|-----------|--------------|------|
| **TSH** | 0.4 - 4.0 | mIU/L |
| **T3** | 1.5 - 2.8 | ng/mL |
| **TT4 (Total T4)** | 4.5 - 12.0 | mcg/dL |
| **T4U** | 0.24 - 0.39 | (or 24-39%) |
| **FTI** | 1.2 - 4.9 | - |
| **TBG** | 16 - 36 | mcg/mL |

---

## Understanding Confidence Scores

| Confidence | Interpretation | Action |
|-----------|----------------|--------|
| **95-100%** | Very high certainty | Trust prediction, follow recommendations |
| **85-95%** | High certainty | Likely accurate, confirm with doctor |
| **70-85%** | Moderate certainty | Borderline case, retest or monitor |
| **60-70%** | Low certainty | Inconclusive, needs clinical evaluation |
| **<60%** | Very uncertain | Multiple possibilities, seek medical advice |

---

## Error Handling

### Missing Required Fields
```json
{
  "success": false,
  "error": "Missing required field: tsh"
}
```

### Invalid Data Type
```json
{
  "success": false,
  "error": "age must be a number, got string"
}
```

### Server Error
```json
{
  "success": false,
  "error": "Internal server error - please try again later"
}
```

---

## Integration Example (JavaScript)

```javascript
async function predictThyroidCondition(patientData) {
  try {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log(`Diagnosis: ${result.prediction}`);
      console.log(`Confidence: ${result.confidence}%`);
      console.log(`
        Risk Breakdown:
        - Negative (Normal): ${result.probabilities.Negative}%
        - Hyperthyroidism: ${result.probabilities.Hyper}%
        - Hypothyroidism: ${result.probabilities.Hypo}%
      `);
      
      // Display results to user
      displayResults(result);
    } else {
      console.error(`Prediction failed: ${result.error}`);
      displayError(result.error);
    }
  } catch (error) {
    console.error('Network or server error:', error);
    displayError('Failed to get prediction. Please try again.');
  }
}

// Usage
const patientData = {
  age: 45,
  gender: 'female',
  pregnant: 'no',
  tsh: 2.0,
  t3: 1.8,
  tt4: 95.0,
  t4u: 0.95,
  fti: 100.0,
  tbg: 26.0
};

predictThyroidCondition(patientData);
```

---

## Integration Example (Python/Requests)

```python
import requests
import json

def predict_thyroid_condition(patient_data):
    url = 'http://localhost:5000/api/predict'
    headers = {'Content-Type': 'application/json'}
    
    try:
        response = requests.post(url, json=patient_data, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        
        if result['success']:
            print(f"Diagnosis: {result['prediction']}")
            print(f"Confidence: {result['confidence']}%")
            print(f"Risk Breakdown:")
            print(f"  - Negative (Normal): {result['probabilities']['Negative']}%")
            print(f"  - Hyperthyroidism: {result['probabilities']['Hyper']}%")
            print(f"  - Hypothyroidism: {result['probabilities']['Hypo']}%")
            return result
        else:
            print(f"Error: {result['error']}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None

# Usage
patient_data = {
    'age': 45,
    'gender': 'female',
    'pregnant': 'no',
    'tsh': 2.0,
    't3': 1.8,
    'tt4': 95.0,
    't4u': 0.95,
    'fti': 100.0,
    'tbg': 26.0
}

result = predict_thyroid_condition(patient_data)
```

---

**API Version**: 1.0
**Model Version**: Soft Ensemble v1.0
**Last Updated**: November 28, 2025
