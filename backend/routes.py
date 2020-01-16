import os
import secrets

from PIL import Image
from flask import request, url_for, jsonify
from flask_jwt_extended import create_access_token
from flask_login import login_user, logout_user, login_required, current_user
from sqlalchemy import func
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
        current_user.image = 'default.jpg'
    else:
        current_user.image = save_picture(data['file'])
    db.session.commit()

    return jsonify({'image_file': url_for('static', filename='profile_pics/' + save_picture(data['file']))})


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
                    'email': user.email,
                    'image_file': image_file,
                    'followers': len(user.followers.all()),
                    'followed': len(user.followed.all()),
                    'about': about})


@login_manager.user_loader
def load_user(user_name):
    print(user_name + ' is attempted to load..')
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
        print("user not found")
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


@app.route('/following/<string:user_id>', methods=['GET'])
@login_required
def following(user_id):
    User.query.get_or_404(user_id)
    f = Follow.query.filter_by(follower_name=user_id).all()
    users_names = [item.followed_name for item in f]
    res = [get_user(u).get_json() for u in users_names]
    return jsonify({'following': res})


@app.route('/followers/<string:user_id>', methods=['GET'])
@login_required
def followers(user_id):
    User.query.get_or_404(user_id)
    f = Follow.query.filter_by(followed_name=user_id).all()
    users_names = [item.follower_name for item in f]
    res = [get_user(u).get_json() for u in users_names]
    return jsonify({'followers': res})


@app.route('/posts/<string:user_id>', methods=['GET'])
@login_required
def get_posts(user_id):
    """ This route returns posts for feed - both his and of these he follows """
    User.query.get_or_404(user_id)
    res = get_posts_of_specific_user(user_id)

    f = Follow.query.filter_by(follower_name=user_id).all()
    users_names = [item.followed_name for item in f]
    for user_name in users_names:
        user_posts = get_posts_of_specific_user(user_name)
        res = res + user_posts
    return jsonify(res)


def get_posts_of_specific_user(user_id):
    """ Is a helper function """
    posts_of_current = Post.query.filter_by(user_name=user_id)
    current = get_user(user_id).get_json()
    res = [{'id': post.id,
            'user_name': post.user_name,
            'user_image': current['image_file'],
            'start_date': post.start_date,
            'end_date': post.end_date,
            'post_date': post.post_date,
            'about': post.about,
            'latitude': post.latitude,
            'longitude': post.longitude
            } for post in posts_of_current]
    return res

    # id = db.Column(db.Integer, primary_key=True)
    # user_name = db.Column(db.String(64), db.ForeignKey('users.user_name'), nullable=False)
    # # location = db.Column(Geometry('POINT'), nullable=False)
    # start_date = db.Column(db.DateTime, nullable=False)
    # end_date = db.Column(db.DateTime, nullable=False)
    # post_date = db.Column(db.DateTime, default=datetime.datetime.utcnow(), nullable=False)
    # about = db.Column(db.Text)


@app.route("/post/new", methods=['PUT'])
@login_required
def add_post():
    data = request.get_json()
    print(data)
    if not data \
            or 'user_name' not in data \
            or 'latitude' not in data \
            or 'longitude' not in data \
            or 'start_date' not in data \
            or 'end_date' not in data \
            or 'about' not in data:
        abort(400)

    max_id = db.session.query(func.max(Post.id)).scalar()
    post = Post(id=max_id + 1,
                user_name=data["user_name"],
                latitude=data["latitude"],
                longitude=data["longitude"],
                start_date=data['start_date'],
                end_date=data['end_date'],
                about=data['about'])

    db.session.add(post)
    db.session.commit()
    return 'Created'


@app.route("/post/delete", methods=['PUT'])
@login_required
def delete_post():
    data = request.get_json()
    print(data)
    if not data \
            or 'user_name' not in data \
            or 'post_id' not in data:
        abort(400)

    Post.query.filter_by(id=data['post_id']).delete()
    db.session.commit()
    print('Deleted')
    return 'Deleted'


@app.route("/post/update", methods=['PUT'])
@login_required
def update_post():
    data = request.get_json()
    print(data)
    if not data \
            or 'id' not in data \
            or 'user_name' not in data \
            or 'latitude' not in data \
            or 'longitude' not in data \
            or 'start_date' not in data \
            or 'end_date' not in data \
            or 'about' not in data:
        abort(400)

    check_post = Post.query.filter_by(id=data['id']).first()
    if not check_post:
        return "Not exist"

    check_post.latitude = data['latitude']
    check_post.longitude = data['longitude']
    check_post.start_date = data['start_date']
    check_post.end_date = data['end_date']
    check_post.about = data['about']

    # Add notification that post was updated
    max_id = db.session.query(func.max(Notification.id)).scalar()
    if max_id:
        max_id += 1
    else:
        max_id = 1
    note = Notification(id=max_id,
                        user_name=data['user_name'],
                        post_id=data['id'],
                        description='updated',
                        date=datetime.datetime.utcnow())

    db.session.add(note)
    db.session.commit()
    return 'Updated'


@app.route("/post/subscribe", methods=['PUT'])
@login_required
def subscribe_to_post():
    data = request.get_json()
    print(data)
    if not data or 'post_id' not in data or 'user_name' not in data:
        abort(400)

    check_post = Post.query.filter_by(id=data['post_id']).first()
    if not check_post:
        return "Post not exist"

    subscribe = Subscribe.query.filter_by(user_name=data['user_name'],
                                          post_id=data['post_id']).first()
    if subscribe:
        Subscribe.query.filter_by(user_name=data['user_name'],
                                  post_id=data['post_id']).delete()
        db.session.commit()
        return 'Unsubscribed'
    else:
        max_id = db.session.query(func.max(Subscribe.id)).scalar()
        if max_id:
            max_id += 1
        else:
            max_id = 1
        new_subscribe = Subscribe(id=max_id,
                                  user_name=data['user_name'],
                                  post_id=data['post_id'])
        db.session.add(new_subscribe)
        db.session.commit()
        return 'Subscribed'


@app.route("/post/is_subscribed", methods=['GET'])
@login_required
def is_subscribed_to():
    data = request.get_json()
    print(data)
    if not data or 'post_id' not in data or 'user_name' not in data:
        abort(400)
    check_post = Post.query.filter_by(id=data['post_id']).first()
    if not check_post:
        return "Post not exist"
    subscribe = Subscribe.query.filter_by(user_name=data['user_name'],
                                          post_id=data['post_id']).first()
    if subscribe:
        return "True"
    else:
        return "False"


@app.route("/subscriptions/<string:user_id>", methods=['GET'])
@login_required
def get_subscriptions(user_id):
    subscribes = Subscribe.query.filter_by(user_name=user_id).all()
    post_ids = [s.post_id for s in subscribes]
    print(post_ids)
    return jsonify(post_ids)


@app.route("/notifications/<string:user_id>", methods=['GET'])
@login_required
def get_notifications(user_id):
    subscribes = Subscribe.query.filter_by(user_name=user_id).all()
    post_ids = [s.post_id for s in subscribes]
    all_notifications = []
    for post_id in post_ids:
        post_notifications = Notification.query.filter_by(post_id=post_id).all()
        all_notifications = all_notifications + post_notifications
    res = []
    for note in all_notifications:
        user = User.query.get_or_404(note.user_name)
        res.append({
            'id': note.id,
            'post_id': note.post_id,
            'user_name': note.user_name,
            'date': note.date,
            'description': note.description,
            'user_image': url_for('static', filename='profile_pics/' + user.image)
        })
    print(res)
    return jsonify(res)


@app.route("/notification/delete", methods=['PUT'])
@login_required
def delete_notification():
    data = request.get_json()
    print(data)
    if not data \
            or 'user_name' not in data \
            or 'note_id' not in data:
        abort(400)

    note = Notification.query.filter_by(id=data['note_id']).first()
    if not note:
        return 'Notification does not exist'
    Notification.query.filter_by(id=data['note_id']).delete()
    db.session.commit()
    return 'Deleted'


@app.route("/delete", methods=['PUT'])
@login_required
def delete_user():
    print("inside delete user")
    user = User.query.filter_by(user_name=current_user.user_name).first()
    if not user:
        return "User does not exist!"
    else:
        User.query.filter_by(user_name=current_user.user_name).delete()
        print("removed")

        db.session.commit()
        print("committed")

        return "Deleted"
