import 'dotenv/config'
import mongoose from 'mongoose'
import crypto from 'crypto'
import { User } from '../src/models/User.js'

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log('Connected to MongoDB')

  const users = await User.find({ unsubscribeToken: { $exists: false } })
  console.log(`Found ${users.length} users without unsubscribe tokens`)

  for (const user of users) {
    user.unsubscribeToken = crypto.randomBytes(32).toString('hex')
    await user.save()
  }

  console.log(`Done — ${users.length} tokens generated`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
