const RAW_SKILLS = `# Skill Loader Laucn {$version 1.0.1 beta}

## Global Rules

This file defines how to use the skills listed below.
if the user called '$initiation' ; reply with : 'installed successfully (state current version of the skills stated in between {$version} in the header of this md file), command list : (list all command available for the user with briefs for each one)' , and read the rest of this and [[webH]](https://github.com/UCursor/msitte/blob/main/Skills/webh.md).

Whenever a task matches one of these skills and the user confirms that:

1. Open the skill's GitHub source.
2. Read its \`Skill.md\` completely.
3. Also read any referenced files required by the skill, such as:

   * \`references/\`
   * \`scripts/\`
   * \`assets/\`
4. Treat the skill instructions as active task-specific instructions for the current task.
5. Do not merely summarize the skill. Apply its workflow.
6. Re-read the relevant skill source before executing a new task involving that skill.
7. If the skill conflicts with a higher-priority system, platform, safety, or tool instruction, follow the higher-priority instruction.
8. Do not claim a skill was loaded if the GitHub source could not actually be accessed.

## Skill Registry

### /webH

Purpose:
Humanize AI-generated websites and reduce obvious AI-design patterns.

Source:
[[webH]](https://github.com/UCursor/msitte/blob/main/Skills/webh.md)

Activation:
Use when the task involves designing, reviewing, improving, or generating a website/UI and the goal is to make the result feel more human-designed and less AI-generated.

Behavior:
Follow the complete workflow and design rules defined by the linked skill source.

## Verification

After loading this file, reply with:

* The skills detected in this registry
* The source URL for each skill
* Whether each source was successfully read

Do not apply a skill until its source has been successfully read.

---

# WEBSITE DESIGN GUIDELINES (webh.md)

## IMPORTANT: FOLLOW THESE RULES AT ALL TIMES

Ensure that you follow every rule below after finishing the project, and after finishing every task. Review every single rule before considering the task complete.

---

# 1. IMPORTANT NOTICES AND REQUIREMENTS

### Clarification

* Ask the user clarifying questions when important information is missing or ambiguous.
* Ask for clarification about:
  * Services
  * Preferences
  * Expectations
  * Additional requests
* Suggest better actions or alternatives when necessary.

### Images

* Avoid keeping the website completely without images.
* When no images are provided, use empty HTML <img> placeholders for the owner to fill in later.
* Image placeholders must be filled in the code itself, not through an upload button or upload UI inside the website.
* Never use stock images unless the user explicitly asks for them.
* For logos, stock imagery, artistic choices, visual styles, or additions, ask the user for their preferred images or provide an option to use default stock images.

---

# 2. ICONS, SYMBOLS, AND LOGOS

* Never use Unicode symbols, decorative symbols, or text characters as icons anywhere on the website.
* Never use Unicode symbols as logos.
* Never use em-dashes.
* Never use decorative dots or sparkle icons.
* Never make logos from typography, Unicode characters, or generic icons.
* For logos, ask the owner to upload their preferred logo image.
* Never use Lucide Icons or similar low-contrast icon libraries.
* Use proper graphical assets or suitable high-contrast icons instead of text characters.

---

# 3. COLORS

* Avoid excessive use of electric neon accents, especially:
  * Hyper-saturated neon lime such as #22c55e
  * Electric cyan such as #06b6d4
  * Magenta used to create a generic "futuristic" aesthetic
* Avoid excessive reliance on gradients.
* Avoid:
  * Purple-blue-indigo gradients
  * Yellow-orange gradients
  * Other gradients made primarily from two similar colors
* Avoid full gradient-masked text.
* Partially gradient text is still discouraged, but may be used when genuinely necessary.
* Avoid colors such as #0b1020 for backgrounds or text.
* Prefer solid colors:
  * Pure black
  * Shades of white
  * Carefully selected secondary colors
  * Subtle tint colors
* Use a deliberate, coherent color palette rather than relying on effects to create visual interest.

---

# 4. TYPOGRAPHY AND GENERAL STYLING

### Typography

* Do not make typography excessively spaced out.
* Do not use overly thin or lightweight typography.

### General Styling

* Do not overuse outlines on cards, sections, buttons, or other interface elements.
* Do not use background morphism.
* Avoid unnecessary blur effects.

---

# 5. WORDING AND TEXTUAL INDICATORS

* Do not use overly sloganized wording beneath inputs or throughout interface sections.
* Do not repeat sloganized or meaningless text merely to fill space.
* Keep meaningful slogans mainly within the main hero and important highlights.
* Do not repeatedly use meaningless status-style text or badges.
* Do not use normal statistics or pill-shaped badges simply to make a section appear more detailed.
* Never use fake or meaningless statistics underneath the main hero section.
* The main hero should primarily contain meaningful hero text and relevant sidekick information.

---

# 6. LAYOUT

* Do not overuse card elements.
* Avoid repetitive three-column card decks.
* Avoid rigid bilateral symmetry.
* Avoid applying identical vertical padding to every section or block.
* Avoid overly repetitive layouts that make every section feel structurally identical.
* Do not overuse outlines on elements.

---

# 7. NAVIGATION

* Do not use a heavy opaque navigation bar.
* Avoid giving the top bar/navbar its own heavy background.
* Avoid backdrop blur on the navbar.
* Avoid making the navbar unnecessarily sticky to the top.
* Prefer simple textual navigation and clear action-oriented icons when appropriate.

---

# 8. OTHER MISCELLANEOUS AESTHETICS

### Shadows

* Occasionally use shadows and box shadows where they improve hierarchy or depth.
* Do not apply shadows everywhere unnecessarily.

### Reviews and Statistics

* Reviews and statistics are discouraged.
* When they are necessary, they must be placeholders and the owner should be asked to provide the real information.
* Never create fake reviews or fake statistics.

### Cursor Effects

* Never use a cursor spotlight or cursor glow effect.
* Do not add JavaScript mouse-move listeners that drag a glowing radial gradient or spotlight behind the cursor.

### Background Effects

* Never use glow blobs in the background as visual highlights.

---

# FINAL QUALITY CHECK

Before finishing every task and before declaring the project complete:
* Review every rule in this document.
* Make sure every rule has been followed.
* Remove anything that violates these guidelines.
* Check that no fake reviews, fake statistics, meaningless badges, Unicode icons, forbidden gradients, excessive blur, excessive outlines, glow blobs, cursor spotlight effects, or heavy navbar treatments were accidentally introduced.
* Make sure images are handled according to the image-placeholder rules.
* Confirm that the final design feels intentional, human-designed, and not like generic AI-generated website UI.`;

export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);
    const accept = request.headers.get('accept') || '';
    const userAgent = (request.headers.get('user-agent') || '').toLowerCase();

    const isRawParam = url.searchParams.get('raw') === 'true' || 
                       url.searchParams.get('format') === 'raw' || 
                       url.searchParams.get('format') === 'txt' || 
                       url.searchParams.get('format') === 'markdown';

    const isAiAgent = userAgent.includes('curl') || 
                      userAgent.includes('wget') || 
                      userAgent.includes('python') || 
                      userAgent.includes('claude') || 
                      userAgent.includes('cursor') || 
                      userAgent.includes('openai') || 
                      userAgent.includes('anthropic') || 
                      userAgent.includes('gptbot') || 
                      userAgent.includes('chatgpt') || 
                      userAgent.includes('perplexity') || 
                      userAgent.includes('llm') || 
                      accept.includes('text/markdown') || 
                      accept.includes('text/plain');

    if (isRawParam || (isAiAgent && !accept.includes('text/html'))) {
        return new Response(RAW_SKILLS, {
            status: 200,
            headers: {
                'content-type': 'text/markdown; charset=utf-8',
                'cache-control': 'public, max-age=1800',
                'access-control-allow-origin': '*',
                'x-robots-tag': 'all'
            }
        });
    }

    return next();
}

