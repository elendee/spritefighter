const KEYBINDS = {
    'ArrowLeft': { action: 'left', description: 'Move Left' },
    'ArrowRight': { action: 'right', description: 'Move Right' },
    'KeyA': { action: 'left', description: 'Move Left (Alt)' },
    'KeyD': { action: 'right', description: 'Move Right (Alt)' },
    'Space': { action: 'jump', description: 'Jump' },
    'KeyK': { action: 'kick', description: 'Light Kick' },
    'KeyJ': { action: 'punch_light', description: 'Light Punch' },
    'KeyU': { action: 'punch_medium', description: 'Medium Punch' },
    'KeyI': { action: 'punch_heavy', description: 'Heavy Punch' },
    'KeyL': { action: 'kick_medium', description: 'Medium Kick' },
    'KeyO': { action: 'kick_heavy', description: 'Heavy Kick' },
};

export default KEYBINDS;