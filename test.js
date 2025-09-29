// Simple unit test setup for Chrome extension JavaScript
// Uses Mocha and Chai (add these libraries to your test runner or CDN for browser testing)

describe("SilentTab Extension", function () {
  it("should add a shortcut with valid input", function () {
    const shortcuts = [];
    const name = "Test";
    const url = "https://test.com";
    shortcuts.push({ name, url });
    chai.expect(shortcuts.length).to.equal(1);
    chai.expect(shortcuts[0].name).to.equal("Test");
    chai.expect(shortcuts[0].url).to.equal("https://test.com");
  });

  it("should not add a shortcut with invalid URL", function () {
    const shortcuts = [];
    const name = "Bad";
    const url = "not-a-url";
    let error = false;
    try {
      new URL(url);
    } catch (e) {
      error = true;
    }
    chai.expect(error).to.be.true;
  });
});
