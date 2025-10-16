export function ensureBuntime() {
  const isBun = typeof Bun !== undefined && Bun.version;

  if (!isBun) {
    console.error(`
❌ This CLI requires Bun to run.

You can install Bun by running:

  curl -fsSL https://bun.sh/install | bash
       (or)
  npm install -g bun

  > Read more at: https://bun.com/

Once installed, you can use cvstack by running:
  cvstack|cvs --help
`);
    process.exit(1);
  }
}
