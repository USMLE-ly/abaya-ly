## Plan

1. **Make product pages show one color swatch only**
   - Update the product detail page so it renders a single non-selectable color circle instead of multiple selectable circles.
   - Keep the Arabic color text above it as the source of truth.

2. **Correct every product’s color data**
   - Update each product in `src/data/products.ts` so `colors` contains only the actual main outfit color.
   - Remove secondary/incorrect colors like white, black, beige, or duplicate tones where they are only trim/pattern colors.

3. **Keep the UI consistent across all products**
   - The circle will use the remaining product color value.
   - Remove unused color-selection state from `src/pages/Product.tsx` so the displayed text and swatch always match.

4. **Verify the fix**
   - Check the product page for the shown item and a few other products to confirm each page has one circle and the swatch color matches the outfit/color label.