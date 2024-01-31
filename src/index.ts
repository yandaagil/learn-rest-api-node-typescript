import { logger } from './utils/logger'
import './utils/connectDB'
import createServer from './utils/server'

const app = createServer()
const port: number = 4000

app.listen(port, () => logger.info(`Listening on port ${port}`))
