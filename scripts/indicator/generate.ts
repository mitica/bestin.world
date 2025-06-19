async function start() {
  await import("./indicator-rank");
}

start()
  .then(() => console.log("Data generated successfully"))
  .catch((error) => console.error("Error generating data:", error));
