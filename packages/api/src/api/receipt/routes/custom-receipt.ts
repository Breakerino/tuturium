module.exports = {
  routes: [
    {
      method: "POST",
      path: "/receipts/import",
      handler: "receipt.import",
    }
  ],
};