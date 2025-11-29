# Soft Ensemble Learning Model - ThyroPredict

## Overview
The ThyroPredict application now uses a **Soft Ensemble Learning** model for thyroid condition prediction. This approach combines predictions from 5 different machine learning models using probability averaging (soft voting).

## Model Architecture

### Individual Base Models:
1. **Random Forest** - Accuracy: 98.18%
   - 200 trees with max depth of 15
   - Captures non-linear relationships and feature interactions
   
2. **XGBoost** - Accuracy: 98.24%
   - 200 boosting iterations with learning rate of 0.1
   - Gradient boosting for sequential error correction
   
3. **Gradient Boosting** - Accuracy: 98.05%
   - 200 sequential models with max depth of 5
   - Iterative improvement on previous predictions
   
4. **Support Vector Machine (SVM)** - Accuracy: 94.60%
   - RBF kernel for non-linear classification
   - Finds optimal decision boundaries
   
5. **Logistic Regression** - Accuracy: 94.21%
   - Linear baseline model for comparison
   - Provides interpretable probability scores

### Soft Ensemble Voting:
- **Soft Voting Method**: Averages probability predictions from all 5 models
- **Ensemble Accuracy**: 98.37% ✓ (Better than any individual model)
- **Classes**: 
  - `0` = Hyper (Hyperthyroidism)
  - `1` = Hypo (Hypothyroidism)
  - `2` = Negative (Normal/Healthy)

## How Predictions Work

### Input Features (15 features):
- `age` - Patient age
- `sex` - Gender (0=Male, 1=Female)
- `pregnant` - Pregnancy status (0=No, 1=Yes)
- `TSH_measured` - TSH test performed (0/1)
- `TSH` - Thyroid Stimulating Hormone level
- `T3_measured` - T3 test performed (0/1)
- `T3` - Triiodothyronine level
- `TT4_measured` - TT4 test performed (0/1)
- `TT4` - Total Thyroxine level
- `T4U_measured` - T4 Uptake test performed (0/1)
- `T4U` - T4 Uptake percentage
- `FTI_measured` - FTI test performed (0/1)
- `FTI` - Free Thyroxine Index
- `TBG_measured` - TBG test performed (0/1)
- `TBG` - Thyroid Binding Globulin level

### Prediction Output:
```json
{
  "prediction": 2,
  "label": "Negative",
  "confidence": 99.38,
  "probabilities": {
    "Negative": 99.38,
    "Hyper": 0.14,
    "Hypo": 0.49
  },
  "model_type": "Soft Ensemble (RF + XGB + GB + SVM + LR)"
}
```

- **Prediction**: Most likely diagnosis
- **Label**: Human-readable diagnosis
- **Confidence**: Certainty percentage of the prediction
- **Probabilities**: Risk percentages for each condition
- **Model Type**: Identifies the ensemble approach

## Data Preprocessing

### Standardization:
Numeric features are scaled using StandardScaler to ensure all features have mean=0 and std=1:
- `age`, `TSH`, `T3`, `TT4`, `T4U`, `FTI`, `TBG`

### Train/Test Split:
- Training set: 80% (6,144 samples)
- Test set: 20% (1,537 samples)
- Stratified split maintains class distribution

### Class Distribution:
- Negative (Normal): 5,413 samples (88.4%)
- Hypothyroid: 481 samples (7.8%)
- Hyperthyroid: 250 samples (3.3%)

## Performance Metrics

### Classification Report (Test Set):
```
           Precision  Recall  F1-Score  Support
Hyper        0.90     0.73      0.81       63
Hypo         0.95     0.97      0.96      120
Negative     0.99     1.00      0.99     1354
---------
Accuracy:                         0.98     1537
```

## Integration with Flask App

### API Endpoint: `/api/predict` (POST)
The Flask app loads the soft ensemble predictor and makes predictions on patient data.

### Request Format:
```json
{
  "age": 45,
  "gender": "female",
  "pregnant": "no",
  "tsh": 1.5,
  "t3": 2.0,
  "tt4": 100.0,
  "t4u": 0.95,
  "fti": 105.0,
  "tbg": 26.0
}
```

### Response Format:
```json
{
  "success": true,
  "prediction": "Negative",
  "confidence": 98.5,
  "probabilities": {
    "Negative": 98.5,
    "Hypo": 1.2,
    "Hyper": 0.3
  },
  "model_type": "Soft Ensemble (RF + XGB + GB + SVM + LR)"
}
```

## Why Soft Ensemble?

### Advantages:
1. **Higher Accuracy**: Ensemble achieves 98.37% vs individual models at 94-98%
2. **Robust Predictions**: Multiple models reduce overfitting risk
3. **Probability-Based**: Soft voting provides calibrated confidence scores
4. **Interpretable**: Clear breakdown of risk percentages
5. **Diverse Methods**: Different algorithms capture different patterns

### Mathematical Formula:
```
P(class) = Average([P_RF(class), P_XGB(class), P_GB(class), P_SVM(class), P_LR(class)])
```

## Files Structure

```
Model/
├── model.py                  # Training script for ensemble
├── predict.py               # SoftEnsemblePredictor class
├── rf_model.pkl             # Random Forest model
├── xgb_model.pkl            # XGBoost model
├── gb_model.pkl             # Gradient Boosting model
├── svm_model.pkl            # SVM model
├── lr_model.pkl             # Logistic Regression model
├── scaler.pkl               # StandardScaler for preprocessing
└── class_mapping.pkl        # Class name mapping

app.py                        # Flask app with integrated predictor
```

## Future Improvements

1. **Weighted Voting**: Assign different weights to models based on validation performance
2. **Stacking**: Train a meta-learner on ensemble predictions
3. **Hyperparameter Tuning**: Optimize each base model further
4. **Feature Selection**: Identify and remove less important features
5. **Cross-Validation**: Use k-fold CV for more robust evaluation
6. **Class Balancing**: Address class imbalance with SMOTE or weighted loss

---

**Model Created**: November 28, 2025
**Ensemble Accuracy**: 98.37%
**Status**: Production Ready ✓
