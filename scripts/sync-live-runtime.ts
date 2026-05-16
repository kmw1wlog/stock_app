import { syncLiveRuntimeToDb } from '@/lib/jobs/liveRuntimeSync';

syncLiveRuntimeToDb()
  .then((result) => {
    console.log(JSON.stringify(result));
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
