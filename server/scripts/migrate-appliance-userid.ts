import 'dotenv/config'
import mongoose from 'mongoose'

async function run() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log('Connected to MongoDB')

  const result = await mongoose.connection.collection('appliances').updateMany(
    { userId: { $type: 'string' } },
    [{ $set: { userId: { $toObjectId: '$userId' } } }]
  )

  console.log(`Matched: ${result.matchedCount}, Updated: ${result.modifiedCount}`)
  await mongoose.disconnect()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
