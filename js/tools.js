/* AIOU Coaching — central tool registry */
(function (w) {
  'use strict';
  var GROUPS = [
    { id:'all',label:'All Tools' },{ id:'ai',label:'AI Tools' },{ id:'academic',label:'Capstone / Internship / Thesis' },
    { id:'paper',label:'Guess Papers' },{ id:'cover',label:'Cover Pages' },{ id:'files',label:'Image / PDF / Downloads' },{ id:'site',label:'Pages' }
  ];
  var LIST = [
    {id:'studio',icon:'🤖',group:'ai',name:'Multi-ID AI Studio',file:'studio.html',badges:['DeepSeek','Multiple IDs','Compare'],desc:'Ek prompt kai Worker IDs ko bhejein, jawab compare karein aur Word draft banayein.'},
    {id:'humanizer',icon:'✍️',group:'ai',name:'AI Text Humanizer',file:'humanizer.html',badges:['Rewrite'],desc:'Apne draft ko natural aur clear banane ke liye rewriting help.'},
    {id:'diagram',icon:'🎨',group:'ai',name:'AI Diagram Generator',file:'diagram-generator.html',badges:['Mermaid','PNG'],desc:'Topic se flowchart/diagram generate karein.'},
    {id:'writer',icon:'📝',group:'ai',name:'AI Assignment Writer',file:'assignment-writer.html',badges:['Draft','Word'],desc:'Assignment structure aur draft assistance.'},
    {id:'report-builder',icon:'📚',group:'academic',name:'AIOU Capstone / Internship / Thesis Builder',file:'report-builder.html',badges:['AI','Word','PDF'],desc:'Quick section-based report builder.'},
    {id:'academic-report',icon:'🎓',group:'academic',name:'Complete Academic Report Generator',file:'academic-report-generator.html',badges:['Capstone','Internship','Thesis','Word','PDF'],desc:'Complete workspace: setup, structure, chapters, AI assistance and final document export.'},
    {id:'report-engine',icon:'🏛️',group:'academic',name:'AIOU Policy-Aware Complete Report Engine',file:'aiou-report-engine.html',badges:['Programme','Capstone','Internship','Thesis','Word','PDF'],desc:'Programme profile → report type → topic → student details → complete document sections → Word/PDF.'},
    {id:'guess-paper',icon:'📄',group:'paper',name:'Guess Paper Generator',file:'guess-paper.html',badges:['PDF','Word','JPG','PNG'],desc:'Revision ke liye guess papers banayein.'},
    {id:'bs-bba',icon:'✅',group:'paper',name:'BS & BBA Guess Paper',file:'bs-bba-guess-paper.html',badges:['MCQ','PDF','Word'],desc:'MCQs aur subjective paper builder.'},
    {id:'cover-page',icon:'📕',group:'cover',name:'Assignment Cover Page',file:'assignment-cover-page.html',badges:['Templates','PDF','JPG'],desc:'Assignment cover designs.'},
    {id:'cover-sheet',icon:'📋',group:'cover',name:'Assignment Cover Sheet',file:'assignment-cover-sheet.html',badges:['Print'],desc:'Simple printable cover sheet.'},
    {id:'front-page',icon:'🖼️',group:'cover',name:'AIOU Front Page',file:'front-page.html',badges:['A4','PDF'],desc:'A4 assignment front page.'},
    {id:'image-tools',icon:'🖼️',group:'files',name:'Image Tools',file:'image-tools.html',badges:['JPG','PNG','WebP','Compress'],desc:'Image convert, resize, compress aur download — browser-side.'},
    {id:'pdf-tools',icon:'📑',group:'files',name:'PDF Tools',file:'pdf-tools.html',badges:['Images→PDF','Text→Word'],desc:'Images to PDF aur selectable PDF text extraction to Word.'},
    {id:'bulk',icon:'📦',group:'files',name:'Bulk Word / ZIP Downloader',file:'bulk-downloader.html',badges:['Word','ZIP'],desc:'Multiple generated documents ko bulk download karein.'},
    {id:'tools-page',icon:'🧰',group:'site',name:'All Tools Page',file:'tools.html',badges:['Blogger'],desc:'Complete searchable/filterable tool hub.'},
    {id:'aiou-tool-kit',icon:'🎒',group:'site',name:'AIOU Tool Kit — Blogger Page Body',file:'../pages/aiou-tool-kit.html',badges:['Blogger','Schema'],desc:'Blogger page me paste/use karne wala tool kit markup.'},
    {id:'home',icon:'🏠',group:'site',name:'Blogger Homepage Markup',file:'../theme/home.html',badges:['Blogger'],desc:'Homepage section markup.'}
  ];
  w.AIOU=w.AIOU||{};w.AIOU.tools={groups:GROUPS,list:LIST};
})(window);
