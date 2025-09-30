describe("Customer Form", () => {
    beforeAll(async () => {
      await device.launchApp({ newInstance: true });
    });
  
    it("should add a new customer", async () => {
      // Navigate to form (adjust depending on your navigation)
      await element(by.id("btn-open-customer-form")).tap();
  
      // Fill in name
      await element(by.id("input-name")).typeText("John Doe");
  
      // Fill in phone
      await element(by.id("input-phone")).typeText("9876543210");
  
      // Add image (you may need to mock camera/gallery in Detox)
      await element(by.id("btn-add-image")).tap();
  
      // Save
      await element(by.id("btn-done")).tap();
  
      // Confirm
      await element(by.id("btn-confirm")).tap();
  
      // Assert success - maybe new customer is listed?
      await expect(element(by.text("John Doe"))).toBeVisible();
    });
  });
  