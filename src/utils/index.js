/**
 * gives the formatted date
 * @param {*} date the date to be formatted
 * @param {*} formatted the format
 * @returns the date
 */
export function getFormattedDate(date, formatted = null) {
  let modifiedDate = new Date(date).toISOString().slice(0, 10);

  if (formatted) {
    return modifiedDate;
  }

  let monthNames = new Map([
    ['01', 'Jan'],
    ['02', 'Feb'],
    ['03', 'Mar'],
    ['04', 'Apr'],
    ['05', 'May'],
    ['06', 'Jun'],
    ['07', 'Jul'],
    ['08', 'Aug'],
    ['09', 'Sep'],
    ['10', 'Oct'],
    ['11', 'Nov'],
    ['12', 'Dec'],
  ]);

  return `${monthNames.get(modifiedDate.split('-')[1])} ${modifiedDate.split('-')[2]}, ${modifiedDate.split('-')[0]}`;
}

/**
 * gives the dates between the given ranges
 * @param s the start date
 * @param e the end date
 * @returns the dates in between
 */
export function getDaysArray(s, e) {
  for (var a = [], d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    a.push(getFormattedDate(d, true));
  }
  return a;
}

/**
 * makes the loader visible
 */
export function setLoader(value) {
  document.querySelector('.loader').style.display = value === true ? 'block' : 'none';
}
