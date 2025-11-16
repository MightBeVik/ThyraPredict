# ThyroPredict

A comprehensive thyroid health assessment tool using machine learning to predict the risk of hypothyroidism and hyperthyroidism based on clinical markers.

## Features

- **Interactive Survey Form**: 9-question assessment with conditional logic (pregnancy question for females only)
- **Machine Learning Models**: Ensemble of 4 models (SVM, Random Forest, Gradient Boosting, Logistic Regression)
- **Risk Assessment**: Personalized risk scores for hypothyroidism and hyperthyroidism
- **Data Visualization**: Interactive charts showing dataset statistics and distributions
- **Personalized Recommendations**: 
  - Supplement advice
  - Dietary recommendations
  - Healthcare provider guidance
- **Doctor Finder**: Find endocrinologists in Canada by postal code
- **Research Page**: Peer-reviewed citations backing the prediction models

## Tech Stack

- **Backend**: Flask 3.1.2 (Python 3.10)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: Pandas for data handling
- **ML Libraries**: scikit-learn, NumPy
- **Visualizations**: Chart.js 3.9.1
- **Mapping**: Google Maps API (optional)

## Installation

### Prerequisites
- Python 3.10+
- pip or conda

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/MightBeVik/ThyraPredict.git
cd ThyroPredict
```

2. **Create a virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate  # On Windows
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the application**
```bash
python app.py
```

5. **Open in browser**
Navigate to `http://127.0.0.1:5000`

## Project Structure

```
ThyroPredict/
├── app.py                    # Flask application
├── requirements.txt          # Python dependencies
├── dataset/
│   └── thyroidDF.csv        # 9,174 patient records with 31 features
├── static/
│   ├── css/
│   │   └── style.css        # Main stylesheet (2,217 lines)
│   ├── js/
│   │   ├── survey.js        # Survey form logic
│   │   ├── data-charts.js   # Chart.js visualizations
│   │   ├── doctor-finder.js # Endocrinologist search
│   │   ├── results.js       # Results page logic
│   │   ├── prediction.js    # Prediction logic
│   │   └── main.js          # Global scripts
│   └── images/
│       └── logo.png         # Application logo
└── templates/
    ├── base.html            # Base template
    ├── index.html           # Home page
    ├── about.html           # About page
    ├── research.html        # Research citations
    ├── model.html           # ML model explanation
    ├── data.html            # Data analysis & visualization
    ├── predict.html         # Survey form
    └── results.html         # Results & recommendations

```

## Usage

### Taking an Assessment
1. Navigate to the Predict page
2. Answer 8-9 clinical questions (pregnancy question appears for females only)
3. View your personalized risk assessment
4. Get recommendations for supplements, diet, and healthcare providers

### Viewing Data Analysis
- Visit the Data page to see interactive visualizations of the dataset
- Charts include: age distribution, gender split, TSH levels, diagnosis distribution

### Understanding the Model
- Read the Model page for detailed explanation of:
  - How the ML models work
  - Performance metrics (92% accuracy, 0.94 AUC-ROC)
  - Limitations and disclaimers

### Finding Healthcare Providers
- On the Results page, use the Doctor Finder to search for endocrinologists
- Enter your Canadian postal code (format: A1A 1A1)
- View nearby providers with ratings and contact information

## Machine Learning Models

The system uses an ensemble of 4 models:

1. **Support Vector Machine (SVM)** - RBF kernel, high accuracy on non-linear patterns
2. **Random Forest** - 100 trees, excellent for feature importance
3. **Gradient Boosting** - Learning rate 0.1, captures complex relationships
4. **Logistic Regression** - Baseline model for interpretability

### Performance Metrics
- **Accuracy**: 92%
- **Sensitivity (Recall)**: 89%
- **Specificity**: 95%
- **Precision**: 91%
- **F1-Score**: 0.90
- **AUC-ROC**: 0.94

## Dataset

- **Records**: 9,174 patient samples
- **Features**: 31 clinical variables
- **Target Classes**: Healthy, Hypothyroid, Hyperthyroid
- **Key Features**: TSH, T3, T4, Age, Gender, and more

## Features in Development

- [ ] User accounts and historical results tracking
- [ ] Integration with electronic health records
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Real-time doctor availability updates

## Important Disclaimer

This application is for **informational and educational purposes only**. It should not be considered a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional, particularly an endocrinologist, before making any health decisions or starting new treatments.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

This project is open source and available under the MIT License.

## Contact

For questions or feedback, please reach out to the development team.

## References

- Kim, M. K., & Park, J. S. (2014). Prevalence and Risk Factors of Subclinical Thyroid Disease. *Journal of Clinical Endocrinology & Metabolism*, 99(5), 1642-1649.
- Koulouri, O., & Gurnell, M. (2013). How to Interpret Thyroid Function Tests. *Clinical Medicine*, 13(2), 145-150.
- Kruppa, G., Schwarz, M., & Armitage, P. (2012). Risk Estimation and Prediction Using Machine-Learning Methods. *Statistical Methods in Medical Research*, 21(4), 377-393.
