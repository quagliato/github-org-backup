const compressor = require('./utils/compressor')
const fs = require('fs')
const githubClient = require('./client/github')
const gitClient = require('./client/git')
const fildes = require('fildes-extra')
const path = require('path')

async function processRepo (orgHandle, reposPath, repo) {
  const localPath = `${path.dirname(require.main.filename)}/${reposPath}/${repo}`
  if (fs.existsSync(localPath)) {
    await fildes.rmdir(localPath)
  }

  return gitClient.cloneRepo(`git@github.com:${orgHandle}/${repo}`, localPath)
    .then(localPath => gitClient.fetchAllRepo(localPath))
    .then(localPath => compressor.compressDir(localPath, `${localPath}.tar.gz`))
    .then(compressResult => {
      log(`Excluindo diretório ${localPath}...`)
      return fildes.rmdir(localPath)
    })
    .then(exclusionResult => {
      log(`Diretório ${localPath} excluído.`)
      return localPath
    })
}

async function run () {
  const orgHandle = process.argv[2]
  const reposPath = process.argv[3] || 'localRepos'
  
  const exists = fs.existsSync(`./${reposPath}`)
  if (!exists) {
    fs.mkdirSync(`./${reposPath}`)
  }

  try {
    const repos = await githubClient.listOrgRepos(orgHandle)
    for (const repo of repos) {
      await processRepo(orgHandle, reposPath, repo.name)
    }

    process.exit(0)
  } catch (e) {
    log(e, 'CRITICAL')
    process.exit(1)
  }
}

run()