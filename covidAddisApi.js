const axios = require('axios')

const hosts = {
  travel: 'https://covidtravelreg.api.sandboxaddis.com/api/Travllers',
  communityInsepections: 'https://covidtollfreereg.api.sandboxaddis.com/api'
}

const requestGet = async (host, uri) => {
  try {
    const result = await axios.get(`${host}/${uri}`)
    return result.data
  } catch (error) {
    console.error('get error ', error)
  }
  return []
}

const getTravelers = async (host, ur) => {
  return requestGet(hosts.travel, 'GetAll')
}

const addTraveler = async (data) => {
  const result = await axios.post(`${hosts.travel}/AddTravler`, data)
  return result.data
}

const communityInspections = async () => {
    // TODO: pass token
  return requestGet(hosts.communityInsepections, 'CommunityInspections')
}

module.exports = {
  getTravelers,
  addTraveler,
  communityInspections
}
