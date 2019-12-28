import password as password
from flask import Flask, redirect, url_for
from flask_login import LoginManager, UserMixin, logout_user, login_user, login_required
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import synonym
from werkzeug.security import generate_password_hash, check_password_hash
import os

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hard to guess string'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:12345@localhost/final_project'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.session_protection = 'strong'
login_manager.login_view = 'login'
login_manager.init_app(app)


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    user_name = db.Column(db.String(64), unique=True, index=True, primary_key=True)
    email = db.Column(db.String(64), unique=True, index=True)
    password_hash = db.Column(db.String(128))
    about = db.Column(db.Text)
    image = db.Column(db.Binary)
    id = synonym('user_name')

    @property
    def password(self):
        raise AttributeError("Not accessible")

    @password.setter
    def password(self, pwd):
        self.password_hash = generate_password_hash(pwd)

    def verify_password(self, pwd):
        return check_password_hash(self.password_hash, pwd)

    def __repr__(self):
        return '<User %r>' % self.username


# neta = User(user_name='Neta', email='neta@gmail.com', about='I am TA!', password='12345', image=b'12345')
# db.session.add(neta)
# db.session.commit()


@login_manager.user_loader
def load_user(user_name):
    print(user_name + ' logs in...')
    return User.query.get(user_name)


@app.route('/login')
def login():
    name, passw = 'Neta', '12345'
    user = User.query.filter_by(user_name=name).first()
    if user is not None and user.verify_password(passw):
        login_user(user)
        return redirect(url_for('secret'))
    return 'Invalid username or password'


@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/secret')
@login_required
def secret():
    return 'Secret, only for authenticated user...'


@app.route('/home')
def home():
    return 'Welcome Home!'


@app.route('/')
def index():
    return 'Please login first'


if __name__ == '__main__':
    app.run()
