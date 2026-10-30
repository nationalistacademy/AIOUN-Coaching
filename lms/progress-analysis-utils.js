(function(){
  'use strict';
  function accuracy(attempt,maxByQuiz){
    const stored=attempt.percentage===null||attempt.percentage===undefined?NaN:Number(attempt.percentage);
    if(Number.isFinite(stored))return Math.max(0,Math.min(100,stored));
    const max=attempt.max_score!==null&&attempt.max_score!==undefined?Number(attempt.max_score):maxByQuiz.get(attempt.quiz_id);
    const score=Number(attempt.score);
    return Number.isFinite(score)&&Number.isFinite(Number(max))&&Number(max)>0?Math.max(0,Math.min(100,score/Number(max)*100)):null;
  }
  function summarizeAttempts(attempts,maxByQuiz){
    const graded=(attempts||[]).filter(a=>a.score!==null&&a.score!==undefined&&accuracy(a,maxByQuiz)!==null);
    const values=graded.map(a=>accuracy(a,maxByQuiz));
    const byQuiz=new Map();
    for(const a of attempts||[]){if(!byQuiz.has(a.quiz_id))byQuiz.set(a.quiz_id,[]);byQuiz.get(a.quiz_id).push(a)}
    const quizzes=[...byQuiz.entries()].map(([quizId,rows])=>{
      const scored=rows.filter(a=>a.score!==null&&a.score!==undefined&&accuracy(a,maxByQuiz)!==null).sort((a,b)=>new Date(b.submitted_at||0)-new Date(a.submitted_at||0));
      const latest=scored[0]||null,previous=scored[1]||null;
      const latestAccuracy=latest?accuracy(latest,maxByQuiz):null,previousAccuracy=previous?accuracy(previous,maxByQuiz):null;
      return {quizId,title:rows[0]?.quizzes?.title||'Quiz',attemptCount:rows.length,latest,latestAccuracy,previousAccuracy,delta:latestAccuracy===null||previousAccuracy===null?null:latestAccuracy-previousAccuracy};
    }).sort((a,b)=>(a.latestAccuracy??101)-(b.latestAccuracy??101));
    return {gradedCount:graded.length,best:values.length?Math.max(...values):null,average:values.length?values.reduce((x,y)=>x+y,0)/values.length:null,quizzes};
  }
  function topicBreakdown(answers,questions,attempts){
    const topicByQuestion=new Map((questions||[]).map(q=>[q.id,String(q.topic||'').trim()]));
    const attemptById=new Map((attempts||[]).map(a=>[a.id,a]));
    const latestAttemptByQuiz=new Map();
    for(const a of attempts||[]){if(!a.quiz_id)continue;const old=latestAttemptByQuiz.get(a.quiz_id);if(!old||new Date(a.submitted_at||0)>new Date(old.submitted_at||0))latestAttemptByQuiz.set(a.quiz_id,a)}
    const all=new Map(),latest=new Map();
    function add(map,topic,correct){if(!map.has(topic))map.set(topic,{topic,correct:0,wrong:0,answered:0});const row=map.get(topic);row.answered++;if(correct===true)row.correct++;else if(correct===false)row.wrong++}
    for(const answer of answers||[]){const topic=topicByQuestion.get(answer.question_id);if(!topic)continue;add(all,topic,answer.is_correct);const attempt=attemptById.get(answer.attempt_id);if(attempt&&latestAttemptByQuiz.get(attempt.quiz_id)?.id===attempt.id)add(latest,topic,answer.is_correct)}
    const rank=map=>[...map.values()].map(row=>({...row,wrongRate:row.answered?row.wrong/row.answered:0})).sort((a,b)=>b.wrongRate-a.wrongRate||b.wrong-a.wrong);
    return {allTime:rank(all),latest:rank(latest)};
  }
  window.AIOUProgressUtils={accuracy,summarizeAttempts,topicBreakdown};
})();
