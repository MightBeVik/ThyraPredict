"""
Soft Ensemble Prediction Module
Loads the trained soft ensemble models and provides predictions with probabilities
"""

import joblib
import numpy as np
import pandas as pd
import os
from pathlib import Path

class SoftEnsemblePredictor:
    """
    Soft Ensemble predictor that combines predictions from multiple models
    using probability averaging (soft voting)
    """
    
    def __init__(self, model_dir=None):
        """
        Initialize the predictor by loading all trained models
        
        Args:
            model_dir: Directory containing the trained models. 
                      Defaults to current directory if None.
        """
        if model_dir is None:
            model_dir = os.path.dirname(os.path.abspath(__file__))
        
        # Load individual models
        self.rf_model = joblib.load(os.path.join(model_dir, 'rf_model.pkl'))
        self.xgb_model = joblib.load(os.path.join(model_dir, 'xgb_model.pkl'))
        self.gb_model = joblib.load(os.path.join(model_dir, 'gb_model.pkl'))
        self.svm_model = joblib.load(os.path.join(model_dir, 'svm_model.pkl'))
        self.lr_model = joblib.load(os.path.join(model_dir, 'lr_model.pkl'))
        
        # Load scaler
        self.scaler = joblib.load(os.path.join(model_dir, 'scaler.pkl'))
        
        # Load class mapping
        self.class_mapping = joblib.load(os.path.join(model_dir, 'class_mapping.pkl'))
        
        # Feature names
        self.numeric_cols = ['age', 'TSH', 'T3', 'TT4', 'T4U', 'FTI', 'TBG']
        
        print("✓ Soft Ensemble Predictor loaded successfully")
        print(f"  Models: RF, XGBoost, GB, SVM, Logistic Regression")
        print(f"  Class mapping: {self.class_mapping}")
    
    def preprocess_input(self, X):
        """
        Preprocess input data (scale numeric features)
        
        Args:
            X: DataFrame or dict with features
            
        Returns:
            Preprocessed DataFrame ready for prediction
        """
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        elif not isinstance(X, pd.DataFrame):
            raise ValueError("Input must be a dict or pandas DataFrame")
        
        # Make a copy to avoid modifying original
        X_processed = X.copy()
        
        # Scale numeric columns
        X_processed[self.numeric_cols] = self.scaler.transform(X_processed[self.numeric_cols])
        
        return X_processed
    
    def predict(self, X):
        """
        Make predictions using the soft ensemble
        
        Args:
            X: Input features (dict or DataFrame)
            
        Returns:
            Dictionary with:
            - prediction: Class label (0, 1, or 2)
            - label: Class name (Hypo, Hyper, or Negative)
            - probabilities: Dict with probabilities for each class
            - confidence: Confidence score (0-100)
        """
        # Preprocess input
        X_processed = self.preprocess_input(X)
        
        # Get probability predictions from each model
        rf_proba = self.rf_model.predict_proba(X_processed)
        xgb_proba = self.xgb_model.predict_proba(X_processed)
        gb_proba = self.gb_model.predict_proba(X_processed)
        svm_proba = self.svm_model.predict_proba(X_processed)
        lr_proba = self.lr_model.predict_proba(X_processed)
        
        # Average the probabilities (soft voting)
        ensemble_proba = np.mean([rf_proba, xgb_proba, gb_proba, svm_proba, lr_proba], axis=0)
        
        # Get class predictions
        prediction = np.argmax(ensemble_proba[0])
        probabilities = ensemble_proba[0]
        confidence = probabilities[prediction] * 100
        
        # Create result dictionary
        result = {
            'prediction': int(prediction),
            'label': self.class_mapping[prediction],
            'probabilities': {
                'Negative': float(probabilities[2]) * 100,  # Class 2
                'Hyper': float(probabilities[0]) * 100,     # Class 0
                'Hypo': float(probabilities[1]) * 100       # Class 1
            },
            'confidence': float(confidence),
            'model_type': 'Soft Ensemble (RF + XGB + GB + SVM + LR)'
        }
        
        return result
    
    def predict_batch(self, X):
        """
        Make predictions for multiple samples
        
        Args:
            X: DataFrame with multiple samples
            
        Returns:
            List of prediction dictionaries
        """
        if not isinstance(X, pd.DataFrame):
            raise ValueError("Input must be a pandas DataFrame")
        
        # Preprocess input
        X_processed = self.preprocess_input(X)
        
        # Get probability predictions from each model
        rf_proba = self.rf_model.predict_proba(X_processed)
        xgb_proba = self.xgb_model.predict_proba(X_processed)
        gb_proba = self.gb_model.predict_proba(X_processed)
        svm_proba = self.svm_model.predict_proba(X_processed)
        lr_proba = self.lr_model.predict_proba(X_processed)
        
        # Average the probabilities
        ensemble_proba = np.mean([rf_proba, xgb_proba, gb_proba, svm_proba, lr_proba], axis=0)
        
        predictions = []
        for i, proba in enumerate(ensemble_proba):
            prediction = np.argmax(proba)
            confidence = proba[prediction] * 100
            
            result = {
                'prediction': int(prediction),
                'label': self.class_mapping[prediction],
                'probabilities': {
                    'Negative': float(proba[2]) * 100,
                    'Hyper': float(proba[0]) * 100,
                    'Hypo': float(proba[1]) * 100
                },
                'confidence': float(confidence)
            }
            predictions.append(result)
        
        return predictions


# Example usage
if __name__ == "__main__":
    # Initialize predictor
    predictor = SoftEnsemblePredictor()
    
    # Example input
    sample_input = {
        'age': 45,
        'sex': 1,
        'pregnant': 0,
        'TSH_measured': 1,
        'TSH': 1.5,
        'T3_measured': 1,
        'T3': 2.0,
        'TT4_measured': 1,
        'TT4': 100.0,
        'T4U_measured': 0,
        'T4U': 0.95,
        'FTI_measured': 1,
        'FTI': 105.0,
        'TBG_measured': 0,
        'TBG': 26.0
    }
    
    # Make prediction
    print("\n" + "="*80)
    print("EXAMPLE PREDICTION")
    print("="*80)
    result = predictor.predict(sample_input)
    
    print(f"\nPrediction: {result['label']}")
    print(f"Confidence: {result['confidence']:.2f}%")
    print(f"\nProbability Breakdown:")
    print(f"  - Negative (Normal): {result['probabilities']['Negative']:.2f}%")
    print(f"  - Hyper (Hyperthyroid): {result['probabilities']['Hyper']:.2f}%")
    print(f"  - Hypo (Hypothyroid): {result['probabilities']['Hypo']:.2f}%")
    print(f"\nModel: {result['model_type']}")
