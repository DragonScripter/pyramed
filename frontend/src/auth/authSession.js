let accessToken = null
let unauthorizedHandler = null

export function getAccessToken() {
  return accessToken
}

export function setAccessToken(token) {
  accessToken = typeof token === 'string' && token.length > 0 ? token : null
}

export function clearAccessToken() {
  accessToken = null
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = typeof handler === 'function' ? handler : null

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null
    }
  }
}

export function handleUnauthorizedResponse() {
  clearAccessToken()
  unauthorizedHandler?.()
}
