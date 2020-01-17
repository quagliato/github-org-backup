const git = require('simple-git/promise')
const {
  DEBUG
} = process.env

const isDebuging = () => !!DEBUG;

const cloneRepo = (repoPath, remote) => {
  log(`Cloning repo...`)
  return git()
    .clone(remote, repoPath)
    .then(() => {
      log(`Repo cloned.`)
      return openRepo(repoPath)
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error('It was not possible to clone this repo.')
    })
}

const openRepo = (repoPath, remote) => {
  const gitRepo = git(repoPath).silent(isDebuging())
  return gitRepo
    .status()
    .then(() => gitRepo)
    .catch(err => {
      log(`Repo is not cloned, it will be cloned.`)
      return cloneRepo(repoPath, remote)
    })
}

const fetchAll = (repo) => {
  return repo
    .fetch()
    .then(() => repo)
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error(`It was not possible to fetch the branches for this repo.`)
    })
}

const pullAllBranches = async (repo) => {
  const branchesList = await branches(repo);
  for (let branchName of branchesList) {
    await pull(repo, branchName)
  }

  return repo
}

const branches = (repo) => {
  return repo
    .branch()
    .then(branchesResponse => branchesResponse.all.map(branchName => branchName.replace('remotes/origin/', '')))
    .then(branchesList => {
      log(`${branchesList.length} branches found.`)
      return branchesList
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error('It was not possible to fetch branchs for this rbranchesReponse.all)epo.')
    })
}

const pull = (repo, branch) => {
  log(`Checkouting branch ${branch}`);
  return repo
    .checkout(branch)
    .then(() => repo.pull('origin', branch))
    .then(() => repo)
    .catch(err => {
      log(err, 'WARNING')
      log(`Branch ${branch} does not exist anymore.`)
      return deleteBranch(repo, branch)
    })
}

const deleteBranch = (repo, branch) => {
  return repo
    .checkout('master')
    .then(() => repo.deleteLocalBranch(branch))
    .then(() => {
      log(`Branch ${branch} deleted`)
      return repo
    })
    .catch(err => {
      log(err, 'WARNING')
      return repo
    })
}

module.exports = {
  openRepo,
  fetchAll,
  pullAllBranches
}