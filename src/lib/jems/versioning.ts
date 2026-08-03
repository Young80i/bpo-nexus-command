/**
 * JARVIS Engineering Management System (JEMS)
 * Version Management Utilities
 */

import type { VersionInfo } from './types';

/**
 * Parse a semantic version string into its components
 */
export function parseVersion(version: string): VersionInfo {
  const [versionPart, prereleasePart, buildPart] = version.split(/[-+]/);
  const [major, minor, patch] = versionPart.split('.').map(Number);
  
  return {
    major,
    minor,
    patch,
    prerelease: prereleasePart,
    build: buildPart
  };
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const ver1 = parseVersion(v1);
  const ver2 = parseVersion(v2);
  
  if (ver1.major !== ver2.major) {
    return ver1.major > ver2.major ? 1 : -1;
  }
  
  if (ver1.minor !== ver2.minor) {
    return ver1.minor > ver2.minor ? 1 : -1;
  }
  
  if (ver1.patch !== ver2.patch) {
    return ver1.patch > ver2.patch ? 1 : -1;
  }
  
  // If we reach here, versions are equal
  return 0;
}

/**
 * Format a version object back to a semantic version string
 */
export function formatVersion(version: VersionInfo): string {
  let versionString = `${version.major}.${version.minor}.${version.patch}`;
  
  if (version.prerelease) {
    versionString += `-${version.prerelease}`;
  }
  
  if (version.build) {
    versionString += `+${version.build}`;
  }
  
  return versionString;
}

/**
 * Increment a version based on the increment type
 */
export function incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
  const ver = parseVersion(version);
  
  switch (type) {
    case 'major':
      return formatVersion({
        major: ver.major + 1,
        minor: 0,
        patch: 0
      });
    case 'minor':
      return formatVersion({
        major: ver.major,
        minor: ver.minor + 1,
        patch: 0
      });
    case 'patch':
      return formatVersion({
        major: ver.major,
        minor: ver.minor,
        patch: ver.patch + 1
      });
    default:
      return version;
  }
}

/**
 * Validate that a version string follows semantic versioning
 */
export function isValidSemVer(version: string): boolean {
  const semverRegex = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  return semverRegex.test(version);
}