const fs=require('fs');
const path=require('path');
const file=process.argv[2];
if(!file){console.error('Usage: node scripts/test-transform.cjs <file>');process.exit(1);}
const s=fs.readFileSync(file,'utf8');
const re=/import\s*\{([\s\S]*?)\}\s*from\s*['"]@mui\/icons-material['"];?/g;
const out=s.replace(re,(m,block)=>{
  const lines=block.split(',').map(x=>x.trim()).filter(Boolean).map(spec=>{
    const parts=spec.split(/\s+as\s+/i).map(p=>p.trim());
    const source=parts[0];
    const local=parts[1]?parts[1]:source;
    return 'import '+local+" from '@mui/icons-material/"+source+"';";
  });
  return lines.join('\n');
});
console.log('matched?', re.test(s));
console.log('changed?', out!==s);
