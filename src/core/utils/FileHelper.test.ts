
/*
 * Copyright © 2026 DCS Corporation, 6909 Metro Park Drive Suite 500, Alexandria, VA 22310.
 * See the LICENSE file for rights & permissions.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchFile } from "./FileHelper";

// Mock the global fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("FileHelper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console mocks
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  describe("FetchFile", () => {
    it("should successfully fetch a file with matching content type", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
        text: vi.fn().mockResolvedValue('{"test": "data"}'),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/test/file.json", "application/json");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/test/file.json");
      expect(mockResponse.headers.get).toHaveBeenCalledWith("content-type");
      expect(mockResponse.text).toHaveBeenCalled();
      expect(result).toBe('{"test": "data"}');
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should successfully fetch a file with partial content type match", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/html; charset=utf-8"),
        },
        text: vi.fn().mockResolvedValue("<html><body>Test</body></html>"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/test/file.html", "text/html");

      // Assert
      expect(result).toBe("<html><body>Test</body></html>");
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should handle YAML files with .yml extension when content type is text/yaml", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockResolvedValue("key: value\nother: data"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/config/manifest.yml", "text/yaml");

      // Assert
      expect(result).toBe("key: value\nother: data");
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should return undefined when fetch response is not ok", async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: "Not Found",
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/nonexistent/file.txt", "text/plain");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith("/nonexistent/file.txt");
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith("Failed to fetch a file at", "/nonexistent/file.txt");
    });

    it("should return undefined when content type does not match", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/html"),
        },
        text: vi.fn().mockResolvedValue("<html>content</html>"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/test/file.html", "application/json");

      // Assert
      expect(result).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        "Retrieved content type of text/html for /test/file.html while application/json was expected",
      );
    });

    it("should return undefined when content type header is null", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue(null),
        },
        text: vi.fn().mockResolvedValue("some content"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/test/file.txt", "text/plain");

      // Assert
      expect(result).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        "Retrieved content type of null for /test/file.txt while text/plain was expected",
      );
    });

    it("should handle YAML files without .yml extension but with correct content type", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/yaml"),
        },
        text: vi.fn().mockResolvedValue("yaml: content"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/config/data", "text/yaml");

      // Assert
      expect(result).toBe("yaml: content");
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should not allow YAML special case for non-YAML expected content type", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockResolvedValue("plain text content"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/config/manifest.yml", "application/json");

      // Assert
      expect(result).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        "Retrieved content type of text/plain for /config/manifest.yml while application/json was expected",
      );
    });

    it("should handle fetch network errors", async () => {
      // Arrange
      mockFetch.mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(FetchFile("/test/file.txt", "text/plain")).rejects.toThrow("Network error");
      expect(mockFetch).toHaveBeenCalledWith("/test/file.txt");
    });

    it("should handle response.text() errors", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockRejectedValue(new Error("Failed to read response body")),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act & Assert
      await expect(FetchFile("/test/file.txt", "text/plain")).rejects.toThrow("Failed to read response body");
    });

    it("should handle various file extensions and content types", async () => {
      // Test cases for different file types
      const testCases = [
        {
          filePath: "/docs/readme.md",
          expectedContentType: "text/markdown",
          responseContentType: "text/markdown",
          content: "# README\nThis is a test",
          shouldSucceed: true,
        },
        {
          filePath: "/images/logo.png",
          expectedContentType: "image/png",
          responseContentType: "image/png",
          content: "binary-image-data",
          shouldSucceed: true,
        },
        {
          filePath: "/styles/main.css",
          expectedContentType: "text/css",
          responseContentType: "text/css; charset=utf-8",
          content: "body { margin: 0; }",
          shouldSucceed: true,
        },
        {
          filePath: "/scripts/app.js",
          expectedContentType: "application/javascript",
          responseContentType: "text/javascript",
          content: 'console.log("test");',
          shouldSucceed: false, // Different content type
        },
      ];

      for (const testCase of testCases) {
        // Reset mocks for each test case
        vi.clearAllMocks();
        vi.spyOn(console, "warn").mockImplementation(() => {});

        const mockResponse = {
          ok: true,
          headers: {
            get: vi.fn().mockReturnValue(testCase.responseContentType),
          },
          text: vi.fn().mockResolvedValue(testCase.content),
        };
        mockFetch.mockResolvedValue(mockResponse);

        const result = await FetchFile(testCase.filePath, testCase.expectedContentType);

        if (testCase.shouldSucceed) {
          expect(result).toBe(testCase.content);
          expect(console.warn).not.toHaveBeenCalled();
        } else {
          expect(result).toBeUndefined();
          expect(console.warn).toHaveBeenCalled();
        }
      }
    });

    it("should handle empty file content", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockResolvedValue(""),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/empty/file.txt", "text/plain");

      // Assert
      expect(result).toBe("");
      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should handle very large file content", async () => {
      // Arrange
      const largeContent = "x".repeat(1000000); // 1MB of 'x' characters
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockResolvedValue(largeContent),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/large/file.txt", "text/plain");

      // Assert
      expect(result).toBe(largeContent);
      expect(result?.length).toBe(1000000);
    });

    it("should handle special characters in file paths", async () => {
      // Arrange
      const specialPath = "/files/test file with spaces & symbols!.txt";
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
        text: vi.fn().mockResolvedValue("content with special chars: éñ中文"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile(specialPath, "text/plain");

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(specialPath);
      expect(result).toBe("content with special chars: éñ中文");
    });

    it("should handle case sensitivity in content type matching (case sensitive)", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue("TEXT/PLAIN"),
        },
        text: vi.fn().mockResolvedValue("uppercase content type"),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Act
      const result = await FetchFile("/test/file.txt", "text/plain");

      // Assert - indexOf is case sensitive, so this should fail
      expect(result).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith(
        "Retrieved content type of TEXT/PLAIN for /test/file.txt while text/plain was expected",
      );
    });

    it("should handle multiple YAML file extensions", async () => {
      const yamlExtensions = [".yml", ".yaml"];

      for (const ext of yamlExtensions) {
        vi.clearAllMocks();

        const mockResponse = {
          ok: true,
          headers: {
            get: vi.fn().mockReturnValue("text/plain"),
          },
          text: vi.fn().mockResolvedValue(`content: from${ext}`),
        };
        mockFetch.mockResolvedValue(mockResponse);

        const result = await FetchFile(`/config/test${ext}`, "text/yaml");

        if (ext === ".yml") {
          // Should work due to special case
          expect(result).toBe(`content: from${ext}`);
        } else {
          // .yaml extension doesn't have special case, should fail
          expect(result).toBeUndefined();
        }
      }
    });
  });
});
