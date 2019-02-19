import React from 'react'
import * as ENDPOINT from '../configs/endpoints'
import jwtAxios, { saveAccessToken, saveRefreshToken, toCamel } from '../utils/axiosWrapper'


class LoginPage extends React.PureComponent {
  constructor(props) {
    super(props)

    this.state = {
      email: 'iqejjw@gmail.com',
      password: 'helloworld',
      data: ''
    }
  }

  onPressSubmit = async (event) => {
    event.preventDefault()

    try {
      const { email, password } = this.state
      let response = await jwtAxios.post(
        ENDPOINT.BASE_URL + '/auth/login', {
          email, password
        }
      )
      const data = toCamel(response)
      const { accessToken, refreshToken } = data.tokens

      // Saving access token
      saveAccessToken(accessToken)

      // Saving refresh token
      saveRefreshToken(refreshToken)

      const stringified = JSON.stringify(data, null, 2)
      console.log(stringified)
      this.setState({ data: stringified })
    } catch (err) {
      console.log(err)
    }
  }

  render() {
    const { email, password, data } = this.state

    return (
      <div className="row" style={{ width: '75%' }}>
        <form>
          <div className="col-12">
            <label>Email</label>
            <input 
              type="text"
              name="email"
              value={ email }
              onChange={ e => this.setState({ email: e.target.value }) }
            />
          </div>
          <div className="col-12">
          <label>Password</label>
            <input 
              type="password" 
              name="password"
              value={ password }
              onChange={ e => this.setState({ password: e.target.value }) }
            />
          </div>
          <div className="col-12">
            <input type="submit" value="Submit" onClick={ this.onPressSubmit } />
          </div>
        </form>
        <div className="col-12">
          <textarea
            style={{ width: '100%', minHeight: '300px' }}
            value={ data }
          />
        </div>
      </div>
    )
  }
}


export default LoginPage