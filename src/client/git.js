const fs = require('fs')
const git = require('nodegit')
const {
  GIT_USER,
  GIT_AUTH_PUBLIC_KEY_PATH,
  GIT_AUTH_PRIVATE_KEY_PATH,
  GIT_AUTH_PRIVATE_KEY_PASSWORD
} = process.env

function cloneRepo(remotePath, localPath) {
  log(`Cloning repo ${remotePath} in ${localPath}...`)
  const options = {
    fetchOpts: {
      callbacks: {
        credentials: function (url, userName) {
          const credential = git.Cred.sshKeyNew(GIT_USER, GIT_AUTH_PUBLIC_KEY_PATH, GIT_AUTH_PRIVATE_KEY_PATH, GIT_AUTH_PRIVATE_KEY_PASSWORD)
          return credential
        },
        certificateCheck: function () {
          return 1
        }
      }
    }
  }
  return git.Clone(remotePath, localPath, options)
    .then(() => {
      log(`Repo ${remotePath} cloned.`)
      return openRepo(remotePath, localPath)
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error('It was not possible to clone this repo.')
    })
}

function openRepo(remotePath, localPath) {
  return git.Repository.open(localPath)
    .then(repo => {
      log(`Repo ${localPath} is cloned, fetching it...`)
      return fetchAllRepo(repo, localPath)
    })
    .catch(err => {
      log(`Repo ${remotePath} is not cloned, it will be cloned.`)
      return cloneRepo(remotePath, localPath)
    })
}

function fetchAllRepo(repo, localPath) {
  const options = {
    callbacks: {
      credentials: function (url, userName) {
        const credential = git.Cred.sshKeyNew(GIT_USER, GIT_AUTH_PUBLIC_KEY_PATH, GIT_AUTH_PRIVATE_KEY_PATH, GIT_AUTH_PRIVATE_KEY_PASSWORD)
        return credential
      },
      certificateCheck: function () {
        return 1
      }
    }
  }

  return repo.fetchAll(options)
    .then(fetchAllResult => {
      log(`Repo ${localPath} fetched.`)
      return localPath
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error('It was not possible to fetch this repo.')
    })
}

function getRemote(localPath, remote) {
  return git.Repository.open(localPath)
    .then(repo => repo.getRemote(remote))
}


function getRemotes(localPath) {
  return git.Repository.open(localPath)
    .then(repo => repo.getRemotes())
}

module.exports = {
  openRepo,
  cloneRepo,
  fetchAllRepo,
  getRemote,
  getRemotes
}