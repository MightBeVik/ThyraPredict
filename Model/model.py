import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.svm import SVC
from xgboost import XGBClassifier
from sklearn.linear_model import LogisticRegression

# Load and prepare data
df_clean = pd.read_csv("../dataset/df_copy_cleaned.csv")

X = df_clean.drop('target', axis=1)
y = df_clean['target']

# Preprocess: Scale numeric columns
numeric_cols = ['age', 'TSH', 'T3', 'TT4', 'T4U', 'FTI', 'TBG']
scaler = StandardScaler()
X[numeric_cols] = scaler.fit_transform(X[numeric_cols])

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Target class mapping
# 0: Hyperthyroid, 1: Hypothyroid, 2: Negative (Normal)
class_mapping = {0: 'Hyper', 1: 'Hypo', 2: 'Negative'}

print("=" * 80)
print("SOFT ENSEMBLE LEARNING MODEL - THYROID PREDICTION")
print("=" * 80)
print(f"\nDataset shape: {X.shape}")
print(f"Train set: {X_train.shape}, Test set: {X_test.shape}")
print(f"Target classes: {class_mapping}")
print(f"Class distribution in training set:")
print(y_train.value_counts())

# Build individual models
print("\n" + "=" * 80)
print("BUILDING INDIVIDUAL MODELS")
print("=" * 80)

# Model 1: Random Forest
print("\n1. Training Random Forest Classifier...")
rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)
rf_model.fit(X_train, y_train)
rf_pred = rf_model.predict(X_test)
rf_acc = accuracy_score(y_test, rf_pred)
print(f"   Random Forest Accuracy: {rf_acc:.4f}")

# Model 2: XGBoost
print("\n2. Training XGBoost Classifier...")
xgb_model = XGBClassifier(
    n_estimators=200,
    max_depth=7,
    learning_rate=0.1,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric='mlogloss'
)
xgb_model.fit(X_train, y_train)
xgb_pred = xgb_model.predict(X_test)
xgb_acc = accuracy_score(y_test, xgb_pred)
print(f"   XGBoost Accuracy: {xgb_acc:.4f}")

# Model 3: Gradient Boosting
print("\n3. Training Gradient Boosting Classifier...")
gb_model = GradientBoostingClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    subsample=0.8,
    random_state=42
)
gb_model.fit(X_train, y_train)
gb_pred = gb_model.predict(X_test)
gb_acc = accuracy_score(y_test, gb_pred)
print(f"   Gradient Boosting Accuracy: {gb_acc:.4f}")

# Model 4: Support Vector Machine
print("\n4. Training Support Vector Machine...")
svm_model = SVC(kernel='rbf', probability=True, C=1.0, random_state=42, gamma='scale')
svm_model.fit(X_train, y_train)
svm_pred = svm_model.predict(X_test)
svm_acc = accuracy_score(y_test, svm_pred)
print(f"   SVM Accuracy: {svm_acc:.4f}")

# Model 5: Logistic Regression
print("\n5. Training Logistic Regression...")
lr_model = LogisticRegression(max_iter=1000, random_state=42, n_jobs=-1)
lr_model.fit(X_train, y_train)
lr_pred = lr_model.predict(X_test)
lr_acc = accuracy_score(y_test, lr_pred)
print(f"   Logistic Regression Accuracy: {lr_acc:.4f}")

# Build Soft Voting Ensemble (Manual Implementation)
print("\n" + "=" * 80)
print("BUILDING SOFT VOTING ENSEMBLE")
print("=" * 80)

# Get probability predictions from each model
rf_proba = rf_model.predict_proba(X_test)
xgb_proba = xgb_model.predict_proba(X_test)
gb_proba = gb_model.predict_proba(X_test)
svm_proba = svm_model.predict_proba(X_test)
lr_proba = lr_model.predict_proba(X_test)

# Average the probabilities (soft voting)
ensemble_pred_proba = np.mean([rf_proba, xgb_proba, gb_proba, svm_proba, lr_proba], axis=0)

# Get class predictions from averaged probabilities
ensemble_pred = np.argmax(ensemble_pred_proba, axis=1)
ensemble_acc = accuracy_score(y_test, ensemble_pred)

print(f"\nSoft Ensemble Accuracy: {ensemble_acc:.4f}")
print(f"Individual model accuracies:")
print(f"  - Random Forest:     {rf_acc:.4f}")
print(f"  - XGBoost:           {xgb_acc:.4f}")
print(f"  - Gradient Boosting: {gb_acc:.4f}")
print(f"  - SVM:               {svm_acc:.4f}")
print(f"  - Logistic Regression: {lr_acc:.4f}")

# Detailed Classification Report
print("\n" + "=" * 80)
print("CLASSIFICATION REPORT - SOFT ENSEMBLE")
print("=" * 80)
print(classification_report(y_test, ensemble_pred, target_names=[class_mapping[i] for i in sorted(class_mapping.keys())]))

# Save the ensemble models and scaler
model_dir = os.path.dirname(os.path.abspath(__file__))
rf_path = os.path.join(model_dir, 'rf_model.pkl')
xgb_path = os.path.join(model_dir, 'xgb_model.pkl')
gb_path = os.path.join(model_dir, 'gb_model.pkl')
svm_path = os.path.join(model_dir, 'svm_model.pkl')
lr_path = os.path.join(model_dir, 'lr_model.pkl')
scaler_path = os.path.join(model_dir, 'scaler.pkl')

print("\n" + "=" * 80)
print("SAVING MODELS")
print("=" * 80)

joblib.dump(rf_model, rf_path)
joblib.dump(xgb_model, xgb_path)
joblib.dump(gb_model, gb_path)
joblib.dump(svm_model, svm_path)
joblib.dump(lr_model, lr_path)
joblib.dump(scaler, scaler_path)
print(f"✓ Random Forest model saved")
print(f"✓ XGBoost model saved")
print(f"✓ Gradient Boosting model saved")
print(f"✓ SVM model saved")
print(f"✓ Logistic Regression model saved")
print(f"✓ Scaler saved")

# Save class mapping for predictions
mapping_path = os.path.join(model_dir, 'class_mapping.pkl')
joblib.dump(class_mapping, mapping_path)
print(f"✓ Class mapping saved")

print("\n" + "=" * 80)
print("MODEL TRAINING COMPLETE!")
print("=" * 80)

