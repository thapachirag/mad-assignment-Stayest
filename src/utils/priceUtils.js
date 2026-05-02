import { getNumberOfNights } from "./dateUtils";

export function calculateBookingPrice({
  nightlyRate,
  cleaningFee,
  checkInDate,
  checkOutDate,
}) {
  const nights = getNumberOfNights(checkInDate, checkOutDate);
  const nightlyTotal = Number(nightlyRate) * nights;
  const totalPrice = nightlyTotal + Number(cleaningFee);

  return {
    nights,
    nightlyTotal,
    cleaningFee: Number(cleaningFee),
    totalPrice,
  };
}
