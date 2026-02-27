
export const MODEL_NATIONALITIES: readonly string[] = [
    'Korean', 'American', 'British', 'Japanese', 'Chinese', 'French', 'German', 'Italian', 'Spanish', 'Brazilian', 'Indian'
];

export const MODEL_FACE_SHAPES: readonly string[] = [
    'random', 'Circle', 'Diamond', 'Heart', 'Heart with Pointed Chin', 'Heart with Rounded Chin', 'Heart with V-Shape Chin', 'Inverted Triangle', 'Long', 'Oblong', 'Oval', 'Pear', 'Rectangle', 'Round', 'Round with Defined Cheekbones', 'Round with High Cheekbones', 'Round with Soft Cheekbones', 'Square', 'Square Oval', 'Square Round', 'Square with Rounded Jaw', 'Square with Sharp Jaw', 'Square with Soft Jaw', 'Triangle'
];

export const MODEL_HAIR_STYLES: readonly string[] = [
    'random', 'Layered', 'Afro', 'Asymmetrical', 'Balayage', 'Ballerina bun', 'Bangs', 'Beehive', 'Bowlcut', 'Bleached spikes', 'Blunt bob', 'Bob', 'Bouffant', 'Bowl', 'Box braids', 'Braid fade', 'Braided', 'Braided bob', 'Braided pigtails', 'Brave shortcut with shaved sides', 'Broby', 'Buzz', 'Caesar', 'Chignon', 'Choppy', 'Cloudy', 'Cornrows', 'Curls', 'Curly', 'Curly Frizzy', 'Curly bob', 'Curly with bangs', 'Deep side part', 'Double Bun', 'Dreadlocks', 'Faded afro', 'Faux hawk', 'Faux hawk short pixie', 'Feathered', 'Perfectly bald', 'Fishtail braids', 'Flat topcut', 'French bob', 'French braids', 'French twist', 'Frohawk', 'Hair ringlets', 'High and tight', 'High skin fade', 'Honey', 'Italian bob', 'Lemonade braids', 'Long', 'Long pom', 'Long ponytail', 'Long straight', 'Long with bangs', 'Loose Curly Afro', 'Mermaid waves', 'Micro braids', 'Middle part pigtails', 'Modern Caesar', 'Mohawk', 'Multicolored', 'Parted', 'Pigtails', 'Pixie', 'Platinum', 'Pompadour', 'Quiff', 'Razor fade with curls', 'Red', 'Right side shaved', 'Salt and pepper', 'Shag', 'Short', 'Short curly', 'Short curly pixie', 'Short messy curls', 'Shoulder Length with Bangs', 'Shoulder length straight', 'Side Part Comb-Overstyle With High Fade', 'Side braid', 'Side-swept bangs', 'Side-swept fringe', 'Sideswept pixie', 'Smooth bob', 'Space buns', 'Spiky', 'Styled Curls in Short Bob', 'Stacked bob', 'Stitch braids', 'Strawberry', 'Strawberry blonde', 'Sweeping pixie', 'Taper fade with waves', 'Taperedcut with shaved side', 'Textured', 'Textured brush back', 'Tomboy', 'Top knot', 'Two braids', 'Twintails', 'Two dutch braids', 'Undercut', 'Updo', 'Very long wave', 'Waterfall braids', 'Wavy', 'Wavy French Bob Vibes from 1920', 'Wavy bob', 'Wavy undercut', 'Wavy with curtain bangs'
];

export const MODEL_HAIR_COLORS: readonly string[] = [
    'random', 'Auburn', 'Black', 'Blonde', 'Burgundy', 'Caramel', 'Chestnut', 'Chocolate', 'Copper', 'Dirty', 'Gray', 'Honey', 'Jet Black', 'Mahogany', 'Multicolored', 'Pastel', 'Platinum', 'Red', 'Salt and pepper', 'Silver', 'Strawberry', 'White'
];

export const POSE_PRESETS: readonly string[] = [
    'Base Pose',
    'Front, hands on hips',
    'Slightly turned, 3/4 view',
    'Full side profile',
    'Walking towards camera',
    'Leaning against a wall',
    'Standing with arms crossed',
    'Sitting on a stool, looking sideways',
    'One hand on hip, confident pose',
    'Looking over shoulder',
    'Hands gently touching face',
    'One leg crossed over the other',
];

// Constants for Composite Node layout to ensure consistent calculations
export const COMPOSITE_NODE_HEADER_HEIGHT = 40; // From NodeComponent
export const COMPOSITE_NODE_CONTENT_PADDING_X = 24; // 2 * 12px (p-3 in NodeComponent + p-3 in CompositeNode's internal div)
export const COMPOSITE_NODE_CONTENT_PADDING_Y_TOP = 12; // p-3 in NodeComponent (top)
export const COMPOSITE_NODE_CONTENT_PADDING_Y_BOTTOM = 12; // p-3 in NodeComponent (bottom)
export const COMPOSITE_NODE_INTERNAL_SPACING = 12; // space-y-3 -> 12px margin between elements in CompositeNode's content
export const COMPOSITE_NODE_BUTTON_HEIGHT = 48; // A reasonable estimate for the button height

// Constants for RMBG Node background colors
export const RMBG_DEFAULT_BACKGROUND_COLOR = '#FFFFFF'; // White
export const RMBG_COLOR_PRESETS = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'Blue', hex: '#0000FF' },
];
