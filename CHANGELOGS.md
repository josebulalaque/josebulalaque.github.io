# Changelog

All notable changes to this project will be documented in this file.

## 2026-02-04
- Added custom image upload for Number Generator to replace default food emojis.
- Users can upload multiple images which are stored in localStorage as base64.
- Preview thumbnails display uploaded images below the generator controls.
- Mixed mode: if fewer than 25 images uploaded, remaining slots filled with emojis.
- Clear All button to remove all uploaded images and revert to default emojis.
- Images persist across page refreshes.
- Added automatic image resizing (max 150x150, JPEG 80% quality) to reduce storage usage.
- Added image count display showing number of uploaded images.
- Added error handling for localStorage quota exceeded with user alert.
- Added display mode toggles to choose between images only, emojis only, or both.

## 2026-02-03
- Added Number Generator page with food-themed random number reveal animation.
- Large food emojis (96px) cover the display and scatter/fly away with a slow, dramatic animation.
- Number randomizes behind the food emojis, then settles on the final result after the reveal.
- Includes min/max range inputs and recent numbers history.

## 2026-01-26
- Built the participant registration flow with auto-incrementing raffle numbers.
- Added dashboard stats and recent activity.
- Added Events and Raffles pages with draft and draw workflows.
- Implemented Major draw suspense reveal (winner-by-winner) with inline loading.
- Added Show Winners on drawn raffles with a large-screen popup display.
- Added raffle draw types (Minor/Major) and eligible participant count indicator.
- Added raffle audience targeting (everyone, family, non-family).
- Expanded theme system with multiple presets, including Barrio Fiesta variants.
- Improved mobile responsiveness across navigation, panels, and forms.
- Added CSV export, search, and localStorage persistence.
- Refined dashboard copy and brand subtitle for a more festive tone.
