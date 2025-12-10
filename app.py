from flask import Flask, render_template, request, jsonify
import numpy as np
import pandas as pd
import joblib
import os
import requests
import xml.etree.ElementTree as ET
from datetime import datetime
import time
import json
import sys

# Add Model directory to path for imports
model_dir = os.path.join(os.path.dirname(__file__), 'Model')
sys.path.insert(0, model_dir)

from predict import SoftEnsemblePredictor

app = Flask(__name__)

# Initialize the soft ensemble predictor
predictor = SoftEnsemblePredictor(model_dir=model_dir)

# Cache for papers
papers_cache = {
    'hypothyroidism': None,
    'hyperthyroidism': None,
    'thyroid_ml': None,
    'cache_time': None
}

def is_cache_valid():
    """Check if cache is less than 24 hours old"""
    if papers_cache['cache_time'] is None:
        return False
    
    elapsed = time.time() - papers_cache['cache_time']
    return elapsed < (24 * 3600)  # 24 hours in seconds

# Load and analyze dataset
def load_dataset():
    """Load the thyroid dataset"""
    try:
        dataset_path = os.path.join(os.path.dirname(__file__), 'dataset', 'thyroidDF.csv')
        df = pd.read_csv(dataset_path)
        return df
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return None

def get_dataset_stats():
    """Get statistics about the dataset"""
    df = load_dataset()
    if df is None:
        return None
    
    # Diagnosis code mappings
    diagnosis_map = {
        # Hyperthyroid conditions
        'A': 'Hyperthyroid',
        'B': 'T3 Toxic',
        'C': 'Toxic Goitre',
        'D': 'Secondary Toxic',
        # Hypothyroid conditions
        'E': 'Hypothyroid',
        'F': 'Primary Hypothyroid',
        'G': 'Compensated Hypothyroid',
        'H': 'Secondary Hypothyroid',
        # Binding protein
        'I': 'Increased Binding Protein',
        'J': 'Decreased Binding Protein',
        # General health
        'K': 'Concurrent Illness',
        # Replacement therapy
        'L': 'Replacement Therapy',
        'M': 'Underreplaced',
        'N': 'Overreplaced',
        # Antithyroid treatment
        'O': 'Antithyroid Drugs',
        'P': 'I131 Treatment',
        'Q': 'Surgery',
        # Miscellaneous
        'R': 'Discordant Results',
        'S': 'Elevated TBG',
        'T': 'Elevated Thyroid Hormones',
        '-': 'Healthy (No Condition)'
    }
    
    # Categorize diagnoses
    diagnosis_categories = {}
    for target in df['target'].unique():
        if pd.isna(target):
            continue
        
        target_str = str(target).replace('|', '')  # Remove pipe character
        
        # Get all codes in the diagnosis (e.g., "GK" -> ["G", "K"])
        codes = list(target_str)
        
        # Determine primary category based on the first code
        primary_code = codes[0] if codes else '-'
        
        if primary_code == '-':
            category = 'Healthy'
        elif primary_code in ['A', 'B', 'C', 'D']:
            category = 'Hyperthyroid'
        elif primary_code in ['E', 'F', 'G', 'H']:
            category = 'Hypothyroid'
        else:
            # For other codes, use their descriptive label
            category = diagnosis_map.get(primary_code, primary_code)
        
        if category not in diagnosis_categories:
            diagnosis_categories[category] = 0
        diagnosis_categories[category] += df[df['target'] == target].shape[0]
    
    # Calculate age distribution (capped at 100 years)
    df_age_capped = df[df['age'] <= 100]
    age_bins = [18, 26, 36, 46, 56, 66, 76, 86, 96, 101]
    age_labels = ['18-25', '26-35', '36-45', '46-55', '56-65', '66-75', '76-85', '86-95', '96-100']
    age_distribution_series = pd.cut(df_age_capped['age'], bins=age_bins, labels=age_labels, right=False)
    age_dist_temp = age_distribution_series.value_counts().sort_index().to_dict()
    # Convert to ensure proper JSON serialization
    age_distribution = {str(k): int(v) for k, v in age_dist_temp.items()}
    
    stats = {
        'total_records': len(df),
        'total_features': len(df.columns),
        'age_stats': {
            'mean': float(df[df['age'] <= 100]['age'].mean()),  # Mean excluding outliers
            'median': float(df[df['age'] <= 100]['age'].median()),  # Median excluding outliers
            'min': float(df[df['age'] <= 100]['age'].min()),
            'max': float(df[df['age'] <= 100]['age'].max()),
            'std': float(df[df['age'] <= 100]['age'].std())
        },
        'age_distribution': age_distribution,
        'gender_distribution': {
            'F': 6073,  # Static data: Females
            'M': 2792   # Static data: Males
        },
        'target_distribution': df['target'].value_counts().to_dict(),
        'diagnosis_categories': diagnosis_categories,
        'diagnosis_map': diagnosis_map,
        'tsh_stats': {
            'mean': float(df['TSH'].mean()),
            'median': float(df['TSH'].median()),
            'min': float(df['TSH'].min()),
            'max': float(df['TSH'].max()),
            'std': float(df['TSH'].std())
        },
        'missing_values': df.isnull().sum().to_dict(),
        'features': list(df.columns)
    }
    
    return stats

# Route for home page
@app.route('/')
def home():
    return render_template('index.html')

# Route for about page
@app.route('/about')
def about():
    return render_template('about.html')

# CrossRef API Functions
def fetch_crossref_papers(query, max_results=1):
    """Fetch papers from CrossRef API"""
    try:
        time.sleep(0.5)  # Small delay for rate limiting
        
        url = "https://api.crossref.org/v1/works"
        params = {
            'query': query,
            'rows': max_results,
            'select': 'title,author,published-print,published-online,container-title,abstract,URL'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        items = data.get('message', {}).get('items', [])
        
        if not items:
            return []
        
        papers = []
        
        for item in items:
            try:
                title = item.get('title', ['No title'])[0] if item.get('title') else 'No title'
                
                # Authors
                authors = []
                for author in item.get('author', [])[:3]:
                    if author.get('family'):
                        authors.append(f"{author.get('family')} {author.get('given', '')}".strip())
                
                authors_str = ', '.join(authors)
                if len(item.get('author', [])) > 3:
                    authors_str += ' et al.'
                
                # Journal
                journal = item.get('container-title', ['Unknown Journal'])[0] if item.get('container-title') else 'Unknown Journal'
                
                # Year
                pub_date = item.get('published-print') or item.get('published-online') or item.get('issued')
                year = ''
                if pub_date:
                    if isinstance(pub_date, dict):
                        year = str(pub_date.get('date-parts', [[]])[0][0]) if pub_date.get('date-parts') else ''
                    elif isinstance(pub_date, str):
                        year = pub_date.split('-')[0]
                
                # Abstract
                abstract = item.get('abstract', 'No abstract available')
                if abstract and len(abstract) > 300:
                    abstract = abstract[:297] + '...'
                
                # URL/DOI
                url_link = item.get('URL', '')
                if not url_link and item.get('DOI'):
                    url_link = f"https://doi.org/{item.get('DOI')}"
                
                paper = {
                    'title': title,
                    'authors': authors_str if authors_str else 'Unknown authors',
                    'journal': journal,
                    'year': year,
                    'abstract': abstract if abstract else 'No abstract available',
                    'url': url_link
                }
                
                papers.append(paper)
            
            except Exception as e:
                print(f"Error processing paper: {e}")
                continue
        
        return papers
    
    except Exception as e:
        print(f"Error fetching CrossRef papers for '{query}': {e}")
        return []

# Route for research page
@app.route('/research')
def research():
    # Check if cache is valid
    if is_cache_valid() and all([papers_cache['hypothyroidism'], papers_cache['hyperthyroidism'], papers_cache['thyroid_ml']]):
        return render_template('research.html', 
                             hypothyroidism_papers=papers_cache['hypothyroidism'],
                             hyperthyroidism_papers=papers_cache['hyperthyroidism'],
                             thyroid_ml_papers=papers_cache['thyroid_ml'])
    
    # Fetch papers from CrossRef
    print("Fetching papers from CrossRef...")
    hypothyroidism_papers = fetch_crossref_papers('hypothyroidism', max_results=1)
    hyperthyroidism_papers = fetch_crossref_papers('hyperthyroidism', max_results=1)
    thyroid_ml_papers = fetch_crossref_papers('thyroid disease machine learning', max_results=1)
    
    # Update cache
    papers_cache['hypothyroidism'] = hypothyroidism_papers
    papers_cache['hyperthyroidism'] = hyperthyroidism_papers
    papers_cache['thyroid_ml'] = thyroid_ml_papers
    papers_cache['cache_time'] = time.time()
    
    return render_template('research.html', 
                         hypothyroidism_papers=hypothyroidism_papers,
                         hyperthyroidism_papers=hyperthyroidism_papers,
                         thyroid_ml_papers=thyroid_ml_papers)

# Route for model page
@app.route('/model')
def model():
    return render_template('model.html')

# Route for resources page
@app.route('/resources')
def resources():
    return render_template('resources.html')

# Route for data page
@app.route('/data')
def data():
    stats = get_dataset_stats()
    return render_template('data.html', stats=stats)

# Route for prediction form page
@app.route('/predict')
def predict_form():
    return render_template('predict.html')

# Route for results page
@app.route('/results')
def results():
    return render_template('results.html')

# Route for processing prediction
@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict thyroid condition using soft ensemble model"""
    try:
        data = request.json
        
        # Map input data to feature names expected by the model
        gender = data.get('gender', '')
        pregnant = data.get('pregnant', '')
        
        input_features = {
            'age': float(data.get('age', 0)),
            'sex': 1 if gender and gender.lower() == 'female' else 0,
            'pregnant': 1 if pregnant and pregnant.lower() == 'yes' else 0,
            'TSH_measured': 1 if data.get('tsh', 0) else 0,
            'TSH': float(data.get('tsh', 0)),
            'T3_measured': 1 if data.get('t3', 0) else 0,
            'T3': float(data.get('t3', 0)),
            'TT4_measured': 1 if data.get('tt4', 0) else 0,
            'TT4': float(data.get('tt4', 0)),
            'T4U_measured': 1 if data.get('t4u', 0) else 0,
            'T4U': float(data.get('t4u', 0)),
            'FTI_measured': 1 if data.get('fti', 0) else 0,
            'FTI': float(data.get('fti', 0)),
            'TBG_measured': 1 if data.get('tbg', 0) else 0,
            'TBG': float(data.get('tbg', 0))
        }
        
        # Make prediction using soft ensemble
        result = predictor.predict(input_features)
        
        # Calculate negative probability (normal)
        negative_pct = result['probabilities']['Negative']
        hypo_pct = result['probabilities']['Hypo']
        hyper_pct = result['probabilities']['Hyper']
        
        return jsonify({
            'success': True,
            'prediction': result['label'],
            'confidence': result['confidence'],
            'probabilities': {
                'Negative': round(negative_pct, 2),
                'Hypo': round(hypo_pct, 2),
                'Hyper': round(hyper_pct, 2)
            },
            'model_type': result['model_type']
        })
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, port=port, host='0.0.0.0')
