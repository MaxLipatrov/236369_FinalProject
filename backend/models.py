from flask_login import UserMixin
from sqlalchemy.orm import synonym
from werkzeug.security import generate_password_hash, check_password_hash
import datetime
from backend import db


class Follow(db.Model):
    __tablename__ = 'follows'
    follower_name = db.Column(db.String(64), db.ForeignKey('users.user_name'), primary_key=True, nullable=False)
    followed_name = db.Column(db.String(64), db.ForeignKey('users.user_name'), primary_key=True, nullable=False)
    start_date = db.Column(db.DateTime, default=datetime.datetime.utcnow(), nullable=False)

    def __repr__(self):
        return f"Follow('{self.follower_name},{self.followed_name},{self.start_date}')"


class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(64), db.ForeignKey('users.user_name'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    post_date = db.Column(db.DateTime, default=datetime.datetime.utcnow(), nullable=False)
    about = db.Column(db.Text)

    def __repr__(self):
        return f"Post('{self.id}','{self.user_name}','{self.post_date}')"


class Notification(db.Model):
    __tablename__ = 'notifications'
    user_name = db.Column(db.String(64), db.ForeignKey('users.user_name'), primary_key=True, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.utcnow(), nullable=False)

    def __repr__(self):
        return f"Notification('{self.user_name}','{self.post_id}','{self.date}')"


class Subscribe(db.Model):
    __tablename__ = 'subscribes'
    user_name = db.Column(db.String(64), db.ForeignKey('users.user_name'), primary_key=True, nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    user_name = db.Column(db.String(64), unique=True, index=True, primary_key=True, nullable=False)
    email = db.Column(db.String(64), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    about = db.Column(db.Text)
    image = db.Column(db.String(64))
    id = synonym('user_name')

    followed = db.relationship('Follow', foreign_keys=[Follow.follower_name],
                               backref=db.backref('follower', lazy='joined'),
                               lazy='dynamic', cascade='all, delete-orphan')

    followers = db.relationship('Follow', foreign_keys=[Follow.followed_name],
                                backref=db.backref('followed', lazy='joined'),
                                lazy='dynamic',
                                cascade='all, delete-orphan')

    subscribed = db.relationship('Subscribe', foreign_keys=[Subscribe.user_name],
                                 backref=db.backref('user', lazy='joined'),
                                 lazy='dynamic', cascade='all, delete-orphan')

    notifications = db.relationship('Notification', foreign_keys=[Notification.user_name],
                                    backref=db.backref('user', lazy='joined'),
                                    lazy='dynamic', cascade='all, delete-orphan')

    posts = db.relationship('Post', foreign_keys=[Post.user_name],
                            backref=db.backref('user', lazy='joined'),
                            lazy='dynamic', cascade='all, delete-orphan')

    def follow(self, user):
        if not self.is_following(user):
            f = Follow(follower_name=self.user_name, followed_name=user.user_name,
                       start_date=datetime.datetime.utcnow())
            db.session.add(f)

    def unfollow(self, user):
        f = self.followed.filter_by(followed_name=user.user_name).first()
        if f:
            db.session.delete(f)

    def is_following(self, user):
        if user.user_name is None:
            return False
        return self.followed.filter_by(
            followed_name=user.user_name).first() is not None

    def is_followed_by(self, user):
        if user.user_name is None:
            return False

        return self.followers.filter_by(
            follower_name=user.user_name).first() is not None


    @property
    def password(self):
        raise AttributeError("Not accessible")

    @password.setter
    def password(self, pwd):
        self.password_hash = generate_password_hash(pwd)

    def verify_password(self, pwd):
        return check_password_hash(self.password_hash, pwd)

    def __repr__(self):
        return f"User('{self.user_name}', '{self.email}', '{self.image}')"
