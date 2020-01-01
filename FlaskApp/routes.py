import os
import secrets

# from PIL import image
from flask import request, url_for, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.exceptions import abort
from werkzeug.utils import redirect

from FlaskApp import app, db, login_manager, bcrypt
from FlaskApp.models import *

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def save_picture(form_picture):
    """ There's a secret hashed picture name, in order to avoid information leakage """
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/profile_pics', picture_fn)

    output_size = (125, 125)
    i = Image.open(form_picture)
    i.thumbnail(output_size)
    i.save(picture_path)
    return picture_fn


def date_between(start_date, end_date, start_date_arg, end_date_arg):
    start_date_arg_converted = datetime.datetime.strptime(start_date_arg.split('T')[0], '%Y-%m-%d').date()
    end_date_arg_converted = datetime.datetime.strptime(end_date_arg.split('T')[0], '%Y-%m-%d').date()

    if start_date.date() <= end_date_arg_converted:
        return end_date.date() >= start_date_arg_converted
    return False


@app.route("/users/<string:user_name>", methods=['GET'])
def get_user(user_name):
    user = User.query.get_or_404(user_name)
    image_file = url_for('static', filename='profile_pics/' + user.image)

    return jsonify({'user_name': user.user_name,
                    'email': user.email, 'image': image_file,
                    'followers': len(user.followers.all()),
                    'followed': len(user.followed.all())})


@login_manager.user_loader
def load_user(user_name):
    print(user_name + ' logs in...')
    return User.query.get(user_name)


@app.route("/login", methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        abort(404)
    user_data = request.get_json()
    if not user_data or 'password' not in user_data or 'email' not in user_data:
        abort(400)

    user = User.query.filter_by(email=user_data['email']).first()
    if user and bcrypt.check_password_hash(user.password, user_data['password']):
        login_user(user, remember=True)
        return create_access_token(identity={'user_name': user.user_name})
    else:
        abort(400)


# @app.route('/login')
# def login():
#     name, passw = 'Neta', '12345'
#     user = User.query.filter_by(user_name=name).first()
#     if user is not None and user.verify_password(passw):
#         login_user(user)
#         return redirect(url_for('secret'))
#     return 'Invalid username or password'


@app.route("/signup", methods=['POST'])
def register():
    if current_user.is_authenticated:
        abort(400)
    data = request.get_json()

    if not data or 'password' not in data or 'username' not in data or 'first_name' not in data \
            or 'last_name' not in data or 'gender' not in data or 'birth_date' not in data or 'email' not in data:
        abort(400)
    check_user = User.query.filter_by(email=data['email']).first()
    if check_user:
        return 'Email Taken'
    check_user = User.query.filter_by(username=data['username']).first()
    if check_user:
        return 'Username Taken'
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(user_name=data['username'],
                email=data['email'],
                password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()
    return 'Created'


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))


@app.route('/secret')
@login_required
def secret():
    return 'Secret, only for authenticated user...'


@app.route('/')
def index():
    return 'Please login first'


#
# import datetime
# import os
# import secrets
# from PIL import Image
# from flask import url_for, request, abort, jsonify, make_response
# from FlaskApp import app, db, bcrypt, login_manager
# from FlaskApp.models import User
# from flask_login import login_user, current_user, logout_user, login_required
# from flask_jwt_extended import (create_access_token)
# import datetime
#
# @login_manager.user_loader
# def load_user(user_id):
#     return User.query.get(int(user_id))
#
#
# def save_picture(form_picture):
#     random_hex = secrets.token_hex(8)
#     _, f_ext = os.path.splitext(form_picture.filename)
#     picture_fn = random_hex + f_ext
#     picture_path = os.path.join(app.root_path, 'static/profile_pics', picture_fn)
#
#     output_size = (125, 125)
#     i = Image.open(form_picture)
#     i.thumbnail(output_size)
#     i.save(picture_path)
#     return picture_fn
#
#
# @app.errorhandler(404)
# def not_found(error):
#     return make_response((jsonify({'error': 'Not Found'})), 404)
#
#
# @app.errorhandler(400)
# def bad_request(error):
#     return make_response((jsonify({'error': 'Bad Request'})), 400)
#
#
# @app.errorhandler(403)
# def forbidden(error):
#     return make_response((jsonify({'error': 'Forbidden'})), 403)
#
#
# @app.route("/users/<int:user_id>", methods=['GET'])
# def get_user(user_id):
#     user = User.query.get_or_404(user_id)
#     image_file = url_for('static', filename='profile_pics/' + user.image_file)
#
#     return jsonify({'username': user.username, 'first_name': user.first_name, 'last_name': user.last_name,
#                     'gender': user.gender, 'birth_date': user.birth_date, 'email': user.email,
#                     'image_file': image_file, 'followers': len(user.followers.all()),
#                     'followed': len(user.followed.all())})
#
#
# @app.route("/user/<string:name>", methods=['GET'])
# def get_user_id(name):
#     user = User.query.filter_by(username=name).first()
#     if not user:
#         abort(404)
#     return jsonify({'id': user.id})
#
#
# @app.route("/user/new", methods=['POST'])
# def register():
#     if current_user.is_authenticated:
#         abort(400)
#     data = request.get_json()
#
#     if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
#             or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
#         abort(400)
#     check_user = User.query.filter_by(email=data['email']).first()
#     if check_user:
#         return 'Email Taken'
#     check_user = User.query.filter_by(username=data['username']).first()
#     if check_user:
#         return 'Username Taken'
#     hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
#     # user = User(username=data['username'], first_name=data['first_name'], last_name=data['last_name'],
#     #     #             gender=data['gender'], birth_date=datetime.datetime.now(), email=data['email'], password=hashed_password)
#     user = User(username=data['username'], email=data['email'], password=hashed_password, about=data['about'])
#     db.session.add(user)
#     db.session.commit()
#     return 'Created'
#
#
# @app.route("/login", methods=['GET', 'POST'])
# def login():
#     if current_user.is_authenticated:
#         abort(404)
#     user_data = request.get_json()
#     if not user_data or not 'password' in user_data or not 'email' in user_data:
#         abort(400)
#
#     user = User.query.filter_by(email=user_data['email']).first()
#     if user and bcrypt.check_password_hash(user.password, user_data['password']):
#         login_user(user, remember=True)
#         access_token = create_access_token(identity={'id': user.id})
#         result = access_token
#     else:
#         abort(400)
#
#     return result
#
#
# @app.route("/logout", methods=['GET'])
# @login_required
# def logout():
#     print('logging out')
#     logout_user()
#     return 'Logged Out', 201
#
#
#
# @app.route('/is_following/<int:user_id>', methods=['GET'])
# @login_required
# def is_following(user_id):
#     user = User.query.get_or_404(user_id)
#
#     if current_user.is_following(user):
#         return 'True'
#     return 'False'
#
#
# @app.route('/is_following_me/<int:user_id>', methods=['GET'])
# @login_required
# def is_following_me(user_id):
#     user = User.query.get_or_404(user_id)
#
#     if user.is_following(current_user):
#         return 'True'
#     return 'False'
#
# def date_between(start_date, end_date, start_date_arg, end_date_arg):
#     start_date_arg_converted = datetime.datetime.strptime(start_date_arg.split('T')[0], '%Y-%m-%d').date()
#     end_date_arg_converted = datetime.datetime.strptime(end_date_arg.split('T')[0], '%Y-%m-%d').date()
#
#     if start_date.date() <= end_date_arg_converted:
#         return end_date.date() >= start_date_arg_converted
#     return False
#
