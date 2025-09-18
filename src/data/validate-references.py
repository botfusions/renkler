#!/usr/bin/env python3
"""
Validation script for Sanzo Wada color database
Checks cross-references between sanzo-colors.json and combinations.json
"""

import json
import sys
from pathlib import Path

def load_json_file(filename):
    """Load and parse a JSON file"""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return None

def validate_color_database(colors_data):
    """Validate the color database structure"""
    print("Validating sanzo-colors.json structure...")

    errors = []

    # Check required top-level keys
    required_keys = ['metadata', 'categories', 'colors']
    for key in required_keys:
        if key not in colors_data:
            errors.append(f"Missing required key: {key}")

    # Validate colors array
    if 'colors' in colors_data:
        colors = colors_data['colors']
        color_ids = set()

        for i, color in enumerate(colors):
            # Check required color fields
            required_color_fields = [
                'id', 'name_japanese', 'name_english', 'name_romanized',
                'hex', 'rgb', 'lab', 'hsl', 'category',
                'psychological_effects', 'historical_use', 'cultural_significance',
                'sanzo_plate', 'frequency_in_combinations', 'season_association',
                'texture_affinity'
            ]

            for field in required_color_fields:
                if field not in color:
                    errors.append(f"Color {i}: Missing required field '{field}'")

            # Check for duplicate IDs
            if 'id' in color:
                if color['id'] in color_ids:
                    errors.append(f"Duplicate color ID: {color['id']}")
                color_ids.add(color['id'])

            # Validate HEX format
            if 'hex' in color:
                hex_color = color['hex']
                if not hex_color.startswith('#') or len(hex_color) != 7:
                    errors.append(f"Color {color.get('id', i)}: Invalid HEX format: {hex_color}")

            # Validate RGB values
            if 'rgb' in color:
                rgb = color['rgb']
                for component in ['r', 'g', 'b']:
                    if component not in rgb:
                        errors.append(f"Color {color.get('id', i)}: Missing RGB component '{component}'")
                    elif not (0 <= rgb[component] <= 255):
                        errors.append(f"Color {color.get('id', i)}: RGB {component} value out of range: {rgb[component]}")

    return errors, color_ids

def validate_combinations_database(combinations_data, valid_color_ids):
    """Validate the combinations database structure and references"""
    print("Validating combinations.json structure...")

    errors = []

    # Check required top-level keys
    required_keys = ['metadata', 'harmony_types', 'usage_contexts', 'combinations']
    for key in required_keys:
        if key not in combinations_data:
            errors.append(f"Missing required key: {key}")

    # Validate combinations array
    if 'combinations' in combinations_data:
        combinations = combinations_data['combinations']
        combination_ids = set()

        for i, combo in enumerate(combinations):
            # Check required combination fields
            required_combo_fields = [
                'id', 'name', 'name_japanese', 'color_ids', 'color_names',
                'harmony_type', 'delta_e_scores', 'overall_harmony_score',
                'usage_context', 'historical_usage', 'modern_applications',
                'psychological_effect', 'season_association', 'cultural_significance',
                'texture_recommendations', 'sanzo_plate_reference'
            ]

            for field in required_combo_fields:
                if field not in combo:
                    errors.append(f"Combination {i}: Missing required field '{field}'")

            # Check for duplicate IDs
            if 'id' in combo:
                if combo['id'] in combination_ids:
                    errors.append(f"Duplicate combination ID: {combo['id']}")
                combination_ids.add(combo['id'])

            # Validate color ID references
            if 'color_ids' in combo:
                for color_id in combo['color_ids']:
                    if color_id not in valid_color_ids:
                        errors.append(f"Combination {combo.get('id', i)}: References invalid color ID: {color_id}")

            # Validate harmony score range
            if 'overall_harmony_score' in combo:
                score = combo['overall_harmony_score']
                if not (0 <= score <= 10):
                    errors.append(f"Combination {combo.get('id', i)}: Harmony score out of range (0-10): {score}")

            # Validate delta E scores
            if 'delta_e_scores' in combo:
                for delta_score in combo['delta_e_scores']:
                    if 'colors' not in delta_score or 'delta_e' not in delta_score:
                        errors.append(f"Combination {combo.get('id', i)}: Invalid delta E score structure")
                    elif len(delta_score['colors']) != 2:
                        errors.append(f"Combination {combo.get('id', i)}: Delta E score must compare exactly 2 colors")

    return errors

def generate_statistics(colors_data, combinations_data):
    """Generate statistics about the database"""
    print("\n=== DATABASE STATISTICS ===")

    if 'colors' in colors_data:
        total_colors = len(colors_data['colors'])
        print(f"Total Colors: {total_colors}")

        # Category distribution
        categories = {}
        seasons = {}
        for color in colors_data['colors']:
            cat = color.get('category', 'unknown')
            categories[cat] = categories.get(cat, 0) + 1

            season = color.get('season_association', 'unknown')
            seasons[season] = seasons.get(season, 0) + 1

        print("\nColor Categories:")
        for cat, count in sorted(categories.items()):
            print(f"  {cat}: {count}")

        print("\nSeasonal Distribution:")
        for season, count in sorted(seasons.items()):
            print(f"  {season}: {count}")

    if 'combinations' in combinations_data:
        total_combos = len(combinations_data['combinations'])
        print(f"\nTotal Combinations: {total_combos}")

        # Harmony type distribution
        harmony_types = {}
        for combo in combinations_data['combinations']:
            harmony = combo.get('harmony_type', 'unknown')
            harmony_types[harmony] = harmony_types.get(harmony, 0) + 1

        print("\nHarmony Types:")
        for harmony, count in sorted(harmony_types.items()):
            print(f"  {harmony}: {count}")

def main():
    """Main validation function"""
    print("Sanzo Wada Color Database Validation")
    print("=" * 40)

    # Load data files
    colors_data = load_json_file('sanzo-colors.json')
    combinations_data = load_json_file('combinations.json')

    if not colors_data or not combinations_data:
        print("Failed to load required data files.")
        sys.exit(1)

    # Validate colors database
    color_errors, valid_color_ids = validate_color_database(colors_data)

    # Validate combinations database
    combo_errors = validate_combinations_database(combinations_data, valid_color_ids)

    # Report results
    total_errors = len(color_errors) + len(combo_errors)

    if color_errors:
        print(f"\nColor Database Errors ({len(color_errors)}):")
        for error in color_errors:
            print(f"  [ERROR] {error}")

    if combo_errors:
        print(f"\nCombinations Database Errors ({len(combo_errors)}):")
        for error in combo_errors:
            print(f"  [ERROR] {error}")

    if total_errors == 0:
        print("\n[SUCCESS] All validations passed!")
        generate_statistics(colors_data, combinations_data)
    else:
        print(f"\n[FAILED] Found {total_errors} validation errors.")
        sys.exit(1)

if __name__ == "__main__":
    main()