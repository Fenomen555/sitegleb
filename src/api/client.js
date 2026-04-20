export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  })

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message = payload?.detail || payload?.message || 'API request failed'
    throw new Error(message)
  }

  return payload
}

export function fetchPublicNews() {
  return apiRequest('/api/news')
}

export function sendRegistrationMail(email, promo) {
  return apiRequest('/api/auth/register-mail', {
    method: 'POST',
    body: JSON.stringify({ email, promo }),
  })
}

export function sendRecoveryMail(email) {
  return apiRequest('/api/auth/recovery-mail', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function getAdminMe() {
  return apiRequest('/api/admin/me')
}

export function loginAdmin(login, password) {
  return apiRequest('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ login, password }),
  })
}

export function logoutAdmin() {
  return apiRequest('/api/admin/logout', { method: 'POST' })
}

export function fetchAdminNews() {
  return apiRequest('/api/admin/news')
}

export function createNewsItem(item) {
  return apiRequest('/api/admin/news', {
    method: 'POST',
    body: JSON.stringify(item),
  })
}

export function updateNewsItem(id, item) {
  return apiRequest(`/api/admin/news/${id}`, {
    method: 'PUT',
    body: JSON.stringify(item),
  })
}

export function deleteNewsItem(id) {
  return apiRequest(`/api/admin/news/${id}`, { method: 'DELETE' })
}

export function fetchAdmins() {
  return apiRequest('/api/admin/admins')
}

export function createAdmin(payload) {
  return apiRequest('/api/admin/admins', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdmin(id, payload) {
  return apiRequest(`/api/admin/admins/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
