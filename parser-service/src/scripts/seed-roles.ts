import { env } from '../config/env';
import { connectMongo, disconnectMongo, JobRole } from '@resume-parser/shared';
import roles from '../data/job-roles.json';

async function seed(): Promise<void> {
  await connectMongo(env.MONGO_URI);

  for (const role of roles) {
    await JobRole.updateOne({ name: role.name }, { $set: role }, { upsert: true });
    console.log(`${role.name} (${role.keywords.length} keywords)`);
  }

  console.log(`\nSeeded ${roles.length} job roles`);
  await disconnectMongo();
}

void seed();