const fs = require('fs');
const path = require('path');

const width = 90;
const height = 18;
const timestamp = Math.floor(Date.now() / 1000);

const frames = [];

let t = 0;
function type(text, delay = 0.03) {
  for (const ch of text) {
    frames.push([t, 'o', ch]);
    t += delay;
  }
}
function write(text, duration = 0.2) {
  frames.push([t, 'o', text]);
  t += duration;
}
function wait(sec) {
  t += sec;
}

// ── Terminal demo of TrayectAI ──

// Clear screen
write('\x1b[2J\x1b[H', 0.1);

// Welcome banner
write('\x1b[1;36m╔══════════════════════════════════════════════════════════════════════════════╗\x1b[0m\n', 0.1);
write('\x1b[1;36m║\x1b[0m  \x1b[1;33mTrayectAI\x1b[0m — Academic Pathway & Study Plan Manager           \x1b[1;36m║\x1b[0m\n', 0.1);
write('\x1b[1;36m╚══════════════════════════════════════════════════════════════════════════════╝\x1b[0m\n', 0.3);
wait(0.5);

// Demo header
write('\x1b[1;37m📋 Running tests...\x1b[0m\n', 0.3);
wait(0.2);

// Run tests command
type('$ npm run test:run\n');
wait(0.3);

// Test output
write('\n> trayectai@0.1.0 test:run\n> vitest run\n\n', 0.3);
write('\x1b[1m\x1b[30m\x1b[46m RUN \x1b[49m\x1b[39m\x1b[22m \x1b[36mv4.1.9 \x1b[39m\x1b[90mC:/Users/alayo/Desktop/Andina AI/trayectai\x1b[39m\n\n', 0.3);
wait(0.3);

// Test files
write(' \x1b[32m✓\x1b[39m lib/chat-engine.test.ts \x1b[2m(\x1b[22m\x1b[2m25 tests\x1b[22m\x1b[2m)\x1b[22m \x1b[2m26ms\x1b[22m\n', 0.5);
write(' \x1b[32m✓\x1b[39m lib/prerequisite-engine.test.ts \x1b[2m(\x1b[22m\x1b[2m23 tests\x1b[22m\x1b[2m)\x1b[22m \x1b[2m27ms\x1b[22m\n', 0.5);
write('\n\x1b[2m Test Files \x1b[22m \x1b[1m\x1b[32m2 passed\x1b[39m\x1b[22m\x1b[90m (2)\x1b[39m\n', 0.3);
write('\x1b[2m      Tests \x1b[22m \x1b[1m\x1b[32m48 passed\x1b[39m\x1b[22m\x1b[90m (48)\x1b[39m\n', 0.3);
write('\x1b[2m   Duration \x1b[22m 1.26s\n', 0.3);
wait(0.5);

// Separator
write('\n\x1b[1;37m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n', 0.3);
wait(0.3);

// Start dev server
write('\x1b[1;37m🚀 Starting development server...\x1b[0m\n', 0.3);
type('$ npm run dev\n');
wait(0.4);

// Dev server output
write('\n> trayectai@0.1.0 dev\n> next dev --turbo\n\n', 0.3);
write('  ▲ Next.js 16.2.9 (Turbopack)\n', 0.2);
write('  - local: http://localhost:3000\n', 0.2);
write('  - environments: .env\n\n', 0.2);
write(' ✓ Compiled in 1287ms\n', 0.3);
write(' ✓ Ready in 2.3s\n', 0.3);
wait(0.5);

// Features
write('\n\x1b[1;37m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n', 0.3);
wait(0.2);

write('\x1b[1;36mTrayectAI\x1b[0m \x1b[1;37mFeatures:\x1b[0m\n', 0.3);
write('  \x1b[33m📊\x1b[0m  \x1b[1mStudy Plan DAG\x1b[0m — Visual prerequisite graph with subject states\n', 0.15);
write('       (aprobada, regular, habilitada, bloqueada)\n', 0.15);
write('  \x1b[33m🤖\x1b[0m  \x1b[1mAI Copilot\x1b[0m — Ask about your career path, prerequisites, graduation\n', 0.15);
write('  \x1b[33m🎮\x1b[0m  \x1b[1mGamification\x1b[0m — XP, levels, achievements, streaks\n', 0.15);
write('  \x1b[33m📅\x1b[0m  \x1b[1mCalendar\x1b[0m — Exam and deadline management\n', 0.15);
write('  \x1b[33m🌊\x1b[0m  \x1b[1m3 Themes\x1b[0m — Navy, Light, Dark + Auto mode\n', 0.15);
write('  \x1b[33m🔮\x1b[0m  \x1b[1mGraduation Projector\x1b[0m — Predicts graduation date & career path\n', 0.15);
write('  \x1b[33m🎯\x1b[0m  \x1b[1mPrerequisite Engine\x1b[0m — Resolves 44 subjects, 69 prerequisites\n', 0.3);
wait(0.5);

// Graduation projection
write('\n\x1b[1;37m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n', 0.3);
wait(0.2);
write('\x1b[1;37m🎓 Example: Graduation Projection for Ing. Química (Plan 2024)\x1b[0m\n', 0.3);
write('\x1b[36m  Starting with 0 approved subjects...\x1b[0m\n', 0.2);
write('  Projected semesters remaining: \x1b[1;33m10\x1b[0m\n', 0.2);
write('  Projected graduation: \x1b[1;33mDecember 2030\x1b[0m\n', 0.2);
wait(0.3);
write('\x1b[36m  With 20 subjects approved (avg 2.5/yr):\x1b[0m\n', 0.2);
write('  Projected semesters remaining: \x1b[1;33m6\x1b[0m\n', 0.2);
write('  Projected graduation: \x1b[1;33mDecember 2028\x1b[0m\n', 0.2);
wait(0.5);

// Closing
write('\n\x1b[1;37m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n', 0.3);
wait(0.3);
write('\x1b[1;32m✓ Demo complete. TrayectAI is ready!\x1b[0m\n', 0.3);
write('\x1b[90m  Open http://localhost:3000 to explore the full app.\x1b[0m\n\n', 0.3);

// ── Write asciicast file ──

const header = { version: 2, width, height, timestamp };
const stream = [JSON.stringify(header)];
for (const f of frames) {
  stream.push(JSON.stringify(f));
}

const output = stream.join('\n');
fs.writeFileSync(path.join(__dirname, '..', 'public', 'demo.cast'), output, 'utf-8');
console.log('✓ Generated demo.cast');
console.log(`  ${frames.length} frames, ${t.toFixed(2)}s duration`);
