# Sanzo Wada Color Database

A comprehensive JSON database of authentic colors and combinations from Sanzo Wada's 1918 "Dictionary of Color Combinations" (色の組み合わせ字典).

## Overview

This database preserves the aesthetic wisdom of Sanzo Wada, a Japanese artist and educator who systematically catalogued traditional Japanese colors and their harmonious combinations. The original work consisted of 159 colors arranged in 348 carefully tested combinations, representing centuries of Japanese color harmony knowledge.

## Database Files

### `sanzo-colors.json`
Core color database containing 35 representative authentic Sanzo colors.

**Structure:**
```json
{
  "metadata": {
    "title": "Sanzo Wada Color Dictionary",
    "source": "Dictionary of Color Combinations (1918)",
    "total_colors": 35,
    "version": "1.0.0"
  },
  "categories": { /* Color category definitions */ },
  "colors": [
    {
      "id": 1,
      "name_japanese": "浅葱色",
      "name_english": "Light Blue",
      "name_romanized": "Asagi-iro",
      "hex": "#00A3AF",
      "rgb": {"r": 0, "g": 163, "b": 175},
      "lab": {"l": 60.2, "a": -25.8, "b": -15.4},
      "hsl": {"h": 184, "s": 100, "l": 34},
      "category": "traditional_blues",
      "psychological_effects": ["calming", "peaceful", "refreshing"],
      "historical_use": "Traditional Japanese textiles",
      "cultural_significance": "Named after leek leaves color",
      "sanzo_plate": 1,
      "frequency_in_combinations": 12,
      "season_association": "summer",
      "texture_affinity": ["silk", "cotton", "ceramic_glaze"]
    }
  ]
}
```

### `combinations.json`
Historical color combinations with harmony analysis.

**Structure:**
```json
{
  "metadata": {
    "title": "Sanzo Wada Color Combinations",
    "total_combinations": 12,
    "reference_file": "sanzo-colors.json"
  },
  "harmony_types": { /* Harmony type definitions */ },
  "usage_contexts": { /* Usage context definitions */ },
  "combinations": [
    {
      "id": 1,
      "name": "Spring Dawn",
      "name_japanese": "春暁",
      "color_ids": [8, 20, 16],
      "color_names": ["Cherry Blossom Pink", "Pale Pink", "Porcelain White"],
      "harmony_type": "analogous",
      "delta_e_scores": [
        {"colors": [8, 20], "delta_e": 12.3, "compatibility": "excellent"}
      ],
      "overall_harmony_score": 9.2,
      "usage_context": "kimono_formal",
      "historical_usage": "Spring wedding ceremonies",
      "modern_applications": ["wedding decor", "spring fashion"],
      "psychological_effect": "Soft, romantic, and nurturing",
      "cultural_significance": "Represents ephemeral beauty of cherry blossoms"
    }
  ]
}
```

## Color Categories

- **traditional_blues**: Traditional Japanese indigo and blue variations
- **warm_reds**: Red family including vermillion, crimson, and coral
- **seasonal_greens**: Green tones representing Japanese seasonal changes
- **elegant_purples**: Purple and violet tones for court and ceremonies
- **soft_yellows**: Yellow family including golden and amber variations
- **neutral_grays**: Gray tones from charcoal to pearl
- **natural_browns**: Brown family including chestnut and bark tones
- **delicate_pinks**: Pink and rose variations
- **earth_tones**: Natural earth-inspired ochres and umbers
- **deep_blacks**: Rich black variations for traditional design

## Harmony Types

- **monochromatic**: Variations of single hue with different saturation/lightness
- **analogous**: Adjacent colors on the color wheel
- **complementary**: Opposite colors on the color wheel
- **split_complementary**: Base color with adjacent complement colors
- **triadic**: Three equally spaced colors on color wheel
- **tetradic**: Two pairs of complementary colors
- **compound**: Complex combinations using multiple principles
- **traditional_japanese**: Combinations based on traditional aesthetics

## Usage Contexts

- **kimono_formal**: Formal kimono and ceremonial wear
- **kimono_casual**: Everyday and seasonal kimono
- **textile_patterns**: Fabric and textile patterns
- **ceramic_design**: Pottery and ceramic decorations
- **interior_design**: Room decoration and furniture
- **festival_decoration**: Seasonal festivals and celebrations
- **tea_ceremony**: Tea ceremony implements and settings
- **calligraphy_art**: Paper and ink combinations
- **woodblock_printing**: Color combinations for ukiyo-e prints
- **architectural_details**: Building decoration and color schemes

## Color Data Format

Each color includes comprehensive data:

### Required Fields
- `id`: Unique identifier
- `name_japanese`: Original Japanese name (kanji/hiragana)
- `name_english`: English translation
- `name_romanized`: Romanized Japanese pronunciation
- `hex`: Hexadecimal color code
- `rgb`: RGB color values (0-255)
- `lab`: LAB color space values
- `hsl`: HSL color values
- `category`: Color category classification
- `psychological_effects`: Array of psychological associations
- `historical_use`: Historical usage context
- `cultural_significance`: Cultural meaning and symbolism
- `sanzo_plate`: Original plate reference number
- `frequency_in_combinations`: Usage frequency in combinations
- `season_association`: Associated season(s)
- `texture_affinity`: Compatible textures and materials

## Combination Data Format

Each combination includes:

### Required Fields
- `id`: Unique identifier
- `name`: English combination name
- `name_japanese`: Japanese combination name
- `color_ids`: Array of referenced color IDs
- `color_names`: Array of color names for reference
- `harmony_type`: Type of color harmony
- `delta_e_scores`: Color compatibility scores
- `overall_harmony_score`: Overall harmony rating (0-10)
- `usage_context`: Primary usage context
- `historical_usage`: Historical application
- `modern_applications`: Contemporary usage suggestions
- `psychological_effect`: Emotional impact description
- `season_association`: Associated season
- `cultural_significance`: Cultural meaning
- `texture_recommendations`: Recommended textures
- `sanzo_plate_reference`: Original plate reference

## Delta E Compatibility Scores

Color compatibility is measured using Delta E (CIE color difference):

- **excellent** (Delta E < 15): Colors blend seamlessly
- **very_good** (Delta E 15-25): Harmonious with slight contrast
- **good** (Delta E 25-35): Balanced contrast, pleasing combination
- **acceptable** (Delta E 35-45): Noticeable contrast, requires skill
- **moderate** (Delta E 45-55): High contrast, dramatic effect
- **challenging** (Delta E 55-70): Very high contrast, expert use required
- **high_contrast** (Delta E > 70): Maximum contrast for special effects

## Historical Context

Sanzo Wada (1883-1967) was a Japanese artist, educator, and color theorist who published the "Dictionary of Color Combinations" in 1918. His work represented the first systematic study of traditional Japanese color harmony, preserving centuries of aesthetic knowledge that had been passed down through generations of artisans, textile workers, and artists.

The original work was revolutionary in its approach:
- Systematic cataloguing of traditional Japanese colors
- Scientific testing of color combinations
- Documentation of cultural and seasonal associations
- Integration of practical usage contexts

## Modern Applications

This database serves as a foundation for:

### Design Applications
- Web and mobile app color schemes
- Brand identity and marketing materials
- Interior design and architecture
- Fashion and textile design
- Product design and packaging

### Cultural Preservation
- Documentation of traditional Japanese aesthetics
- Educational resources for color theory
- Research into historical design practices
- Cross-cultural design understanding

### Technical Applications
- Color recommendation algorithms
- Automated palette generation
- Design system development
- AI-powered design tools

## Validation

The database includes a validation script (`validate-references.py`) that checks:
- JSON syntax and structure validity
- Cross-references between colors and combinations
- Data integrity and completeness
- Consistency of color values and metadata

Run validation:
```bash
python validate-references.py
```

## Database Statistics

Current database contains:
- **35 colors** across 10 categories
- **12 combinations** representing 7 harmony types
- **Seasonal distribution**: Spring (10), Autumn (9), All seasons (6), Summer (4), Winter (6)
- **Complete metadata** for all entries with cultural context

## Future Expansion

This database is designed to be expanded with:
- Additional authentic Sanzo colors (targeting the full 159)
- More historical combinations (targeting the full 348)
- Extended cultural context and usage notes
- Regional variations and interpretations
- Contemporary color adaptations

## Usage Examples

### Finding Colors by Category
```javascript
const traditionalBlues = colors.filter(c => c.category === 'traditional_blues');
```

### Getting Combinations by Harmony Type
```javascript
const analogousCombos = combinations.filter(c => c.harmony_type === 'analogous');
```

### Finding Spring Colors
```javascript
const springColors = colors.filter(c => c.season_association === 'spring');
```

### Color Reference Lookup
```javascript
function getColorById(id) {
  return colors.find(c => c.id === id);
}

function getCombinationColors(combination) {
  return combination.color_ids.map(id => getColorById(id));
}
```

## License and Attribution

This database is based on the public domain work "Dictionary of Color Combinations" by Sanzo Wada (1918). The database structure and implementation are designed for educational and cultural preservation purposes.

When using this database, please acknowledge:
- Original work: "Dictionary of Color Combinations" by Sanzo Wada (1918)
- Database compilation: Sanzo Wada Color Database v1.0.0

## Contributing

To contribute additional authentic Sanzo colors or combinations:
1. Research historical sources and documentation
2. Maintain authentic Japanese color names and cultural context
3. Include complete metadata with cultural significance
4. Run validation script to ensure data integrity
5. Submit with historical references and documentation