import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to convert string to vector<u8>
export function stringToVector(str: string): number[] {
  return Array.from(new TextEncoder().encode(str));
}

// Helper function to convert vector<u8> to string
export function vectorToString(vec: number[]): string {
  return new TextDecoder().decode(new Uint8Array(vec));
}

// Helper function to convert array of strings to vector<vector<u8>>
export function stringArrayToVectorArray(strArray: string[]): number[][] {
  return strArray.map((str) => stringToVector(str));
}

// Helper function to convert vector<vector<u8>> to array of strings
export function vectorArrayToStringArray(vecArray: number[][]): string[] {
  return vecArray.map((vec) => vectorToString(vec));
}
