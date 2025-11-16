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

app = Flask(__name__)

# Load model (we'll create a dummy model for now)
# In production, load your trained model here
# model = joblib.load('model.pkl')

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
    
    stats = {
        'total_records': len(df),
        'total_features': len(df.columns),
        'age_stats': {
            'mean': float(df['age'].mean()),
            'median': float(df['age'].median()),
            'min': float(df['age'].min()),
            'max': float(df['age'].max()),
            'std': float(df['age'].std())
        },
        'gender_distribution': df['sex'].value_counts().to_dict(),
        'target_distribution': df['target'].value_counts().to_dict(),
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
    """Predict thyroid condition based on survey input"""
    try:
        data = request.json
        
        # Get input values from survey
        gender = data.get('gender', '')
        age = float(data.get('age', 0))
        tsh = float(data.get('tsh', 0))
        t3 = float(data.get('t3', 0))
        tt4 = float(data.get('tt4', 0))
        t4u = float(data.get('t4u', 0))
        fti = float(data.get('fti', 0))
        tbg = float(data.get('tbg', 0))
        pregnant = data.get('pregnant', None)  # Can be 'yes', 'no', 'prefer-not-to-say', or None
        
        # Create feature array with new fields
        features = {
            'gender': gender,
            'age': age,
            'tsh': tsh,
            't3': t3,
            'tt4': tt4,
            't4u': t4u,
            'fti': fti,
            'tbg': tbg,
            'pregnant': pregnant
        }
        
        # Make prediction
        hyperthyroidism_risk = calculate_hyperthyroidism_risk(features)
        hypothyroidism_risk = calculate_hypothyroidism_risk(features)
        
        # Determine risk levels
        hyper_level = get_risk_level(hyperthyroidism_risk)
        hypo_level = get_risk_level(hypothyroidism_risk)
        
        return jsonify({
            'success': True,
            'hyperthyroidism': {
                'risk_score': round(hyperthyroidism_risk, 2),
                'risk_level': hyper_level,
                'message': get_hyper_message(hyper_level)
            },
            'hypothyroidism': {
                'risk_score': round(hypothyroidism_risk, 2),
                'risk_level': hypo_level,
                'message': get_hypo_message(hypo_level)
            }
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

def calculate_hyperthyroidism_risk(features):
    """Calculate hyperthyroidism risk based on features"""
    tsh = features['tsh']
    t3 = features['t3']
    tt4 = features['tt4']
    t4u = features['t4u']
    fti = features['fti']
    age = features['age']
    
    # Risk calculation based on hormone levels
    risk = 0
    
    # TSH is typically low in hyperthyroidism (normal: 0.4 - 4.0)
    if tsh < 0.4:
        risk += 0.35
    elif tsh < 0.5:
        risk += 0.20
    
    # T3 is typically high in hyperthyroidism (normal: 70 - 200)
    if t3 > 200:
        risk += 0.25
    elif t3 > 180:
        risk += 0.15
    
    # TT4 is typically high (normal: 4.5 - 12.0)
    if tt4 > 12.0:
        risk += 0.20
    elif tt4 > 11.0:
        risk += 0.10
    
    # T4U (uptake) - high values suggest hyperthyroidism (normal: 24 - 39%)
    if t4u > 39:
        risk += 0.15
    
    # FTI typically high in hyperthyroidism (normal: 1.2 - 4.9)
    if fti > 4.9:
        risk += 0.15
    
    # Age factor - hyperthyroidism more common in younger population
    if age < 40:
        risk -= 0.05
    elif age > 60:
        risk -= 0.10
    
    return min(max(risk, 0), 1.0)

def calculate_hypothyroidism_risk(features):
    """Calculate hypothyroidism risk based on features"""
    tsh = features['tsh']
    t3 = features['t3']
    tt4 = features['tt4']
    t4u = features['t4u']
    fti = features['fti']
    age = features['age']
    gender = features['gender']
    pregnant = features.get('pregnant')
    
    # Risk calculation based on hormone levels
    risk = 0
    
    # TSH is typically high in hypothyroidism (normal: 0.4 - 4.0)
    if tsh > 4.0:
        risk += 0.35
    elif tsh > 3.5:
        risk += 0.20
    
    # T3 is typically low in hypothyroidism (normal: 70 - 200)
    if t3 < 70:
        risk += 0.25
    elif t3 < 90:
        risk += 0.15
    
    # TT4 is typically low (normal: 4.5 - 12.0)
    if tt4 < 4.5:
        risk += 0.20
    elif tt4 < 6.0:
        risk += 0.10
    
    # T4U (uptake) - low values suggest hypothyroidism (normal: 24 - 39%)
    if t4u < 24:
        risk += 0.15
    
    # FTI typically low in hypothyroidism (normal: 1.2 - 4.9)
    if fti < 1.2:
        risk += 0.15
    
    # Age factor - hypothyroidism more common in older population
    if age > 60:
        risk += 0.15
    elif age > 50:
        risk += 0.08
    
    # Gender factor - more common in women
    if gender.upper() == 'F':
        risk += 0.10
    
    # Pregnancy factor - increases risk
    if pregnant == 'yes':
        risk += 0.15
    
    return min(max(risk, 0), 1.0)

def get_risk_level(score):
    """Convert risk score to risk level"""
    if score < 0.33:
        return "LOW"
    elif score < 0.67:
        return "MEDIUM"
    else:
        return "HIGH"

def get_hyper_message(level):
    """Get message for hyperthyroidism risk"""
    messages = {
        "LOW": "Your markers suggest low risk for hyperthyroidism.",
        "MEDIUM": "Your results indicate some markers that warrant attention. Consider consulting with an endocrinologist.",
        "HIGH": "Your hormone levels indicate elevated risk. Please consult with an endocrinologist for comprehensive evaluation and treatment options."
    }
    return messages.get(level, "")

def get_hypo_message(level):
    """Get message for hypothyroidism risk"""
    messages = {
        "LOW": "Your markers suggest low risk for hypothyroidism.",
        "MEDIUM": "Your results indicate some markers that warrant attention. Consider consulting with an endocrinologist.",
        "HIGH": "Your hormone levels indicate elevated risk. Please consult with an endocrinologist for comprehensive evaluation and treatment options."
    }
    return messages.get(level, "")

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, port=port, host='0.0.0.0')
