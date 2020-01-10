import os
import secrets

from PIL import Image
from flask import request, url_for, jsonify
from flask_jwt_extended import create_access_token
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.exceptions import abort
from werkzeug.utils import redirect

from backend import app, db, login_manager, bcrypt
from backend.models import *


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(user_id)


def save_picture(form_picture):
    """ There's a secret hashed picture name, in order to avoid information leakage """
    random_hex = secrets.token_hex(8)
    _, f_ext = os.path.splitext(form_picture.filename)
    picture_fn = random_hex + f_ext
    picture_path = os.path.join(app.root_path, 'static/profile_pics', picture_fn)

    output_size = (250, 250)
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


@app.route("/update/<string:user_name>", methods=['PUT'])
@login_required
def update_user(user_name):
    data = request.get_json()

    if not data or 'username' not in data or 'email' not in data:
        abort(400)

    check_user = User.query.filter_by(email=data['email']).first()
    if check_user and check_user.user_name != user_name:
        return 'Email Taken'

    current_user.email = data['email']
    current_user.about = data['about']
    db.session.commit()

    return 'Updated'


@app.route("/image/<string:user_name>", methods=['PUT'])
@login_required
def update_image(user_name):
    data = request.files
    print(data)
    if not data or 'file' not in data:
        abort(400)
    if data['file'] == '':
        current_user.image = url_for('static', filename='profile_pics/default.jpg')
    else:
        current_user.image = url_for('static', filename='profile_pics/' + save_picture(data['file']))
    db.session.commit()
    return jsonify({'image_file': current_user.image})


@app.route("/users/<string:user_name>", methods=['GET'])
def get_user(user_name):
    print('querying for user')
    user = User.query.get_or_404(user_name)
    if user.image is None:
        image_file = url_for('static', filename='profile_pics/default.jpg')
    else:
        image_file = url_for('static', filename='profile_pics/' + user.image)

    about = user.about
    if about is None:
        about = 'No about information'

    return jsonify({'user_name': user.user_name,
                    'email': user.email, 'image_file': image_file,
                    'followers': len(user.followers.all()),
                    'followed': len(user.followed.all()),
                    'about': about})


@login_manager.user_loader
def load_user(user_name):
    print(user_name + ' is loaded...')
    return User.query.get(user_name)


@app.route("/login", methods=['GET', 'POST'])
def login():
    print("inside login..")
    if current_user.is_authenticated:
        print("already authenticated..")
        abort(404)
    user_data = request.get_json()

    if not user_data or 'password' not in user_data or 'email' not in user_data:
        print("no enough parameters")
        abort(400)

    user = User.query.filter_by(email=user_data['email']).first()
    if user and bcrypt.check_password_hash(user.password_hash, user_data['password']):
        print(user.user_name + ' logs in...')
        login_user(user, remember=True)
        return create_access_token(identity={'user_name': user.user_name})
    else:
        abort(400)


@app.route("/signup", methods=['POST'])
def register():
    if current_user.is_authenticated:
        abort(400)
    data = request.get_json()

    if not data or 'password' not in data or 'username' not in data or 'email' not in data:
        abort(400)
    check_user = User.query.filter_by(email=data['email']).first()
    if check_user:
        return 'Email Taken'
    check_user = User.query.filter_by(user_name=data['username']).first()
    if check_user:
        return 'Username Taken'
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    user = User(user_name=data['username'],
                email=data['email'],
                password_hash=hashed_password,
                about=data["about"])
    db.session.add(user)
    db.session.commit()
    return 'Created'


@app.route('/logout')
@login_required
def logout():
    print('Logging out')
    logout_user()
    return 'Logged Out', 201


@app.route('/is_following/<string:user_id>', methods=['GET'])
@login_required
def is_following(user_id):
    user = User.query.get_or_404(user_id)

    if current_user.is_following(user):
        return 'True'
    return 'False'


@app.route('/is_following_me/<string:user_id>', methods=['GET'])
@login_required
def is_following_me(user_id):
    user = User.query.get_or_404(user_id)

    if user.is_following(current_user):
        return 'True'
    return 'False'


@app.route('/follow/<string:user_id>', methods=['POST', 'DELETE'])
@login_required
def follow(user_id):
    print('follow called')
    user = User.query.get_or_404(user_id)
    if current_user.is_following(user):
        print('is following - unfollowing now')
        current_user.unfollow(user)
    else:
        print('not following - following now')
        current_user.follow(user)
    db.session.commit()
    return 'True'

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
