> What is the best way to give you design inputs from Figma?

⏺ Great question! Here are the best ways to share Figma designs with me, ranked by effectiveness:

  1. Screenshots (Best for Most Cases) ⭐

  How: Export frames/components as PNG/JPG from Figma, save them locally, then provide the file path.

  Why it works:
  - I can read images directly using the Read tool
  - I can see the full visual design, spacing, colors, typography
  - I can analyze layouts, components, and visual hierarchy
  - Works great for showing UI states (hover, active, etc.)

  Example:
  Here's the design for the API playground. See: /path/to/figma-export.png

  Best for:
  - Complete page designs
  - Component designs
  - Visual mockups
  - Color schemes and typography
  - Layout examples

  2. Figma Public URLs (Good for Context)

  How: Share the Figma file URL (make sure it's set to "Anyone with the link can view")

  Why it works:
  - I can use WebFetch to access public Figma pages
  - Good for getting overall context
  - Can see design system documentation

  Limitations:
  - I can't interact with Figma's canvas directly
  - Better as supplementary context

  Example:
  Here's the Figma file: https://www.figma.com/file/abc123/Anty-Design-System

  3. Figma Dev Mode Specs (Best for Precision) 🎯

  How:
  1. In Figma, select a component/frame
  2. Switch to Dev Mode (right panel)
  3. Copy CSS or export as code
  4. Paste the specs as text

  Why it works:
  - Gives me exact values: spacing, colors, typography
  - Can see Tailwind class mappings if configured
  - Precise implementation details

  Example:
  From Figma Dev Mode:

  Button Component:
  - Background: #041D2B
  - Padding: 16px 40px
  - Border-radius: 8px
  - Font: Inter, 16px, 700
  - Height: 40px
  - Hover: #9A94FF

  4. Component Annotations (Great for Complex UIs)

  How: Add text annotations to your Figma designs explaining:
  - Interaction behavior
  - States (hover, active, disabled)
  - Responsive breakpoints
  - Animation details

  Then share as screenshot.

  Example:
  [Screenshot showing:]
  - Button: "Hover: background changes to #9A94FF with 0.25s ease"
  - Input: "Focus: blue ring with 3px offset"
  - Card: "Desktop: 3-column grid, Tablet: 2-column, Mobile: 1-column"

  5. Design Tokens Export (Ideal for Design Systems)

  How:
  1. Export design tokens from Figma (using plugins like "Design Tokens")
  2. Share as JSON or CSS variables
  3. I can integrate directly into code

  Example:
  {
    "colors": {
      "primary": "#041D2B",
      "primary-hover": "#9A94FF",
      "text": {
        "primary": "#0F172A",
        "secondary": "#64748B"
      }
    },
    "spacing": {
      "xs": "4px",
      "sm": "8px",
      "md": "16px",
      "lg": "24px"
    }
  }

  My Recommendations by Use Case

  For a New Feature/Page:

  1. Full page screenshot - Overall layout
  2. Component screenshots - Detailed views
  3. Dev mode specs - Exact measurements
  4. Annotations - Interaction notes

  For Design System/Component Library:

  1. Component screenshots - All states
  2. Design tokens export - Colors, spacing, typography
  3. Figma URL - Reference documentation

  For Styling Updates:

  1. Before/after screenshots
  2. Dev mode specs - Changed values
  3. Color palette screenshot - If colors changed

  For Complex Interactions:

  1. State screenshots - Idle, hover, active, disabled
  2. Flow diagram - User journey
  3. Written specifications - Timing, easing, conditions

  Pro Tips

  1. Export Multiple Frames at Once

  File > Export >
  - Select all frames
  - PNG @ 2x
  - Export

  2. Use Figma's Inspection Panel

  - Select element → Dev Mode → Copy as CSS
  - This gives me exact values

  3. Include Edge Cases

  Show me:
  - Empty states
  - Error states
  - Loading states
  - Mobile/tablet/desktop breakpoints

  4. Organize Exports

  designs/
    playground/
      01-overall-layout.png
      02-code-tabs.png
      03-response-viewer.png
      04-mobile-view.png
      specs.txt

  5. Add Context in File Names

  ✅ api-playground-desktop-idle-state.png
  ✅ button-hover-state-dark-mode.png
  ❌ screen-shot-1.png
  ❌ image.png

  Quick Workflow Example

  You:
  I want to implement the API playground. Here are the designs:
  - /designs/playground/desktop.png
  - /designs/playground/mobile.png

  Key specs from Figma Dev Mode:
  - Main container: max-width 768px, padding 24px
  - Code block: bg #1E293B, border-radius 8px
  - Tab active state: border-bottom 2px solid #3B82F6
  - Response viewer: bg #F8FAFC, min-height 200px

  Me:
  [Reads images]
  I can see the layout. I'll implement:
  1. Main playground container with specs
  2. Tabbed code interface
  3. Response viewer with syntax highlighting
  ...

  What Works Best for Me

  The sweet spot is:
  1. 📸 High-quality screenshots of the design
  2. 📝 Key measurements from Dev Mode
  3. 🎨 Color values and font specs
  4. ⚡ Interaction notes (animations, states)

  This combination gives me both the visual understanding AND the precise implementation details I need to build it accurately!