/* ==========================================================================
   AIOU Coaching — tools.js
   One list, used by index.html and by the "All Tools" section of the studio.
   Add a new tool once here and it appears in both places.

   "file" is relative to the tools/ folder; js/hub.js applies the page prefix.
   Exposes: window.AIOU.tools
   ========================================================================== */
(function (w) {
  'use strict';

  var GROUPS = [
    { id: 'all', label: 'All Tools' },
    { id: 'ai', label: 'AI Tools (DeepSeek)' },
    { id: 'paper', label: 'Guess Papers' },
    { id: 'form', label: 'Forms' },
    { id: 'cover', label: 'Cover Pages' },
    { id: 'doc', label: 'Files & Downloads' },
    { id: 'site', label: 'Pages' }
  ];

  var LIST = [
    {
      id: 'studio', icon: '🤖', group: 'ai', name: 'Multi-ID AI Studio',
      file: 'studio.html', badges: ['DeepSeek', 'Multiple IDs', 'Compare'],
      desc: 'Ek sawal kai Worker IDs ko bhejein, sab ke jawab sath dekhein, best jawab chunein aur Word file banayein.'
    },
    {
      id: 'humanizer', icon: '✍️', group: 'ai', name: 'AI Text Humanizer',
      file: 'humanizer.html', badges: ['DeepSeek', 'Rewrite'],
      desc: 'Paste ki hui text ko natural, insani andaaz me dobara likhein — academic ya casual tone me.'
    },
    {
      id: 'diagram', icon: '🎨', group: 'ai', name: 'AI Diagram Generator',
      file: 'diagram-generator.html', badges: ['DeepSeek', 'Mermaid', 'PNG'],
      desc: 'Chhota sa topic likhein aur flowchart ya diagram bana kar download karein.'
    },
    {
      id: 'writer', icon: '📝', group: 'ai', name: 'AI Assignment Writer',
      file: 'assignment-writer.html', badges: ['DeepSeek', 'Draft'],
      desc: 'Assignment ke sawal paste karein, poora draft (title page + references) generate karein.'
    },
    {
      id: 'generator', icon: '🗂️', group: 'ai', name: 'Blog Post Generator',
      file: 'generator.html', badges: ['DeepSeek', 'JSON-LD', 'SEO'],
      desc: 'Blogger post ka draft, meta tags aur schema markup ek sath likhne wala tool.'
    },
    {
      id: 'guess-paper', icon: '📄', group: 'paper', name: 'Guess Paper Generator',
      file: 'guess-paper.html', badges: ['PDF', 'Word', 'JPG', 'PNG'],
      desc: 'Urdu ya English guess paper banayein, logo aur watermark lagayein, multi-page export karein.'
    },
    {
      id: 'bs-bba', icon: '✅', group: 'paper', name: 'BS & BBA Guess Paper',
      file: 'bs-bba-guess-paper.html', badges: ['MCQ', 'PDF', 'Word', 'SVG'],
      desc: 'Part I MCQs, Part II aur Part III subjective sawalon ka tayyar paper.'
    },
    {
      id: 'cover-page', icon: '📕', group: 'cover', name: 'Assignment Cover Page',
      file: 'assignment-cover-page.html', badges: ['19 templates', 'PDF', 'JPG'],
      desc: 'Programme, course aur student details ke saath khoobsurat cover page, random design bhi.'
    },
    {
      id: 'cover-sheet', icon: '📋', group: 'cover', name: 'Assignment Cover Sheet',
      file: 'assignment-cover-sheet.html', badges: ['Simple', 'Print'],
      desc: 'Sada aur saaf cover sheet — sirf zaroori maloomat, ek click me print.'
    },
    {
      id: 'front-page', icon: '🖼️', group: 'cover', name: 'AIOU Front Page',
      file: 'front-page.html', badges: ['A4', 'PDF'],
      desc: 'A4 style assignment front page, ready to print ya PDF me save karne ke liye.'
    },
    {
      id: 'bulk', icon: '📦', group: 'doc', name: 'Bulk Word / ZIP Downloader',
      file: 'bulk-downloader.html', badges: ['Word', 'ZIP'],
      desc: 'Kai students ke assignments ek sath Word files me banayein aur ZIP me download karein.'
    },
    {
      id: 'tools-page', icon: '🧰', group: 'site', name: 'Tools Page Markup',
      file: 'tools.html', badges: ['Blogger widget'],
      desc: 'Blogger tools page ka HTML — filter chips, cards aur FAQ schema ke saath.'
    },
    {
      id: 'home', icon: '🏠', group: 'site', name: 'Blogger Homepage Markup',
      file: '../theme/home.html', badges: ['Blogger'],
      desc: 'Blog ka homepage section markup (theme/home.html).'
    }
  ];

  w.AIOU = w.AIOU || {};
  w.AIOU.tools = { groups: GROUPS, list: LIST };
})(window);
