const compressor = require('./utils/compressor')
const fs = require('fs')
const githubClient = require('./client/github')
const gitClient = require('./client/git-simple')
const fildes = require('fildes-extra')
const path = require('path')

const repoPath = (localPath, repoName) => `${localPath}/${repoName}`

async function processRepo (orgHandle, reposPath, repo) {
  const localPath = `${path.dirname(require.main.filename)}/${reposPath}`
  // if (fs.existsSync(localPath)) {
  //   await fildes.rmdir(localPath)
  // }

  // const repoPathA = repoPath(localPath, repo)
  return gitClient.openRepo(orgHandle, repo, localPath)
    // .then(() => compressor.compressDir(repoPathA, `${repoPathA}.tar.gz`))
    // .then(() => {
    //   log(`Excluindo diretório ${repoPathA}...`)
    //   return fildes.rmdir(repoPathA)
    // })
    // .then(() => {
    //   log(`Diretório ${repoPathA} excluído.`)
    //   return repoPathA
    // })
}

async function run () {
  const orgHandle = process.argv[2]
  const reposPath = `${process.argv[3] || 'localRepos'}`
  
  const exists = fs.existsSync(reposPath)
  if (!exists) {
    log(`Storage directory ${reposPath} does not exist, creating...`)
    fs.mkdirSync(reposPath)
    log(`Storage directory ${reposPath} created.`)
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