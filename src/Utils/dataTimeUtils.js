export const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  export const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };
  
 export const formatNormalDate = (normaldate) => {
    const day = String(normaldate.getDate()).padStart(2, '0');
    const month = String(normaldate.getMonth() + 1).padStart(2, '0');
    const year = normaldate.getFullYear();
    return `${year}${month}${day}`; 
};

export const formatNormalTime = (normaldate) => {
    const hours = String(normaldate.getHours()).padStart(2, '0');
    const minutes = String(normaldate.getMinutes()).padStart(2, '0');
    const seconds = String(normaldate.getSeconds()).padStart(2, '0');
    return `${hours}${minutes}${seconds}`; 
};