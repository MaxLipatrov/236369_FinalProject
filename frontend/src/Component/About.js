import React, {Component} from 'react'
import jwt_decode from 'jwt-decode'
import moment from "moment";
import axios from "axios";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import Button from "reactstrap/es/Button";

const update = updatedUser => {
    axios.defaults.withCredentials = true;
    return axios
        .put('http://127.0.0.1:5000/update/' + updatedUser.username, {
            username: updatedUser.username,
            email: updatedUser.email,
            about: updatedUser.about
        })
        .then(response => {
            return response.data
        })
};

const deleteUser = (user_name) => {
    return axios.put('http://127.0.0.1:5000/delete/' + user_name)
        .then(response => {
            return response.data;
        }).catch(err => {
            console.log(err);
        });
};

const logOutBeforeDelete = () => {
    axios.defaults.withCredentials = true;
    return axios.get('http://127.0.0.1:5000/logout').then(response => {
        return response.data;
    })
        .catch(err => {
            console.log(err)
        })
};


const validEmailRegex =
    RegExp(/^(([^<>()\[\].,;:\s@"]+(\.[^<>()\[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i);

const validateForm = (errors) => {
    let valid = true;
    Object.values(errors).forEach(
        (val) => val.length > 0 && (valid = false)
    );
    return valid;
};

function ProfileInfo(props) {
    return (
        <table className="table col-md-6 mx-auto">
            <tbody>
            <tr>
                <td><b>Username</b></td>
                <td>{props.username}</td>
            </tr>
            <tr>
                <td><b>Email</b></td>
                <td>{props.email}</td>
            </tr>
            <tr>
                <td><b>About</b></td>
                <td>{props.about}</td>
            </tr>
            </tbody>
        </table>
    );
}

function EditProfile(props) {
    return (
        <div className="col-md-6 mt-3 mx-auto">
            <form noValidate onSubmit={props.onSubmit}>
                <h1 className="h3 mb-3 font-weight-normal">Update Profile</h1>
                <div className="form-group">
                    <label htmlFor="email">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        placeholder="Enter email"
                        value={props.email}
                        onChange={props.onChange}
                    />
                    {props.errors.email.length > 0 &&
                    <span className='error'>{props.errors.email}</span>}
                    {props.email_taken > 0 &&
                    <span className='error'>This email is taken</span>}
                </div>
                <div className="form-group">
                    {props.invalid > 0 && <Alert color="danger">
                        Your update attempt is invalid. Please try again!
                    </Alert>}
                    <label htmlFor="about">About</label>
                    <textarea
                        rows="7"
                        className="form-control"
                        name="about"
                        placeholder="Write few words about yourself"
                        value={props.about}
                        onChange={props.onChange}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="image_file">Profile Picture</label>
                    <br/>
                    <input
                        type="file"
                        onChange={props.onchangeimg}
                        placeholder="Update your profile picture"
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-lg btn-primary btn-block"
                >
                    Update
                </button>
            </form>

        </div>
    );
}

export class About extends Component {
    constructor(props) {
        console.log("about props:" + props);
        super(props);
        this.state = {
            current_user: 0,
            username: '',
            email: '',
            about: '',
            errors: {
                username: '',
                email: '',
            },
            user_taken: 0,
            email_taken: 0,
            invalid: 0,
            flag: true,
            file: null,
            path_img: ''
        };
        this.onChange = this.onChange.bind(this);
        this.onChangeImg = this.onChangeImg.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    componentWillReceiveProps() {
        this.componentDidMount()
    }

    componentDidMount() {
        const token = localStorage.usertoken;
        if (token) {
            const decoded = jwt_decode(token);

            this.setState({current_user: decoded.identity.user_name});
        }

        axios.get('http://127.0.0.1:5000/users/' + this.props.id).then((response) => {
            this.setState({
                username: response.data.user_name,
                email: response.data.email,
                about: response.data.about,
                path_img: response.data.image_file
            })
        }).catch(err => {
            console.log(err)
        });
    }

    toggleUpdate() {
        this.setState({
            flag: !this.state.flag,
            errors: {
                username: '',
                email: '',
                first_name: '',
                last_name: '',
            },
            user_taken: 0,
            email_taken: 0,
            invalid: 0,
            file: null
        });
        if (!this.state.flag)
            this.componentDidMount();
    }

    handleChange = date => {
        this.setState({
            birth_date: date
        });
    };

    onChange(e) {
        //  e.preventDefault()
        let errors = this.state.errors;
        const {name, value} = e.target;

        switch (name) {
            case 'username':
                this.setState({user_taken: 0});
                errors.username =
                    value.length < 1 || value.length > 20
                        ? 'Username is not valid!'
                        : '';
                break;
            case 'email':
                this.setState({email_taken: 0});
                errors.email =
                    validEmailRegex.test(value) && value.length <= 120
                        ? ''
                        : 'Email is not valid!';
                break;
            case 'first_name':
                errors.first_name =
                    value.length > 20
                        ? 'First name is too long'
                        : '';
                break;
            case 'last_name':
                errors.last_name =
                    value.length > 20
                        ? 'Last name is too long'
                        : '';
                break;
            default:
                break;
        }
        this.setState({errors, [name]: value});
    }

    onChangeImg(e) {
        this.setState({file: e.target.files[0]})
    }

    uploadImg() {
        let img = this.state.file;
        const formData = new FormData();
        formData.append("file", img);
        axios.defaults.withCredentials = true;
        axios
            .put("http://127.0.0.1:5000/image/" + this.state.username, formData)
            .then(res => {
                    console.log(res.data.image_file);
                    this.props.updatePic({image_file: res.data.image_file});
                }
            )
            .catch(err => {
                console.warn(err)
                this.setState({path_img: ''})
            });

    }

    onSubmit(e) {
        e.preventDefault();
        this.setState({invalid: 0});
        this.setState({user_taken: 0});
        this.setState({email_taken: 0});

        const updatedUser = {
            username: this.state.username,
            email: this.state.email,
            about: this.state.about
        };
        const info = {
            email: this.state.email,
            username: this.state.username,
            about: this.state.about
        };

        if (validateForm(this.state.errors)) {
            update(updatedUser).then(res => {
                if (res === 'Updated') {
                    if (this.state.file) {
                        this.uploadImg();
                        this.props.updateInfo(info);
                    } else {
                        this.props.updateInfo(info);
                    }
                    this.setState({flag: true, file: null});
                }
                if (res === 'Email Taken') {
                    this.setState({email_taken: 1});
                    this.setState({invalid: 1});
                }
            });
        } else {
            this.setState({invalid: 1});
        }
    }

    render() {
        return (
            <div className="container">
                <div className="jumbotron mt-1">
                    {this.state.flag && <ProfileInfo
                        username={this.state.username}
                        email={this.state.email}
                        about={this.state.about}
                    />}
                    <p className="m-md-4" align="center">
                        {this.state.flag && (this.state.current_user === this.props.id) &&
                        <Button className="my-3" color="secondary" onClick={this.toggleUpdate.bind(this)}>Edit
                            Profile</Button>}
                    </p>
                    {!this.state.flag && <EditProfile
                        email={this.state.email}
                        about={this.state.about}
                        errors={this.state.errors}
                        onChange={this.onChange}
                        handlechange={this.handleChange}
                        onSubmit={this.onSubmit}
                        invalid={this.state.invalid}
                        email_taken={this.state.email_taken}
                        flag={this.state.flag}
                        toggleUpdate={this.toggleUpdate}
                        onchangeimg={this.onChangeImg}
                    />}
                    <div className="col-md-6 mt-1 mx-auto">
                        {!this.state.flag && <Button className="btn btn-lg btn-block" color="secondary"
                                                     onClick={this.toggleUpdate.bind(this)}>Cancel</Button>}
                    </div>
                    <div className="col-md-6 mt-1 mx-auto">
                        {!this.state.flag &&
                        <Button className="btn btn-lg btn-block btn-danger" color="secondary"
                                onClick=
                                    {
                                        (e) => {
                                            e.preventDefault();
                                            let res = window.confirm('Are you sure you want to delete your account?\n' +
                                                'This action is not undoable! All your data will be lost!\n' +
                                                'Proceed?');
                                            if (res) {
                                                let user_name = this.state.username;
                                                logOutBeforeDelete().then(() => {
                                                    localStorage.removeItem('usertoken');
                                                    deleteUser(user_name).then(() => {
                                                        window.location.replace("/");
                                                    });
                                                });

                                            }
                                        }
                                    }
                        >Delete Account</Button>}
                    </div>
                </div>
            </div>
        )
    }
}


export default About