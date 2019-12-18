const got = require('got')
const {
  GITHUB_API_URL,
  GITHUB_AUTH_USER,
  GITHUB_AUTH_TOKEN
} = process.env

function listOrgRepos (orgHandle, page = 1) {
  log(`Searching repos for org ${orgHandle}...`)
  
  const getRepos = (orgHandle, page) => {
    log(`Page ${page}...`)
    let authToken = `${GITHUB_AUTH_USER}:${GITHUB_AUTH_TOKEN}`
    authToken = Buffer.from(authToken).toString('base64')
    return got(`${GITHUB_API_URL}/orgs/${orgHandle}/repos?type=all&page=${page}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${authToken}`
      }
    })
    .then(async result => {
      result.body = JSON.parse(result.body)
      log(`Page ${page}: Found ${result.body.length} repos.`)
      if (result.body.length > 0) {
        return [
          ...result.body,
          ...(await (getRepos(orgHandle, page + 1)))
        ]
      }

      return result.body
    })
  }
  
  return getRepos(orgHandle, page)
    .then(result => {
      log(`Repos found: ${result.length}`)
      return result
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error(`It was not possible to find ${orgHandle} repositories.`)
    })
}

module.exports = {
  listOrgRepos
}