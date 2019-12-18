const git = require('simple-git/promise')
const {
  GITHUB_AUTH_TOKEN,
  GITHUB_AUTH_USER,
  DEBUG
} = process.env

const isDebuging = () => !!DEBUG;
const createRemote = (orgHandle, repoName) => `https://${GITHUB_AUTH_USER}:${GITHUB_AUTH_TOKEN}@github.com/${orgHandle}/${repoName}`
const repoPath = (localPath, repoName) => `${localPath}/${repoName}`
const gitRepo = (localPath, repoName) => git(repoPath(localPath, repoName)).silent(isDebuging())

const cloneRepo = (orgHandle, repoName, localPath) => {
  return git()
    .clone(createRemote(orgHandle, repoName), repoPath(localPath, repoName))
    .then(() => {
      log(`Repo ${orgHandle}/${repoName} cloned.`)
      return openRepo(orgHandle, repoName, localPath)
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error('It was not possible to clone this repo.')
    })
}

const openRepo = (orgHandle, repoName, localPath) => {
  return git(repoPath(localPath, repoName))
    .silent(isDebuging)
    .status()
    .catch(err => {
      log(`Repo ${orgHandle}/${repoName} is not cloned, it will be cloned.`)
      return cloneRepo(orgHandle, repoName, localPath)
    })
    .then(() => fetchAll(orgHandle, repoName, localPath))
}

const fetchAll = (orgHandle, repoName, localPath) => {
  log(`Fetching all of repo ${orgHandle}/${repoName}`);
  return branches(orgHandle, repoName, localPath)
    .then(branchList => {
      console.log(branchList)
      return branchList.map(branchName => fetch(orgHandle, repoName, localPath, branchName))
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error(`It was not possible to fetch the branches for this repo.`)
    })
}

const checkout = (orgHandle, repoName, localPath, branch) => {
  return gitRepo(localPath, repoName)
    .checkoutLocalBranch(branch)
    .pull()
    .checkoutLocalBranch('master')
    .then(() => {
      return repoPath(localPath, repoName)
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error(`Could not pull branch ${branch} of this repo.`)
    })
}

const fetch = (orgHandle, repoName, localPath, branch) => {
  log(`Fetching branch ${branch} of repo ${orgHandle}/${repoName}`);
  return gitRepo(localPath, repoName)
    .fetch(createRemote(orgHandle, repoName), branch)
    .then(() => checkout(orgHandle, repoName, localPath, branch))
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error(`It was not possible to fetch the branch ${branch} for this repo.`)
    })
}

const branches = (orgHandle, repoName, localPath) => {
  log(`Listing branches of repo ${orgHandle}/${repoName}`);
  return gitRepo(localPath, repoName)
    .branch()
    .then(branchesReponse => {
      log(`${branchesReponse.all.length} branches found.`)
      return branchesReponse.all
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error('It was not possible to fetch branchs for this repo.')
    })
}

module.exports = {
  openRepo,
  cloneRepo,
  fetchAll
}