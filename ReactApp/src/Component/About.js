import React, { Component } from 'react'
import jwt_decode from 'jwt-decode'
import moment from "moment";
import axios from "axios";
import Alert from "reactstrap/es/Alert";
import DatePicker from "react-datepicker";
import Button from "reactstrap/es/Button";

const update = updatedUser => {
    axios.defaults.withCredentials = true;
  return axios
    .put('http://127.0.0.1:5000/users/'+updatedUser.id, {
      username: updatedUser.username,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      gender: updatedUser.gender,
      birth_date: updatedUser.birth_date,
      email: updatedUser.email,
    })
    .then(response => {
        return response.data
    })
}

const isChecked = gender =>
{
  let res=false;
  switch(gender.field){
    case 'Male': res= (gender.value=='male' || gender.value=='Male');
    break;
    case 'Female': res= (gender.value=='female' || gender.value=='Female');
    break;
    case 'Other': res= (gender.value=='other' || gender.value=='Other');
    break;
  }
  return res;
}
const validEmailRegex =
  RegExp(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i);

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
}

function ProfileInfo(props){
  return (
     <table className="table col-md-6 mx-auto">
            <tbody>
              <tr>
                <td><b>Username</b></td>
                <td>{props.username}</td>
              </tr>
              <tr>
                  <td><b>First Name</b></td>
                <td>{props.first_name}</td>
              </tr>
              <tr>
                  <td><b>Last Name</b></td>
                <td>{props.last_name}</td>
              </tr>
              <tr>
                  <td><b>Gender</b></td>
                <td>{props.gender}</td>
              </tr>
              <tr>
                  <td><b>Birth Date</b></td>
                <td>{moment(props.birth_date).format("LL")}</td>
              </tr>
              <tr>
                  <td><b>Email</b></td>
                <td>{props.email}</td>
              </tr>
            </tbody>
          </table>
  );
}

function EditProfile(props){
  return(
          <div className="col-md-6 mt-3 mx-auto">
     <form noValidate onSubmit={props.onSubmit}>
              <h1 className="h3 mb-3 font-weight-normal">Update Profile</h1>
              <div className="form-group">
                  {props.invalid >0 &&  <Alert color="danger">
                  Your update attempt is invalid. Please try again!
                </Alert> }
                <label htmlFor="name">Username</label>
                <input
                  type="text"
                  className="form-control"
                  name="username"
                  placeholder="Enter your username"
                  value={props.username}
                  onChange={props.onChange}
                  noValidate
                />
                 {props.errors.username.length > 0 &&
                <span className='error'>{props.errors.username}</span>}
                {props.user_taken > 0 &&
                <span className='error'>This username is taken</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">First name</label>
                <input
                  type="text"
                  className="form-control"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={props.first_name}
                  onChange={props.onChange}
                  noValidate
                />
                {props.errors.first_name.length > 0 &&
                <span className='error'>{props.errors.first_name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">Last name</label>
                <input
                  type="text"
                  className="form-control"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={props.last_name}
                  onChange={props.onChange}
                  noValidate
                />
                 {props.errors.last_name.length > 0 &&
                <span className='error'>{props.last_name}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="name">Gender</label><br></br>
                <input type="radio" name="gender" value="Male" onChange={props.onChange} checked={isChecked({field:'Male',value:props.gender})}/> Male<br></br>
                <input type="radio" name="gender" value="Female" onChange={props.onChange} checked={isChecked({field:'Female',value:props.gender})}/> Female<br></br>
                <input type="radio" name="gender" value="other" onChange={props.onChange} checked={isChecked({field:'Other',value:props.gender})}/> Other
              </div>
              <div className="form-group">
                  <label htmlFor="name">Birth date</label><br></br>
                <DatePicker
                 name="birth_date"
                 selected={new Date(props.birth_date)}
                 onChange={props.handlechange}
                 dateFormat="dd/MM/yyyy"
                 maxDate={new Date()}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  type="email"
                  className="form-control"
                  name="email"
                  placeholder="Enter email"
                  value={props.email}
                  onChange={props.onChange}
                  noValidate
                />
                  {props.errors.email.length > 0 &&
                <span className='error'>{props.errors.email}</span>}
                 {props.email_taken > 0 &&
                <span className='error'>This email is taken</span>}
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
  constructor() {
    super()
    this.state = {
      current_user: 0,
      username: '',
      first_name: '',
      last_name: '',
      gender: '',
      birth_date: '',
      email: '',
      errors: {
          username: '',
          email: '',
          first_name: '',
          last_name: '',
      },
      user_taken: 0,
      email_taken: 0,
      invalid: 0,
      flag: true,
      file: null,
        path_img:''
    }
    this.onChange = this.onChange.bind(this)
    this.onChangeImg = this.onChangeImg.bind(this)
    this.onSubmit = this.onSubmit.bind(this)
  }
  componentWillReceiveProps(){
    this.componentDidMount()
  }
  componentDidMount() {
     const token = localStorage.usertoken
    if (token) {
      const decoded = jwt_decode(token)
        this.setState({current_user: decoded.identity.id});
    }

        axios.get('http://127.0.0.1:5000/users/' + this.props.id).then((response) => {
                this.setState({
                   username: response.data.username,
                  first_name: response.data.first_name,
                  last_name: response.data.last_name,
                  gender: response.data.gender,
                  birth_date: response.data.birth_date,
                  email: response.data.email
                })
            }).catch(err => {
                console.log(err)
            });
  }

  toggleUpdate(){
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
      file:null
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
        const { name, value } = e.target;

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
                  validEmailRegex.test(value)  && value.length <= 120
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
    this.setState({file:e.target.files[0]})
  }
  uploadImg(){
      let img = this.state.file;
      const formData = new FormData();
      formData.append("file", img);
      axios.defaults.withCredentials = true;
      axios
        .put("http://127.0.0.1:5000/image/"+this.props.id, formData)
        .then(res =>
            {console.log(res.data.image_file)
                this.props.updatePic({image_file:res.data.image_file});
            }

        )
        .catch(err => {
            console.warn(err)
            this.setState({path_img:''})
        });

  }
  onSubmit(e) {
    e.preventDefault()
    this.setState({invalid: 0});
    this.setState({user_taken: 0});
    this.setState({email_taken: 0});

    const updatedUser = {
      id: this.props.id,
      username: this.state.username,
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      gender: this.state.gender,
      birth_date: this.state.birth_date,
      email: this.state.email,
    }
      const info={
        email: this.state.email,
          username: this.state.username
    }

     if (validateForm(this.state.errors)) {
         update(updatedUser).then(res => {
             if (res == 'Updated') {
                 if (this.state.file){
                     this.uploadImg()
                     this.props.updateInfo(info);
                 }
                 else
                     {
                                                console.log("here5");

                         this.props.updateInfo(info);
                     }
               this.setState({flag: true, file:null});
             }
             if (res == 'Username Taken'){
                 this.setState({user_taken: 1});
                 this.setState({invalid: 1});
             }
             if (res == 'Email Taken'){
                 this.setState({email_taken: 1});
                 this.setState({invalid: 1});
             }
         })
     }
     else{
         this.setState({invalid: 1});
     }
  }

  render() {
    return (
      <div className="container">
        <div className="jumbotron mt-1">
          {this.state.flag && <ProfileInfo
              username={this.state.username}
              first_name={this.state.first_name}
              last_name={this.state.last_name}
              gender={this.state.gender}
              birth_date={this.state.birth_date}
              email={this.state.email}
            />}
            <p className="m-md-4" align="center">
          {this.state.flag && (this.state.current_user == this.props.id) && <Button className="my-3" color="secondary" onClick={this.toggleUpdate.bind(this)}>Edit Profile</Button>}
            </p>
             {!this.state.flag && <EditProfile
              username={this.state.username}
              first_name={this.state.first_name}
              last_name={this.state.last_name}
              gender={this.state.gender}
              birth_date={this.state.birth_date}
              email={this.state.email}
              errors={this.state.errors}
              onChange={this.onChange}
              handlechange={this.handleChange}
              onSubmit={this.onSubmit}
              invalid={this.state.invalid}
              user_taken={this.state.user_taken}
              email_taken={this.state.email_taken}
              flag={this.state.flag}
              toggleUpdate={this.toggleUpdate}
              onchangeimg={this.onChangeImg}
            />}
            <div className="col-md-6 mt-1 mx-auto">
            {!this.state.flag && <Button className="btn btn-lg btn-block" color="secondary" onClick={this.toggleUpdate.bind(this)}>Cancel</Button>}
            </div>
            </div>
      </div>
    )
  }
}


export default About