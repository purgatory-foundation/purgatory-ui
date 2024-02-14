export const timeLeft = (deadline) => {
    const t = deadline;
    if(t <= 0) return null;
    const formated = {
        days: Math.floor(t / (60 * 60 * 24)),
        hours: Math.floor((t%(60 * 60 * 24))/(60 * 60)),
        minutes: Math.floor((t % (60 * 60)) / 60),
        seconds: Math.floor(t % 60)
    }
    return (formated.days > 0 ? formated.days + "d " : "") + 
    (formated.hours > 0 ? formated.hours + "h " : "") + 
    (formated.minutes > 0 ? formated.minutes + "m ": "") + 
    (formated.seconds > 0 ? formated.seconds + "s ": "");   
}
