const tar = require('tar')

async function compressDir (directoryPath, outputFile) {
  log(`Comprimindo diretório ${directoryPath} no arquivo ${outputFile}...`)
  await tar.c({
    file: outputFile,
    gzip: true
  }, [directoryPath])
  log(`Compressão finalizada.`)
}

module.exports = {
  compressDir
}