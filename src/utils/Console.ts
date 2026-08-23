type Rgb = readonly [number, number, number];
type Glyph = readonly [string, string, string];

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const UNDERLINE = '\x1b[4m';

const RED = [248, 113, 113] as const;
const GREEN = [74, 222, 128] as const;
const YELLOW = [250, 204, 21] as const;
const BLUE = [96, 165, 250] as const;
const MAGENTA = [192, 132, 252] as const;
const CYAN = [34, 211, 238] as const;
const WHITE = [248, 250, 252] as const;
const GRAY = [148, 163, 184] as const;
const BRIGHT_BLUE = [56, 189, 248] as const;
const BRIGHT_YELLOW = [253, 224, 71] as const;
const BRIGHT_MAGENTA = [240, 171, 252] as const;
const ROSE = [251, 113, 133] as const;
const AMBER = [251, 191, 36] as const;

const REV_RAINBOW: readonly Rgb[] = [RED, MAGENTA, BLUE, GREEN, YELLOW, RED];

const FONT: Record<string, Glyph> = {
    ' ': ['   ', '   ', '   '],
    '-': ['   ', '▀▀▀', '   '],
    '0': ['█▀█', '█ █', '▀▀▀'],
    '1': ['▄█ ', ' █ ', '▀█▀'],
    '2': ['▀▀█', '█▀▀', '▀▀▀'],
    '3': ['▀▀█', ' ▀█', '▀▀▀'],
    '4': ['█ █', '▀▀█', '  ▀'],
    '5': ['█▀▀', '▀▀█', '▀▀▀'],
    '6': ['█▀▀', '█▀█', '▀▀▀'],
    '7': ['▀▀█', '  █', '  ▀'],
    '8': ['█▀█', '█▀█', '▀▀▀'],
    '9': ['█▀█', '▀▀█', '▀▀▀'],
    A: ['█▀█', '█▀█', '▀ ▀'],
    B: ['█▀▄', '█▀▄', '▀▀ '],
    C: ['█▀▀', '█  ', '▀▀▀'],
    D: ['█▀▄', '█ █', '▀▀ '],
    E: ['█▀▀', '█▀ ', '▀▀▀'],
    F: ['█▀▀', '█▀ ', '▀  '],
    G: ['█▀▀', '█ █', '▀▀▀'],
    H: ['█ █', '█▀█', '▀ ▀'],
    I: ['▀█▀', ' █ ', '▀█▀'],
    J: ['▀▀█', '  █', '▀▀ '],
    K: ['█ █', '█▀▄', '▀ ▀'],
    L: ['█  ', '█  ', '▀▀▀'],
    M: ['█▄█', '█▀█', '▀ ▀'],
    N: ['█▄█', '█ █', '▀ ▀'],
    O: ['█▀█', '█ █', '▀▀▀'],
    P: ['█▀█', '█▀▀', '▀  '],
    Q: ['█▀█', '█ █', '▀▀▄'],
    R: ['█▀█', '█▀▄', '▀ ▀'],
    S: ['█▀▀', '▀▀█', '▀▀▀'],
    T: ['▀█▀', ' █ ', ' █ '],
    U: ['█ █', '█ █', '▀▀▀'],
    V: ['█ █', '█ █', ' ▀ '],
    W: ['█ █', '█▄█', '▀ ▀'],
    X: ['█ █', ' █ ', '▀ ▀'],
    Y: ['█ █', ' ▀ ', ' █ '],
    Z: ['▀▀█', ' █ ', '▀▀▀'],
};

const colorEnabled =
    process.stdout.isTTY !== false &&
    process.env.NO_COLOR === undefined &&
    process.env.FORCE_COLOR !== '0';

const trueColor =
    process.env.FORCE_COLOR === '3' ||
    process.env.COLORTERM === 'truecolor' ||
    process.env.COLORTERM === '24bit' ||
    process.env.TERM_PROGRAM === 'iTerm.app' ||
    process.env.TERM_PROGRAM === 'vscode' ||
    process.env.TERM_PROGRAM === 'WezTerm' ||
    process.env.TERM_PROGRAM === 'ghostty' ||
    Boolean(process.env.WT_SESSION);

const hyperlinksEnabled =
    colorEnabled &&
    process.env.TMUX === undefined &&
    (process.env.TERM_PROGRAM === 'iTerm.app' ||
        process.env.TERM_PROGRAM === 'vscode' ||
        process.env.TERM_PROGRAM === 'WezTerm' ||
        process.env.TERM_PROGRAM === 'ghostty' ||
        process.env.TERM_PROGRAM === 'kitty' ||
        Boolean(process.env.WT_SESSION) ||
        Boolean(process.env.VTE_VERSION));

function toAnsi256(r: number, g: number, b: number): number {
    if (r === g && g === b) {
        if (r < 8) {
            return 16;
        }
        if (r > 248) {
            return 231;
        }
        return Math.round(((r - 8) / 247) * 24) + 232;
    }
    return (
        16 +
        36 * Math.round((r / 255) * 5) +
        6 * Math.round((g / 255) * 5) +
        Math.round((b / 255) * 5)
    );
}

function colorSeq(r: number, g: number, b: number): string {
    if (trueColor) {
        return `\x1b[38;2;${r};${g};${b}m`;
    }
    return `\x1b[38;5;${toAnsi256(r, g, b)}m`;
}

function fg([r, g, b]: Rgb, text: string, wrap = ''): string {
    if (!colorEnabled) {
        return text;
    }
    return `${wrap}${colorSeq(r, g, b)}${text}${RESET}`;
}

function hslToRgb(h: number, s: number, l: number): Rgb {
    const sat = s / 100;
    const lit = l / 100;
    const a = sat * Math.min(lit, 1 - lit);
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        return lit - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    };
    return [Math.round(255 * f(0)), Math.round(255 * f(8)), Math.round(255 * f(4))];
}

function rainbow(text: string, reverse = false, hueShift = 0): string {
    const chars = [...text];
    if (!colorEnabled || chars.length === 0) {
        return text;
    }
    const n = Math.max(chars.length - 1, 1);
    let out = BOLD;
    for (let i = 0; i < chars.length; i += 1) {
        const t = i / n;
        const hue = ((reverse ? 1 - t : t) * 300 + hueShift) % 360;
        const [r, g, b] = hslToRgb(hue, 95, 62);
        out += `${colorSeq(r, g, b)}${chars[i]}`;
    }
    return `${out}${RESET}`;
}

function zebra(text: string): string {
    const chars = [...text];
    if (!colorEnabled) {
        return text;
    }
    let out = BOLD;
    for (let i = 0; i < chars.length; i += 1) {
        const [r, g, b] = REV_RAINBOW[i % REV_RAINBOW.length] ?? RED;
        out += `${colorSeq(r, g, b)}${chars[i]}`;
    }
    return `${out}${RESET}`;
}

function link(label: string, url: string, paint: Rgb): string {
    const styled = fg(paint, label, `${BOLD}${UNDERLINE}`);
    if (!hyperlinksEnabled) {
        return styled;
    }
    return `\x1b]8;;${url}\x07${styled}\x1b]8;;\x07`;
}

function timestamp(): string {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'short' });
    const day = now.getDate();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${month} ${day}, ${hours}:${minutes} ${period}`;
}

function arrow(color: Rgb, label: string, value: string, valueColor: Rgb): string {
    return `${fg(color, '>>', BOLD)}${fg(WHITE, ` ${label} `, BOLD)}${fg(valueColor, value, BOLD)}`;
}

function heading(title: string): string {
    return fg(MAGENTA, `\n>>> ${title} <<<`, BOLD);
}

function diamonds(width = 8): string {
    return '◆'.repeat(width);
}

function sparkleMarks(width: number): string {
    const marks = ['·', '✦', ' ', '✧', '·', ' ', '✦', '✧'];
    let out = '';
    for (let i = 0; i < width; i += 1) {
        out += marks[i % marks.length];
    }
    return out;
}

function sparkle(width = 48): string {
    return rainbow(sparkleMarks(width), true, 120);
}

function sparkleFrame(label: string, wing = 16): { bottom: string; top: string } {
    const stamp = ` ${label} `;
    const start = wing;
    const end = wing + [...stamp].length;
    const marks = sparkleMarks(end + wing);
    return {
        bottom: rainbow(marks, true, 120),
        top: `${rainbow(marks.slice(0, start), true, 120)}${fg(WHITE, stamp, BOLD)}${rainbow(marks.slice(end), false, 40)}`,
    };
}

function big(text: string): string {
    const rows: [string, string, string] = ['', '', ''];
    for (const char of text.toUpperCase()) {
        const [a, b, c] = FONT[char] ?? FONT[' '] ?? ['   ', '   ', '   '];
        rows[0] += `${a} `;
        rows[1] += `${b} `;
        rows[2] += `${c} `;
    }
    return [
        rainbow(rows[0], false, 0),
        rainbow(rows[1], false, 45),
        rainbow(rows[2], false, 90),
    ].join('\n');
}

function formatCause(cause: unknown): string {
    let raw: string;
    if (cause instanceof Error) {
        raw = cause.stack ?? cause.message;
    } else if (typeof cause === 'string') {
        raw = cause;
    } else {
        try {
            raw = JSON.stringify(cause);
        } catch {
            raw = String(cause);
        }
    }
    return raw.split('\n').slice(0, 12).join('\n');
}

export const log = {
    command(entry: {
        channel?: string;
        command: string;
        guild: string;
        jump?: string;
        latency?: number;
        user: string;
        userUrl?: string;
    }): void {
        const who = entry.userUrl
            ? link(entry.user, entry.userUrl, BRIGHT_MAGENTA)
            : fg(BRIGHT_MAGENTA, entry.user, `${BOLD}${UNDERLINE}`);
        const command = entry.jump
            ? link(entry.command, entry.jump, BRIGHT_YELLOW)
            : fg(BRIGHT_YELLOW, entry.command, BOLD);
        const frame = sparkleFrame(timestamp());
        const lines = [
            frame.top,
            `${fg(BRIGHT_BLUE, '🔧 Command:', BOLD)} ${command}`,
            `${fg(BRIGHT_BLUE, '🔍 Executor:', BOLD)} ${who} ${fg(GRAY, '(', BOLD)}${fg(BRIGHT_BLUE, 'Guild: ', BOLD)}${fg(BRIGHT_MAGENTA, entry.guild, `${BOLD}${UNDERLINE}`)}${fg(GRAY, ')', BOLD)}`,
        ];
        if (entry.channel) {
            lines.push(`${fg(BRIGHT_BLUE, '📍 Channel:', BOLD)} ${fg(CYAN, entry.channel, BOLD)}`);
        }
        if (entry.latency !== undefined) {
            const pingColor = entry.latency < 150 ? GREEN : entry.latency < 400 ? AMBER : ROSE;
            lines.push(
                `${fg(BRIGHT_BLUE, '⚡ Latency:', BOLD)} ${fg(pingColor, `${entry.latency}ms`, BOLD)}`
            );
        }
        lines.push(frame.bottom);
        console.log(`${lines.join('\n')}\n`);
    },

    error(message: string, cause?: unknown): void {
        const head = `${rainbow(diamonds(6))} ${fg(ROSE, `⛔  ${message}`, BOLD)}`;
        if (cause === undefined) {
            console.error(`${head}\n`);
            return;
        }
        const rail = rainbow('◆◇'.repeat(10), false, 0);
        console.error(
            `${rail}\n${head}\n${fg(ROSE, formatCause(cause))}\n${rainbow('◆◇'.repeat(10), true, 80)}\n`
        );
    },

    info(message: string): void {
        console.log(`${rainbow('◆')} ${fg(CYAN, message, BOLD)} ${rainbow('◆', true)}`);
    },

    ok(message: string): void {
        console.log(`${sparkle(12)} ${fg(GREEN, message, BOLD)} ${sparkle(12)}`);
    },

    ready(stats: {
        boot: string;
        channels: number;
        cluster: string;
        commands: number;
        cpu: string;
        discord: string;
        events: number;
        guilds: number;
        heap: string;
        invite: string;
        memory: string;
        name: string;
        pid: string;
        runtime: string;
        shards: string;
        users: number;
        version: string;
    }): void {
        const wave = '*~'.repeat(26);
        const rule = rainbow('═'.repeat(56));
        const nodeLabel = stats.runtime.startsWith('Bun') ? 'Bun:' : 'Node:';
        const title = stats.name.length <= 14 ? big(stats.name) : rainbow(stats.name.toUpperCase());

        console.log(`\n${rule}`);
        console.log(title);
        console.log(zebra(wave));
        console.log(heading(`${stats.name} Stats`));
        console.log(arrow(RED, 'Users:', stats.users.toLocaleString('en'), RED));
        console.log(arrow(GREEN, 'Guilds:', stats.guilds.toLocaleString('en'), GREEN));
        console.log(arrow(CYAN, 'Channels:', stats.channels.toLocaleString('en'), CYAN));
        console.log(arrow(YELLOW, 'Slash Commands:', String(stats.commands), YELLOW));
        console.log(arrow(BLUE, 'Events:', String(stats.events), BLUE));
        console.log(arrow(GREEN, 'Shards:', stats.shards, GREEN));
        console.log(arrow(AMBER, 'Process:', stats.cluster, AMBER));
        console.log(arrow(WHITE, 'Boot:', stats.boot, CYAN));
        console.log(heading(`${stats.name} Specs`));
        console.log(arrow(MAGENTA, nodeLabel, stats.runtime, MAGENTA));
        console.log(arrow(CYAN, 'Memory:', stats.memory, CYAN));
        console.log(arrow(BLUE, 'Heap:', stats.heap, BLUE));
        console.log(arrow(RED, 'CPU:', stats.cpu, RED));
        console.log(arrow(YELLOW, 'Discord.js:', stats.discord, YELLOW));
        console.log(arrow(GREEN, 'Version:', stats.version, GREEN));
        console.log(arrow(GRAY, 'PID:', stats.pid, WHITE));
        console.log(heading(`${stats.name} Invite Link`));
        console.log(`${fg(BLUE, '>>', BOLD)}  ${link(stats.invite, stats.invite, BLUE)}`);
        console.log(`${rule}\n`);
    },

    warn(message: string, cause?: unknown): void {
        const lines = [
            zebra('◆◇'.repeat(10)),
            `${zebra(diamonds(6))} ${fg(AMBER, `⚠️  ${message}`, BOLD)}`,
        ];
        if (cause !== undefined) {
            lines.push(fg(GRAY, formatCause(cause)));
        }
        lines.push(zebra('◆◇'.repeat(10)));
        console.warn(`${lines.join('\n')}\n`);
    },
};
