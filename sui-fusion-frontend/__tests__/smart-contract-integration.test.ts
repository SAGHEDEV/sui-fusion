import { stringToVector, vectorToString, stringArrayToVectorArray, vectorArrayToStringArray } from "../lib/utils";

describe("Smart Contract Utility Functions", () => {
  test("stringToVector converts string to vector<u8>", () => {
    const input = "Hello, World!";
    const result = stringToVector(input);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  test("vectorToString converts vector<u8> to string", () => {
    const input = [72, 101, 108, 108, 111]; // "Hello"
    const result = vectorToString(input);
    expect(result).toBe("Hello");
  });

  test("stringToVector and vectorToString are inverses", () => {
    const input = "Test String";
    const vector = stringToVector(input);
    const result = vectorToString(vector);
    expect(result).toBe(input);
  });

  test("stringArrayToVectorArray converts array of strings", () => {
    const input = ["Hello", "World"];
    const result = stringArrayToVectorArray(input);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(Array.isArray(result[0])).toBe(true);
  });

  test("vectorArrayToStringArray converts array of vectors", () => {
    const input = [
      [72, 101, 108, 108, 111], // "Hello"
      [87, 111, 114, 108, 100]  // "World"
    ];
    const result = vectorArrayToStringArray(input);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0]).toBe("Hello");
    expect(result[1]).toBe("World");
  });

  test("stringArrayToVectorArray and vectorArrayToStringArray are inverses", () => {
    const input = ["Test", "String", "Array"];
    const vectorArray = stringArrayToVectorArray(input);
    const result = vectorArrayToStringArray(vectorArray);
    expect(result).toEqual(input);
  });
});