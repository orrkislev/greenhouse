export const prepareEmail = (username) => {
  return username.toLowerCase().split('@')[0] + '@chamama.org'
}
export const getUsernameFromEmail = (email) => {
  return email.split('@')[0]
}
export const preparePassword = (pinPass) => {
  return pinPass.toString().padStart(6, '0')
}