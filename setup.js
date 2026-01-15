import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, copyFileSync, statSync } from 'fs';
import { join } from 'path';

console.log('🚀 Setting up CoachHub Dashboard...\n');

// Create src/components directory if it doesn't exist
console.log('📁 Creating src/components directory...');
const componentsDir = join(process.cwd(), 'src', 'components');
if (!existsSync(componentsDir)) {
  mkdirSync(componentsDir, { recursive: true });
}

// Function to copy directory recursively
function copyDirectoryRecursive(source, destination) {
  if (!existsSync(destination)) {
    mkdirSync(destination, { recursive: true });
  }
  
  const files = readdirSync(source);
  let count = 0;
  
  files.forEach(file => {
    const sourcePath = join(source, file);
    const destPath = join(destination, file);
    const stat = statSync(sourcePath);
    
    if (stat.isDirectory()) {
      copyDirectoryRecursive(sourcePath, destPath);
    } else {
      copyFileSync(sourcePath, destPath);
      count++;
    }
  });
  
  return count;
}

// Copy all component files
console.log('📋 Copying component files...');
const sourceDir = join(process.cwd(), 'components');

try {
  if (existsSync(sourceDir)) {
    const totalCopied = copyDirectoryRecursive(sourceDir, componentsDir);
    console.log(`✅ Copied ${totalCopied} files successfully!`);
  } else {
    console.log('⚠️  Warning: components directory not found');
    console.log('   Please manually copy files from /components to /src/components');
  }
} catch (error) {
  console.error('❌ Error copying files:', error.message);
  console.log('   Please manually copy files from /components to /src/components');
}