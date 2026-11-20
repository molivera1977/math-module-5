/* ═══════════════════════════════════════════════════════
   MATH MODULE 5 · THE LESSON VIDEOS (Marcos 11/19: "Yes, after the site works"; since 11/19 every new math site
   has them — MM4's way, 11/13: "lesson reminders and or hints" · "tools that serve a real purpose").
   11 short animated videos in Ava's voice (videos/chNN/, made with Papermorph in math-module-5-videos/), one per
   kind of question, drawn the way HIS Module 5 lessons wrote it (his board notes, Notebook pages, last year's Test
   Review for the base-ten blocks). Each works the SAME KIND of problem with OTHER numbers (tools/check_videos.js:
   none is a question on this site, a real test item or a lesson-sheet problem), then shows the mistake kids make.
   Where they are (his picks 11/13, kept for every module):
     · Warm-Up: each 👀 Watch card IS the video (watched to the end before the steps).
     · Practice: 🎬 Show me beside every hint, and 🎬 Watch how after a wrong answer. Never on their own.
═══════════════════════════════════════════════════════ */
window.MM4_VIDEOS = {
  version: '4b609362',     // goes on every video address: a new number when a video changes (Cloudflare keeps files 4 h)
  titles: {
    1: 'Base-ten blocks', 2: 'Area model: the equation', 3: 'Area model: the boxes', 4: 'Expanded form',
    5: 'Multiply by parts', 6: 'Partial products', 7: 'The short way', 8: 'The short way: big numbers',
    9: 'One group first', 10: 'Add two products', 11: 'How many are left?',
  },
  // the Warm-Up's 👀 Watch cards, by their title (the same in every version)
  watch: {
    'Base-ten blocks': 1, 'Area models': 2, 'Expanded form': 4, 'Partial products': 6, 'The short way': 8,
    'Two-step problems': 9,
  },
  // each of the 15 spots (the same kind of question at the same spot on every part) → its video
  spot: { 1: 2, 2: 7, 3: 8, 4: 8, 5: 4, 6: 9, 7: 3, 8: 5, 9: 6, 10: 1, 11: 1, 12: 10, 13: 9, 14: 11, 15: 11 },
};
