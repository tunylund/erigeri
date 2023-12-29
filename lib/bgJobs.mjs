const workers = {}

function wait(time) { return new Promise(r => { setTimeout(() => r(), time) }) }

export function queueJob(jobSrc, params, transferables) {
  ensureWorkers(jobSrc)
  const job = new Job(jobSrc, params, transferables)
  return job.tryRun()
}

function ensureWorkers(jobSrc) {
  if (!workers[jobSrc]) {
    workers[jobSrc] = new Array(navigator.hardwareConcurrency).fill(null).map(() => new PromisedWorker(jobSrc))
  }
}

function findWorker(jobSrc) {
  const runningCount = Object.entries(workers).reduce((tsum, [id, workers]) => tsum + workers.reduce((wsum, worker) => wsum + worker.available ? 0 : 1, 0), 0)
  if (runningCount < navigator.hardwareConcurrency) return workers[jobSrc].find(w => w.available)
}

class Job {
  constructor(jobSrc, params, transferables) {
    this.jobSrc = jobSrc
    this.params = params
    this.transferables = transferables
  }
  tryRun() {
    const availableWorker = findWorker(this.jobSrc)
    if (availableWorker) return availableWorker.run(this)
    else return wait(100).then(() => this.tryRun())
  }
}

class PromisedWorker {
  constructor(jobSrc) {
    this.worker = new Worker(jobSrc)
    this.worker.addEventListener('message', this.done.bind(this))
    this.worker.addEventListener('messageerror', this.msgError.bind(this))
    this.worker.addEventListener('error', this.error.bind(this))
  }

  run (job) {
    return new Promise((resolve, reject) => {
      this.start = Date.now()
      this.job = job
      this.resolve = resolve
      this.reject = reject
      this.worker.postMessage([job.params], job.transferables)
    })
  }

  done ({ data }) {
    this.resolve(data)
    this.start = this.job = this.resolve = this.reject = null
  }

  msgError(event) {
    console.error('Worker failed to process message', this.job, event)
    this.reject(new Error(`Worker failed to process message ${this.job.jobSrc}`))
  }
  
  error() {
    console.error('Worker failed', this.job)
    this.reject(new Error(`Worker failed ${this.job.jobSrc}`))
  }

  get available() {
    return !this.job
  }
}