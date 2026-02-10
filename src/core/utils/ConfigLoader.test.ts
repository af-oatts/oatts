import { describe, it, expect, vi, beforeEach } from "vitest";
import { parse } from "yaml";
import LoadConfig, { CONFIG_LOCATION } from "./ConfigLoader";
import { FetchFile } from "./FileHelper";
import type { OattsManifest, CourseContentItemType } from "@/core/model/OattsModel";

// Mock the dependencies
vi.mock("./FileHelper", () => ({
  FetchFile: vi.fn(),
}));

vi.mock("yaml", () => ({
  parse: vi.fn(),
}));

vi.mock("./Globals", () => ({
  OATTS_ROOT: "/test-oatts",
}));

// Create mock data
const mockValidYamlContent = `
courses:
  - id: "course-1"
    name: "Test Course"
    roleIds: ["role-1"]
    contents:
      - id: "content-1"
        name: "Test Content"
        type: "SCORM"
roles:
  - id: "role-1"
    name: "Test Role"
    general: true
versionNumber: "1.0.0"
allowDataCollection: true
`;

const mockParsedManifest: OattsManifest = {
  courses: [
    {
      id: "course-1",
      name: "Test Course",
      roleIds: ["role-1"],
      contents: [
        {
          id: "content-1",
          name: "Test Content",
          type: "SCORM" as CourseContentItemType,
        },
      ],
    },
  ],
  roles: [
    {
      id: "role-1",
      name: "Test Role",
      general: true,
    },
  ],
  versionNumber: "1.0.0",
  allowDataCollection: true,
};

const mockMinimalManifest: OattsManifest = {
  courses: [],
  roles: [],
};

describe("ConfigLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset console.error mock
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("CONFIG_LOCATION", () => {
    it("should construct the correct config location path", () => {
      expect(CONFIG_LOCATION).toBe("/test-oatts/manifest.yml");
    });
  });

  describe("LoadConfig", () => {
    it("should successfully load and parse a valid config file", async () => {
      // Arrange
      vi.mocked(FetchFile).mockResolvedValue(mockValidYamlContent);
      vi.mocked(parse).mockReturnValue(mockParsedManifest);

      // Act
      const result = await LoadConfig();

      // Assert
      expect(FetchFile).toHaveBeenCalledWith("/test-oatts/manifest.yml", "text/yaml");
      expect(parse).toHaveBeenCalledWith(mockValidYamlContent);
      expect(result).toEqual(mockParsedManifest);
      expect(console.error).not.toHaveBeenCalled();
    });

    it("should return undefined when FetchFile returns undefined", async () => {
      // Arrange
      vi.mocked(FetchFile).mockResolvedValue(undefined);

      // Act
      const result = await LoadConfig();

      // Assert
      expect(FetchFile).toHaveBeenCalledWith("/test-oatts/manifest.yml", "text/yaml");
      expect(parse).not.toHaveBeenCalled();
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith("Error fetching config");
    });

    it("should handle empty YAML content", async () => {
      // Arrange
      const emptyYaml = "";
      vi.mocked(FetchFile).mockResolvedValue(emptyYaml);
      vi.mocked(parse).mockReturnValue(null);

      // Act
      const result = await LoadConfig();

      // Assert
      expect(FetchFile).toHaveBeenCalledWith("/test-oatts/manifest.yml", "text/yaml");
      expect(parse).toHaveBeenCalledWith(emptyYaml);
      expect(result).toBeNull();
    });

    it("should handle minimal valid manifest", async () => {
      // Arrange
      const minimalYaml = "courses: []\nroles: []";
      vi.mocked(FetchFile).mockResolvedValue(minimalYaml);
      vi.mocked(parse).mockReturnValue(mockMinimalManifest);

      // Act
      const result = await LoadConfig();

      // Assert
      expect(FetchFile).toHaveBeenCalledWith("/test-oatts/manifest.yml", "text/yaml");
      expect(parse).toHaveBeenCalledWith(minimalYaml);
      expect(result).toEqual(mockMinimalManifest);
    });

    it("should handle manifest with optional fields", async () => {
      // Arrange
      const manifestWithOptionals: OattsManifest = {
        courses: [
          {
            id: "course-1",
            name: "Test Course",
            roleIds: ["role-1"],
            contents: [],
            img: "test-image.png",
            description: "Test description",
            paNumber: "PA-123",
            timeToComplete: 3600,
          },
        ],
        prequizzes: [
          {
            id: "prequiz-1",
            name: "Pre Quiz",
            roleIds: ["role-1"],
            contents: [],
          },
        ],
        postquizzes: [
          {
            id: "postquiz-1",
            name: "Post Quiz",
            roleIds: ["role-1"],
            contents: [],
          },
        ],
        roles: [
          {
            id: "role-1",
            name: "Test Role",
            general: false,
          },
        ],
        versionNumber: "2.0.0",
        allowDataCollection: false,
      };

      const yamlWithOptionals = `
courses:
  - id: "course-1"
    name: "Test Course"
    roleIds: ["role-1"]
    contents: []
    img: "test-image.png"
    description: "Test description"
    paNumber: "PA-123"
    timeToComplete: 3600
prequizzes:
  - id: "prequiz-1"
    name: "Pre Quiz"
    roleIds: ["role-1"]
    contents: []
postquizzes:
  - id: "postquiz-1"
    name: "Post Quiz"
    roleIds: ["role-1"]
    contents: []
roles:
  - id: "role-1"
    name: "Test Role"
    general: false
versionNumber: "2.0.0"
allowDataCollection: false
`;

      vi.mocked(FetchFile).mockResolvedValue(yamlWithOptionals);
      vi.mocked(parse).mockReturnValue(manifestWithOptionals);

      // Act
      const result = await LoadConfig();

      // Assert
      expect(result).toEqual(manifestWithOptionals);
      expect(result?.prequizzes).toBeDefined();
      expect(result?.postquizzes).toBeDefined();
      expect(result?.versionNumber).toBe("2.0.0");
      expect(result?.allowDataCollection).toBe(false);
    });

    it("should handle YAML parsing errors gracefully", async () => {
      // Arrange
      const invalidYaml = "invalid: yaml: content: [";
      vi.mocked(FetchFile).mockResolvedValue(invalidYaml);
      vi.mocked(parse).mockImplementation(() => {
        throw new Error("YAML parsing error");
      });

      // Act & Assert
      await expect(LoadConfig()).rejects.toThrow("YAML parsing error");
      expect(FetchFile).toHaveBeenCalledWith("/test-oatts/manifest.yml", "text/yaml");
      expect(parse).toHaveBeenCalledWith(invalidYaml);
    });

    it("should handle FetchFile rejection", async () => {
      // Arrange
      vi.mocked(FetchFile).mockRejectedValue(new Error("Network error"));

      // Act & Assert
      await expect(LoadConfig()).rejects.toThrow("Network error");
      expect(FetchFile).toHaveBeenCalledWith("/test-oatts/manifest.yml", "text/yaml");
      expect(parse).not.toHaveBeenCalled();
    });

    it("should handle complex nested course content structure", async () => {
      // Arrange
      const complexManifest: OattsManifest = {
        courses: [
          {
            id: "complex-course",
            name: "Complex Course",
            roleIds: ["role-1", "role-2"],
            contents: [
              {
                id: "module-1",
                name: "Module 1",
                type: "SUBMODULE" as CourseContentItemType,
                children: [
                  {
                    id: "scorm-1",
                    name: "SCORM Content",
                    type: "SCORM" as CourseContentItemType,
                    entrypoint: "index.html",
                    description: "Interactive content",
                  },
                  {
                    id: "pdf-1",
                    name: "PDF Content",
                    type: "PDF" as CourseContentItemType,
                    entrypoint: "document.pdf",
                  },
                ],
              },
            ],
          },
        ],
        roles: [
          {
            id: "role-1",
            name: "Student",
            general: true,
          },
          {
            id: "role-2",
            name: "Instructor",
            general: false,
          },
        ],
      };

      const complexYaml = `
courses:
  - id: "complex-course"
    name: "Complex Course"
    roleIds: ["role-1", "role-2"]
    contents:
      - id: "module-1"
        name: "Module 1"
        type: "SUBMODULE"
        children:
          - id: "scorm-1"
            name: "SCORM Content"
            type: "SCORM"
            entrypoint: "index.html"
            description: "Interactive content"
          - id: "pdf-1"
            name: "PDF Content"
            type: "PDF"
            entrypoint: "document.pdf"
roles:
  - id: "role-1"
    name: "Student"
    general: true
  - id: "role-2"
    name: "Instructor"
    general: false
`;

      vi.mocked(FetchFile).mockResolvedValue(complexYaml);
      vi.mocked(parse).mockReturnValue(complexManifest);

      // Act
      const result = await LoadConfig();

      // Assert
      expect(result).toEqual(complexManifest);
      expect(result?.courses[0].contents[0].children).toHaveLength(2);
      expect(result?.courses[0].contents[0].children?.[0].type).toBe("SCORM");
      expect(result?.courses[0].contents[0].children?.[1].type).toBe("PDF");
    });

    it("should preserve all CourseContentItemType values", async () => {
      // Arrange
      const allTypesManifest: OattsManifest = {
        courses: [
          {
            id: "all-types-course",
            name: "All Types Course",
            roleIds: ["role-1"],
            contents: [
              { id: "1", name: "Submodule", type: "SUBMODULE" as CourseContentItemType },
              { id: "2", name: "SCORM", type: "SCORM" as CourseContentItemType },
              { id: "3", name: "PDF", type: "PDF" as CourseContentItemType },
              { id: "4", name: "HTML", type: "HTML" as CourseContentItemType },
              { id: "5", name: "Unknown", type: "UNKNOWN" as CourseContentItemType },
            ],
          },
        ],
        roles: [{ id: "role-1", name: "Test Role", general: true }],
      };

      const allTypesYaml = `
courses:
  - id: "all-types-course"
    name: "All Types Course"
    roleIds: ["role-1"]
    contents:
      - id: "1"
        name: "Submodule"
        type: "SUBMODULE"
      - id: "2"
        name: "SCORM"
        type: "SCORM"
      - id: "3"
        name: "PDF"
        type: "PDF"
      - id: "4"
        name: "HTML"
        type: "HTML"
      - id: "5"
        name: "Unknown"
        type: "UNKNOWN"
roles:
  - id: "role-1"
    name: "Test Role"
    general: true
`;

      vi.mocked(FetchFile).mockResolvedValue(allTypesYaml);
      vi.mocked(parse).mockReturnValue(allTypesManifest);

      // Act
      const result = await LoadConfig();

      // Assert
      expect(result).toEqual(allTypesManifest);
      expect(result?.courses[0].contents).toHaveLength(5);
      expect(result?.courses[0].contents.map((c) => c.type)).toEqual(["SUBMODULE", "SCORM", "PDF", "HTML", "UNKNOWN"]);
    });
  });
});
