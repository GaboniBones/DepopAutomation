const axios = require('axios')

let cachedToken = null
let tokenExpiry = null
let runtimeUsername = process.env.DEPOP_USERNAME || null
let runtimePassword = process.env.DEPOP_PASSWORD || null

function setCredentials(username, password) {
  runtimeUsername = username
  runtimePassword = password
  cachedToken = null
  tokenExpiry = null
  console.log('[Auth] Credentials updated, token cleared')
}

function clearToken() {
  cachedToken = null
  tokenExpiry = null
  runtimeUsername = null
  runtimePassword = null
  console.log('[Auth] Logged out, credentials cleared')
}

function hasCredentials() {
  return !!(runtimeUsername && runtimePassword)
}

async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const username = runtimeUsername
  const password = runtimePassword

  if (!username || !password) {
    throw new Error('Not logged in. Please provide Depop credentials.')
  }

  console.log('[Auth] Logging in to Depop as:', username)

  let res
  try {
    res = await axios.post(
      'https://api.depop.com/api/v2/auth/login/',
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Depop/3.0 (iPhone; iOS 17; Scale/3.00)',
          Accept: 'application/json',
        },
      }
    )
  } catch (err) {
    const status = err.response?.status
    const body = err.response?.data
    console.error('[Auth] Login failed — HTTP', status, JSON.stringify(body))
    if (status === 401 || status === 403) {
      throw new Error('Invalid Depop username or password.')
    }
    throw new Error(`Depop login error (${status || 'network'}): ${JSON.stringify(body) || err.message}`)
  }

  const token =
    res.data.access_token ||
    res.data.token ||
    res.data.accessToken ||
    res.data.data?.access_token

  if (!token) {
    console.error('[Auth] No token in response:', JSON.stringify(res.data))
    throw new Error('Depop login succeeded but no access token was returned.')
  }

  cachedToken = token
  tokenExpiry = Date.now() + 6 * 60 * 60 * 1000
  console.log('[Auth] Login successful, token cached for 6 hours')
  return cachedToken
}

module.exports = { getAccessToken, setCredentials, clearToken, hasCredentials }
