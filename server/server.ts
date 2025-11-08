import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
// import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import { expressMiddleware } from '@as-integrations/express5'
// import Keyv from "keyv";
// import KeyvRedis from "@keyv/redis";
// import { KeyvAdapter } from "@apollo/utils.keyvadapter";
// import { createClient } from 'redis'
import express = require('express')
import * as http from 'http'
import * as cors from 'cors'
import * as dotenv from 'dotenv'

// import { frontend } from '../dist/ssr/main'
import { genSchema } from './utils/genSchema'
// import { connectDB } from './db/connectDB'

export async function startServer() {
  dotenv.config({ quiet: true })

  let serverStarted = false
  let displayError: any
  async function stop(arg0: any) {}

  const app = express()
  // const app = await frontend()
  const httpServer = http.createServer(app)
  const port = process.env.PORT || 8090
  const host = process.env.HOST
  // const client = createClient({url: `redis://${ host }:${ process.env.REDIS_PORT }`})

  const apolloServer = new ApolloServer({
    schema: genSchema(),
    // context: ({ req }) => { return (req) },
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    // cache: new InMemoryLRUCache()
    // cache: client
    // cache: new KeyvAdapter(new Keyv(new KeyvRedis('redis://user:pass@localhost:6379')))
  })

  app.disable('x-powered-by')

  await apolloServer.start()
  
  app.use(
    '/graphql',
    // cors<cors.CorsRequest>({ origin: ['https://www.your-app.example', 'https://studio.apollographql.com'] }),
    cors(),
    express.json(),
    expressMiddleware(apolloServer)
  )

  // Start server
  if (!serverStarted) {
    httpServer.listen(port, async () => {
      try {
        // await client.connect()
        // await connectDB()
        serverStarted = true
        console.log(`🚀 Server running on port: http://${ host }:${ port }`)
      } catch(err) {
        displayError = err?.message
        console.error('SERVER FAILED TO START!')
        console.error(`ERROR: ${ displayError }`)
        await new Promise(res => stop(res))
      }
    })
  }

}
