const git = require('simple-git/promise')

const {
  DEBUG,
  GITHUB_AUTH_TOKEN,
  GITHUB_AUTH_USER,
} = process.env

const isDebuging = () => !!DEBUG;

class GitRepo {
  constructor (orgHandle, repoName, localPath) {
    this.orgHandle = orgHandle
    this.repoName = repoName
    this.localPath = localPath
    this.remote = `https://${GITHUB_AUTH_USER}:${GITHUB_AUTH_TOKEN}@github.com/${orgHandle}/${repoName}`
    this.repoPath = `${localPath}/${repoName}`
    this.fullRepoName = `${orgHandle}/${repoName}`
    this.repo = this.openRepo() || cloneRepo(repoPath, remote)
  }

  async cloneRepo () {
    log(`${this.fullRepoName} - Cloning repo...`)
    try {
      await git().clone(this.remote, this.repoPath)
      log(`${this.fullRepoName} - Repo cloned.`)
      return openRepo(repoPath)
    } catch (err) {
      log(err, 'CRITICAL')
      throw new Error(`${this.fullRepoName} - It was not possible to clone.`)
    }
  }
  
  openRepo () {
    const gitRepo = git(this.repoPath).silent(isDebuging())
    try {
      gitRepo.status()
      return gitRepo
    } catch (err) {
      log(`${this.fullRepoName} - Repo is not cloned.`)
      return false
    }
  }
  
  async pullAllBranches () {
    this.repo.fetch()
    log(`${this.fullRepoName} - Pulling all branches...`)
    const branchesList = await this.branches(this.repo)
    for (let branchName of branchesList) {
      await this.pull(branchName)
    }
    return 1
  }
  
  async branches () {
    log(`${this.fullRepoName} - Extracting branches names...`)
    try {
      const branchesResponse = await this.repo.branch()
      const branchesList = branchesResponse.all.map(branchName => branchName.replace('remotes/origin/', ''))
      log(`${this.fullRepoName} - ${branchesList.length} branches found.`)
      return branchesList
    } catch (err) {
      log(err, 'CRITICAL')
      throw new Error(`${this.fullRepoName} - It was not possible to fetch branchs for this repo.`)
    }
  }
  
  async pull (branch) {
    log(`${this.fullRepoName} - Pulling branch ${branch}...`);
    try {
      // this.repo.checkout(branch)
      return await this.repo.pull('origin', branch)
    } catch (err) {
      log(err, 'WARNING')
      log(`${this.fullRepoName} - Branch ${branch} does not exist anymore.`)
      return await deleteBranch(branch)
    }
  }
  
  async deleteBranch (branch) {
    try {
      this.repo.checkout('master')
      await this.repo.deleteLocalBranch(branch)
      log(`${this.fullRepoName} - Branch ${branch} deleted from repo.`)
    } catch (err) {
      log(err, 'WARNING')
    }
  }
}

module.exports = GitRepo