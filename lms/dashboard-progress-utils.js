(function(){
  'use strict';
  function activeCourseIds(enrollments){
    return new Set((enrollments||[]).filter(row=>String(row.status||'').toLowerCase()==='active'&&String(row.course_id||'').trim()).map(row=>String(row.course_id).trim()));
  }
  window.AIOUDashboardUtils={activeCourseIds};
})();
