const readline = require('readline');

function showTerminalMenu(title, options, callback) {
    // If stdin is not a TTY (non-interactive shell), fallback to choosing the first option immediately
    if (!process.stdin.isTTY) {
        console.log(`[Non-Interactive Mode] Selecting first option: "${options[0]}"`);
        return callback(0);
    }

    let selectedIndex = 0;

    readline.emitKeypressEvents(process.stdin);
    try {
        process.stdin.setRawMode(true);
    } catch (e) {
        // Fallback for environments where raw mode is not supported
        console.log(`[Raw Mode Unsupported] Selecting first option: "${options[0]}"`);
        return callback(0);
    }

    function render() {
        console.clear();
        console.log(`\x1b[32m========================================================\x1b[0m`);
        console.log(`⚽ \x1b[1m\x1b[36m${title}\x1b[0m ⚽`);
        console.log(`\x1b[32m========================================================\x1b[0m\n`);
        console.log("Use \x1b[1mUp/Down Arrow\x1b[0m keys to navigate, \x1b[1mEnter\x1b[0m to select.\n");

        options.forEach((opt, idx) => {
            if (idx === selectedIndex) {
                console.log(`\x1b[46m\x1b[30m > ${opt} \x1b[0m`);
            } else {
                console.log(`   ${opt}`);
            }
        });
        console.log(`\n\x1b[32m========================================================\x1b[0m`);
    }

    render();

    function onKeypress(str, key) {
        if (!key) return;
        
        if (key.ctrl && key.name === 'c') {
            cleanup();
            process.exit(0);
        }

        if (key.name === 'up' || key.name === 'k') {
            selectedIndex = (selectedIndex - 1 + options.length) % options.length;
            render();
        } else if (key.name === 'down' || key.name === 'j') {
            selectedIndex = (selectedIndex + 1) % options.length;
            render();
        } else if (key.name === 'return') {
            cleanup();
            callback(selectedIndex);
        }
    }

    function cleanup() {
        process.stdin.removeListener('keypress', onKeypress);
        try {
            process.stdin.setRawMode(false);
        } catch (e) {}
        // Ensure stdin is paused so process can exit cleanly if needed
        process.stdin.pause();
    }

    process.stdin.resume();
    process.stdin.on('keypress', onKeypress);
}

module.exports = { showTerminalMenu };
