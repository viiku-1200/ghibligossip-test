// ═══════════════════════════════════════════════════════════════
// GalaverseScreen.tsx — Entry wrapper for the Galaverse Dance Room
// ═══════════════════════════════════════════════════════════════
// Delegates to the modular galaverse/GalaDanceScreen which
// matches the anime.html split-screen layout exactly.

import React from 'react';
import GalaDanceScreen from './galaverse/GalaDanceScreen';

export default function GalaverseScreen({ onBack }: { onBack: () => void }) {
    return <GalaDanceScreen onBack={onBack} />;
}
