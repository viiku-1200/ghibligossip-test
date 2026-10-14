// ═══════════════════════════════════════════════════════════════
// spriteData.ts — All coordinate data for Galaverse Dance Room
// ═══════════════════════════════════════════════════════════════
// Each sprite sheet is 1536x1024 pixels.
// Coordinates are [x, y, width, height] in pixels on the source image.
// These are estimated from visual inspection and may need fine-tuning.

export interface SpriteCoord {
    x: number;
    y: number;
    w: number;
    h: number;
}

// ──────────────────────────────────────
// ROOM SPRITE SHEET: dancefloor_1.png (1536x1024)
// ──────────────────────────────────────

// Background Layer (4 frames) — Top-left area, row 1
export const ROOM_BG: SpriteCoord[] = [
    { x: 10,  y: 35,  w: 220, h: 215 },  // BG_1
    { x: 240, y: 35,  w: 220, h: 215 },  // BG_2
    { x: 470, y: 35,  w: 220, h: 215 },  // BG_3
    { x: 700, y: 35,  w: 220, h: 215 },  // BG_4
];

// Midground Layer (4 frames) — Below BG, row 2
export const ROOM_MID: SpriteCoord[] = [
    { x: 10,  y: 345, w: 220, h: 185 },  // MID_1
    { x: 240, y: 345, w: 220, h: 185 },  // MID_2
    { x: 470, y: 345, w: 220, h: 185 },  // MID_3
    { x: 700, y: 345, w: 220, h: 185 },  // MID_4
];

// Foreground Layer (4 frames) — Below MID, row 3
export const ROOM_FG: SpriteCoord[] = [
    { x: 10,  y: 620, w: 220, h: 160 },  // FG_1
    { x: 240, y: 620, w: 220, h: 160 },  // FG_2
    { x: 470, y: 620, w: 220, h: 160 },  // FG_3
    { x: 700, y: 620, w: 220, h: 160 },  // FG_4
];

// Floor Light Pattern (4 frames) — Bottom-left
export const ROOM_FLOOR: SpriteCoord[] = [
    { x: 15,  y: 640, w: 190, h: 130 },  // FLOOR_1
    { x: 210, y: 640, w: 190, h: 130 },  // FLOOR_2
    { x: 405, y: 640, w: 190, h: 130 },  // FLOOR_3
    { x: 600, y: 640, w: 190, h: 130 },  // FLOOR_4
];

// Stage Lights (8 frames) — Top-right area
export const STAGE_LIGHTS: SpriteCoord[] = [
    { x: 940, y: 20,  w: 68, h: 75 },   // L1
    { x: 1013, y: 20, w: 68, h: 75 },   // L2
    { x: 1086, y: 20, w: 68, h: 75 },   // L3
    { x: 1159, y: 20, w: 68, h: 75 },   // L4
    { x: 1232, y: 20, w: 68, h: 75 },   // L5
    { x: 1305, y: 20, w: 68, h: 75 },   // L6
    { x: 1378, y: 20, w: 68, h: 75 },   // L7
    { x: 1451, y: 20, w: 68, h: 75 },   // L8
];

// Disco Ball (8 frames)
export const DISCO_BALL: SpriteCoord[] = [
    { x: 940, y: 110, w: 68, h: 68 },   // D1
    { x: 1013, y: 110, w: 68, h: 68 },  // D2
    { x: 1086, y: 110, w: 68, h: 68 },  // D3
    { x: 1159, y: 110, w: 68, h: 68 },  // D4
    { x: 1232, y: 110, w: 68, h: 68 },  // D5
    { x: 1305, y: 110, w: 68, h: 68 },  // D6
    { x: 1378, y: 110, w: 68, h: 68 },  // D7
    { x: 1451, y: 110, w: 68, h: 68 },  // D8
];

// Neon Sign "Music Lives Here" (6 frames)
export const NEON_SIGN: SpriteCoord[] = [
    { x: 940,  y: 195, w: 95, h: 40 },  // N1
    { x: 1040, y: 195, w: 95, h: 40 },  // N2
    { x: 1140, y: 195, w: 95, h: 40 },  // N3
    { x: 1240, y: 195, w: 95, h: 40 },  // N4
    { x: 1340, y: 195, w: 95, h: 40 },  // N5
    { x: 1440, y: 195, w: 95, h: 40 },  // N6
];

// Curtain Animation (4 frames)
export const CURTAINS: SpriteCoord[] = [
    { x: 940,  y: 250, w: 80, h: 95 },  // C1
    { x: 1025, y: 250, w: 80, h: 95 },  // C2
    { x: 1110, y: 250, w: 80, h: 95 },  // C3
    { x: 1195, y: 250, w: 80, h: 95 },  // C4
];

// Fog / Smoke (6 frames)
export const FOG_SMOKE: SpriteCoord[] = [
    { x: 1290, y: 250, w: 40, h: 50 },  // F1
    { x: 1335, y: 250, w: 40, h: 50 },  // F2
    { x: 1380, y: 250, w: 40, h: 50 },  // F3
    { x: 1290, y: 305, w: 40, h: 50 },  // F4
    { x: 1335, y: 305, w: 40, h: 50 },  // F5
    { x: 1380, y: 305, w: 40, h: 50 },  // F6
];

// Confetti (6 frames)
export const CONFETTI: SpriteCoord[] = [
    { x: 940,  y: 365, w: 95, h: 95 },  // CF1
    { x: 1040, y: 365, w: 95, h: 95 },  // CF2
    { x: 1140, y: 365, w: 95, h: 95 },  // CF4 (skipped 3 in sheet)
    { x: 1240, y: 365, w: 95, h: 95 },  // CF6
];

// City Lights (6 frames)
export const CITY_LIGHTS: SpriteCoord[] = [
    { x: 1290, y: 365, w: 50, h: 70 },  // CITY1
    { x: 1345, y: 365, w: 50, h: 70 },  // CITY2
    { x: 1400, y: 365, w: 50, h: 70 },  // CITY3
    { x: 1455, y: 365, w: 50, h: 70 },  // CITY4
    { x: 1290, y: 440, w: 50, h: 70 },  // CITY5
];

// Candle (6 frames)
export const CANDLE: SpriteCoord[] = [
    { x: 940,  y: 480, w: 30, h: 45 },  // CA1
    { x: 975,  y: 480, w: 30, h: 45 },  // CA2
    { x: 1010, y: 480, w: 30, h: 45 },  // CA3
    { x: 1045, y: 480, w: 30, h: 45 },  // CA4
    { x: 1080, y: 480, w: 30, h: 45 },  // CA5
    { x: 1115, y: 480, w: 30, h: 45 },  // CA6
];

// Wine Glass (4 frames)
export const WINE_GLASS: SpriteCoord[] = [
    { x: 1170, y: 480, w: 35, h: 45 },  // WG1
    { x: 1210, y: 480, w: 35, h: 45 },  // WG2
    { x: 1250, y: 480, w: 35, h: 45 },  // WG3
    { x: 1290, y: 480, w: 35, h: 45 },  // WG4
];

// Bottle Sparkle (4 frames)
export const BOTTLE_SPARKLE: SpriteCoord[] = [
    { x: 1350, y: 480, w: 40, h: 50 },  // BT1
    { x: 1395, y: 480, w: 40, h: 50 },  // BT2
    { x: 1440, y: 480, w: 40, h: 50 },  // BT3
    { x: 1485, y: 480, w: 40, h: 50 },  // BT4
];

// Full sheet dimensions
export const ROOM_SHEET_SIZE = { width: 1536, height: 1024 };
export const SINGER_SHEET_SIZE = { width: 1536, height: 1024 };
export const AUDIENCE_SHEET_SIZE = { width: 1536, height: 1024 };

// ──────────────────────────────────────
// SINGER SPRITE SHEET: female_singer.png (1774x887)
// ──────────────────────────────────────
export interface PoseRow {
    name: string;
    frameCount: number;
    frames: SpriteCoord[];
    row?: number;
    y?: number;
}

const SINGER_FRAME_W = 1536 / 12; // 128

const createSingerRow = (name: string, y: number, height: number): PoseRow => {
    return {
        name,
        frameCount: 12,
        frames: Array.from({ length: 12 }, (_, i) => ({
            x: Math.round(i * SINGER_FRAME_W),
            y,
            w: Math.round(SINGER_FRAME_W),
            h: height
        }))
    };
};

export const SINGER_POSES: Record<string, PoseRow> = {
    singing: createSingerRow('SINGING', 28, 227),
    movement: createSingerRow('MOVEMENT', 326, 226),
    emotion: createSingerRow('EMOTION', 625, 165),
    special: createSingerRow('SPECIAL', 840, 178),
    
    // Alias common simple poses to avoid crashes if they are passed
    idle: createSingerRow('SINGING', 28, 227),
    dance: createSingerRow('MOVEMENT', 326, 226)
};


// ──────────────────────────────────────
// AUDIENCE SPRITE SHEET: boy1audience.png (1536x1024)
// ──────────────────────────────────────
// Layout: Uniform 12 columns x 4 rows (128x256 per frame)

const AUDIENCE_FRAME_W = 1536 / 12; // 128
const AUDIENCE_FRAME_H = 1024 / 4;  // 256

const createAudienceRow = (name: string, rowIdx: number): PoseRow => {
    return {
        name,
        frameCount: 12,
        frames: Array.from({ length: 12 }, (_, i) => ({
            x: Math.round(i * AUDIENCE_FRAME_W),
            y: Math.round(rowIdx * AUDIENCE_FRAME_H),
            w: Math.round(AUDIENCE_FRAME_W),
            h: Math.round(AUDIENCE_FRAME_H)
        }))
    };
};

export const AUDIENCE_POSES: Record<string, PoseRow> = {
    // Assuming each row corresponds to an action (like singer)
    dance: createAudienceRow('DANCE', 0),
    cheer: createAudienceRow('CHEER', 1),
    drink: createAudienceRow('DRINK', 2),
    special: createAudienceRow('SPECIAL', 3),
};
