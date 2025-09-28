class PrintJobManager {
  constructor(dataStore) {
    this.dataStore = dataStore;
    this.templates = {
      receipt: this.receiptTemplate,
      kitchen: this.kitchenTemplate,
      bar: this.barTemplate,
    };
    this.listeners = new Set();
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  async notifyListeners() {
    const queue = (await this.dataStore.get("printQueue")) || [];
    this.listeners.forEach((cb) => cb(queue));
  }

  async queuePrintJob(orderId, type = "receipt", priority = 1) {
    const orders = await this.dataStore.get("order_data");
    const order = orders?.order;

    if (!order) throw new Error("Order not found");

    const printQueue = (await this.dataStore.get("printQueue")) || [];

    const printJob = {
      id: Date.now(),
      orderId,
      type,
      priority,
      status: "pending",
      data: order,
      timestamp: Date.now(),
      retries: 0,
    };

    printQueue.push(printJob);

    await this.dataStore.set("printQueue", printQueue);
    this.notifyListeners();
    this.processPrintQueue();

    return printJob.id;
  }

  async processPrintQueue() {
    const jobs = (await this.dataStore.get("printQueue")) || [];
    const pendingJobs = jobs.filter((j) => j.status === "pending");
    const sortedJobs = pendingJobs.sort((a, b) => b.priority - a.priority);

    for (const job of sortedJobs) {
      try {
        await this.executePrintJob(job);
        await this.updateJobStatus(job.id, "completed");
      } catch (error) {
        await this.handlePrintError(job, error);
      }
    }
  }

  async executePrintJob(job) {
    const template = this.templates[job.type];
    if (!template) throw new Error("Unknown print template");

    const content = template(job.data);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) {
          console.log(`Printing ${job.type}:\n`, content);
          resolve();
        } else {
          reject(new Error("Printer error"));
        }
      }, 500);
    });
  }

  async handlePrintError(job, error) {
    const maxRetries = 3;
    const printQueue = (await this.dataStore.get("printQueue")) || [];

    const jobIndex = printQueue.findIndex((j) => j.id === job.id);

    if (job.retries < maxRetries) {
      job.retries++;
      job.status = "pending";
      printQueue[jobIndex] = job;

      await this.dataStore.set("printQueue", printQueue);
      this.notifyListeners();

      setTimeout(() => this.processPrintQueue(), 5000);
    } else {
      await this.updateJobStatus(job.id, "failed");
      console.error("Print job failed after max retries:", job);
    }
  }

  async updateJobStatus(id, status) {
    const printQueue = (await this.dataStore.get("printQueue")) || [];
    const jobIndex = printQueue.findIndex((j) => j.id === id);

    if (jobIndex > -1) {
      printQueue[jobIndex].status = status;
      await this.dataStore.set("printQueue", printQueue);
      this.notifyListeners();
    }
  }

  // === Templates  for Receipt ===
  receiptTemplate(order) {
    return `
====== RECEIPT ======
Order #${order.id}
Date: ${new Date(order.timestamp).toLocaleString()}

${order.items
  .map(
    (item) =>
      `${item.item_name} x${item.quantity} - $${(
        item.price * item.quantity
      ).toFixed(2)}`
  )
  .join("\n")}

Total: $${order.total.toFixed(2)}
=====================
`;
  }

  kitchenTemplate(order) {
    return `
-- KITCHEN ORDER #${order.id} --
${order.items
  .filter((i) => i.item_category !== "Beverages")
  .map((i) => `${i.quantity}x ${i.item_name}`)
  .join("\n")}
`;
  }

  barTemplate(order) {
    return `
-- BAR ORDER #${order.id} --
${order.items
  .filter((i) => i.item_category === "Beverages")
  .map((i) => `${i.quantity}x ${i.item_name}`)
  .join("\n")}
`;
  }
}

export default PrintJobManager;
