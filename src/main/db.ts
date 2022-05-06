import { app } from 'electron'
import Datastore from 'nedb-promises'
import path from 'path'

const filesDbName = path.join(app.getPath('appData'), 'files.db')

const filesDb = Datastore.create({
  filename: filesDbName,
  autoload: true,
  timestampData: true,
})

export default {
  files: filesDb,
}
