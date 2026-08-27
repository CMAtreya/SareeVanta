const fs = require('fs');
const path = require('path');

const replacements = [
  // Phrases with specific context
  { from: /Mysuru Flagship Salon/gi, to: 'Mysuru Flagship Store' },
  { from: /Flagship Salon/gi, to: 'Flagship Store' },
  { from: /Heritage Salon/gi, to: 'Heritage Store' },
  { from: /Mysore Flagship Salon/gi, to: 'Mysore Flagship Store' },
  { from: /Return to Salon Homepage/gi, to: 'Return to Homepage' },
  { from: /In-Salon Boutique Visit/gi, to: 'In-Store Boutique Visit' },
  { from: /In-Salon/gi, to: 'In-Store' },
  { from: /in-salon/gi, to: 'in-store' },
  { from: /Salon Visit/gi, to: 'Store Visit' },
  { from: /Salon Appointment/gi, to: 'Store Appointment' },
  { from: /Salon Desk/gi, to: 'Store Desk' },
  { from: /Salon Stylist/gi, to: 'Store Stylist' },
  { from: /Salon Styling/gi, to: 'Store Styling' },
  { from: /Salon Consultation/gi, to: 'Store Consultation' },
  { from: /Salon Notes/gi, to: 'Store Notes' },
  { from: /Salon Lead/gi, to: 'Store Lead' },
  { from: /salon concierge/gi, to: 'store concierge' },
  { from: /salon vault/gi, to: 'flagship vault' },
  { from: /salon mannequins/gi, to: 'store mannequins' },
  { from: /Packaging Salon/gi, to: 'Packaging Team' },
  { from: /Patron Account Salon/gi, to: 'Patron Account Hub' },
  { from: /Checkout Salon/gi, to: 'Checkout Portal' },
  { from: /registered account salon/gi, to: 'registered account' },
  { from: /Track Consignment in Live Salon/gi, to: 'Track Consignment in Live Orders' },
  { from: /Finishing Salon/gi, to: 'Finishing Atelier' },
  { from: /Patron Salon/gi, to: 'Patron Portal' },
  { from: /our Mysuru salon/gi, to: 'our Mysuru store' },
  { from: /Mysuru salon/gi, to: 'Mysuru store' },
];

function processDir(dir) {
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git') return;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      replacements.forEach(({ from, to }) => {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      });

      if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated terms in: ${path.relative(process.cwd(), filePath)}`);
      }
    }
  });
}

console.log('=== REPLACING "SALON" TERMINOLOGY ACROSS CODEBASE ===\n');
processDir(path.join(process.cwd(), 'app'));
processDir(path.join(process.cwd(), 'components'));
console.log('\nReplacement complete.');
