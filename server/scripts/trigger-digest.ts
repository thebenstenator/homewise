import 'dotenv/config'
import mongoose from 'mongoose'
import { runWeeklyDigest } from '../src/services/scheduler.js'

const userId = process.argv[2]

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log('Connected to MongoDB')
  await runWeeklyDigest(userId)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
