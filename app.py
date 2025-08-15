from flask import Flask, render_template, request, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from tinydb import TinyDB, Query
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'  # Change this to a secure random key

# Initialize TinyDB
db = TinyDB('users.json')
User_table = Query()

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

if __name__ == '__main__':
    app.run(debug=True)
