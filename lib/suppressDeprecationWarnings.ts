// Silences noisy Node.js deprecation warnings we can't control (e.g., url.parse in dependencies)
if (typeof process !== 'undefined') {
  const seen = new Set<string>();
  process.removeAllListeners('warning');
  process.on('warning', (warning: Error & { code?: string }) => {
    if (warning?.code === 'DEP0169') {
      const key = `${warning.code}:${warning.message}`;
      if (!seen.has(key)) {
        // Log once to acknowledge but avoid spamming the console
        console.warn('[warn-suppressed]', warning.code, warning.message);
        seen.add(key);
      }
      return;
    }
    // Pass through other warnings
    console.warn(warning);
  });
}
