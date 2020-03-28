const fildesExtra = require('fildes-extra')
const fs = require('fs')
const githubClient = require('./client/github')
const GitRepo = require('./client/git-simple')
const path = require('path')

function processRepo (orgHandle, reposPath, repo) {
  const localPath = `${path.dirname(require.main.filename)}/${reposPath}`
  log(`Processing ${orgHandle}/${repo}...`)
  const gitRepo = new GitRepo(orgHandle, repo, localPath)
  return gitRepo.pullAllBranches()
}

function chunkRepos (repos) {
  const chunkSize = 10
  const auxArray = []
  while (repos.length > 0) {
    auxArray.push(repos.splice(0, chunkSize))
  }

  return auxArray
}

async function run () {
  const begin = new Date()
  const orgHandle = process.argv[2]
  const reposPath = `${process.argv[3] || 'localRepos'}/${orgHandle}`
  
  const exists = fs.existsSync(reposPath)
  if (!exists) {
    log(`Storage directory ${reposPath} does not exist, creating...`)
    await fildesExtra.mkdir(reposPath)
    log(`Storage directory ${reposPath} created.`)
  }

  try {
    const repos = await githubClient.listOrgRepos(orgHandle)
    log(`Chunking repos...`)
    const chunks = chunkRepos(repos.map(repo => repo.name))
    log(`${chunks.length} chunks created.`)
    for (const chunk of chunks) {
      log(`Processing chunk #${chunks.indexOf(chunk)} of ${chunks.length}.`)
      await Promise.all(chunk.map(repo => processRepo(orgHandle, reposPath, repo)))
    }

    const end = new Date()
    log(`begin: ${begin}`)
    log(`end: ${end}`)
    log(`diff: ${end - begin}ms`)
    process.exit(0)
  } catch (e) {
    log(e, 'CRITICAL')
    process.exit(1)
  }
}

run()