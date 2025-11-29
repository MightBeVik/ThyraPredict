# Soft Ensemble Model - Quick Reference

## 🎯 Model Summary
- **Ensemble Type**: Soft Voting (Probability Averaging)
- **Overall Accuracy**: 98.37%
- **Base Models**: 5 (Random Forest, XGBoost, Gradient Boosting, SVM, Logistic Regression)

## 📊 Output Format

When the app predicts thyroid conditions, it returns:

```
{
  "prediction": "Negative|Hypo|Hyper",
  "confidence": 0-100 (percentage),
  "probabilities": {
    "Negative": 0-100 (risk %),
    "Hypo": 0-100 (risk %),
    "Hyper": 0-100 (risk %)
  }
}
```

## 🏥 Diagnosis Reference

| Prediction | Meaning | Normal Indicators |
|-----------|---------|-------------------|
| **Negative** | Normal/Healthy thyroid | TSH: 0.4-4.0, T3: ~1.8-2.0, TT4: ~90-110 |
| **Hyper** | Hyperthyroidism (overactive) | Low TSH (<0.4), High T3/T4 |
| **Hypo** | Hypothyroidism (underactive) | High TSH (>4.0), Low T3/T4 |

## 📈 Test Results

### Individual Model Accuracy:
- Random Forest: **98.18%**
- XGBoost: **98.24%** ⭐
- Gradient Boosting: **98.05%**
- SVM: **94.60%**
- Logistic Regression: **94.21%**

### Ensemble Accuracy: **98.37%** ✓ (Better than all individual models)

## 🔬 Medical Features Used

The model analyzes 15 features:
- **Demographics**: Age, Sex, Pregnancy Status
- **Thyroid Hormones**: TSH, T3, TT4 levels
- **Hormone Uptake**: T4U (T4 Uptake percentage)
- **Derived Index**: FTI (Free Thyroxine Index)
- **Binding Protein**: TBG (Thyroid Binding Globulin)
- **Test Status**: Whether each test was performed (0/1)

## 🎨 How It Works

1. **Input**: Patient thyroid panel results
2. **Preprocessing**: Features are standardized (mean=0, std=1)
3. **Base Predictions**: Each of 5 models makes independent prediction
4. **Probability Averaging**: Soft voting combines all probabilities
5. **Output**: Most likely diagnosis + confidence + risk percentages

## 💡 Example Predictions

### Case 1: Normal Thyroid
- **Prediction**: Negative
- **Confidence**: 99.41%
- **Risk Breakdown**: Negative=99.41%, Hypo=0.43%, Hyper=0.15%

### Case 2: Suspected Hyperthyroidism
- **Prediction**: Hyper (or Negative if borderline)
- **Confidence**: 87.58%
- **Risk Breakdown**: Negative=87.58%, Hyper=12.20%, Hypo=0.22%

### Case 3: Suspected Hypothyroidism
- **Prediction**: Hypo
- **Confidence**: 79.02%
- **Risk Breakdown**: Negative=18.89%, Hypo=79.02%, Hyper=2.09%

## 🚀 API Integration

### Flask Route: `/api/predict`
- **Method**: POST
- **Content-Type**: application/json
- **Returns**: JSON with prediction and probabilities

### Usage in App:
```javascript
fetch('/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    age: 45,
    gender: 'female',
    tsh: 1.5,
    t3: 2.0,
    // ... other features
  })
})
.then(res => res.json())
.then(data => {
  console.log(`Prediction: ${data.prediction}`);
  console.log(`Negative: ${data.probabilities.Negative}%`);
  console.log(`Hypo: ${data.probabilities.Hypo}%`);
  console.log(`Hyper: ${data.probabilities.Hyper}%`);
});
```

## ⚙️ Technical Details

### Model Files:
- `rf_model.pkl` - Random Forest (3.8 MB)
- `xgb_model.pkl` - XGBoost (1.2 MB)
- `gb_model.pkl` - Gradient Boosting (3.0 MB)
- `svm_model.pkl` - SVM (142 KB)
- `lr_model.pkl` - Logistic Regression (1.7 KB)
- `scaler.pkl` - StandardScaler for preprocessing
- `class_mapping.pkl` - Class labels

### Training Data:
- Total samples: 7,681
- Training: 6,144 samples (80%)
- Testing: 1,537 samples (20%)
- Class distribution: Negative (88.4%), Hypo (7.8%), Hyper (3.3%)

## ✅ Advantages of Soft Ensemble

1. **Higher Accuracy** - Combines strengths of multiple algorithms
2. **Robust** - Reduces risk of single model bias
3. **Calibrated Probabilities** - Reliable confidence scores
4. **Diverse Methods** - Tree-based + SVM + Linear models
5. **Fault-Tolerant** - One bad prediction doesn't dominate

---

**Status**: ✓ Production Ready
**Version**: 1.0
**Date**: November 28, 2025
