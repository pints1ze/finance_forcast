from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from tinydb import TinyDB, Query
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'  # Change this to a secure random key

# Initialize TinyDB
db = TinyDB('users.json')
transactions_db = TinyDB('transactions.json')
User_table = Query()
Transaction_table = Query()

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'

class User(UserMixin):
    def __init__(self, id, email, name):
        self.id = id
        self.email = email
        self.name = name

@login_manager.user_loader
def load_user(user_id):
    user_data = db.search(User_table.id == int(user_id))
    if user_data:
        user = user_data[0]
        return User(user['id'], user['email'], user['name'])
    return None

@app.route('/')
@login_required
def hello_world():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        remember = bool(request.form.get('remember'))
        
        user_data = db.search(User_table.email == email)
        if user_data and check_password_hash(user_data[0]['password'], password):
            user = User(user_data[0]['id'], user_data[0]['email'], user_data[0]['name'])
            login_user(user, remember=remember)
            return redirect(url_for('hello_world'))
        else:
            flash('Invalid email or password')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        
        # Check if user already exists
        if db.search(User_table.email == email):
            flash('Email already registered')
            return render_template('register.html')
        
        # Create new user
        user_id = len(db.all()) + 1
        hashed_password = generate_password_hash(password)
        
        db.insert({
            'id': user_id,
            'name': name,
            'email': email,
            'password': hashed_password
        })
        
        flash('Registration successful! Please login.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/add_transaction', methods=['POST'])
@login_required
def add_transaction():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(k in data for k in ('direction', 'amount', 'date')):
            return jsonify({'success': False, 'message': 'Missing required fields'}), 400
        
        # Validate amount
        try:
            amount = float(data['amount'])
            if amount <= 0:
                return jsonify({'success': False, 'message': 'Amount must be greater than 0'}), 400
        except (ValueError, TypeError):
            return jsonify({'success': False, 'message': 'Invalid amount format'}), 400
        
        # Validate direction
        if data['direction'] not in ['deposit', 'withdraw']:
            return jsonify({'success': False, 'message': 'Invalid direction'}), 400
        
        # Create transaction record
        transaction_id = len(transactions_db.all()) + 1
        transaction = {
            'id': transaction_id,
            'user_id': current_user.id,
            'direction': data['direction'],
            'amount': amount,
            'description': data.get('description', ''),
            'date': data['date'],
            'created_at': None  # You might want to add a timestamp here
        }
        
        # Save transaction
        transactions_db.insert(transaction)
        
        return jsonify({
            'success': True, 
            'message': f'{data["direction"].title()} of ${amount:.2f} added successfully!',
            'transaction': transaction
        })
        
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred while processing the transaction'}), 500

@app.route('/api/transactions/chart_data')
@login_required
def get_chart_data():
    try:
        # Get all transactions for the current user
        user_transactions = transactions_db.search(Transaction_table.user_id == current_user.id)
        
        # Sort transactions by date
        user_transactions.sort(key=lambda x: x['date'])
        
        if not user_transactions:
            return jsonify({
                'labels': [],
                'data': [],
                'cumulative_data': []
            })
        
        # Calculate cumulative balance over time
        cumulative_balance = 0
        chart_data = []
        labels = []
        
        for transaction in user_transactions:
            date = transaction['date']
            amount = transaction['amount']
            direction = transaction['direction']
            
            # Calculate cumulative balance
            if direction == 'deposit':
                cumulative_balance += amount
            elif direction == 'withdraw':
                cumulative_balance -= amount
            
            labels.append(date)
            chart_data.append(cumulative_balance)
        
        return jsonify({
            'labels': labels,
            'data': chart_data,
            'cumulative_data': chart_data
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch chart data'}), 500

@app.route('/api/balance')
@login_required
def get_current_balance():
    try:
        # Get all transactions for the current user
        user_transactions = transactions_db.search(Transaction_table.user_id == current_user.id)
        
        # Calculate current balance
        balance = 0
        for transaction in user_transactions:
            if transaction['direction'] == 'deposit':
                balance += transaction['amount']
            elif transaction['direction'] == 'withdraw':
                balance -= transaction['amount']
        
        return jsonify({
            'balance': balance,
            'transaction_count': len(user_transactions)
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch balance'}), 500

if __name__ == '__main__':
    app.run(debug=True)
