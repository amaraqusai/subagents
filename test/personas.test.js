const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

function checkPersonaFile(name) {
    const filePath = path.join(__dirname, '..', '.gemini', 'agents', `${name}.md`);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)/);
    if (!match) {
        throw new Error(`Invalid markdown structure in ${name}.md (missing frontmatter delimiter ---)`);
    }
    const body = match[2].trim();
    const frontmatter = match[1];
    const nameMatch = frontmatter.match(/name:\s*(.*)/);
    if (!nameMatch) {
        throw new Error(`Missing "name:" field in ${name}.md frontmatter`);
    }
    return {
        name: nameMatch[1].trim(),
        systemPrompt: body
    };
}

test('Persona Markdown Integrity Checks', async (t) => {
    await t.test('should load and validate ronaldo-fan.md', () => {
        const persona = checkPersonaFile('ronaldo-fan');
        assert.ok(persona.name);
        assert.ok(persona.systemPrompt.includes('Ronaldo'));
    });

    await t.test('should load and validate messi-fan.md', () => {
        const persona = checkPersonaFile('messi-fan');
        assert.ok(persona.name);
        assert.ok(persona.systemPrompt.includes('Messi'));
    });

    await t.test('should load and validate referee.md', () => {
        const persona = checkPersonaFile('referee');
        assert.ok(persona.name);
        assert.ok(persona.systemPrompt.includes('Referee'));
    });
});
