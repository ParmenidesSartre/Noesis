module.exports = {
  // TypeScript files
  '*.ts': [
    'eslint --fix',           // Fix ESLint issues
    'prettier --write',       // Format with Prettier
    // 'pnpm test -- --findRelatedTests --passWithNoTests', // Run related tests (optional, can be slow)
  ],

  // JSON, Markdown files
  '*.{json,md}': [
    'prettier --write',       // Format with Prettier
  ],

  // Prisma schema
  'prisma/schema.prisma': [
    'prisma format',          // Format Prisma schema
  ],
};
