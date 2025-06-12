async function start() {
  await import("./gen-languages");
  await import("./gen-countries");
  await import("./gen-indicators");
}

start()
  .then(() => console.log("Data generated successfully"))
  .catch((error) => console.error("Error generating data:", error));
