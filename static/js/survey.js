// Survey Form Controller
class SurveyForm {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 8;
        this.isFemale = false;
        this.form = document.getElementById('surveyForm');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.init();
    }

    init() {
        // Event listeners
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.prevBtn.addEventListener('click', () => this.previousQuestion());
        
        // Listen for gender change to show/hide pregnancy question
        const genderRadios = document.querySelectorAll('input[name="gender"]');
        genderRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleGenderChange());
        });

        // Display first question
        this.showQuestion(1);
    }

    handleGenderChange() {
        const genderValue = document.querySelector('input[name="gender"]:checked')?.value;
        this.isFemale = genderValue === 'F';
        
        // Update total questions based on gender
        if (this.isFemale) {
            this.totalQuestions = 9;
        } else {
            this.totalQuestions = 8;
        }
    }

    nextQuestion() {
        // Validate current question
        if (!this.validateQuestion(this.currentQuestion)) {
            this.showValidationError();
            return;
        }

        // For question 1 (gender), update the total questions
        if (this.currentQuestion === 1) {
            this.handleGenderChange();
        }

        // Move to next question
        if (this.currentQuestion < this.totalQuestions) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
        } else {
            // All questions answered, submit the form
            this.submitForm();
        }
    }

    previousQuestion() {
        if (this.currentQuestion > 1) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
        }
    }

    validateQuestion(questionNum) {
        const question = document.getElementById(`question-${questionNum}`);
        const inputs = question.querySelectorAll('input[required]');
        
        for (let input of inputs) {
            if (input.type === 'radio') {
                // Check if any radio in the group is selected
                const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(radioGroup).some(r => r.checked);
                if (!isChecked) return false;
            } else if (input.type === 'number') {
                if (!input.value || isNaN(input.value)) return false;
            } else {
                if (!input.value) return false;
            }
        }
        return true;
    }

    showValidationError() {
        const currentQuestion = document.getElementById(`question-${this.currentQuestion}`);
        currentQuestion.classList.add('error-highlight');
        
        setTimeout(() => {
            currentQuestion.classList.remove('error-highlight');
        }, 2000);
    }

    showQuestion(questionNum) {
        // Hide all questions
        document.querySelectorAll('.survey-question').forEach(q => {
            q.style.display = 'none';
        });

        // Show current question with animation
        const currentQuestion = document.getElementById(`question-${questionNum}`);
        currentQuestion.style.display = 'block';
        currentQuestion.classList.add('fade-in');

        // Update progress bar
        this.updateProgress();

        // Update button states
        this.prevBtn.style.display = questionNum === 1 ? 'none' : 'block';
        this.nextBtn.textContent = questionNum === this.totalQuestions ? 'Submit Assessment →' : 'Next →';

        // Scroll to form
        this.form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    updateProgress() {
        const progressPercentage = (this.currentQuestion / this.totalQuestions) * 100;
        this.progressFill.style.width = progressPercentage + '%';
        this.progressText.textContent = `Question ${this.currentQuestion} of ${this.totalQuestions}`;
    }

    submitForm() {
        // Validate final question
        if (!this.validateQuestion(this.currentQuestion)) {
            this.showValidationError();
            return;
        }

        // Collect form data
        const formData = new FormData(this.form);
        const data = {
            gender: formData.get('gender'),
            age: parseFloat(formData.get('age')),
            tsh: parseFloat(formData.get('tsh')),
            t3: parseFloat(formData.get('t3')),
            tt4: parseFloat(formData.get('tt4')),
            t4u: parseFloat(formData.get('t4u')),
            fti: parseFloat(formData.get('fti')),
            tbg: parseFloat(formData.get('tbg')),
            pregnant: formData.get('pregnant') || null
        };

        // Show loading spinner
        this.loadingSpinner.style.display = 'flex';
        this.form.style.opacity = '0.5';
        this.nextBtn.disabled = true;
        this.prevBtn.disabled = true;

        // Send to backend
        fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(result => {
            // Store results in sessionStorage and redirect
            sessionStorage.setItem('predictionResults', JSON.stringify(result));
            window.location.href = '/results';
        })
        .catch(error => {
            console.error('Error:', error);
            this.loadingSpinner.style.display = 'none';
            this.form.style.opacity = '1';
            this.nextBtn.disabled = false;
            this.prevBtn.disabled = false;
            alert('Error submitting assessment. Please try again.');
        });
    }
}

// Initialize survey when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SurveyForm();
});
