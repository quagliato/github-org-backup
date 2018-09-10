const got = require('got')
const {
  GITHUB_API_URL,
  GITHUB_AUTH_USER,
  GITHUB_AUTH_TOKEN
} = process.env

function listOrgRepos (orgHandle, page = 1) {
  log(`Buscando repositórios da organização ${orgHandle}...`)
  
  const getRepos = (orgHandle, page) => {
    log(`Página ${page}...`)
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
      log(`Página ${page}: retornados ${result.body.length} repositórios.`)
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
      log(`Total de repositórios encontrados: ${result.length}`)
      return result
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error(`Não foi possível listar os repositórios da organizaçao ${orgHandle}.`)
    })
}

module.exports = {
  listOrgRepos
}