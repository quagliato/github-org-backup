# github-user-backup

Backups all repos of a single organization.

## Step-by-step *(ooh baby)*

1. Copy the `.env.example` file to a new `.env` file and fill its information

2. Run `npm start <orgHandler> <relativePathDirectory>`
  * *orgHandle*: the github handler name of your organization
  * *relativePathDirectory*: the relative path to the directoy where the repos
    will be stored. If nothing is setted here, it will use `./localRepos/`
