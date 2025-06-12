async function start() {
  await import("./country-best");
}

start()
  .then(() => console.log("Data generated successfully"))
  .catch((error) => console.error("Error generating data:", error));
