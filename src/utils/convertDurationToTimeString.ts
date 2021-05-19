export function convertDurationToTimeString(duration:number){
  const hours = Math.floor(duration/3600); //3600secs = 60secs*60 = 1 hour
  const minutes =Math.floor((duration % 3600)/60);
  const seconds = duration % 60;

  const timeString =[hours, minutes, seconds]
  .map(unit => String(unit).padStart(2,'0'))//deixa sempre com 0 na frente, tipo 02 horas
  .join(':')// une o array com ':'

  return timeString
}