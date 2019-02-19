import _ from 'lodash'
import axios from 'axios'
import * as ENDPOINT from '../configs/endpoints'

const DEFAULT_TIMEOUT = 30000


/**
 * Initialisation
 */

export const normalAxios = axios.create({
  baseURL: ENDPOINT.BASE_URL,
  timeout: DEFAULT_TIMEOUT,
})

const jwtAxios = axios.create({
  baseURL: ENDPOINT.BASE_URL,
  timeout: DEFAULT_TIMEOUT,
})


/**
 * Axios Request Interceptor
 */

jwtAxios.interceptors.request.use(async (config) => {
  // Get a saved access token
  const accessToken = await loadAccessToken()

  // Set an authorization header with the current JWT
  config.headers['Authorization'] = 'Bearer ' + accessToken

  return config

}, err => Promise.reject(err))


/**
 * Axios Response Interceptor
 */

jwtAxios.interceptors.response.use(response => response, async (err) => {
  const { config, response } = err

  if (response && response.status === 401) {
    if (!config._retry) {
      config._retry = true

      // Get a new access token
      const refreshToken = await loadRefreshToken()
      const { data } = await getNewAccessToken(refreshToken)
      const newAccessToken = data['access_token']
      saveAccessToken(newAccessToken)
      
      // Set an authorization header with the new JWT
      config.headers['Authorization'] = 'Bearer ' + newAccessToken

      return jwtAxios(config)
  
    } else {
      // Remove saved tokens if refreshing access token failed
      removeSavedTokens()      

    }
  }

  return Promise.reject(err)
})


export default jwtAxios


export const toCamel = ({ data }) => {
  if (data.length > 0) {
    return data.map(row => (_keyParser(row, _.camelCase)))
  }
  return _keyParser(data, _.camelCase)
}


export const toSnake = (data) => {
  if (data.length > 0) {
    return data.map(row => (_keyParser(row, _.snakeCase)))
  }
  return _keyParser(data, _.snakeCase)
}


export const loadAccessToken = () => {
  return localStorage.getItem('accessToken')
}


export const loadRefreshToken = () => {
  return localStorage.getItem('refreshToken')
}


export const saveAccessToken = (accessToken) => {
  localStorage.setItem('accessToken', accessToken)
}


export const saveRefreshToken = (refreshToken) => {
  localStorage.setItem('refreshToken', refreshToken)
}


export const getNewAccessToken = (refreshToken) => {
  const newAccessToken = axios.get(ENDPOINT.REFRESH_TOKEN, {
    baseURL: ENDPOINT.BASE_URL,
    headers: {
      Authorization: 'Bearer ' + refreshToken 
    }
  })
  return newAccessToken
}


export const removeSavedTokens = () => {
  localStorage.multiRemove(['accessToken', 'refreshToken'])
}


const _keyParser = (data, parser) => {
  _.each(data, (v, k) => {
    const parsedKey = parser(k)

    // Delete an original data
    delete data[k]

    // Array datatype handler
    if (v instanceof Array) {
      data[parsedKey] = v.map(c => {
        if (c instanceof Array || c instanceof Object) {
          return _keyParser(c, parser)
        }
        return c
      })

    // Object datatype handler
    } else if (v instanceof Object) {
      data[parsedKey] = _keyParser(v, parser)

    // Primitive datatype handler
    } else {
      data[parsedKey] = v
    }
  })
  return data
}