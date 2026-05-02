export function parseDate(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

export function getNumberOfNights(checkInDate, checkOutDate) {
  const start = parseDate(checkInDate);
  const end = parseDate(checkOutDate);

  const differenceInMs = end.getTime() - start.getTime();
  return Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));
}

export function isValidDateRange(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    return false;
  }

  return parseDate(checkOutDate) > parseDate(checkInDate);
}

export function doDateRangesOverlap(startA, endA, startB, endB) {
  const aStart = parseDate(startA);
  const aEnd = parseDate(endA);
  const bStart = parseDate(startB);
  const bEnd = parseDate(endB);

  return aStart < bEnd && bStart < aEnd;
}

export function getCheckInIndicator(checkInDate, checkOutDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkIn = parseDate(checkInDate);
  const checkOut = parseDate(checkOutDate);

  const daysToCheckIn = Math.ceil(
    (checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const daysToCheckOut = Math.ceil(
    (checkOut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysToCheckIn > 0) {
    return `Check-in in ${daysToCheckIn} day(s)`;
  }

  if (daysToCheckIn === 0) {
    return "Check-in is today";
  }

  if (daysToCheckOut > 0) {
    return `Stay in progress. Check-out in ${daysToCheckOut} day(s)`;
  }

  return "Stay period has ended";
}
