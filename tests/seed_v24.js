/* données de démonstration déterministes (classes, élèves, séances avec tous les codes, dispensés) */
module.exports=function seed(KEY,teacher){const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher=teacher;
  const N=[['ALAOUI Yassine','m'],['BENNANI Salma','f'],['CHAKIR Omar','m'],['DAOUDI Imane','f'],['EL AMRANI Hamza','m'],['FASSI Nour','f'],['GHALI Anas','m'],['HAJJI Khadija','f'],['IDRISSI Mehdi','m'],['JABRI Sara','f'],['KETTANI Ayoub','m'],['LAHLOU Hiba','f'],['محمد الإدريسي','m'],['فاطمة الزهراء','f']];
  let k=0;d.students=[];
  d.classes.slice(0,2).forEach((c,ci)=>{N.forEach((n,i)=>{d.students.push({id:'s'+ci+'_'+i,classId:c.id,name:n[0]+(ci?' '+(ci+1):''),sid:'J1300'+(ci*100+i+10),sex:n[1],dob:'',parent:'',phone:'',notes:'',created:1,...(i===5?{dispense:{type:'annee',since:'2026-09-14'}}:{})});});});
  const codes=[{s:'A',j:false,r:''},{s:'ST',j:false,r:''},{s:'M',j:false,r:''},{s:'L',j:false,r:''},{s:'M',j:true,r:'Certificat'},{s:'A',j:true,r:'Justifiée'}];
  d.classes.slice(0,2).forEach((c,ci)=>{for(let s=0;s<4;s++){const marks={};d.students.filter(x=>x.classId===c.id).forEach((x,i)=>{if((i*3+s*5+ci)%7===0)marks[x.id]=codes[(i+s)%6];});d.sessions[c.id+'|0|'+s]={date:'',marks};}});
  d.ui.cls=d.classes[0].id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));};
