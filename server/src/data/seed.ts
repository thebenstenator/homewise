import 'dotenv/config'
import mongoose from 'mongoose'
import { ApplianceType } from '../models/ApplianceType.js'
import { applianceTypes } from './applianceTypes.js'

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!)
  console.log('Connected to MongoDB')

  await ApplianceType.deleteMany({})
  console.log('Cleared ApplianceType collection')

  await ApplianceType.insertMany(applianceTypes)
  console.log(`Inserted ${applianceTypes.length} appliance types`)

  await mongoose.disconnect()
  console.log('Done')
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
