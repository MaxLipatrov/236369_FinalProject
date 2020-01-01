from flask import Flask
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from geopy.geocoders import Nominatim
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

import os

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SECRET_KEY'] = 'hard to guess string'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost:49375/final_project'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(os.getcwd(), 'data.sqlite')
# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost:49375/temp'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'secret'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
geolocator = Nominatim(user_agent="FlaskApp")

login_manager = LoginManager()
# login_manager.session_protection = 'strong'
login_manager.login_view = 'login'
# login_manager.init_app(app)
# login_manager = LoginManager(app)
# login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

# neta = User(user_name='Neta', email='neta@gmail.com', about='I am TA!', password='12345', image=b'12345')
# db.session.add(neta)
# db.session.commit()

from FlaskApp import routes

#
# if __name__ == '__main__':
#     app.run()
