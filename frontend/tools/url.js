const apiUrl = process.env.API_URL
export function getFullUrl(path) {
  return `${apiUrl}/${encodeURI(path)}`
}
