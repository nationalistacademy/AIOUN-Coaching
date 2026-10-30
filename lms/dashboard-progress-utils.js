(function(){
  'use strict';
  function activeCourseIds(enrollments){
    return new Set((enrollments||[]).filter(row=>String(row.status||'').toLowerCase()==='active'&&row.course_id).map(row=>row.course_id));
  }
  window.AIOUDashboardUtils={activeCourseIds};
})();
