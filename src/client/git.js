const git = require('nodegit')
const {
  GIT_USER,
  GIT_AUTH_PUBLIC_KEY_PATH,
  GIT_AUTH_PRIVATE_KEY_PATH,
  GIT_AUTH_PRIVATE_KEY_PASSWORD
} = process.env

function cloneRepo(remotePath, localPath) {
  log(`Clonando repositório ${remotePath} em ${localPath}...`)
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
    .then(result => {
      log(`Processo finalizado. Resultado:`)
      log(result)
      return localPath
    })
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error('Não foi possível clonar esse repositório.')
    })
}

function fetchAllRepo(localPath) {
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

  return git.Repository.open(localPath)
    .then(repo => repo.fetchAll(options))
    .then(() => localPath)
    .catch(err => {
      log(err, 'CRITICAL')
      throw new Error('Não foi possível executar um fetch neste repositório.')
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
  cloneRepo,
  fetchAllRepo,
  getRemote,
  getRemotes
}